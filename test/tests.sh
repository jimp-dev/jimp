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
echo "promise.js (1/8)"
node promise.js

clean
echo "callbacks.js (2/8)"
node callbacks.js

clean
echo "chained.js (3/8)"
node chained.js

clean
echo "create.js (4/8)"
node create.js

clean
echo "rotation.js (5/8)"
node rotation.js

clean
echo "filetype.js (6/8)"
node filetypes.js

clean
echo "color.js (7/8)"
node color.js

clean
echo "diff.js (8/8)"
node diff.js

clean
echo "done :-)"

quit