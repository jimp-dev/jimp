#!/bin/bash
cd ${0%/*}

function quit {
    exit
}

function clean {
    rm -r ./output/*.png &>/dev/null
    rm -r ./output/*.jpg &>/dev/null
    rm -r ./output/*.bmp &>/dev/null
}

clean
echo "promise.js (1/14)"
node promise.js

clean
echo "callbacks.js (2/14)"
node callbacks.js

clean
echo "chained.js (3/14)"
node chained.js

clean
echo "create.js (4/14)"
node create.js

clean
echo "rotation.js (5/14)"
node rotation.js

clean
echo "filetype.js (6/14)"
node filetypes.js

clean
echo "color.js (7/14)"
node color.js

clean
echo "compare.js (8/14)"
node compare.js

clean
echo "exif.js (9/14)"
node exif.js

clean
echo "autocrop.js (10/14)"
node autocrop.js

clean
echo "autocrop.js (11/14)"
node autocrop.js

clean
echo "resize.js (13/14)"
node resize.js

clean
echo "normalize.js (13/14)"
node normalize.js

clean
echo "print.js (14/14)"
node print.js

clean
echo "done :-)"

quit
