var Jimp = require("../index.js");

var lenna = new Jimp("lenna.png", function (err, image)
{
    var ctx = this.canvas('2d')

    ctx.beginPath()
    // ctx.strokeStyle = 0x00000040// '#ffffff'
    ctx.moveTo(50,  100)
    ctx.lineTo(200, 100)
    ctx.lineTo(125,  20)
    ctx.lineTo(50, 100)
    ctx.stroke()

    this.write("./output/lenna-line.jpg")
})
