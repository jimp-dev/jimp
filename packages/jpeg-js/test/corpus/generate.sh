#!/usr/bin/env bash
# Regenerates the conformance corpus: the generated JPEGs in generated/ and
# the reference decodes in references/ for every JPEG in the corpus.
#
# Needs libjpeg-turbo's cjpeg and djpeg (`brew install jpeg-turbo`) and
# ImageMagick (`magick`). CI doesn't run this: its output is committed.
#
# References are djpeg's output with SIMD disabled (JSIMD_FORCENONE), using
# libjpeg's default islow IDCT and fancy upsampling. djpeg writes PPM (or PGM
# for greyscale), converting CMYK to RGB. See references.py for how they're
# stored.
set -euo pipefail

cd "$(dirname "$0")"

djpeg -version 2>&1 | head -1
export JSIMD_FORCENONE=1

source=sources/testorig.ppm
out=generated
rm -rf "$out"
mkdir -p "$out"

crop() {
  local size=$1
  magick "$source" -crop "${size}+40+30" +repage -depth 8 "ppm:/tmp/corpus-$size.ppm"
  echo "/tmp/corpus-$size.ppm"
}

jpeg() {
  local name=$1 input=$2
  shift 2
  cjpeg "$@" -outfile "$out/$name.jpg" "$input"
}

# Chroma subsampling, baseline and progressive
for mode in baseline progressive; do
  flag=""
  [[ $mode == progressive ]] && flag=-progressive
  prefix=${mode:0:1}
  jpeg "$prefix-444" "$source" $flag -sample 1x1
  jpeg "$prefix-422" "$source" $flag -sample 2x1
  jpeg "$prefix-420" "$source" $flag -sample 2x2
  jpeg "$prefix-440" "$source" $flag -sample 1x2
  jpeg "$prefix-411" "$source" $flag -sample 4x1
  jpeg "$prefix-410" "$source" $flag -sample 4x2
  jpeg "$prefix-311" "$source" $flag -sample 3x1
  # Each chroma component sampled differently
  jpeg "$prefix-mixed" "$source" $flag -sample 2x2,1x2,2x1
  jpeg "$prefix-grey" "$source" $flag -grayscale
  jpeg "$prefix-rgb" "$source" $flag -rgb
  jpeg "$prefix-restart1" "$source" $flag -restart 1
  jpeg "$prefix-restart7b" "$source" $flag -restart 7B
  jpeg "$prefix-12bit" "$source" $flag -precision 12
  jpeg "$prefix-12bit-444" "$source" $flag -precision 12 -sample 1x1
  jpeg "$prefix-12bit-grey" "$source" $flag -precision 12 -grayscale
done

# Baseline only
jpeg b-optimize "$source" -optimize
jpeg b-q100 "$source" -quality 100
jpeg b-q5 "$source" -quality 5
# Quantization tables over 255 need 16-bit DQT entries (SOF1)
jpeg b-16bit-dqt "$source" -quality 1
# Non-interleaved: one scan per component in a sequential JPEG
printf '0;\n1;\n2;\n' > /tmp/corpus-scans.txt
jpeg b-non-interleaved "$source" -scans /tmp/corpus-scans.txt
jpeg b-non-interleaved-restart "$source" -scans /tmp/corpus-scans.txt -restart 5B
# Progressive with a restart interval that ends part-way through a row
jpeg p-420-restart7b-small "$(crop 37x29)" -progressive -restart 7B

# Sizes that don't fill whole blocks or MCUs, down to the special cases of
# upsampling 1 or 2 samples wide
for size in 1x1 2x2 3x3 4x4 5x3 7x9 8x8 9x9 15x17 16x16 17x17 33x7 7x33; do
  input=$(crop "$size")
  jpeg "b-420-$size" "$input" -sample 2x2
  jpeg "b-422-$size" "$input" -sample 2x1
  jpeg "b-440-$size" "$input" -sample 1x2
  jpeg "p-420-$size" "$input" -progressive -sample 2x2
done

# YCCK (Adobe transform 2), as ImageMagick writes CMYK
magick "$source" -colorspace CMYK -quality 85 "$out/ycck.jpg"
magick "$source" -colorspace CMYK -quality 85 -sampling-factor 2x2,1x1,1x1,1x1 "$out/ycck-420.jpg"
magick "$source" -colorspace CMYK -quality 85 -interlace JPEG "$out/ycck-progressive.jpg"

# Progressive JPEGs cut off after a scan, as when a download stops, which
# leave coefficients unrefined
python3 - <<'PY'
data = open("generated/p-420.jpg", "rb").read()
for scans, name in ((1, "dc-only"), (4, "incomplete")):
    end = -1
    for _ in range(scans + 1):
        end = data.index(b"\xff\xda", end + 1)
    open(f"generated/p-420-{name}.jpg", "wb").write(data[:end])
PY

# Arithmetic coding
jpeg a-420 "$source" -arithmetic
jpeg a-444 "$source" -arithmetic -sample 1x1
jpeg a-grey "$source" -arithmetic -grayscale
jpeg a-restart3b "$source" -arithmetic -restart 3B
jpeg a-12bit "$source" -arithmetic -precision 12
jpeg a-progressive "$source" -arithmetic -progressive
jpeg a-progressive-restart5b "$source" -arithmetic -progressive -restart 5B
jpeg a-progressive-grey "$source" -arithmetic -progressive -grayscale
jpeg a-420-17x17 "$(crop 17x17)" -arithmetic

# An unsupported process, which must be rejected with a clear error
jpeg unsupported-lossless "$source" -lossless 1

# References for every decodable JPEG of the corpus
python3 references.py

du -sh .
