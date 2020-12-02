import Jimp from 'jimp';
import { scan } from '@jimp/utils';

const constants = {
  bitmapSize: 40,
  colorMode: 0,
  directorySize: 16,
  headerSize: 6
};

const createHeader = n => {
  const buf = Buffer.alloc(constants.headerSize);

  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(n, 4);

  return buf;
};

const createDirectory = (image, offset) => {
  const buf = Buffer.alloc(constants.directorySize);
  const { width, height } = image.bitmap;
  const size = width * height * 4 + constants.bitmapSize;
  const bpp = 32;

  buf.writeUInt8(width === 256 ? 0 : width, 0);
  buf.writeUInt8(height === 256 ? 0 : height, 1);
  buf.writeUInt8(0, 2);
  buf.writeUInt8(0, 3);
  buf.writeUInt16LE(1, 4);
  buf.writeUInt16LE(bpp, 6);
  buf.writeUInt32LE(size, 8);
  buf.writeUInt32LE(offset, 12);

  return buf;
};

const createBitmap = (image, compression) => {
  const buf = Buffer.alloc(constants.bitmapSize);
  const { width, height } = image.bitmap;
  buf.writeUInt32LE(constants.bitmapSize, 0);
  buf.writeInt32LE(width, 4);
  buf.writeInt32LE(height * 2, 8);
  buf.writeUInt16LE(1, 12);
  buf.writeUInt16LE(32, 14);
  buf.writeUInt32LE(compression, 16);
  buf.writeUInt32LE(width * height, 20);
  buf.writeInt32LE(0, 24);
  buf.writeInt32LE(0, 28);
  buf.writeUInt32LE(0, 32);
  buf.writeUInt32LE(0, 36);

  return buf;
};

const createDib = image => {
  const { width, height } = image.bitmap;
  const buf = Buffer.alloc(width * height * 4);
  scan(image, 0, 0, width, height, (x, y) => {
    const color = image.getPixelColor(x, y);
    const { r, g, b, a } = Jimp.intToRGBA(color);
    const pos = (height - y - 1) * width + x;
    buf.writeUInt8(b, pos * 4);
    buf.writeUInt8(g, pos * 4 + 1);
    buf.writeUInt8(r, pos * 4 + 2);
    buf.writeUInt8(a, pos * 4 + 3);
  });
  return buf;
};

export const encodeIco = images => {
  const header = createHeader(images.length);
  let arr = [header];

  let offset = constants.headerSize + constants.directorySize * images.length;

  const bitmaps = images.map(image => {
    const header = createBitmap(image, constants.colorMode);
    const dib = createDib(image);
    return Buffer.concat([header, dib]);
  });

  for (let i = 0; i < images.length; ++i) {
    const image = images[i];
    const bitmap = bitmaps[i];

    const dir = createDirectory(image, offset);
    arr.push(dir);
    offset += bitmap.length;
  }

  arr = [...arr, ...bitmaps];

  return Buffer.concat(arr);
};
