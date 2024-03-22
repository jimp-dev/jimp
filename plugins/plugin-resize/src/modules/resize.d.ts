export default class Resize {
  constructor(
    widthOriginal: number,
    heightOriginal: number,
    targetWidth: number,
    targetHeight: number,
    blendAlpha: boolean,
    interpolationPass: boolean,
    resizeCallback: (buffer: Buffer) => void,
  );
  resize(buffer: Buffer): void;
}
