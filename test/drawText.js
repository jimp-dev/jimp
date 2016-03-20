var Jimp = require("../index.js");

Jimp.loadFont("font/font.fnt").then(function (font) {
  Jimp.read("lenna.png").then(function (image) {
      image.clone().drawText(font, 0, 0, "Lenna").write("./output/lenna-text.png");
  }).catch(function (err) {
      console.log(err);
  });
}).catch(function (err) {
    console.log(err);
});
