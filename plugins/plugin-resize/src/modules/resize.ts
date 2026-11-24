// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// Ported code that resets its loop state up front
/* eslint-disable no-useless-assignment */

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
      this.initializeFirstPassBuffers();
      this.resizeWidth =
        this.colorChannels === 4
          ? this.resizeWidthInterpolatedRGBA
          : this.resizeWidthInterpolatedRGB;
    } else {
      this.initializeFirstPassBuffers();
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
  const targetWidth = this.targetWidth;

  // Work out the source pixel, the offset to the next one and the weights of
  // both for each target column. They are the same for every line, so the
  // lines can then be resized one at a time
  const pixelOffsets = new Int32Array(targetWidth);
  const nextOffsets = new Int32Array(targetWidth);
  const firstWeights = new Float64Array(targetWidth).fill(1);
  const secondWeights = new Float64Array(targetWidth);

  let weight = 0;
  let column = 0;

  // Handle for only one interpolation input being valid for start calculation:
  for (; weight < 1 / 3; column++, weight += ratioWeight) {
    pixelOffsets[column] = 0;
  }

  // Adjust for overshoot of the last pass's counter:
  weight -= 1 / 3;

  for (
    const interpolationWidthSourceReadStop = this.widthOriginal - 1;
    weight < interpolationWidthSourceReadStop;
    column++, weight += ratioWeight
  ) {
    // Calculate weightings:
    secondWeights[column] = weight % 1;
    firstWeights[column] = 1 - secondWeights[column];
    pixelOffsets[column] = Math.floor(weight) * channelsNum;
    nextOffsets[column] = channelsNum;
  }

  // Handle for only one interpolation input being valid for end calculation:
  for (; column < targetWidth; column++) {
    pixelOffsets[column] =
      this.originalWidthMultipliedByChannels - channelsNum;
  }

  // Interpolate (a single input is read twice, with weights 1 and 0):
  for (
    let lineOffset = 0, finalOffset = 0;
    finalOffset < this.widthPassResultSize;
    lineOffset += this.originalWidthMultipliedByChannels
  ) {
    for (column = 0; column < targetWidth; column++) {
      const pixelOffset = lineOffset + pixelOffsets[column];
      const nextOffset = pixelOffset + nextOffsets[column];
      const firstWeight = firstWeights[column];
      const secondWeight = secondWeights[column];

      outputBuffer[finalOffset++] =
        buffer[pixelOffset] * firstWeight + buffer[nextOffset] * secondWeight;
      outputBuffer[finalOffset++] =
        buffer[pixelOffset + 1] * firstWeight +
        buffer[nextOffset + 1] * secondWeight;
      outputBuffer[finalOffset++] =
        buffer[pixelOffset + 2] * firstWeight +
        buffer[nextOffset + 2] * secondWeight;
      if (fourthChannel)
        outputBuffer[finalOffset++] =
          buffer[pixelOffset + 3] * firstWeight +
          buffer[nextOffset + 3] * secondWeight;
    }
  }

  return outputBuffer;
};

Resize.prototype._resizeWidthRGBChannels = function (buffer, fourthChannel) {
  const channelsNum = fourthChannel ? 4 : 3;
  const ratioWeight = this.ratioWeightWidthPass;
  const ratioWeightDivisor = 1 / ratioWeight;
  const outputBuffer = this.widthBuffer;

  // Work out which source pixels, and how much of each, make up each target
  // column. They are the same for every line, so the lines can then be
  // resized one at a time
  const pixelOffsets = [];
  const multipliers = [];
  const columnEnds = new Int32Array(this.targetWidth);

  let weight = 0;
  let amountToNext = 0;
  let actualPosition = 0;
  let currentPosition = 0;
  let outputOffset = 0;
  let column = 0;

  do {
    weight = ratioWeight;

    do {
      amountToNext = 1 + actualPosition - currentPosition;
      pixelOffsets.push(actualPosition);
      multipliers.push(Math.min(weight, amountToNext));

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

    columnEnds[column++] = pixelOffsets.length;
    outputOffset += channelsNum;
  } while (outputOffset < this.targetWidthMultipliedByChannels);

  for (
    let lineOffset = 0, finalOffset = 0;
    finalOffset < this.widthPassResultSize;
    lineOffset += this.originalWidthMultipliedByChannels
  ) {
    for (let column = 0, n = 0; column < columnEnds.length; column++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (; n < columnEnds[column]; n++) {
        const pixelOffset = lineOffset + pixelOffsets[n];
        const multiplier = multipliers[n];
        // RGB is premultiplied by alpha (see `resize` in ../index.ts), so
        // all channels are a plain weighted average. Each sum is rounded to a
        // float like the Float32Array it used to be kept in
        r = Math.fround(r + buffer[pixelOffset] * multiplier);
        g = Math.fround(g + buffer[pixelOffset + 1] * multiplier);
        b = Math.fround(b + buffer[pixelOffset + 2] * multiplier);
        if (fourthChannel) {
          a = Math.fround(a + buffer[pixelOffset + 3] * multiplier);
        }
      }

      outputBuffer[finalOffset++] = r * ratioWeightDivisor;
      outputBuffer[finalOffset++] = g * ratioWeightDivisor;
      outputBuffer[finalOffset++] = b * ratioWeightDivisor;
      if (fourthChannel) outputBuffer[finalOffset++] = a * ratioWeightDivisor;
    }
  }

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

Resize.prototype.initializeFirstPassBuffers = function () {
  // Initialize the internal width pass buffer:
  this.widthBuffer = this.generateFloatBuffer(this.widthPassResultSize);
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
