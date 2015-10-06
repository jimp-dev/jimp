var path = require('path');

module.exports = {

	/**
	 * Get an output file
	 * generator
	 *
	 * @param src string
	 * @param options object
	 * @returns {Function}
	 */
	getOutputFileGenerator: function (src, options) {
		var outFile = options.outFile && path.parse(options.outFile);
		var outDir = options.outDir || '';

		if (outFile) {
			outDir = path.join(outDir, outFile.dir);
		}

		/**
		 * Get the output file
		 * to write to
		 *
		 * @param file string
		 * @param extras array
		 * @returns string
		 */
		return function getOutputFile(file, extras) {
			var filePath = path.parse(file);

			var name = [(outFile && outFile.base) || filePath.name]
				.concat(extras)
				.join('-');

			return path.format({
				dir: outDir,
				base: name + filePath.ext
			});
		}
	}
};
