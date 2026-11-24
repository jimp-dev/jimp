#!/bin/sh
# Generates the small font subsets in fixtures/ that the tests draw with.
# Needs curl, unzip and uv (https://docs.astral.sh/uv/), which runs fonttools.
#
# Both fonts are under the SIL Open Font License 1.1 with no Reserved Font
# Name, so their subsets can keep their names. The licences are copied too.
set -eu

cd "$(dirname "$0")/.."

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

FONTTOOLS="uvx --from fonttools[woff]==4.68.0 fonttools"
# Printable ASCII. Anything else is drawn with .notdef, which the tests use.
UNICODES="U+0020-007E"
SUBSET_OPTIONS="--unicodes=$UNICODES --layout-features=kern,liga --notdef-outline --no-hinting --name-IDs=0,1,2,3,4,5,6 --drop-tables+=FFTM,STAT"

# Open Sans (TrueType outlines, with an fi ligature but no kerning), the font
# jimp's bitmap fonts were made from. Upstream is a variable font, so pin it
# to Regular first.
OPEN_SANS=https://github.com/google/fonts/raw/06bfe0d62a98375cb09c942fa18e68bd32cff057/ofl/opensans
curl -sSfL -o "$TMP/OpenSans.ttf" "$OPEN_SANS/OpenSans%5Bwdth,wght%5D.ttf"
curl -sSfL -o fixtures/OpenSans-OFL.txt "$OPEN_SANS/OFL.txt"
$FONTTOOLS varLib.instancer "$TMP/OpenSans.ttf" wght=400 wdth=100 --static -q -o "$TMP/OpenSans-Regular.ttf"
$FONTTOOLS subset "$TMP/OpenSans-Regular.ttf" $SUBSET_OPTIONS --output-file=fixtures/OpenSans-Regular.ttf

# Inter (CFF outlines), as .otf and .woff. Its kerning is in GPOS extension
# lookups, which opentype.js doesn't read.
curl -sSfL -o "$TMP/Inter.zip" https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip
unzip -q -j "$TMP/Inter.zip" extras/otf/Inter-Regular.otf LICENSE.txt -d "$TMP"
cp "$TMP/LICENSE.txt" fixtures/Inter-OFL.txt
$FONTTOOLS subset "$TMP/Inter-Regular.otf" $SUBSET_OPTIONS --output-file=fixtures/Inter-Regular.otf
$FONTTOOLS subset "$TMP/Inter-Regular.otf" $SUBSET_OPTIONS --flavor=woff --output-file=fixtures/Inter-Regular.woff
