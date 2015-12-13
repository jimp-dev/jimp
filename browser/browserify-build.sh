#!/bin/sh

# This mechanism could offer simple variations on the build.
# Features could be productively grouped for smaller file size
# eg: I/O, Affine Transforms, Bitmap Operations, Gamma Curves, and Layers
# Initial Build includes only functionality useful for thumbnailing:
# Resize, (auto)rotate, mime, encoding/decoding jpg/png
cd ${0%/*}
echo "Browserifying browser/jimp.js..."
ENVIRONMENT=BROWSER \
browserify -t envify -t uglifyify ../index.js > jimp.js
echo "Minifying browser/jimp.min.js..."
uglifyjs jimp.js --compress warnings=false --mangle -o jimp.min.js
echo "Done."
