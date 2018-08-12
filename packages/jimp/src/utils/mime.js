const mimeTypes = {
    'image/bmp': ['bmp'],
    'image/gif': ['gif'],
    'image/jpeg': ['jpeg', 'jpg', 'jpe'],
    'image/png': ['png'],
    'image/tiff': ['tiff', 'tif']
};

const findType = extension =>
    Object.entries(mimeTypes).find(type => type[1].includes(extension)) || [];

/**
 * Lookup a mime type based on extension
 * @param {string} path path to find extension for
 * @returns {string} mime found mime type
 */
export const getType = path => {
    const pathParts = path.split('/').slice(-1);
    const extension = pathParts[pathParts.length - 1].split('.')[1];
    const type = findType(extension);

    return type[0];
};

/**
 * Return file extension associated with a mime type
 * @param {string} type mime type to look up
 * @returns {string} extension file extension
 */
export const getExtension = type => (mimeTypes[type.toLowerCase()] || [])[0];
