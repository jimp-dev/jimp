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
echo "promise.js (1/11)"
node promise.js

clean
echo "callbacks.js (2/11)"
node callbacks.js

clean
echo "chained.js (3/11)"
node chained.js

clean
echo "create.js (4/11)"
node create.js

clean
echo "rotation.js (5/11)"
node rotation.js

clean
echo "filetype.js (6/11)"
node filetypes.js

clean
echo "color.js (7/11)"
node color.js

clean
echo "compare.js (8/11)"
node compare.js

clean
echo "exif.js (9/11)"
node exif.js

clean
echo "autocrop.js (10/11)"
node autocrop.js

clean
echo "blit.js (11/11)"
node autocrop.js

clean
echo "done :-)"

quit