/* eslint key-spacing: ["error", { "align": "value" }] */

import { Jimp, getTestDir, hasOwnProp } from './test-helper';

async function createTextImage(
  width,
  height,
  font,
  options,
  maxWidth,
  maxHeight
) {
  const loadedFont = await Jimp.loadFont(font);
  const image = await Jimp.create(width, height, 0xffffffff);

  return image.print(loadedFont, 0, 0, options, maxWidth, maxHeight);
}

describe('Write text over image', function() {
  this.timeout(30000);

  const fontDefs = {
    SANS_8_BLACK: { w: 28, h: 28, bg: 0xffffffff },

    SANS_16_BLACK: { w: 54, h: 54, bg: 0xffffffff },
    SANS_32_BLACK: { w: 114, h: 114, bg: 0xffffffff },
    SANS_64_BLACK: { w: 220, h: 220, bg: 0xffffffff },

    SANS_8_WHITE: { w: 28, h: 28, bg: 0x000000ff },

    SANS_16_WHITE: { w: 54, h: 54, bg: 0x000000ff },
    SANS_32_WHITE: { w: 114, h: 114, bg: 0x000000ff },
    SANS_64_WHITE: { w: 220, h: 220, bg: 0x000000ff }
  };

  for (const fontName in fontDefs)
    if (hasOwnProp(fontDefs, fontName))
      ((fontName, conf) => {
        it('Jimp preset ' + fontName + ' bitmap font', async () => {
          const font = await Jimp.loadFont(Jimp['FONT_' + fontName]);
          const expected =
            getTestDir() + '/samples/text-samples/' + fontName + '.png';

          const expectedImg = await Jimp.read(expected);
          const image = await Jimp.create(conf.w, conf.h, conf.bg);

          image
            .print(font, 0, 0, 'This is only a test.', image.bitmap.width)
            .bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
        });
      })(fontName, fontDefs[fontName]);

  it('Jimp preset SANS_16_BLACK bitmap font positioned', async () => {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    const expected =
      getTestDir() + '/samples/text-samples/SANS_16_BLACK-positioned.png';
    const expectedImg = await Jimp.read(expected);
    const image = await Jimp.create('300', '100', 0xff8800ff);

    image
      .print(font, 150, 50, 'This is only a test.', 100)
      .bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
  });

  it('Jimp loads font from URL', async () => {
    const font = await Jimp.loadFont(
      'https://raw.githubusercontent.com/oliver-moran/jimp/master/packages/plugin-print/fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt'
    );
    const expected =
      getTestDir() + '/samples/text-samples/SANS_16_BLACK-positioned.png';
    const expectedImg = await Jimp.read(expected);
    const image = await Jimp.create('300', '100', 0xff8800ff);

    image
      .print(font, 150, 50, 'This is only a test.', 100)
      .bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
  });

  it('Jimp renders ? for unknown characters', async () => {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

    const expected =
      getTestDir() + '/samples/text-samples/unknown-char-test.png';
    const expectedImg = await Jimp.read(expected);
    const image = await Jimp.read('300', '100', 0xff8800ff);

    image
      .print(font, 0, 0, 'ツ ツ ツ', 100)
      .bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
  });

  it('Jimp can print numbers too', async () => {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

    const expected = getTestDir() + '/samples/text-samples/print-number.png';
    const expectedImg = await Jimp.read(expected);
    const image = await Jimp.read('300', '100', 0xff8800ff);

    image
      .print(font, 0, 0, 12345678, 100)
      .bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
  });

  it('left-align text by default', async () => {
    const expectedImage = await Jimp.read(
      getTestDir() + '/samples/text-samples/left-aligned.png'
    );
    const textImage = createTextImage(
      320,
      240,
      Jimp.FONT_SANS_16_BLACK,
      'This is only a test.',
      100
    );

    return Promise.all([expectedImage, textImage]).then(results => {
      results[0].bitmap.data.should.be.deepEqual(results[1].bitmap.data);
    });
  });

  it('left-align text by default when passing object', async () => {
    const expectedImage = await Jimp.read(
      getTestDir() + '/samples/text-samples/left-aligned.png'
    );
    const textImage = createTextImage(
      320,
      240,
      Jimp.FONT_SANS_16_BLACK,
      { text: 'This is only a test.' },
      100
    );

    return Promise.all([expectedImage, textImage]).then(results => {
      results[0].bitmap.data.should.be.deepEqual(results[1].bitmap.data);
    });
  });

  it('left-align text when passing object with alignmentX', async () => {
    const expectedImage = await Jimp.read(
      getTestDir() + '/samples/text-samples/left-aligned.png'
    );
    const textImage = createTextImage(
      320,
      240,
      Jimp.FONT_SANS_16_BLACK,
      {
        text: 'This is only a test.',

        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
      },
      100
    );

    return Promise.all([expectedImage, textImage]).then(results => {
      results[0].bitmap.data.should.be.deepEqual(results[1].bitmap.data);
    });
  });

  it('center-align text when passing object with alignmentX', async () => {
    const expectedImage = await Jimp.read(
      getTestDir() + '/samples/text-samples/center-aligned.png'
    );
    const textImage = createTextImage(
      320,
      240,
      Jimp.FONT_SANS_16_BLACK,
      {
        text: 'This is only a test.',

        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      100
    );

    return Promise.all([expectedImage, textImage]).then(results => {
      results[0].bitmap.data.should.be.deepEqual(results[1].bitmap.data);
    });
  });

  it('right-align text when passing object with alignmentX', async () => {
    const expectedImage = await Jimp.read(
      getTestDir() + '/samples/text-samples/right-aligned.png'
    );
    const textImage = createTextImage(
      320,
      240,
      Jimp.FONT_SANS_16_BLACK,
      {
        text: 'This is only a test.',

        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      },
      100
    );

    return Promise.all([expectedImage, textImage]).then(results => {
      results[0].bitmap.data.should.be.deepEqual(results[1].bitmap.data);
    });
  });

  it('middle-align text when passing object with alignmentY', async () => {
    const expectedImage = await Jimp.read(
      getTestDir() + '/samples/text-samples/middle-aligned.png'
    );
    const textImage = createTextImage(
      320,
      240,
      Jimp.FONT_SANS_16_BLACK,
      {
        text: 'This is only a test.',

        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      100,
      240
    );

    return Promise.all([expectedImage, textImage]).then(results => {
      results[0].bitmap.data.should.be.deepEqual(results[1].bitmap.data);
    });
  });

  it('bottom-align text when passing object with alignmentY', async () => {
    const expectedImage = await Jimp.read(
      getTestDir() + '/samples/text-samples/bottom-aligned.png'
    );
    const textImage = createTextImage(
      320,
      240,
      Jimp.FONT_SANS_16_BLACK,
      {
        text: 'This is only a test.',

        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
      },
      100,
      240
    );

    return Promise.all([expectedImage, textImage]).then(results => {
      results[0].bitmap.data.should.be.deepEqual(results[1].bitmap.data);
    });
  });
});
