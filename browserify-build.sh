#!/bin/sh

# This mechanism could offer simple variations on the build.
# Features could be productively grouped for smaller file size
# eg: I/O, Affine Transforms, Bitmap Operations, Gamma Curves, and Layers
# Initial Build includes only functionality useful for thumbnailing:
# Resize, (auto)rotate, mime, encoding/decoding jpg/png
ENVIRONMENT=BROWSER \
browserify -t envify -t uglifyify index.js | uglifyjs --compress --mangle > browser/jimp.js

