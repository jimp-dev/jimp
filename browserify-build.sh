#!/bin/sh

NODE_ENV=BROWSER browserify -t envify -t uglifyify index.js | uglifyjs --compress --mangle > browser/jimp.js

