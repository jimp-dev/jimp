interface Print {
  measureText(font: Font, text: PrintableText): number;
  measureTextHeight(font: Font, text: PrintableText, maxWidth: number): number;

  // Font locations
  FONT_SANS_8_BLACK: string;
  FONT_SANS_10_BLACK: string;
  FONT_SANS_12_BLACK: string;
  FONT_SANS_14_BLACK: string;
  FONT_SANS_16_BLACK: string;
  FONT_SANS_32_BLACK: string;
  FONT_SANS_64_BLACK: string;
  FONT_SANS_128_BLACK: string;

  FONT_SANS_8_WHITE: string;
  FONT_SANS_16_WHITE: string;
  FONT_SANS_32_WHITE: string;
  FONT_SANS_64_WHITE: string;
  FONT_SANS_128_WHITE: string;

  loadFont(file: string): Promise<Font>;
  loadFont(file: string, cb: GenericCallback<Font, any, any>): Promise<never>;

  // Text methods
  print(
    font: Font,
    x: number,
    y: number,
    text: PrintableText,
    cb?: ImageCallback
  ): this;
  print(
    font: Font,
    x: number,
    y: number,
    text: PrintableText,
    maxWidth?: number,
    cb?: ImageCallback
  ): this;
  print(
    font: Font,
    x: number,
    y: number,
    text: PrintableText,
    maxWidth?: number,
    maxHeight?: number,
    cb?: ImageCallback
  ): this;
}
