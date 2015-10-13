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
echo "callbacks.js (1/6)"
node callbacks.js

clean
echo "chained.js (2/6)"
node chained.js

clean
echo "create.js (3/6)"
node create.js

clean
echo "rotation.js (4/6)"
node rotation.js

clean
echo "filetype.js (5/6)"
node filetypes.js

clean
echo "color.js (6/6)"
node color.js

clean
echo "done :-)"

quit