export function isNodePattern(cb) {
    if (typeof cb === 'undefined') {
        return false;
    }

    if (typeof cb !== 'function') {
        throw new TypeError('Callback must be a function');
    }

    return true;
}

export function throwError(error, cb) {
    if (typeof error === 'string') {
        error = new Error(error);
    }

    if (typeof cb === 'function') {
        return cb.call(this, error);
    }

    throw error;
}
