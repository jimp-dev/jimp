var DEBUG = false,
    cachebuster = DEBUG ? "?r="+((new Date()).getTime()) : "";
importScripts("lib/jimp.min.js"+cachebuster);

if (!self.Jimp && !window.Jimp) {
    throw new Error("Could not load jimp.min.js in jimp-worker.js");
} else if (!self.Buffer && !window.Buffer){
    throw new Error("Node's Buffer() not available in jimp-worker.js");
}

function processImageData(image){
    // Do some image processing in Jimp. Syntax exactly the same as
    // https://github.com/oliver-moran/jimp
    // Reading and writing functions are replaced for browser context.
    // See readme at https://github.com/strandedcity/jimp
    image.containCropped(200, 200)            // resize thumbnail
        .quality(60)                          // set JPEG quality
        .greyscale();                         // set greyscale
}
