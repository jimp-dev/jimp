#!/usr/bin/env node

var program = require('commander');
var resize = require('./resize');

program
	.version('0.0.1')
	.description('Image manipulation in JavaScript.');

program
	.command('resize <image> <sizes...>')
	.alias('r')
	.description('Resize an image')
	.option('-c --crop', 'Hard crop an image to the specified sizes')
	.option('-f --fill', 'Image will be stretched to specified sizes')
	.option('-o --out-file <name>', 'Name of the output file. Size strings will be appended to this file name')
	.option('-d --out-dir <dir>', 'Path to the output directory')
	.action(resize);

program.parse(process.argv);
