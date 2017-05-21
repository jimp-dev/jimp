#!/bin/bash
cd ${0%/*}

function quit {
    exit
}

function clean {
    rm -r ./output/*.png &>/dev/null
    rm -r ./output/*.jpg &>/dev/null
    rm -r ./output/*.bmp &>/dev/null
    rm -r ./output/subdir &>/dev/null
}

TOTALTESTS=17

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
echo "filetypes.js (6/$TOTALTESTS)"
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
echo "resize.js (11/$TOTALTESTS)"
node resize.js

clean
echo "normalize.js (12/$TOTALTESTS)"
node normalize.js

clean
echo "print.js (13/$TOTALTESTS)"
node print.js

clean
echo "align.js (14/$TOTALTESTS)"
node align.js

clean
echo "convolution.js (15/$TOTALTESTS)"
node convolution.js

clean
echo "write.js (16/$TOTALTESTS)"
node write.js

clean
echo "pixelate.js (17/$TOTALTESTS)"
node pixelate.js

clean
echo "done :-)"

quit
