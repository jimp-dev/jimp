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
echo "promise.js (1/7)"
node promise.js

clean
echo "callbacks.js (2/7)"
node callbacks.js

clean
echo "chained.js (3/7)"
node chained.js

clean
echo "create.js (4/7)"
node create.js

clean
echo "rotation.js (5/7)"
node rotation.js

clean
echo "filetype.js (6/7)"
node filetypes.js

clean
echo "color.js (7/7)"
node color.js

clean
echo "done :-)"

quit