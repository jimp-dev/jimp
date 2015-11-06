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
echo "promise.js (1/9)"
node promise.js

clean
echo "callbacks.js (2/9)"
node callbacks.js

clean
echo "chained.js (3/9)"
node chained.js

clean
echo "create.js (4/9)"
node create.js

clean
echo "rotation.js (5/9)"
node rotation.js

clean
echo "filetype.js (6/9)"
node filetypes.js

clean
echo "color.js (7/9)"
node color.js

clean
echo "diff.js (8/9)"
node diff.js

clean
echo "exif.js (9/9)"
node exif.js



clean
echo "done :-)"

quit