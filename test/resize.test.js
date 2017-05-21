var {Jimp, mkJGD, hashForEach} = require("./test-helper");

describe("Resize images", function () {

    var testImages = [
        {
            title: 'max contrast 8x8',
            src: Jimp.read(mkJGD(
                '■■■■□□□□',
                '■■■■□□□□',
                '■■■■□□□□',
                '■■■■□□□□',
                '□□□□■■■■',
                '□□□□■■■■',
                '□□□□■■■■',
                '□□□□■■■■'
            )),
            results: {
                'default 4x4': mkJGD(
                    '■■□□',
                    '■■□□',
                    '□□■■',
                    '□□■■'
                ),
                'NEAREST_NEIGHBOR 4x4': mkJGD(
                    '■■□□',
                    '■■□□',
                    '□□■■',
                    '□□■■'
                ),
                'BILINEAR 4x4': mkJGD(
                    '■■□□',
                    '■■□□',
                    '□□■■',
                    '□□■■'
                ),
                'BICUBIC 4x4': {
                    width: 4,
                    height: 4,
                    data: [
                        0x000000ff, 0x000000ff, 0xBFBFBFff, 0xFFFFFFff,
                        0x000000ff, 0x000000ff, 0xBFBFBFff, 0xFFFFFFff,
                        0xBFBFBFff, 0xBFBFBFff, 0x5F5F5Fff, 0x404040ff,
                        0xFFFFFFff, 0xFFFFFFff, 0x404040ff, 0x000000ff
                    ]
                },
                'HERMITE 4x4': {
                    width: 4,
                    height: 4,
                    data: [
                        0x000000ff, 0x000000ff, 0xC0C0C0ff, 0xFFFFFFff,
                        0x000000ff, 0x000000ff, 0xC0C0C0ff, 0xFFFFFFff,
                        0xC0C0C0ff, 0xC0C0C0ff, 0x606060ff, 0x404040ff,
                        0xFFFFFFff, 0xFFFFFFff, 0x404040ff, 0x000000ff
                    ]
                },
                'BEZIER 4x4': {
                    width: 4,
                    height: 4,
                    data: [
                        0x000000ff, 0x000000ff, 0xC0C0C0ff, 0xFFFFFFff,
                        0x000000ff, 0x000000ff, 0xC0C0C0ff, 0xFFFFFFff,
                        0xC0C0C0ff, 0xC0C0C0ff, 0x606060ff, 0x404040ff,
                        0xFFFFFFff, 0xFFFFFFff, 0x404040ff, 0x000000ff
                    ]
                },
                'default 5x2': mkJGD(
                    '■■▦□□',
                    '□□▦■■'
                ),
                'NEAREST_NEIGHBOR 5x2': mkJGD(
                    '■■■□□',
                    '□□□■■'
                ),
                'BILINEAR 5x2': mkJGD(
                    '■■3□□',
                    '□□C■■'
                ),
                'BICUBIC 5x2': {
                    width: 5,
                    height: 2,
                    data: [
                        0x000000ff, 0x000000ff, 0x000000ff, 0xFFFFFFff, 0xFFFFFFff,
                        0xDFDFDFff, 0xDFDFDFff, 0xDFDFDFff, 0x202020ff, 0x202020ff
                    ]
                },
                'HERMITE 5x2': {
                    width: 5,
                    height: 2,
                    data: [
                        0x000000ff, 0x000000ff, 0x000000ff, 0xFFFFFFff, 0xFFFFFFff,
                        0xDFDFDFff, 0xDFDFDFff, 0xDFDFDFff, 0x202020ff, 0x202020ff
                    ]
                },
                'BEZIER 5x2': {
                    width: 5,
                    height: 2,
                    data: [
                        0x000000ff, 0x000000ff, 0x000000ff, 0xFFFFFFff, 0xFFFFFFff,
                        0xDFDFDFff, 0xDFDFDFff, 0xDFDFDFff, 0x202020ff, 0x202020ff
                    ]
                }
            }
        },
        /**********************************************************************/
        {
            title: 'max contrast 12x12 with dots',
            src: Jimp.read(mkJGD(
                '■■■■■■□□□□□□',
                '■■■■■■□□□□□□',
                '■■■□■■□□■□□□',
                '■■■■■■□□□□□□',
                '■■■■■■□□□□□□',
                '■■■■■■□□□□□□',
                '□□□□□□■■■■■■',
                '□□□□□□■■■■■■',
                '□□□□□□■■■■■■',
                '□□□■□□■■□■■■',
                '□□□□□□■■■■■■',
                '□□□□□□■■■■■■'
            )),
            results: {
                'default 6x6': mkJGD(
                    '■■■□□□',
                    '■▩■□▥□',
                    '■■■□□□',
                    '□□□■■■',
                    '□▥□■▩■',
                    '□□□■■■'
                ),
                'NEAREST_NEIGHBOR 6x6': mkJGD(
                    '■■■□□□',
                    '■■■□■□',
                    '■■■□□□',
                    '□□□■■■',
                    '□□□■■■',
                    '□□□■■■'
                ),
                'BILINEAR 6x6': mkJGD(
                    '■■■□□□',
                    '■■■□■□',
                    '■■■□□□',
                    '□□□■■■',
                    '□□□■■■',
                    '□□□■■■'
                ),
                'BICUBIC 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x000000ff, 0x000000ff, 0x000000ff, 0xBFBFBFff, 0xFFFFFFff, 0xFFFFFFff,
                        0x000000ff, 0x474747ff, 0x202020ff, 0xBFBFBFff, 0x979797ff, 0xFFFFFFff,
                        0x000000ff, 0x000000ff, 0x000000ff, 0xBFBFBFff, 0xFFFFFFff, 0xFFFFFFff,
                        0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff, 0x5F5F5Fff, 0x404040ff, 0x404040ff,
                        0xFFFFFFff, 0xEEEEEEff, 0xF7F7F7ff, 0x404040ff, 0x181818ff, 0x000000ff,
                        0xFFFFFFff, 0xC9C9C9ff, 0xE6E6E6ff, 0x404040ff, 0x4E4E4Eff, 0x000000ff
                    ]
                },
                'HERMITE 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x000000ff, 0x000000ff, 0x000000ff, 0xC0C0C0ff, 0xFFFFFFff, 0xFFFFFFff,
                        0x000000ff, 0x404040ff, 0x191919ff, 0xC0C0C0ff, 0xA6A6A6ff, 0xFFFFFFff,
                        0x000000ff, 0x000000ff, 0x000000ff, 0xC0C0C0ff, 0xFFFFFFff, 0xFFFFFFff,
                        0xC0C0C0ff, 0xC0C0C0ff, 0xC0C0C0ff, 0x606060ff, 0x404040ff, 0x404040ff,
                        0xFFFFFFff, 0xF3F3F3ff, 0xFAFAFAff, 0x404040ff, 0x111111ff, 0x000000ff,
                        0xFFFFFFff, 0xCBCBCBff, 0xEBEBEBff, 0x404040ff, 0x484848ff, 0x000000ff
                    ]
                },
                'BEZIER 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x000000ff, 0x000000ff, 0x000000ff, 0xC0C0C0ff, 0xFFFFFFff, 0xFFFFFFff,
                        0x000000ff, 0x444444ff, 0x1D1D1Dff, 0xC0C0C0ff, 0x9F9F9Fff, 0xFFFFFFff,
                        0x000000ff, 0x000000ff, 0x000000ff, 0xC0C0C0ff, 0xFFFFFFff, 0xFFFFFFff,
                        0xC0C0C0ff, 0xC0C0C0ff, 0xC0C0C0ff, 0x606060ff, 0x404040ff, 0x404040ff,
                        0xFFFFFFff, 0xF0F0F0ff, 0xF9F9F9ff, 0x404040ff, 0x151515ff, 0x000000ff,
                        0xFFFFFFff, 0xCACACAff, 0xE9E9E9ff, 0x404040ff, 0x4B4B4Bff, 0x000000ff
                    ]
                }
            }
        },
        /**********************************************************************/
        {
            title: 'mutch contrast 4x4',
            src: Jimp.read(mkJGD(
                '▩▩▥▥',
                '▩▩▥▥',
                '▥▥▩▩',
                '▥▥▩▩'
            )),
            results: {
                'default 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x404040ff, 0x404040ff, 0x404040ff, 0x959595ff, 0xBFBFBFff, 0xBFBFBFff,
                        0x404040ff, 0x404040ff, 0x404040ff, 0x959595ff, 0xBFBFBFff, 0xBFBFBFff,
                        0x404040ff, 0x404040ff, 0x404040ff, 0x959595ff, 0xBFBFBFff, 0xBFBFBFff,
                        0x959595ff, 0x959595ff, 0x959595ff, 0x787878ff, 0x6A6A6Aff, 0x6A6A6Aff,
                        0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff, 0x6A6A6Aff, 0x404040ff, 0x404040ff,
                        0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff, 0x6A6A6Aff, 0x404040ff, 0x404040ff
                    ]
                },
                'NEAREST_NEIGHBOR 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x404040ff, 0x404040ff, 0x404040ff, 0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff,
                        0x404040ff, 0x404040ff, 0x404040ff, 0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff,
                        0x404040ff, 0x404040ff, 0x404040ff, 0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff,
                        0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff, 0x404040ff, 0x404040ff, 0x404040ff,
                        0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff, 0x404040ff, 0x404040ff, 0x404040ff,
                        0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff, 0x404040ff, 0x404040ff, 0x404040ff
                    ]
                },
                'BILINEAR 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x404040ff, 0x404040ff, 0x6A6A6Aff, 0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff,
                        0x404040ff, 0x404040ff, 0x6A6A6Aff, 0xBFBFBFff, 0xBFBFBFff, 0xBFBFBFff,
                        0x6A6A6Aff, 0x6A6A6Aff, 0x787878ff, 0x959595ff, 0x959595ff, 0x959595ff,
                        0xBFBFBFff, 0xBFBFBFff, 0x959595ff, 0x404040ff, 0x404040ff, 0x404040ff,
                        0xBFBFBFff, 0xBFBFBFff, 0x959595ff, 0x404040ff, 0x404040ff, 0x404040ff,
                        0xBFBFBFff, 0xBFBFBFff, 0x959595ff, 0x404040ff, 0x404040ff, 0x404040ff
                    ]
                },
                'BICUBIC 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x404040ff, 0x303030ff, 0x404040ff, 0x7F7F7Fff, 0xBFBFBFff, 0xCECECEff,
                        0x303030ff, 0x1C1C1Cff, 0x303030ff, 0x7F7F7Fff, 0xCECECEff, 0xE1E1E1ff,
                        0x404040ff, 0x303030ff, 0x404040ff, 0x7F7F7Fff, 0xBFBFBFff, 0xCECECEff,
                        0x7F7F7Fff, 0x7F7F7Fff, 0x7F7F7Fff, 0x7F7F7Fff, 0x7F7F7Fff, 0x7F7F7Fff,
                        0xBFBFBFff, 0xCECECEff, 0xBFBFBFff, 0x7F7F7Fff, 0x404040ff, 0x303030ff,
                        0xCECECEff, 0xE1E1E1ff, 0xCECECEff, 0x7F7F7Fff, 0x303030ff, 0x1C1C1Cff
                    ]
                },
                'HERMITE 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x404040ff, 0x383838ff, 0x404040ff, 0x808080ff, 0xBFBFBFff, 0xC7C7C7ff,
                        0x383838ff, 0x2F2F2Fff, 0x383838ff, 0x808080ff, 0xC7C7C7ff, 0xD0D0D0ff,
                        0x404040ff, 0x383838ff, 0x404040ff, 0x808080ff, 0xBFBFBFff, 0xC7C7C7ff,
                        0x808080ff, 0x808080ff, 0x808080ff, 0x808080ff, 0x808080ff, 0x808080ff,
                        0xBFBFBFff, 0xC7C7C7ff, 0xBFBFBFff, 0x808080ff, 0x404040ff, 0x383838ff,
                        0xC7C7C7ff, 0xD0D0D0ff, 0xC7C7C7ff, 0x808080ff, 0x383838ff, 0x2F2F2Fff
                    ]
                },
                'BEZIER 6x6': {
                    width: 6,
                    height: 6,
                    data: [
                        0x404040ff, 0x343434ff, 0x404040ff, 0x808080ff, 0xBFBFBFff, 0xCBCBCBff,
                        0x343434ff, 0x262626ff, 0x343434ff, 0x808080ff, 0xCBCBCBff, 0xD9D9D9ff,
                        0x404040ff, 0x343434ff, 0x404040ff, 0x808080ff, 0xBFBFBFff, 0xCBCBCBff,
                        0x808080ff, 0x808080ff, 0x808080ff, 0x808080ff, 0x808080ff, 0x808080ff,
                        0xBFBFBFff, 0xCBCBCBff, 0xBFBFBFff, 0x808080ff, 0x404040ff, 0x343434ff,
                        0xCBCBCBff, 0xD9D9D9ff, 0xCBCBCBff, 0x808080ff, 0x343434ff, 0x262626ff
                    ]
                }
            }
        }
    ];

    before((done)=> {
        var srcImgs = testImages.map((test)=> test.src);
        Promise.all(srcImgs).then((imgsJimp)=> {
            for (var i=0; i<imgsJimp.length; i++) {
                testImages[i].src = imgsJimp[i];
            }
            done();
        }).catch(done);
    });

    testImages.forEach((test)=> {
        describe(test.title, ()=> {
            hashForEach(test.results, (expectedTitle, expectedJgd)=> {
                var mode = Jimp['RESIZE_'+expectedTitle.split(' ')[0]];
                var size = expectedTitle.split(' ')[1].split('x').map((n)=> parseInt(n, 10));
                it('to '+expectedTitle, ()=> {
                    test.src.clone().resize(size[0], size[1], mode)
                        .getJGDSync().should.be.sameJGD(expectedJgd);
                });
            });
        })
    });

});
