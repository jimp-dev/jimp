#!/bin/bash 

function quit {
    exit
}

function clean {
    rm -r ./output/*.png &>/dev/null
    rm -r ./output/*.jpg &>/dev/null
    rm -r ./output/*.bmp &>/dev/null
}

clean
echo "promise.js (1/12)"
node promise.js

clean
echo "callbacks.js (2/12)"
node callbacks.js

clean
echo "chained.js (3/12)"
node chained.js

clean
echo "create.js (4/12)"
node create.js

clean
echo "rotation.js (5/12)"
node rotation.js

clean
echo "filetype.js (6/12)"
node filetypes.js

clean
echo "color.js (7/12)"
node color.js

clean
echo "compare.js (8/12)"
node compare.js

clean
echo "exif.js (9/12)"
node exif.js

clean
echo "autocrop.js (10/12)"
node autocrop.js

clean
echo "autocrop.js (11/12)"
node autocrop.js

clean
echo "resize.js (12/12)"
node resize.js

clean
echo "done :-)"

quit