import Jimp from 'jimp';

const jimpInst: Jimp = new Jimp('test');

// Main Jimp export should already have all of these already applied
jimpInst.read('Test');
jimpInst.displace(jimpInst, 2);
jimpInst.resize(40, 40);
// $ExpectType 0
jimpInst.PNG_FILTER_NONE;

// $ExpectError
jimpInst.test;

// $ExpectError
jimpInst.func();

// Main Jimp export should already have all of these already applied
Jimp.read('Test');
Jimp.displace(Jimp, 2);
Jimp.resize(40, 40);
// $ExpectType 0
Jimp.PNG_FILTER_NONE;

// $ExpectError
Jimp.test;

// $ExpectError
Jimp.func();

test('can clone properly', async () => {
  const baseImage = await Jimp.read('filename');
  const finalImage = baseImage.clone()
    .resize(1, 1)
    .setPixelColor(0x00000000, 0, 0)
    .resize(2, 2);  
});
