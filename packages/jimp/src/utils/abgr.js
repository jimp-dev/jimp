import scan from './scan';

export function toAGBR(image) {
    return scan(image, 0, 0, image.bitmap.width, image.bitmap.height, function(
        x,
        y,
        index
    ) {
        const red = this.bitmap.data[index + 0];
        const green = this.bitmap.data[index + 1];
        const blue = this.bitmap.data[index + 2];
        const alpha = this.bitmap.data[index + 3];

        this.bitmap.data[index + 0] = alpha;
        this.bitmap.data[index + 1] = blue;
        this.bitmap.data[index + 2] = green;
        this.bitmap.data[index + 3] = red;
    });
}

export function fromAGBR(image) {
    return scan(image, 0, 0, image.bitmap.width, image.bitmap.height, function(
        x,
        y,
        index
    ) {
        const alpha = this.bitmap.data[index + 0];
        const blue = this.bitmap.data[index + 1];
        const green = this.bitmap.data[index + 2];
        const red = this.bitmap.data[index + 3];

        this.bitmap.data[index + 0] = red;
        this.bitmap.data[index + 1] = green;
        this.bitmap.data[index + 2] = blue;
        this.bitmap.data[index + 3] = image.bitmap.is_with_alpha ? alpha : 0xff;
    });
}
