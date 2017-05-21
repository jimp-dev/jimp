#!/usr/bin/env node

var fs = require('fs');
var {normalize, join} = require('path');
var babel = require("babel-core");
var envify = require('envify/custom');
var UglifyJS = require("uglify-js");
var browserify = require("browserify");

function debug () {
    if (process.env.DEBUG) console.error(...arguments);
}

var root = normalize(join(__dirname, ".."));
function fromRoot (subPath) {
    return normalize(join(root, subPath));
}

var licence = "/*\n" +
    "Jimp v"+ process.env.npm_package_version +"\n" +
    "https://github.com/oliver-moran/jimp\n" +
    "Ported for the Web by Phil Seaton\n" +
    fs.readFileSync(fromRoot("LICENSE")) +
    "*/";

// Browserify and Babelize.
function bundle (files, config, callback) {
    if (typeof files === 'string') files = [files];
    files = files.map(function (f) {
        return (f[0]==="/") ? f : fromRoot(f); // ensure path.
    });
    console.error("Browserify "+files.join(", ")+"...");
    config = Object.assign({
        ignoreMissing: true,
        fullPaths: false,
        debug: true,
        paths: [root],
        basedir: root,
        transform: envify({ENVIRONMENT: "BROWSER"})
    }, config);
    debug('browserify config:', config);
    var bundler = browserify(files, config).exclude(fromRoot("browser/lib/jimp.js"));
    config.exclude = config.exclude || [];
    for (let f, i=0; (f=config.exclude[i]); i++) {
        bundler.exclude(fromRoot(f));
    }
    bundler.bundle(function (err, baseCode) {
        if (err) return callback(err);
        console.error("Babelize "+files.map((f)=> f.replace(/.*\//, '')).join("+")+"...");
        var result = babel.transform(
            "if ((typeof(window)=='undefined' || !window) " +
            "&& (typeof(self)!='undefined')) var window = self;\n" +
            baseCode.toString(),
            { presets: ["es2015", "stage-0"] }
        );
        callback(null, result.code);
    });
}

function bundleSimple (files, config, callback) {
    bundle(files, config, (err, code)=> {
        if (err) {
            var msg = "Can't bundle "+ files.join(" + ") +"\nError: "+ err.message;
            callback("throw Error("+ JSON.stringify(msg) +");");
        } else {
            callback(code);
        }
    });
}

function minify (code) {
    console.error("Compressing...");
    var ast = UglifyJS.parse(code);
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor({warnings: false});
    ast = ast.transform(compressor);
    return ast.print_to_string();
}

if (!module.parent) {

    var config = process.argv[3];
    var cmd = process.argv[2] || "prepublish";

    switch (cmd) {

        case "test":
            let baseFiles;
            if (config[0] === '{') {
                config = JSON.parse(config);
                baseFiles = process.argv.slice(4);
            } else {
                config = {};
                baseFiles = process.argv.slice(3);
            }
            if (baseFiles.length === 0) throw Error("No file given.");
            bundle(baseFiles, config, function (err, code) {
                if (err) throw err;
                process.stdout.write(code);
                console.error("Done.");
            });
            break;

        case "prepublish":
            if (config) config = JSON.parse(config);
            else config = {};
            bundle("index.js", config, function (err, code) {
                if (err) throw err;
                fs.writeFile(fromRoot("browser/lib/jimp.js"),
                    licence +"\n"+ code, function (err) {
                        if (err) throw err;
                        console.error("browserifyed jimp.js done.");
                    }
                );
                fs.writeFile(fromRoot("browser/lib/jimp.min.js"),
                    licence +"\n"+ minify(code), function (err) {
                        if (err) throw err;
                        console.error("browserifyed jimp.min.js done.");
                    }
                );
            });
            break;

        case "help":
            let toolName = process.argv[1].replace(root, "./").replace(/\/+/g, '/');
            console.log([
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
            ].join('\n'));
            break;

        default:
            throw Error(`Unknown command given. Run "$ ${process.argv[1]} help" for more inforation`);

    }
}

module.exports = { bundle: bundle, bundleSimple: bundleSimple, minify: minify };
