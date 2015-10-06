#!/usr/bin/env node

var program = require('commander');
var resize = require('./resize');
var rotate = require('./rotate');

program
	.version('0.0.1')
	.description('Image manipulation in JavaScript.')
	.option('-o --out-file <name>', 'Name of the output file. Size strings will be appended to this file name')
	.option('-d --out-dir <dir>', 'Path to the output directory');

program
	.command('resize <image> <sizes...>')
	.alias('rs')
	.description('Resize an image')
	.option('-c --crop', 'Hard crop an image to the specified sizes')
	.option('-f --fill', 'Image will be stretched to specified sizes')
	.action(resize);

program
	.command('rotate <image> <deg>')
	.alias('ro')
	.description('Rotate an image')
	.action(rotate);

program.parse(process.argv);
