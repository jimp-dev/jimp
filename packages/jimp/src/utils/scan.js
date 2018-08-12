export default function scan(image, x, y, w, h, f) {
    // round input
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    for (let _y = y; _y < y + h; _y++) {
        for (let _x = x; _x < x + w; _x++) {
            const idx = (image.bitmap.width * _y + _x) << 2;
            f.call(image, _x, _y, idx);
        }
    }

    return image;
}
