interface Circle {
  circle(options?: {
    radius: number,
    x: number,
    y: number
  }, cb?: ImageCallback): this;
  circle(cb?: ImageCallback): this;
}
