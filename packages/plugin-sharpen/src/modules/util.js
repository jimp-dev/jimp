module.exports = {
  convolution: (
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
  ) => {
    const srcPixels = new Uint8ClampedArray(bitmap.data);
    const srcWidth = bitmap.width;
    const srcHeight = bitmap.height;
    const dstPixels = bitmap.data;

    divisor = divisor || 1;
    bias = bias || 0;

    // default true
    if (!preserveAlpha && preserveAlpha !== false) {
      preserveAlpha = true;
    }

    if (!clamp && clamp !== false) {
      clamp = true;
    }

    color = color || 0;
    alpha = alpha || 0;

    const cols = matrixY >> 1;
    const rows = matrixX >> 1;
    const clampG = (color >> 8) & 0xff;
    const clampB = color & 0xff;
    const clampA = alpha * 0xff;

    let index = 0;
    const clampR = (color >> 16) & 0xff;

    for (let y = 0; y < srcHeight; y += 1) {
      for (let x = 0; x < srcWidth; x += 1, index += 4) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let replace = false;
        let mIndex = 0;
        let v;

        for (let row = -rows; row <= rows; row += 1) {
          const rowIndex = y + row;
          let offset;

          if (rowIndex >= 0 && rowIndex < srcHeight) {
            offset = rowIndex * srcWidth;
          } else if (clamp) {
            offset = y * srcWidth;
          } else {
            replace = true;
          }

          for (let col = -cols; col <= cols; col += 1) {
            const m = matrix[mIndex++];

            if (m !== 0) {
              let colIndex = x + col;

              if (!(colIndex >= 0 && colIndex < srcWidth)) {
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
                const p = (offset + colIndex) << 2;
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
