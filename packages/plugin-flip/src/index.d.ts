interface Flip {
  flip(horizontal: boolean, vertical: boolean, cb?: ImageCallback): this;
  mirror(horizontal: boolean, vertical: boolean, cb?: ImageCallback): this;
}
