interface PNG {
    _deflateLevel: number,
    _deflateStrategy: number,
    _filterType: number,
    _colorType: number,
    deflateLevel(l: number, cb?: ImageCallback): this;
    deflateStrategy(s: number, cb?: ImageCallback): this;
    filterType(f: number, cb?: ImageCallback): this;
    colorType(s: number, cb?: ImageCallback): this;

  MIME_PNG: 'image/png';

  // PNG filter types
  PNG_FILTER_AUTO: -1;
  PNG_FILTER_NONE: 0;
  PNG_FILTER_SUB: 1;
  PNG_FILTER_UP: 2;
  PNG_FILTER_AVERAGE: 3;
  PNG_FILTER_PATH: 4;
}
