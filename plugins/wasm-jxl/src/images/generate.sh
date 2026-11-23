#!/bin/sh
# Regenerates the fixtures with libjxl's command line tools:
#   docker run --rm -v "$PWD":/images -w /images debian:trixie-slim sh generate.sh
set -e

if [ ! -x /usr/bin/cjxl ]; then
  apt-get update -qq
  apt-get install -y -qq libjxl-tools python3-pil python3-numpy >/dev/null
fi

mkdir -p /tmp/sources

python3 - <<'EOF'
import numpy as np
from PIL import Image

w, h = 23, 17
y, x = np.mgrid[0:h, 0:w]

rgb = np.stack([x * 11, y * 15, (x * y) % 256], axis=-1).astype(np.uint8)
Image.fromarray(rgb, "RGB").save("rgb.png")
rgba = np.dstack([rgb, (x + y) * 6]).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save("rgba.png")
Image.fromarray(((x * 7 + y * 5) % 256).astype(np.uint8), "L").save("grey.png")

# Every sample is a different 16-bit value, so scaling is checked end to end
rgb16 = np.stack([x * 2909, y * 4093, (x * y * 397) % 65536], axis=-1)
with open("/tmp/sources/rgb16.ppm", "wb") as f:
    f.write(f"P6\n{w} {h}\n65535\n".encode())
    f.write(rgb16.astype(">u2").tobytes())

# Two frames: rgba.png, then its colours inverted
frames = [Image.fromarray(rgba, "RGBA")]
inverted = rgba.copy()
inverted[..., :3] = 255 - inverted[..., :3]
frames.append(Image.fromarray(inverted, "RGBA"))
frames[0].save(
    "/tmp/sources/animated.png", save_all=True, append_images=frames[1:],
    duration=100, loop=0,
)

Image.fromarray(rgb, "RGB").save("jpeg.jpg", quality=90)

# 49 megapixels of one colour: a small file, but too big for the codec's
# memory to decode losslessly
Image.new("RGB", (7000, 7000), (10, 20, 30)).save("/tmp/sources/huge.png")
EOF

cjxl rgb.png rgb.jxl -d 0 --quiet
cjxl rgba.png rgba.jxl -d 0 --container=1 --quiet
cjxl grey.png grey.jxl -d 0 --quiet
cjxl /tmp/sources/rgb16.ppm rgb16.jxl -d 0 --quiet
cjxl rgb.png lossy.jxl -d 1 --quiet
cjxl /tmp/sources/animated.png animated.jxl -d 0 --quiet
# The samples of rgb.png, but in Display P3
cjxl rgb.png p3.jxl -d 0 -x color_space=RGB_D65_DCI_Per_SRG --quiet
# HDR, which the plugin rejects. The animation and alpha are header fields
# it has to read past to find the transfer function.
cjxl /tmp/sources/animated.png pq.jxl -d 0 -x color_space=RGB_D65_202_Rel_PeQ --quiet
cjxl /tmp/sources/rgb16.ppm hlg.jxl -d 0 -x color_space=RGB_D65_202_Rel_HLG --quiet
cjxl /tmp/sources/huge.png huge.jxl -d 0 -e 1 --quiet
# A JPEG, losslessly recompressed
cjxl jpeg.jpg jpeg.jxl --lossless_jpeg=1 --quiet

# Pixels libjxl decodes these to, for reference
djxl lossy.jxl lossy.png --quiet
djxl jpeg.jxl jpeg.png --quiet
