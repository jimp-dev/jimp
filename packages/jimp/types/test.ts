import Jimp from 'jimp';

// Main Jimp export should already have all of these already applied
Jimp.read('Test');
Jimp.displace(Jimp, 2);
Jimp.resize(40, 40);
// $ExpectType 0
Jimp.PNG_FILTER_NONE;