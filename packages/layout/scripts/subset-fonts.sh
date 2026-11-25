#!/bin/sh
# Generates the small font subsets in fixtures/ that the tests and the docs
# examples lay out text with.
# Needs curl, unzip and uv (https://docs.astral.sh/uv/), which runs fonttools.
#
# Inter is under the SIL Open Font License 1.1 with no Reserved Font Name, so
# its subsets can keep their names. The licence is copied too.
set -eu

cd "$(dirname "$0")/.."

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

FONTTOOLS="uvx --from fonttools[woff]==4.68.0 fonttools"
# Printable ASCII and the ellipsis. Anything else is drawn with .notdef.
UNICODES="U+0020-007E,U+2026"
SUBSET_OPTIONS="--unicodes=$UNICODES --layout-features=kern,liga --notdef-outline --no-hinting --name-IDs=0,1,2,3,4,5,6 --drop-tables+=FFTM,STAT"

curl -sSfL -o "$TMP/Inter.zip" https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip
unzip -q -j "$TMP/Inter.zip" extras/otf/Inter-Regular.otf extras/otf/Inter-Bold.otf LICENSE.txt -d "$TMP"
cp "$TMP/LICENSE.txt" fixtures/Inter-OFL.txt

for weight in Regular Bold; do
  $FONTTOOLS subset "$TMP/Inter-$weight.otf" $SUBSET_OPTIONS --output-file="fixtures/Inter-$weight.otf"
done
