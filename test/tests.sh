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
echo "callbacks.js (1/5)"
node callbacks.js

clean
echo "chained.js (2/5)"
node chained.js

clean
echo "create.js (3/5)"
node create.js

clean
echo "rotation.js (4/5)"
node rotation.js

clean
echo "filetype.js (5/5)"
node filetypes.js

clean
echo "done :-)"

quit