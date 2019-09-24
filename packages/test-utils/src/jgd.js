/*
JGD - JS Graphic Description
This is a simple pixel based image representation, focused on simplify
testing through the possibility of a code friendly image definition in
javascript notation. This can also helps Jimp users to add icons and other
simple images in their script code.

Basically, JGD is a js object width `width`, `height` and `data`, where `data`
is an array of integers, each representing a RGBA pixel. This is simpler then
write a Buffer and we can use variables to make some "visual image code", like
a XPM code.

function donutJGD() {
    //Pallet  RRGGBBAA
    const _ = 0xFFFFFF00,
        i = 0xFF880088,
        X = 0xFF8800FF;
    return {
        width: 10, height: 10,
        data: [
            _,_,_,_,_,_,_,_,_,_,
            _,_,_,i,X,X,i,_,_,_,
            _,_,X,X,X,X,X,X,_,_,
            _,i,X,X,i,i,X,X,i,_,
            _,X,X,i,_,_,i,X,X,_,
            _,X,X,i,_,_,i,X,X,_,
            _,i,X,X,i,i,X,X,i,_,
            _,_,X,X,X,X,X,X,_,_,
            _,_,_,i,X,X,i,_,_,_,
            _,_,_,_,_,_,_,_,_,_
        ]
    };
}

new Jimp(donutJGD(), function (err, image) {
    this.write("/tmp/donut.png");
});
*/

function decode(jgd) {
  const bitmap = { width: jgd.width, height: jgd.height };
  const length = jgd.width * jgd.height;
  bitmap.data = Buffer.alloc(length * 4);

  for (let i = 0; i < length; i++) {
    bitmap.data.writeUInt32BE(jgd.data[i], i * 4);
  }

  return bitmap;
}

function encode(bitmap) {
  const jgd = { width: bitmap.width, height: bitmap.height, data: [] };

  for (let row = 0; row < bitmap.height; row++) {
    for (let col = 0; col < bitmap.width; col++) {
      const i = (bitmap.width * row + col) << 2;
      const r = bitmap.data[i + 0];
      const g = bitmap.data[i + 1];
      const b = bitmap.data[i + 2];
      const a = bitmap.data[i + 3];
      const color =
        ((((r & 0xff) << 24) >>> 0) |
          ((g & 0xff) << 16) |
          ((b & 0xff) << 8) |
          (a & 0xff)) >>>
        0;
      jgd.data.push(color);
    }
  }

  return jgd;
}

export default {
  encode,
  decode
};
