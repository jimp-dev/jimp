var express = require("express");
var app = express();

app.use(express.static(__dirname + '/browser'));

app.listen(8080);