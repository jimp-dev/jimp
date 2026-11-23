// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// JavaScript Image Resizer (c) 2012 - Grant Galitz
// Released to public domain 29 July 2013: https://github.com/grantgalitz/JS-Image-Resizer/issues/4

function Resize(
  widthOriginal,
  heightOriginal,
  targetWidth,
  targetHeight,
  blendAlpha,
  interpolationPass,
  resizeCallback
) {
  this.widthOriginal = Math.abs(Math.floor(widthOriginal) || 0);
  this.heightOriginal = Math.abs(Math.floor(heightOriginal) || 0);
  this.targetWidth = Math.abs(Math.floor(targetWidth) || 0);
  this.targetHeight = Math.abs(Math.floor(targetHeight) || 0);
  this.colorChannels = blendAlpha ? 4 : 3;
  this.interpolationPass = Boolean(interpolationPass);
  this.resizeCallback =
    typeof resizeCallback === "function" ? resizeCallback : function () {};

  this.targetWidthMultipliedByChannels = this.targetWidth * this.colorChannels;
  this.originalWidthMultipliedByChannels =
    this.widthOriginal * this.colorChannels;
  this.originalHeightMultipliedByChannels =
    this.heightOriginal * this.colorChannels;
  this.widthPassResultSize =
    this.targetWidthMultipliedByChannels * this.heightOriginal;
  this.finalResultSize =
    this.targetWidthMultipliedByChannels * this.targetHeight;
  this.initialize();
}

Resize.prototype.initialize = function () {
  // Perform some checks:
  if (
    this.widthOriginal > 0 &&
    this.heightOriginal > 0 &&
    this.targetWidth > 0 &&
    this.targetHeight > 0
  ) {
    this.configurePasses();
  } else {
    console.log(this);
    throw new Error("Invalid settings specified for the resizer.");
  }
};

Resize.prototype.configurePasses = function () {
  if (this.widthOriginal === this.targetWidth) {
    // Bypass the width resizer pass:
    this.resizeWidth = this.bypassResizer;
  } else {
    // Setup the width resizer pass:
    this.ratioWeightWidthPass = this.widthOriginal / this.targetWidth;
    if (this.ratioWeightWidthPass < 1 && this.interpolationPass) {
      this.initializeFirstPassBuffers(true);
      this.resizeWidth =
        this.colorChannels === 4
          ? this.resizeWidthInterpolatedRGBA
          : this.resizeWidthInterpolatedRGB;
    } else {
      this.initializeFirstPassBuffers(false);
      this.resizeWidth =
        this.colorChannels === 4 ? this.resizeWidthRGBA : this.resizeWidthRGB;
    }
  }

  if (this.heightOriginal === this.targetHeight) {
    // Bypass the height resizer pass:
    this.resizeHeight = this.bypassResizer;
  } else {
    // Setup the height resizer pass:
    this.ratioWeightHeightPass = this.heightOriginal / this.targetHeight;
    if (this.ratioWeightHeightPass < 1 && this.interpolationPass) {
      this.initializeSecondPassBuffers(true);
      this.resizeHeight = this.resizeHeightInterpolated;
    } else {
      this.initializeSecondPassBuffers(false);
      this.resizeHeight =
        this.colorChannels === 4 ? this.resizeHeightRGBA : this.resizeHeightRGB;
    }
  }
};

Resize.prototype._resizeWidthInterpolatedRGBChannels = function (
  buffer,
  fourthChannel
) {
  const channelsNum = fourthChannel ? 4 : 3;
  const ratioWeight = this.ratioWeightWidthPass;
  const outputBuffer = this.widthBuffer;

  let weight = 0;
  let finalOffset = 0;
  let pixelOffset = 0;
  let firstWeight = 0;
  let secondWeight = 0;
  let targetPosition;

  // Handle for only one interpolation input being valid for start calculation:
  for (
    targetPosition = 0;
    weight < 1 / 3;
    targetPosition += channelsNum, weight += ratioWeight
  ) {
    for (
      finalOffset = targetPosition, pixelOffset = 0;
      finalOffset < this.widthPassResultSize;
      pixelOffset += this.originalWidthMultipliedByChannels,
        finalOffset += this.targetWidthMultipliedByChannels
    ) {
      outputBuffer[finalOffset] = buffer[pixelOffset];
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
      if (fourthChannel)
        outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
    }
  }

  // Adjust for overshoot of the last pass's counter:
  weight -= 1 / 3;
  let interpolationWidthSourceReadStop;

  for (
    interpolationWidthSourceReadStop = this.widthOriginal - 1;
    weight < interpolationWidthSourceReadStop;
    targetPosition += channelsNum, weight += ratioWeight
  ) {
    // Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    // Interpolate:
    for (
      finalOffset = targetPosition,
        pixelOffset = Math.floor(weight) * channelsNum;
      finalOffset < this.widthPassResultSize;
      pixelOffset += this.originalWidthMultipliedByChannels,
        finalOffset += this.targetWidthMultipliedByChannels
    ) {
      outputBuffer[finalOffset + 0] =
        buffer[pixelOffset + 0] * firstWeight +
        buffer[pixelOffset + channelsNum + 0] * secondWeight;
      outputBuffer[finalOffset + 1] =
        buffer[pixelOffset + 1] * firstWeight +
        buffer[pixelOffset + channelsNum + 1] * secondWeight;
      outputBuffer[finalOffset + 2] =
        buffer[pixelOffset + 2] * firstWeight +
        buffer[pixelOffset + channelsNum + 2] * secondWeight;
      if (fourthChannel)
        outputBuffer[finalOffset + 3] =
          buffer[pixelOffset + 3] * firstWeight +
          buffer[pixelOffset + channelsNum + 3] * secondWeight;
    }
  }

  // Handle for only one interpolation input being valid for end calculation:
  for (
    interpolationWidthSourceReadStop =
      this.originalWidthMultipliedByChannels - channelsNum;
    targetPosition < this.targetWidthMultipliedByChannels;
    targetPosition += channelsNum
  ) {
    for (
      finalOffset = targetPosition,
        pixelOffset = interpolationWidthSourceReadStop;
      finalOffset < this.widthPassResultSize;
      pixelOffset += this.originalWidthMultipliedByChannels,
        finalOffset += this.targetWidthMultipliedByChannels
    ) {
      outputBuffer[finalOffset] = buffer[pixelOffset];
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
      if (fourthChannel)
        outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
    }
  }

  return outputBuffer;
};

Resize.prototype._resizeWidthRGBChannels = function (buffer, fourthChannel) {
  const channelsNum = fourthChannel ? 4 : 3;
  const ratioWeight = this.ratioWeightWidthPass;
  const ratioWeightDivisor = 1 / ratioWeight;
  const nextLineOffsetOriginalWidth =
    this.originalWidthMultipliedByChannels - channelsNum + 1;
  const nextLineOffsetTargetWidth =
    this.targetWidthMultipliedByChannels - channelsNum + 1;
  const output = this.outputWidthWorkBench;
  const outputBuffer = this.widthBuffer;

  let weight = 0;
  let amountToNext = 0;
  let actualPosition = 0;
  let currentPosition = 0;
  let line = 0;
  let pixelOffset = 0;
  let outputOffset = 0;
  let multiplier = 1;
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;

  do {
    for (line = 0; line < this.originalHeightMultipliedByChannels; ) {
      output[line++] = 0;
      output[line++] = 0;
      output[line++] = 0;
      if (fourthChannel) {
        output[line++] = 0;
      }
    }

    weight = ratioWeight;

    do {
      amountToNext = 1 + actualPosition - currentPosition;
      multiplier = Math.min(weight, amountToNext);
      for (
        line = 0, pixelOffset = actualPosition;
        line < this.originalHeightMultipliedByChannels;
        pixelOffset += nextLineOffsetOriginalWidth
      ) {
        r = buffer[pixelOffset];
        g = buffer[++pixelOffset];
        b = buffer[++pixelOffset];
        // RGB is premultiplied by alpha (see `resize` in ../index.ts), so
        // all channels are a plain weighted average
        output[line++] += r * multiplier;
        output[line++] += g * multiplier;
        output[line++] += b * multiplier;
        if (fourthChannel) {
          a = buffer[++pixelOffset];
          output[line++] += a * multiplier;
        }
      }

      if (weight >= amountToNext) {
        actualPosition += channelsNum;
        currentPosition = actualPosition;
        weight -= amountToNext;
      } else {
        currentPosition += weight;
        break;
      }
    } while (
      weight > 0 &&
      actualPosition < this.originalWidthMultipliedByChannels
    );

    for (
      line = 0, pixelOffset = outputOffset;
      line < this.originalHeightMultipliedByChannels;
      pixelOffset += nextLineOffsetTargetWidth
    ) {
      outputBuffer[pixelOffset] = output[line++] * ratioWeightDivisor;
      outputBuffer[++pixelOffset] = output[line++] * ratioWeightDivisor;
      outputBuffer[++pixelOffset] = output[line++] * ratioWeightDivisor;
      if (fourthChannel)
        outputBuffer[++pixelOffset] = output[line++] * ratioWeightDivisor;
    }

    outputOffset += channelsNum;
  } while (outputOffset < this.targetWidthMultipliedByChannels);

  return outputBuffer;
};

Resize.prototype._resizeHeightRGBChannels = function (buffer, fourthChannel) {
  const ratioWeight = this.ratioWeightHeightPass;
  const ratioWeightDivisor = 1 / ratioWeight;
  const output = this.outputHeightWorkBench;
  const outputBuffer = this.heightBuffer;

  let weight = 0;
  let amountToNext = 0;
  let actualPosition = 0;
  let currentPosition = 0;
  let pixelOffset = 0;
  let outputOffset = 0;
  let caret = 0;
  let multiplier = 1;
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;

  do {
    for (
      pixelOffset = 0;
      pixelOffset < this.targetWidthMultipliedByChannels;

    ) {
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;

      if (fourthChannel) {
        output[pixelOffset++] = 0;
      }
    }

    weight = ratioWeight;

    do {
      amountToNext = 1 + actualPosition - currentPosition;
      multiplier = Math.min(weight, amountToNext);
      caret = actualPosition;

      for (
        pixelOffset = 0;
        pixelOffset < this.targetWidthMultipliedByChannels;

      ) {
        r = buffer[caret++];
        g = buffer[caret++];
        b = buffer[caret++];
        // RGB is premultiplied by alpha, so this is a plain weighted average
        output[pixelOffset++] += r * multiplier;
        output[pixelOffset++] += g * multiplier;
        output[pixelOffset++] += b * multiplier;

        if (fourthChannel) {
          a = buffer[caret++];
          output[pixelOffset++] += a * multiplier;
        }
      }

      if (weight >= amountToNext) {
        actualPosition = caret;
        currentPosition = actualPosition;
        weight -= amountToNext;
      } else {
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.widthPassResultSize);

    for (
      pixelOffset = 0;
      pixelOffset < this.targetWidthMultipliedByChannels;

    ) {
      outputBuffer[outputOffset++] = Math.round(
        output[pixelOffset++] * ratioWeightDivisor
      );
      outputBuffer[outputOffset++] = Math.round(
        output[pixelOffset++] * ratioWeightDivisor
      );
      outputBuffer[outputOffset++] = Math.round(
        output[pixelOffset++] * ratioWeightDivisor
      );

      if (fourthChannel) {
        outputBuffer[outputOffset++] = Math.round(
          output[pixelOffset++] * ratioWeightDivisor
        );
      }
    }
  } while (outputOffset < this.finalResultSize);

  return outputBuffer;
};

Resize.prototype.resizeWidthInterpolatedRGB = function (buffer) {
  return this._resizeWidthInterpolatedRGBChannels(buffer, false);
};

Resize.prototype.resizeWidthInterpolatedRGBA = function (buffer) {
  return this._resizeWidthInterpolatedRGBChannels(buffer, true);
};

Resize.prototype.resizeWidthRGB = function (buffer) {
  return this._resizeWidthRGBChannels(buffer, false);
};

Resize.prototype.resizeWidthRGBA = function (buffer) {
  return this._resizeWidthRGBChannels(buffer, true);
};

Resize.prototype.resizeHeightInterpolated = function (buffer) {
  const ratioWeight = this.ratioWeightHeightPass;
  const outputBuffer = this.heightBuffer;

  let weight = 0;
  let finalOffset = 0;
  let pixelOffset = 0;
  let pixelOffsetAccumulated = 0;
  let pixelOffsetAccumulated2 = 0;
  let firstWeight = 0;
  let secondWeight = 0;
  let interpolationHeightSourceReadStop;

  // Handle for only one interpolation input being valid for start calculation:
  for (; weight < 1 / 3; weight += ratioWeight) {
    for (
      pixelOffset = 0;
      pixelOffset < this.targetWidthMultipliedByChannels;

    ) {
      outputBuffer[finalOffset++] = Math.round(buffer[pixelOffset++]);
    }
  }

  // Adjust for overshoot of the last pass's counter:
  weight -= 1 / 3;

  for (
    interpolationHeightSourceReadStop = this.heightOriginal - 1;
    weight < interpolationHeightSourceReadStop;
    weight += ratioWeight
  ) {
    // Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    // Interpolate:
    pixelOffsetAccumulated =
      Math.floor(weight) * this.targetWidthMultipliedByChannels;
    pixelOffsetAccumulated2 =
      pixelOffsetAccumulated + this.targetWidthMultipliedByChannels;
    for (
      pixelOffset = 0;
      pixelOffset < this.targetWidthMultipliedByChannels;
      ++pixelOffset
    ) {
      outputBuffer[finalOffset++] = Math.round(
        buffer[pixelOffsetAccumulated++] * firstWeight +
          buffer[pixelOffsetAccumulated2++] * secondWeight
      );
    }
  }

  // Handle for only one interpolation input being valid for end calculation:
  while (finalOffset < this.finalResultSize) {
    for (
      pixelOffset = 0,
        pixelOffsetAccumulated =
          interpolationHeightSourceReadStop *
          this.targetWidthMultipliedByChannels;
      pixelOffset < this.targetWidthMultipliedByChannels;
      ++pixelOffset
    ) {
      outputBuffer[finalOffset++] = Math.round(
        buffer[pixelOffsetAccumulated++]
      );
    }
  }

  return outputBuffer;
};

Resize.prototype.resizeHeightRGB = function (buffer) {
  return this._resizeHeightRGBChannels(buffer, false);
};

Resize.prototype.resizeHeightRGBA = function (buffer) {
  return this._resizeHeightRGBChannels(buffer, true);
};

Resize.prototype.resize = function (buffer) {
  this.resizeCallback(this.resizeHeight(this.resizeWidth(buffer)));
};

Resize.prototype.bypassResizer = function (buffer) {
  // Just return the buffer passed:
  return buffer;
};

Resize.prototype.initializeFirstPassBuffers = function (BILINEARAlgo) {
  // Initialize the internal width pass buffers:
  this.widthBuffer = this.generateFloatBuffer(this.widthPassResultSize);

  if (!BILINEARAlgo) {
    this.outputWidthWorkBench = this.generateFloatBuffer(
      this.originalHeightMultipliedByChannels
    );

  }
};

Resize.prototype.initializeSecondPassBuffers = function (BILINEARAlgo) {
  // Initialize the internal height pass buffers:
  this.heightBuffer = this.generateUint8Buffer(this.finalResultSize);

  if (!BILINEARAlgo) {
    this.outputHeightWorkBench = this.generateFloatBuffer(
      this.targetWidthMultipliedByChannels
    );

  }
};

Resize.prototype.generateFloatBuffer = function (bufferLength) {
  // Generate a float32 typed array buffer:
  try {
    return new Float32Array(bufferLength);
  } catch (error) {
    console.error(error);
    return [];
  }
};

Resize.prototype.generateUint8Buffer = function (bufferLength) {
  // Generate a uint8 typed array buffer:
  try {
    return new Uint8Array(bufferLength);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default Resize;
