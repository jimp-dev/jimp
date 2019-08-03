interface Circle {
  circle(options?: {
    radius: number,
    x: number,
    y: number
  }, cb?: ImageCallback): this;
}
