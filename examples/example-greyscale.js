/* eslint-disable no-console, import/no-unresolved */

const Jimp = require('jimp');

const url = 'https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg';

new Jimp(url)
    .greyscale()
    .getBuffer(Jimp.MIME_JPEG)
    .then(buffer => {
        console.log(buffer);
    })
    .catch(err => {
        console.error(err);
    });
