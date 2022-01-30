module.exports = {
  Convolution: function(
    bitmap,
    matrixX,
    matrixY,
    matrix,
    divisor,
    bias,
    preserveAlpha,
    clamp,
    color,
    alpha
  ) {
    var srcPixels = new Uint8ClampedArray(bitmap.data),
      srcWidth = bitmap.width,
      srcHeight = bitmap.height,
      dstPixels = bitmap.data;

    divisor = divisor || 1;
    bias = bias || 0;

    // default true
    preserveAlpha !== false && (preserveAlpha = true);
    clamp !== false && (clamp = true);

    color = color || 0;
    alpha = alpha || 0;

    var index = 0,
      rows = matrixX >> 1,
      cols = matrixY >> 1,
      clampR = (color >> 16) & 0xff,
      clampG = (color >> 8) & 0xff,
      clampB = color & 0xff,
      clampA = alpha * 0xff;

    for (var y = 0; y < srcHeight; y += 1) {
      for (var x = 0; x < srcWidth; x += 1, index += 4) {
        var r = 0,
          g = 0,
          b = 0,
          a = 0,
          replace = false,
          mIndex = 0,
          v;

        for (var row = -rows; row <= rows; row += 1) {
          var rowIndex = y + row,
            offset;

          if (0 <= rowIndex && rowIndex < srcHeight) {
            offset = rowIndex * srcWidth;
          } else if (clamp) {
            offset = y * srcWidth;
          } else {
            replace = true;
          }

          for (var col = -cols; col <= cols; col += 1) {
            var m = matrix[mIndex++];

            if (m !== 0) {
              var colIndex = x + col;

              if (!(0 <= colIndex && colIndex < srcWidth)) {
                if (clamp) {
                  colIndex = x;
                } else {
                  replace = true;
                }
              }

              if (replace) {
                r += m * clampR;
                g += m * clampG;
                b += m * clampB;
                a += m * clampA;
              } else {
                var p = (offset + colIndex) << 2;
                r += m * srcPixels[p];
                g += m * srcPixels[p + 1];
                b += m * srcPixels[p + 2];
                a += m * srcPixels[p + 3];
              }
            }
          }
        }

        dstPixels[index] =
          (v = r / divisor + bias) > 255 ? 255 : v < 0 ? 0 : v | 0;
        dstPixels[index + 1] =
          (v = g / divisor + bias) > 255 ? 255 : v < 0 ? 0 : v | 0;
        dstPixels[index + 2] =
          (v = b / divisor + bias) > 255 ? 255 : v < 0 ? 0 : v | 0;
        dstPixels[index + 3] = preserveAlpha
          ? srcPixels[index + 3]
          : (v = a / divisor + bias) > 255
          ? 255
          : v < 0
          ? 0
          : v | 0;
      }
    }
  }
};
