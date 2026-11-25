#!/bin/sh
# Generates the fonts in src/og/fonts/ that the Open Graph images are drawn
# with: static instances of the site's Fredoka and JetBrains Mono, cut down
# to Latin. They're TrueType, since loadTTF doesn't read WOFF2.
# Needs curl and uv (https://docs.astral.sh/uv/), which runs fonttools.
#
# Both fonts are under the SIL Open Font License 1.1 with no Reserved Font
# Name, so their subsets can keep their names. The licences are copied too.
set -eu

cd "$(dirname "$0")/.."

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

FONTTOOLS="uvx --from fonttools==4.68.0 fonttools"
# Basic Latin, Latin-1, dashes, quotes, bullet, ellipsis and arrows
UNICODES="U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201F,U+2022,U+2026,U+2190-2193"
SUBSET_OPTIONS="--unicodes=$UNICODES --layout-features=kern,liga --notdef-outline --no-hinting --name-IDs=0,1,2,3,4,5,6 --drop-tables+=FFTM,STAT"
FONTS=https://github.com/google/fonts/raw/83c62e30d87daa70216dab6b984d00d20d96d585/ofl
OUT=src/og/fonts

curl -sSfL -o "$TMP/Fredoka.ttf" "$FONTS/fredoka/Fredoka%5Bwdth,wght%5D.ttf"
curl -sSfL -o "$OUT/Fredoka-OFL.txt" "$FONTS/fredoka/OFL.txt"
curl -sSfL -o "$TMP/JetBrainsMono.ttf" "$FONTS/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
curl -sSfL -o "$OUT/JetBrainsMono-OFL.txt" "$FONTS/jetbrainsmono/OFL.txt"

instance() {
  $FONTTOOLS varLib.instancer "$TMP/$1.ttf" $3 --static -q -o "$TMP/$2.ttf"
  $FONTTOOLS subset "$TMP/$2.ttf" $SUBSET_OPTIONS --output-file="$OUT/$2.ttf"
}

instance Fredoka Fredoka-Medium "wght=500 wdth=100"
instance Fredoka Fredoka-Bold "wght=700 wdth=100"
instance JetBrainsMono JetBrainsMono-Bold "wght=700"
