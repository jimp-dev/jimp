#!/usr/bin/env node

const fs = require('fs');
const { normalize, join } = require('path');
const envify = require('envify/custom');
const UglifyJS = require('uglify-js');
const browserify = require('browserify');
const babelify = require('babelify');
const tfilter = require('tfilter');

function debug(...args) {
  if (process.env.DEBUG) {
    console.error(...args);
  }
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
  fs.readFileSync(fromRoot('../../LICENSE')) +
  '*/';

// Browserify and Babelize.

function minify(code) {
  console.error('Compressing...');

  return UglifyJS.minify(code, { warnings: false }).code;
}

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
      debug:
        process.env.BABEL_ENV === 'development' ||
        process.env.BABEL_ENV === 'test',
      paths: [root],
      basedir: root
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

  bundler
    .transform(babelify)
    .transform(
      tfilter(babelify, { include: '**/node_modules/file-type/*.js' }),
      { presets: ['@babel/env'], global: true }
    )
    .transform(envify({ ENVIRONMENT: 'BROWSER', DIRNAME: 'browser/lib/' }), {
      global: true
    })
    .bundle((err, baseCode) => {
      if (err) return callback(err);

      callback(
        null,
        "if ((typeof(window)=='undefined' || !window) " +
          "&& (typeof(self)!='undefined')) var window = self;\n" +
          baseCode
      );
    });
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
      bundle('src/index.js', config, (err, code) => {
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
      const toolName = process.argv[1].replace(root, './').replace(/\/+/g, '/');
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
        } help" for more information`
      );
  }
}

module.exports = { bundle };
