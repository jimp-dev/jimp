#!/bin/sh
# Regenerates the fixtures with OpenJPEG's command line tools:
#   docker run --rm -v "$PWD":/images -w /images debian:trixie-slim sh generate.sh
set -e

if [ ! -x /usr/bin/opj_compress ]; then
  apt-get update -qq
  apt-get install -y -qq libopenjp2-tools python3-pil python3-numpy >/dev/null
fi

mkdir -p /tmp/sources

python3 - <<'EOF'
import numpy as np
from PIL import Image

w, h = 23, 17
y, x = np.mgrid[0:h, 0:w]

rgb = np.stack([x * 11, y * 15, (x * y) % 256], axis=-1).astype(np.uint8)
Image.fromarray(rgb, "RGB").save("rgb.png")
Image.fromarray(np.dstack([rgb, (x + y) * 6]).astype(np.uint8), "RGBA").save(
    "/tmp/sources/rgba.png"
)

grey = ((x * 7 + y * 5) % 256).astype(np.uint8)
Image.fromarray(grey, "L").save("grey.png")


def pnm(path, kind, maxval, samples):
    with open(path, "wb") as f:
        f.write(f"{kind}\n{w} {h}\n{maxval}\n".encode())
        f.write(samples.astype(">u2" if maxval > 255 else "u1").tobytes())


# Every value of the precision appears, so scaling is checked end to end
pnm("/tmp/sources/grey16.pgm", "P5", 65535, (x * 2909 + y * 4093) % 65536)
pnm("/tmp/sources/rgb12.ppm", "P6", 4095, np.stack([x * 178, y * 255, (x * y * 11) % 4096], axis=-1))
# OpenJPEG's raw input takes the bit depth as is: one byte per sample up to
# 8 bits, then two big-endian bytes
(((x + y) % 16).astype(np.uint8)).tofile("/tmp/sources/grey4.raw")
# Signed 12-bit samples, -2048 to 2047
((x * 181 + y * 241) % 4096 - 2048).astype(">i2").tofile("/tmp/sources/signed12.raw")

# Y, Cb and Cr with the chroma subsampled 2x2 (4:2:0). OpenJPEG's raw
# reader needs dimensions that divide by the subsampling.
yw, yh = 24, 16
cw, ch = yw // 2, yh // 2
yy, yx = np.mgrid[0:yh, 0:yw]
cy, cx = np.mgrid[0:ch, 0:cw]
planes = [
    ((yx * 9 + yy * 4) % 220 + 16).astype(np.uint8),
    (128 + (cx - cw // 2) * 8).astype(np.uint8),
    (128 + (cy - ch // 2) * 10).astype(np.uint8),
]
with open("/tmp/sources/ycc420.raw", "wb") as f:
    for plane in planes:
        f.write(plane.tobytes())
EOF

opj_compress -i rgb.png -o rgb.jp2 -n 3 >/dev/null
opj_compress -i rgb.png -o rgb.j2k -n 3 >/dev/null
opj_compress -i rgb.png -o rgb-lossy.jp2 -n 3 -r 4 -I >/dev/null
opj_compress -i grey.png -o grey.jp2 -n 3 >/dev/null
opj_compress -i /tmp/sources/rgba.png -o rgba.jp2 -n 3 >/dev/null
opj_compress -i /tmp/sources/grey16.pgm -o grey16.jp2 -n 3 >/dev/null
opj_compress -i /tmp/sources/rgb12.ppm -o rgb12.jp2 -n 3 >/dev/null
opj_compress -i /tmp/sources/grey4.raw -o grey4.jp2 -n 3 -F 23,17,1,4,u >/dev/null
opj_compress -i /tmp/sources/signed12.raw -o signed12.j2k -n 3 -F 23,17,1,12,s >/dev/null
opj_compress -i /tmp/sources/ycc420.raw -o ycc420.j2k -n 3 -mct 0 \
  -F 24,16,3,8,u@1x1:2x2:2x2 >/dev/null

# Pixels OpenJPEG decodes these to, for reference
opj_decompress -i rgb-lossy.jp2 -o rgb-lossy.png >/dev/null
opj_decompress -i ycc420.j2k -o ycc420.png >/dev/null
