interface Fisheye {
  fishEye(opts?: { r: number }, cb?: ImageCallback): this;
  fishEye(cb?: ImageCallback): this;
}
