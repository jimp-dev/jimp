var fs = require('fs');
var {normalize, join} = require('path');
var babel = require("babel-core");
var envify = require('envify/custom');
var UglifyJS = require("uglify-js");
var browserify = require("browserify");

var root = normalize(join(__dirname, ".."));
function fromRoot(subPath) {
    return normalize(join(root, subPath));
}

var licence = "/*\n" +
    "Jimp v"+ process.env.npm_package_version +"\n" +
    "https://github.com/oliver-moran/jimp\n" +
    "Ported for the Web by Phil Seaton\n" +
    fs.readFileSync(fromRoot("LICENSE")) +
    "*/";

// Browserify and Babelize.
function bundle(files, config, callback) {
    if ('string' === typeof files) files = [files];
    files = files.map(function(f) {
        return (f[0]==="/") ? f : fromRoot(f); // ensure path.
    });
    console.error("Browserify "+files.join(", ")+"...");
    var bundler = browserify(files, {
        ignoreMissing: true,
        fullPaths: false,
        debug: true,
        paths: [root],
        basedir: root,
        transform: envify({ENVIRONMENT: "BROWSER"})
    })
    .exclude(fromRoot("browser/lib/jimp.js"));
    config.exclude = config.exclude || [];
    for (let f,i=0; (f=config.exclude[i]); i++) {
        bundler.exclude(fromRoot(f));
    }
    bundler.bundle(function(err, baseCode) {
        if (err) return callback(err);
        console.error("Babelize "+files.map((f)=> f.replace(/.*\//,'')).join("+")+"...");
        var result = babel.transform(
            "if ((typeof(window)=='undefined' || !window) " +
            "&& (typeof(self)!='undefined')) var window = self;\n" +
            baseCode.toString(),
            { presets: ["es2015", "stage-0"] }
        );
        callback(null, result.code);
    });
}

function bundleSimple(files, config, callback) {
    bundle(files, config, (err, code)=> {
        if (err) {
            var msg = "Can't bundle "+ files.join(" + ") +"\nError: "+ err.message;
            callback("throw Error("+ JSON.stringify(msg) +");");
        } else {
            callback(code);
        }
    });
}

function minify(code) {
    console.error("Compressing...");
    var ast = UglifyJS.parse(code);
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor({warnings: false});
    ast = ast.transform(compressor);
    return ast.print_to_string();
}

if (!module.parent) {

    var cmd = process.argv[2] || "prepublish";

    switch (cmd) {

    case "test":
        var baseFiles = process.argv.slice(3);
        if (baseFiles.length == 0) throw Error("No file given.");
        bundle(baseFiles, {}, function(err, code) {
            if (err) throw err;
            process.stdout.write(code);
            console.error("Done.");
        });
        break;

    case "prepublish":
        bundle("index.js", {}, function(err, code) {
            if (err) throw err;
            fs.writeFile(fromRoot("browser/lib/jimp.js"),
                licence +"\n"+ code, function(err){
                    if (err) throw err;
                    console.error("browserifyed jimp.js done.");
                }
            );
            fs.writeFile(fromRoot("browser/lib/jimp.min.js"),
                licence +"\n"+ minify(code), function(err){
                    if (err) throw err;
                    console.error("browserifyed jimp.min.js done.");
                }
            );
        });
        break;

    default:
        throw Error("Unknown command given.");

    }
}

module.exports = { bundle: bundle, bundleSimple: bundleSimple, minify: minify };
