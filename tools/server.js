/* eslint no-console: "off" */

const path = require('path');
const express = require('express');

const app = express();

app.use(express.static(path.resolve(__dirname, '../browser')));
app.listen(8080);

console.log('Serving on http://127.0.0.1:8080');
