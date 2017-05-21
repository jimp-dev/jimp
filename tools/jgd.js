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
    var _ = 0xFFFFFF00,
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

exports.decode = function (jgd) {
    var bitmap = { width: jgd.width, height: jgd.height };
    var length = jgd.width * jgd.height;
    bitmap.data = new Buffer(length * 4);
    for (var i = 0; i < length; i++) {
        bitmap.data.writeUInt32BE(jgd.data[i], i*4);
    }
    return bitmap;
};

exports.encode = function (bitmap) {
    var jgd = { width: bitmap.width, height: bitmap.height, data: [] };
    for (let row=0; row<bitmap.height; row++) {
        for (let col=0; col<bitmap.width; col++) {
            let i = (bitmap.width * row + col) << 2;
            let r = bitmap.data[i+0];
            let g = bitmap.data[i+1];
            let b = bitmap.data[i+2];
            let a = bitmap.data[i+3];
            let color = (
                    ((r & 0xFF) << 24 >>> 0) |
                    ((g & 0xFF) << 16) |
                    ((b & 0xFF) << 8) |
                    (a & 0xFF)
                ) >>> 0;
            jgd.data.push(color);
        }
    }
    return jgd;
};
