#!/usr/bin/env node

const fs = require('fs');
const { normalize, join } = require('path');
const babel = require('babel-core');
const envify = require('envify/custom');
const UglifyJS = require('uglify-js');
const browserify = require('browserify');

function debug() {
    if (process.env.DEBUG) console.error(...arguments);
}

const root = normalize(join(__dirname, '..'));
function fromRoot(subPath) {
    return normalize(join(root, subPath));
}

const licence =
    '/*\n' +
    'Jimp v' +
    process.env.npm_package_version +
    '\n' +
    'https://github.com/oliver-moran/jimp\n' +
    'Ported for the Web by Phil Seaton\n' +
    fs.readFileSync(fromRoot('LICENSE')) +
    '*/';

// Browserify and Babelize.
function bundle(files, config, callback) {
    if (typeof files === 'string') files = [files];
    files = files.map(f => {
        return f[0] === '/' ? f : fromRoot(f); // ensure path.
    });
    console.error('Browserify ' + files.join(', ') + '...');
    config = Object.assign(
        {
            standalone: 'jimp',
            ignoreMissing: true,
            fullPaths: false,
            debug: true,
            paths: [root],
            basedir: root,
            transform: envify({ ENVIRONMENT: 'BROWSER' })
        },
        config
    );
    debug('browserify config:', config);
    const bundler = browserify(files, config).exclude(
        fromRoot('browser/lib/jimp.js')
    );
    config.exclude = config.exclude || [];
    for (let f, i = 0; (f = config.exclude[i]); i++) {
        bundler.exclude(fromRoot(f));
    }
    bundler.bundle((err, baseCode) => {
        if (err) return callback(err);
        console.error(
            'Babelize ' +
                files.map(f => f.replace(/.*\//, '')).join('+') +
                '...'
        );
        const result = babel.transform(
            "if ((typeof(window)=='undefined' || !window) " +
                "&& (typeof(self)!='undefined')) var window = self;\n" +
                baseCode.toString(),
            { presets: ['es2015', 'stage-0'] }
        );
        callback(null, result.code);
    });
}

function bundleSimple(files, config, callback) {
    bundle(files, config, (err, code) => {
        if (err) {
            const msg =
                "Can't bundle " + files.join(' + ') + '\nError: ' + err.message;
            callback('throw new Error(' + JSON.stringify(msg) + ');');
        } else {
            callback(code);
        }
    });
}

function minify(code) {
    console.error('Compressing...');

    return UglifyJS.minify(code, { warnings: false }).code;
}

if (!module.parent) {
    let config = process.argv[3];
    const cmd = process.argv[2] || 'prepublish';

    switch (cmd) {
        case 'test': {
            let baseFiles;
            if (config[0] === '{') {
                config = JSON.parse(config);
                baseFiles = process.argv.slice(4);
            } else {
                config = {};
                baseFiles = process.argv.slice(3);
            }
            if (baseFiles.length === 0) throw new Error('No file given.');
            bundle(baseFiles, config, (err, code) => {
                if (err) throw err;
                process.stdout.write(code);
                console.error('Done.');
            });
            break;
        }

        case 'prepublish':
            if (config) config = JSON.parse(config);
            else config = {};
            bundle('index.js', config, (err, code) => {
                if (err) throw err;
                fs.writeFile(
                    fromRoot('browser/lib/jimp.js'),
                    licence + '\n' + code,
                    err => {
                        if (err) throw err;
                        console.error('browserifyed jimp.js done.');
                    }
                );
                fs.writeFile(
                    fromRoot('browser/lib/jimp.min.js'),
                    licence + '\n' + minify(code),
                    err => {
                        if (err) throw err;
                        console.error('browserifyed jimp.min.js done.');
                    }
                );
            });
            break;

        case 'help': {
            const toolName = process.argv[1]
                .replace(root, './')
                .replace(/\/+/g, '/');
            console.warn(
                [
                    'Build Jimp or its modules for the browser environment.',
                    '',
                    'Usage:',
                    `  $ ${toolName} <command> [parameters]`,
                    '',
                    'Prepublish Command',
                    '==================',
                    '',
                    'Builds jimp and updates "browser/lib/jimp.js".',
                    'Usage:',
                    `  $ ${toolName} prepublish [JSON browserify configuration]`,
                    'Example:',
                    `  $ ${toolName} prepublish '{"basedir":"/other/path"}'`,
                    '',
                    'Test Command',
                    '============',
                    '',
                    'Builds a list of modules and output to STDOUT.',
                    'Usage:',
                    `  $ ${toolName} test [JSON browserify configuration] [file1 [file2 [...]]]`,
                    'Example:',
                    `  $ ${toolName} test '{"exclude":["index.js"]}' test/jgd.test.js`,
                    '',
                    'Set DEBUG env var to know the resulting configuration.'
                ].join('\n')
            );
            break;
        }

        default:
            throw new Error(
                `Unknown command given. Run "$ ${
                    process.argv[1]
                } help" for more inforation`
            );
    }
}

module.exports = { bundle, bundleSimple, minify };
