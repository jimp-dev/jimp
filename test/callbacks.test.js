var {Jimp, mkJGD, hasOwnProp} = require("./test-helper");

describe("Callbacks", ()=> {

    var targetJGD = mkJGD(
        '▴▸▾',
        '◆▪▰',
        '▵▹▿'
    );
    var miniJGD = mkJGD(
        '□▥',
        '▥■'
    );

    var targetImg, miniImg; // stores the Jimp instances of the JGD images above.
    before((done)=> {
        var img1 = Jimp.read(targetJGD);
        var img2 = Jimp.read(miniJGD);
        Promise.all([img1, img2]).then((images)=> {
            targetImg = images[0];
            miniImg = images[1];
            done();
        }).catch(done);
    });

    var operations = {
        crop: {
            args: [1, 1, 2, 1],
            result: ['▪▰']
        },
        invert: {
            args: [],
            result: [
                '▪▰◆',
                '▾▴▸',
                '▫▱◇']
        },
        flip: {
            args: [true, false],
            result: [
                '▾▸▴',
                '▰▪◆',
                '▿▹▵']
        },
        mirror: {
            args: [true, false],
            result: [
                '▾▸▴',
                '▰▪◆',
                '▿▹▵']
        },
        gaussian: {
            args: [1],
            result: {
                width: 3,
                height: 3,
                data: [
                    0x72A02Bf8, 0x4F7092f5, 0x5950B9f3,
                    0x787F4Fd4, 0x6F6479cf, 0x4555A4cc,
                    0x558F51c3, 0x495A8Fbe, 0x515D93cf]
            }
        },
        blur: {
            args: [1],
            result: {
                width: 3,
                height: 3,
                data: [
                    0xAA943Ff1, 0x7E7E7Ef1, 0x5469BFf1,
                    0x9BC252d4, 0x85A785d4, 0x6E8BB6d4,
                    0x88006Cb7, 0x8CDC8Cb7, 0x92B7ACb7]
            }
        },
        greyscale: {
            args: [],
            result: {
                width: 3,
                height: 3,
                data: [
                    0x363636ff, 0xB6B6B6ff, 0x121212ff,
                    0xECECECff, 0xC8C8C8ff, 0x484848ff,
                    0x3636367f, 0xB6B6B67f, 0x1212127f]
            }
        },
        sepia: {
            args: [],
            result: {
                width: 3,
                height: 3,
                data: [
                    0x64222Dff, 0xC4F3B7ff, 0x303B4Eff,
                    0xFFFFE5ff, 0xF4FFFFff, 0x945E7Cff,
                    0x64222D7f, 0xC4F3B77f, 0x303B4E7f]
            }
        },
        opacity: {
            args: [0.5],
            result: {
                width: 3,
                height: 3,
                data: [
                    0xFF00007f, 0x00FF007f, 0x0000FF7f,
                    0xFFFF007f, 0x00FFFF7f, 0xFF00FF7f,
                    0xFF00003f, 0x00FF003f, 0x0000FF3f]
            }
        },
        resize: {
            args: [2, 2],
            result: {
                width: 2,
                height: 2,
                data: [
                    0xAA8E1Cff, 0x3955C6ff,
                    0xAA8E1Caa, 0x3955C6aa]
            }
        },
        scale: {
            args: [0.5],
            result: {
                width: 2,
                height: 2,
                data: [
                    0xAA8E1Cff, 0x3955C6ff,
                    0xAA8E1Caa, 0x3955C6aa]
            }
        },
        rotate: {
            args: [90, false],
            result: [
                '▾▰▿',
                '▸▪▹',
                '▴◆▵']
        },
        brightness: {
            args: [0.5],
            result: {
                width: 3,
                height: 3,
                data: [
                    0xFF7F7Fff, 0x7FFF7Fff, 0x7F7FFFff,
                    0xFFFF7Fff, 0x7FFFFFff, 0xFF7FFFff,
                    0xFF7F7F7f, 0x7FFF7F7f, 0x7F7FFF7f]
            }
        },
        contrast: {
            args: [0.75],
            result: [
                '▴▸▾',
                '◆▪▰',
                '▵▹▿']
        },
        posterize: {
            args: [5],
            result: [
                '▴▸▾',
                '◆▪▰',
                '▵▹▿']
        },
        dither565: {
            args: [],
            result: {
                width: 3,
                height: 3,
                data: [
                    0xFF0101ff, 0x09FF09ff, 0x0303FFff,
                    0xFFFF0Dff, 0x05FFFFff, 0xFF0FFFff,
                    0xFF04047f, 0x0CFF0C7f, 0x0202FF7f]
            }
        },
        background: {
            args: [0xFFFFFFFF],
            result: [
                '▴▸▾',
                '◆▪▰',
                '▵▹▿']
        },
        cover: {
            args: [3, 2, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP],
            result: [
                '▴▸▾',
                '◆▪▰']
        },
        contain: {
            args: [3, 2, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP],
            result: {
                width: 3,
                height: 2,
                data: [
                    0xAA8E1Cff, 0x3955C6ff, 0,
                    0xAA8E1Caa, 0x3955C6aa, 0]
            }
        },
        opaque: {
            args: [],
            result: {
                width: 3,
                height: 3,
                data: [
                    0xFF0000ff, 0x00FF00ff, 0x0000FFff,
                    0xFFFF00ff, 0x00FFFFff, 0xFF00FFff,
                    0xFF0000ff, 0x00FF00ff, 0x0000FFff]
            }
        },
        fade: {
            args: [0.5],
            result: {
                width: 3,
                height: 3,
                data: [
                    0xFF00007f, 0x00FF007f, 0x0000FF7f,
                    0xFFFF007f, 0x00FFFF7f, 0xFF00FF7f,
                    0xFF00003f, 0x00FF003f, 0x0000FF3f]
            }
        },
        scaleToFit: {
            args: [3, 2],
            result: {
                width: 2,
                height: 2,
                data: [
                    0xAA8E1Cff, 0x3955C6ff,
                    0xAA8E1Caa, 0x3955C6aa]
            }
        },
        blit: {
            args: ['miniImg', 0, 0],
            result: [
                '□▥▾',
                '▥■▰',
                '▵▹▿']
        },
        composite: {
            args: ['miniImg', 0, 0],
            result: [
                '□▥▾',
                '▥■▰',
                '▵▹▿']
        }
    };

    for (var op in operations) if (hasOwnProp(operations, op)) process(op);

    function process (op) {
        it("with "+op, (done)=> {
            var args = operations[op].args;
            for (var i=0; i<args.length; i++) if (args[i]==='miniImg') args[i]=miniImg;
            var result = operations[op].result;
            if (result.constructor === Array) result = mkJGD(...result);
            function save (err, image) {
                if (err) return done(err);
                image.getJGDSync().should.be.sameJGD(result);
                done();
            }
            targetImg.clone()[op](...args.concat(save));
        });
    }

});
