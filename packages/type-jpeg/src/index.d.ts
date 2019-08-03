interface Jpeg {
    MIME_JPEG: 'image/jpeg';
    _quality: number;
    quality: (n: number, cb?: ImageCallback) => this;
}
