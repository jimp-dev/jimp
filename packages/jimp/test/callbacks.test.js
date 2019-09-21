import { Jimp, mkJGD, hasOwnProp } from '@jimp/test-utils';

import configure from '@jimp/custom';
import plugins from '@jimp/plugins';

const jimp = configure({ plugins: [plugins] }, Jimp);

describe('Callbacks', () => {
  const targetJGD = mkJGD('▴▸▾', '◆▪▰', '▵▹▿');
  const miniJGD = mkJGD('□▥', '▥■');

  let targetImg;
  let miniImg; // stores the Jimp instances of the JGD images above.

  before(done => {
    const img1 = jimp.read(targetJGD);
    const img2 = jimp.read(miniJGD);
    Promise.all([img1, img2])
      .then(images => {
        targetImg = images[0];
        miniImg = images[1];
        done();
      })
      .catch(done);
  });

  const operations = {
    crop: {
      args: [1, 1, 2, 1],
      result: ['▪▰']
    },
    invert: {
      args: [],
      result: ['▪▰◆', '▾▴▸', '▫▱◇']
    },
    flip: {
      args: [true, false],
      result: ['▾▸▴', '▰▪◆', '▿▹▵']
    },
    mirror: {
      args: [true, false],
      result: ['▾▸▴', '▰▪◆', '▿▹▵']
    },
    gaussian: {
      args: [1],
      result: {
        width: 3,
        height: 3,
        data: [
          0x72a02bf8,
          0x4f7092f5,
          0x5950b9f3,
          0x787f4fd4,
          0x6f6479cf,
          0x4555a4cc,
          0x558f51c3,
          0x495a8fbe,
          0x515d93cf
        ]
      }
    },
    blur: {
      args: [1],
      result: {
        width: 3,
        height: 3,
        data: [
          0xaa943ff1,
          0x7e7e7ef1,
          0x5469bff1,
          0x9bc252d4,
          0x85a785d4,
          0x6e8bb6d4,
          0x88006cb7,
          0x8cdc8cb7,
          0x92b7acb7
        ]
      }
    },
    greyscale: {
      args: [],
      result: {
        width: 3,
        height: 3,
        data: [
          0x363636ff,
          0xb6b6b6ff,
          0x121212ff,
          0xecececff,
          0xc8c8c8ff,
          0x484848ff,
          0x3636367f,
          0xb6b6b67f,
          0x1212127f
        ]
      }
    },
    sepia: {
      args: [],
      result: {
        width: 3,
        height: 3,
        data: [
          0x64222dff,
          0xc4f3b7ff,
          0x303b4eff,
          0xffffe5ff,
          0xf4ffffff,
          0x945e7cff,
          0x64222d7f,
          0xc4f3b77f,
          0x303b4e7f
        ]
      }
    },
    opacity: {
      args: [0.5],
      result: {
        width: 3,
        height: 3,
        data: [
          0xff00007f,
          0x00ff007f,
          0x0000ff7f,
          0xffff007f,
          0x00ffff7f,
          0xff00ff7f,
          0xff00003f,
          0x00ff003f,
          0x0000ff3f
        ]
      }
    },
    resize: {
      args: [2, 2],
      result: {
        width: 2,
        height: 2,
        data: [0xaa8e1cff, 0x3955c6ff, 0xaa8e1caa, 0x3955c6aa]
      }
    },
    scale: {
      args: [0.5],
      result: {
        width: 2,
        height: 2,
        data: [0xaa8e1cff, 0x3955c6ff, 0xaa8e1caa, 0x3955c6aa]
      }
    },
    brightness: {
      args: [0.5],
      result: {
        width: 3,
        height: 3,
        data: [
          0xff7f7fff,
          0x7fff7fff,
          0x7f7fffff,
          0xffff7fff,
          0x7fffffff,
          0xff7fffff,
          0xff7f7f7f,
          0x7fff7f7f,
          0x7f7fff7f
        ]
      }
    },
    contrast: {
      args: [0.75],
      result: ['▴▸▾', '◆▪▰', '▵▹▿']
    },
    posterize: {
      args: [5],
      result: ['▴▸▾', '◆▪▰', '▵▹▿']
    },
    dither565: {
      args: [],
      result: {
        width: 3,
        height: 3,
        data: [
          0xff0101ff,
          0x09ff09ff,
          0x0303ffff,
          0xffff0dff,
          0x05ffffff,
          0xff0fffff,
          0xff04047f,
          0x0cff0c7f,
          0x0202ff7f
        ]
      }
    },
    background: {
      args: [0xffffffff],
      result: ['▴▸▾', '◆▪▰', '▵▹▿']
    },
    cover: {
      args: [3, 2, jimp.HORIZONTAL_ALIGN_LEFT | jimp.VERTICAL_ALIGN_TOP],
      result: ['▴▸▾', '◆▪▰']
    },
    contain: {
      args: [3, 2, jimp.HORIZONTAL_ALIGN_LEFT | jimp.VERTICAL_ALIGN_TOP],
      result: {
        width: 3,
        height: 2,
        data: [0xaa8e1cff, 0x3955c6ff, 0, 0x715f13aa, 0x263984aa, 0]
      }
    },
    opaque: {
      args: [],
      result: {
        width: 3,
        height: 3,
        data: [
          0xff0000ff,
          0x00ff00ff,
          0x0000ffff,
          0xffff00ff,
          0x00ffffff,
          0xff00ffff,
          0xff0000ff,
          0x00ff00ff,
          0x0000ffff
        ]
      }
    },
    fade: {
      args: [0.5],
      result: {
        width: 3,
        height: 3,
        data: [
          0xff00007f,
          0x00ff007f,
          0x0000ff7f,
          0xffff007f,
          0x00ffff7f,
          0xff00ff7f,
          0xff00003f,
          0x00ff003f,
          0x0000ff3f
        ]
      }
    },
    scaleToFit: {
      args: [3, 2],
      result: {
        width: 2,
        height: 2,
        data: [0xaa8e1cff, 0x3955c6ff, 0xaa8e1caa, 0x3955c6aa]
      }
    },
    blit: {
      args: ['miniImg', 0, 0],
      result: ['□▥▾', '▥■▰', '▵▹▿']
    },
    composite: {
      args: ['miniImg', 0, 0],
      result: ['□▥▾', '▥■▰', '▵▹▿']
    }
  };

  for (const op in operations) if (hasOwnProp(operations, op)) process(op);

  function process(op) {
    it('with ' + op, done => {
      const { args } = operations[op];

      for (let i = 0; i < args.length; i++)
        if (args[i] === 'miniImg') args[i] = miniImg;

      let { result } = operations[op];

      if (result.constructor === Array) result = mkJGD(...result);

      function save(err, image) {
        if (err) return done(err);
        image.getJGDSync().should.be.sameJGD(result);
        done();
      }

      targetImg.clone()[op](...args.concat(save));
    });
  }
});
