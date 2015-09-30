var path = require('path');
var Jimp = require('../index');


/**
 * Get a valid mode
 * given an alias
 *
 * @param alias
 * @returns {string|string|string|*|number}
 */
function getMode(alias) {
	var modes = [
		{ mode: 'contain', aliases: ['contain', 'cn']   },
		{ mode: 'cover',   aliases: ['cover', 'crop', 'cr', 'c'] },
		{ mode: 'resize',  aliases: ['resize', 'fill', 'fl', 'f'] }
	];

	return modes.reduce(function (output, mode) {
		return output || (mode.aliases.indexOf(alias) !== -1 && mode.mode);
	}, false);
}


/**
 * Parse the sizes options
 * into usable sizes
 *
 * @param sizes
 * @param defaultMode
 * @returns {Array.<T>}
 */
function parseSizes(sizes, defaultMode) {
	return sizes
		.map(function (size) {
			var matches = size.match(/^([a-z]+)?(\d+)(?:x(\d+))?$/);
			var mode = matches[1] || defaultMode;

			return matches && {
					mode: getMode(mode),
					width: parseInt(matches[2], 10),
					height: parseInt(matches[3] || matches[2], 10)
				};
		})
		.filter(function (size) {
			return size && size.mode && size.width && size.height;
		});
}


/**
 * Resize/contain/crop
 * a given image to the
 * specified sizes
 *
 * @param image
 * @param sizes
 * @param options
 */
module.exports = function resize(image, sizes, options) {
	if (options.crop && options.fill) {
		throw new Error('Image resize cannot have both the crop and fill flags set');
	}

	var defaultMode = (options.crop && 'crop')
		|| (options.fill && 'fill')
		|| 'contain';

	var validSizes = parseSizes(sizes, defaultMode);
	if (!validSizes.length) {
		throw new Error('Image resize rules were not valid');
	}

	new Jimp(image, function (err, img) {
		if (err) {
			throw (err);
		}

		var extension = path.extname(image);
		var outputBasename = options.outFile
			|| path.basename(image, extension);

		var outputDirectory = options.outDir
			? options.outDir + '/'
			: '';

		validSizes.forEach(function (size) {
			if (typeof img[size.mode] === 'function') {
				var outputFile = [
					outputDirectory + outputBasename,
					size.mode,
					size.width + 'x' + size.height + extension
				].join('-');

				img.clone()[size.mode](size.width, size.height)
					.write(outputFile);
			}
		});

		console.log('Image %s resized to the following size configurations:', image);
		validSizes.forEach(function (size) {
			console.log(
				'mode', size.mode,
				'width', size.width,
				'height', size.height
			);
		});
	});
};
