import { isNodePattern, throwError } from '../utils/error-checking';
import * as constants from '../constants';

function measureText(font, text) {
    let x = 0;

    for (let i = 0; i < text.length; i++) {
        if (font.chars[text[i]]) {
            x +=
                font.chars[text[i]].xoffset +
                (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]]
                    ? font.kernings[text[i]][text[i + 1]]
                    : 0) +
                (font.chars[text[i]].xadvance || 0);
        }
    }

    return x;
}

function measureTextHeight(font, text, maxWidth) {
    const words = text.split(' ');
    let line = '';
    let textTotalHeight = font.common.lineHeight;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = measureText(font, testLine);

        if (testWidth > maxWidth && n > 0) {
            textTotalHeight += font.common.lineHeight;
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }

    return textTotalHeight;
}

function xOffsetBasedOnAlignment(font, line, maxWidth, alignment) {
    if (alignment === constants.HORIZONTAL_ALIGN_LEFT) {
        return 0;
    }

    if (alignment === constants.HORIZONTAL_ALIGN_CENTER) {
        return (maxWidth - measureText(font, line)) / 2;
    }

    return maxWidth - measureText(font, line);
}

function drawCharacter(image, font, x, y, char) {
    if (char.width > 0 && char.height > 0) {
        let imageChar = char.image;

        if (!imageChar) {
            imageChar = font.pages[char.page]
                .cloneQuiet()
                .crop(char.x, char.y, char.width, char.height);
            char.image = imageChar;
        }

        return image.composite(imageChar, x + char.xoffset, y + char.yoffset);
    }

    return image;
}

function printText(font, x, y, text, defaultCharWidth) {
    for (let i = 0; i < text.length; i++) {
        let char;

        if (font.chars[text[i]]) {
            char = text[i];
        } else if (/\s/.test(text[i])) {
            char = '';
        } else {
            char = '?';
        }

        const fontChar = font.chars[char] || {};
        const fontKerning = font.kernings[char];

        drawCharacter(this, font, x, y, fontChar || {});

        x +=
            (fontKerning && fontKerning[text[i + 1]]
                ? fontKerning[text[i + 1]]
                : 0) + (fontChar.xadvance || defaultCharWidth);
    }
}

/**
 * Draws a text on a image on a given boundary
 * @param {Jimp} font a bitmap font loaded from `Jimp.loadFont` command
 * @param {number} x the x position to start drawing the text
 * @param {number} y the y position to start drawing the text
 * @param {string} text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
 * @param {number} maxWidth (optional) the boundary width to draw in
 * @param {number} maxHeight (optional) the boundary height to draw in
 * @param {function(Error, Jimp)} cb (optional) a function to call when the text is written
 * @returns {Jimp} this for chaining of methods
 */
export function print(font, x, y, text, maxWidth, maxHeight, cb) {
    if (typeof maxWidth === 'function' && typeof cb === 'undefined') {
        cb = maxWidth;
        maxWidth = Infinity;
    }

    if (typeof maxWidth === 'undefined') {
        maxWidth = Infinity;
    }

    if (typeof maxHeight === 'function' && typeof cb === 'undefined') {
        cb = maxHeight;
        maxWidth = Infinity;
    }

    if (typeof maxHeight === 'undefined') {
        maxHeight = Infinity;
    }

    if (typeof font !== 'object') {
        return throwError.call(this, 'font must be a Jimp loadFont', cb);
    }

    if (
        typeof x !== 'number' ||
        typeof y !== 'number' ||
        typeof maxWidth !== 'number'
    ) {
        return throwError.call(this, 'x, y and maxWidth must be numbers', cb);
    }

    if (typeof text !== 'string' && typeof text !== 'object') {
        return throwError.call(this, 'text must be a string or an object', cb);
    }

    if (typeof maxWidth !== 'number') {
        return throwError.call(this, 'maxWidth must be a number', cb);
    }

    if (typeof maxHeight !== 'number') {
        return throwError.call(this, 'maxHeight must be a number', cb);
    }

    let alignmentX;
    let alignmentY;

    if (typeof text === 'object') {
        alignmentX = text.alignmentX || constants.HORIZONTAL_ALIGN_LEFT;
        alignmentY = text.alignmentY || constants.VERTICAL_ALIGN_TOP;
        ({ text } = text);
    } else {
        alignmentX = constants.HORIZONTAL_ALIGN_LEFT;
        alignmentY = constants.VERTICAL_ALIGN_TOP;
    }

    if (
        maxHeight !== Infinity &&
        alignmentY === constants.VERTICAL_ALIGN_BOTTOM
    ) {
        y = maxHeight - measureTextHeight(font, text, maxWidth);
    } else if (
        maxHeight !== Infinity &&
        alignmentY === constants.VERTICAL_ALIGN_MIDDLE
    ) {
        y = maxHeight / 2 - measureTextHeight(font, text, maxWidth) / 2;
    }

    const words = text.split(' ');
    let line = '';
    const defaultCharWidth = font.chars[0].xadvance;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = measureText(font, testLine);

        if (testWidth > maxWidth && n > 0) {
            this.print(
                font,
                x + xOffsetBasedOnAlignment(font, line, maxWidth, alignmentX),
                y,
                line
            );
            line = words[n] + ' ';
            y += font.common.lineHeight;
        } else {
            line = testLine;
        }
    }

    printText.call(
        this,
        font,
        x + xOffsetBasedOnAlignment(font, line, maxWidth, alignmentX),
        y,
        line,
        defaultCharWidth
    );

    if (isNodePattern(cb)) {
        cb.call(this, null, this);
    }

    return this;
}
