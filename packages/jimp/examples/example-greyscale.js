/* eslint-disable no-console, import/no-unresolved */

const Jimp = require('jimp');

const url = 'https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg';

Jimp.read(url)
  .then(image => {
    image.greyscale().getBuffer(Jimp.MIME_JPEG, onBuffer);
  })
  .catch(err => {
    console.error(err);
  });

function onBuffer(err, buffer) {
  if (err) throw err;
  console.log(buffer);
}
