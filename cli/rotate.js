var Jimp = require('../index');
var utils = require('./utils');

/**
 * Rotate a given image
 * to the specified
 * degrees
 *
 * @param src
 * @param deg
 * @param options
 */
module.exports = function rotate(src, deg, options) {
	var rotation = Number(deg);
	if (isNaN(rotation)) {
		throw new TypeError('Jimp rotate expects rotation degrees to be a number. "' + deg + '" given');
	}

	var getOutputFile = utils.getOutputFileGenerator(src, options);

	new Jimp(src, function (err, image) {
		if (err) {
			throw err;
		}

		image
			.rotate(rotation)
			.write(getOutputFile(src, ['rotated', rotation]));

		console.log('Image %s rotated %d degrees', src, rotation);
	});
};
