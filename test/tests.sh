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
echo "promise.js (1/13)"
node promise.js

clean
echo "callbacks.js (2/13)"
node callbacks.js

clean
echo "chained.js (3/13)"
node chained.js

clean
echo "create.js (4/13)"
node create.js

clean
echo "rotation.js (5/13)"
node rotation.js

clean
echo "filetype.js (6/13)"
node filetypes.js

clean
echo "color.js (7/13)"
node color.js

clean
echo "compare.js (8/13)"
node compare.js

clean
echo "exif.js (9/13)"
node exif.js

clean
echo "autocrop.js (10/13)"
node autocrop.js

clean
echo "autocrop.js (11/13)"
node autocrop.js

clean
echo "resize.js (12/13)"
node resize.js

clean
echo "normalize.js (13/13)"
node exif.js

clean
echo "done :-)"

quit
