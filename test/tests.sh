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

TOTALTESTS=14

clean
echo "promise.js (1/$TOTALTESTS)"
node promise.js

clean
echo "callbacks.js (2/$TOTALTESTS)"
node callbacks.js

clean
echo "chained.js (3/$TOTALTESTS)"
node chained.js

clean
echo "create.js (4/$TOTALTESTS)"
node create.js

clean
echo "rotation.js (5/$TOTALTESTS)"
node rotation.js

clean
echo "filetype.js (6/$TOTALTESTS)"
node filetypes.js

clean
echo "color.js (7/$TOTALTESTS)"
node color.js

clean
echo "compare.js (8/$TOTALTESTS)"
node compare.js

clean
echo "exif.js (9/$TOTALTESTS)"
node exif.js

clean
echo "autocrop.js (10/$TOTALTESTS)"
node autocrop.js

clean
echo "autocrop.js (11/$TOTALTESTS)"
node autocrop.js

clean
echo "resize.js (13/$TOTALTESTS)"
node resize.js

clean
echo "normalize.js (13/$TOTALTESTS)"
node normalize.js

clean
echo "print.js (14/$TOTALTESTS)"
node print.js

clean
echo "done :-)"

quit
