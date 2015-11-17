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
echo "promise.js (1/10)"
node promise.js

clean
echo "callbacks.js (2/10)"
node callbacks.js

clean
echo "chained.js (3/10)"
node chained.js

clean
echo "create.js (4/10)"
node create.js

clean
echo "rotation.js (5/10)"
node rotation.js

clean
echo "filetype.js (6/10)"
node filetypes.js

clean
echo "color.js (7/10)"
node color.js

clean
echo "compare.js (8/10)"
node compare.js

clean
echo "exif.js (9/10)"
node exif.js

clean
echo "autocrop.js (10/10)"
node autocrop.js



clean
echo "done :-)"

quit