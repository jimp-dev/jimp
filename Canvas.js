/*
ctx.beginPath()
ctx.strokeStyle = 0x00000040// '#ffffff'
ctx.moveTo(20,20)
ctx.lineTo(200,20)
ctx.stroke()
*/

// TODO: Make it native arrays!!!
// TODO: Make Errors handling!!!
// TODO: Make JSDocs!!!
// ...

// utils

var _fillColor = function(jimp, color)
{
  return function(x, y, offset)
  {
    jimp.bitmap.data.writeUInt32BE(color, offset, true);
  }
};



// Class

var Canvas = function(jimp, type)
{
  this.jimp = jimp
  this.type = type

  // TODO: strokeStyle setter via defineProperty ...
}


Canvas.prototype.beginPath = function()
{
  this.contour = []
  this.cursor  = []
}

// ---

Canvas.prototype.moveTo = function(x, y)
{
  this.cursor = [x, y]
}

// ---

Canvas.prototype.lineTo = function(x, y)
{
  var new_point = [x, y],
      last_node = this.contour[this.contour.length-1]

  // Push first cursor. Don't duplicate nodes. Straight way check.
  if(!last_node || !(this.cursor[0] == last_node[0] && this.cursor[1] == last_node[1]))
    this.contour.push(this.cursor)

  this.contour.push(new_point)

  // slice to remove sync with the cursor.
  this.cursor = new_point.slice()
}

// ---
// scan = function (x, y, w, h, f, cb)
Canvas.prototype.stroke = function()
{
  var fillColor, i, inc, cors, x, x0, y0, x1, y1, f, tn

  // Defaults
  this.strokeStyle = this.strokeStyle || 3977526783

  fillColor = _fillColor(this.jimp, this.strokeStyle)

  f = function(tn, y0, x)
  {
    return Math.round(tn*x + y0)
  }

  // TODO: NO SCAN!!!
  for(i in this.contour)
  {
    i = +i
    // end
    if(!this.contour[i+1]) break;
    // this node
    x0 = this.contour[i][0] | 0
    y0 = this.contour[i][1] | 0
    // next node
    x1 = this.contour[i+1][0] | 0
    y1 = this.contour[i+1][1] | 0
    // Tangent
    tn = (y1-y0) / (x1-x0)
    // Filling loop
    // TODO: make it more robust for long y scale and/or import some nice algorythm.
    for( (inc = x0<=x1 ? 1 : -1), x=x0; x!=x1; x+=inc)
      this.jimp.scan(x, f(tn, y0, x-x0), 1, 1, fillColor)
  }
}




// -----------------------------

module.exports = Canvas
