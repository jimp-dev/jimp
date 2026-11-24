"""Writes the reference decodes of the corpus, made with libjpeg-turbo's djpeg.

For each JPEG, references.json gets its size, channel count (1 for
greyscale, 3 for RGB), sample precision and the SHA-256 of djpeg's samples.
Images of up to MAX_PIXELS pixels also get the samples themselves, as a PNG
in references/, so a test failure can say how far off the decoder is. Larger
ones are only compared by hash, and JPEGs that decode to the same pixels share
a PNG, which keeps the fixtures small. Run by
generate.sh, with JSIMD_FORCENONE=1 set.
"""

import hashlib
import json
import os
import shutil
import struct
import subprocess
import zlib

MAX_PIXELS = 150_000


def parse_pnm(data):
    fields = []
    pos = 0
    while len(fields) < 4:
        while data[pos : pos + 1].isspace():
            pos += 1
        if data[pos : pos + 1] == b"#":
            pos = data.index(b"\n", pos)
            continue
        start = pos
        while not data[pos : pos + 1].isspace():
            pos += 1
        fields.append(data[start:pos])
    magic, width, height, maxval = fields[0], *map(int, fields[1:])
    return {
        "channels": 3 if magic == b"P6" else 1,
        "width": width,
        "height": height,
        "bytes": 2 if maxval > 255 else 1,
        "samples": data[pos + 1 :],
    }


def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def write_png(path, image):
    """A PNG with the filter of each row picked like libpng does."""
    bpp = image["channels"] * image["bytes"]
    stride = image["width"] * bpp
    samples = image["samples"]
    previous = bytes(stride)
    raw = bytearray()
    for y in range(image["height"]):
        row = samples[y * stride : (y + 1) * stride]
        candidates = []
        for kind in range(5):
            out = bytearray(stride)
            for i in range(stride):
                a = row[i - bpp] if i >= bpp else 0
                b = previous[i]
                c = previous[i - bpp] if i >= bpp else 0
                predictor = (0, a, b, (a + b) >> 1, paeth(a, b, c))[kind]
                out[i] = (row[i] - predictor) & 0xFF
            cost = sum(v if v < 128 else 256 - v for v in out)
            candidates.append((cost, kind, out))
        _, kind, out = min(candidates, key=lambda c: c[0])
        raw.append(kind)
        raw += out
        previous = row

    def chunk(kind, data):
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    color_type = 2 if image["channels"] == 3 else 0
    header = struct.pack(
        ">IIBBBBB", image["width"], image["height"], 8 * image["bytes"], color_type, 0, 0, 0
    )
    with open(path, "wb") as file:
        file.write(b"\x89PNG\r\n\x1a\n")
        file.write(chunk(b"IHDR", header))
        file.write(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
        file.write(chunk(b"IEND", b""))


manifest = {}
pngs = {}
shutil.rmtree("references", ignore_errors=True)
jpegs = sorted(
    os.path.join(root, name)[2:]
    for root, _, names in os.walk(".")
    for name in names
    if name.endswith(".jpg") and not root.startswith("./references")
)

for name in jpegs:
    if os.path.basename(name).startswith("unsupported-"):
        continue
    result = subprocess.run(["djpeg", "-pnm", name], capture_output=True)
    if not result.stdout:
        print(f"no reference: {name}: {result.stderr.decode().strip()}")
        continue
    image = parse_pnm(result.stdout)
    entry = {
        "width": image["width"],
        "height": image["height"],
        "channels": image["channels"],
        "precision": 12 if image["bytes"] == 2 else 8,
        "sha256": hashlib.sha256(image["samples"]).hexdigest(),
    }
    if result.stderr:
        entry["djpegWarning"] = result.stderr.decode().strip()
    # 12-bit samples can't be hashed from the decoder's 8-bit output
    if image["width"] * image["height"] <= MAX_PIXELS or image["bytes"] == 2:
        path = pngs.get(entry["sha256"])
        if not path:
            path = f"references/{name[:-4]}.png"
            os.makedirs(os.path.dirname(path), exist_ok=True)
            write_png(path, image)
            pngs[entry["sha256"]] = path
        entry["png"] = path
    manifest[name] = entry

with open("references.json", "w") as file:
    json.dump(manifest, file, indent=2, sort_keys=True)
    file.write("\n")
