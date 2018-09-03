import { Jimp as jimp, mkJGD, getTestDir } from '@jimp/test-utils';
import configure from '@jimp/custom';
import plugins from '@jimp/plugins';

const Jimp = configure({ plugins: [plugins] }, jimp);

describe('Events', () => {
  describe('on initialized', () => {
    it('initializes', done => {
      new Jimp(mkJGD('▴▵'))
        .on('initialized', function(data) {
          this.getJGDSync().should.be.sameJGD(mkJGD('▴▵'));
          data.methodName.should.be.equal('constructor');
          done();
        })
        .on('error', done);
    });

    it('initializes with a file', done => {
      new Jimp(getTestDir(__dirname) + '/images/lenna.png')
        .on('initialized', function() {
          this.bitmap.width.should.be.equal(512);
          done();
        })
        .on('error', done);
    });

    // (8bit Hex, Hex, RGB, RGBA, HSL, HSLA, HSV, HSVA, Named)
    it('initializes with a 8bit hex color', async () => {
      const image = await Jimp.create(2, 2, 0xffffffff);
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });

    it('initializes with a css color (Hex)', async () => {
      const image = await Jimp.create(2, 2, '#FFFFFF');
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });

    it('initializes with a css color (RGB)', async () => {
      const image = await Jimp.create(2, 2, 'rgb (255, 255, 255)');
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });

    it('initializes with a css color (RGBA)', async () => {
      const image = await Jimp.create(2, 2, 'rgba (255, 255, 255, 1)');
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });

    it('initializes with a css color (HSL)', async () => {
      const image = await Jimp.create(2, 2, 'hsl (100%, 100%, 100%)');
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });

    it('initializes with a css color (HSLA)', async () => {
      const image = await Jimp.create(2, 2, 'hsla (100%, 100%, 100%, 1)');
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });

    it('initializes with a css color (HSV)', async () => {
      const image = await Jimp.create(2, 2, 'hsv (0%, 0%, 100%)');
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });

    it('initializes with a css color (HSVA)', async () => {
      const image = await Jimp.create(2, 2, 'hsva (0%, 0%, 100%, 1)');
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });

    it('initializes with a css color (Named)', async () => {
      const image = await Jimp.create(2, 2, 'WHITE');
      image.getPixelColor(1, 1).should.be.equal(0xffffffff);
    });
  });

  describe('on change', () => {
    it('call before-change without callback', done => {
      const img = new Jimp(8, 8).on('before-change', function(data) {
        this.should.be.instanceof(Jimp);
        data.methodName.should.be.equal('crop');
        this.bitmap.width.should.be.equal(8, 'not changed yet');
        done();
      });
      img.crop(0, 0, 4, 4);
    });

    it('call changed without callback', done => {
      const img = new Jimp(8, 8).on('changed', function(data) {
        this.should.be.instanceof(Jimp);
        data.methodName.should.be.equal('crop');
        this.bitmap.width.should.be.equal(4, 'just changed!');
        done();
      });
      img.crop(0, 0, 4, 4);
    });

    it('call before-change with callback', done => {
      let eventEmited = false;
      const img = new Jimp(8, 8).on('before-change', function(data) {
        this.should.be.instanceof(Jimp);
        data.methodName.should.be.equal('crop');
        this.bitmap.width.should.be.equal(8, 'not changed yet');
        eventEmited = true;
      });
      img.crop(0, 0, 4, 4, () => {
        eventEmited.should.be.ok();
        done();
      });
    });

    it('call changed with callback', done => {
      let eventEmited = false;
      const img = new Jimp(8, 8).on('changed', function(data) {
        this.should.be.instanceof(Jimp);
        data.methodName.should.be.equal('crop');
        this.bitmap.width.should.be.equal(4, 'just changed!');
        eventEmited = true;
      });
      img.crop(0, 0, 4, 4, () => {
        eventEmited.should.be.ok();
        done();
      });
    });

    it('call consistent with method chain', done => {
      const widthSequence = [];
      const img = new Jimp(8, 8)
        .on('before-change', function() {
          widthSequence.push('in:' + this.bitmap.width);
        })
        .on('changed', function() {
          widthSequence.push('out:' + this.bitmap.width);
          if (widthSequence.length === 6) {
            widthSequence.should.be.deepEqual([
              'in:8',
              'out:6',
              'in:6',
              'out:4',
              'in:4',
              'out:2'
            ]);
            done();
          }
        });
      img
        .crop(0, 0, 6, 6)
        .crop(0, 0, 4, 4)
        .crop(0, 0, 2, 2);
    });

    it('call consistent with callback chain', done => {
      const widthSequence = [];
      const img = new Jimp(8, 8)
        .on('before-change', function() {
          widthSequence.push('in:' + this.bitmap.width);
        })
        .on('changed', function() {
          widthSequence.push('out:' + this.bitmap.width);
          if (widthSequence.length === 6) {
            widthSequence.should.be.deepEqual([
              'in:8',
              'out:6',
              'in:6',
              'out:4',
              'in:4',
              'out:2'
            ]);
            done();
          }
        });

      img
        .crop(0, 0, 6, 6)
        .crop(0, 0, 4, 4)
        .crop(0, 0, 2, 2);
    });
  });

  describe('on error', () => {
    it('init fail on inextent image', done => {
      new Jimp('/invalid/path/inextent.png')
        .on('initialized', () => {
          throw new Error('must not init!');
        })
        .on('error', err => {
          err.should.be.instanceof(Error);
          err.methodName.should.be.equal('constructor');
          done();
        });
    });

    it('call crop without parameters', done => {
      let evBeforeChangeEmited = false;
      const img = new Jimp(8, 8)
        .on('before-change', () => {
          evBeforeChangeEmited = true;
        })
        .on('changed', () => {
          throw new Error('must not emit!');
        })
        .on('error', err => {
          setTimeout(() => {
            // Give some time to ensure `changed` will not emit.
            err.methodName.should.be.equal('crop');
            evBeforeChangeEmited.should.be.ok();
            done();
          }, 300);
        });
      img.crop();
    });
  });

  describe('on clone', () => {
    it('emit clone events without callback', done => {
      let evBeforeCloneEmited = false;
      const eventsEmited = [];
      Jimp.read(mkJGD('▴▵'))
        .then(img => {
          img.on('clone', data => {
            eventsEmited.push(data.eventName);
          });
          img.on('before-clone', function(data) {
            this.should.be.instanceof(Jimp);
            data.methodName.should.be.equal('clone');
            evBeforeCloneEmited = true;
          });
          img.on('cloned', function(data) {
            evBeforeCloneEmited.should.be.ok();
            eventsEmited.should.be.deepEqual(['before-clone', 'cloned']);
            this.should.be.equal(img, 'this is NOT the clone! Is the emitter.');
            data.methodName.should.be.equal('clone');
            data.clone.should.be.instanceof(Jimp);
            data.clone.getJGDSync().should.be.sameJGD(mkJGD('▴▵'));
            done();
          });
          img.clone();
        })
        .catch(done);
    });

    it('emit clone events with callback', done => {
      let evBeforeCloneEmited = false;
      let evClonedEmited = false;
      const eventsEmited = [];
      Jimp.read(mkJGD('▴▵'))
        .then(img => {
          img
            .on('clone', data => {
              eventsEmited.push(data.eventName);
            })
            .on('before-clone', function(data) {
              this.should.be.instanceof(Jimp);
              data.methodName.should.be.equal('clone');
              evBeforeCloneEmited = true;
            })
            .on('cloned', function(data) {
              this.should.be.equal(
                img,
                'this is NOT the clone! Is the emitter.'
              );
              data.methodName.should.be.equal('clone');
              data.clone.should.be.instanceof(Jimp);
              data.clone.getJGDSync().should.be.sameJGD(mkJGD('▴▵'));
              evClonedEmited = true;
            });
          img.clone(() => {
            evBeforeCloneEmited.should.be.ok();
            evClonedEmited.should.be.ok();
            eventsEmited.should.be.deepEqual(['before-clone', 'cloned']);
            done();
          });
        })
        .catch(done);
    });
  });
});
