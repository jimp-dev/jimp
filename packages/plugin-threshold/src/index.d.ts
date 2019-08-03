interface Threshold {
  threshold(opts: {
    max: number,
    replace?: number,
    autoGreyscale?: boolean
  }, cb?: ImageCallback): this;
}
