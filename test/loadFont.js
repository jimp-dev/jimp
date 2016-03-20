var Jimp = require("../index.js");

Jimp.loadFont("font/font.fnt").then(function (font) {
  if (font.common.lineHeight != 80) {
    console.log("Error: font reading mismatch.");
  }
}).catch(function (err) {
    console.log(err);
});
