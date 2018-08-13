let chars = 0;

export function log(msg) {
    clear();

    if (typeof process !== 'undefined' && process && process.stdout) {
        process.stdout.write(msg);
    } else if (typeof console !== 'undefined' && console) {
        console.warn('Jimp', msg);
    }

    chars = msg.length;
}

export function clear() {
    if (process && process.stdout) {
        while (chars-- > 0) {
            process.stdout.write('\b');
        }
    }
}
