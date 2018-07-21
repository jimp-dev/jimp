/* eslint no-console: "off" */

var path = require('path');
var express = require('express');
var app = express();

app.use(express.static(path.resolve(__dirname, './browser')));

app.listen(8080);

console.log('Serving on http://127.0.0.1:8080');
