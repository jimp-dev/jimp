/*
Jimp v 0.2.24
https://github.com/oliver-moran/jimp
Ported for the Web by Phil Seaton

The MIT License (MIT)

Copyright (c) 2014 Oliver Moran

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var window = window || self;
var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;})({1:[function(require,module,exports){(function(process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__dirname){function log(t){clear(),process.stdout.write(t),chars=t.length;}function clear(){for(;chars-->0;){process.stdout.write("\b");}}function noop(){}function isNodePattern(t){if("undefined"==typeof t)return !1;if("function"!=typeof t)throw new Error("Callback must be a function");return !0;}function throwError(t,i){if("string"==typeof t&&(t=new Error(t)),"function"==typeof i)return i.call(this,t);throw t;}function Jimp(){if("number"==typeof arguments[0]&&"number"==typeof arguments[1]){var t=arguments[0],i=arguments[1],a=arguments[2];if("number"==typeof arguments[2]){this._background=arguments[2];var a=arguments[3];}if("undefined"==typeof a&&(a=noop),"function"!=typeof a)return throwError.call(this,"cb must be a function",a);this.bitmap={data:new Buffer(t*i*4),width:t,height:i};for(var r=0;r<this.bitmap.data.length;r+=4){this.bitmap.data.writeUInt32BE(this._background,r);}a.call(this,null,this);}else if("object"==_typeof(arguments[0])&&arguments[0].constructor==Jimp){var e=arguments[0],a=arguments[1];if("undefined"==typeof a&&(a=noop),"function"!=typeof a)return throwError.call(this,"cb must be a function",a);var h=new Buffer(e.bitmap.data.length);e.scan(0,0,e.bitmap.width,e.bitmap.height,function(t,i,a){var r=e.bitmap.data.readUInt32BE(a,!0);h.writeUInt32BE(r,a,!0);}),this.bitmap={data:h,width:e.bitmap.width,height:e.bitmap.height},this._quality=e._quality,this._deflateLevel=e._deflateLevel,this._filterType=e._filterType,this._rgba=e._rgba,this._background=e._background,a.call(this,null,this);}else if(URLRegEx({exact:!0}).test(arguments[0])){var n=arguments[0],a=arguments[1];if("undefined"==typeof a&&(a=noop),"function"!=typeof a)return throwError.call(this,"cb must be a function",a);var o=this;Request(n,function(t,i,r){if(t)return throwError.call(o,t,a);if("object"!=(typeof r==="undefined"?"undefined":_typeof(r))||!Buffer.isBuffer(r))return throwError.call(o,"Could not load Buffer from URL <"+n+"> (HTTP: "+i.statusCode+")",a);var e=getMIMEFromBuffer(r);return "string"!=typeof e?throwError.call(o,"Could not find MIME for Buffer <"+n+"> (HTTP: "+i.statusCode+")",a):void parseBitmap.call(o,r,e,a);});}else if("string"==typeof arguments[0]){var s=arguments[0],a=arguments[1];if("undefined"==typeof a&&(a=noop),"function"!=typeof a)return throwError.call(this,"cb must be a function",a);var o=this;getMIMEFromPath(s,function(t,i){FS.readFile(s,function(t,r){return t?throwError.call(o,t,a):void parseBitmap.call(o,r,i,a);});});}else {if("object"!=_typeof(arguments[0]))return throwError.call(this,"No matching constructor overloading was found. Please see the docs for how to call the Jimp constructor.",a);var p=arguments[0],m=getMIMEFromBuffer(p),a=arguments[1];if(!Buffer.isBuffer(p))return throwError.call(this,"data must be a Buffer",a);if("string"!=typeof m)return throwError.call(this,"mime must be a string",a);if("function"!=typeof a)return throwError.call(this,"cb must be a function",a);parseBitmap.call(this,p,m,a);}}function getMIMEFromBuffer(t){return FileType(t)?FileType(t).mime:"";}function getMIMEFromPath(t,i){ReadChunk(t,0,262,function(t,a){t&&i(null,"");var r=FileType(a);return i&&i(null,r&&r.mime||"");});}function parseBitmap(t,i,a){var r=this;switch(this._originalMime=i,i.toLowerCase()){case Jimp.MIME_PNG:var e=new PNG();e.parse(t,function(t,i){return t?throwError.call(r,t,a):(r.bitmap={data:new Buffer(i.data),width:i.width,height:i.height},a.call(r,null,r));});break;case Jimp.MIME_JPEG:try{return this.bitmap=JPEG.decode(t),exifRotate(this,t),a.call(this,null,this);}catch(h){return a.call(this,h,this);}case Jimp.MIME_BMP:return this.bitmap=BMP.decode(t),a.call(this,null,this);default:return throwError.call(this,"Unsupported MIME type: "+i,a);}}function exifRotate(t,i){var a=EXIFParser.create(i).parse();if(a&&a.tags&&a.tags.Orientation)switch(a.tags.Orientation){case 1:break;case 2:t.mirror(!0,!1);break;case 3:t.rotate(180);break;case 4:t.mirror(!1,!0);break;case 5:t.mirror(!0,!1).rotate(270);break;case 6:t.rotate(90);break;case 7:t.mirror(!0,!1).rotate(90);break;case 8:t.rotate(270);}}function histogram(){var t={r:new Array(256).fill(0),g:new Array(256).fill(0),b:new Array(256).fill(0)};return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(i,a,r){t.r[this.bitmap.data[r+0]]++,t.g[this.bitmap.data[r+1]]++,t.b[this.bitmap.data[r+2]]++;}),t;}function simpleRotate(t){for(var i=Math.round(t/90)%4;0>i;){i+=4;}for(;i>0;){for(var a=new Buffer(this.bitmap.data.length),r=0,e=0;e<this.bitmap.width;e++){for(var h=this.bitmap.height-1;h>=0;h--){var n=this.bitmap.width*h+e<<2,o=this.bitmap.data.readUInt32BE(n,!0);a.writeUInt32BE(o,r,!0),r+=4;}}this.bitmap.data=new Buffer(a);var s=this.bitmap.width;this.bitmap.width=this.bitmap.height,this.bitmap.height=s,i--;}}function advancedRotate(t,i){function a(t,i){return function(a,r){return {x:a+t,y:r+i};};}var r,e,h=t%360*Math.PI/180,n=Math.cos(h),o=Math.sin(h);if(1==i||"string"==typeof i){r=Math.round(Math.abs(this.bitmap.width*n)+Math.abs(this.bitmap.height*o)),e=Math.round(Math.abs(this.bitmap.width*o)+Math.abs(this.bitmap.height*n));var s=this.clone();this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,i,a){this.bitmap.data.writeUInt32BE(this._background,a);});var p=Math.max(r,e,this.bitmap.width,this.bitmap.height);this.resize(p,p,i),this.blit(s,this.bitmap.width/2-s.bitmap.width/2,this.bitmap.height/2-s.bitmap.height/2);}for(var m=new Buffer(this.bitmap.data.length),u=a(-(this.bitmap.width/2),-(this.bitmap.height/2)),b=a(this.bitmap.width/2,this.bitmap.height/2),l=0;l<this.bitmap.height;l++){for(var f=0;f<this.bitmap.width;f++){var d=u(f,this.bitmap.height-l),c=b(n*d.x-o*d.y,n*d.y+o*d.x);if(c.x>=0&&c.x<this.bitmap.width&&c.y>=0&&c.y<this.bitmap.height){var w=(this.bitmap.width*(this.bitmap.height-c.y|0)+c.x|0)<<2,g=this.bitmap.data.readUInt32BE(w,!0),y=this.bitmap.width*l+f<<2;m.writeUInt32BE(g,y);}else {var y=this.bitmap.width*l+f<<2;m.writeUInt32BE(this._background,y);}}}if(this.bitmap.data=m,1==i||"string"==typeof i){var f=this.bitmap.width/2-r/2,l=this.bitmap.height/2-e/2;this.crop(f,l,r,e);}}function compositeBitmapOverBackground(t){return new Jimp(t.bitmap.width,t.bitmap.height,t._background).composite(t,0,0).bitmap;}function loadPages(t,i){var a=i.map(function(i){return Jimp.read(t+"/"+i);});return Promise.all(a);}function drawCharacter(t,i,a,r,e){if(e.width>0&&e.height>0){var h=i.pages[e.page].clone().crop(e.x,e.y,e.width,e.height);return t.composite(h,a+e.xoffset,r+e.yoffset);}return t;}var FS,PNG=require("pngjs").PNG,JPEG=require("jpeg-js"),BMP=require("bmp-js"),MIME=require("mime"),TinyColor=require("tinycolor2"),Resize=require("./resize.js"),Resize2=require("./resize2.js"),StreamToBuffer=require("stream-to-buffer"),ReadChunk=require("read-chunk"),FileType=require("file-type"),PixelMatch=require("pixelmatch"),EXIFParser=require("exif-parser"),ImagePHash=require("./phash.js"),BigNumber=require("bignumber.js"),URLRegEx=require("url-regex"),BMFont=require("load-bmfont"),Path=require("path"),Request,Promise=global.Promise||require("es6-promise").Promise,chars=0;process.on("exit",clear),Jimp.read=function(t,i){var a=new Promise(function(a,r){if(i=i||function(t,i){t?r(t):a(i);},"string"!=typeof t&&("object"!=(typeof t==="undefined"?"undefined":_typeof(t))||!Buffer.isBuffer(t)))return throwError.call(this,"src must be a string or a Buffer",i);new Jimp(t,i);});return a;},Jimp.AUTO=-1,Jimp.MIME_PNG="image/png",Jimp.MIME_JPEG="image/jpeg",Jimp.MIME_BMP="image/bmp",Jimp.PNG_FILTER_AUTO=-1,Jimp.PNG_FILTER_NONE=0,Jimp.PNG_FILTER_SUB=1,Jimp.PNG_FILTER_UP=2,Jimp.PNG_FILTER_AVERAGE=3,Jimp.PNG_FILTER_PAETH=4,Jimp.RESIZE_NEAREST_NEIGHBOR="nearestNeighbor",Jimp.RESIZE_BILINEAR="bilinearInterpolation",Jimp.RESIZE_BICUBIC="bicubicInterpolation",Jimp.RESIZE_HERMITE="hermiteInterpolation",Jimp.RESIZE_BEZIER="bezierInterpolation",Jimp.FONT_SANS_8_BLACK=Path.join(__dirname,"fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt"),Jimp.FONT_SANS_16_BLACK=Path.join(__dirname,"fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt"),Jimp.FONT_SANS_32_BLACK=Path.join(__dirname,"fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt"),Jimp.FONT_SANS_64_BLACK=Path.join(__dirname,"fonts/open-sans/open-sans-64-black/open-sans-64-black.fnt"),Jimp.FONT_SANS_128_BLACK=Path.join(__dirname,"fonts/open-sans/open-sans-128-black/open-sans-128-black.fnt"),Jimp.FONT_SANS_8_WHITE=Path.join(__dirname,"fonts/open-sans/open-sans-8-white/open-sans-8-white.fnt"),Jimp.FONT_SANS_16_WHITE=Path.join(__dirname,"fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt"),Jimp.FONT_SANS_32_WHITE=Path.join(__dirname,"fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt"),Jimp.FONT_SANS_64_WHITE=Path.join(__dirname,"fonts/open-sans/open-sans-64-white/open-sans-64-white.fnt"),Jimp.FONT_SANS_128_WHITE=Path.join(__dirname,"fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt"),Jimp.rgbaToInt=function(t,i,a,r,e){if("number"!=typeof t||"number"!=typeof i||"number"!=typeof a||"number"!=typeof r)return throwError.call(this,"r, g, b and a must be numbers",e);if(0>t||t>255)return throwError.call(this,"r must be between 0 and 255",e);if((0>i||i>255)&&throwError.call(this,"g must be between 0 and 255",e),0>a||a>255)return throwError.call(this,"b must be between 0 and 255",e);if(0>r||r>255)return throwError.call(this,"a must be between 0 and 255",e);var h=t*Math.pow(256,3)+i*Math.pow(256,2)+a*Math.pow(256,1)+r*Math.pow(256,0);return isNodePattern(e)?e.call(this,null,h):h;},Jimp.intToRGBA=function(t,i){if("number"!=typeof t)return throwError.call(this,"i must be a number",i);var a={};return a.r=Math.floor(t/Math.pow(256,3)),a.g=Math.floor((t-a.r*Math.pow(256,3))/Math.pow(256,2)),a.b=Math.floor((t-a.r*Math.pow(256,3)-a.g*Math.pow(256,2))/Math.pow(256,1)),a.a=Math.floor((t-a.r*Math.pow(256,3)-a.g*Math.pow(256,2)-a.b*Math.pow(256,1))/Math.pow(256,0)),isNodePattern(i)?i.call(this,null,a):a;},Jimp.limit255=function(t){return t=Math.max(t,0),t=Math.min(t,255);},Jimp.diff=function(t,i,a){if("object"!=(typeof t==="undefined"?"undefined":_typeof(t))||t.constructor!=Jimp||"object"!=(typeof i==="undefined"?"undefined":_typeof(i))||i.constructor!=Jimp)return throwError.call(this,"img1 and img2 must be an Jimp images");if(t.bitmap.width!=i.bitmap.width||t.bitmap.height!=i.bitmap.height)switch(t.bitmap.width*t.bitmap.height>i.bitmap.width*i.bitmap.height){case !0:t=t.clone().resize(i.bitmap.width,i.bitmap.height);break;default:i=i.clone().resize(t.bitmap.width,t.bitmap.height);}if(a=a||.1,"number"!=typeof a||0>a||a>1)return throwError.call(this,"threshold must be a number between 0 and 1");var r=new Jimp(t.bitmap.width,t.bitmap.height,4294967295),e=PixelMatch(t.bitmap.data,i.bitmap.data,r.bitmap.data,r.bitmap.width,r.bitmap.height,{threshold:a});return {percent:e/(r.bitmap.width*r.bitmap.height),image:r};},Jimp.distance=function(t,i){var a=new ImagePHash(),r=a.getHash(t),e=a.getHash(i);return a.distance(r,e);},Jimp.prototype.bitmap={data:null,width:null,height:null},Jimp.prototype._quality=100,Jimp.prototype._deflateLevel=9,Jimp.prototype._filterType=Jimp.PNG_FILTER_AUTO,Jimp.prototype._rgba=!0,Jimp.prototype._background=0,Jimp.prototype.clone=function(t){var i=new Jimp(this);return isNodePattern(t)?t.call(i,null,i):i;},Jimp.prototype.quality=function(t,i){return "number"!=typeof t?throwError.call(this,"n must be a number",i):0>t||t>100?throwError.call(this,"n must be a number 0 - 100",i):(this._quality=Math.round(t),isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.deflateLevel=function(t,i){return "number"!=typeof t?throwError.call(this,"l must be a number",i):0>t||t>9?throwError.call(this,"l must be a number 0 - 9",i):(this._deflateLevel=Math.round(t),isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.filterType=function(t,i){return "number"!=typeof t?throwError.call(this,"n must be a number",i):-1>t||t>4?throwError.call(this,"n must be -1 (auto) or a number 0 - 4",i):(this._filterType=Math.round(t),isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.rgba=function(t,i){return "boolean"!=typeof t?throwError.call(this,"bool must be a boolean, true for RGBA or false for RGB",i):(this._rgba=t,isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.background=function(t,i){return "number"!=typeof t?throwError.call(this,"hex must be a hexadecimal rgba value",i):(this._background=t,isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.scan=function(t,i,a,r,e,h){if("number"!=typeof t||"number"!=typeof i)return throwError.call(this,"x and y must be numbers",h);if("number"!=typeof a||"number"!=typeof r)return throwError.call(this,"w and h must be numbers",h);if("function"!=typeof e)return throwError.call(this,"f must be a function",h);t=Math.round(t),i=Math.round(i),a=Math.round(a),r=Math.round(r);for(var n=i;i+r>n;n++){for(var o=t;t+a>o;o++){var s=this.bitmap.width*n+o<<2;e.call(this,o,n,s);}}return isNodePattern(h)?h.call(this,null,this):this;},Jimp.prototype.getPixelIndex=function(t,i,a){if("number"!=typeof t||"number"!=typeof i)return throwError.call(this,"x and y must be numbers",a);t=Math.round(t),i=Math.round(i);var r=this.bitmap.width*i+t<<2;return (0>t||t>this.bitmap.width)&&(r=-1),(0>i||i>this.bitmap.height)&&(r=-1),isNodePattern(a)?a.call(this,null,r):r;},Jimp.prototype.getPixelColor=Jimp.prototype.getPixelColour=function(t,i,a){if("number"!=typeof t||"number"!=typeof i)return throwError.call(this,"x and y must be numbers",a);t=Math.round(t),i=Math.round(i);var r=this.getPixelIndex(t,i),e=this.bitmap.data.readUInt32BE(r);return isNodePattern(a)?a.call(this,null,e):e;},Jimp.prototype.setPixelColor=Jimp.prototype.setPixelColour=function(t,i,a,r){if("number"!=typeof t||"number"!=typeof i||"number"!=typeof a)return throwError.call(this,"hex, x and y must be numbers",r);i=Math.round(i),a=Math.round(a);var e=this.getPixelIndex(i,a);return this.bitmap.data.writeUInt32BE(t,e,!0),isNodePattern(r)?r.call(this,null,this):this;};for(var maxHashLength=[],i=0;65>i;i++){var l=i>1?new BigNumber(Array(65).join("1"),2).toString(i):NaN;maxHashLength.push(l.length);}Jimp.prototype.hash=function(t,i){if(t=t||64,"function"==typeof t&&(i=t,t=64),"number"!=typeof t)return throwError.call(this,"base must be a number",i);if(2>t||t>64)return throwError.call(this,"base must be a number between 2 and 64",i);var a=new ImagePHash().getHash(this);for(a=new BigNumber(a,2).toString(t);a.length<maxHashLength[t];){a="0"+a;}return isNodePattern(i)?i.call(this,null,a):a;},Jimp.prototype.crop=function(t,i,a,r,e){if("number"!=typeof t||"number"!=typeof i)return throwError.call(this,"x and y must be numbers",e);if("number"!=typeof a||"number"!=typeof r)return throwError.call(this,"w and h must be numbers",e);t=Math.round(t),i=Math.round(i),a=Math.round(a),r=Math.round(r);var h=new Buffer(this.bitmap.data.length),n=0;return this.scan(t,i,a,r,function(t,i,a){var r=this.bitmap.data.readUInt32BE(a,!0);h.writeUInt32BE(r,n,!0),n+=4;}),this.bitmap.data=new Buffer(h),this.bitmap.width=a,this.bitmap.height=r,isNodePattern(e)?e.call(this,null,this):this;},Jimp.prototype.autocrop=function(){for(var t,i=this.bitmap.width,a=this.bitmap.height,r=1,e=2e-4,h=!0,n=0,o=arguments.length;o>n;n++){"number"==typeof arguments[n]&&(e=arguments[n]),"boolean"==typeof arguments[n]&&(h=arguments[n]),"function"==typeof arguments[n]&&(t=arguments[n]);}var s=this.getPixelColor(0,0),p=0,m=0,u=0,b=0,l=Jimp.intToRGBA(s);t: for(var f=0;a-r>f;f++){for(var d=0;i>d;d++){var c=this.getPixelColor(d,f),w=Jimp.intToRGBA(c),g=Math.abs(Math.max(l.r-w.r^2,l.r-w.r-l.a+w.a^2)+Math.max(l.g-w.g^2,l.g-w.g-l.a+w.a^2)+Math.max(l.b-w.b^2,l.b-w.b-l.a+w.a^2))/196608;if(g>e)break t;}p++;}t: for(var d=0;i-r>d;d++){for(var f=0+p;a>f;f++){var c=this.getPixelColor(d,f),w=Jimp.intToRGBA(c),g=Math.abs(Math.max(l.r-w.r^2,l.r-w.r-l.a+w.a^2)+Math.max(l.g-w.g^2,l.g-w.g-l.a+w.a^2)+Math.max(l.b-w.b^2,l.b-w.b-l.a+w.a^2))/196608;if(g>e)break t;}m++;}s=this.getPixelColor(i-1,a-1);t: for(var f=a-1;f>=0+p+r;f--){for(var d=i-m-1;d>=0;d--){var c=this.getPixelColor(d,f),w=Jimp.intToRGBA(c),g=Math.abs(Math.max(l.r-w.r^2,l.r-w.r-l.a+w.a^2)+Math.max(l.g-w.g^2,l.g-w.g-l.a+w.a^2)+Math.max(l.b-w.b^2,l.b-w.b-l.a+w.a^2))/196608;if(g>e)break t;}u++;}t: for(var d=i-1;d>=0+m+r;d--){for(var f=a-1;f>=0+p;f--){var c=this.getPixelColor(d,f),w=Jimp.intToRGBA(c),g=Math.abs(Math.max(l.r-w.r^2,l.r-w.r-l.a+w.a^2)+Math.max(l.g-w.g^2,l.g-w.g-l.a+w.a^2)+Math.max(l.b-w.b^2,l.b-w.b-l.a+w.a^2))/196608;if(g>e)break t;}b++;}var y=i-(b+m),E=a-(u+p),M=!1;return M=h?0!==m&&0!==p&&0!==b&&0!==u:0!==m||0!==p||0!==b||0!==u,M&&this.crop(m,p,y,E),isNodePattern(t)?t.call(this,null,this):this;},Jimp.prototype.blit=function(t,i,a,r,e,h,n,o){if("object"!=(typeof t==="undefined"?"undefined":_typeof(t))||t.constructor!=Jimp)return throwError.call(this,"The source must be a Jimp image",o);if("number"!=typeof i||"number"!=typeof a)return throwError.call(this,"x and y must be numbers",o);if("function"==typeof r)o=r,r=0,e=0,h=t.bitmap.width,n=t.bitmap.height;else {if((typeof r==="undefined"?"undefined":_typeof(r))!=(typeof e==="undefined"?"undefined":_typeof(e))||(typeof e==="undefined"?"undefined":_typeof(e))!=(typeof h==="undefined"?"undefined":_typeof(h))||(typeof h==="undefined"?"undefined":_typeof(h))!=(typeof n==="undefined"?"undefined":_typeof(n)))return throwError.call(this,"srcx, srcy, srcw, srch must be numbers",o);r=r||0,e=e||0,h=h||t.bitmap.width,n=n||t.bitmap.height;}i=Math.round(i),a=Math.round(a),r=Math.round(r),e=Math.round(e),h=Math.round(h),n=Math.round(n);var s=this;return t.scan(r,e,h,n,function(t,h,n){var o=s.getPixelIndex(i+t-r,a+h-e);s.bitmap.data[o]=this.bitmap.data[n],s.bitmap.data[o+1]=this.bitmap.data[n+1],s.bitmap.data[o+2]=this.bitmap.data[n+2],s.bitmap.data[o+3]=this.bitmap.data[n+3];}),isNodePattern(o)?o.call(this,null,this):this;},Jimp.prototype.mask=function(t,i,a,r){if("object"!=(typeof t==="undefined"?"undefined":_typeof(t))||t.constructor!=Jimp)return throwError.call(this,"The source must be a Jimp image",r);if("number"!=typeof i||"number"!=typeof a)return throwError.call(this,"x and y must be numbers",r);i=Math.round(i),a=Math.round(a);var e=this;return t.scan(0,0,t.bitmap.width,t.bitmap.height,function(t,r,h){var n=e.getPixelIndex(i+t,a+r),o=(this.bitmap.data[h+0]+this.bitmap.data[h+1]+this.bitmap.data[h+2])/3;e.bitmap.data[n+3]*=o/255;}),isNodePattern(r)?r.call(this,null,this):this;},Jimp.prototype.composite=function(t,i,a,r){if("object"!=(typeof t==="undefined"?"undefined":_typeof(t))||t.constructor!=Jimp)return throwError.call(this,"The source must be a Jimp image",r);if("number"!=typeof i||"number"!=typeof a)return throwError.call(this,"x and y must be numbers",r);i=Math.round(i),a=Math.round(a);var e=this;return t.scan(0,0,t.bitmap.width,t.bitmap.height,function(t,r,h){var n=e.getPixelIndex(i+t,a+r),o={r:this.bitmap.data[h+0]/255,g:this.bitmap.data[h+1]/255,b:this.bitmap.data[h+2]/255,a:this.bitmap.data[h+3]/255},s={r:e.bitmap.data[n+0]/255,g:e.bitmap.data[n+1]/255,b:e.bitmap.data[n+2]/255,a:e.bitmap.data[n+3]/255},p=s.a+o.a-s.a*o.a,m=(o.r*o.a+s.r*s.a*(1-o.a))/p,u=(o.g*o.a+s.g*s.a*(1-o.a))/p,b=(o.b*o.a+s.b*s.a*(1-o.a))/p;e.bitmap.data[n+0]=Jimp.limit255(255*m),e.bitmap.data[n+1]=Jimp.limit255(255*u),e.bitmap.data[n+2]=Jimp.limit255(255*b),e.bitmap.data[n+3]=Jimp.limit255(255*p);}),isNodePattern(r)?r.call(this,null,this):this;},Jimp.prototype.brightness=function(t,i){return "number"!=typeof t?throwError.call(this,"val must be numbers",i):-1>t||t>1?throwError.call(this,"val must be a number between -1 and +1",i):(this.scan(0,0,this.bitmap.width,this.bitmap.height,function(i,a,r){0>t?(this.bitmap.data[r]=this.bitmap.data[r]*(1+t),this.bitmap.data[r+1]=this.bitmap.data[r+1]*(1+t),this.bitmap.data[r+2]=this.bitmap.data[r+2]*(1+t)):(this.bitmap.data[r]=this.bitmap.data[r]+(255-this.bitmap.data[r])*t,this.bitmap.data[r+1]=this.bitmap.data[r+1]+(255-this.bitmap.data[r+1])*t,this.bitmap.data[r+2]=this.bitmap.data[r+2]+(255-this.bitmap.data[r+2])*t);}),isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.contrast=function(t,i){function a(i){if(0>t){var a=i>127?1-i/255:i/255;return 0>a&&(a=0),a=.5*Math.pow(2*a,1+t),i>127?255*(1-a):255*a;}var a=i>127?1-i/255:i/255;return 0>a&&(a=0),a=.5*Math.pow(2*a,1==t?127:1/(1-t)),i>127?255*(1-a):255*a;}return "number"!=typeof t?throwError.call(this,"val must be numbers",i):-1>t||t>1?throwError.call(this,"val must be a number between -1 and +1",i):(this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,i,r){this.bitmap.data[r]=a(this.bitmap.data[r]),this.bitmap.data[r+1]=a(this.bitmap.data[r+1]),this.bitmap.data[r+2]=a(this.bitmap.data[r+2]);}),isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.posterize=function(t,i){return "number"!=typeof t?throwError.call(this,"n must be numbers",i):(2>t&&(t=2),this.scan(0,0,this.bitmap.width,this.bitmap.height,function(i,a,r){this.bitmap.data[r]=Math.floor(this.bitmap.data[r]/255*(t-1))/(t-1)*255,this.bitmap.data[r+1]=Math.floor(this.bitmap.data[r+1]/255*(t-1))/(t-1)*255,this.bitmap.data[r+2]=Math.floor(this.bitmap.data[r+2]/255*(t-1))/(t-1)*255;}),isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.normalize=function(t){var i=histogram.call(this),a=function a(t,i,_a){return 255*(t-i)/(_a-i);},r=function r(t){return [t.findIndex(function(t){return t>0;}),255-t.slice().reverse().findIndex(function(t){return t>0;})];},e={r:r(i.r),g:r(i.g),b:r(i.b)};return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,i,r){var h=this.bitmap.data[r+0],n=this.bitmap.data[r+1],o=this.bitmap.data[r+2];this.bitmap.data[r+0]=a(h,e.r[0],e.r[1]),this.bitmap.data[r+1]=a(n,e.g[0],e.g[1]),this.bitmap.data[r+2]=a(o,e.b[0],e.b[1]);}),isNodePattern(t)?t.call(this,null,this):this;},Jimp.prototype.invert=function(t){return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,i,a){this.bitmap.data[a]=255-this.bitmap.data[a],this.bitmap.data[a+1]=255-this.bitmap.data[a+1],this.bitmap.data[a+2]=255-this.bitmap.data[a+2];}),isNodePattern(t)?t.call(this,null,this):this;},Jimp.prototype.mirror=Jimp.prototype.flip=function(t,i,a){if("boolean"!=typeof t||"boolean"!=typeof i)return throwError.call(this,"horizontal and vertical must be Booleans",a);var r=new Buffer(this.bitmap.data.length);return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(a,e,h){var n=t?this.bitmap.width-1-a:a,o=i?this.bitmap.height-1-e:e,s=this.bitmap.width*o+n<<2,p=this.bitmap.data.readUInt32BE(h,!0);r.writeUInt32BE(p,s,!0);}),this.bitmap.data=new Buffer(r),isNodePattern(a)?a.call(this,null,this):this;},Jimp.prototype.gaussian=function(t,i){if("number"!=typeof t)return throwError.call(this,"r must be a number",i);if(1>t)return throwError.call(this,"r must be greater than 0",i);for(var a=Math.ceil(2.57*t),r=0;r<this.bitmap.height;r++){log("Gaussian: "+Math.round(r/this.bitmap.height*100)+"%");for(var e=0;e<this.bitmap.width;e++){for(var h=0,n=0,o=0,s=0,p=0,m=r-a;r+a+1>m;m++){for(var u=e-a;e+a+1>u;u++){var b=Math.min(this.bitmap.width-1,Math.max(0,u)),l=Math.min(this.bitmap.height-1,Math.max(0,m)),f=(u-e)*(u-e)+(m-r)*(m-r),d=Math.exp(-f/(2*t*t))/(2*Math.PI*t*t),c=l*this.bitmap.width+b<<2;h+=this.bitmap.data[c]*d,n+=this.bitmap.data[c+1]*d,o+=this.bitmap.data[c+2]*d,s+=this.bitmap.data[c+3]*d,p+=d;}var c=r*this.bitmap.width+e<<2;this.bitmap.data[c]=Math.round(h/p),this.bitmap.data[c+1]=Math.round(n/p),this.bitmap.data[c+2]=Math.round(o/p),this.bitmap.data[c+3]=Math.round(s/p);}}}return clear(),isNodePattern(i)?i.call(this,null,this):this;};var mul_table=[1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1],shg_table=[0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18];Jimp.prototype.blur=function(t,i){if("number"!=typeof t)return throwError.call(this,"r must be a number",i);if(1>t)return throwError.call(this,"r must be greater than 0",i);for(var a,r,e,h,n,o,s,p,m,u,b,l,f,d,c=this.bitmap.width-1,w=this.bitmap.height-1,g=(this.bitmap.width*this.bitmap.height,t+1),y=mul_table[t],E=shg_table[t],M=[],v=[],J=[],P=[],_=[],B=[],N=2;N-->0;){for(f=l=0,o=0;o<this.bitmap.height;o++){for(a=this.bitmap.data[f]*g,r=this.bitmap.data[f+1]*g,e=this.bitmap.data[f+2]*g,h=this.bitmap.data[f+3]*g,s=1;t>=s;s++){p=f+((s>c?c:s)<<2),a+=this.bitmap.data[p++],r+=this.bitmap.data[p++],e+=this.bitmap.data[p++],h+=this.bitmap.data[p];}for(n=0;n<this.bitmap.width;n++){M[l]=a,v[l]=r,J[l]=e,P[l]=h,0==o&&(_[n]=((p=n+g)<c?p:c)<<2,B[n]=(p=n-t)>0?p<<2:0),m=f+_[n],u=f+B[n],a+=this.bitmap.data[m++]-this.bitmap.data[u++],r+=this.bitmap.data[m++]-this.bitmap.data[u++],e+=this.bitmap.data[m++]-this.bitmap.data[u++],h+=this.bitmap.data[m]-this.bitmap.data[u],l++;}f+=this.bitmap.width<<2;}for(n=0;n<this.bitmap.width;n++){for(b=n,a=M[b]*g,r=v[b]*g,e=J[b]*g,h=P[b]*g,s=1;t>=s;s++){b+=s>w?0:this.bitmap.width,a+=M[b],r+=v[b],e+=J[b],h+=P[b];}for(l=n<<2,o=0;o<this.bitmap.height;o++){this.bitmap.data[l+3]=d=h*y>>>E,d>255&&(this.bitmap.data[l+3]=255),d>0?(d=255/d,this.bitmap.data[l]=(a*y>>>E)*d,this.bitmap.data[l+1]=(r*y>>>E)*d,this.bitmap.data[l+2]=(e*y>>>E)*d):this.bitmap.data[l]=this.bitmap.data[l+1]=this.bitmap.data[l+2]=0,0==n&&(_[o]=((p=o+g)<w?p:w)*this.bitmap.width,B[o]=(p=o-t)>0?p*this.bitmap.width:0),m=n+_[o],u=n+B[o],a+=M[m]-M[u],r+=v[m]-v[u],e+=J[m]-J[u],h+=P[m]-P[u],l+=this.bitmap.width<<2;}}}return isNodePattern(i)?i.call(this,null,this):this;},Jimp.prototype.greyscale=function(t){return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,i,a){var r=parseInt(.2126*this.bitmap.data[a]+.7152*this.bitmap.data[a+1]+.0722*this.bitmap.data[a+2],10);this.bitmap.data[a]=r,this.bitmap.data[a+1]=r,this.bitmap.data[a+2]=r;}),isNodePattern(t)?t.call(this,null,this):this;},Jimp.prototype.grayscale=Jimp.prototype.greyscale,Jimp.prototype.sepia=function(t){return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,i,a){var r=this.bitmap.data[a],e=this.bitmap.data[a+1],h=this.bitmap.data[a+2];r=.393*r+.769*e+.189*h,e=.349*r+.686*e+.168*h,h=.272*r+.534*e+.131*h,this.bitmap.data[a]=255>r?r:255,this.bitmap.data[a+1]=255>e?e:255,this.bitmap.data[a+2]=255>h?h:255;}),isNodePattern(t)?t.call(this,null,this):this;},Jimp.prototype.opacity=function(t,i){return "number"!=typeof t?throwError.call(this,"f must be a number",i):0>t||t>1?throwError.call(this,"f must be a number from 0 to 1",i):(this.scan(0,0,this.bitmap.width,this.bitmap.height,function(i,a,r){var e=this.bitmap.data[r+3]*t;this.bitmap.data[r+3]=e;}),isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.fade=function(t,i){return "number"!=typeof t?throwError.call(this,"f must be a number",i):0>t||t>1?throwError.call(this,"f must be a number from 0 to 1",i):(this.opacity(1-t),isNodePattern(i)?i.call(this,null,this):this);},Jimp.prototype.opaque=function(t){return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,i,a){this.bitmap.data[a+3]=255;}),isNodePattern(t)?t.call(this,null,this):this;},Jimp.prototype.resize=function(t,i,a,r){if("number"!=typeof t||"number"!=typeof i)return throwError.call(this,"w and h must be numbers",r);if("function"==typeof a&&"undefined"==typeof r&&(r=a,a=null),t==Jimp.AUTO&&i==Jimp.AUTO)return throwError.call(this,"w and h cannot both the set to auto",r);if(t==Jimp.AUTO&&(t=this.bitmap.width*(i/this.bitmap.height)),i==Jimp.AUTO&&(i=this.bitmap.height*(t/this.bitmap.width)),t=Math.round(t),i=Math.round(i),"function"==typeof Resize2[a]){var e={data:new Buffer(t*i*4),width:t,height:i};Resize2[a](this.bitmap,e),this.bitmap=e;}else {var h=this,n=new Resize(this.bitmap.width,this.bitmap.height,t,i,!0,!0,function(a){h.bitmap.data=new Buffer(a),h.bitmap.width=t,h.bitmap.height=i;});n.resize(this.bitmap.data);}return isNodePattern(r)?r.call(this,null,this):this;},Jimp.prototype.cover=function(t,i,a,r){if("number"!=typeof t||"number"!=typeof i)return throwError.call(this,"w and h must be numbers",r);"function"==typeof a&&"undefined"==typeof r&&(r=a,a=null);var e=t/i>this.bitmap.width/this.bitmap.height?t/this.bitmap.width:i/this.bitmap.height;return this.scale(e,a),this.crop(this.bitmap.width/2-t/2,this.bitmap.height/2-i/2,t,i),isNodePattern(r)?r.call(this,null,this):this;},Jimp.prototype.contain=function(t,i,a,r){if("number"!=typeof t||"number"!=typeof i)return throwError.call(this,"w and h must be numbers",r);"function"==typeof a&&"undefined"==typeof r&&(r=a,a=null);var e=t/i>this.bitmap.width/this.bitmap.height?i/this.bitmap.height:t/this.bitmap.width,h=this.clone().scale(e,a);return this.resize(t,i,a),this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,i,a){this.bitmap.data.writeUInt32BE(this._background,a);}),this.blit(h,this.bitmap.width/2-h.bitmap.width/2,this.bitmap.height/2-h.bitmap.height/2),isNodePattern(r)?r.call(this,null,this):this;},Jimp.prototype.scale=function(t,i,a){if("number"!=typeof t)return throwError.call(this,"f must be a number",a);if(0>t)return throwError.call(this,"f must be a positive number",a);"function"==typeof i&&"undefined"==typeof a&&(a=i,i=null);var r=this.bitmap.width*t,e=this.bitmap.height*t;return this.resize(r,e,i),isNodePattern(a)?a.call(this,null,this):this;},Jimp.prototype.scaleToFit=function(t,i,a,r){if("number"!=typeof t||"number"!=typeof i)return throwError.call(this,"w and h must be numbers",r);"function"==typeof a&&"undefined"==typeof r&&(r=a,a=null);var e=t/i>this.bitmap.width/this.bitmap.height?i/this.bitmap.height:t/this.bitmap.width;return this.scale(e,a),isNodePattern(r)?r.call(this,null,this):this;},Jimp.prototype.rotate=function(t,i,a){return "undefined"!=typeof i&&null!==i||(i=!0),"function"==typeof i&&"undefined"==typeof a&&(a=i,i=!0),"number"!=typeof t?throwError.call(this,"deg must be a number",a):"boolean"!=typeof i&&"string"!=typeof i?throwError.call(this,"mode must be a boolean or a string",a):(t%90==0&&i!==!1?simpleRotate.call(this,t,a):advancedRotate.call(this,t,i,a),isNodePattern(a)?a.call(this,null,this):this);},Jimp.prototype.getBuffer=function(t,i){if("string"!=typeof t)return throwError.call(this,"mime must be a string",i);if("function"!=typeof i)return throwError.call(this,"cb must be a function",i);switch(t.toLowerCase()){case Jimp.MIME_PNG:var a=this,r=new PNG({width:this.bitmap.width,height:this.bitmap.height,bitDepth:8,deflateLevel:this._deflateLevel,filterType:this._filterType,colorType:this._rgba?6:2,inputHasAlpha:!0});this._rgba?r.data=new Buffer(this.bitmap.data):r.data=compositeBitmapOverBackground(this).data,StreamToBuffer(r.pack(),function(t,r){return i.call(a,null,r);});break;case Jimp.MIME_JPEG:var e=JPEG.encode(compositeBitmapOverBackground(this),this._quality);return i.call(this,null,e.data);case Jimp.MIME_BMP:var h=BMP.encode(compositeBitmapOverBackground(this));return i.call(this,null,h.data);default:return i.call(this,"Unsupported MIME type: "+t);}return this;},Jimp.prototype.dither565=function(t){var i=[0,4,1,5,0,4,1,5,6,2,7,3,6,2,7,3,1,5,0,4,1,5,0,4,7,3,6,2,7,3,6,2,0,4,1,5,0,4,1,5,6,2,7,3,6,2,7,3,1,5,0,4,1,5,0,4,7,3,6,2,7,3,6,2];return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(t,a,r){var e=a%4*8+t%4,h=i[e];this.bitmap.data[r]=248&Math.min(this.bitmap.data[r]+h,255),this.bitmap.data[r+1]=252&Math.min(this.bitmap.data[r+1]+h,255),this.bitmap.data[r+2]=248&Math.min(this.bitmap.data[r+2]+h,255);}),isNodePattern(t)?t.call(this,null,this):this;},Jimp.prototype.dither16=Jimp.prototype.dither565,Jimp.prototype.color=Jimp.prototype.colour=function(t,i){if(!t||!Array.isArray(t))return throwError.call(this,"actions must be an array",i);var a=this;return this.scan(0,0,this.bitmap.width,this.bitmap.height,function(r,e,h){var n=TinyColor({r:this.bitmap.data[h],g:this.bitmap.data[h+1],b:this.bitmap.data[h+2]}),o=function o(t,i){return c=n.toRgb(),c[t]=Math.max(0,Math.min(c[t]+i,255)),TinyColor(c);};t.forEach(function(t){if("mix"===t.apply)n=TinyColor.mix(n,t.params[0],t.params[1]);else if("tint"===t.apply)n=TinyColor.mix(n,"white",t.params[0]);else if("shade"===t.apply)n=TinyColor.mix(n,"black",t.params[0]);else if("xor"===t.apply){var r=TinyColor(t.params[0]).toRgb();n=n.toRgb(),n=TinyColor({r:n.r^r.r,g:n.g^r.g,b:n.b^r.b});}else if("red"===t.apply)n=o("r",t.params[0]);else if("green"===t.apply)n=o("g",t.params[0]);else if("blue"===t.apply)n=o("b",t.params[0]);else {"hue"===t.apply&&(t.apply="spin");var e=n[t.apply];if(!e)return throwError.call(a,"action "+t.apply+" not supported",i);n=e.apply(n,t.params);}}),n=n.toRgb(),this.bitmap.data[h]=n.r,this.bitmap.data[h+1]=n.g,this.bitmap.data[h+2]=n.b;}),isNodePattern(i)?i.call(this,null,this):this;},Jimp.loadFont=function(t,i){if("string"!=typeof t)return throwError.call(this,"file must be a string",i);var a=this;return new Promise(function(r,e){i=i||function(t,i){t?e(t):r(i);},BMFont(t,function(r,e){var h={},n={};if(r)return throwError.call(a,r,i);for(var o=0;o<e.chars.length;o++){h[String.fromCharCode(e.chars[o].id)]=e.chars[o];}for(var o=0;o<e.kernings.length;o++){var s=String.fromCharCode(e.kernings[o].first);n[s]=n[s]||{},n[s][String.fromCharCode(e.kernings[o].second)]=e.kernings[o].amount;}loadPages(Path.dirname(t),e.pages).then(function(t){i(null,{chars:h,kernings:n,pages:t,common:e.common,info:e.info});});});});},Jimp.prototype.print=function(t,i,a,r,e){if("object"!=(typeof t==="undefined"?"undefined":_typeof(t)))return throwError.call(this,"font must be a Jimp loadFont",e);if("number"!=typeof i||"number"!=typeof a)return throwError.call(this,"x and y must be numbers",e);if("string"!=typeof r)return throwError.call(this,"text must be a string",e);for(var h=this,n=0;n<r.length;n++){t.chars[r[n]]&&(h=drawCharacter(h,t,i,a,t.chars[r[n]]),i+=(t.kernings[r[n]]&&t.kernings[r[n]][r[n+1]]?t.kernings[r[n]][r[n+1]]:0)+(t.chars[r[n]].xadvance||0));}return isNodePattern(e)?e.call(this,null,h):h;};var gl;"object"==(typeof window==="undefined"?"undefined":_typeof(window))&&(gl=window),"object"==(typeof self==="undefined"?"undefined":_typeof(self))&&(gl=self),gl.Jimp=Jimp,gl.Buffer=Buffer,module.exports=Jimp;}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..");},{"./phash.js":108,"./resize.js":109,"./resize2.js":110,"_process":12,"bignumber.js":4,"bmp-js":5,"buffer":14,"es6-promise":16,"exif-parser":18,"file-type":27,"jpeg-js":36,"load-bmfont":39,"mime":41,"path":60,"pixelmatch":61,"pngjs":81,"read-chunk":84,"stream-to-buffer":96,"tinycolor2":99,"url-regex":101}],2:[function(require,module,exports){ // http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util=require('util/');var pSlice=Array.prototype.slice;var hasOwn=Object.prototype.hasOwnProperty; // 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.
var assert=module.exports=ok; // 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })
assert.AssertionError=function AssertionError(options){this.name='AssertionError';this.actual=options.actual;this.expected=options.expected;this.operator=options.operator;if(options.message){this.message=options.message;this.generatedMessage=false;}else {this.message=getMessage(this);this.generatedMessage=true;}var stackStartFunction=options.stackStartFunction||fail;if(Error.captureStackTrace){Error.captureStackTrace(this,stackStartFunction);}else { // non v8 browsers so we can have a stacktrace
var err=new Error();if(err.stack){var out=err.stack; // try to strip useless frames
var fn_name=stackStartFunction.name;var idx=out.indexOf('\n'+fn_name);if(idx>=0){ // once we have located the function frame
// we need to strip out everything before it (and its line)
var next_line=out.indexOf('\n',idx+1);out=out.substring(next_line+1);}this.stack=out;}}}; // assert.AssertionError instanceof Error
util.inherits(assert.AssertionError,Error);function replacer(key,value){if(util.isUndefined(value)){return ''+value;}if(util.isNumber(value)&&!isFinite(value)){return value.toString();}if(util.isFunction(value)||util.isRegExp(value)){return value.toString();}return value;}function truncate(s,n){if(util.isString(s)){return s.length<n?s:s.slice(0,n);}else {return s;}}function getMessage(self){return truncate(JSON.stringify(self.actual,replacer),128)+' '+self.operator+' '+truncate(JSON.stringify(self.expected,replacer),128);} // At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.
// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.
function fail(actual,expected,message,operator,stackStartFunction){throw new assert.AssertionError({message:message,actual:actual,expected:expected,operator:operator,stackStartFunction:stackStartFunction});} // EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail=fail; // 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.
function ok(value,message){if(!value)fail(value,true,message,'==',assert.ok);}assert.ok=ok; // 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);
assert.equal=function equal(actual,expected,message){if(actual!=expected)fail(actual,expected,message,'==',assert.equal);}; // 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);
assert.notEqual=function notEqual(actual,expected,message){if(actual==expected){fail(actual,expected,message,'!=',assert.notEqual);}}; // 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);
assert.deepEqual=function deepEqual(actual,expected,message){if(!_deepEqual(actual,expected)){fail(actual,expected,message,'deepEqual',assert.deepEqual);}};function _deepEqual(actual,expected){ // 7.1. All identical values are equivalent, as determined by ===.
if(actual===expected){return true;}else if(util.isBuffer(actual)&&util.isBuffer(expected)){if(actual.length!=expected.length)return false;for(var i=0;i<actual.length;i++){if(actual[i]!==expected[i])return false;}return true; // 7.2. If the expected value is a Date object, the actual value is
// equivalent if it is also a Date object that refers to the same time.
}else if(util.isDate(actual)&&util.isDate(expected)){return actual.getTime()===expected.getTime(); // 7.3 If the expected value is a RegExp object, the actual value is
// equivalent if it is also a RegExp object with the same source and
// properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
}else if(util.isRegExp(actual)&&util.isRegExp(expected)){return actual.source===expected.source&&actual.global===expected.global&&actual.multiline===expected.multiline&&actual.lastIndex===expected.lastIndex&&actual.ignoreCase===expected.ignoreCase; // 7.4. Other pairs that do not both pass typeof value == 'object',
// equivalence is determined by ==.
}else if(!util.isObject(actual)&&!util.isObject(expected)){return actual==expected; // 7.5 For all other Object pairs, including Array objects, equivalence is
// determined by having the same number of owned properties (as verified
// with Object.prototype.hasOwnProperty.call), the same set of keys
// (although not necessarily the same order), equivalent values for every
// corresponding key, and an identical 'prototype' property. Note: this
// accounts for both named and indexed properties on Arrays.
}else {return objEquiv(actual,expected);}}function isArguments(object){return Object.prototype.toString.call(object)=='[object Arguments]';}function objEquiv(a,b){if(util.isNullOrUndefined(a)||util.isNullOrUndefined(b))return false; // an identical 'prototype' property.
if(a.prototype!==b.prototype)return false; // if one is a primitive, the other must be same
if(util.isPrimitive(a)||util.isPrimitive(b)){return a===b;}var aIsArgs=isArguments(a),bIsArgs=isArguments(b);if(aIsArgs&&!bIsArgs||!aIsArgs&&bIsArgs)return false;if(aIsArgs){a=pSlice.call(a);b=pSlice.call(b);return _deepEqual(a,b);}var ka=objectKeys(a),kb=objectKeys(b),key,i; // having the same number of owned properties (keys incorporates
// hasOwnProperty)
if(ka.length!=kb.length)return false; //the same set of keys (although not necessarily the same order),
ka.sort();kb.sort(); //~~~cheap key test
for(i=ka.length-1;i>=0;i--){if(ka[i]!=kb[i])return false;} //equivalent values for every corresponding key, and
//~~~possibly expensive deep test
for(i=ka.length-1;i>=0;i--){key=ka[i];if(!_deepEqual(a[key],b[key]))return false;}return true;} // 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);
assert.notDeepEqual=function notDeepEqual(actual,expected,message){if(_deepEqual(actual,expected)){fail(actual,expected,message,'notDeepEqual',assert.notDeepEqual);}}; // 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);
assert.strictEqual=function strictEqual(actual,expected,message){if(actual!==expected){fail(actual,expected,message,'===',assert.strictEqual);}}; // 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);
assert.notStrictEqual=function notStrictEqual(actual,expected,message){if(actual===expected){fail(actual,expected,message,'!==',assert.notStrictEqual);}};function expectedException(actual,expected){if(!actual||!expected){return false;}if(Object.prototype.toString.call(expected)=='[object RegExp]'){return expected.test(actual);}else if(actual instanceof expected){return true;}else if(expected.call({},actual)===true){return true;}return false;}function _throws(shouldThrow,block,expected,message){var actual;if(util.isString(expected)){message=expected;expected=null;}try{block();}catch(e){actual=e;}message=(expected&&expected.name?' ('+expected.name+').':'.')+(message?' '+message:'.');if(shouldThrow&&!actual){fail(actual,expected,'Missing expected exception'+message);}if(!shouldThrow&&expectedException(actual,expected)){fail(actual,expected,'Got unwanted exception'+message);}if(shouldThrow&&actual&&expected&&!expectedException(actual,expected)||!shouldThrow&&actual){throw actual;}} // 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);
assert.throws=function(block, /*optional*/error, /*optional*/message){_throws.apply(this,[true].concat(pSlice.call(arguments)));}; // EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow=function(block, /*optional*/message){_throws.apply(this,[false].concat(pSlice.call(arguments)));};assert.ifError=function(err){if(err){throw err;}};var objectKeys=Object.keys||function(obj){var keys=[];for(var key in obj){if(hasOwn.call(obj,key))keys.push(key);}return keys;};},{"util/":104}],3:[function(require,module,exports){'use strict';exports.toByteArray=toByteArray;exports.fromByteArray=fromByteArray;var lookup=[];var revLookup=[];var Arr=typeof Uint8Array!=='undefined'?Uint8Array:Array;function init(){var code='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';for(var i=0,len=code.length;i<len;++i){lookup[i]=code[i];revLookup[code.charCodeAt(i)]=i;}revLookup['-'.charCodeAt(0)]=62;revLookup['_'.charCodeAt(0)]=63;}init();function toByteArray(b64){var i,j,l,tmp,placeHolders,arr;var len=b64.length;if(len%4>0){throw new Error('Invalid string. Length must be a multiple of 4');} // the number of equal signs (place holders)
// if there are two placeholders, than the two characters before it
// represent one byte
// if there is only one, then the three characters before it represent 2 bytes
// this is just a cheap hack to not do indexOf twice
placeHolders=b64[len-2]==='='?2:b64[len-1]==='='?1:0; // base64 is 4/3 + up to two characters of the original data
arr=new Arr(len*3/4-placeHolders); // if there are placeholders, only get up to the last complete 4 chars
l=placeHolders>0?len-4:len;var L=0;for(i=0,j=0;i<l;i+=4,j+=3){tmp=revLookup[b64.charCodeAt(i)]<<18|revLookup[b64.charCodeAt(i+1)]<<12|revLookup[b64.charCodeAt(i+2)]<<6|revLookup[b64.charCodeAt(i+3)];arr[L++]=tmp>>16&0xFF;arr[L++]=tmp>>8&0xFF;arr[L++]=tmp&0xFF;}if(placeHolders===2){tmp=revLookup[b64.charCodeAt(i)]<<2|revLookup[b64.charCodeAt(i+1)]>>4;arr[L++]=tmp&0xFF;}else if(placeHolders===1){tmp=revLookup[b64.charCodeAt(i)]<<10|revLookup[b64.charCodeAt(i+1)]<<4|revLookup[b64.charCodeAt(i+2)]>>2;arr[L++]=tmp>>8&0xFF;arr[L++]=tmp&0xFF;}return arr;}function tripletToBase64(num){return lookup[num>>18&0x3F]+lookup[num>>12&0x3F]+lookup[num>>6&0x3F]+lookup[num&0x3F];}function encodeChunk(uint8,start,end){var tmp;var output=[];for(var i=start;i<end;i+=3){tmp=(uint8[i]<<16)+(uint8[i+1]<<8)+uint8[i+2];output.push(tripletToBase64(tmp));}return output.join('');}function fromByteArray(uint8){var tmp;var len=uint8.length;var extraBytes=len%3; // if we have 1 byte left, pad 2 bytes
var output='';var parts=[];var maxChunkLength=16383; // must be multiple of 3
// go through the array every three bytes, we'll deal with trailing stuff later
for(var i=0,len2=len-extraBytes;i<len2;i+=maxChunkLength){parts.push(encodeChunk(uint8,i,i+maxChunkLength>len2?len2:i+maxChunkLength));} // pad the end with zeros, but make sure to not forget the extra bytes
if(extraBytes===1){tmp=uint8[len-1];output+=lookup[tmp>>2];output+=lookup[tmp<<4&0x3F];output+='==';}else if(extraBytes===2){tmp=(uint8[len-2]<<8)+uint8[len-1];output+=lookup[tmp>>10];output+=lookup[tmp>>4&0x3F];output+=lookup[tmp<<2&0x3F];output+='=';}parts.push(output);return parts.join('');}},{}],4:[function(require,module,exports){ /*! bignumber.js v2.3.0 https://github.com/MikeMcl/bignumber.js/LICENCE */;(function(globalObj){'use strict'; /*
      bignumber.js v2.3.0
      A JavaScript library for arbitrary-precision arithmetic.
      https://github.com/MikeMcl/bignumber.js
      Copyright (c) 2016 Michael Mclaughlin <M8ch88l@gmail.com>
      MIT Expat Licence
    */var cryptoObj,parseNumeric,isNumeric=/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,mathceil=Math.ceil,mathfloor=Math.floor,notBool=' not a boolean or binary digit',roundingMode='rounding mode',tooManyDigits='number type has more than 15 significant digits',ALPHABET='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_',BASE=1e14,LOG_BASE=14,MAX_SAFE_INTEGER=0x1fffffffffffff, // 2^53 - 1
// MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
POWS_TEN=[1,10,100,1e3,1e4,1e5,1e6,1e7,1e8,1e9,1e10,1e11,1e12,1e13],SQRT_BASE=1e7, /*
         * The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
         * the arguments to toExponential, toFixed, toFormat, and toPrecision, beyond which an
         * exception is thrown (if ERRORS is true).
         */MAX=1E9; // 0 to MAX_INT32
if(typeof crypto!='undefined')cryptoObj=crypto; /*
     * Create and return a BigNumber constructor.
     */function constructorFactory(configObj){var div, // id tracks the caller function, so its name can be included in error messages.
id=0,P=BigNumber.prototype,ONE=new BigNumber(1), /********************************* EDITABLE DEFAULTS **********************************/ /*
             * The default values below must be integers within the inclusive ranges stated.
             * The values can also be changed at run-time using BigNumber.config.
             */ // The maximum number of decimal places for operations involving division.
DECIMAL_PLACES=20, // 0 to MAX
/*
             * The rounding mode used when rounding to the above decimal places, and when using
             * toExponential, toFixed, toFormat and toPrecision, and round (default value).
             * UP         0 Away from zero.
             * DOWN       1 Towards zero.
             * CEIL       2 Towards +Infinity.
             * FLOOR      3 Towards -Infinity.
             * HALF_UP    4 Towards nearest neighbour. If equidistant, up.
             * HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
             * HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
             * HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
             * HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
             */ROUNDING_MODE=4, // 0 to 8
// EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]
// The exponent value at and beneath which toString returns exponential notation.
// Number type: -7
TO_EXP_NEG=-7, // 0 to -MAX
// The exponent value at and above which toString returns exponential notation.
// Number type: 21
TO_EXP_POS=21, // 0 to MAX
// RANGE : [MIN_EXP, MAX_EXP]
// The minimum exponent value, beneath which underflow to zero occurs.
// Number type: -324  (5e-324)
MIN_EXP=-1e7, // -1 to -MAX
// The maximum exponent value, above which overflow to Infinity occurs.
// Number type:  308  (1.7976931348623157e+308)
// For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
MAX_EXP=1e7, // 1 to MAX
// Whether BigNumber Errors are ever thrown.
ERRORS=true, // true or false
// Change to intValidatorNoErrors if ERRORS is false.
isValidInt=intValidatorWithErrors, // intValidatorWithErrors/intValidatorNoErrors
// Whether to use cryptographically-secure random number generation, if available.
CRYPTO=false, // true or false
/*
             * The modulo mode used when calculating the modulus: a mod n.
             * The quotient (q = a / n) is calculated according to the corresponding rounding mode.
             * The remainder (r) is calculated as: r = a - n * q.
             *
             * UP        0 The remainder is positive if the dividend is negative, else is negative.
             * DOWN      1 The remainder has the same sign as the dividend.
             *             This modulo mode is commonly known as 'truncated division' and is
             *             equivalent to (a % n) in JavaScript.
             * FLOOR     3 The remainder has the same sign as the divisor (Python %).
             * HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
             * EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
             *             The remainder is always positive.
             *
             * The truncated division, floored division, Euclidian division and IEEE 754 remainder
             * modes are commonly used for the modulus operation.
             * Although the other rounding modes can also be used, they may not give useful results.
             */MODULO_MODE=1, // 0 to 9
// The maximum number of significant digits of the result of the toPower operation.
// If POW_PRECISION is 0, there will be unlimited significant digits.
POW_PRECISION=100, // 0 to MAX
// The format specification used by the BigNumber.prototype.toFormat method.
FORMAT={decimalSeparator:'.',groupSeparator:',',groupSize:3,secondaryGroupSize:0,fractionGroupSeparator:'\xA0', // non-breaking space
fractionGroupSize:0}; /******************************************************************************************/ // CONSTRUCTOR
/*
         * The BigNumber constructor and exported function.
         * Create and return a new instance of a BigNumber object.
         *
         * n {number|string|BigNumber} A numeric value.
         * [b] {number} The base of n. Integer, 2 to 64 inclusive.
         */function BigNumber(n,b){var c,e,i,num,len,str,x=this; // Enable constructor usage without new.
if(!(x instanceof BigNumber)){ // 'BigNumber() constructor call without new: {n}'
if(ERRORS)raise(26,'constructor call without new',n);return new BigNumber(n,b);} // 'new BigNumber() base not an integer: {b}'
// 'new BigNumber() base out of range: {b}'
if(b==null||!isValidInt(b,2,64,id,'base')){ // Duplicate.
if(n instanceof BigNumber){x.s=n.s;x.e=n.e;x.c=(n=n.c)?n.slice():n;id=0;return;}if((num=typeof n=='number')&&n*0==0){x.s=1/n<0?(n=-n,-1):1; // Fast path for integers.
if(n===~ ~n){for(e=0,i=n;i>=10;i/=10,e++){}x.e=e;x.c=[n];id=0;return;}str=n+'';}else {if(!isNumeric.test(str=n+''))return parseNumeric(x,str,num);x.s=str.charCodeAt(0)===45?(str=str.slice(1),-1):1;}}else {b=b|0;str=n+''; // Ensure return value is rounded to DECIMAL_PLACES as with other bases.
// Allow exponential notation to be used with base 10 argument.
if(b==10){x=new BigNumber(n instanceof BigNumber?n:str);return round(x,DECIMAL_PLACES+x.e+1,ROUNDING_MODE);} // Avoid potential interpretation of Infinity and NaN as base 44+ values.
// Any number in exponential form will fail due to the [Ee][+-].
if((num=typeof n=='number')&&n*0!=0||!new RegExp('^-?'+(c='['+ALPHABET.slice(0,b)+']+')+'(?:\\.'+c+')?$',b<37?'i':'').test(str)){return parseNumeric(x,str,num,b);}if(num){x.s=1/n<0?(str=str.slice(1),-1):1;if(ERRORS&&str.replace(/^0\.0*|\./,'').length>15){ // 'new BigNumber() number type has more than 15 significant digits: {n}'
raise(id,tooManyDigits,n);} // Prevent later check for length on converted number.
num=false;}else {x.s=str.charCodeAt(0)===45?(str=str.slice(1),-1):1;}str=convertBase(str,10,b,x.s);} // Decimal point?
if((e=str.indexOf('.'))>-1)str=str.replace('.',''); // Exponential form?
if((i=str.search(/e/i))>0){ // Determine exponent.
if(e<0)e=i;e+=+str.slice(i+1);str=str.substring(0,i);}else if(e<0){ // Integer.
e=str.length;} // Determine leading zeros.
for(i=0;str.charCodeAt(i)===48;i++){} // Determine trailing zeros.
for(len=str.length;str.charCodeAt(--len)===48;){}str=str.slice(i,len+1);if(str){len=str.length; // Disallow numbers with over 15 significant digits if number type.
// 'new BigNumber() number type has more than 15 significant digits: {n}'
if(num&&ERRORS&&len>15&&(n>MAX_SAFE_INTEGER||n!==mathfloor(n))){raise(id,tooManyDigits,x.s*n);}e=e-i-1; // Overflow?
if(e>MAX_EXP){ // Infinity.
x.c=x.e=null; // Underflow?
}else if(e<MIN_EXP){ // Zero.
x.c=[x.e=0];}else {x.e=e;x.c=[]; // Transform base
// e is the base 10 exponent.
// i is where to slice str to get the first element of the coefficient array.
i=(e+1)%LOG_BASE;if(e<0)i+=LOG_BASE;if(i<len){if(i)x.c.push(+str.slice(0,i));for(len-=LOG_BASE;i<len;){x.c.push(+str.slice(i,i+=LOG_BASE));}str=str.slice(i);i=LOG_BASE-str.length;}else {i-=len;}for(;i--;str+='0'){}x.c.push(+str);}}else { // Zero.
x.c=[x.e=0];}id=0;} // CONSTRUCTOR PROPERTIES
BigNumber.another=constructorFactory;BigNumber.ROUND_UP=0;BigNumber.ROUND_DOWN=1;BigNumber.ROUND_CEIL=2;BigNumber.ROUND_FLOOR=3;BigNumber.ROUND_HALF_UP=4;BigNumber.ROUND_HALF_DOWN=5;BigNumber.ROUND_HALF_EVEN=6;BigNumber.ROUND_HALF_CEIL=7;BigNumber.ROUND_HALF_FLOOR=8;BigNumber.EUCLID=9; /*
         * Configure infrequently-changing library-wide settings.
         *
         * Accept an object or an argument list, with one or many of the following properties or
         * parameters respectively:
         *
         *   DECIMAL_PLACES  {number}  Integer, 0 to MAX inclusive
         *   ROUNDING_MODE   {number}  Integer, 0 to 8 inclusive
         *   EXPONENTIAL_AT  {number|number[]}  Integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to 0 incl., 0 to MAX incl.]
         *   RANGE           {number|number[]}  Non-zero integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to -1 incl., integer 1 to MAX incl.]
         *   ERRORS          {boolean|number}   true, false, 1 or 0
         *   CRYPTO          {boolean|number}   true, false, 1 or 0
         *   MODULO_MODE     {number}           0 to 9 inclusive
         *   POW_PRECISION   {number}           0 to MAX inclusive
         *   FORMAT          {object}           See BigNumber.prototype.toFormat
         *      decimalSeparator       {string}
         *      groupSeparator         {string}
         *      groupSize              {number}
         *      secondaryGroupSize     {number}
         *      fractionGroupSeparator {string}
         *      fractionGroupSize      {number}
         *
         * (The values assigned to the above FORMAT object properties are not checked for validity.)
         *
         * E.g.
         * BigNumber.config(20, 4) is equivalent to
         * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
         *
         * Ignore properties/parameters set to null or undefined.
         * Return an object with the properties current values.
         */BigNumber.config=function(){var v,p,i=0,r={},a=arguments,o=a[0],has=o&&(typeof o==="undefined"?"undefined":_typeof(o))=='object'?function(){if(o.hasOwnProperty(p))return (v=o[p])!=null;}:function(){if(a.length>i)return (v=a[i++])!=null;}; // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
// 'config() DECIMAL_PLACES not an integer: {v}'
// 'config() DECIMAL_PLACES out of range: {v}'
if(has(p='DECIMAL_PLACES')&&isValidInt(v,0,MAX,2,p)){DECIMAL_PLACES=v|0;}r[p]=DECIMAL_PLACES; // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
// 'config() ROUNDING_MODE not an integer: {v}'
// 'config() ROUNDING_MODE out of range: {v}'
if(has(p='ROUNDING_MODE')&&isValidInt(v,0,8,2,p)){ROUNDING_MODE=v|0;}r[p]=ROUNDING_MODE; // EXPONENTIAL_AT {number|number[]}
// Integer, -MAX to MAX inclusive or [integer -MAX to 0 inclusive, 0 to MAX inclusive].
// 'config() EXPONENTIAL_AT not an integer: {v}'
// 'config() EXPONENTIAL_AT out of range: {v}'
if(has(p='EXPONENTIAL_AT')){if(isArray(v)){if(isValidInt(v[0],-MAX,0,2,p)&&isValidInt(v[1],0,MAX,2,p)){TO_EXP_NEG=v[0]|0;TO_EXP_POS=v[1]|0;}}else if(isValidInt(v,-MAX,MAX,2,p)){TO_EXP_NEG=-(TO_EXP_POS=(v<0?-v:v)|0);}}r[p]=[TO_EXP_NEG,TO_EXP_POS]; // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
// [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
// 'config() RANGE not an integer: {v}'
// 'config() RANGE cannot be zero: {v}'
// 'config() RANGE out of range: {v}'
if(has(p='RANGE')){if(isArray(v)){if(isValidInt(v[0],-MAX,-1,2,p)&&isValidInt(v[1],1,MAX,2,p)){MIN_EXP=v[0]|0;MAX_EXP=v[1]|0;}}else if(isValidInt(v,-MAX,MAX,2,p)){if(v|0)MIN_EXP=-(MAX_EXP=(v<0?-v:v)|0);else if(ERRORS)raise(2,p+' cannot be zero',v);}}r[p]=[MIN_EXP,MAX_EXP]; // ERRORS {boolean|number} true, false, 1 or 0.
// 'config() ERRORS not a boolean or binary digit: {v}'
if(has(p='ERRORS')){if(v===!!v||v===1||v===0){id=0;isValidInt=(ERRORS=!!v)?intValidatorWithErrors:intValidatorNoErrors;}else if(ERRORS){raise(2,p+notBool,v);}}r[p]=ERRORS; // CRYPTO {boolean|number} true, false, 1 or 0.
// 'config() CRYPTO not a boolean or binary digit: {v}'
// 'config() crypto unavailable: {crypto}'
if(has(p='CRYPTO')){if(v===!!v||v===1||v===0){CRYPTO=!!(v&&cryptoObj);if(v&&!CRYPTO&&ERRORS)raise(2,'crypto unavailable',cryptoObj);}else if(ERRORS){raise(2,p+notBool,v);}}r[p]=CRYPTO; // MODULO_MODE {number} Integer, 0 to 9 inclusive.
// 'config() MODULO_MODE not an integer: {v}'
// 'config() MODULO_MODE out of range: {v}'
if(has(p='MODULO_MODE')&&isValidInt(v,0,9,2,p)){MODULO_MODE=v|0;}r[p]=MODULO_MODE; // POW_PRECISION {number} Integer, 0 to MAX inclusive.
// 'config() POW_PRECISION not an integer: {v}'
// 'config() POW_PRECISION out of range: {v}'
if(has(p='POW_PRECISION')&&isValidInt(v,0,MAX,2,p)){POW_PRECISION=v|0;}r[p]=POW_PRECISION; // FORMAT {object}
// 'config() FORMAT not an object: {v}'
if(has(p='FORMAT')){if((typeof v==="undefined"?"undefined":_typeof(v))=='object'){FORMAT=v;}else if(ERRORS){raise(2,p+' not an object',v);}}r[p]=FORMAT;return r;}; /*
         * Return a new BigNumber whose value is the maximum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */BigNumber.max=function(){return maxOrMin(arguments,P.lt);}; /*
         * Return a new BigNumber whose value is the minimum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */BigNumber.min=function(){return maxOrMin(arguments,P.gt);}; /*
         * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
         * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
         * zeros are produced).
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         *
         * 'random() decimal places not an integer: {dp}'
         * 'random() decimal places out of range: {dp}'
         * 'random() crypto unavailable: {crypto}'
         */BigNumber.random=function(){var pow2_53=0x20000000000000; // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
// Check if Math.random() produces more than 32 bits of randomness.
// If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
// 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
var random53bitInt=Math.random()*pow2_53&0x1fffff?function(){return mathfloor(Math.random()*pow2_53);}:function(){return (Math.random()*0x40000000|0)*0x800000+(Math.random()*0x800000|0);};return function(dp){var a,b,e,k,v,i=0,c=[],rand=new BigNumber(ONE);dp=dp==null||!isValidInt(dp,0,MAX,14)?DECIMAL_PLACES:dp|0;k=mathceil(dp/LOG_BASE);if(CRYPTO){ // Browsers supporting crypto.getRandomValues.
if(cryptoObj&&cryptoObj.getRandomValues){a=cryptoObj.getRandomValues(new Uint32Array(k*=2));for(;i<k;){ // 53 bits:
// ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
// 11111 11111111 11111111 11111111 11100000 00000000 00000000
// ((Math.pow(2, 32) - 1) >>> 11).toString(2)
//                                     11111 11111111 11111111
// 0x20000 is 2^21.
v=a[i]*0x20000+(a[i+1]>>>11); // Rejection sampling:
// 0 <= v < 9007199254740992
// Probability that v >= 9e15, is
// 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
if(v>=9e15){b=cryptoObj.getRandomValues(new Uint32Array(2));a[i]=b[0];a[i+1]=b[1];}else { // 0 <= v <= 8999999999999999
// 0 <= (v % 1e14) <= 99999999999999
c.push(v%1e14);i+=2;}}i=k/2; // Node.js supporting crypto.randomBytes.
}else if(cryptoObj&&cryptoObj.randomBytes){ // buffer
a=cryptoObj.randomBytes(k*=7);for(;i<k;){ // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
// 0x100000000 is 2^32, 0x1000000 is 2^24
// 11111 11111111 11111111 11111111 11111111 11111111 11111111
// 0 <= v < 9007199254740992
v=(a[i]&31)*0x1000000000000+a[i+1]*0x10000000000+a[i+2]*0x100000000+a[i+3]*0x1000000+(a[i+4]<<16)+(a[i+5]<<8)+a[i+6];if(v>=9e15){cryptoObj.randomBytes(7).copy(a,i);}else { // 0 <= (v % 1e14) <= 99999999999999
c.push(v%1e14);i+=7;}}i=k/7;}else if(ERRORS){raise(14,'crypto unavailable',cryptoObj);}} // Use Math.random: CRYPTO is false or crypto is unavailable and ERRORS is false.
if(!i){for(;i<k;){v=random53bitInt();if(v<9e15)c[i++]=v%1e14;}}k=c[--i];dp%=LOG_BASE; // Convert trailing digits to zeros according to dp.
if(k&&dp){v=POWS_TEN[LOG_BASE-dp];c[i]=mathfloor(k/v)*v;} // Remove trailing elements which are zero.
for(;c[i]===0;c.pop(),i--){} // Zero?
if(i<0){c=[e=0];}else { // Remove leading elements which are zero and adjust exponent accordingly.
for(e=-1;c[0]===0;c.shift(),e-=LOG_BASE){} // Count the digits of the first element of c to determine leading zeros, and...
for(i=1,v=c[0];v>=10;v/=10,i++){} // adjust the exponent accordingly.
if(i<LOG_BASE)e-=LOG_BASE-i;}rand.e=e;rand.c=c;return rand;};}(); // PRIVATE FUNCTIONS
// Convert a numeric string of baseIn to a numeric string of baseOut.
function convertBase(str,baseOut,baseIn,sign){var d,e,k,r,x,xc,y,i=str.indexOf('.'),dp=DECIMAL_PLACES,rm=ROUNDING_MODE;if(baseIn<37)str=str.toLowerCase(); // Non-integer.
if(i>=0){k=POW_PRECISION; // Unlimited precision.
POW_PRECISION=0;str=str.replace('.','');y=new BigNumber(baseIn);x=y.pow(str.length-i);POW_PRECISION=k; // Convert str as if an integer, then restore the fraction part by dividing the
// result by its base raised to a power.
y.c=toBaseOut(toFixedPoint(coeffToString(x.c),x.e),10,baseOut);y.e=y.c.length;} // Convert the number as integer.
xc=toBaseOut(str,baseIn,baseOut);e=k=xc.length; // Remove trailing zeros.
for(;xc[--k]==0;xc.pop()){}if(!xc[0])return '0';if(i<0){--e;}else {x.c=xc;x.e=e; // sign is needed for correct rounding.
x.s=sign;x=div(x,y,dp,rm,baseOut);xc=x.c;r=x.r;e=x.e;}d=e+dp+1; // The rounding digit, i.e. the digit to the right of the digit that may be rounded up.
i=xc[d];k=baseOut/2;r=r||d<0||xc[d+1]!=null;r=rm<4?(i!=null||r)&&(rm==0||rm==(x.s<0?3:2)):i>k||i==k&&(rm==4||r||rm==6&&xc[d-1]&1||rm==(x.s<0?8:7));if(d<1||!xc[0]){ // 1^-dp or 0.
str=r?toFixedPoint('1',-dp):'0';}else {xc.length=d;if(r){ // Rounding up may mean the previous digit has to be rounded up and so on.
for(--baseOut;++xc[--d]>baseOut;){xc[d]=0;if(!d){++e;xc.unshift(1);}}} // Determine trailing zeros.
for(k=xc.length;!xc[--k];){} // E.g. [4, 11, 15] becomes 4bf.
for(i=0,str='';i<=k;str+=ALPHABET.charAt(xc[i++])){}str=toFixedPoint(str,e);} // The caller will add the sign.
return str;} // Perform division in the specified base. Called by div and convertBase.
div=function(){ // Assume non-zero x and k.
function multiply(x,k,base){var m,temp,xlo,xhi,carry=0,i=x.length,klo=k%SQRT_BASE,khi=k/SQRT_BASE|0;for(x=x.slice();i--;){xlo=x[i]%SQRT_BASE;xhi=x[i]/SQRT_BASE|0;m=khi*xlo+xhi*klo;temp=klo*xlo+m%SQRT_BASE*SQRT_BASE+carry;carry=(temp/base|0)+(m/SQRT_BASE|0)+khi*xhi;x[i]=temp%base;}if(carry)x.unshift(carry);return x;}function compare(a,b,aL,bL){var i,cmp;if(aL!=bL){cmp=aL>bL?1:-1;}else {for(i=cmp=0;i<aL;i++){if(a[i]!=b[i]){cmp=a[i]>b[i]?1:-1;break;}}}return cmp;}function subtract(a,b,aL,base){var i=0; // Subtract b from a.
for(;aL--;){a[aL]-=i;i=a[aL]<b[aL]?1:0;a[aL]=i*base+a[aL]-b[aL];} // Remove leading zeros.
for(;!a[0]&&a.length>1;a.shift()){}} // x: dividend, y: divisor.
return function(x,y,dp,rm,base){var cmp,e,i,more,n,prod,prodL,q,qc,rem,remL,rem0,xi,xL,yc0,yL,yz,s=x.s==y.s?1:-1,xc=x.c,yc=y.c; // Either NaN, Infinity or 0?
if(!xc||!xc[0]||!yc||!yc[0]){return new BigNumber( // Return NaN if either NaN, or both Infinity or 0.
!x.s||!y.s||(xc?yc&&xc[0]==yc[0]:!yc)?NaN: // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
xc&&xc[0]==0||!yc?s*0:s/0);}q=new BigNumber(s);qc=q.c=[];e=x.e-y.e;s=dp+e+1;if(!base){base=BASE;e=bitFloor(x.e/LOG_BASE)-bitFloor(y.e/LOG_BASE);s=s/LOG_BASE|0;} // Result exponent may be one less then the current value of e.
// The coefficients of the BigNumbers from convertBase may have trailing zeros.
for(i=0;yc[i]==(xc[i]||0);i++){}if(yc[i]>(xc[i]||0))e--;if(s<0){qc.push(1);more=true;}else {xL=xc.length;yL=yc.length;i=0;s+=2; // Normalise xc and yc so highest order digit of yc is >= base / 2.
n=mathfloor(base/(yc[0]+1)); // Not necessary, but to handle odd bases where yc[0] == ( base / 2 ) - 1.
// if ( n > 1 || n++ == 1 && yc[0] < base / 2 ) {
if(n>1){yc=multiply(yc,n,base);xc=multiply(xc,n,base);yL=yc.length;xL=xc.length;}xi=yL;rem=xc.slice(0,yL);remL=rem.length; // Add zeros to make remainder as long as divisor.
for(;remL<yL;rem[remL++]=0){}yz=yc.slice();yz.unshift(0);yc0=yc[0];if(yc[1]>=base/2)yc0++; // Not necessary, but to prevent trial digit n > base, when using base 3.
// else if ( base == 3 && yc0 == 1 ) yc0 = 1 + 1e-15;
do {n=0; // Compare divisor and remainder.
cmp=compare(yc,rem,yL,remL); // If divisor < remainder.
if(cmp<0){ // Calculate trial digit, n.
rem0=rem[0];if(yL!=remL)rem0=rem0*base+(rem[1]||0); // n is how many times the divisor goes into the current remainder.
n=mathfloor(rem0/yc0); //  Algorithm:
//  1. product = divisor * trial digit (n)
//  2. if product > remainder: product -= divisor, n--
//  3. remainder -= product
//  4. if product was < remainder at 2:
//    5. compare new remainder and divisor
//    6. If remainder > divisor: remainder -= divisor, n++
if(n>1){ // n may be > base only when base is 3.
if(n>=base)n=base-1; // product = divisor * trial digit.
prod=multiply(yc,n,base);prodL=prod.length;remL=rem.length; // Compare product and remainder.
// If product > remainder.
// Trial digit n too high.
// n is 1 too high about 5% of the time, and is not known to have
// ever been more than 1 too high.
while(compare(prod,rem,prodL,remL)==1){n--; // Subtract divisor from product.
subtract(prod,yL<prodL?yz:yc,prodL,base);prodL=prod.length;cmp=1;}}else { // n is 0 or 1, cmp is -1.
// If n is 0, there is no need to compare yc and rem again below,
// so change cmp to 1 to avoid it.
// If n is 1, leave cmp as -1, so yc and rem are compared again.
if(n==0){ // divisor < remainder, so n must be at least 1.
cmp=n=1;} // product = divisor
prod=yc.slice();prodL=prod.length;}if(prodL<remL)prod.unshift(0); // Subtract product from remainder.
subtract(rem,prod,remL,base);remL=rem.length; // If product was < remainder.
if(cmp==-1){ // Compare divisor and new remainder.
// If divisor < new remainder, subtract divisor from remainder.
// Trial digit n too low.
// n is 1 too low about 5% of the time, and very rarely 2 too low.
while(compare(yc,rem,yL,remL)<1){n++; // Subtract divisor from remainder.
subtract(rem,yL<remL?yz:yc,remL,base);remL=rem.length;}}}else if(cmp===0){n++;rem=[0];} // else cmp === 1 and n will be 0
// Add the next digit, n, to the result array.
qc[i++]=n; // Update the remainder.
if(rem[0]){rem[remL++]=xc[xi]||0;}else {rem=[xc[xi]];remL=1;}}while((xi++<xL||rem[0]!=null)&&s--);more=rem[0]!=null; // Leading zero?
if(!qc[0])qc.shift();}if(base==BASE){ // To calculate q.e, first get the number of digits of qc[0].
for(i=1,s=qc[0];s>=10;s/=10,i++){}round(q,dp+(q.e=i+e*LOG_BASE-1)+1,rm,more); // Caller is convertBase.
}else {q.e=e;q.r=+more;}return q;};}(); /*
         * Return a string representing the value of BigNumber n in fixed-point or exponential
         * notation rounded to the specified decimal places or significant digits.
         *
         * n is a BigNumber.
         * i is the index of the last digit required (i.e. the digit that may be rounded up).
         * rm is the rounding mode.
         * caller is caller id: toExponential 19, toFixed 20, toFormat 21, toPrecision 24.
         */function format(n,i,rm,caller){var c0,e,ne,len,str;rm=rm!=null&&isValidInt(rm,0,8,caller,roundingMode)?rm|0:ROUNDING_MODE;if(!n.c)return n.toString();c0=n.c[0];ne=n.e;if(i==null){str=coeffToString(n.c);str=caller==19||caller==24&&ne<=TO_EXP_NEG?toExponential(str,ne):toFixedPoint(str,ne);}else {n=round(new BigNumber(n),i,rm); // n.e may have changed if the value was rounded up.
e=n.e;str=coeffToString(n.c);len=str.length; // toPrecision returns exponential notation if the number of significant digits
// specified is less than the number of digits necessary to represent the integer
// part of the value in fixed-point notation.
// Exponential notation.
if(caller==19||caller==24&&(i<=e||e<=TO_EXP_NEG)){ // Append zeros?
for(;len<i;str+='0',len++){}str=toExponential(str,e); // Fixed-point notation.
}else {i-=ne;str=toFixedPoint(str,e); // Append zeros?
if(e+1>len){if(--i>0)for(str+='.';i--;str+='0'){}}else {i+=e-len;if(i>0){if(e+1==len)str+='.';for(;i--;str+='0'){}}}}}return n.s<0&&c0?'-'+str:str;} // Handle BigNumber.max and BigNumber.min.
function maxOrMin(args,method){var m,n,i=0;if(isArray(args[0]))args=args[0];m=new BigNumber(args[0]);for(;++i<args.length;){n=new BigNumber(args[i]); // If any number is NaN, return NaN.
if(!n.s){m=n;break;}else if(method.call(m,n)){m=n;}}return m;} /*
         * Return true if n is an integer in range, otherwise throw.
         * Use for argument validation when ERRORS is true.
         */function intValidatorWithErrors(n,min,max,caller,name){if(n<min||n>max||n!=truncate(n)){raise(caller,(name||'decimal places')+(n<min||n>max?' out of range':' not an integer'),n);}return true;} /*
         * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
         * Called by minus, plus and times.
         */function normalise(n,c,e){var i=1,j=c.length; // Remove trailing zeros.
for(;!c[--j];c.pop()){} // Calculate the base 10 exponent. First get the number of digits of c[0].
for(j=c[0];j>=10;j/=10,i++){} // Overflow?
if((e=i+e*LOG_BASE-1)>MAX_EXP){ // Infinity.
n.c=n.e=null; // Underflow?
}else if(e<MIN_EXP){ // Zero.
n.c=[n.e=0];}else {n.e=e;n.c=c;}return n;} // Handle values that fail the validity test in BigNumber.
parseNumeric=function(){var basePrefix=/^(-?)0([xbo])(?=\w[\w.]*$)/i,dotAfter=/^([^.]+)\.$/,dotBefore=/^\.([^.]+)$/,isInfinityOrNaN=/^-?(Infinity|NaN)$/,whitespaceOrPlus=/^\s*\+(?=[\w.])|^\s+|\s+$/g;return function(x,str,num,b){var base,s=num?str:str.replace(whitespaceOrPlus,''); // No exception on ±Infinity or NaN.
if(isInfinityOrNaN.test(s)){x.s=isNaN(s)?null:s<0?-1:1;}else {if(!num){ // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
s=s.replace(basePrefix,function(m,p1,p2){base=(p2=p2.toLowerCase())=='x'?16:p2=='b'?2:8;return !b||b==base?p1:m;});if(b){base=b; // E.g. '1.' to '1', '.1' to '0.1'
s=s.replace(dotAfter,'$1').replace(dotBefore,'0.$1');}if(str!=s)return new BigNumber(s,base);} // 'new BigNumber() not a number: {n}'
// 'new BigNumber() not a base {b} number: {n}'
if(ERRORS)raise(id,'not a'+(b?' base '+b:'')+' number',str);x.s=null;}x.c=x.e=null;id=0;};}(); // Throw a BigNumber Error.
function raise(caller,msg,val){var error=new Error(['new BigNumber', // 0
'cmp', // 1
'config', // 2
'div', // 3
'divToInt', // 4
'eq', // 5
'gt', // 6
'gte', // 7
'lt', // 8
'lte', // 9
'minus', // 10
'mod', // 11
'plus', // 12
'precision', // 13
'random', // 14
'round', // 15
'shift', // 16
'times', // 17
'toDigits', // 18
'toExponential', // 19
'toFixed', // 20
'toFormat', // 21
'toFraction', // 22
'pow', // 23
'toPrecision', // 24
'toString', // 25
'BigNumber' // 26
][caller]+'() '+msg+': '+val);error.name='BigNumber Error';id=0;throw error;} /*
         * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
         * If r is truthy, it is known that there are more digits after the rounding digit.
         */function round(x,sd,rm,r){var d,i,j,k,n,ni,rd,xc=x.c,pows10=POWS_TEN; // if x is not Infinity or NaN...
if(xc){ // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
// n is a base 1e14 number, the value of the element of array x.c containing rd.
// ni is the index of n within x.c.
// d is the number of digits of n.
// i is the index of rd within n including leading zeros.
// j is the actual index of rd within n (if < 0, rd is a leading zero).
out: { // Get the number of digits of the first element of xc.
for(d=1,k=xc[0];k>=10;k/=10,d++){}i=sd-d; // If the rounding digit is in the first element of xc...
if(i<0){i+=LOG_BASE;j=sd;n=xc[ni=0]; // Get the rounding digit at index j of n.
rd=n/pows10[d-j-1]%10|0;}else {ni=mathceil((i+1)/LOG_BASE);if(ni>=xc.length){if(r){ // Needed by sqrt.
for(;xc.length<=ni;xc.push(0)){}n=rd=0;d=1;i%=LOG_BASE;j=i-LOG_BASE+1;}else {break out;}}else {n=k=xc[ni]; // Get the number of digits of n.
for(d=1;k>=10;k/=10,d++){} // Get the index of rd within n.
i%=LOG_BASE; // Get the index of rd within n, adjusted for leading zeros.
// The number of leading zeros of n is given by LOG_BASE - d.
j=i-LOG_BASE+d; // Get the rounding digit at index j of n.
rd=j<0?0:n/pows10[d-j-1]%10|0;}}r=r||sd<0|| // Are there any non-zero digits after the rounding digit?
// The expression  n % pows10[ d - j - 1 ]  returns all digits of n to the right
// of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
xc[ni+1]!=null||(j<0?n:n%pows10[d-j-1]);r=rm<4?(rd||r)&&(rm==0||rm==(x.s<0?3:2)):rd>5||rd==5&&(rm==4||r||rm==6&& // Check whether the digit to the left of the rounding digit is odd.
(i>0?j>0?n/pows10[d-j]:0:xc[ni-1])%10&1||rm==(x.s<0?8:7));if(sd<1||!xc[0]){xc.length=0;if(r){ // Convert sd to decimal places.
sd-=x.e+1; // 1, 0.1, 0.01, 0.001, 0.0001 etc.
xc[0]=pows10[(LOG_BASE-sd%LOG_BASE)%LOG_BASE];x.e=-sd||0;}else { // Zero.
xc[0]=x.e=0;}return x;} // Remove excess digits.
if(i==0){xc.length=ni;k=1;ni--;}else {xc.length=ni+1;k=pows10[LOG_BASE-i]; // E.g. 56700 becomes 56000 if 7 is the rounding digit.
// j > 0 means i > number of leading zeros of n.
xc[ni]=j>0?mathfloor(n/pows10[d-j]%pows10[j])*k:0;} // Round up?
if(r){for(;;){ // If the digit to be rounded up is in the first element of xc...
if(ni==0){ // i will be the length of xc[0] before k is added.
for(i=1,j=xc[0];j>=10;j/=10,i++){}j=xc[0]+=k;for(k=1;j>=10;j/=10,k++){} // if i != k the length has increased.
if(i!=k){x.e++;if(xc[0]==BASE)xc[0]=1;}break;}else {xc[ni]+=k;if(xc[ni]!=BASE)break;xc[ni--]=0;k=1;}}} // Remove trailing zeros.
for(i=xc.length;xc[--i]===0;xc.pop()){}} // Overflow? Infinity.
if(x.e>MAX_EXP){x.c=x.e=null; // Underflow? Zero.
}else if(x.e<MIN_EXP){x.c=[x.e=0];}}return x;} // PROTOTYPE/INSTANCE METHODS
/*
         * Return a new BigNumber whose value is the absolute value of this BigNumber.
         */P.absoluteValue=P.abs=function(){var x=new BigNumber(this);if(x.s<0)x.s=1;return x;}; /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of Infinity.
         */P.ceil=function(){return round(new BigNumber(this),this.e+1,2);}; /*
         * Return
         * 1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
         * 0 if they have the same value,
         * or null if the value of either is NaN.
         */P.comparedTo=P.cmp=function(y,b){id=1;return compare(this,new BigNumber(y,b));}; /*
         * Return the number of decimal places of the value of this BigNumber, or null if the value
         * of this BigNumber is ±Infinity or NaN.
         */P.decimalPlaces=P.dp=function(){var n,v,c=this.c;if(!c)return null;n=((v=c.length-1)-bitFloor(this.e/LOG_BASE))*LOG_BASE; // Subtract the number of trailing zeros of the last number.
if(v=c[v])for(;v%10==0;v/=10,n--){}if(n<0)n=0;return n;}; /*
         *  n / 0 = I
         *  n / N = N
         *  n / I = 0
         *  0 / n = 0
         *  0 / 0 = N
         *  0 / N = N
         *  0 / I = 0
         *  N / n = N
         *  N / 0 = N
         *  N / N = N
         *  N / I = N
         *  I / n = I
         *  I / 0 = I
         *  I / N = N
         *  I / I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
         * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */P.dividedBy=P.div=function(y,b){id=3;return div(this,new BigNumber(y,b),DECIMAL_PLACES,ROUNDING_MODE);}; /*
         * Return a new BigNumber whose value is the integer part of dividing the value of this
         * BigNumber by the value of BigNumber(y, b).
         */P.dividedToIntegerBy=P.divToInt=function(y,b){id=4;return div(this,new BigNumber(y,b),0,1);}; /*
         * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
         * otherwise returns false.
         */P.equals=P.eq=function(y,b){id=5;return compare(this,new BigNumber(y,b))===0;}; /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of -Infinity.
         */P.floor=function(){return round(new BigNumber(this),this.e+1,3);}; /*
         * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * otherwise returns false.
         */P.greaterThan=P.gt=function(y,b){id=6;return compare(this,new BigNumber(y,b))>0;}; /*
         * Return true if the value of this BigNumber is greater than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */P.greaterThanOrEqualTo=P.gte=function(y,b){id=7;return (b=compare(this,new BigNumber(y,b)))===1||b===0;}; /*
         * Return true if the value of this BigNumber is a finite number, otherwise returns false.
         */P.isFinite=function(){return !!this.c;}; /*
         * Return true if the value of this BigNumber is an integer, otherwise return false.
         */P.isInteger=P.isInt=function(){return !!this.c&&bitFloor(this.e/LOG_BASE)>this.c.length-2;}; /*
         * Return true if the value of this BigNumber is NaN, otherwise returns false.
         */P.isNaN=function(){return !this.s;}; /*
         * Return true if the value of this BigNumber is negative, otherwise returns false.
         */P.isNegative=P.isNeg=function(){return this.s<0;}; /*
         * Return true if the value of this BigNumber is 0 or -0, otherwise returns false.
         */P.isZero=function(){return !!this.c&&this.c[0]==0;}; /*
         * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
         * otherwise returns false.
         */P.lessThan=P.lt=function(y,b){id=8;return compare(this,new BigNumber(y,b))<0;}; /*
         * Return true if the value of this BigNumber is less than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */P.lessThanOrEqualTo=P.lte=function(y,b){id=9;return (b=compare(this,new BigNumber(y,b)))===-1||b===0;}; /*
         *  n - 0 = n
         *  n - N = N
         *  n - I = -I
         *  0 - n = -n
         *  0 - 0 = 0
         *  0 - N = N
         *  0 - I = -I
         *  N - n = N
         *  N - 0 = N
         *  N - N = N
         *  N - I = N
         *  I - n = I
         *  I - 0 = I
         *  I - N = N
         *  I - I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber minus the value of
         * BigNumber(y, b).
         */P.minus=P.sub=function(y,b){var i,j,t,xLTy,x=this,a=x.s;id=10;y=new BigNumber(y,b);b=y.s; // Either NaN?
if(!a||!b)return new BigNumber(NaN); // Signs differ?
if(a!=b){y.s=-b;return x.plus(y);}var xe=x.e/LOG_BASE,ye=y.e/LOG_BASE,xc=x.c,yc=y.c;if(!xe||!ye){ // Either Infinity?
if(!xc||!yc)return xc?(y.s=-b,y):new BigNumber(yc?x:NaN); // Either zero?
if(!xc[0]||!yc[0]){ // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
return yc[0]?(y.s=-b,y):new BigNumber(xc[0]?x: // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
ROUNDING_MODE==3?-0:0);}}xe=bitFloor(xe);ye=bitFloor(ye);xc=xc.slice(); // Determine which is the bigger number.
if(a=xe-ye){if(xLTy=a<0){a=-a;t=xc;}else {ye=xe;t=yc;}t.reverse(); // Prepend zeros to equalise exponents.
for(b=a;b--;t.push(0)){}t.reverse();}else { // Exponents equal. Check digit by digit.
j=(xLTy=(a=xc.length)<(b=yc.length))?a:b;for(a=b=0;b<j;b++){if(xc[b]!=yc[b]){xLTy=xc[b]<yc[b];break;}}} // x < y? Point xc to the array of the bigger number.
if(xLTy)t=xc,xc=yc,yc=t,y.s=-y.s;b=(j=yc.length)-(i=xc.length); // Append zeros to xc if shorter.
// No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
if(b>0)for(;b--;xc[i++]=0){}b=BASE-1; // Subtract yc from xc.
for(;j>a;){if(xc[--j]<yc[j]){for(i=j;i&&!xc[--i];xc[i]=b){}--xc[i];xc[j]+=BASE;}xc[j]-=yc[j];} // Remove leading zeros and adjust exponent accordingly.
for(;xc[0]==0;xc.shift(),--ye){} // Zero?
if(!xc[0]){ // Following IEEE 754 (2008) 6.3,
// n - n = +0  but  n - n = -0  when rounding towards -Infinity.
y.s=ROUNDING_MODE==3?-1:1;y.c=[y.e=0];return y;} // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
// for finite x and y.
return normalise(y,xc,ye);}; /*
         *   n % 0 =  N
         *   n % N =  N
         *   n % I =  n
         *   0 % n =  0
         *  -0 % n = -0
         *   0 % 0 =  N
         *   0 % N =  N
         *   0 % I =  0
         *   N % n =  N
         *   N % 0 =  N
         *   N % N =  N
         *   N % I =  N
         *   I % n =  N
         *   I % 0 =  N
         *   I % N =  N
         *   I % I =  N
         *
         * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
         * BigNumber(y, b). The result depends on the value of MODULO_MODE.
         */P.modulo=P.mod=function(y,b){var q,s,x=this;id=11;y=new BigNumber(y,b); // Return NaN if x is Infinity or NaN, or y is NaN or zero.
if(!x.c||!y.s||y.c&&!y.c[0]){return new BigNumber(NaN); // Return x if y is Infinity or x is zero.
}else if(!y.c||x.c&&!x.c[0]){return new BigNumber(x);}if(MODULO_MODE==9){ // Euclidian division: q = sign(y) * floor(x / abs(y))
// r = x - qy    where  0 <= r < abs(y)
s=y.s;y.s=1;q=div(x,y,0,3);y.s=s;q.s*=s;}else {q=div(x,y,0,MODULO_MODE);}return x.minus(q.times(y));}; /*
         * Return a new BigNumber whose value is the value of this BigNumber negated,
         * i.e. multiplied by -1.
         */P.negated=P.neg=function(){var x=new BigNumber(this);x.s=-x.s||null;return x;}; /*
         *  n + 0 = n
         *  n + N = N
         *  n + I = I
         *  0 + n = n
         *  0 + 0 = 0
         *  0 + N = N
         *  0 + I = I
         *  N + n = N
         *  N + 0 = N
         *  N + N = N
         *  N + I = N
         *  I + n = I
         *  I + 0 = I
         *  I + N = N
         *  I + I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber plus the value of
         * BigNumber(y, b).
         */P.plus=P.add=function(y,b){var t,x=this,a=x.s;id=12;y=new BigNumber(y,b);b=y.s; // Either NaN?
if(!a||!b)return new BigNumber(NaN); // Signs differ?
if(a!=b){y.s=-b;return x.minus(y);}var xe=x.e/LOG_BASE,ye=y.e/LOG_BASE,xc=x.c,yc=y.c;if(!xe||!ye){ // Return ±Infinity if either ±Infinity.
if(!xc||!yc)return new BigNumber(a/0); // Either zero?
// Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
if(!xc[0]||!yc[0])return yc[0]?y:new BigNumber(xc[0]?x:a*0);}xe=bitFloor(xe);ye=bitFloor(ye);xc=xc.slice(); // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
if(a=xe-ye){if(a>0){ye=xe;t=yc;}else {a=-a;t=xc;}t.reverse();for(;a--;t.push(0)){}t.reverse();}a=xc.length;b=yc.length; // Point xc to the longer array, and b to the shorter length.
if(a-b<0)t=yc,yc=xc,xc=t,b=a; // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
for(a=0;b;){a=(xc[--b]=xc[b]+yc[b]+a)/BASE|0;xc[b]%=BASE;}if(a){xc.unshift(a);++ye;} // No need to check for zero, as +x + +y != 0 && -x + -y != 0
// ye = MAX_EXP + 1 possible
return normalise(y,xc,ye);}; /*
         * Return the number of significant digits of the value of this BigNumber.
         *
         * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
         */P.precision=P.sd=function(z){var n,v,x=this,c=x.c; // 'precision() argument not a boolean or binary digit: {z}'
if(z!=null&&z!==!!z&&z!==1&&z!==0){if(ERRORS)raise(13,'argument'+notBool,z);if(z!=!!z)z=null;}if(!c)return null;v=c.length-1;n=v*LOG_BASE+1;if(v=c[v]){ // Subtract the number of trailing zeros of the last element.
for(;v%10==0;v/=10,n--){} // Add the number of digits of the first element.
for(v=c[0];v>=10;v/=10,n++){}}if(z&&x.e+1>n)n=x.e+1;return n;}; /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * dp decimal places using rounding mode rm, or to 0 and ROUNDING_MODE respectively if
         * omitted.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'round() decimal places out of range: {dp}'
         * 'round() decimal places not an integer: {dp}'
         * 'round() rounding mode not an integer: {rm}'
         * 'round() rounding mode out of range: {rm}'
         */P.round=function(dp,rm){var n=new BigNumber(this);if(dp==null||isValidInt(dp,0,MAX,15)){round(n,~ ~dp+this.e+1,rm==null||!isValidInt(rm,0,8,15,roundingMode)?ROUNDING_MODE:rm|0);}return n;}; /*
         * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
         * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
         *
         * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         *
         * If k is out of range and ERRORS is false, the result will be ±0 if k < 0, or ±Infinity
         * otherwise.
         *
         * 'shift() argument not an integer: {k}'
         * 'shift() argument out of range: {k}'
         */P.shift=function(k){var n=this;return isValidInt(k,-MAX_SAFE_INTEGER,MAX_SAFE_INTEGER,16,'argument') // k < 1e+21, or truncate(k) will produce exponential notation.
?n.times('1e'+truncate(k)):new BigNumber(n.c&&n.c[0]&&(k<-MAX_SAFE_INTEGER||k>MAX_SAFE_INTEGER)?n.s*(k<0?0:1/0):n);}; /*
         *  sqrt(-n) =  N
         *  sqrt( N) =  N
         *  sqrt(-I) =  N
         *  sqrt( I) =  I
         *  sqrt( 0) =  0
         *  sqrt(-0) = -0
         *
         * Return a new BigNumber whose value is the square root of the value of this BigNumber,
         * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */P.squareRoot=P.sqrt=function(){var m,n,r,rep,t,x=this,c=x.c,s=x.s,e=x.e,dp=DECIMAL_PLACES+4,half=new BigNumber('0.5'); // Negative/NaN/Infinity/zero?
if(s!==1||!c||!c[0]){return new BigNumber(!s||s<0&&(!c||c[0])?NaN:c?x:1/0);} // Initial estimate.
s=Math.sqrt(+x); // Math.sqrt underflow/overflow?
// Pass x to Math.sqrt as integer, then adjust the exponent of the result.
if(s==0||s==1/0){n=coeffToString(c);if((n.length+e)%2==0)n+='0';s=Math.sqrt(n);e=bitFloor((e+1)/2)-(e<0||e%2);if(s==1/0){n='1e'+e;}else {n=s.toExponential();n=n.slice(0,n.indexOf('e')+1)+e;}r=new BigNumber(n);}else {r=new BigNumber(s+'');} // Check for zero.
// r could be zero if MIN_EXP is changed after the this value was created.
// This would cause a division by zero (x/t) and hence Infinity below, which would cause
// coeffToString to throw.
if(r.c[0]){e=r.e;s=e+dp;if(s<3)s=0; // Newton-Raphson iteration.
for(;;){t=r;r=half.times(t.plus(div(x,t,dp,1)));if(coeffToString(t.c).slice(0,s)===(n=coeffToString(r.c)).slice(0,s)){ // The exponent of r may here be one less than the final result exponent,
// e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
// are indexed correctly.
if(r.e<e)--s;n=n.slice(s-3,s+1); // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
// are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
// iteration.
if(n=='9999'||!rep&&n=='4999'){ // On the first iteration only, check to see if rounding up gives the
// exact result as the nines may infinitely repeat.
if(!rep){round(t,t.e+DECIMAL_PLACES+2,0);if(t.times(t).eq(x)){r=t;break;}}dp+=4;s+=4;rep=1;}else { // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
// result. If not, then there are further digits and m will be truthy.
if(! +n||! +n.slice(1)&&n.charAt(0)=='5'){ // Truncate to the first rounding digit.
round(r,r.e+DECIMAL_PLACES+2,1);m=!r.times(r).eq(x);}break;}}}}return round(r,r.e+DECIMAL_PLACES+1,ROUNDING_MODE,m);}; /*
         *  n * 0 = 0
         *  n * N = N
         *  n * I = I
         *  0 * n = 0
         *  0 * 0 = 0
         *  0 * N = N
         *  0 * I = N
         *  N * n = N
         *  N * 0 = N
         *  N * N = N
         *  N * I = N
         *  I * n = I
         *  I * 0 = N
         *  I * N = N
         *  I * I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber times the value of
         * BigNumber(y, b).
         */P.times=P.mul=function(y,b){var c,e,i,j,k,m,xcL,xlo,xhi,ycL,ylo,yhi,zc,base,sqrtBase,x=this,xc=x.c,yc=(id=17,y=new BigNumber(y,b)).c; // Either NaN, ±Infinity or ±0?
if(!xc||!yc||!xc[0]||!yc[0]){ // Return NaN if either is NaN, or one is 0 and the other is Infinity.
if(!x.s||!y.s||xc&&!xc[0]&&!yc||yc&&!yc[0]&&!xc){y.c=y.e=y.s=null;}else {y.s*=x.s; // Return ±Infinity if either is ±Infinity.
if(!xc||!yc){y.c=y.e=null; // Return ±0 if either is ±0.
}else {y.c=[0];y.e=0;}}return y;}e=bitFloor(x.e/LOG_BASE)+bitFloor(y.e/LOG_BASE);y.s*=x.s;xcL=xc.length;ycL=yc.length; // Ensure xc points to longer array and xcL to its length.
if(xcL<ycL)zc=xc,xc=yc,yc=zc,i=xcL,xcL=ycL,ycL=i; // Initialise the result array with zeros.
for(i=xcL+ycL,zc=[];i--;zc.push(0)){}base=BASE;sqrtBase=SQRT_BASE;for(i=ycL;--i>=0;){c=0;ylo=yc[i]%sqrtBase;yhi=yc[i]/sqrtBase|0;for(k=xcL,j=i+k;j>i;){xlo=xc[--k]%sqrtBase;xhi=xc[k]/sqrtBase|0;m=yhi*xlo+xhi*ylo;xlo=ylo*xlo+m%sqrtBase*sqrtBase+zc[j]+c;c=(xlo/base|0)+(m/sqrtBase|0)+yhi*xhi;zc[j--]=xlo%base;}zc[j]=c;}if(c){++e;}else {zc.shift();}return normalise(y,zc,e);}; /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * sd significant digits using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toDigits() precision out of range: {sd}'
         * 'toDigits() precision not an integer: {sd}'
         * 'toDigits() rounding mode not an integer: {rm}'
         * 'toDigits() rounding mode out of range: {rm}'
         */P.toDigits=function(sd,rm){var n=new BigNumber(this);sd=sd==null||!isValidInt(sd,1,MAX,18,'precision')?null:sd|0;rm=rm==null||!isValidInt(rm,0,8,18,roundingMode)?ROUNDING_MODE:rm|0;return sd?round(n,sd,rm):n;}; /*
         * Return a string representing the value of this BigNumber in exponential notation and
         * rounded using ROUNDING_MODE to dp fixed decimal places.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toExponential() decimal places not an integer: {dp}'
         * 'toExponential() decimal places out of range: {dp}'
         * 'toExponential() rounding mode not an integer: {rm}'
         * 'toExponential() rounding mode out of range: {rm}'
         */P.toExponential=function(dp,rm){return format(this,dp!=null&&isValidInt(dp,0,MAX,19)?~ ~dp+1:null,rm,19);}; /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounding
         * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
         * but e.g. (-0.00001).toFixed(0) is '-0'.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFixed() decimal places not an integer: {dp}'
         * 'toFixed() decimal places out of range: {dp}'
         * 'toFixed() rounding mode not an integer: {rm}'
         * 'toFixed() rounding mode out of range: {rm}'
         */P.toFixed=function(dp,rm){return format(this,dp!=null&&isValidInt(dp,0,MAX,20)?~ ~dp+this.e+1:null,rm,20);}; /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounded
         * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
         * of the FORMAT object (see BigNumber.config).
         *
         * FORMAT = {
         *      decimalSeparator : '.',
         *      groupSeparator : ',',
         *      groupSize : 3,
         *      secondaryGroupSize : 0,
         *      fractionGroupSeparator : '\xA0',    // non-breaking space
         *      fractionGroupSize : 0
         * };
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFormat() decimal places not an integer: {dp}'
         * 'toFormat() decimal places out of range: {dp}'
         * 'toFormat() rounding mode not an integer: {rm}'
         * 'toFormat() rounding mode out of range: {rm}'
         */P.toFormat=function(dp,rm){var str=format(this,dp!=null&&isValidInt(dp,0,MAX,21)?~ ~dp+this.e+1:null,rm,21);if(this.c){var i,arr=str.split('.'),g1=+FORMAT.groupSize,g2=+FORMAT.secondaryGroupSize,groupSeparator=FORMAT.groupSeparator,intPart=arr[0],fractionPart=arr[1],isNeg=this.s<0,intDigits=isNeg?intPart.slice(1):intPart,len=intDigits.length;if(g2)i=g1,g1=g2,g2=i,len-=i;if(g1>0&&len>0){i=len%g1||g1;intPart=intDigits.substr(0,i);for(;i<len;i+=g1){intPart+=groupSeparator+intDigits.substr(i,g1);}if(g2>0)intPart+=groupSeparator+intDigits.slice(i);if(isNeg)intPart='-'+intPart;}str=fractionPart?intPart+FORMAT.decimalSeparator+((g2=+FORMAT.fractionGroupSize)?fractionPart.replace(new RegExp('\\d{'+g2+'}\\B','g'),'$&'+FORMAT.fractionGroupSeparator):fractionPart):intPart;}return str;}; /*
         * Return a string array representing the value of this BigNumber as a simple fraction with
         * an integer numerator and an integer denominator. The denominator will be a positive
         * non-zero value less than or equal to the specified maximum denominator. If a maximum
         * denominator is not specified, the denominator will be the lowest value necessary to
         * represent the number exactly.
         *
         * [md] {number|string|BigNumber} Integer >= 1 and < Infinity. The maximum denominator.
         *
         * 'toFraction() max denominator not an integer: {md}'
         * 'toFraction() max denominator out of range: {md}'
         */P.toFraction=function(md){var arr,d0,d2,e,exp,n,n0,q,s,k=ERRORS,x=this,xc=x.c,d=new BigNumber(ONE),n1=d0=new BigNumber(ONE),d1=n0=new BigNumber(ONE);if(md!=null){ERRORS=false;n=new BigNumber(md);ERRORS=k;if(!(k=n.isInt())||n.lt(ONE)){if(ERRORS){raise(22,'max denominator '+(k?'out of range':'not an integer'),md);} // ERRORS is false:
// If md is a finite non-integer >= 1, round it to an integer and use it.
md=!k&&n.c&&round(n,n.e+1,1).gte(ONE)?n:null;}}if(!xc)return x.toString();s=coeffToString(xc); // Determine initial denominator.
// d is a power of 10 and the minimum max denominator that specifies the value exactly.
e=d.e=s.length-x.e-1;d.c[0]=POWS_TEN[(exp=e%LOG_BASE)<0?LOG_BASE+exp:exp];md=!md||n.cmp(d)>0?e>0?d:n1:n;exp=MAX_EXP;MAX_EXP=1/0;n=new BigNumber(s); // n0 = d1 = 0
n0.c[0]=0;for(;;){q=div(n,d,0,1);d2=d0.plus(q.times(d1));if(d2.cmp(md)==1)break;d0=d1;d1=d2;n1=n0.plus(q.times(d2=n1));n0=d2;d=n.minus(q.times(d2=d));n=d2;}d2=div(md.minus(d0),d1,0,1);n0=n0.plus(d2.times(n1));d0=d0.plus(d2.times(d1));n0.s=n1.s=x.s;e*=2; // Determine which fraction is closer to x, n0/d0 or n1/d1
arr=div(n1,d1,e,ROUNDING_MODE).minus(x).abs().cmp(div(n0,d0,e,ROUNDING_MODE).minus(x).abs())<1?[n1.toString(),d1.toString()]:[n0.toString(),d0.toString()];MAX_EXP=exp;return arr;}; /*
         * Return the value of this BigNumber converted to a number primitive.
         */P.toNumber=function(){return +this;}; /*
         * Return a BigNumber whose value is the value of this BigNumber raised to the power n.
         * If m is present, return the result modulo m.
         * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
         * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using
         * ROUNDING_MODE.
         *
         * The modular power operation works efficiently when x, n, and m are positive integers,
         * otherwise it is equivalent to calculating x.toPower(n).modulo(m) (with POW_PRECISION 0).
         *
         * n {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         * [m] {number|string|BigNumber} The modulus.
         *
         * 'pow() exponent not an integer: {n}'
         * 'pow() exponent out of range: {n}'
         *
         * Performs 54 loop iterations for n of 9007199254740991.
         */P.toPower=P.pow=function(n,m){var k,y,z,i=mathfloor(n<0?-n:+n),x=this;if(m!=null){id=23;m=new BigNumber(m);} // Pass ±Infinity to Math.pow if exponent is out of range.
if(!isValidInt(n,-MAX_SAFE_INTEGER,MAX_SAFE_INTEGER,23,'exponent')&&(!isFinite(n)||i>MAX_SAFE_INTEGER&&(n/=0)||parseFloat(n)!=n&&!(n=NaN))||n==0){k=Math.pow(+x,n);return new BigNumber(m?k%m:k);}if(m){if(n>1&&x.gt(ONE)&&x.isInt()&&m.gt(ONE)&&m.isInt()){x=x.mod(m);}else {z=m; // Nullify m so only a single mod operation is performed at the end.
m=null;}}else if(POW_PRECISION){ // Truncating each coefficient array to a length of k after each multiplication
// equates to truncating significant digits to POW_PRECISION + [28, 41],
// i.e. there will be a minimum of 28 guard digits retained.
// (Using + 1.5 would give [9, 21] guard digits.)
k=mathceil(POW_PRECISION/LOG_BASE+2);}y=new BigNumber(ONE);for(;;){if(i%2){y=y.times(x);if(!y.c)break;if(k){if(y.c.length>k)y.c.length=k;}else if(m){y=y.mod(m);}}i=mathfloor(i/2);if(!i)break;x=x.times(x);if(k){if(x.c&&x.c.length>k)x.c.length=k;}else if(m){x=x.mod(m);}}if(m)return y;if(n<0)y=ONE.div(y);return z?y.mod(z):k?round(y,POW_PRECISION,ROUNDING_MODE):y;}; /*
         * Return a string representing the value of this BigNumber rounded to sd significant digits
         * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
         * necessary to represent the integer part of the value in fixed-point notation, then use
         * exponential notation.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toPrecision() precision not an integer: {sd}'
         * 'toPrecision() precision out of range: {sd}'
         * 'toPrecision() rounding mode not an integer: {rm}'
         * 'toPrecision() rounding mode out of range: {rm}'
         */P.toPrecision=function(sd,rm){return format(this,sd!=null&&isValidInt(sd,1,MAX,24,'precision')?sd|0:null,rm,24);}; /*
         * Return a string representing the value of this BigNumber in base b, or base 10 if b is
         * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
         * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
         * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
         * TO_EXP_NEG, return exponential notation.
         *
         * [b] {number} Integer, 2 to 64 inclusive.
         *
         * 'toString() base not an integer: {b}'
         * 'toString() base out of range: {b}'
         */P.toString=function(b){var str,n=this,s=n.s,e=n.e; // Infinity or NaN?
if(e===null){if(s){str='Infinity';if(s<0)str='-'+str;}else {str='NaN';}}else {str=coeffToString(n.c);if(b==null||!isValidInt(b,2,64,25,'base')){str=e<=TO_EXP_NEG||e>=TO_EXP_POS?toExponential(str,e):toFixedPoint(str,e);}else {str=convertBase(toFixedPoint(str,e),b|0,10,s);}if(s<0&&n.c[0])str='-'+str;}return str;}; /*
         * Return a new BigNumber whose value is the value of this BigNumber truncated to a whole
         * number.
         */P.truncated=P.trunc=function(){return round(new BigNumber(this),this.e+1,1);}; /*
         * Return as toString, but do not accept a base argument, and include the minus sign for
         * negative zero.
         */P.valueOf=P.toJSON=function(){var str,n=this,e=n.e;if(e===null)return n.toString();str=coeffToString(n.c);str=e<=TO_EXP_NEG||e>=TO_EXP_POS?toExponential(str,e):toFixedPoint(str,e);return n.s<0?'-'+str:str;}; // Aliases for BigDecimal methods.
//P.add = P.plus;         // P.add included above
//P.subtract = P.minus;   // P.sub included above
//P.multiply = P.times;   // P.mul included above
//P.divide = P.div;
//P.remainder = P.mod;
//P.compareTo = P.cmp;
//P.negate = P.neg;
if(configObj!=null)BigNumber.config(configObj);return BigNumber;} // PRIVATE HELPER FUNCTIONS
function bitFloor(n){var i=n|0;return n>0||n===i?i:i-1;} // Return a coefficient array as a string of base 10 digits.
function coeffToString(a){var s,z,i=1,j=a.length,r=a[0]+'';for(;i<j;){s=a[i++]+'';z=LOG_BASE-s.length;for(;z--;s='0'+s){}r+=s;} // Determine trailing zeros.
for(j=r.length;r.charCodeAt(--j)===48;){}return r.slice(0,j+1||1);} // Compare the value of BigNumbers x and y.
function compare(x,y){var a,b,xc=x.c,yc=y.c,i=x.s,j=y.s,k=x.e,l=y.e; // Either NaN?
if(!i||!j)return null;a=xc&&!xc[0];b=yc&&!yc[0]; // Either zero?
if(a||b)return a?b?0:-j:i; // Signs differ?
if(i!=j)return i;a=i<0;b=k==l; // Either Infinity?
if(!xc||!yc)return b?0:!xc^a?1:-1; // Compare exponents.
if(!b)return k>l^a?1:-1;j=(k=xc.length)<(l=yc.length)?k:l; // Compare digit by digit.
for(i=0;i<j;i++){if(xc[i]!=yc[i])return xc[i]>yc[i]^a?1:-1;} // Compare lengths.
return k==l?0:k>l^a?1:-1;} /*
     * Return true if n is a valid number in range, otherwise false.
     * Use for argument validation when ERRORS is false.
     * Note: parseInt('1e+1') == 1 but parseFloat('1e+1') == 10.
     */function intValidatorNoErrors(n,min,max){return (n=truncate(n))>=min&&n<=max;}function isArray(obj){return Object.prototype.toString.call(obj)=='[object Array]';} /*
     * Convert string of baseIn to an array of numbers of baseOut.
     * Eg. convertBase('255', 10, 16) returns [15, 15].
     * Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
     */function toBaseOut(str,baseIn,baseOut){var j,arr=[0],arrL,i=0,len=str.length;for(;i<len;){for(arrL=arr.length;arrL--;arr[arrL]*=baseIn){}arr[j=0]+=ALPHABET.indexOf(str.charAt(i++));for(;j<arr.length;j++){if(arr[j]>baseOut-1){if(arr[j+1]==null)arr[j+1]=0;arr[j+1]+=arr[j]/baseOut|0;arr[j]%=baseOut;}}}return arr.reverse();}function toExponential(str,e){return (str.length>1?str.charAt(0)+'.'+str.slice(1):str)+(e<0?'e':'e+')+e;}function toFixedPoint(str,e){var len,z; // Negative exponent?
if(e<0){ // Prepend zeros.
for(z='0.';++e;z+='0'){}str=z+str; // Positive exponent
}else {len=str.length; // Append zeros.
if(++e>len){for(z='0',e-=len;--e;z+='0'){}str+=z;}else if(e<len){str=str.slice(0,e)+'.'+str.slice(e);}}return str;}function truncate(n){n=parseFloat(n);return n<0?mathceil(n):mathfloor(n);} // EXPORT
// AMD.
if(typeof define=='function'&&define.amd){define(function(){return constructorFactory();}); // Node.js and other environments that support module.exports.
}else if(typeof module!='undefined'&&module.exports){module.exports=constructorFactory(); // Split string stops browserify adding crypto shim.
if(!cryptoObj)try{cryptoObj=require('cry'+'pto');}catch(e){} // Browser.
}else {if(!globalObj)globalObj=typeof self!='undefined'?self:Function('return this')();globalObj.BigNumber=constructorFactory();}})(this);},{}],5:[function(require,module,exports){ /**
 * @author shaozilee
 *
 * support 1bit 4bit 8bit 24bit decode
 * encode with 24bit
 * 
 */var encode=require('./lib/encoder'),decode=require('./lib/decoder');module.exports={encode:encode,decode:decode};},{"./lib/decoder":6,"./lib/encoder":7}],6:[function(require,module,exports){(function(Buffer){ /**
 * @author shaozilee
 *
 * Bmp format decoder,support 1bit 4bit 8bit 24bit bmp
 * 
 */function BmpDecoder(buffer){this.pos=0;this.buffer=buffer;this.flag=this.buffer.toString("utf-8",0,this.pos+=2);if(this.flag!="BM")throw new Error("Invalid BMP File");this.parseHeader();this.parseBGR();}BmpDecoder.prototype.parseHeader=function(){this.fileSize=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.reserved=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.offset=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.headerSize=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.width=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.height=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.planes=this.buffer.readUInt16LE(this.pos);this.pos+=2;this.bitPP=this.buffer.readUInt16LE(this.pos);this.pos+=2;this.compress=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.rawSize=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.hr=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.vr=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.colors=this.buffer.readUInt32LE(this.pos);this.pos+=4;this.importantColors=this.buffer.readUInt32LE(this.pos);this.pos+=4;if(this.bitPP<24){var len=1<<this.bitPP;this.palette=new Array(len);for(var i=0;i<len;i++){var blue=this.buffer.readUInt8(this.pos++);var green=this.buffer.readUInt8(this.pos++);var red=this.buffer.readUInt8(this.pos++);var quad=this.buffer.readUInt8(this.pos++);this.palette[i]={red:red,green:green,blue:blue,quad:quad};}}};BmpDecoder.prototype.parseBGR=function(){this.pos=this.offset;try{var bitn="bit"+this.bitPP;var len=this.width*this.height*4;this.data=new Buffer(len);this[bitn]();}catch(e){console.log("bit decode error:"+e);}};BmpDecoder.prototype.bit1=function(){var xlen=Math.ceil(this.width/8);var mode=xlen%4;for(var y=this.height-1;y>=0;y--){for(var x=0;x<xlen;x++){var b=this.buffer.readUInt8(this.pos++);var location=y*this.width*4+x*8*4;for(var i=0;i<8;i++){if(x*8+i<this.width){var rgb=this.palette[b>>7-i&0x1];this.data[location+i*4]=rgb.blue;this.data[location+i*4+1]=rgb.green;this.data[location+i*4+2]=rgb.red;this.data[location+i*4+3]=0xFF;}else {break;}}}if(mode!=0){this.pos+=4-mode;}}};BmpDecoder.prototype.bit4=function(){var xlen=Math.ceil(this.width/2);var mode=xlen%4;for(var y=this.height-1;y>=0;y--){for(var x=0;x<xlen;x++){var b=this.buffer.readUInt8(this.pos++);var location=y*this.width*4+x*2*4;var before=b>>4;var after=b&0x0F;var rgb=this.palette[before];this.data[location]=rgb.blue;this.data[location+1]=rgb.green;this.data[location+2]=rgb.red;this.data[location+3]=0xFF;if(x*2+1>=this.width)break;rgb=this.palette[after];this.data[location+4]=rgb.blue;this.data[location+4+1]=rgb.green;this.data[location+4+2]=rgb.red;this.data[location+4+3]=0xFF;}if(mode!=0){this.pos+=4-mode;}}};BmpDecoder.prototype.bit8=function(){var mode=this.width%4;for(var y=this.height-1;y>=0;y--){for(var x=0;x<this.width;x++){var b=this.buffer.readUInt8(this.pos++);var location=y*this.width*4+x*4;var rgb=this.palette[b];this.data[location]=rgb.blue;this.data[location+1]=rgb.green;this.data[location+2]=rgb.red;this.data[location+3]=0xFF;}if(mode!=0){this.pos+=4-mode;}}};BmpDecoder.prototype.bit24=function(){ //when height > 0
for(var y=this.height-1;y>=0;y--){for(var x=0;x<this.width;x++){var blue=this.buffer.readUInt8(this.pos++);var green=this.buffer.readUInt8(this.pos++);var red=this.buffer.readUInt8(this.pos++);var location=y*this.width*4+x*4;this.data[location]=red;this.data[location+1]=green;this.data[location+2]=blue;this.data[location+3]=0xFF;} //skip extra bytes
this.pos+=this.width%4;}};BmpDecoder.prototype.getData=function(){return this.data;};module.exports=decode=function decode(bmpData){var decoder=new BmpDecoder(bmpData);return {data:decoder.getData(),width:decoder.width,height:decoder.height};};}).call(this,require("buffer").Buffer);},{"buffer":14}],7:[function(require,module,exports){(function(Buffer){ /**
 * @author shaozilee
 *
 * BMP format encoder,encode 24bit BMP
 * Not support quality compression
 * 
 */function BmpEncoder(imgData){this.buffer=imgData.data;this.width=imgData.width;this.height=imgData.height;this.extraBytes=this.width%4;this.rgbSize=this.height*(3*this.width+this.extraBytes);this.headerInfoSize=40;this.data=[]; /******************header***********************/this.flag="BM";this.reserved=0;this.offset=54;this.fileSize=this.rgbSize+this.offset;this.planes=1;this.bitPP=24;this.compress=0;this.hr=0;this.vr=0;this.colors=0;this.importantColors=0;}BmpEncoder.prototype.encode=function(){var tempBuffer=new Buffer(this.offset+this.rgbSize);this.pos=0;tempBuffer.write(this.flag,this.pos,2);this.pos+=2;tempBuffer.writeUInt32LE(this.fileSize,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.reserved,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.offset,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.headerInfoSize,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.width,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.height,this.pos);this.pos+=4;tempBuffer.writeUInt16LE(this.planes,this.pos);this.pos+=2;tempBuffer.writeUInt16LE(this.bitPP,this.pos);this.pos+=2;tempBuffer.writeUInt32LE(this.compress,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.rgbSize,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.hr,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.vr,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.colors,this.pos);this.pos+=4;tempBuffer.writeUInt32LE(this.importantColors,this.pos);this.pos+=4;var i=0;var rowBytes=3*this.width+this.extraBytes;for(var y=this.height-1;y>=0;y--){for(var x=0;x<this.width;x++){var p=this.pos+y*rowBytes+x*3;tempBuffer[p+2]=this.buffer[i++]; //r
tempBuffer[p+1]=this.buffer[i++]; //g
tempBuffer[p]=this.buffer[i++]; //b
i++;}if(this.extraBytes>0){var fillOffset=this.pos+y*rowBytes+this.width*3;tempBuffer.fill(0,fillOffset,fillOffset+this.extraBytes);}}return tempBuffer;};module.exports=encode=function encode(imgData,quality){if(typeof quality==='undefined')quality=100;var encoder=new BmpEncoder(imgData);var data=encoder.encode();return {data:data,width:imgData.width,height:imgData.height};};}).call(this,require("buffer").Buffer);},{"buffer":14}],8:[function(require,module,exports){},{}],9:[function(require,module,exports){(function(process,Buffer){var msg=require('pako/lib/zlib/messages');var zstream=require('pako/lib/zlib/zstream');var zlib_deflate=require('pako/lib/zlib/deflate.js');var zlib_inflate=require('pako/lib/zlib/inflate.js');var constants=require('pako/lib/zlib/constants');for(var key in constants){exports[key]=constants[key];} // zlib modes
exports.NONE=0;exports.DEFLATE=1;exports.INFLATE=2;exports.GZIP=3;exports.GUNZIP=4;exports.DEFLATERAW=5;exports.INFLATERAW=6;exports.UNZIP=7; /**
 * Emulate Node's zlib C++ layer for use by the JS layer in index.js
 */function Zlib(mode){if(mode<exports.DEFLATE||mode>exports.UNZIP)throw new TypeError("Bad argument");this.mode=mode;this.init_done=false;this.write_in_progress=false;this.pending_close=false;this.windowBits=0;this.level=0;this.memLevel=0;this.strategy=0;this.dictionary=null;}Zlib.prototype.init=function(windowBits,level,memLevel,strategy,dictionary){this.windowBits=windowBits;this.level=level;this.memLevel=memLevel;this.strategy=strategy; // dictionary not supported.
if(this.mode===exports.GZIP||this.mode===exports.GUNZIP)this.windowBits+=16;if(this.mode===exports.UNZIP)this.windowBits+=32;if(this.mode===exports.DEFLATERAW||this.mode===exports.INFLATERAW)this.windowBits=-this.windowBits;this.strm=new zstream();switch(this.mode){case exports.DEFLATE:case exports.GZIP:case exports.DEFLATERAW:var status=zlib_deflate.deflateInit2(this.strm,this.level,exports.Z_DEFLATED,this.windowBits,this.memLevel,this.strategy);break;case exports.INFLATE:case exports.GUNZIP:case exports.INFLATERAW:case exports.UNZIP:var status=zlib_inflate.inflateInit2(this.strm,this.windowBits);break;default:throw new Error("Unknown mode "+this.mode);}if(status!==exports.Z_OK){this._error(status);return;}this.write_in_progress=false;this.init_done=true;};Zlib.prototype.params=function(){throw new Error("deflateParams Not supported");};Zlib.prototype._writeCheck=function(){if(!this.init_done)throw new Error("write before init");if(this.mode===exports.NONE)throw new Error("already finalized");if(this.write_in_progress)throw new Error("write already in progress");if(this.pending_close)throw new Error("close is pending");};Zlib.prototype.write=function(flush,input,in_off,in_len,out,out_off,out_len){this._writeCheck();this.write_in_progress=true;var self=this;process.nextTick(function(){self.write_in_progress=false;var res=self._write(flush,input,in_off,in_len,out,out_off,out_len);self.callback(res[0],res[1]);if(self.pending_close)self.close();});return this;}; // set method for Node buffers, used by pako
function bufferSet(data,offset){for(var i=0;i<data.length;i++){this[offset+i]=data[i];}}Zlib.prototype.writeSync=function(flush,input,in_off,in_len,out,out_off,out_len){this._writeCheck();return this._write(flush,input,in_off,in_len,out,out_off,out_len);};Zlib.prototype._write=function(flush,input,in_off,in_len,out,out_off,out_len){this.write_in_progress=true;if(flush!==exports.Z_NO_FLUSH&&flush!==exports.Z_PARTIAL_FLUSH&&flush!==exports.Z_SYNC_FLUSH&&flush!==exports.Z_FULL_FLUSH&&flush!==exports.Z_FINISH&&flush!==exports.Z_BLOCK){throw new Error("Invalid flush value");}if(input==null){input=new Buffer(0);in_len=0;in_off=0;}if(out._set)out.set=out._set;else out.set=bufferSet;var strm=this.strm;strm.avail_in=in_len;strm.input=input;strm.next_in=in_off;strm.avail_out=out_len;strm.output=out;strm.next_out=out_off;switch(this.mode){case exports.DEFLATE:case exports.GZIP:case exports.DEFLATERAW:var status=zlib_deflate.deflate(strm,flush);break;case exports.UNZIP:case exports.INFLATE:case exports.GUNZIP:case exports.INFLATERAW:var status=zlib_inflate.inflate(strm,flush);break;default:throw new Error("Unknown mode "+this.mode);}if(status!==exports.Z_STREAM_END&&status!==exports.Z_OK){this._error(status);}this.write_in_progress=false;return [strm.avail_in,strm.avail_out];};Zlib.prototype.close=function(){if(this.write_in_progress){this.pending_close=true;return;}this.pending_close=false;if(this.mode===exports.DEFLATE||this.mode===exports.GZIP||this.mode===exports.DEFLATERAW){zlib_deflate.deflateEnd(this.strm);}else {zlib_inflate.inflateEnd(this.strm);}this.mode=exports.NONE;};Zlib.prototype.reset=function(){switch(this.mode){case exports.DEFLATE:case exports.DEFLATERAW:var status=zlib_deflate.deflateReset(this.strm);break;case exports.INFLATE:case exports.INFLATERAW:var status=zlib_inflate.inflateReset(this.strm);break;}if(status!==exports.Z_OK){this._error(status);}};Zlib.prototype._error=function(status){this.onerror(msg[status]+': '+this.strm.msg,status);this.write_in_progress=false;if(this.pending_close)this.close();};exports.Zlib=Zlib;}).call(this,require('_process'),require("buffer").Buffer);},{"_process":12,"buffer":14,"pako/lib/zlib/constants":46,"pako/lib/zlib/deflate.js":48,"pako/lib/zlib/inflate.js":50,"pako/lib/zlib/messages":52,"pako/lib/zlib/zstream":54}],10:[function(require,module,exports){(function(process,Buffer){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var Transform=require('_stream_transform');var binding=require('./binding');var util=require('util');var assert=require('assert').ok; // zlib doesn't provide these, so kludge them in following the same
// const naming scheme zlib uses.
binding.Z_MIN_WINDOWBITS=8;binding.Z_MAX_WINDOWBITS=15;binding.Z_DEFAULT_WINDOWBITS=15; // fewer than 64 bytes per chunk is stupid.
// technically it could work with as few as 8, but even 64 bytes
// is absurdly low.  Usually a MB or more is best.
binding.Z_MIN_CHUNK=64;binding.Z_MAX_CHUNK=Infinity;binding.Z_DEFAULT_CHUNK=16*1024;binding.Z_MIN_MEMLEVEL=1;binding.Z_MAX_MEMLEVEL=9;binding.Z_DEFAULT_MEMLEVEL=8;binding.Z_MIN_LEVEL=-1;binding.Z_MAX_LEVEL=9;binding.Z_DEFAULT_LEVEL=binding.Z_DEFAULT_COMPRESSION; // expose all the zlib constants
Object.keys(binding).forEach(function(k){if(k.match(/^Z/))exports[k]=binding[k];}); // translation table for return codes.
exports.codes={Z_OK:binding.Z_OK,Z_STREAM_END:binding.Z_STREAM_END,Z_NEED_DICT:binding.Z_NEED_DICT,Z_ERRNO:binding.Z_ERRNO,Z_STREAM_ERROR:binding.Z_STREAM_ERROR,Z_DATA_ERROR:binding.Z_DATA_ERROR,Z_MEM_ERROR:binding.Z_MEM_ERROR,Z_BUF_ERROR:binding.Z_BUF_ERROR,Z_VERSION_ERROR:binding.Z_VERSION_ERROR};Object.keys(exports.codes).forEach(function(k){exports.codes[exports.codes[k]]=k;});exports.Deflate=Deflate;exports.Inflate=Inflate;exports.Gzip=Gzip;exports.Gunzip=Gunzip;exports.DeflateRaw=DeflateRaw;exports.InflateRaw=InflateRaw;exports.Unzip=Unzip;exports.createDeflate=function(o){return new Deflate(o);};exports.createInflate=function(o){return new Inflate(o);};exports.createDeflateRaw=function(o){return new DeflateRaw(o);};exports.createInflateRaw=function(o){return new InflateRaw(o);};exports.createGzip=function(o){return new Gzip(o);};exports.createGunzip=function(o){return new Gunzip(o);};exports.createUnzip=function(o){return new Unzip(o);}; // Convenience methods.
// compress/decompress a string or buffer in one step.
exports.deflate=function(buffer,opts,callback){if(typeof opts==='function'){callback=opts;opts={};}return zlibBuffer(new Deflate(opts),buffer,callback);};exports.deflateSync=function(buffer,opts){return zlibBufferSync(new Deflate(opts),buffer);};exports.gzip=function(buffer,opts,callback){if(typeof opts==='function'){callback=opts;opts={};}return zlibBuffer(new Gzip(opts),buffer,callback);};exports.gzipSync=function(buffer,opts){return zlibBufferSync(new Gzip(opts),buffer);};exports.deflateRaw=function(buffer,opts,callback){if(typeof opts==='function'){callback=opts;opts={};}return zlibBuffer(new DeflateRaw(opts),buffer,callback);};exports.deflateRawSync=function(buffer,opts){return zlibBufferSync(new DeflateRaw(opts),buffer);};exports.unzip=function(buffer,opts,callback){if(typeof opts==='function'){callback=opts;opts={};}return zlibBuffer(new Unzip(opts),buffer,callback);};exports.unzipSync=function(buffer,opts){return zlibBufferSync(new Unzip(opts),buffer);};exports.inflate=function(buffer,opts,callback){if(typeof opts==='function'){callback=opts;opts={};}return zlibBuffer(new Inflate(opts),buffer,callback);};exports.inflateSync=function(buffer,opts){return zlibBufferSync(new Inflate(opts),buffer);};exports.gunzip=function(buffer,opts,callback){if(typeof opts==='function'){callback=opts;opts={};}return zlibBuffer(new Gunzip(opts),buffer,callback);};exports.gunzipSync=function(buffer,opts){return zlibBufferSync(new Gunzip(opts),buffer);};exports.inflateRaw=function(buffer,opts,callback){if(typeof opts==='function'){callback=opts;opts={};}return zlibBuffer(new InflateRaw(opts),buffer,callback);};exports.inflateRawSync=function(buffer,opts){return zlibBufferSync(new InflateRaw(opts),buffer);};function zlibBuffer(engine,buffer,callback){var buffers=[];var nread=0;engine.on('error',onError);engine.on('end',onEnd);engine.end(buffer);flow();function flow(){var chunk;while(null!==(chunk=engine.read())){buffers.push(chunk);nread+=chunk.length;}engine.once('readable',flow);}function onError(err){engine.removeListener('end',onEnd);engine.removeListener('readable',flow);callback(err);}function onEnd(){var buf=Buffer.concat(buffers,nread);buffers=[];callback(null,buf);engine.close();}}function zlibBufferSync(engine,buffer){if(typeof buffer==='string')buffer=new Buffer(buffer);if(!Buffer.isBuffer(buffer))throw new TypeError('Not a string or buffer');var flushFlag=binding.Z_FINISH;return engine._processChunk(buffer,flushFlag);} // generic zlib
// minimal 2-byte header
function Deflate(opts){if(!(this instanceof Deflate))return new Deflate(opts);Zlib.call(this,opts,binding.DEFLATE);}function Inflate(opts){if(!(this instanceof Inflate))return new Inflate(opts);Zlib.call(this,opts,binding.INFLATE);} // gzip - bigger header, same deflate compression
function Gzip(opts){if(!(this instanceof Gzip))return new Gzip(opts);Zlib.call(this,opts,binding.GZIP);}function Gunzip(opts){if(!(this instanceof Gunzip))return new Gunzip(opts);Zlib.call(this,opts,binding.GUNZIP);} // raw - no header
function DeflateRaw(opts){if(!(this instanceof DeflateRaw))return new DeflateRaw(opts);Zlib.call(this,opts,binding.DEFLATERAW);}function InflateRaw(opts){if(!(this instanceof InflateRaw))return new InflateRaw(opts);Zlib.call(this,opts,binding.INFLATERAW);} // auto-detect header.
function Unzip(opts){if(!(this instanceof Unzip))return new Unzip(opts);Zlib.call(this,opts,binding.UNZIP);} // the Zlib class they all inherit from
// This thing manages the queue of requests, and returns
// true or false if there is anything in the queue when
// you call the .write() method.
function Zlib(opts,mode){this._opts=opts=opts||{};this._chunkSize=opts.chunkSize||exports.Z_DEFAULT_CHUNK;Transform.call(this,opts);if(opts.flush){if(opts.flush!==binding.Z_NO_FLUSH&&opts.flush!==binding.Z_PARTIAL_FLUSH&&opts.flush!==binding.Z_SYNC_FLUSH&&opts.flush!==binding.Z_FULL_FLUSH&&opts.flush!==binding.Z_FINISH&&opts.flush!==binding.Z_BLOCK){throw new Error('Invalid flush flag: '+opts.flush);}}this._flushFlag=opts.flush||binding.Z_NO_FLUSH;if(opts.chunkSize){if(opts.chunkSize<exports.Z_MIN_CHUNK||opts.chunkSize>exports.Z_MAX_CHUNK){throw new Error('Invalid chunk size: '+opts.chunkSize);}}if(opts.windowBits){if(opts.windowBits<exports.Z_MIN_WINDOWBITS||opts.windowBits>exports.Z_MAX_WINDOWBITS){throw new Error('Invalid windowBits: '+opts.windowBits);}}if(opts.level){if(opts.level<exports.Z_MIN_LEVEL||opts.level>exports.Z_MAX_LEVEL){throw new Error('Invalid compression level: '+opts.level);}}if(opts.memLevel){if(opts.memLevel<exports.Z_MIN_MEMLEVEL||opts.memLevel>exports.Z_MAX_MEMLEVEL){throw new Error('Invalid memLevel: '+opts.memLevel);}}if(opts.strategy){if(opts.strategy!=exports.Z_FILTERED&&opts.strategy!=exports.Z_HUFFMAN_ONLY&&opts.strategy!=exports.Z_RLE&&opts.strategy!=exports.Z_FIXED&&opts.strategy!=exports.Z_DEFAULT_STRATEGY){throw new Error('Invalid strategy: '+opts.strategy);}}if(opts.dictionary){if(!Buffer.isBuffer(opts.dictionary)){throw new Error('Invalid dictionary: it should be a Buffer instance');}}this._binding=new binding.Zlib(mode);var self=this;this._hadError=false;this._binding.onerror=function(message,errno){ // there is no way to cleanly recover.
// continuing only obscures problems.
self._binding=null;self._hadError=true;var error=new Error(message);error.errno=errno;error.code=exports.codes[errno];self.emit('error',error);};var level=exports.Z_DEFAULT_COMPRESSION;if(typeof opts.level==='number')level=opts.level;var strategy=exports.Z_DEFAULT_STRATEGY;if(typeof opts.strategy==='number')strategy=opts.strategy;this._binding.init(opts.windowBits||exports.Z_DEFAULT_WINDOWBITS,level,opts.memLevel||exports.Z_DEFAULT_MEMLEVEL,strategy,opts.dictionary);this._buffer=new Buffer(this._chunkSize);this._offset=0;this._closed=false;this._level=level;this._strategy=strategy;this.once('end',this.close);}util.inherits(Zlib,Transform);Zlib.prototype.params=function(level,strategy,callback){if(level<exports.Z_MIN_LEVEL||level>exports.Z_MAX_LEVEL){throw new RangeError('Invalid compression level: '+level);}if(strategy!=exports.Z_FILTERED&&strategy!=exports.Z_HUFFMAN_ONLY&&strategy!=exports.Z_RLE&&strategy!=exports.Z_FIXED&&strategy!=exports.Z_DEFAULT_STRATEGY){throw new TypeError('Invalid strategy: '+strategy);}if(this._level!==level||this._strategy!==strategy){var self=this;this.flush(binding.Z_SYNC_FLUSH,function(){self._binding.params(level,strategy);if(!self._hadError){self._level=level;self._strategy=strategy;if(callback)callback();}});}else {process.nextTick(callback);}};Zlib.prototype.reset=function(){return this._binding.reset();}; // This is the _flush function called by the transform class,
// internally, when the last chunk has been written.
Zlib.prototype._flush=function(callback){this._transform(new Buffer(0),'',callback);};Zlib.prototype.flush=function(kind,callback){var ws=this._writableState;if(typeof kind==='function'||kind===void 0&&!callback){callback=kind;kind=binding.Z_FULL_FLUSH;}if(ws.ended){if(callback)process.nextTick(callback);}else if(ws.ending){if(callback)this.once('end',callback);}else if(ws.needDrain){var self=this;this.once('drain',function(){self.flush(callback);});}else {this._flushFlag=kind;this.write(new Buffer(0),'',callback);}};Zlib.prototype.close=function(callback){if(callback)process.nextTick(callback);if(this._closed)return;this._closed=true;this._binding.close();var self=this;process.nextTick(function(){self.emit('close');});};Zlib.prototype._transform=function(chunk,encoding,cb){var flushFlag;var ws=this._writableState;var ending=ws.ending||ws.ended;var last=ending&&(!chunk||ws.length===chunk.length);if(!chunk===null&&!Buffer.isBuffer(chunk))return cb(new Error('invalid input')); // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag.
// If it's explicitly flushing at some other time, then we use
// Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
// goodness.
if(last)flushFlag=binding.Z_FINISH;else {flushFlag=this._flushFlag; // once we've flushed the last of the queue, stop flushing and
// go back to the normal behavior.
if(chunk.length>=ws.length){this._flushFlag=this._opts.flush||binding.Z_NO_FLUSH;}}var self=this;this._processChunk(chunk,flushFlag,cb);};Zlib.prototype._processChunk=function(chunk,flushFlag,cb){var availInBefore=chunk&&chunk.length;var availOutBefore=this._chunkSize-this._offset;var inOff=0;var self=this;var async=typeof cb==='function';if(!async){var buffers=[];var nread=0;var error;this.on('error',function(er){error=er;});do {var res=this._binding.writeSync(flushFlag,chunk, // in
inOff, // in_off
availInBefore, // in_len
this._buffer, // out
this._offset, //out_off
availOutBefore); // out_len
}while(!this._hadError&&callback(res[0],res[1]));if(this._hadError){throw error;}var buf=Buffer.concat(buffers,nread);this.close();return buf;}var req=this._binding.write(flushFlag,chunk, // in
inOff, // in_off
availInBefore, // in_len
this._buffer, // out
this._offset, //out_off
availOutBefore); // out_len
req.buffer=chunk;req.callback=callback;function callback(availInAfter,availOutAfter){if(self._hadError)return;var have=availOutBefore-availOutAfter;assert(have>=0,'have should not go down');if(have>0){var out=self._buffer.slice(self._offset,self._offset+have);self._offset+=have; // serve some output to the consumer.
if(async){self.push(out);}else {buffers.push(out);nread+=out.length;}} // exhausted the output buffer, or used all the input create a new one.
if(availOutAfter===0||self._offset>=self._chunkSize){availOutBefore=self._chunkSize;self._offset=0;self._buffer=new Buffer(self._chunkSize);}if(availOutAfter===0){ // Not actually done.  Need to reprocess.
// Also, update the availInBefore to the availInAfter value,
// so that if we have to hit it a third (fourth, etc.) time,
// it'll have the correct byte counts.
inOff+=availInBefore-availInAfter;availInBefore=availInAfter;if(!async)return true;var newReq=self._binding.write(flushFlag,chunk,inOff,availInBefore,self._buffer,self._offset,self._chunkSize);newReq.callback=callback; // this same function
newReq.buffer=chunk;return;}if(!async)return false; // finished with the chunk.
cb();}};util.inherits(Deflate,Zlib);util.inherits(Inflate,Zlib);util.inherits(Gzip,Zlib);util.inherits(Gunzip,Zlib);util.inherits(DeflateRaw,Zlib);util.inherits(InflateRaw,Zlib);util.inherits(Unzip,Zlib);}).call(this,require('_process'),require("buffer").Buffer);},{"./binding":9,"_process":12,"_stream_transform":93,"assert":2,"buffer":14,"util":104}],11:[function(require,module,exports){arguments[4][8][0].apply(exports,arguments);},{"dup":8}],12:[function(require,module,exports){ // shim for using process in browser
var process=module.exports={};var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){draining=false;if(currentQueue.length){queue=currentQueue.concat(queue);}else {queueIndex=-1;}if(queue.length){drainQueue();}}function drainQueue(){if(draining){return;}var timeout=setTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run();}}queueIndex=-1;len=queue.length;}currentQueue=null;draining=false;clearTimeout(timeout);}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i];}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){setTimeout(drainQueue,0);}}; // v8 likes predictible objects
function Item(fun,array){this.fun=fun;this.array=array;}Item.prototype.run=function(){this.fun.apply(null,this.array);};process.title='browser';process.browser=true;process.env={};process.argv=[];process.version=''; // empty string to avoid regexp issues
process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error('process.binding is not supported');};process.cwd=function(){return '/';};process.chdir=function(dir){throw new Error('process.chdir is not supported');};process.umask=function(){return 0;};},{}],13:[function(require,module,exports){var Buffer=require('buffer').Buffer; // for use with browserify
module.exports=function(a,b){if(!Buffer.isBuffer(a))return undefined;if(!Buffer.isBuffer(b))return undefined;if(typeof a.equals==='function')return a.equals(b);if(a.length!==b.length)return false;for(var i=0;i<a.length;i++){if(a[i]!==b[i])return false;}return true;};},{"buffer":14}],14:[function(require,module,exports){(function(global){ /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */ /* eslint-disable no-proto */'use strict';var base64=require('base64-js');var ieee754=require('ieee754');var isArray=require('isarray');exports.Buffer=Buffer;exports.SlowBuffer=SlowBuffer;exports.INSPECT_MAX_BYTES=50; /**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */Buffer.TYPED_ARRAY_SUPPORT=global.TYPED_ARRAY_SUPPORT!==undefined?global.TYPED_ARRAY_SUPPORT:typedArraySupport(); /*
 * Export kMaxLength after typed array support is determined.
 */exports.kMaxLength=kMaxLength();function typedArraySupport(){try{var arr=new Uint8Array(1);arr.foo=function(){return 42;};return arr.foo()===42&& // typed array instances can be augmented
typeof arr.subarray==='function'&& // chrome 9-10 lack `subarray`
arr.subarray(1,1).byteLength===0; // ie10 has broken `subarray`
}catch(e){return false;}}function kMaxLength(){return Buffer.TYPED_ARRAY_SUPPORT?0x7fffffff:0x3fffffff;}function createBuffer(that,length){if(kMaxLength()<length){throw new RangeError('Invalid typed array length');}if(Buffer.TYPED_ARRAY_SUPPORT){ // Return an augmented `Uint8Array` instance, for best performance
that=new Uint8Array(length);that.__proto__=Buffer.prototype;}else { // Fallback: Return an object instance of the Buffer class
if(that===null){that=new Buffer(length);}that.length=length;}return that;} /**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */function Buffer(arg,encodingOrOffset,length){if(!Buffer.TYPED_ARRAY_SUPPORT&&!(this instanceof Buffer)){return new Buffer(arg,encodingOrOffset,length);} // Common case.
if(typeof arg==='number'){if(typeof encodingOrOffset==='string'){throw new Error('If encoding is specified then the first argument must be a string');}return allocUnsafe(this,arg);}return from(this,arg,encodingOrOffset,length);}Buffer.poolSize=8192; // not used by this implementation
// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment=function(arr){arr.__proto__=Buffer.prototype;return arr;};function from(that,value,encodingOrOffset,length){if(typeof value==='number'){throw new TypeError('"value" argument must not be a number');}if(typeof ArrayBuffer!=='undefined'&&value instanceof ArrayBuffer){return fromArrayBuffer(that,value,encodingOrOffset,length);}if(typeof value==='string'){return fromString(that,value,encodingOrOffset);}return fromObject(that,value);} /**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/Buffer.from=function(value,encodingOrOffset,length){return from(null,value,encodingOrOffset,length);};if(Buffer.TYPED_ARRAY_SUPPORT){Buffer.prototype.__proto__=Uint8Array.prototype;Buffer.__proto__=Uint8Array;if(typeof Symbol!=='undefined'&&Symbol.species&&Buffer[Symbol.species]===Buffer){ // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
Object.defineProperty(Buffer,Symbol.species,{value:null,configurable:true});}}function assertSize(size){if(typeof size!=='number'){throw new TypeError('"size" argument must be a number');}}function alloc(that,size,fill,encoding){assertSize(size);if(size<=0){return createBuffer(that,size);}if(fill!==undefined){ // Only pay attention to encoding if it's a string. This
// prevents accidentally sending in a number that would
// be interpretted as a start offset.
return typeof encoding==='string'?createBuffer(that,size).fill(fill,encoding):createBuffer(that,size).fill(fill);}return createBuffer(that,size);} /**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/Buffer.alloc=function(size,fill,encoding){return alloc(null,size,fill,encoding);};function allocUnsafe(that,size){assertSize(size);that=createBuffer(that,size<0?0:checked(size)|0);if(!Buffer.TYPED_ARRAY_SUPPORT){for(var i=0;i<size;i++){that[i]=0;}}return that;} /**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */Buffer.allocUnsafe=function(size){return allocUnsafe(null,size);}; /**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */Buffer.allocUnsafeSlow=function(size){return allocUnsafe(null,size);};function fromString(that,string,encoding){if(typeof encoding!=='string'||encoding===''){encoding='utf8';}if(!Buffer.isEncoding(encoding)){throw new TypeError('"encoding" must be a valid string encoding');}var length=byteLength(string,encoding)|0;that=createBuffer(that,length);that.write(string,encoding);return that;}function fromArrayLike(that,array){var length=checked(array.length)|0;that=createBuffer(that,length);for(var i=0;i<length;i+=1){that[i]=array[i]&255;}return that;}function fromArrayBuffer(that,array,byteOffset,length){array.byteLength; // this throws if `array` is not a valid ArrayBuffer
if(byteOffset<0||array.byteLength<byteOffset){throw new RangeError('\'offset\' is out of bounds');}if(array.byteLength<byteOffset+(length||0)){throw new RangeError('\'length\' is out of bounds');}if(length===undefined){array=new Uint8Array(array,byteOffset);}else {array=new Uint8Array(array,byteOffset,length);}if(Buffer.TYPED_ARRAY_SUPPORT){ // Return an augmented `Uint8Array` instance, for best performance
that=array;that.__proto__=Buffer.prototype;}else { // Fallback: Return an object instance of the Buffer class
that=fromArrayLike(that,array);}return that;}function fromObject(that,obj){if(Buffer.isBuffer(obj)){var len=checked(obj.length)|0;that=createBuffer(that,len);if(that.length===0){return that;}obj.copy(that,0,0,len);return that;}if(obj){if(typeof ArrayBuffer!=='undefined'&&obj.buffer instanceof ArrayBuffer||'length' in obj){if(typeof obj.length!=='number'||isnan(obj.length)){return createBuffer(that,0);}return fromArrayLike(that,obj);}if(obj.type==='Buffer'&&isArray(obj.data)){return fromArrayLike(that,obj.data);}}throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');}function checked(length){ // Note: cannot use `length < kMaxLength` here because that fails when
// length is NaN (which is otherwise coerced to zero.)
if(length>=kMaxLength()){throw new RangeError('Attempt to allocate Buffer larger than maximum '+'size: 0x'+kMaxLength().toString(16)+' bytes');}return length|0;}function SlowBuffer(length){if(+length!=length){ // eslint-disable-line eqeqeq
length=0;}return Buffer.alloc(+length);}Buffer.isBuffer=function isBuffer(b){return !!(b!=null&&b._isBuffer);};Buffer.compare=function compare(a,b){if(!Buffer.isBuffer(a)||!Buffer.isBuffer(b)){throw new TypeError('Arguments must be Buffers');}if(a===b)return 0;var x=a.length;var y=b.length;for(var i=0,len=Math.min(x,y);i<len;++i){if(a[i]!==b[i]){x=a[i];y=b[i];break;}}if(x<y)return -1;if(y<x)return 1;return 0;};Buffer.isEncoding=function isEncoding(encoding){switch(String(encoding).toLowerCase()){case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'raw':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return true;default:return false;}};Buffer.concat=function concat(list,length){if(!isArray(list)){throw new TypeError('"list" argument must be an Array of Buffers');}if(list.length===0){return Buffer.alloc(0);}var i;if(length===undefined){length=0;for(i=0;i<list.length;i++){length+=list[i].length;}}var buffer=Buffer.allocUnsafe(length);var pos=0;for(i=0;i<list.length;i++){var buf=list[i];if(!Buffer.isBuffer(buf)){throw new TypeError('"list" argument must be an Array of Buffers');}buf.copy(buffer,pos);pos+=buf.length;}return buffer;};function byteLength(string,encoding){if(Buffer.isBuffer(string)){return string.length;}if(typeof ArrayBuffer!=='undefined'&&typeof ArrayBuffer.isView==='function'&&(ArrayBuffer.isView(string)||string instanceof ArrayBuffer)){return string.byteLength;}if(typeof string!=='string'){string=''+string;}var len=string.length;if(len===0)return 0; // Use a for loop to avoid recursion
var loweredCase=false;for(;;){switch(encoding){case 'ascii':case 'binary': // Deprecated
case 'raw':case 'raws':return len;case 'utf8':case 'utf-8':case undefined:return utf8ToBytes(string).length;case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return len*2;case 'hex':return len>>>1;case 'base64':return base64ToBytes(string).length;default:if(loweredCase)return utf8ToBytes(string).length; // assume utf8
encoding=(''+encoding).toLowerCase();loweredCase=true;}}}Buffer.byteLength=byteLength;function slowToString(encoding,start,end){var loweredCase=false; // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
// property of a typed array.
// This behaves neither like String nor Uint8Array in that we set start/end
// to their upper/lower bounds if the value passed is out of range.
// undefined is handled specially as per ECMA-262 6th Edition,
// Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
if(start===undefined||start<0){start=0;} // Return early if start > this.length. Done here to prevent potential uint32
// coercion fail below.
if(start>this.length){return '';}if(end===undefined||end>this.length){end=this.length;}if(end<=0){return '';} // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
end>>>=0;start>>>=0;if(end<=start){return '';}if(!encoding)encoding='utf8';while(true){switch(encoding){case 'hex':return hexSlice(this,start,end);case 'utf8':case 'utf-8':return utf8Slice(this,start,end);case 'ascii':return asciiSlice(this,start,end);case 'binary':return binarySlice(this,start,end);case 'base64':return base64Slice(this,start,end);case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return utf16leSlice(this,start,end);default:if(loweredCase)throw new TypeError('Unknown encoding: '+encoding);encoding=(encoding+'').toLowerCase();loweredCase=true;}}} // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer=true;function swap(b,n,m){var i=b[n];b[n]=b[m];b[m]=i;}Buffer.prototype.swap16=function swap16(){var len=this.length;if(len%2!==0){throw new RangeError('Buffer size must be a multiple of 16-bits');}for(var i=0;i<len;i+=2){swap(this,i,i+1);}return this;};Buffer.prototype.swap32=function swap32(){var len=this.length;if(len%4!==0){throw new RangeError('Buffer size must be a multiple of 32-bits');}for(var i=0;i<len;i+=4){swap(this,i,i+3);swap(this,i+1,i+2);}return this;};Buffer.prototype.toString=function toString(){var length=this.length|0;if(length===0)return '';if(arguments.length===0)return utf8Slice(this,0,length);return slowToString.apply(this,arguments);};Buffer.prototype.equals=function equals(b){if(!Buffer.isBuffer(b))throw new TypeError('Argument must be a Buffer');if(this===b)return true;return Buffer.compare(this,b)===0;};Buffer.prototype.inspect=function inspect(){var str='';var max=exports.INSPECT_MAX_BYTES;if(this.length>0){str=this.toString('hex',0,max).match(/.{2}/g).join(' ');if(this.length>max)str+=' ... ';}return '<Buffer '+str+'>';};Buffer.prototype.compare=function compare(target,start,end,thisStart,thisEnd){if(!Buffer.isBuffer(target)){throw new TypeError('Argument must be a Buffer');}if(start===undefined){start=0;}if(end===undefined){end=target?target.length:0;}if(thisStart===undefined){thisStart=0;}if(thisEnd===undefined){thisEnd=this.length;}if(start<0||end>target.length||thisStart<0||thisEnd>this.length){throw new RangeError('out of range index');}if(thisStart>=thisEnd&&start>=end){return 0;}if(thisStart>=thisEnd){return -1;}if(start>=end){return 1;}start>>>=0;end>>>=0;thisStart>>>=0;thisEnd>>>=0;if(this===target)return 0;var x=thisEnd-thisStart;var y=end-start;var len=Math.min(x,y);var thisCopy=this.slice(thisStart,thisEnd);var targetCopy=target.slice(start,end);for(var i=0;i<len;++i){if(thisCopy[i]!==targetCopy[i]){x=thisCopy[i];y=targetCopy[i];break;}}if(x<y)return -1;if(y<x)return 1;return 0;};function arrayIndexOf(arr,val,byteOffset,encoding){var indexSize=1;var arrLength=arr.length;var valLength=val.length;if(encoding!==undefined){encoding=String(encoding).toLowerCase();if(encoding==='ucs2'||encoding==='ucs-2'||encoding==='utf16le'||encoding==='utf-16le'){if(arr.length<2||val.length<2){return -1;}indexSize=2;arrLength/=2;valLength/=2;byteOffset/=2;}}function read(buf,i){if(indexSize===1){return buf[i];}else {return buf.readUInt16BE(i*indexSize);}}var foundIndex=-1;for(var i=0;byteOffset+i<arrLength;i++){if(read(arr,byteOffset+i)===read(val,foundIndex===-1?0:i-foundIndex)){if(foundIndex===-1)foundIndex=i;if(i-foundIndex+1===valLength)return (byteOffset+foundIndex)*indexSize;}else {if(foundIndex!==-1)i-=i-foundIndex;foundIndex=-1;}}return -1;}Buffer.prototype.indexOf=function indexOf(val,byteOffset,encoding){if(typeof byteOffset==='string'){encoding=byteOffset;byteOffset=0;}else if(byteOffset>0x7fffffff){byteOffset=0x7fffffff;}else if(byteOffset<-0x80000000){byteOffset=-0x80000000;}byteOffset>>=0;if(this.length===0)return -1;if(byteOffset>=this.length)return -1; // Negative offsets start from the end of the buffer
if(byteOffset<0)byteOffset=Math.max(this.length+byteOffset,0);if(typeof val==='string'){val=Buffer.from(val,encoding);}if(Buffer.isBuffer(val)){ // special case: looking for empty string/buffer always fails
if(val.length===0){return -1;}return arrayIndexOf(this,val,byteOffset,encoding);}if(typeof val==='number'){if(Buffer.TYPED_ARRAY_SUPPORT&&Uint8Array.prototype.indexOf==='function'){return Uint8Array.prototype.indexOf.call(this,val,byteOffset);}return arrayIndexOf(this,[val],byteOffset,encoding);}throw new TypeError('val must be string, number or Buffer');};Buffer.prototype.includes=function includes(val,byteOffset,encoding){return this.indexOf(val,byteOffset,encoding)!==-1;};function hexWrite(buf,string,offset,length){offset=Number(offset)||0;var remaining=buf.length-offset;if(!length){length=remaining;}else {length=Number(length);if(length>remaining){length=remaining;}} // must be an even number of digits
var strLen=string.length;if(strLen%2!==0)throw new Error('Invalid hex string');if(length>strLen/2){length=strLen/2;}for(var i=0;i<length;i++){var parsed=parseInt(string.substr(i*2,2),16);if(isNaN(parsed))return i;buf[offset+i]=parsed;}return i;}function utf8Write(buf,string,offset,length){return blitBuffer(utf8ToBytes(string,buf.length-offset),buf,offset,length);}function asciiWrite(buf,string,offset,length){return blitBuffer(asciiToBytes(string),buf,offset,length);}function binaryWrite(buf,string,offset,length){return asciiWrite(buf,string,offset,length);}function base64Write(buf,string,offset,length){return blitBuffer(base64ToBytes(string),buf,offset,length);}function ucs2Write(buf,string,offset,length){return blitBuffer(utf16leToBytes(string,buf.length-offset),buf,offset,length);}Buffer.prototype.write=function write(string,offset,length,encoding){ // Buffer#write(string)
if(offset===undefined){encoding='utf8';length=this.length;offset=0; // Buffer#write(string, encoding)
}else if(length===undefined&&typeof offset==='string'){encoding=offset;length=this.length;offset=0; // Buffer#write(string, offset[, length][, encoding])
}else if(isFinite(offset)){offset=offset|0;if(isFinite(length)){length=length|0;if(encoding===undefined)encoding='utf8';}else {encoding=length;length=undefined;} // legacy write(string, encoding, offset, length) - remove in v0.13
}else {throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');}var remaining=this.length-offset;if(length===undefined||length>remaining)length=remaining;if(string.length>0&&(length<0||offset<0)||offset>this.length){throw new RangeError('Attempt to write outside buffer bounds');}if(!encoding)encoding='utf8';var loweredCase=false;for(;;){switch(encoding){case 'hex':return hexWrite(this,string,offset,length);case 'utf8':case 'utf-8':return utf8Write(this,string,offset,length);case 'ascii':return asciiWrite(this,string,offset,length);case 'binary':return binaryWrite(this,string,offset,length);case 'base64': // Warning: maxLength not taken into account in base64Write
return base64Write(this,string,offset,length);case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return ucs2Write(this,string,offset,length);default:if(loweredCase)throw new TypeError('Unknown encoding: '+encoding);encoding=(''+encoding).toLowerCase();loweredCase=true;}}};Buffer.prototype.toJSON=function toJSON(){return {type:'Buffer',data:Array.prototype.slice.call(this._arr||this,0)};};function base64Slice(buf,start,end){if(start===0&&end===buf.length){return base64.fromByteArray(buf);}else {return base64.fromByteArray(buf.slice(start,end));}}function utf8Slice(buf,start,end){end=Math.min(buf.length,end);var res=[];var i=start;while(i<end){var firstByte=buf[i];var codePoint=null;var bytesPerSequence=firstByte>0xEF?4:firstByte>0xDF?3:firstByte>0xBF?2:1;if(i+bytesPerSequence<=end){var secondByte,thirdByte,fourthByte,tempCodePoint;switch(bytesPerSequence){case 1:if(firstByte<0x80){codePoint=firstByte;}break;case 2:secondByte=buf[i+1];if((secondByte&0xC0)===0x80){tempCodePoint=(firstByte&0x1F)<<0x6|secondByte&0x3F;if(tempCodePoint>0x7F){codePoint=tempCodePoint;}}break;case 3:secondByte=buf[i+1];thirdByte=buf[i+2];if((secondByte&0xC0)===0x80&&(thirdByte&0xC0)===0x80){tempCodePoint=(firstByte&0xF)<<0xC|(secondByte&0x3F)<<0x6|thirdByte&0x3F;if(tempCodePoint>0x7FF&&(tempCodePoint<0xD800||tempCodePoint>0xDFFF)){codePoint=tempCodePoint;}}break;case 4:secondByte=buf[i+1];thirdByte=buf[i+2];fourthByte=buf[i+3];if((secondByte&0xC0)===0x80&&(thirdByte&0xC0)===0x80&&(fourthByte&0xC0)===0x80){tempCodePoint=(firstByte&0xF)<<0x12|(secondByte&0x3F)<<0xC|(thirdByte&0x3F)<<0x6|fourthByte&0x3F;if(tempCodePoint>0xFFFF&&tempCodePoint<0x110000){codePoint=tempCodePoint;}}}}if(codePoint===null){ // we did not generate a valid codePoint so insert a
// replacement char (U+FFFD) and advance only 1 byte
codePoint=0xFFFD;bytesPerSequence=1;}else if(codePoint>0xFFFF){ // encode to utf16 (surrogate pair dance)
codePoint-=0x10000;res.push(codePoint>>>10&0x3FF|0xD800);codePoint=0xDC00|codePoint&0x3FF;}res.push(codePoint);i+=bytesPerSequence;}return decodeCodePointsArray(res);} // Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH=0x1000;function decodeCodePointsArray(codePoints){var len=codePoints.length;if(len<=MAX_ARGUMENTS_LENGTH){return String.fromCharCode.apply(String,codePoints); // avoid extra slice()
} // Decode in chunks to avoid "call stack size exceeded".
var res='';var i=0;while(i<len){res+=String.fromCharCode.apply(String,codePoints.slice(i,i+=MAX_ARGUMENTS_LENGTH));}return res;}function asciiSlice(buf,start,end){var ret='';end=Math.min(buf.length,end);for(var i=start;i<end;i++){ret+=String.fromCharCode(buf[i]&0x7F);}return ret;}function binarySlice(buf,start,end){var ret='';end=Math.min(buf.length,end);for(var i=start;i<end;i++){ret+=String.fromCharCode(buf[i]);}return ret;}function hexSlice(buf,start,end){var len=buf.length;if(!start||start<0)start=0;if(!end||end<0||end>len)end=len;var out='';for(var i=start;i<end;i++){out+=toHex(buf[i]);}return out;}function utf16leSlice(buf,start,end){var bytes=buf.slice(start,end);var res='';for(var i=0;i<bytes.length;i+=2){res+=String.fromCharCode(bytes[i]+bytes[i+1]*256);}return res;}Buffer.prototype.slice=function slice(start,end){var len=this.length;start=~ ~start;end=end===undefined?len:~ ~end;if(start<0){start+=len;if(start<0)start=0;}else if(start>len){start=len;}if(end<0){end+=len;if(end<0)end=0;}else if(end>len){end=len;}if(end<start)end=start;var newBuf;if(Buffer.TYPED_ARRAY_SUPPORT){newBuf=this.subarray(start,end);newBuf.__proto__=Buffer.prototype;}else {var sliceLen=end-start;newBuf=new Buffer(sliceLen,undefined);for(var i=0;i<sliceLen;i++){newBuf[i]=this[i+start];}}return newBuf;}; /*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */function checkOffset(offset,ext,length){if(offset%1!==0||offset<0)throw new RangeError('offset is not uint');if(offset+ext>length)throw new RangeError('Trying to access beyond buffer length');}Buffer.prototype.readUIntLE=function readUIntLE(offset,byteLength,noAssert){offset=offset|0;byteLength=byteLength|0;if(!noAssert)checkOffset(offset,byteLength,this.length);var val=this[offset];var mul=1;var i=0;while(++i<byteLength&&(mul*=0x100)){val+=this[offset+i]*mul;}return val;};Buffer.prototype.readUIntBE=function readUIntBE(offset,byteLength,noAssert){offset=offset|0;byteLength=byteLength|0;if(!noAssert){checkOffset(offset,byteLength,this.length);}var val=this[offset+--byteLength];var mul=1;while(byteLength>0&&(mul*=0x100)){val+=this[offset+--byteLength]*mul;}return val;};Buffer.prototype.readUInt8=function readUInt8(offset,noAssert){if(!noAssert)checkOffset(offset,1,this.length);return this[offset];};Buffer.prototype.readUInt16LE=function readUInt16LE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length);return this[offset]|this[offset+1]<<8;};Buffer.prototype.readUInt16BE=function readUInt16BE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length);return this[offset]<<8|this[offset+1];};Buffer.prototype.readUInt32LE=function readUInt32LE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return (this[offset]|this[offset+1]<<8|this[offset+2]<<16)+this[offset+3]*0x1000000;};Buffer.prototype.readUInt32BE=function readUInt32BE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return this[offset]*0x1000000+(this[offset+1]<<16|this[offset+2]<<8|this[offset+3]);};Buffer.prototype.readIntLE=function readIntLE(offset,byteLength,noAssert){offset=offset|0;byteLength=byteLength|0;if(!noAssert)checkOffset(offset,byteLength,this.length);var val=this[offset];var mul=1;var i=0;while(++i<byteLength&&(mul*=0x100)){val+=this[offset+i]*mul;}mul*=0x80;if(val>=mul)val-=Math.pow(2,8*byteLength);return val;};Buffer.prototype.readIntBE=function readIntBE(offset,byteLength,noAssert){offset=offset|0;byteLength=byteLength|0;if(!noAssert)checkOffset(offset,byteLength,this.length);var i=byteLength;var mul=1;var val=this[offset+--i];while(i>0&&(mul*=0x100)){val+=this[offset+--i]*mul;}mul*=0x80;if(val>=mul)val-=Math.pow(2,8*byteLength);return val;};Buffer.prototype.readInt8=function readInt8(offset,noAssert){if(!noAssert)checkOffset(offset,1,this.length);if(!(this[offset]&0x80))return this[offset];return (0xff-this[offset]+1)*-1;};Buffer.prototype.readInt16LE=function readInt16LE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length);var val=this[offset]|this[offset+1]<<8;return val&0x8000?val|0xFFFF0000:val;};Buffer.prototype.readInt16BE=function readInt16BE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length);var val=this[offset+1]|this[offset]<<8;return val&0x8000?val|0xFFFF0000:val;};Buffer.prototype.readInt32LE=function readInt32LE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return this[offset]|this[offset+1]<<8|this[offset+2]<<16|this[offset+3]<<24;};Buffer.prototype.readInt32BE=function readInt32BE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return this[offset]<<24|this[offset+1]<<16|this[offset+2]<<8|this[offset+3];};Buffer.prototype.readFloatLE=function readFloatLE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return ieee754.read(this,offset,true,23,4);};Buffer.prototype.readFloatBE=function readFloatBE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return ieee754.read(this,offset,false,23,4);};Buffer.prototype.readDoubleLE=function readDoubleLE(offset,noAssert){if(!noAssert)checkOffset(offset,8,this.length);return ieee754.read(this,offset,true,52,8);};Buffer.prototype.readDoubleBE=function readDoubleBE(offset,noAssert){if(!noAssert)checkOffset(offset,8,this.length);return ieee754.read(this,offset,false,52,8);};function checkInt(buf,value,offset,ext,max,min){if(!Buffer.isBuffer(buf))throw new TypeError('"buffer" argument must be a Buffer instance');if(value>max||value<min)throw new RangeError('"value" argument is out of bounds');if(offset+ext>buf.length)throw new RangeError('Index out of range');}Buffer.prototype.writeUIntLE=function writeUIntLE(value,offset,byteLength,noAssert){value=+value;offset=offset|0;byteLength=byteLength|0;if(!noAssert){var maxBytes=Math.pow(2,8*byteLength)-1;checkInt(this,value,offset,byteLength,maxBytes,0);}var mul=1;var i=0;this[offset]=value&0xFF;while(++i<byteLength&&(mul*=0x100)){this[offset+i]=value/mul&0xFF;}return offset+byteLength;};Buffer.prototype.writeUIntBE=function writeUIntBE(value,offset,byteLength,noAssert){value=+value;offset=offset|0;byteLength=byteLength|0;if(!noAssert){var maxBytes=Math.pow(2,8*byteLength)-1;checkInt(this,value,offset,byteLength,maxBytes,0);}var i=byteLength-1;var mul=1;this[offset+i]=value&0xFF;while(--i>=0&&(mul*=0x100)){this[offset+i]=value/mul&0xFF;}return offset+byteLength;};Buffer.prototype.writeUInt8=function writeUInt8(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,1,0xff,0);if(!Buffer.TYPED_ARRAY_SUPPORT)value=Math.floor(value);this[offset]=value&0xff;return offset+1;};function objectWriteUInt16(buf,value,offset,littleEndian){if(value<0)value=0xffff+value+1;for(var i=0,j=Math.min(buf.length-offset,2);i<j;i++){buf[offset+i]=(value&0xff<<8*(littleEndian?i:1-i))>>>(littleEndian?i:1-i)*8;}}Buffer.prototype.writeUInt16LE=function writeUInt16LE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,2,0xffff,0);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value&0xff;this[offset+1]=value>>>8;}else {objectWriteUInt16(this,value,offset,true);}return offset+2;};Buffer.prototype.writeUInt16BE=function writeUInt16BE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,2,0xffff,0);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value>>>8;this[offset+1]=value&0xff;}else {objectWriteUInt16(this,value,offset,false);}return offset+2;};function objectWriteUInt32(buf,value,offset,littleEndian){if(value<0)value=0xffffffff+value+1;for(var i=0,j=Math.min(buf.length-offset,4);i<j;i++){buf[offset+i]=value>>>(littleEndian?i:3-i)*8&0xff;}}Buffer.prototype.writeUInt32LE=function writeUInt32LE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,4,0xffffffff,0);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset+3]=value>>>24;this[offset+2]=value>>>16;this[offset+1]=value>>>8;this[offset]=value&0xff;}else {objectWriteUInt32(this,value,offset,true);}return offset+4;};Buffer.prototype.writeUInt32BE=function writeUInt32BE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,4,0xffffffff,0);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value>>>24;this[offset+1]=value>>>16;this[offset+2]=value>>>8;this[offset+3]=value&0xff;}else {objectWriteUInt32(this,value,offset,false);}return offset+4;};Buffer.prototype.writeIntLE=function writeIntLE(value,offset,byteLength,noAssert){value=+value;offset=offset|0;if(!noAssert){var limit=Math.pow(2,8*byteLength-1);checkInt(this,value,offset,byteLength,limit-1,-limit);}var i=0;var mul=1;var sub=0;this[offset]=value&0xFF;while(++i<byteLength&&(mul*=0x100)){if(value<0&&sub===0&&this[offset+i-1]!==0){sub=1;}this[offset+i]=(value/mul>>0)-sub&0xFF;}return offset+byteLength;};Buffer.prototype.writeIntBE=function writeIntBE(value,offset,byteLength,noAssert){value=+value;offset=offset|0;if(!noAssert){var limit=Math.pow(2,8*byteLength-1);checkInt(this,value,offset,byteLength,limit-1,-limit);}var i=byteLength-1;var mul=1;var sub=0;this[offset+i]=value&0xFF;while(--i>=0&&(mul*=0x100)){if(value<0&&sub===0&&this[offset+i+1]!==0){sub=1;}this[offset+i]=(value/mul>>0)-sub&0xFF;}return offset+byteLength;};Buffer.prototype.writeInt8=function writeInt8(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,1,0x7f,-0x80);if(!Buffer.TYPED_ARRAY_SUPPORT)value=Math.floor(value);if(value<0)value=0xff+value+1;this[offset]=value&0xff;return offset+1;};Buffer.prototype.writeInt16LE=function writeInt16LE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,2,0x7fff,-0x8000);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value&0xff;this[offset+1]=value>>>8;}else {objectWriteUInt16(this,value,offset,true);}return offset+2;};Buffer.prototype.writeInt16BE=function writeInt16BE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,2,0x7fff,-0x8000);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value>>>8;this[offset+1]=value&0xff;}else {objectWriteUInt16(this,value,offset,false);}return offset+2;};Buffer.prototype.writeInt32LE=function writeInt32LE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,4,0x7fffffff,-0x80000000);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value&0xff;this[offset+1]=value>>>8;this[offset+2]=value>>>16;this[offset+3]=value>>>24;}else {objectWriteUInt32(this,value,offset,true);}return offset+4;};Buffer.prototype.writeInt32BE=function writeInt32BE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,4,0x7fffffff,-0x80000000);if(value<0)value=0xffffffff+value+1;if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value>>>24;this[offset+1]=value>>>16;this[offset+2]=value>>>8;this[offset+3]=value&0xff;}else {objectWriteUInt32(this,value,offset,false);}return offset+4;};function checkIEEE754(buf,value,offset,ext,max,min){if(offset+ext>buf.length)throw new RangeError('Index out of range');if(offset<0)throw new RangeError('Index out of range');}function writeFloat(buf,value,offset,littleEndian,noAssert){if(!noAssert){checkIEEE754(buf,value,offset,4,3.4028234663852886e+38,-3.4028234663852886e+38);}ieee754.write(buf,value,offset,littleEndian,23,4);return offset+4;}Buffer.prototype.writeFloatLE=function writeFloatLE(value,offset,noAssert){return writeFloat(this,value,offset,true,noAssert);};Buffer.prototype.writeFloatBE=function writeFloatBE(value,offset,noAssert){return writeFloat(this,value,offset,false,noAssert);};function writeDouble(buf,value,offset,littleEndian,noAssert){if(!noAssert){checkIEEE754(buf,value,offset,8,1.7976931348623157E+308,-1.7976931348623157E+308);}ieee754.write(buf,value,offset,littleEndian,52,8);return offset+8;}Buffer.prototype.writeDoubleLE=function writeDoubleLE(value,offset,noAssert){return writeDouble(this,value,offset,true,noAssert);};Buffer.prototype.writeDoubleBE=function writeDoubleBE(value,offset,noAssert){return writeDouble(this,value,offset,false,noAssert);}; // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy=function copy(target,targetStart,start,end){if(!start)start=0;if(!end&&end!==0)end=this.length;if(targetStart>=target.length)targetStart=target.length;if(!targetStart)targetStart=0;if(end>0&&end<start)end=start; // Copy 0 bytes; we're done
if(end===start)return 0;if(target.length===0||this.length===0)return 0; // Fatal error conditions
if(targetStart<0){throw new RangeError('targetStart out of bounds');}if(start<0||start>=this.length)throw new RangeError('sourceStart out of bounds');if(end<0)throw new RangeError('sourceEnd out of bounds'); // Are we oob?
if(end>this.length)end=this.length;if(target.length-targetStart<end-start){end=target.length-targetStart+start;}var len=end-start;var i;if(this===target&&start<targetStart&&targetStart<end){ // descending copy from end
for(i=len-1;i>=0;i--){target[i+targetStart]=this[i+start];}}else if(len<1000||!Buffer.TYPED_ARRAY_SUPPORT){ // ascending copy from start
for(i=0;i<len;i++){target[i+targetStart]=this[i+start];}}else {Uint8Array.prototype.set.call(target,this.subarray(start,start+len),targetStart);}return len;}; // Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill=function fill(val,start,end,encoding){ // Handle string cases:
if(typeof val==='string'){if(typeof start==='string'){encoding=start;start=0;end=this.length;}else if(typeof end==='string'){encoding=end;end=this.length;}if(val.length===1){var code=val.charCodeAt(0);if(code<256){val=code;}}if(encoding!==undefined&&typeof encoding!=='string'){throw new TypeError('encoding must be a string');}if(typeof encoding==='string'&&!Buffer.isEncoding(encoding)){throw new TypeError('Unknown encoding: '+encoding);}}else if(typeof val==='number'){val=val&255;} // Invalid ranges are not set to a default, so can range check early.
if(start<0||this.length<start||this.length<end){throw new RangeError('Out of range index');}if(end<=start){return this;}start=start>>>0;end=end===undefined?this.length:end>>>0;if(!val)val=0;var i;if(typeof val==='number'){for(i=start;i<end;i++){this[i]=val;}}else {var bytes=Buffer.isBuffer(val)?val:utf8ToBytes(new Buffer(val,encoding).toString());var len=bytes.length;for(i=0;i<end-start;i++){this[i+start]=bytes[i%len];}}return this;}; // HELPER FUNCTIONS
// ================
var INVALID_BASE64_RE=/[^+\/0-9A-Za-z-_]/g;function base64clean(str){ // Node strips out invalid characters like \n and \t from the string, base64-js does not
str=stringtrim(str).replace(INVALID_BASE64_RE,''); // Node converts strings with length < 2 to ''
if(str.length<2)return ''; // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
while(str.length%4!==0){str=str+'=';}return str;}function stringtrim(str){if(str.trim)return str.trim();return str.replace(/^\s+|\s+$/g,'');}function toHex(n){if(n<16)return '0'+n.toString(16);return n.toString(16);}function utf8ToBytes(string,units){units=units||Infinity;var codePoint;var length=string.length;var leadSurrogate=null;var bytes=[];for(var i=0;i<length;i++){codePoint=string.charCodeAt(i); // is surrogate component
if(codePoint>0xD7FF&&codePoint<0xE000){ // last char was a lead
if(!leadSurrogate){ // no lead yet
if(codePoint>0xDBFF){ // unexpected trail
if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD);continue;}else if(i+1===length){ // unpaired lead
if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD);continue;} // valid lead
leadSurrogate=codePoint;continue;} // 2 leads in a row
if(codePoint<0xDC00){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD);leadSurrogate=codePoint;continue;} // valid surrogate pair
codePoint=(leadSurrogate-0xD800<<10|codePoint-0xDC00)+0x10000;}else if(leadSurrogate){ // valid bmp char, but last char was a lead
if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD);}leadSurrogate=null; // encode utf8
if(codePoint<0x80){if((units-=1)<0)break;bytes.push(codePoint);}else if(codePoint<0x800){if((units-=2)<0)break;bytes.push(codePoint>>0x6|0xC0,codePoint&0x3F|0x80);}else if(codePoint<0x10000){if((units-=3)<0)break;bytes.push(codePoint>>0xC|0xE0,codePoint>>0x6&0x3F|0x80,codePoint&0x3F|0x80);}else if(codePoint<0x110000){if((units-=4)<0)break;bytes.push(codePoint>>0x12|0xF0,codePoint>>0xC&0x3F|0x80,codePoint>>0x6&0x3F|0x80,codePoint&0x3F|0x80);}else {throw new Error('Invalid code point');}}return bytes;}function asciiToBytes(str){var byteArray=[];for(var i=0;i<str.length;i++){ // Node's code seems to be doing this and not & 0x7F..
byteArray.push(str.charCodeAt(i)&0xFF);}return byteArray;}function utf16leToBytes(str,units){var c,hi,lo;var byteArray=[];for(var i=0;i<str.length;i++){if((units-=2)<0)break;c=str.charCodeAt(i);hi=c>>8;lo=c%256;byteArray.push(lo);byteArray.push(hi);}return byteArray;}function base64ToBytes(str){return base64.toByteArray(base64clean(str));}function blitBuffer(src,dst,offset,length){for(var i=0;i<length;i++){if(i+offset>=dst.length||i>=src.length)break;dst[i+offset]=src[i];}return i;}function isnan(val){return val!==val; // eslint-disable-line no-self-compare
}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"base64-js":3,"ieee754":30,"isarray":35}],15:[function(require,module,exports){(function(Buffer){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(arg){if(Array.isArray){return Array.isArray(arg);}return objectToString(arg)==='[object Array]';}exports.isArray=isArray;function isBoolean(arg){return typeof arg==='boolean';}exports.isBoolean=isBoolean;function isNull(arg){return arg===null;}exports.isNull=isNull;function isNullOrUndefined(arg){return arg==null;}exports.isNullOrUndefined=isNullOrUndefined;function isNumber(arg){return typeof arg==='number';}exports.isNumber=isNumber;function isString(arg){return typeof arg==='string';}exports.isString=isString;function isSymbol(arg){return (typeof arg==="undefined"?"undefined":_typeof(arg))==='symbol';}exports.isSymbol=isSymbol;function isUndefined(arg){return arg===void 0;}exports.isUndefined=isUndefined;function isRegExp(re){return objectToString(re)==='[object RegExp]';}exports.isRegExp=isRegExp;function isObject(arg){return (typeof arg==="undefined"?"undefined":_typeof(arg))==='object'&&arg!==null;}exports.isObject=isObject;function isDate(d){return objectToString(d)==='[object Date]';}exports.isDate=isDate;function isError(e){return objectToString(e)==='[object Error]'||e instanceof Error;}exports.isError=isError;function isFunction(arg){return typeof arg==='function';}exports.isFunction=isFunction;function isPrimitive(arg){return arg===null||typeof arg==='boolean'||typeof arg==='number'||typeof arg==='string'||(typeof arg==="undefined"?"undefined":_typeof(arg))==='symbol'|| // ES6 symbol
typeof arg==='undefined';}exports.isPrimitive=isPrimitive;exports.isBuffer=Buffer.isBuffer;function objectToString(o){return Object.prototype.toString.call(o);}}).call(this,{"isBuffer":require("../../is-buffer/index.js")});},{"../../is-buffer/index.js":33}],16:[function(require,module,exports){(function(process,global){ /*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.1.2
 */(function(){"use strict";function lib$es6$promise$utils$$objectOrFunction(x){return typeof x==='function'||(typeof x==="undefined"?"undefined":_typeof(x))==='object'&&x!==null;}function lib$es6$promise$utils$$isFunction(x){return typeof x==='function';}function lib$es6$promise$utils$$isMaybeThenable(x){return (typeof x==="undefined"?"undefined":_typeof(x))==='object'&&x!==null;}var lib$es6$promise$utils$$_isArray;if(!Array.isArray){lib$es6$promise$utils$$_isArray=function lib$es6$promise$utils$$_isArray(x){return Object.prototype.toString.call(x)==='[object Array]';};}else {lib$es6$promise$utils$$_isArray=Array.isArray;}var lib$es6$promise$utils$$isArray=lib$es6$promise$utils$$_isArray;var lib$es6$promise$asap$$len=0;var lib$es6$promise$asap$$vertxNext;var lib$es6$promise$asap$$customSchedulerFn;var lib$es6$promise$asap$$asap=function asap(callback,arg){lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len]=callback;lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len+1]=arg;lib$es6$promise$asap$$len+=2;if(lib$es6$promise$asap$$len===2){ // If len is 2, that means that we need to schedule an async flush.
// If additional callbacks are queued before the queue is flushed, they
// will be processed by this flush that we are scheduling.
if(lib$es6$promise$asap$$customSchedulerFn){lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);}else {lib$es6$promise$asap$$scheduleFlush();}}};function lib$es6$promise$asap$$setScheduler(scheduleFn){lib$es6$promise$asap$$customSchedulerFn=scheduleFn;}function lib$es6$promise$asap$$setAsap(asapFn){lib$es6$promise$asap$$asap=asapFn;}var lib$es6$promise$asap$$browserWindow=typeof window!=='undefined'?window:undefined;var lib$es6$promise$asap$$browserGlobal=lib$es6$promise$asap$$browserWindow||{};var lib$es6$promise$asap$$BrowserMutationObserver=lib$es6$promise$asap$$browserGlobal.MutationObserver||lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;var lib$es6$promise$asap$$isNode=typeof process!=='undefined'&&{}.toString.call(process)==='[object process]'; // test for web worker but not in IE10
var lib$es6$promise$asap$$isWorker=typeof Uint8ClampedArray!=='undefined'&&typeof importScripts!=='undefined'&&typeof MessageChannel!=='undefined'; // node
function lib$es6$promise$asap$$useNextTick(){ // node version 0.10.x displays a deprecation warning when nextTick is used recursively
// see https://github.com/cujojs/when/issues/410 for details
return function(){process.nextTick(lib$es6$promise$asap$$flush);};} // vertx
function lib$es6$promise$asap$$useVertxTimer(){return function(){lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);};}function lib$es6$promise$asap$$useMutationObserver(){var iterations=0;var observer=new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);var node=document.createTextNode('');observer.observe(node,{characterData:true});return function(){node.data=iterations=++iterations%2;};} // web worker
function lib$es6$promise$asap$$useMessageChannel(){var channel=new MessageChannel();channel.port1.onmessage=lib$es6$promise$asap$$flush;return function(){channel.port2.postMessage(0);};}function lib$es6$promise$asap$$useSetTimeout(){return function(){setTimeout(lib$es6$promise$asap$$flush,1);};}var lib$es6$promise$asap$$queue=new Array(1000);function lib$es6$promise$asap$$flush(){for(var i=0;i<lib$es6$promise$asap$$len;i+=2){var callback=lib$es6$promise$asap$$queue[i];var arg=lib$es6$promise$asap$$queue[i+1];callback(arg);lib$es6$promise$asap$$queue[i]=undefined;lib$es6$promise$asap$$queue[i+1]=undefined;}lib$es6$promise$asap$$len=0;}function lib$es6$promise$asap$$attemptVertx(){try{var r=require;var vertx=r('vertx');lib$es6$promise$asap$$vertxNext=vertx.runOnLoop||vertx.runOnContext;return lib$es6$promise$asap$$useVertxTimer();}catch(e){return lib$es6$promise$asap$$useSetTimeout();}}var lib$es6$promise$asap$$scheduleFlush; // Decide what async method to use to triggering processing of queued callbacks:
if(lib$es6$promise$asap$$isNode){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useNextTick();}else if(lib$es6$promise$asap$$BrowserMutationObserver){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useMutationObserver();}else if(lib$es6$promise$asap$$isWorker){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useMessageChannel();}else if(lib$es6$promise$asap$$browserWindow===undefined&&typeof require==='function'){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$attemptVertx();}else {lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useSetTimeout();}function lib$es6$promise$then$$then(onFulfillment,onRejection){var parent=this;var state=parent._state;if(state===lib$es6$promise$$internal$$FULFILLED&&!onFulfillment||state===lib$es6$promise$$internal$$REJECTED&&!onRejection){return this;}var child=new this.constructor(lib$es6$promise$$internal$$noop);var result=parent._result;if(state){var callback=arguments[state-1];lib$es6$promise$asap$$asap(function(){lib$es6$promise$$internal$$invokeCallback(state,child,callback,result);});}else {lib$es6$promise$$internal$$subscribe(parent,child,onFulfillment,onRejection);}return child;}var lib$es6$promise$then$$default=lib$es6$promise$then$$then;function lib$es6$promise$promise$resolve$$resolve(object){ /*jshint validthis:true */var Constructor=this;if(object&&(typeof object==="undefined"?"undefined":_typeof(object))==='object'&&object.constructor===Constructor){return object;}var promise=new Constructor(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$resolve(promise,object);return promise;}var lib$es6$promise$promise$resolve$$default=lib$es6$promise$promise$resolve$$resolve;function lib$es6$promise$$internal$$noop(){}var lib$es6$promise$$internal$$PENDING=void 0;var lib$es6$promise$$internal$$FULFILLED=1;var lib$es6$promise$$internal$$REJECTED=2;var lib$es6$promise$$internal$$GET_THEN_ERROR=new lib$es6$promise$$internal$$ErrorObject();function lib$es6$promise$$internal$$selfFulfillment(){return new TypeError("You cannot resolve a promise with itself");}function lib$es6$promise$$internal$$cannotReturnOwn(){return new TypeError('A promises callback cannot return that same promise.');}function lib$es6$promise$$internal$$getThen(promise){try{return promise.then;}catch(error){lib$es6$promise$$internal$$GET_THEN_ERROR.error=error;return lib$es6$promise$$internal$$GET_THEN_ERROR;}}function lib$es6$promise$$internal$$tryThen(then,value,fulfillmentHandler,rejectionHandler){try{then.call(value,fulfillmentHandler,rejectionHandler);}catch(e){return e;}}function lib$es6$promise$$internal$$handleForeignThenable(promise,thenable,then){lib$es6$promise$asap$$asap(function(promise){var sealed=false;var error=lib$es6$promise$$internal$$tryThen(then,thenable,function(value){if(sealed){return;}sealed=true;if(thenable!==value){lib$es6$promise$$internal$$resolve(promise,value);}else {lib$es6$promise$$internal$$fulfill(promise,value);}},function(reason){if(sealed){return;}sealed=true;lib$es6$promise$$internal$$reject(promise,reason);},'Settle: '+(promise._label||' unknown promise'));if(!sealed&&error){sealed=true;lib$es6$promise$$internal$$reject(promise,error);}},promise);}function lib$es6$promise$$internal$$handleOwnThenable(promise,thenable){if(thenable._state===lib$es6$promise$$internal$$FULFILLED){lib$es6$promise$$internal$$fulfill(promise,thenable._result);}else if(thenable._state===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,thenable._result);}else {lib$es6$promise$$internal$$subscribe(thenable,undefined,function(value){lib$es6$promise$$internal$$resolve(promise,value);},function(reason){lib$es6$promise$$internal$$reject(promise,reason);});}}function lib$es6$promise$$internal$$handleMaybeThenable(promise,maybeThenable,then){if(maybeThenable.constructor===promise.constructor&&then===lib$es6$promise$then$$default&&constructor.resolve===lib$es6$promise$promise$resolve$$default){lib$es6$promise$$internal$$handleOwnThenable(promise,maybeThenable);}else {if(then===lib$es6$promise$$internal$$GET_THEN_ERROR){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$GET_THEN_ERROR.error);}else if(then===undefined){lib$es6$promise$$internal$$fulfill(promise,maybeThenable);}else if(lib$es6$promise$utils$$isFunction(then)){lib$es6$promise$$internal$$handleForeignThenable(promise,maybeThenable,then);}else {lib$es6$promise$$internal$$fulfill(promise,maybeThenable);}}}function lib$es6$promise$$internal$$resolve(promise,value){if(promise===value){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$selfFulfillment());}else if(lib$es6$promise$utils$$objectOrFunction(value)){lib$es6$promise$$internal$$handleMaybeThenable(promise,value,lib$es6$promise$$internal$$getThen(value));}else {lib$es6$promise$$internal$$fulfill(promise,value);}}function lib$es6$promise$$internal$$publishRejection(promise){if(promise._onerror){promise._onerror(promise._result);}lib$es6$promise$$internal$$publish(promise);}function lib$es6$promise$$internal$$fulfill(promise,value){if(promise._state!==lib$es6$promise$$internal$$PENDING){return;}promise._result=value;promise._state=lib$es6$promise$$internal$$FULFILLED;if(promise._subscribers.length!==0){lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish,promise);}}function lib$es6$promise$$internal$$reject(promise,reason){if(promise._state!==lib$es6$promise$$internal$$PENDING){return;}promise._state=lib$es6$promise$$internal$$REJECTED;promise._result=reason;lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection,promise);}function lib$es6$promise$$internal$$subscribe(parent,child,onFulfillment,onRejection){var subscribers=parent._subscribers;var length=subscribers.length;parent._onerror=null;subscribers[length]=child;subscribers[length+lib$es6$promise$$internal$$FULFILLED]=onFulfillment;subscribers[length+lib$es6$promise$$internal$$REJECTED]=onRejection;if(length===0&&parent._state){lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish,parent);}}function lib$es6$promise$$internal$$publish(promise){var subscribers=promise._subscribers;var settled=promise._state;if(subscribers.length===0){return;}var child,callback,detail=promise._result;for(var i=0;i<subscribers.length;i+=3){child=subscribers[i];callback=subscribers[i+settled];if(child){lib$es6$promise$$internal$$invokeCallback(settled,child,callback,detail);}else {callback(detail);}}promise._subscribers.length=0;}function lib$es6$promise$$internal$$ErrorObject(){this.error=null;}var lib$es6$promise$$internal$$TRY_CATCH_ERROR=new lib$es6$promise$$internal$$ErrorObject();function lib$es6$promise$$internal$$tryCatch(callback,detail){try{return callback(detail);}catch(e){lib$es6$promise$$internal$$TRY_CATCH_ERROR.error=e;return lib$es6$promise$$internal$$TRY_CATCH_ERROR;}}function lib$es6$promise$$internal$$invokeCallback(settled,promise,callback,detail){var hasCallback=lib$es6$promise$utils$$isFunction(callback),value,error,succeeded,failed;if(hasCallback){value=lib$es6$promise$$internal$$tryCatch(callback,detail);if(value===lib$es6$promise$$internal$$TRY_CATCH_ERROR){failed=true;error=value.error;value=null;}else {succeeded=true;}if(promise===value){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$cannotReturnOwn());return;}}else {value=detail;succeeded=true;}if(promise._state!==lib$es6$promise$$internal$$PENDING){ // noop
}else if(hasCallback&&succeeded){lib$es6$promise$$internal$$resolve(promise,value);}else if(failed){lib$es6$promise$$internal$$reject(promise,error);}else if(settled===lib$es6$promise$$internal$$FULFILLED){lib$es6$promise$$internal$$fulfill(promise,value);}else if(settled===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,value);}}function lib$es6$promise$$internal$$initializePromise(promise,resolver){try{resolver(function resolvePromise(value){lib$es6$promise$$internal$$resolve(promise,value);},function rejectPromise(reason){lib$es6$promise$$internal$$reject(promise,reason);});}catch(e){lib$es6$promise$$internal$$reject(promise,e);}}function lib$es6$promise$promise$all$$all(entries){return new lib$es6$promise$enumerator$$default(this,entries).promise;}var lib$es6$promise$promise$all$$default=lib$es6$promise$promise$all$$all;function lib$es6$promise$promise$race$$race(entries){ /*jshint validthis:true */var Constructor=this;var promise=new Constructor(lib$es6$promise$$internal$$noop);if(!lib$es6$promise$utils$$isArray(entries)){lib$es6$promise$$internal$$reject(promise,new TypeError('You must pass an array to race.'));return promise;}var length=entries.length;function onFulfillment(value){lib$es6$promise$$internal$$resolve(promise,value);}function onRejection(reason){lib$es6$promise$$internal$$reject(promise,reason);}for(var i=0;promise._state===lib$es6$promise$$internal$$PENDING&&i<length;i++){lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]),undefined,onFulfillment,onRejection);}return promise;}var lib$es6$promise$promise$race$$default=lib$es6$promise$promise$race$$race;function lib$es6$promise$promise$reject$$reject(reason){ /*jshint validthis:true */var Constructor=this;var promise=new Constructor(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$reject(promise,reason);return promise;}var lib$es6$promise$promise$reject$$default=lib$es6$promise$promise$reject$$reject;var lib$es6$promise$promise$$counter=0;function lib$es6$promise$promise$$needsResolver(){throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');}function lib$es6$promise$promise$$needsNew(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");}var lib$es6$promise$promise$$default=lib$es6$promise$promise$$Promise; /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */function lib$es6$promise$promise$$Promise(resolver){this._id=lib$es6$promise$promise$$counter++;this._state=undefined;this._result=undefined;this._subscribers=[];if(lib$es6$promise$$internal$$noop!==resolver){typeof resolver!=='function'&&lib$es6$promise$promise$$needsResolver();this instanceof lib$es6$promise$promise$$Promise?lib$es6$promise$$internal$$initializePromise(this,resolver):lib$es6$promise$promise$$needsNew();}}lib$es6$promise$promise$$Promise.all=lib$es6$promise$promise$all$$default;lib$es6$promise$promise$$Promise.race=lib$es6$promise$promise$race$$default;lib$es6$promise$promise$$Promise.resolve=lib$es6$promise$promise$resolve$$default;lib$es6$promise$promise$$Promise.reject=lib$es6$promise$promise$reject$$default;lib$es6$promise$promise$$Promise._setScheduler=lib$es6$promise$asap$$setScheduler;lib$es6$promise$promise$$Promise._setAsap=lib$es6$promise$asap$$setAsap;lib$es6$promise$promise$$Promise._asap=lib$es6$promise$asap$$asap;lib$es6$promise$promise$$Promise.prototype={constructor:lib$es6$promise$promise$$Promise, /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */then:lib$es6$promise$then$$default, /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */'catch':function _catch(onRejection){return this.then(null,onRejection);}};var lib$es6$promise$enumerator$$default=lib$es6$promise$enumerator$$Enumerator;function lib$es6$promise$enumerator$$Enumerator(Constructor,input){this._instanceConstructor=Constructor;this.promise=new Constructor(lib$es6$promise$$internal$$noop);if(Array.isArray(input)){this._input=input;this.length=input.length;this._remaining=input.length;this._result=new Array(this.length);if(this.length===0){lib$es6$promise$$internal$$fulfill(this.promise,this._result);}else {this.length=this.length||0;this._enumerate();if(this._remaining===0){lib$es6$promise$$internal$$fulfill(this.promise,this._result);}}}else {lib$es6$promise$$internal$$reject(this.promise,this._validationError());}}lib$es6$promise$enumerator$$Enumerator.prototype._validationError=function(){return new Error('Array Methods must be provided an Array');};lib$es6$promise$enumerator$$Enumerator.prototype._enumerate=function(){var length=this.length;var input=this._input;for(var i=0;this._state===lib$es6$promise$$internal$$PENDING&&i<length;i++){this._eachEntry(input[i],i);}};lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry=function(entry,i){var c=this._instanceConstructor;var resolve=c.resolve;if(resolve===lib$es6$promise$promise$resolve$$default){var then=lib$es6$promise$$internal$$getThen(entry);if(then===lib$es6$promise$then$$default&&entry._state!==lib$es6$promise$$internal$$PENDING){this._settledAt(entry._state,i,entry._result);}else if(typeof then!=='function'){this._remaining--;this._result[i]=entry;}else if(c===lib$es6$promise$promise$$default){var promise=new c(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$handleMaybeThenable(promise,entry,then);this._willSettleAt(promise,i);}else {this._willSettleAt(new c(function(resolve){resolve(entry);}),i);}}else {this._willSettleAt(resolve(entry),i);}};lib$es6$promise$enumerator$$Enumerator.prototype._settledAt=function(state,i,value){var promise=this.promise;if(promise._state===lib$es6$promise$$internal$$PENDING){this._remaining--;if(state===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,value);}else {this._result[i]=value;}}if(this._remaining===0){lib$es6$promise$$internal$$fulfill(promise,this._result);}};lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt=function(promise,i){var enumerator=this;lib$es6$promise$$internal$$subscribe(promise,undefined,function(value){enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED,i,value);},function(reason){enumerator._settledAt(lib$es6$promise$$internal$$REJECTED,i,reason);});};function lib$es6$promise$polyfill$$polyfill(){var local;if(typeof global!=='undefined'){local=global;}else if(typeof self!=='undefined'){local=self;}else {try{local=Function('return this')();}catch(e){throw new Error('polyfill failed because global object is unavailable in this environment');}}var P=local.Promise;if(P&&Object.prototype.toString.call(P.resolve())==='[object Promise]'&&!P.cast){return;}local.Promise=lib$es6$promise$promise$$default;}var lib$es6$promise$polyfill$$default=lib$es6$promise$polyfill$$polyfill;var lib$es6$promise$umd$$ES6Promise={'Promise':lib$es6$promise$promise$$default,'polyfill':lib$es6$promise$polyfill$$default}; /* global define:true module:true window: true */if(typeof define==='function'&&define['amd']){define(function(){return lib$es6$promise$umd$$ES6Promise;});}else if(typeof module!=='undefined'&&module['exports']){module['exports']=lib$es6$promise$umd$$ES6Promise;}else if(typeof this!=='undefined'){this['ES6Promise']=lib$es6$promise$umd$$ES6Promise;}lib$es6$promise$polyfill$$default();}).call(this);}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"_process":12}],17:[function(require,module,exports){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
function EventEmitter(){this._events=this._events||{};this._maxListeners=this._maxListeners||undefined;}module.exports=EventEmitter; // Backwards-compat with node 0.10.x
EventEmitter.EventEmitter=EventEmitter;EventEmitter.prototype._events=undefined;EventEmitter.prototype._maxListeners=undefined; // By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners=10; // Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners=function(n){if(!isNumber(n)||n<0||isNaN(n))throw TypeError('n must be a positive number');this._maxListeners=n;return this;};EventEmitter.prototype.emit=function(type){var er,handler,len,args,i,listeners;if(!this._events)this._events={}; // If there is no 'error' event listener then throw.
if(type==='error'){if(!this._events.error||isObject(this._events.error)&&!this._events.error.length){er=arguments[1];if(er instanceof Error){throw er; // Unhandled 'error' event
}throw TypeError('Uncaught, unspecified "error" event.');}}handler=this._events[type];if(isUndefined(handler))return false;if(isFunction(handler)){switch(arguments.length){ // fast cases
case 1:handler.call(this);break;case 2:handler.call(this,arguments[1]);break;case 3:handler.call(this,arguments[1],arguments[2]);break; // slower
default:args=Array.prototype.slice.call(arguments,1);handler.apply(this,args);}}else if(isObject(handler)){args=Array.prototype.slice.call(arguments,1);listeners=handler.slice();len=listeners.length;for(i=0;i<len;i++){listeners[i].apply(this,args);}}return true;};EventEmitter.prototype.addListener=function(type,listener){var m;if(!isFunction(listener))throw TypeError('listener must be a function');if(!this._events)this._events={}; // To avoid recursion in the case that type === "newListener"! Before
// adding it to the listeners, first emit "newListener".
if(this._events.newListener)this.emit('newListener',type,isFunction(listener.listener)?listener.listener:listener);if(!this._events[type]) // Optimize the case of one listener. Don't need the extra array object.
this._events[type]=listener;else if(isObject(this._events[type])) // If we've already got an array, just append.
this._events[type].push(listener);else  // Adding the second element, need to change to array.
this._events[type]=[this._events[type],listener]; // Check for listener leak
if(isObject(this._events[type])&&!this._events[type].warned){if(!isUndefined(this._maxListeners)){m=this._maxListeners;}else {m=EventEmitter.defaultMaxListeners;}if(m&&m>0&&this._events[type].length>m){this._events[type].warned=true;console.error('(node) warning: possible EventEmitter memory '+'leak detected. %d listeners added. '+'Use emitter.setMaxListeners() to increase limit.',this._events[type].length);if(typeof console.trace==='function'){ // not supported in IE 10
console.trace();}}}return this;};EventEmitter.prototype.on=EventEmitter.prototype.addListener;EventEmitter.prototype.once=function(type,listener){if(!isFunction(listener))throw TypeError('listener must be a function');var fired=false;function g(){this.removeListener(type,g);if(!fired){fired=true;listener.apply(this,arguments);}}g.listener=listener;this.on(type,g);return this;}; // emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener=function(type,listener){var list,position,length,i;if(!isFunction(listener))throw TypeError('listener must be a function');if(!this._events||!this._events[type])return this;list=this._events[type];length=list.length;position=-1;if(list===listener||isFunction(list.listener)&&list.listener===listener){delete this._events[type];if(this._events.removeListener)this.emit('removeListener',type,listener);}else if(isObject(list)){for(i=length;i-->0;){if(list[i]===listener||list[i].listener&&list[i].listener===listener){position=i;break;}}if(position<0)return this;if(list.length===1){list.length=0;delete this._events[type];}else {list.splice(position,1);}if(this._events.removeListener)this.emit('removeListener',type,listener);}return this;};EventEmitter.prototype.removeAllListeners=function(type){var key,listeners;if(!this._events)return this; // not listening for removeListener, no need to emit
if(!this._events.removeListener){if(arguments.length===0)this._events={};else if(this._events[type])delete this._events[type];return this;} // emit removeListener for all listeners on all events
if(arguments.length===0){for(key in this._events){if(key==='removeListener')continue;this.removeAllListeners(key);}this.removeAllListeners('removeListener');this._events={};return this;}listeners=this._events[type];if(isFunction(listeners)){this.removeListener(type,listeners);}else if(listeners){ // LIFO order
while(listeners.length){this.removeListener(type,listeners[listeners.length-1]);}}delete this._events[type];return this;};EventEmitter.prototype.listeners=function(type){var ret;if(!this._events||!this._events[type])ret=[];else if(isFunction(this._events[type]))ret=[this._events[type]];else ret=this._events[type].slice();return ret;};EventEmitter.prototype.listenerCount=function(type){if(this._events){var evlistener=this._events[type];if(isFunction(evlistener))return 1;else if(evlistener)return evlistener.length;}return 0;};EventEmitter.listenerCount=function(emitter,type){return emitter.listenerCount(type);};function isFunction(arg){return typeof arg==='function';}function isNumber(arg){return typeof arg==='number';}function isObject(arg){return (typeof arg==="undefined"?"undefined":_typeof(arg))==='object'&&arg!==null;}function isUndefined(arg){return arg===void 0;}},{}],18:[function(require,module,exports){var Parser=require('./lib/parser');function getGlobal(){return this;}module.exports={create:function create(buffer,global){global=global||getGlobal();if(buffer instanceof global.ArrayBuffer){var DOMBufferStream=require('./lib/dom-bufferstream');return new Parser(new DOMBufferStream(buffer,0,buffer.byteLength,true,global));}else {var NodeBufferStream=require('./lib/bufferstream');return new Parser(new NodeBufferStream(buffer,0,buffer.length,true));}}};},{"./lib/bufferstream":19,"./lib/dom-bufferstream":21,"./lib/parser":25}],19:[function(require,module,exports){function BufferStream(buffer,offset,length,bigEndian){this.buffer=buffer;this.offset=offset||0;length=typeof length==='number'?length:buffer.length;this.endPosition=this.offset+length;this.setBigEndian(bigEndian);}BufferStream.prototype={setBigEndian:function setBigEndian(bigEndian){this.bigEndian=!!bigEndian;},nextUInt8:function nextUInt8(){var value=this.buffer.readUInt8(this.offset);this.offset+=1;return value;},nextInt8:function nextInt8(){var value=this.buffer.readInt8(this.offset);this.offset+=1;return value;},nextUInt16:function nextUInt16(){var value=this.bigEndian?this.buffer.readUInt16BE(this.offset):this.buffer.readUInt16LE(this.offset);this.offset+=2;return value;},nextUInt32:function nextUInt32(){var value=this.bigEndian?this.buffer.readUInt32BE(this.offset):this.buffer.readUInt32LE(this.offset);this.offset+=4;return value;},nextInt16:function nextInt16(){var value=this.bigEndian?this.buffer.readInt16BE(this.offset):this.buffer.readInt16LE(this.offset);this.offset+=2;return value;},nextInt32:function nextInt32(){var value=this.bigEndian?this.buffer.readInt32BE(this.offset):this.buffer.readInt32LE(this.offset);this.offset+=4;return value;},nextFloat:function nextFloat(){var value=this.bigEndian?this.buffer.readFloatBE(this.offset):this.buffer.readFloatLE(this.offset);this.offset+=4;return value;},nextDouble:function nextDouble(){var value=this.bigEndian?this.buffer.readDoubleBE(this.offset):this.buffer.readDoubleLE(this.offset);this.offset+=8;return value;},nextBuffer:function nextBuffer(length){var value=this.buffer.slice(this.offset,this.offset+length);this.offset+=length;return value;},remainingLength:function remainingLength(){return this.endPosition-this.offset;},nextString:function nextString(length){var value=this.buffer.toString('ascii',this.offset,this.offset+length);this.offset+=length;return value;},mark:function mark(){var self=this;return {openWithOffset:function openWithOffset(offset){offset=(offset||0)+this.offset;return new BufferStream(self.buffer,offset,self.endPosition-offset,self.bigEndian);},offset:this.offset};},offsetFrom:function offsetFrom(marker){return this.offset-marker.offset;},skip:function skip(amount){this.offset+=amount;},branch:function branch(offset,length){length=typeof length==='number'?length:this.endPosition-(this.offset+offset);return new BufferStream(this.buffer,this.offset+offset,length,this.bigEndian);}};module.exports=BufferStream;},{}],20:[function(require,module,exports){function parseNumber(s){return parseInt(s,10);} //in seconds
var hours=3600;var minutes=60; //take date (year, month, day) and time (hour, minutes, seconds) digits in UTC
//and return a timestamp in seconds
function parseDateTimeParts(dateParts,timeParts){dateParts=dateParts.map(parseNumber);timeParts=timeParts.map(parseNumber);var date=new Date();date.setUTCFullYear(dateParts[0]);date.setUTCMonth(dateParts[1]-1);date.setUTCDate(dateParts[2]);date.setUTCHours(timeParts[0]);date.setUTCMinutes(timeParts[1]);date.setUTCSeconds(timeParts[2]);date.setUTCMilliseconds(0);var timestamp=date.getTime()/1000;return timestamp;} //parse date with "2004-09-04T23:39:06-08:00" format,
//one of the formats supported by ISO 8601, and
//convert to utc timestamp in seconds
function parseDateWithTimezoneFormat(dateTimeStr){var dateParts=dateTimeStr.substr(0,10).split('-');var timeParts=dateTimeStr.substr(11,8).split(':');var timezoneStr=dateTimeStr.substr(19,6);var timezoneParts=timezoneStr.split(':').map(parseNumber);var timezoneOffset=timezoneParts[0]*hours+timezoneParts[1]*minutes;var timestamp=parseDateTimeParts(dateParts,timeParts); //minus because the timezoneOffset describes
//how much the described time is ahead of UTC
timestamp-=timezoneOffset;if(typeof timestamp==='number'&&!isNaN(timestamp)){return timestamp;}} //parse date with "YYYY:MM:DD hh:mm:ss" format, convert to utc timestamp in seconds
function parseDateWithSpecFormat(dateTimeStr){var parts=dateTimeStr.split(' '),dateParts=parts[0].split(':'),timeParts=parts[1].split(':');var timestamp=parseDateTimeParts(dateParts,timeParts);if(typeof timestamp==='number'&&!isNaN(timestamp)){return timestamp;}}function parseExifDate(dateTimeStr){ //some easy checks to determine two common date formats
//is the date in the standard "YYYY:MM:DD hh:mm:ss" format?
var isSpecFormat=dateTimeStr.length===19&&dateTimeStr.charAt(4)===':'; //is the date in the non-standard format,
//"2004-09-04T23:39:06-08:00" to include a timezone?
var isTimezoneFormat=dateTimeStr.length===25&&dateTimeStr.charAt(10)==='T';var timestamp;if(isTimezoneFormat){return parseDateWithTimezoneFormat(dateTimeStr);}else if(isSpecFormat){return parseDateWithSpecFormat(dateTimeStr);}}module.exports={parseDateWithSpecFormat:parseDateWithSpecFormat,parseDateWithTimezoneFormat:parseDateWithTimezoneFormat,parseExifDate:parseExifDate};},{}],21:[function(require,module,exports){ /*jslint browser: true, devel: true, bitwise: false, debug: true, eqeq: false, es5: true, evil: false, forin: false, newcap: false, nomen: true, plusplus: true, regexp: false, unparam: false, sloppy: true, stupid: false, sub: false, todo: true, vars: true, white: true */function DOMBufferStream(arrayBuffer,offset,length,bigEndian,global,parentOffset){this.global=global;offset=offset||0;length=length||arrayBuffer.byteLength-offset;this.arrayBuffer=arrayBuffer.slice(offset,offset+length);this.view=new global.DataView(this.arrayBuffer,0,this.arrayBuffer.byteLength);this.setBigEndian(bigEndian);this.offset=0;this.parentOffset=(parentOffset||0)+offset;}DOMBufferStream.prototype={setBigEndian:function setBigEndian(bigEndian){this.littleEndian=!bigEndian;},nextUInt8:function nextUInt8(){var value=this.view.getUint8(this.offset);this.offset+=1;return value;},nextInt8:function nextInt8(){var value=this.view.getInt8(this.offset);this.offset+=1;return value;},nextUInt16:function nextUInt16(){var value=this.view.getUint16(this.offset,this.littleEndian);this.offset+=2;return value;},nextUInt32:function nextUInt32(){var value=this.view.getUint32(this.offset,this.littleEndian);this.offset+=4;return value;},nextInt16:function nextInt16(){var value=this.view.getInt16(this.offset,this.littleEndian);this.offset+=2;return value;},nextInt32:function nextInt32(){var value=this.view.getInt32(this.offset,this.littleEndian);this.offset+=4;return value;},nextFloat:function nextFloat(){var value=this.view.getFloat32(this.offset,this.littleEndian);this.offset+=4;return value;},nextDouble:function nextDouble(){var value=this.view.getFloat64(this.offset,this.littleEndian);this.offset+=8;return value;},nextBuffer:function nextBuffer(length){ //this won't work in IE10
var value=this.arrayBuffer.slice(this.offset,this.offset+length);this.offset+=length;return value;},remainingLength:function remainingLength(){return this.arrayBuffer.byteLength-this.offset;},nextString:function nextString(length){var value=this.arrayBuffer.slice(this.offset,this.offset+length);value=String.fromCharCode.apply(null,new this.global.Uint8Array(value));this.offset+=length;return value;},mark:function mark(){var self=this;return {openWithOffset:function openWithOffset(offset){offset=(offset||0)+this.offset;return new DOMBufferStream(self.arrayBuffer,offset,self.arrayBuffer.byteLength-offset,!self.littleEndian,self.global,self.parentOffset);},offset:this.offset,getParentOffset:function getParentOffset(){return self.parentOffset;}};},offsetFrom:function offsetFrom(marker){return this.parentOffset+this.offset-(marker.offset+marker.getParentOffset());},skip:function skip(amount){this.offset+=amount;},branch:function branch(offset,length){length=typeof length==='number'?length:this.arrayBuffer.byteLength-(this.offset+offset);return new DOMBufferStream(this.arrayBuffer,this.offset+offset,length,!this.littleEndian,this.global,this.parentOffset);}};module.exports=DOMBufferStream;},{}],22:[function(require,module,exports){module.exports={exif:{0x0001:"InteropIndex",0x0002:"InteropVersion",0x000B:"ProcessingSoftware",0x00FE:"SubfileType",0x00FF:"OldSubfileType",0x0100:"ImageWidth",0x0101:"ImageHeight",0x0102:"BitsPerSample",0x0103:"Compression",0x0106:"PhotometricInterpretation",0x0107:"Thresholding",0x0108:"CellWidth",0x0109:"CellLength",0x010A:"FillOrder",0x010D:"DocumentName",0x010E:"ImageDescription",0x010F:"Make",0x0110:"Model",0x0111:"StripOffsets",0x0112:"Orientation",0x0115:"SamplesPerPixel",0x0116:"RowsPerStrip",0x0117:"StripByteCounts",0x0118:"MinSampleValue",0x0119:"MaxSampleValue",0x011A:"XResolution",0x011B:"YResolution",0x011C:"PlanarConfiguration",0x011D:"PageName",0x011E:"XPosition",0x011F:"YPosition",0x0120:"FreeOffsets",0x0121:"FreeByteCounts",0x0122:"GrayResponseUnit",0x0123:"GrayResponseCurve",0x0124:"T4Options",0x0125:"T6Options",0x0128:"ResolutionUnit",0x0129:"PageNumber",0x012C:"ColorResponseUnit",0x012D:"TransferFunction",0x0131:"Software",0x0132:"ModifyDate",0x013B:"Artist",0x013C:"HostComputer",0x013D:"Predictor",0x013E:"WhitePoint",0x013F:"PrimaryChromaticities",0x0140:"ColorMap",0x0141:"HalftoneHints",0x0142:"TileWidth",0x0143:"TileLength",0x0144:"TileOffsets",0x0145:"TileByteCounts",0x0146:"BadFaxLines",0x0147:"CleanFaxData",0x0148:"ConsecutiveBadFaxLines",0x014A:"SubIFD",0x014C:"InkSet",0x014D:"InkNames",0x014E:"NumberofInks",0x0150:"DotRange",0x0151:"TargetPrinter",0x0152:"ExtraSamples",0x0153:"SampleFormat",0x0154:"SMinSampleValue",0x0155:"SMaxSampleValue",0x0156:"TransferRange",0x0157:"ClipPath",0x0158:"XClipPathUnits",0x0159:"YClipPathUnits",0x015A:"Indexed",0x015B:"JPEGTables",0x015F:"OPIProxy",0x0190:"GlobalParametersIFD",0x0191:"ProfileType",0x0192:"FaxProfile",0x0193:"CodingMethods",0x0194:"VersionYear",0x0195:"ModeNumber",0x01B1:"Decode",0x01B2:"DefaultImageColor",0x01B3:"T82Options",0x01B5:"JPEGTables",0x0200:"JPEGProc",0x0201:"ThumbnailOffset",0x0202:"ThumbnailLength",0x0203:"JPEGRestartInterval",0x0205:"JPEGLosslessPredictors",0x0206:"JPEGPointTransforms",0x0207:"JPEGQTables",0x0208:"JPEGDCTables",0x0209:"JPEGACTables",0x0211:"YCbCrCoefficients",0x0212:"YCbCrSubSampling",0x0213:"YCbCrPositioning",0x0214:"ReferenceBlackWhite",0x022F:"StripRowCounts",0x02BC:"ApplicationNotes",0x03E7:"USPTOMiscellaneous",0x1000:"RelatedImageFileFormat",0x1001:"RelatedImageWidth",0x1002:"RelatedImageHeight",0x4746:"Rating",0x4747:"XP_DIP_XML",0x4748:"StitchInfo",0x4749:"RatingPercent",0x800D:"ImageID",0x80A3:"WangTag1",0x80A4:"WangAnnotation",0x80A5:"WangTag3",0x80A6:"WangTag4",0x80E3:"Matteing",0x80E4:"DataType",0x80E5:"ImageDepth",0x80E6:"TileDepth",0x827D:"Model2",0x828D:"CFARepeatPatternDim",0x828E:"CFAPattern2",0x828F:"BatteryLevel",0x8290:"KodakIFD",0x8298:"Copyright",0x829A:"ExposureTime",0x829D:"FNumber",0x82A5:"MDFileTag",0x82A6:"MDScalePixel",0x82A7:"MDColorTable",0x82A8:"MDLabName",0x82A9:"MDSampleInfo",0x82AA:"MDPrepDate",0x82AB:"MDPrepTime",0x82AC:"MDFileUnits",0x830E:"PixelScale",0x8335:"AdventScale",0x8336:"AdventRevision",0x835C:"UIC1Tag",0x835D:"UIC2Tag",0x835E:"UIC3Tag",0x835F:"UIC4Tag",0x83BB:"IPTC-NAA",0x847E:"IntergraphPacketData",0x847F:"IntergraphFlagRegisters",0x8480:"IntergraphMatrix",0x8481:"INGRReserved",0x8482:"ModelTiePoint",0x84E0:"Site",0x84E1:"ColorSequence",0x84E2:"IT8Header",0x84E3:"RasterPadding",0x84E4:"BitsPerRunLength",0x84E5:"BitsPerExtendedRunLength",0x84E6:"ColorTable",0x84E7:"ImageColorIndicator",0x84E8:"BackgroundColorIndicator",0x84E9:"ImageColorValue",0x84EA:"BackgroundColorValue",0x84EB:"PixelIntensityRange",0x84EC:"TransparencyIndicator",0x84ED:"ColorCharacterization",0x84EE:"HCUsage",0x84EF:"TrapIndicator",0x84F0:"CMYKEquivalent",0x8546:"SEMInfo",0x8568:"AFCP_IPTC",0x85B8:"PixelMagicJBIGOptions",0x85D8:"ModelTransform",0x8602:"WB_GRGBLevels",0x8606:"LeafData",0x8649:"PhotoshopSettings",0x8769:"ExifOffset",0x8773:"ICC_Profile",0x877F:"TIFF_FXExtensions",0x8780:"MultiProfiles",0x8781:"SharedData",0x8782:"T88Options",0x87AC:"ImageLayer",0x87AF:"GeoTiffDirectory",0x87B0:"GeoTiffDoubleParams",0x87B1:"GeoTiffAsciiParams",0x8822:"ExposureProgram",0x8824:"SpectralSensitivity",0x8825:"GPSInfo",0x8827:"ISO",0x8828:"Opto-ElectricConvFactor",0x8829:"Interlace",0x882A:"TimeZoneOffset",0x882B:"SelfTimerMode",0x8830:"SensitivityType",0x8831:"StandardOutputSensitivity",0x8832:"RecommendedExposureIndex",0x8833:"ISOSpeed",0x8834:"ISOSpeedLatitudeyyy",0x8835:"ISOSpeedLatitudezzz",0x885C:"FaxRecvParams",0x885D:"FaxSubAddress",0x885E:"FaxRecvTime",0x888A:"LeafSubIFD",0x9000:"ExifVersion",0x9003:"DateTimeOriginal",0x9004:"CreateDate",0x9101:"ComponentsConfiguration",0x9102:"CompressedBitsPerPixel",0x9201:"ShutterSpeedValue",0x9202:"ApertureValue",0x9203:"BrightnessValue",0x9204:"ExposureCompensation",0x9205:"MaxApertureValue",0x9206:"SubjectDistance",0x9207:"MeteringMode",0x9208:"LightSource",0x9209:"Flash",0x920A:"FocalLength",0x920B:"FlashEnergy",0x920C:"SpatialFrequencyResponse",0x920D:"Noise",0x920E:"FocalPlaneXResolution",0x920F:"FocalPlaneYResolution",0x9210:"FocalPlaneResolutionUnit",0x9211:"ImageNumber",0x9212:"SecurityClassification",0x9213:"ImageHistory",0x9214:"SubjectArea",0x9215:"ExposureIndex",0x9216:"TIFF-EPStandardID",0x9217:"SensingMethod",0x923A:"CIP3DataFile",0x923B:"CIP3Sheet",0x923C:"CIP3Side",0x923F:"StoNits",0x927C:"MakerNote",0x9286:"UserComment",0x9290:"SubSecTime",0x9291:"SubSecTimeOriginal",0x9292:"SubSecTimeDigitized",0x932F:"MSDocumentText",0x9330:"MSPropertySetStorage",0x9331:"MSDocumentTextPosition",0x935C:"ImageSourceData",0x9C9B:"XPTitle",0x9C9C:"XPComment",0x9C9D:"XPAuthor",0x9C9E:"XPKeywords",0x9C9F:"XPSubject",0xA000:"FlashpixVersion",0xA001:"ColorSpace",0xA002:"ExifImageWidth",0xA003:"ExifImageHeight",0xA004:"RelatedSoundFile",0xA005:"InteropOffset",0xA20B:"FlashEnergy",0xA20C:"SpatialFrequencyResponse",0xA20D:"Noise",0xA20E:"FocalPlaneXResolution",0xA20F:"FocalPlaneYResolution",0xA210:"FocalPlaneResolutionUnit",0xA211:"ImageNumber",0xA212:"SecurityClassification",0xA213:"ImageHistory",0xA214:"SubjectLocation",0xA215:"ExposureIndex",0xA216:"TIFF-EPStandardID",0xA217:"SensingMethod",0xA300:"FileSource",0xA301:"SceneType",0xA302:"CFAPattern",0xA401:"CustomRendered",0xA402:"ExposureMode",0xA403:"WhiteBalance",0xA404:"DigitalZoomRatio",0xA405:"FocalLengthIn35mmFormat",0xA406:"SceneCaptureType",0xA407:"GainControl",0xA408:"Contrast",0xA409:"Saturation",0xA40A:"Sharpness",0xA40B:"DeviceSettingDescription",0xA40C:"SubjectDistanceRange",0xA420:"ImageUniqueID",0xA430:"OwnerName",0xA431:"SerialNumber",0xA432:"LensInfo",0xA433:"LensMake",0xA434:"LensModel",0xA435:"LensSerialNumber",0xA480:"GDALMetadata",0xA481:"GDALNoData",0xA500:"Gamma",0xAFC0:"ExpandSoftware",0xAFC1:"ExpandLens",0xAFC2:"ExpandFilm",0xAFC3:"ExpandFilterLens",0xAFC4:"ExpandScanner",0xAFC5:"ExpandFlashLamp",0xBC01:"PixelFormat",0xBC02:"Transformation",0xBC03:"Uncompressed",0xBC04:"ImageType",0xBC80:"ImageWidth",0xBC81:"ImageHeight",0xBC82:"WidthResolution",0xBC83:"HeightResolution",0xBCC0:"ImageOffset",0xBCC1:"ImageByteCount",0xBCC2:"AlphaOffset",0xBCC3:"AlphaByteCount",0xBCC4:"ImageDataDiscard",0xBCC5:"AlphaDataDiscard",0xC427:"OceScanjobDesc",0xC428:"OceApplicationSelector",0xC429:"OceIDNumber",0xC42A:"OceImageLogic",0xC44F:"Annotations",0xC4A5:"PrintIM",0xC580:"USPTOOriginalContentType",0xC612:"DNGVersion",0xC613:"DNGBackwardVersion",0xC614:"UniqueCameraModel",0xC615:"LocalizedCameraModel",0xC616:"CFAPlaneColor",0xC617:"CFALayout",0xC618:"LinearizationTable",0xC619:"BlackLevelRepeatDim",0xC61A:"BlackLevel",0xC61B:"BlackLevelDeltaH",0xC61C:"BlackLevelDeltaV",0xC61D:"WhiteLevel",0xC61E:"DefaultScale",0xC61F:"DefaultCropOrigin",0xC620:"DefaultCropSize",0xC621:"ColorMatrix1",0xC622:"ColorMatrix2",0xC623:"CameraCalibration1",0xC624:"CameraCalibration2",0xC625:"ReductionMatrix1",0xC626:"ReductionMatrix2",0xC627:"AnalogBalance",0xC628:"AsShotNeutral",0xC629:"AsShotWhiteXY",0xC62A:"BaselineExposure",0xC62B:"BaselineNoise",0xC62C:"BaselineSharpness",0xC62D:"BayerGreenSplit",0xC62E:"LinearResponseLimit",0xC62F:"CameraSerialNumber",0xC630:"DNGLensInfo",0xC631:"ChromaBlurRadius",0xC632:"AntiAliasStrength",0xC633:"ShadowScale",0xC634:"DNGPrivateData",0xC635:"MakerNoteSafety",0xC640:"RawImageSegmentation",0xC65A:"CalibrationIlluminant1",0xC65B:"CalibrationIlluminant2",0xC65C:"BestQualityScale",0xC65D:"RawDataUniqueID",0xC660:"AliasLayerMetadata",0xC68B:"OriginalRawFileName",0xC68C:"OriginalRawFileData",0xC68D:"ActiveArea",0xC68E:"MaskedAreas",0xC68F:"AsShotICCProfile",0xC690:"AsShotPreProfileMatrix",0xC691:"CurrentICCProfile",0xC692:"CurrentPreProfileMatrix",0xC6BF:"ColorimetricReference",0xC6D2:"PanasonicTitle",0xC6D3:"PanasonicTitle2",0xC6F3:"CameraCalibrationSig",0xC6F4:"ProfileCalibrationSig",0xC6F5:"ProfileIFD",0xC6F6:"AsShotProfileName",0xC6F7:"NoiseReductionApplied",0xC6F8:"ProfileName",0xC6F9:"ProfileHueSatMapDims",0xC6FA:"ProfileHueSatMapData1",0xC6FB:"ProfileHueSatMapData2",0xC6FC:"ProfileToneCurve",0xC6FD:"ProfileEmbedPolicy",0xC6FE:"ProfileCopyright",0xC714:"ForwardMatrix1",0xC715:"ForwardMatrix2",0xC716:"PreviewApplicationName",0xC717:"PreviewApplicationVersion",0xC718:"PreviewSettingsName",0xC719:"PreviewSettingsDigest",0xC71A:"PreviewColorSpace",0xC71B:"PreviewDateTime",0xC71C:"RawImageDigest",0xC71D:"OriginalRawFileDigest",0xC71E:"SubTileBlockSize",0xC71F:"RowInterleaveFactor",0xC725:"ProfileLookTableDims",0xC726:"ProfileLookTableData",0xC740:"OpcodeList1",0xC741:"OpcodeList2",0xC74E:"OpcodeList3",0xC761:"NoiseProfile",0xC763:"TimeCodes",0xC764:"FrameRate",0xC772:"TStop",0xC789:"ReelName",0xC791:"OriginalDefaultFinalSize",0xC792:"OriginalBestQualitySize",0xC793:"OriginalDefaultCropSize",0xC7A1:"CameraLabel",0xC7A3:"ProfileHueSatMapEncoding",0xC7A4:"ProfileLookTableEncoding",0xC7A5:"BaselineExposureOffset",0xC7A6:"DefaultBlackRender",0xC7A7:"NewRawImageDigest",0xC7A8:"RawToPreviewGain",0xC7B5:"DefaultUserCrop",0xEA1C:"Padding",0xEA1D:"OffsetSchema",0xFDE8:"OwnerName",0xFDE9:"SerialNumber",0xFDEA:"Lens",0xFE00:"KDC_IFD",0xFE4C:"RawFile",0xFE4D:"Converter",0xFE4E:"WhiteBalance",0xFE51:"Exposure",0xFE52:"Shadows",0xFE53:"Brightness",0xFE54:"Contrast",0xFE55:"Saturation",0xFE56:"Sharpness",0xFE57:"Smoothness",0xFE58:"MoireFilter"},gps:{0x0000:'GPSVersionID',0x0001:'GPSLatitudeRef',0x0002:'GPSLatitude',0x0003:'GPSLongitudeRef',0x0004:'GPSLongitude',0x0005:'GPSAltitudeRef',0x0006:'GPSAltitude',0x0007:'GPSTimeStamp',0x0008:'GPSSatellites',0x0009:'GPSStatus',0x000A:'GPSMeasureMode',0x000B:'GPSDOP',0x000C:'GPSSpeedRef',0x000D:'GPSSpeed',0x000E:'GPSTrackRef',0x000F:'GPSTrack',0x0010:'GPSImgDirectionRef',0x0011:'GPSImgDirection',0x0012:'GPSMapDatum',0x0013:'GPSDestLatitudeRef',0x0014:'GPSDestLatitude',0x0015:'GPSDestLongitudeRef',0x0016:'GPSDestLongitude',0x0017:'GPSDestBearingRef',0x0018:'GPSDestBearing',0x0019:'GPSDestDistanceRef',0x001A:'GPSDestDistance',0x001B:'GPSProcessingMethod',0x001C:'GPSAreaInformation',0x001D:'GPSDateStamp',0x001E:'GPSDifferential',0x001F:'GPSHPositioningError'}};},{}],23:[function(require,module,exports){ /*jslint browser: true, devel: true, bitwise: false, debug: true, eqeq: false, es5: true, evil: false, forin: false, newcap: false, nomen: true, plusplus: true, regexp: false, unparam: false, sloppy: true, stupid: false, sub: false, todo: true, vars: true, white: true */function readExifValue(format,stream){switch(format){case 1:return stream.nextUInt8();case 3:return stream.nextUInt16();case 4:return stream.nextUInt32();case 5:return [stream.nextUInt32(),stream.nextUInt32()];case 6:return stream.nextInt8();case 8:return stream.nextUInt16();case 9:return stream.nextUInt32();case 10:return [stream.nextInt32(),stream.nextInt32()];case 11:return stream.nextFloat();case 12:return stream.nextDouble();default:throw new Error('Invalid format while decoding: '+format);}}function getBytesPerComponent(format){switch(format){case 1:case 2:case 6:case 7:return 1;case 3:case 8:return 2;case 4:case 9:case 11:return 4;case 5:case 10:case 12:return 8;default:throw new Error('Invalid format: '+format);}}function readExifTag(tiffMarker,stream){var tagType=stream.nextUInt16(),format=stream.nextUInt16(),bytesPerComponent=getBytesPerComponent(format),components=stream.nextUInt32(),valueBytes=bytesPerComponent*components,values,value,c; /* if the value is bigger then 4 bytes, the value is in the data section of the IFD
	and the value present in the tag is the offset starting from the tiff header. So we replace the stream
	with a stream that is located at the given offset in the data section. s*/if(valueBytes>4){stream=tiffMarker.openWithOffset(stream.nextUInt32());} //we don't want to read strings as arrays
if(format===2){values=stream.nextString(components); //cut off \0 characters
var lastNull=values.indexOf('\0');if(lastNull!==-1){values=values.substr(0,lastNull);}}else if(format===7){values=stream.nextBuffer(components);}else {values=[];for(c=0;c<components;++c){values.push(readExifValue(format,stream));}} //since our stream is a stateful object, we need to skip remaining bytes
//so our offset stays correct
if(valueBytes<4){stream.skip(4-valueBytes);}return [tagType,values,format];}function readIFDSection(tiffMarker,stream,iterator){var numberOfEntries=stream.nextUInt16(),tag,i;for(i=0;i<numberOfEntries;++i){tag=readExifTag(tiffMarker,stream);iterator(tag[0],tag[1],tag[2]);}}function readHeader(stream){var exifHeader=stream.nextString(6);if(exifHeader!=='Exif\0\0'){throw new Error('Invalid EXIF header');}var tiffMarker=stream.mark();var tiffHeader=stream.nextUInt16();if(tiffHeader===0x4949){stream.setBigEndian(false);}else if(tiffHeader===0x4D4D){stream.setBigEndian(true);}else {throw new Error('Invalid TIFF header');}if(stream.nextUInt16()!==0x002A){throw new Error('Invalid TIFF data');}return tiffMarker;}module.exports={IFD0:1,IFD1:2,GPSIFD:3,SubIFD:4,InteropIFD:5,parseTags:function parseTags(stream,iterator){var tiffMarker;try{tiffMarker=readHeader(stream);}catch(e){return false; //ignore APP1 sections with invalid headers
}var subIfdOffset,gpsOffset,interopOffset;var ifd0Stream=tiffMarker.openWithOffset(stream.nextUInt32()),IFD0=this.IFD0;readIFDSection(tiffMarker,ifd0Stream,function(tagType,value,format){switch(tagType){case 0x8825:gpsOffset=value[0];break;case 0x8769:subIfdOffset=value[0];break;default:iterator(IFD0,tagType,value,format);break;}});var ifd1Offset=ifd0Stream.nextUInt32();if(ifd1Offset!==0){var ifd1Stream=tiffMarker.openWithOffset(ifd1Offset);readIFDSection(tiffMarker,ifd1Stream,iterator.bind(null,this.IFD1));}if(gpsOffset){var gpsStream=tiffMarker.openWithOffset(gpsOffset);readIFDSection(tiffMarker,gpsStream,iterator.bind(null,this.GPSIFD));}if(subIfdOffset){var subIfdStream=tiffMarker.openWithOffset(subIfdOffset),InteropIFD=this.InteropIFD;readIFDSection(tiffMarker,subIfdStream,function(tagType,value,format){if(tagType===0xA005){interopOffset=value[0];}else {iterator(InteropIFD,tagType,value,format);}});}if(interopOffset){var interopStream=tiffMarker.openWithOffset(interopOffset);readIFDSection(tiffMarker,interopStream,iterator.bind(null,this.InteropIFD));}return true;}};},{}],24:[function(require,module,exports){ /*jslint browser: true, devel: true, bitwise: false, debug: true, eqeq: false, es5: true, evil: false, forin: false, newcap: false, nomen: true, plusplus: true, regexp: false, unparam: false, sloppy: true, stupid: false, sub: false, todo: true, vars: true, white: true */module.exports={parseSections:function parseSections(stream,iterator){var len,markerType;stream.setBigEndian(true); //stop reading the stream at the SOS (Start of Stream) marker,
//because its length is not stored in the header so we can't
//know where to jump to. The only marker after that is just EOI (End Of Image) anyway
while(stream.remainingLength()>0&&markerType!==0xDA){if(stream.nextUInt8()!==0xFF){throw new Error('Invalid JPEG section offset');}markerType=stream.nextUInt8(); //don't read size from markers that have no datas
if(markerType>=0xD0&&markerType<=0xD9||markerType===0xDA){len=0;}else {len=stream.nextUInt16()-2;}iterator(markerType,stream.branch(0,len));stream.skip(len);}}, //stream should be located after SOF section size and in big endian mode, like passed to parseSections iterator
getSizeFromSOFSection:function getSizeFromSOFSection(stream){stream.skip(1);return {height:stream.nextUInt16(),width:stream.nextUInt16()};},getSectionName:function getSectionName(markerType){var name,index;switch(markerType){case 0xD8:name='SOI';break;case 0xC4:name='DHT';break;case 0xDB:name='DQT';break;case 0xDD:name='DRI';break;case 0xDA:name='SOS';break;case 0xFE:name='COM';break;case 0xD9:name='EOI';break;default:if(markerType>=0xE0&&markerType<=0xEF){name='APP';index=markerType-0xE0;}else if(markerType>=0xC0&&markerType<=0xCF&&markerType!==0xC4&&markerType!==0xC8&&markerType!==0xCC){name='SOF';index=markerType-0xC0;}else if(markerType>=0xD0&&markerType<=0xD7){name='RST';index=markerType-0xD0;}break;}var nameStruct={name:name};if(typeof index==='number'){nameStruct.index=index;}return nameStruct;}};},{}],25:[function(require,module,exports){ /*jslint browser: true, devel: true, bitwise: false, debug: true, eqeq: false, es5: true, evil: false, forin: false, newcap: false, nomen: true, plusplus: true, regexp: false, unparam: false, sloppy: true, stupid: false, sub: false, todo: true, vars: true, white: true */var jpeg=require('./jpeg'),exif=require('./exif'),simplify=require('./simplify');function ExifResult(startMarker,tags,imageSize,thumbnailOffset,thumbnailLength,thumbnailType,app1Offset){this.startMarker=startMarker;this.tags=tags;this.imageSize=imageSize;this.thumbnailOffset=thumbnailOffset;this.thumbnailLength=thumbnailLength;this.thumbnailType=thumbnailType;this.app1Offset=app1Offset;}ExifResult.prototype={hasThumbnail:function hasThumbnail(mime){if(!this.thumbnailOffset||!this.thumbnailLength){return false;}if(typeof mime!=='string'){return true;}if(mime.toLowerCase().trim()==='image/jpeg'){return this.thumbnailType===6;}if(mime.toLowerCase().trim()==='image/tiff'){return this.thumbnailType===1;}return false;},getThumbnailOffset:function getThumbnailOffset(){return this.app1Offset+6+this.thumbnailOffset;},getThumbnailLength:function getThumbnailLength(){return this.thumbnailLength;},getThumbnailBuffer:function getThumbnailBuffer(){return this._getThumbnailStream().nextBuffer(this.thumbnailLength);},_getThumbnailStream:function _getThumbnailStream(){return this.startMarker.openWithOffset(this.getThumbnailOffset());},getImageSize:function getImageSize(){return this.imageSize;},getThumbnailSize:function getThumbnailSize(){var stream=this._getThumbnailStream(),size;jpeg.parseSections(stream,function(sectionType,sectionStream){if(jpeg.getSectionName(sectionType).name==='SOF'){size=jpeg.getSizeFromSOFSection(sectionStream);}});return size;}};function Parser(stream){this.stream=stream;this.flags={readBinaryTags:false,resolveTagNames:true,simplifyValues:true,imageSize:true,hidePointers:true,returnTags:true};}Parser.prototype={enableBinaryFields:function enableBinaryFields(enable){this.flags.readBinaryTags=!!enable;return this;},enablePointers:function enablePointers(enable){this.flags.hidePointers=!enable;return this;},enableTagNames:function enableTagNames(enable){this.flags.resolveTagNames=!!enable;return this;},enableImageSize:function enableImageSize(enable){this.flags.imageSize=!!enable;return this;},enableReturnTags:function enableReturnTags(enable){this.flags.returnTags=!!enable;return this;},enableSimpleValues:function enableSimpleValues(enable){this.flags.simplifyValues=!!enable;return this;},parse:function parse(){var start=this.stream.mark(),stream=start.openWithOffset(0),flags=this.flags,tags,imageSize,thumbnailOffset,thumbnailLength,thumbnailType,app1Offset,tagNames,getTagValue,setTagValue;if(flags.resolveTagNames){tagNames=require('./exif-tags');}if(flags.resolveTagNames){tags={};getTagValue=function getTagValue(t){return tags[t.name];};setTagValue=function setTagValue(t,value){tags[t.name]=value;};}else {tags=[];getTagValue=function getTagValue(t){var i;for(i=0;i<tags.length;++i){if(tags[i].type===t.type&&tags[i].section===t.section){return tags.value;}}};setTagValue=function setTagValue(t,value){var i;for(i=0;i<tags.length;++i){if(tags[i].type===t.type&&tags[i].section===t.section){tags.value=value;return;}}};}jpeg.parseSections(stream,function(sectionType,sectionStream){var validExifHeaders,sectionOffset=sectionStream.offsetFrom(start);if(sectionType===0xE1){validExifHeaders=exif.parseTags(sectionStream,function(ifdSection,tagType,value,format){ //ignore binary fields if disabled
if(!flags.readBinaryTags&&format===7){return;}if(tagType===0x0201){thumbnailOffset=value[0];if(flags.hidePointers){return;}}else if(tagType===0x0202){thumbnailLength=value[0];if(flags.hidePointers){return;}}else if(tagType===0x0103){thumbnailType=value[0];if(flags.hidePointers){return;}} //if flag is set to not store tags, return here after storing pointers
if(!flags.returnTags){return;}if(flags.simplifyValues){value=simplify.simplifyValue(value,format);}if(flags.resolveTagNames){var sectionTagNames=ifdSection===exif.GPSIFD?tagNames.gps:tagNames.exif;var name=sectionTagNames[tagType];if(!name){name=tagNames.exif[tagType];}tags[name]=value;}else {tags.push({section:ifdSection,type:tagType,value:value});}});if(validExifHeaders){app1Offset=sectionOffset;}}else if(flags.imageSize&&jpeg.getSectionName(sectionType).name==='SOF'){imageSize=jpeg.getSizeFromSOFSection(sectionStream);}});if(flags.simplifyValues){simplify.castDegreeValues(getTagValue,setTagValue);simplify.castDateValues(getTagValue,setTagValue);}return new ExifResult(start,tags,imageSize,thumbnailOffset,thumbnailLength,thumbnailType,app1Offset);}};module.exports=Parser;},{"./exif":23,"./exif-tags":22,"./jpeg":24,"./simplify":26}],26:[function(require,module,exports){var exif=require('./exif');var date=require('./date');var degreeTags=[{section:exif.GPSIFD,type:0x0002,name:'GPSLatitude',refType:0x0001,refName:'GPSLatitudeRef',posVal:'N'},{section:exif.GPSIFD,type:0x0004,name:'GPSLongitude',refType:0x0003,refName:'GPSLongitudeRef',posVal:'E'}];var dateTags=[{section:exif.SubIFD,type:0x9003,name:'DateTimeOriginal'},{section:exif.SubIFD,type:0x9004,name:'CreateDate'}];module.exports={castDegreeValues:function castDegreeValues(getTagValue,setTagValue){degreeTags.forEach(function(t){var degreeVal=getTagValue(t);if(degreeVal){var degreeRef=getTagValue({section:t.section,type:t.refType,name:t.refName});var degreeNumRef=degreeRef===t.posVal?1:-1;var degree=(degreeVal[0]+degreeVal[1]/60+degreeVal[2]/3600)*degreeNumRef;setTagValue(t,degree);}});},castDateValues:function castDateValues(getTagValue,setTagValue){dateTags.forEach(function(t){var dateStrVal=getTagValue(t);if(dateStrVal){ //some easy checks to determine two common date formats
var timestamp=date.parseExifDate(dateStrVal);if(typeof timestamp!=='undefined'){setTagValue(t,timestamp);}}});},simplifyValue:function simplifyValue(values,format){if(Array.isArray(values)){values=values.map(function(value){if(format===10||format===5){return value[0]/value[1];}return value;});if(values.length===1){values=values[0];}}return values;}};},{"./date":20,"./exif":23}],27:[function(require,module,exports){'use strict';module.exports=function(buf){if(!(buf&&buf.length>1)){return null;}if(buf[0]===0xFF&&buf[1]===0xD8&&buf[2]===0xFF){return {ext:'jpg',mime:'image/jpeg'};}if(buf[0]===0x89&&buf[1]===0x50&&buf[2]===0x4E&&buf[3]===0x47){return {ext:'png',mime:'image/png'};}if(buf[0]===0x47&&buf[1]===0x49&&buf[2]===0x46){return {ext:'gif',mime:'image/gif'};}if(buf[8]===0x57&&buf[9]===0x45&&buf[10]===0x42&&buf[11]===0x50){return {ext:'webp',mime:'image/webp'};} // needs to be before `tif` check
if((buf[0]===0x49&&buf[1]===0x49&&buf[2]===0x2A&&buf[3]===0x0||buf[0]===0x4D&&buf[1]===0x4D&&buf[2]===0x0&&buf[3]===0x2A)&&buf[8]===0x43&&buf[9]===0x52){return {ext:'cr2',mime:'image/x-canon-cr2'};}if(buf[0]===0x49&&buf[1]===0x49&&buf[2]===0x2A&&buf[3]===0x0||buf[0]===0x4D&&buf[1]===0x4D&&buf[2]===0x0&&buf[3]===0x2A){return {ext:'tif',mime:'image/tiff'};}if(buf[0]===0x42&&buf[1]===0x4D){return {ext:'bmp',mime:'image/bmp'};}if(buf[0]===0x49&&buf[1]===0x49&&buf[2]===0xBC){return {ext:'jxr',mime:'image/vnd.ms-photo'};}if(buf[0]===0x38&&buf[1]===0x42&&buf[2]===0x50&&buf[3]===0x53){return {ext:'psd',mime:'image/vnd.adobe.photoshop'};} // needs to be before `zip` check
if(buf[0]===0x50&&buf[1]===0x4B&&buf[2]===0x3&&buf[3]===0x4&&buf[30]===0x6D&&buf[31]===0x69&&buf[32]===0x6D&&buf[33]===0x65&&buf[34]===0x74&&buf[35]===0x79&&buf[36]===0x70&&buf[37]===0x65&&buf[38]===0x61&&buf[39]===0x70&&buf[40]===0x70&&buf[41]===0x6C&&buf[42]===0x69&&buf[43]===0x63&&buf[44]===0x61&&buf[45]===0x74&&buf[46]===0x69&&buf[47]===0x6F&&buf[48]===0x6E&&buf[49]===0x2F&&buf[50]===0x65&&buf[51]===0x70&&buf[52]===0x75&&buf[53]===0x62&&buf[54]===0x2B&&buf[55]===0x7A&&buf[56]===0x69&&buf[57]===0x70){return {ext:'epub',mime:'application/epub+zip'};} // needs to be before `zip` check
// assumes signed .xpi from addons.mozilla.org
if(buf[0]===0x50&&buf[1]===0x4B&&buf[2]===0x3&&buf[3]===0x4&&buf[30]===0x4D&&buf[31]===0x45&&buf[32]===0x54&&buf[33]===0x41&&buf[34]===0x2D&&buf[35]===0x49&&buf[36]===0x4E&&buf[37]===0x46&&buf[38]===0x2F&&buf[39]===0x6D&&buf[40]===0x6F&&buf[41]===0x7A&&buf[42]===0x69&&buf[43]===0x6C&&buf[44]===0x6C&&buf[45]===0x61&&buf[46]===0x2E&&buf[47]===0x72&&buf[48]===0x73&&buf[49]===0x61){return {ext:'xpi',mime:'application/x-xpinstall'};}if(buf[0]===0x50&&buf[1]===0x4B&&(buf[2]===0x3||buf[2]===0x5||buf[2]===0x7)&&(buf[3]===0x4||buf[3]===0x6||buf[3]===0x8)){return {ext:'zip',mime:'application/zip'};}if(buf[257]===0x75&&buf[258]===0x73&&buf[259]===0x74&&buf[260]===0x61&&buf[261]===0x72){return {ext:'tar',mime:'application/x-tar'};}if(buf[0]===0x52&&buf[1]===0x61&&buf[2]===0x72&&buf[3]===0x21&&buf[4]===0x1A&&buf[5]===0x7&&(buf[6]===0x0||buf[6]===0x1)){return {ext:'rar',mime:'application/x-rar-compressed'};}if(buf[0]===0x1F&&buf[1]===0x8B&&buf[2]===0x8){return {ext:'gz',mime:'application/gzip'};}if(buf[0]===0x42&&buf[1]===0x5A&&buf[2]===0x68){return {ext:'bz2',mime:'application/x-bzip2'};}if(buf[0]===0x37&&buf[1]===0x7A&&buf[2]===0xBC&&buf[3]===0xAF&&buf[4]===0x27&&buf[5]===0x1C){return {ext:'7z',mime:'application/x-7z-compressed'};}if(buf[0]===0x78&&buf[1]===0x01){return {ext:'dmg',mime:'application/x-apple-diskimage'};}if(buf[0]===0x0&&buf[1]===0x0&&buf[2]===0x0&&(buf[3]===0x18||buf[3]===0x20)&&buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70||buf[0]===0x33&&buf[1]===0x67&&buf[2]===0x70&&buf[3]===0x35||buf[0]===0x0&&buf[1]===0x0&&buf[2]===0x0&&buf[3]===0x1C&&buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70&&buf[8]===0x6D&&buf[9]===0x70&&buf[10]===0x34&&buf[11]===0x32&&buf[16]===0x6D&&buf[17]===0x70&&buf[18]===0x34&&buf[19]===0x31&&buf[20]===0x6D&&buf[21]===0x70&&buf[22]===0x34&&buf[23]===0x32&&buf[24]===0x69&&buf[25]===0x73&&buf[26]===0x6F&&buf[27]===0x6D||buf[0]===0x0&&buf[1]===0x0&&buf[2]===0x0&&buf[3]===0x1C&&buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70&&buf[8]===0x69&&buf[9]===0x73&&buf[10]===0x6F&&buf[11]===0x6D||buf[0]===0x0&&buf[1]===0x0&&buf[2]===0x0&&buf[3]===0x1c&&buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70&&buf[8]===0x6D&&buf[9]===0x70&&buf[10]===0x34&&buf[11]===0x32&&buf[12]===0x0&&buf[13]===0x0&&buf[14]===0x0&&buf[15]===0x0){return {ext:'mp4',mime:'video/mp4'};}if(buf[0]===0x0&&buf[1]===0x0&&buf[2]===0x0&&buf[3]===0x1C&&buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70&&buf[8]===0x4D&&buf[9]===0x34&&buf[10]===0x56){return {ext:'m4v',mime:'video/x-m4v'};}if(buf[0]===0x4D&&buf[1]===0x54&&buf[2]===0x68&&buf[3]===0x64){return {ext:'mid',mime:'audio/midi'};} // needs to be before the `webm` check
if(buf[31]===0x6D&&buf[32]===0x61&&buf[33]===0x74&&buf[34]===0x72&&buf[35]===0x6f&&buf[36]===0x73&&buf[37]===0x6B&&buf[38]===0x61){return {ext:'mkv',mime:'video/x-matroska'};}if(buf[0]===0x1A&&buf[1]===0x45&&buf[2]===0xDF&&buf[3]===0xA3){return {ext:'webm',mime:'video/webm'};}if(buf[0]===0x0&&buf[1]===0x0&&buf[2]===0x0&&buf[3]===0x14&&buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70){return {ext:'mov',mime:'video/quicktime'};}if(buf[0]===0x52&&buf[1]===0x49&&buf[2]===0x46&&buf[3]===0x46&&buf[8]===0x41&&buf[9]===0x56&&buf[10]===0x49){return {ext:'avi',mime:'video/x-msvideo'};}if(buf[0]===0x30&&buf[1]===0x26&&buf[2]===0xB2&&buf[3]===0x75&&buf[4]===0x8E&&buf[5]===0x66&&buf[6]===0xCF&&buf[7]===0x11&&buf[8]===0xA6&&buf[9]===0xD9){return {ext:'wmv',mime:'video/x-ms-wmv'};}if(buf[0]===0x0&&buf[1]===0x0&&buf[2]===0x1&&buf[3].toString(16)[0]==='b'){return {ext:'mpg',mime:'video/mpeg'};}if(buf[0]===0x49&&buf[1]===0x44&&buf[2]===0x33||buf[0]===0xFF&&buf[1]===0xfb){return {ext:'mp3',mime:'audio/mpeg'};}if(buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70&&buf[8]===0x4D&&buf[9]===0x34&&buf[10]===0x41||buf[0]===0x4D&&buf[1]===0x34&&buf[2]===0x41&&buf[3]===0x20){return {ext:'m4a',mime:'audio/m4a'};} // needs to be before `ogg` check
if(buf[28]===0x4F&&buf[29]===0x70&&buf[30]===0x75&&buf[31]===0x73&&buf[32]===0x48&&buf[33]===0x65&&buf[34]===0x61&&buf[35]===0x64){return {ext:'opus',mime:'audio/opus'};}if(buf[0]===0x4F&&buf[1]===0x67&&buf[2]===0x67&&buf[3]===0x53){return {ext:'ogg',mime:'audio/ogg'};}if(buf[0]===0x66&&buf[1]===0x4C&&buf[2]===0x61&&buf[3]===0x43){return {ext:'flac',mime:'audio/x-flac'};}if(buf[0]===0x52&&buf[1]===0x49&&buf[2]===0x46&&buf[3]===0x46&&buf[8]===0x57&&buf[9]===0x41&&buf[10]===0x56&&buf[11]===0x45){return {ext:'wav',mime:'audio/x-wav'};}if(buf[0]===0x23&&buf[1]===0x21&&buf[2]===0x41&&buf[3]===0x4D&&buf[4]===0x52&&buf[5]===0x0A){return {ext:'amr',mime:'audio/amr'};}if(buf[0]===0x25&&buf[1]===0x50&&buf[2]===0x44&&buf[3]===0x46){return {ext:'pdf',mime:'application/pdf'};}if(buf[0]===0x4D&&buf[1]===0x5A){return {ext:'exe',mime:'application/x-msdownload'};}if((buf[0]===0x43||buf[0]===0x46)&&buf[1]===0x57&&buf[2]===0x53){return {ext:'swf',mime:'application/x-shockwave-flash'};}if(buf[0]===0x7B&&buf[1]===0x5C&&buf[2]===0x72&&buf[3]===0x74&&buf[4]===0x66){return {ext:'rtf',mime:'application/rtf'};}if(buf[0]===0x77&&buf[1]===0x4F&&buf[2]===0x46&&buf[3]===0x46&&(buf[4]===0x00&&buf[5]===0x01&&buf[6]===0x00&&buf[7]===0x00||buf[4]===0x4F&&buf[5]===0x54&&buf[6]===0x54&&buf[7]===0x4F)){return {ext:'woff',mime:'application/font-woff'};}if(buf[0]===0x77&&buf[1]===0x4F&&buf[2]===0x46&&buf[3]===0x32&&(buf[4]===0x00&&buf[5]===0x01&&buf[6]===0x00&&buf[7]===0x00||buf[4]===0x4F&&buf[5]===0x54&&buf[6]===0x54&&buf[7]===0x4F)){return {ext:'woff2',mime:'application/font-woff'};}if(buf[34]===0x4C&&buf[35]===0x50&&(buf[8]===0x00&&buf[9]===0x00&&buf[10]===0x01||buf[8]===0x01&&buf[9]===0x00&&buf[10]===0x02||buf[8]===0x02&&buf[9]===0x00&&buf[10]===0x02)){return {ext:'eot',mime:'application/octet-stream'};}if(buf[0]===0x00&&buf[1]===0x01&&buf[2]===0x00&&buf[3]===0x00&&buf[4]===0x00){return {ext:'ttf',mime:'application/font-sfnt'};}if(buf[0]===0x4F&&buf[1]===0x54&&buf[2]===0x54&&buf[3]===0x4F&&buf[4]===0x00){return {ext:'otf',mime:'application/font-sfnt'};}if(buf[0]===0x00&&buf[1]===0x00&&buf[2]===0x01&&buf[3]===0x00){return {ext:'ico',mime:'image/x-icon'};}if(buf[0]===0x46&&buf[1]===0x4C&&buf[2]===0x56&&buf[3]===0x01){return {ext:'flv',mime:'video/x-flv'};}if(buf[0]===0x25&&buf[1]===0x21){return {ext:'ps',mime:'application/postscript'};}if(buf[0]===0xFD&&buf[1]===0x37&&buf[2]===0x7A&&buf[3]===0x58&&buf[4]===0x5A&&buf[5]===0x00){return {ext:'xz',mime:'application/x-xz'};}if(buf[0]===0x53&&buf[1]===0x51&&buf[2]===0x4C&&buf[3]===0x69){return {ext:'sqlite',mime:'application/x-sqlite3'};}if(buf[0]===0x4E&&buf[1]===0x45&&buf[2]===0x53&&buf[3]===0x1A){return {ext:'nes',mime:'application/x-nintendo-nes-rom'};}if(buf[0]===0x43&&buf[1]===0x72&&buf[2]===0x32&&buf[3]===0x34){return {ext:'crx',mime:'application/x-google-chrome-extension'};}if(buf[0]===0x4D&&buf[1]===0x53&&buf[2]===0x43&&buf[3]===0x46||buf[0]===0x49&&buf[1]===0x53&&buf[2]===0x63&&buf[3]===0x28){return {ext:'cab',mime:'application/vnd.ms-cab-compressed'};} // needs to be before `ar` check
if(buf[0]===0x21&&buf[1]===0x3C&&buf[2]===0x61&&buf[3]===0x72&&buf[4]===0x63&&buf[5]===0x68&&buf[6]===0x3E&&buf[7]===0x0A&&buf[8]===0x64&&buf[9]===0x65&&buf[10]===0x62&&buf[11]===0x69&&buf[12]===0x61&&buf[13]===0x6E&&buf[14]===0x2D&&buf[15]===0x62&&buf[16]===0x69&&buf[17]===0x6E&&buf[18]===0x61&&buf[19]===0x72&&buf[20]===0x79){return {ext:'deb',mime:'application/x-deb'};}if(buf[0]===0x21&&buf[1]===0x3C&&buf[2]===0x61&&buf[3]===0x72&&buf[4]===0x63&&buf[5]===0x68&&buf[6]===0x3E){return {ext:'ar',mime:'application/x-unix-archive'};}if(buf[0]===0xED&&buf[1]===0xAB&&buf[2]===0xEE&&buf[3]===0xDB){return {ext:'rpm',mime:'application/x-rpm'};}if(buf[0]===0x1F&&buf[1]===0xA0||buf[0]===0x1F&&buf[1]===0x9D){return {ext:'Z',mime:'application/x-compress'};}if(buf[0]===0x4C&&buf[1]===0x5A&&buf[2]===0x49&&buf[3]===0x50){return {ext:'lz',mime:'application/x-lzip'};}if(buf[0]===0xD0&&buf[1]===0xCF&&buf[2]===0x11&&buf[3]===0xE0&&buf[4]===0xA1&&buf[5]===0xB1&&buf[6]===0x1A&&buf[7]===0xE1){return {ext:'msi',mime:'application/x-msi'};}return null;};},{}],28:[function(require,module,exports){var isFunction=require('is-function');module.exports=forEach;var toString=Object.prototype.toString;var hasOwnProperty=Object.prototype.hasOwnProperty;function forEach(list,iterator,context){if(!isFunction(iterator)){throw new TypeError('iterator must be a function');}if(arguments.length<3){context=this;}if(toString.call(list)==='[object Array]')forEachArray(list,iterator,context);else if(typeof list==='string')forEachString(list,iterator,context);else forEachObject(list,iterator,context);}function forEachArray(array,iterator,context){for(var i=0,len=array.length;i<len;i++){if(hasOwnProperty.call(array,i)){iterator.call(context,array[i],i,array);}}}function forEachString(string,iterator,context){for(var i=0,len=string.length;i<len;i++){ // no such thing as a sparse string.
iterator.call(context,string.charAt(i),i,string);}}function forEachObject(object,iterator,context){for(var k in object){if(hasOwnProperty.call(object,k)){iterator.call(context,object[k],k,object);}}}},{"is-function":34}],29:[function(require,module,exports){(function(global){if(typeof window!=="undefined"){module.exports=window;}else if(typeof global!=="undefined"){module.exports=global;}else if(typeof self!=="undefined"){module.exports=self;}else {module.exports={};}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],30:[function(require,module,exports){exports.read=function(buffer,offset,isLE,mLen,nBytes){var e,m;var eLen=nBytes*8-mLen-1;var eMax=(1<<eLen)-1;var eBias=eMax>>1;var nBits=-7;var i=isLE?nBytes-1:0;var d=isLE?-1:1;var s=buffer[offset+i];i+=d;e=s&(1<<-nBits)-1;s>>=-nBits;nBits+=eLen;for(;nBits>0;e=e*256+buffer[offset+i],i+=d,nBits-=8){}m=e&(1<<-nBits)-1;e>>=-nBits;nBits+=mLen;for(;nBits>0;m=m*256+buffer[offset+i],i+=d,nBits-=8){}if(e===0){e=1-eBias;}else if(e===eMax){return m?NaN:(s?-1:1)*Infinity;}else {m=m+Math.pow(2,mLen);e=e-eBias;}return (s?-1:1)*m*Math.pow(2,e-mLen);};exports.write=function(buffer,value,offset,isLE,mLen,nBytes){var e,m,c;var eLen=nBytes*8-mLen-1;var eMax=(1<<eLen)-1;var eBias=eMax>>1;var rt=mLen===23?Math.pow(2,-24)-Math.pow(2,-77):0;var i=isLE?0:nBytes-1;var d=isLE?1:-1;var s=value<0||value===0&&1/value<0?1:0;value=Math.abs(value);if(isNaN(value)||value===Infinity){m=isNaN(value)?1:0;e=eMax;}else {e=Math.floor(Math.log(value)/Math.LN2);if(value*(c=Math.pow(2,-e))<1){e--;c*=2;}if(e+eBias>=1){value+=rt/c;}else {value+=rt*Math.pow(2,1-eBias);}if(value*c>=2){e++;c/=2;}if(e+eBias>=eMax){m=0;e=eMax;}else if(e+eBias>=1){m=(value*c-1)*Math.pow(2,mLen);e=e+eBias;}else {m=value*Math.pow(2,eBias-1)*Math.pow(2,mLen);e=0;}}for(;mLen>=8;buffer[offset+i]=m&0xff,i+=d,m/=256,mLen-=8){}e=e<<mLen|m;eLen+=mLen;for(;eLen>0;buffer[offset+i]=e&0xff,i+=d,e/=256,eLen-=8){}buffer[offset+i-d]|=s*128;};},{}],31:[function(require,module,exports){if(typeof Object.create==='function'){ // implementation from standard node.js 'util' module
module.exports=function inherits(ctor,superCtor){ctor.super_=superCtor;ctor.prototype=Object.create(superCtor.prototype,{constructor:{value:ctor,enumerable:false,writable:true,configurable:true}});};}else { // old school shim for old browsers
module.exports=function inherits(ctor,superCtor){ctor.super_=superCtor;var TempCtor=function TempCtor(){};TempCtor.prototype=superCtor.prototype;ctor.prototype=new TempCtor();ctor.prototype.constructor=ctor;};}},{}],32:[function(require,module,exports){'use strict';var v4='(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}';var v6='(?:(?:[0-9a-fA-F:]){1,4}(?:(?::(?:[0-9a-fA-F]){1,4}|:)){2,7})+';var ip=module.exports=function(opts){opts=opts||{};return opts.exact?new RegExp('(?:^'+v4+'$)|(?:^'+v6+'$)'):new RegExp('(?:'+v4+')|(?:'+v6+')','g');};ip.v4=function(opts){opts=opts||{};return opts.exact?new RegExp('^'+v4+'$'):new RegExp(v4,'g');};ip.v6=function(opts){opts=opts||{};return opts.exact?new RegExp('^'+v6+'$'):new RegExp(v6,'g');};},{}],33:[function(require,module,exports){ /**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */module.exports=function(obj){return !!(obj!=null&&(obj._isBuffer|| // For Safari 5-7 (missing Object.prototype.constructor)
obj.constructor&&typeof obj.constructor.isBuffer==='function'&&obj.constructor.isBuffer(obj)));};},{}],34:[function(require,module,exports){module.exports=isFunction;var toString=Object.prototype.toString;function isFunction(fn){var string=toString.call(fn);return string==='[object Function]'||typeof fn==='function'&&string!=='[object RegExp]'||typeof window!=='undefined'&&( // IE8 and below
fn===window.setTimeout||fn===window.alert||fn===window.confirm||fn===window.prompt);};},{}],35:[function(require,module,exports){var toString={}.toString;module.exports=Array.isArray||function(arr){return toString.call(arr)=='[object Array]';};},{}],36:[function(require,module,exports){var encode=require('./lib/encoder'),decode=require('./lib/decoder');module.exports={encode:encode,decode:decode};},{"./lib/decoder":37,"./lib/encoder":38}],37:[function(require,module,exports){(function(Buffer){ /* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */ /*
   Copyright 2011 notmasteryet

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/ // - The JPEG specification can be found in the ITU CCITT Recommendation T.81
//   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
// - The JFIF specification can be found in the JPEG File Interchange Format
//   (www.w3.org/Graphics/JPEG/jfif3.pdf)
// - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
//   in PostScript Level 2, Technical Note #5116
//   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)
var JpegImage=function jpegImage(){"use strict";var dctZigZag=new Int32Array([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]);var dctCos1=4017; // cos(pi/16)
var dctSin1=799; // sin(pi/16)
var dctCos3=3406; // cos(3*pi/16)
var dctSin3=2276; // sin(3*pi/16)
var dctCos6=1567; // cos(6*pi/16)
var dctSin6=3784; // sin(6*pi/16)
var dctSqrt2=5793; // sqrt(2)
var dctSqrt1d2=2896; // sqrt(2) / 2
function constructor(){}function buildHuffmanTable(codeLengths,values){var k=0,code=[],i,j,length=16;while(length>0&&!codeLengths[length-1]){length--;}code.push({children:[],index:0});var p=code[0],q;for(i=0;i<length;i++){for(j=0;j<codeLengths[i];j++){p=code.pop();p.children[p.index]=values[k];while(p.index>0){p=code.pop();}p.index++;code.push(p);while(code.length<=i){code.push(q={children:[],index:0});p.children[p.index]=q.children;p=q;}k++;}if(i+1<length){ // p here points to last code
code.push(q={children:[],index:0});p.children[p.index]=q.children;p=q;}}return code[0].children;}function decodeScan(data,offset,frame,components,resetInterval,spectralStart,spectralEnd,successivePrev,successive){var precision=frame.precision;var samplesPerLine=frame.samplesPerLine;var scanLines=frame.scanLines;var mcusPerLine=frame.mcusPerLine;var progressive=frame.progressive;var maxH=frame.maxH,maxV=frame.maxV;var startOffset=offset,bitsData=0,bitsCount=0;function readBit(){if(bitsCount>0){bitsCount--;return bitsData>>bitsCount&1;}bitsData=data[offset++];if(bitsData==0xFF){var nextByte=data[offset++];if(nextByte){throw "unexpected marker: "+(bitsData<<8|nextByte).toString(16);} // unstuff 0
}bitsCount=7;return bitsData>>>7;}function decodeHuffman(tree){var node=tree,bit;while((bit=readBit())!==null){node=node[bit];if(typeof node==='number')return node;if((typeof node==="undefined"?"undefined":_typeof(node))!=='object')throw "invalid huffman sequence";}return null;}function receive(length){var n=0;while(length>0){var bit=readBit();if(bit===null)return;n=n<<1|bit;length--;}return n;}function receiveAndExtend(length){var n=receive(length);if(n>=1<<length-1)return n;return n+(-1<<length)+1;}function decodeBaseline(component,zz){var t=decodeHuffman(component.huffmanTableDC);var diff=t===0?0:receiveAndExtend(t);zz[0]=component.pred+=diff;var k=1;while(k<64){var rs=decodeHuffman(component.huffmanTableAC);var s=rs&15,r=rs>>4;if(s===0){if(r<15)break;k+=16;continue;}k+=r;var z=dctZigZag[k];zz[z]=receiveAndExtend(s);k++;}}function decodeDCFirst(component,zz){var t=decodeHuffman(component.huffmanTableDC);var diff=t===0?0:receiveAndExtend(t)<<successive;zz[0]=component.pred+=diff;}function decodeDCSuccessive(component,zz){zz[0]|=readBit()<<successive;}var eobrun=0;function decodeACFirst(component,zz){if(eobrun>0){eobrun--;return;}var k=spectralStart,e=spectralEnd;while(k<=e){var rs=decodeHuffman(component.huffmanTableAC);var s=rs&15,r=rs>>4;if(s===0){if(r<15){eobrun=receive(r)+(1<<r)-1;break;}k+=16;continue;}k+=r;var z=dctZigZag[k];zz[z]=receiveAndExtend(s)*(1<<successive);k++;}}var successiveACState=0,successiveACNextValue;function decodeACSuccessive(component,zz){var k=spectralStart,e=spectralEnd,r=0;while(k<=e){var z=dctZigZag[k];switch(successiveACState){case 0: // initial state
var rs=decodeHuffman(component.huffmanTableAC);var s=rs&15,r=rs>>4;if(s===0){if(r<15){eobrun=receive(r)+(1<<r);successiveACState=4;}else {r=16;successiveACState=1;}}else {if(s!==1)throw "invalid ACn encoding";successiveACNextValue=receiveAndExtend(s);successiveACState=r?2:3;}continue;case 1: // skipping r zero items
case 2:if(zz[z])zz[z]+=readBit()<<successive;else {r--;if(r===0)successiveACState=successiveACState==2?3:0;}break;case 3: // set value for a zero item
if(zz[z])zz[z]+=readBit()<<successive;else {zz[z]=successiveACNextValue<<successive;successiveACState=0;}break;case 4: // eob
if(zz[z])zz[z]+=readBit()<<successive;break;}k++;}if(successiveACState===4){eobrun--;if(eobrun===0)successiveACState=0;}}function decodeMcu(component,decode,mcu,row,col){var mcuRow=mcu/mcusPerLine|0;var mcuCol=mcu%mcusPerLine;var blockRow=mcuRow*component.v+row;var blockCol=mcuCol*component.h+col;decode(component,component.blocks[blockRow][blockCol]);}function decodeBlock(component,decode,mcu){var blockRow=mcu/component.blocksPerLine|0;var blockCol=mcu%component.blocksPerLine;decode(component,component.blocks[blockRow][blockCol]);}var componentsLength=components.length;var component,i,j,k,n;var decodeFn;if(progressive){if(spectralStart===0)decodeFn=successivePrev===0?decodeDCFirst:decodeDCSuccessive;else decodeFn=successivePrev===0?decodeACFirst:decodeACSuccessive;}else {decodeFn=decodeBaseline;}var mcu=0,marker;var mcuExpected;if(componentsLength==1){mcuExpected=components[0].blocksPerLine*components[0].blocksPerColumn;}else {mcuExpected=mcusPerLine*frame.mcusPerColumn;}if(!resetInterval)resetInterval=mcuExpected;var h,v;while(mcu<mcuExpected){ // reset interval stuff
for(i=0;i<componentsLength;i++){components[i].pred=0;}eobrun=0;if(componentsLength==1){component=components[0];for(n=0;n<resetInterval;n++){decodeBlock(component,decodeFn,mcu);mcu++;}}else {for(n=0;n<resetInterval;n++){for(i=0;i<componentsLength;i++){component=components[i];h=component.h;v=component.v;for(j=0;j<v;j++){for(k=0;k<h;k++){decodeMcu(component,decodeFn,mcu,j,k);}}}mcu++; // If we've reached our expected MCU's, stop decoding
if(mcu===mcuExpected)break;}} // find marker
bitsCount=0;marker=data[offset]<<8|data[offset+1];if(marker<0xFF00){throw "marker was not found";}if(marker>=0xFFD0&&marker<=0xFFD7){ // RSTx
offset+=2;}else break;}return offset-startOffset;}function buildComponentData(frame,component){var lines=[];var blocksPerLine=component.blocksPerLine;var blocksPerColumn=component.blocksPerColumn;var samplesPerLine=blocksPerLine<<3;var R=new Int32Array(64),r=new Uint8Array(64); // A port of poppler's IDCT method which in turn is taken from:
//   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
//   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
//   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
//   988-991.
function quantizeAndInverse(zz,dataOut,dataIn){var qt=component.quantizationTable;var v0,v1,v2,v3,v4,v5,v6,v7,t;var p=dataIn;var i; // dequant
for(i=0;i<64;i++){p[i]=zz[i]*qt[i];} // inverse DCT on rows
for(i=0;i<8;++i){var row=8*i; // check for all-zero AC coefficients
if(p[1+row]==0&&p[2+row]==0&&p[3+row]==0&&p[4+row]==0&&p[5+row]==0&&p[6+row]==0&&p[7+row]==0){t=dctSqrt2*p[0+row]+512>>10;p[0+row]=t;p[1+row]=t;p[2+row]=t;p[3+row]=t;p[4+row]=t;p[5+row]=t;p[6+row]=t;p[7+row]=t;continue;} // stage 4
v0=dctSqrt2*p[0+row]+128>>8;v1=dctSqrt2*p[4+row]+128>>8;v2=p[2+row];v3=p[6+row];v4=dctSqrt1d2*(p[1+row]-p[7+row])+128>>8;v7=dctSqrt1d2*(p[1+row]+p[7+row])+128>>8;v5=p[3+row]<<4;v6=p[5+row]<<4; // stage 3
t=v0-v1+1>>1;v0=v0+v1+1>>1;v1=t;t=v2*dctSin6+v3*dctCos6+128>>8;v2=v2*dctCos6-v3*dctSin6+128>>8;v3=t;t=v4-v6+1>>1;v4=v4+v6+1>>1;v6=t;t=v7+v5+1>>1;v5=v7-v5+1>>1;v7=t; // stage 2
t=v0-v3+1>>1;v0=v0+v3+1>>1;v3=t;t=v1-v2+1>>1;v1=v1+v2+1>>1;v2=t;t=v4*dctSin3+v7*dctCos3+2048>>12;v4=v4*dctCos3-v7*dctSin3+2048>>12;v7=t;t=v5*dctSin1+v6*dctCos1+2048>>12;v5=v5*dctCos1-v6*dctSin1+2048>>12;v6=t; // stage 1
p[0+row]=v0+v7;p[7+row]=v0-v7;p[1+row]=v1+v6;p[6+row]=v1-v6;p[2+row]=v2+v5;p[5+row]=v2-v5;p[3+row]=v3+v4;p[4+row]=v3-v4;} // inverse DCT on columns
for(i=0;i<8;++i){var col=i; // check for all-zero AC coefficients
if(p[1*8+col]==0&&p[2*8+col]==0&&p[3*8+col]==0&&p[4*8+col]==0&&p[5*8+col]==0&&p[6*8+col]==0&&p[7*8+col]==0){t=dctSqrt2*dataIn[i+0]+8192>>14;p[0*8+col]=t;p[1*8+col]=t;p[2*8+col]=t;p[3*8+col]=t;p[4*8+col]=t;p[5*8+col]=t;p[6*8+col]=t;p[7*8+col]=t;continue;} // stage 4
v0=dctSqrt2*p[0*8+col]+2048>>12;v1=dctSqrt2*p[4*8+col]+2048>>12;v2=p[2*8+col];v3=p[6*8+col];v4=dctSqrt1d2*(p[1*8+col]-p[7*8+col])+2048>>12;v7=dctSqrt1d2*(p[1*8+col]+p[7*8+col])+2048>>12;v5=p[3*8+col];v6=p[5*8+col]; // stage 3
t=v0-v1+1>>1;v0=v0+v1+1>>1;v1=t;t=v2*dctSin6+v3*dctCos6+2048>>12;v2=v2*dctCos6-v3*dctSin6+2048>>12;v3=t;t=v4-v6+1>>1;v4=v4+v6+1>>1;v6=t;t=v7+v5+1>>1;v5=v7-v5+1>>1;v7=t; // stage 2
t=v0-v3+1>>1;v0=v0+v3+1>>1;v3=t;t=v1-v2+1>>1;v1=v1+v2+1>>1;v2=t;t=v4*dctSin3+v7*dctCos3+2048>>12;v4=v4*dctCos3-v7*dctSin3+2048>>12;v7=t;t=v5*dctSin1+v6*dctCos1+2048>>12;v5=v5*dctCos1-v6*dctSin1+2048>>12;v6=t; // stage 1
p[0*8+col]=v0+v7;p[7*8+col]=v0-v7;p[1*8+col]=v1+v6;p[6*8+col]=v1-v6;p[2*8+col]=v2+v5;p[5*8+col]=v2-v5;p[3*8+col]=v3+v4;p[4*8+col]=v3-v4;} // convert to 8-bit integers
for(i=0;i<64;++i){var sample=128+(p[i]+8>>4);dataOut[i]=sample<0?0:sample>0xFF?0xFF:sample;}}var i,j;for(var blockRow=0;blockRow<blocksPerColumn;blockRow++){var scanLine=blockRow<<3;for(i=0;i<8;i++){lines.push(new Uint8Array(samplesPerLine));}for(var blockCol=0;blockCol<blocksPerLine;blockCol++){quantizeAndInverse(component.blocks[blockRow][blockCol],r,R);var offset=0,sample=blockCol<<3;for(j=0;j<8;j++){var line=lines[scanLine+j];for(i=0;i<8;i++){line[sample+i]=r[offset++];}}}}return lines;}function clampTo8bit(a){return a<0?0:a>255?255:a;}constructor.prototype={load:function load(path){var xhr=new XMLHttpRequest();xhr.open("GET",path,true);xhr.responseType="arraybuffer";xhr.onload=function(){ // TODO catch parse error
var data=new Uint8Array(xhr.response||xhr.mozResponseArrayBuffer);this.parse(data);if(this.onload)this.onload();}.bind(this);xhr.send(null);},parse:function parse(data){var offset=0,length=data.length;function readUint16(){var value=data[offset]<<8|data[offset+1];offset+=2;return value;}function readDataBlock(){var length=readUint16();var array=data.subarray(offset,offset+length-2);offset+=array.length;return array;}function prepareComponents(frame){var maxH=0,maxV=0;var component,componentId;for(componentId in frame.components){if(frame.components.hasOwnProperty(componentId)){component=frame.components[componentId];if(maxH<component.h)maxH=component.h;if(maxV<component.v)maxV=component.v;}}var mcusPerLine=Math.ceil(frame.samplesPerLine/8/maxH);var mcusPerColumn=Math.ceil(frame.scanLines/8/maxV);for(componentId in frame.components){if(frame.components.hasOwnProperty(componentId)){component=frame.components[componentId];var blocksPerLine=Math.ceil(Math.ceil(frame.samplesPerLine/8)*component.h/maxH);var blocksPerColumn=Math.ceil(Math.ceil(frame.scanLines/8)*component.v/maxV);var blocksPerLineForMcu=mcusPerLine*component.h;var blocksPerColumnForMcu=mcusPerColumn*component.v;var blocks=[];for(var i=0;i<blocksPerColumnForMcu;i++){var row=[];for(var j=0;j<blocksPerLineForMcu;j++){row.push(new Int32Array(64));}blocks.push(row);}component.blocksPerLine=blocksPerLine;component.blocksPerColumn=blocksPerColumn;component.blocks=blocks;}}frame.maxH=maxH;frame.maxV=maxV;frame.mcusPerLine=mcusPerLine;frame.mcusPerColumn=mcusPerColumn;}var jfif=null;var adobe=null;var pixels=null;var frame,resetInterval;var quantizationTables=[],frames=[];var huffmanTablesAC=[],huffmanTablesDC=[];var fileMarker=readUint16();if(fileMarker!=0xFFD8){ // SOI (Start of Image)
throw "SOI not found";}fileMarker=readUint16();while(fileMarker!=0xFFD9){ // EOI (End of image)
var i,j,l;switch(fileMarker){case 0xFF00:break;case 0xFFE0: // APP0 (Application Specific)
case 0xFFE1: // APP1
case 0xFFE2: // APP2
case 0xFFE3: // APP3
case 0xFFE4: // APP4
case 0xFFE5: // APP5
case 0xFFE6: // APP6
case 0xFFE7: // APP7
case 0xFFE8: // APP8
case 0xFFE9: // APP9
case 0xFFEA: // APP10
case 0xFFEB: // APP11
case 0xFFEC: // APP12
case 0xFFED: // APP13
case 0xFFEE: // APP14
case 0xFFEF: // APP15
case 0xFFFE: // COM (Comment)
var appData=readDataBlock();if(fileMarker===0xFFE0){if(appData[0]===0x4A&&appData[1]===0x46&&appData[2]===0x49&&appData[3]===0x46&&appData[4]===0){ // 'JFIF\x00'
jfif={version:{major:appData[5],minor:appData[6]},densityUnits:appData[7],xDensity:appData[8]<<8|appData[9],yDensity:appData[10]<<8|appData[11],thumbWidth:appData[12],thumbHeight:appData[13],thumbData:appData.subarray(14,14+3*appData[12]*appData[13])};}} // TODO APP1 - Exif
if(fileMarker===0xFFEE){if(appData[0]===0x41&&appData[1]===0x64&&appData[2]===0x6F&&appData[3]===0x62&&appData[4]===0x65&&appData[5]===0){ // 'Adobe\x00'
adobe={version:appData[6],flags0:appData[7]<<8|appData[8],flags1:appData[9]<<8|appData[10],transformCode:appData[11]};}}break;case 0xFFDB: // DQT (Define Quantization Tables)
var quantizationTablesLength=readUint16();var quantizationTablesEnd=quantizationTablesLength+offset-2;while(offset<quantizationTablesEnd){var quantizationTableSpec=data[offset++];var tableData=new Int32Array(64);if(quantizationTableSpec>>4===0){ // 8 bit values
for(j=0;j<64;j++){var z=dctZigZag[j];tableData[z]=data[offset++];}}else if(quantizationTableSpec>>4===1){ //16 bit
for(j=0;j<64;j++){var z=dctZigZag[j];tableData[z]=readUint16();}}else throw "DQT: invalid table spec";quantizationTables[quantizationTableSpec&15]=tableData;}break;case 0xFFC0: // SOF0 (Start of Frame, Baseline DCT)
case 0xFFC1: // SOF1 (Start of Frame, Extended DCT)
case 0xFFC2: // SOF2 (Start of Frame, Progressive DCT)
readUint16(); // skip data length
frame={};frame.extended=fileMarker===0xFFC1;frame.progressive=fileMarker===0xFFC2;frame.precision=data[offset++];frame.scanLines=readUint16();frame.samplesPerLine=readUint16();frame.components={};frame.componentsOrder=[];var componentsCount=data[offset++],componentId;var maxH=0,maxV=0;for(i=0;i<componentsCount;i++){componentId=data[offset];var h=data[offset+1]>>4;var v=data[offset+1]&15;var qId=data[offset+2];frame.componentsOrder.push(componentId);frame.components[componentId]={h:h,v:v,quantizationIdx:qId};offset+=3;}prepareComponents(frame);frames.push(frame);break;case 0xFFC4: // DHT (Define Huffman Tables)
var huffmanLength=readUint16();for(i=2;i<huffmanLength;){var huffmanTableSpec=data[offset++];var codeLengths=new Uint8Array(16);var codeLengthSum=0;for(j=0;j<16;j++,offset++){codeLengthSum+=codeLengths[j]=data[offset];}var huffmanValues=new Uint8Array(codeLengthSum);for(j=0;j<codeLengthSum;j++,offset++){huffmanValues[j]=data[offset];}i+=17+codeLengthSum;(huffmanTableSpec>>4===0?huffmanTablesDC:huffmanTablesAC)[huffmanTableSpec&15]=buildHuffmanTable(codeLengths,huffmanValues);}break;case 0xFFDD: // DRI (Define Restart Interval)
readUint16(); // skip data length
resetInterval=readUint16();break;case 0xFFDA: // SOS (Start of Scan)
var scanLength=readUint16();var selectorsCount=data[offset++];var components=[],component;for(i=0;i<selectorsCount;i++){component=frame.components[data[offset++]];var tableSpec=data[offset++];component.huffmanTableDC=huffmanTablesDC[tableSpec>>4];component.huffmanTableAC=huffmanTablesAC[tableSpec&15];components.push(component);}var spectralStart=data[offset++];var spectralEnd=data[offset++];var successiveApproximation=data[offset++];var processed=decodeScan(data,offset,frame,components,resetInterval,spectralStart,spectralEnd,successiveApproximation>>4,successiveApproximation&15);offset+=processed;break;default:if(data[offset-3]==0xFF&&data[offset-2]>=0xC0&&data[offset-2]<=0xFE){ // could be incorrect encoding -- last 0xFF byte of the previous
// block was eaten by the encoder
offset-=3;break;}throw "unknown JPEG marker "+fileMarker.toString(16);}fileMarker=readUint16();}if(frames.length!=1)throw "only single frame JPEGs supported"; // set each frame's components quantization table
for(var i=0;i<frames.length;i++){var cp=frames[i].components;for(var j in cp){cp[j].quantizationTable=quantizationTables[cp[j].quantizationIdx];delete cp[j].quantizationIdx;}}this.width=frame.samplesPerLine;this.height=frame.scanLines;this.jfif=jfif;this.adobe=adobe;this.components=[];for(var i=0;i<frame.componentsOrder.length;i++){var component=frame.components[frame.componentsOrder[i]];this.components.push({lines:buildComponentData(frame,component),scaleX:component.h/frame.maxH,scaleY:component.v/frame.maxV});}},getData:function getData(width,height){var scaleX=this.width/width,scaleY=this.height/height;var component1,component2,component3,component4;var component1Line,component2Line,component3Line,component4Line;var x,y;var offset=0;var Y,Cb,Cr,K,C,M,Ye,R,G,B;var colorTransform;var dataLength=width*height*this.components.length;var data=new Uint8Array(dataLength);switch(this.components.length){case 1:component1=this.components[0];for(y=0;y<height;y++){component1Line=component1.lines[0|y*component1.scaleY*scaleY];for(x=0;x<width;x++){Y=component1Line[0|x*component1.scaleX*scaleX];data[offset++]=Y;}}break;case 2: // PDF might compress two component data in custom colorspace
component1=this.components[0];component2=this.components[1];for(y=0;y<height;y++){component1Line=component1.lines[0|y*component1.scaleY*scaleY];component2Line=component2.lines[0|y*component2.scaleY*scaleY];for(x=0;x<width;x++){Y=component1Line[0|x*component1.scaleX*scaleX];data[offset++]=Y;Y=component2Line[0|x*component2.scaleX*scaleX];data[offset++]=Y;}}break;case 3: // The default transform for three components is true
colorTransform=true; // The adobe transform marker overrides any previous setting
if(this.adobe&&this.adobe.transformCode)colorTransform=true;else if(typeof this.colorTransform!=='undefined')colorTransform=!!this.colorTransform;component1=this.components[0];component2=this.components[1];component3=this.components[2];for(y=0;y<height;y++){component1Line=component1.lines[0|y*component1.scaleY*scaleY];component2Line=component2.lines[0|y*component2.scaleY*scaleY];component3Line=component3.lines[0|y*component3.scaleY*scaleY];for(x=0;x<width;x++){if(!colorTransform){R=component1Line[0|x*component1.scaleX*scaleX];G=component2Line[0|x*component2.scaleX*scaleX];B=component3Line[0|x*component3.scaleX*scaleX];}else {Y=component1Line[0|x*component1.scaleX*scaleX];Cb=component2Line[0|x*component2.scaleX*scaleX];Cr=component3Line[0|x*component3.scaleX*scaleX];R=clampTo8bit(Y+1.402*(Cr-128));G=clampTo8bit(Y-0.3441363*(Cb-128)-0.71413636*(Cr-128));B=clampTo8bit(Y+1.772*(Cb-128));}data[offset++]=R;data[offset++]=G;data[offset++]=B;}}break;case 4:if(!this.adobe)throw 'Unsupported color mode (4 components)'; // The default transform for four components is false
colorTransform=false; // The adobe transform marker overrides any previous setting
if(this.adobe&&this.adobe.transformCode)colorTransform=true;else if(typeof this.colorTransform!=='undefined')colorTransform=!!this.colorTransform;component1=this.components[0];component2=this.components[1];component3=this.components[2];component4=this.components[3];for(y=0;y<height;y++){component1Line=component1.lines[0|y*component1.scaleY*scaleY];component2Line=component2.lines[0|y*component2.scaleY*scaleY];component3Line=component3.lines[0|y*component3.scaleY*scaleY];component4Line=component4.lines[0|y*component4.scaleY*scaleY];for(x=0;x<width;x++){if(!colorTransform){C=component1Line[0|x*component1.scaleX*scaleX];M=component2Line[0|x*component2.scaleX*scaleX];Ye=component3Line[0|x*component3.scaleX*scaleX];K=component4Line[0|x*component4.scaleX*scaleX];}else {Y=component1Line[0|x*component1.scaleX*scaleX];Cb=component2Line[0|x*component2.scaleX*scaleX];Cr=component3Line[0|x*component3.scaleX*scaleX];K=component4Line[0|x*component4.scaleX*scaleX];C=255-clampTo8bit(Y+1.402*(Cr-128));M=255-clampTo8bit(Y-0.3441363*(Cb-128)-0.71413636*(Cr-128));Ye=255-clampTo8bit(Y+1.772*(Cb-128));}data[offset++]=255-C;data[offset++]=255-M;data[offset++]=255-Ye;data[offset++]=255-K;}}break;default:throw 'Unsupported color mode';}return data;},copyToImageData:function copyToImageData(imageData){var width=imageData.width,height=imageData.height;var imageDataArray=imageData.data;var data=this.getData(width,height);var i=0,j=0,x,y;var Y,K,C,M,R,G,B;switch(this.components.length){case 1:for(y=0;y<height;y++){for(x=0;x<width;x++){Y=data[i++];imageDataArray[j++]=Y;imageDataArray[j++]=Y;imageDataArray[j++]=Y;imageDataArray[j++]=255;}}break;case 3:for(y=0;y<height;y++){for(x=0;x<width;x++){R=data[i++];G=data[i++];B=data[i++];imageDataArray[j++]=R;imageDataArray[j++]=G;imageDataArray[j++]=B;imageDataArray[j++]=255;}}break;case 4:for(y=0;y<height;y++){for(x=0;x<width;x++){C=data[i++];M=data[i++];Y=data[i++];K=data[i++];R=255-clampTo8bit(C*(1-K/255)+K);G=255-clampTo8bit(M*(1-K/255)+K);B=255-clampTo8bit(Y*(1-K/255)+K);imageDataArray[j++]=R;imageDataArray[j++]=G;imageDataArray[j++]=B;imageDataArray[j++]=255;}}break;default:throw 'Unsupported color mode';}}};return constructor;}();module.exports=decode;function decode(jpegData){var arr=new Uint8Array(jpegData);var decoder=new JpegImage();decoder.parse(arr);var image={width:decoder.width,height:decoder.height,data:new Buffer(decoder.width*decoder.height*4)};decoder.copyToImageData(image);return image;}}).call(this,require("buffer").Buffer);},{"buffer":14}],38:[function(require,module,exports){(function(Buffer){ /*
  Copyright (c) 2008, Adobe Systems Incorporated
  All rights reserved.

  Redistribution and use in source and binary forms, with or without 
  modification, are permitted provided that the following conditions are
  met:

  * Redistributions of source code must retain the above copyright notice, 
    this list of conditions and the following disclaimer.
  
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the 
    documentation and/or other materials provided with the distribution.
  
  * Neither the name of Adobe Systems Incorporated nor the names of its 
    contributors may be used to endorse or promote products derived from 
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR 
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/ /*
JPEG encoder ported to JavaScript and optimized by Andreas Ritter, www.bytestrom.eu, 11/2009

Basic GUI blocking jpeg encoder
*/var btoa=btoa||function(buf){return new Buffer(buf).toString('base64');};function JPEGEncoder(quality){var self=this;var fround=Math.round;var ffloor=Math.floor;var YTable=new Array(64);var UVTable=new Array(64);var fdtbl_Y=new Array(64);var fdtbl_UV=new Array(64);var YDC_HT;var UVDC_HT;var YAC_HT;var UVAC_HT;var bitcode=new Array(65535);var category=new Array(65535);var outputfDCTQuant=new Array(64);var DU=new Array(64);var byteout=[];var bytenew=0;var bytepos=7;var YDU=new Array(64);var UDU=new Array(64);var VDU=new Array(64);var clt=new Array(256);var RGB_YUV_TABLE=new Array(2048);var currentQuality;var ZigZag=[0,1,5,6,14,15,27,28,2,4,7,13,16,26,29,42,3,8,12,17,25,30,41,43,9,11,18,24,31,40,44,53,10,19,23,32,39,45,52,54,20,22,33,38,46,51,55,60,21,34,37,47,50,56,59,61,35,36,48,49,57,58,62,63];var std_dc_luminance_nrcodes=[0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0];var std_dc_luminance_values=[0,1,2,3,4,5,6,7,8,9,10,11];var std_ac_luminance_nrcodes=[0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];var std_ac_luminance_values=[0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa];var std_dc_chrominance_nrcodes=[0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];var std_dc_chrominance_values=[0,1,2,3,4,5,6,7,8,9,10,11];var std_ac_chrominance_nrcodes=[0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];var std_ac_chrominance_values=[0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71,0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0,0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26,0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa];function initQuantTables(sf){var YQT=[16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99];for(var i=0;i<64;i++){var t=ffloor((YQT[i]*sf+50)/100);if(t<1){t=1;}else if(t>255){t=255;}YTable[ZigZag[i]]=t;}var UVQT=[17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99];for(var j=0;j<64;j++){var u=ffloor((UVQT[j]*sf+50)/100);if(u<1){u=1;}else if(u>255){u=255;}UVTable[ZigZag[j]]=u;}var aasf=[1.0,1.387039845,1.306562965,1.175875602,1.0,0.785694958,0.541196100,0.275899379];var k=0;for(var row=0;row<8;row++){for(var col=0;col<8;col++){fdtbl_Y[k]=1.0/(YTable[ZigZag[k]]*aasf[row]*aasf[col]*8.0);fdtbl_UV[k]=1.0/(UVTable[ZigZag[k]]*aasf[row]*aasf[col]*8.0);k++;}}}function computeHuffmanTbl(nrcodes,std_table){var codevalue=0;var pos_in_table=0;var HT=new Array();for(var k=1;k<=16;k++){for(var j=1;j<=nrcodes[k];j++){HT[std_table[pos_in_table]]=[];HT[std_table[pos_in_table]][0]=codevalue;HT[std_table[pos_in_table]][1]=k;pos_in_table++;codevalue++;}codevalue*=2;}return HT;}function initHuffmanTbl(){YDC_HT=computeHuffmanTbl(std_dc_luminance_nrcodes,std_dc_luminance_values);UVDC_HT=computeHuffmanTbl(std_dc_chrominance_nrcodes,std_dc_chrominance_values);YAC_HT=computeHuffmanTbl(std_ac_luminance_nrcodes,std_ac_luminance_values);UVAC_HT=computeHuffmanTbl(std_ac_chrominance_nrcodes,std_ac_chrominance_values);}function initCategoryNumber(){var nrlower=1;var nrupper=2;for(var cat=1;cat<=15;cat++){ //Positive numbers
for(var nr=nrlower;nr<nrupper;nr++){category[32767+nr]=cat;bitcode[32767+nr]=[];bitcode[32767+nr][1]=cat;bitcode[32767+nr][0]=nr;} //Negative numbers
for(var nrneg=-(nrupper-1);nrneg<=-nrlower;nrneg++){category[32767+nrneg]=cat;bitcode[32767+nrneg]=[];bitcode[32767+nrneg][1]=cat;bitcode[32767+nrneg][0]=nrupper-1+nrneg;}nrlower<<=1;nrupper<<=1;}}function initRGBYUVTable(){for(var i=0;i<256;i++){RGB_YUV_TABLE[i]=19595*i;RGB_YUV_TABLE[i+256>>0]=38470*i;RGB_YUV_TABLE[i+512>>0]=7471*i+0x8000;RGB_YUV_TABLE[i+768>>0]=-11059*i;RGB_YUV_TABLE[i+1024>>0]=-21709*i;RGB_YUV_TABLE[i+1280>>0]=32768*i+0x807FFF;RGB_YUV_TABLE[i+1536>>0]=-27439*i;RGB_YUV_TABLE[i+1792>>0]=-5329*i;}} // IO functions
function writeBits(bs){var value=bs[0];var posval=bs[1]-1;while(posval>=0){if(value&1<<posval){bytenew|=1<<bytepos;}posval--;bytepos--;if(bytepos<0){if(bytenew==0xFF){writeByte(0xFF);writeByte(0);}else {writeByte(bytenew);}bytepos=7;bytenew=0;}}}function writeByte(value){ //byteout.push(clt[value]); // write char directly instead of converting later
byteout.push(value);}function writeWord(value){writeByte(value>>8&0xFF);writeByte(value&0xFF);} // DCT & quantization core
function fDCTQuant(data,fdtbl){var d0,d1,d2,d3,d4,d5,d6,d7; /* Pass 1: process rows. */var dataOff=0;var i;var I8=8;var I64=64;for(i=0;i<I8;++i){d0=data[dataOff];d1=data[dataOff+1];d2=data[dataOff+2];d3=data[dataOff+3];d4=data[dataOff+4];d5=data[dataOff+5];d6=data[dataOff+6];d7=data[dataOff+7];var tmp0=d0+d7;var tmp7=d0-d7;var tmp1=d1+d6;var tmp6=d1-d6;var tmp2=d2+d5;var tmp5=d2-d5;var tmp3=d3+d4;var tmp4=d3-d4; /* Even part */var tmp10=tmp0+tmp3; /* phase 2 */var tmp13=tmp0-tmp3;var tmp11=tmp1+tmp2;var tmp12=tmp1-tmp2;data[dataOff]=tmp10+tmp11; /* phase 3 */data[dataOff+4]=tmp10-tmp11;var z1=(tmp12+tmp13)*0.707106781; /* c4 */data[dataOff+2]=tmp13+z1; /* phase 5 */data[dataOff+6]=tmp13-z1; /* Odd part */tmp10=tmp4+tmp5; /* phase 2 */tmp11=tmp5+tmp6;tmp12=tmp6+tmp7; /* The rotator is modified from fig 4-8 to avoid extra negations. */var z5=(tmp10-tmp12)*0.382683433; /* c6 */var z2=0.541196100*tmp10+z5; /* c2-c6 */var z4=1.306562965*tmp12+z5; /* c2+c6 */var z3=tmp11*0.707106781; /* c4 */var z11=tmp7+z3; /* phase 5 */var z13=tmp7-z3;data[dataOff+5]=z13+z2; /* phase 6 */data[dataOff+3]=z13-z2;data[dataOff+1]=z11+z4;data[dataOff+7]=z11-z4;dataOff+=8; /* advance pointer to next row */} /* Pass 2: process columns. */dataOff=0;for(i=0;i<I8;++i){d0=data[dataOff];d1=data[dataOff+8];d2=data[dataOff+16];d3=data[dataOff+24];d4=data[dataOff+32];d5=data[dataOff+40];d6=data[dataOff+48];d7=data[dataOff+56];var tmp0p2=d0+d7;var tmp7p2=d0-d7;var tmp1p2=d1+d6;var tmp6p2=d1-d6;var tmp2p2=d2+d5;var tmp5p2=d2-d5;var tmp3p2=d3+d4;var tmp4p2=d3-d4; /* Even part */var tmp10p2=tmp0p2+tmp3p2; /* phase 2 */var tmp13p2=tmp0p2-tmp3p2;var tmp11p2=tmp1p2+tmp2p2;var tmp12p2=tmp1p2-tmp2p2;data[dataOff]=tmp10p2+tmp11p2; /* phase 3 */data[dataOff+32]=tmp10p2-tmp11p2;var z1p2=(tmp12p2+tmp13p2)*0.707106781; /* c4 */data[dataOff+16]=tmp13p2+z1p2; /* phase 5 */data[dataOff+48]=tmp13p2-z1p2; /* Odd part */tmp10p2=tmp4p2+tmp5p2; /* phase 2 */tmp11p2=tmp5p2+tmp6p2;tmp12p2=tmp6p2+tmp7p2; /* The rotator is modified from fig 4-8 to avoid extra negations. */var z5p2=(tmp10p2-tmp12p2)*0.382683433; /* c6 */var z2p2=0.541196100*tmp10p2+z5p2; /* c2-c6 */var z4p2=1.306562965*tmp12p2+z5p2; /* c2+c6 */var z3p2=tmp11p2*0.707106781; /* c4 */var z11p2=tmp7p2+z3p2; /* phase 5 */var z13p2=tmp7p2-z3p2;data[dataOff+40]=z13p2+z2p2; /* phase 6 */data[dataOff+24]=z13p2-z2p2;data[dataOff+8]=z11p2+z4p2;data[dataOff+56]=z11p2-z4p2;dataOff++; /* advance pointer to next column */} // Quantize/descale the coefficients
var fDCTQuant;for(i=0;i<I64;++i){ // Apply the quantization and scaling factor & Round to nearest integer
fDCTQuant=data[i]*fdtbl[i];outputfDCTQuant[i]=fDCTQuant>0.0?fDCTQuant+0.5|0:fDCTQuant-0.5|0; //outputfDCTQuant[i] = fround(fDCTQuant);
}return outputfDCTQuant;}function writeAPP0(){writeWord(0xFFE0); // marker
writeWord(16); // length
writeByte(0x4A); // J
writeByte(0x46); // F
writeByte(0x49); // I
writeByte(0x46); // F
writeByte(0); // = "JFIF",'\0'
writeByte(1); // versionhi
writeByte(1); // versionlo
writeByte(0); // xyunits
writeWord(1); // xdensity
writeWord(1); // ydensity
writeByte(0); // thumbnwidth
writeByte(0); // thumbnheight
}function writeSOF0(width,height){writeWord(0xFFC0); // marker
writeWord(17); // length, truecolor YUV JPG
writeByte(8); // precision
writeWord(height);writeWord(width);writeByte(3); // nrofcomponents
writeByte(1); // IdY
writeByte(0x11); // HVY
writeByte(0); // QTY
writeByte(2); // IdU
writeByte(0x11); // HVU
writeByte(1); // QTU
writeByte(3); // IdV
writeByte(0x11); // HVV
writeByte(1); // QTV
}function writeDQT(){writeWord(0xFFDB); // marker
writeWord(132); // length
writeByte(0);for(var i=0;i<64;i++){writeByte(YTable[i]);}writeByte(1);for(var j=0;j<64;j++){writeByte(UVTable[j]);}}function writeDHT(){writeWord(0xFFC4); // marker
writeWord(0x01A2); // length
writeByte(0); // HTYDCinfo
for(var i=0;i<16;i++){writeByte(std_dc_luminance_nrcodes[i+1]);}for(var j=0;j<=11;j++){writeByte(std_dc_luminance_values[j]);}writeByte(0x10); // HTYACinfo
for(var k=0;k<16;k++){writeByte(std_ac_luminance_nrcodes[k+1]);}for(var l=0;l<=161;l++){writeByte(std_ac_luminance_values[l]);}writeByte(1); // HTUDCinfo
for(var m=0;m<16;m++){writeByte(std_dc_chrominance_nrcodes[m+1]);}for(var n=0;n<=11;n++){writeByte(std_dc_chrominance_values[n]);}writeByte(0x11); // HTUACinfo
for(var o=0;o<16;o++){writeByte(std_ac_chrominance_nrcodes[o+1]);}for(var p=0;p<=161;p++){writeByte(std_ac_chrominance_values[p]);}}function writeSOS(){writeWord(0xFFDA); // marker
writeWord(12); // length
writeByte(3); // nrofcomponents
writeByte(1); // IdY
writeByte(0); // HTY
writeByte(2); // IdU
writeByte(0x11); // HTU
writeByte(3); // IdV
writeByte(0x11); // HTV
writeByte(0); // Ss
writeByte(0x3f); // Se
writeByte(0); // Bf
}function processDU(CDU,fdtbl,DC,HTDC,HTAC){var EOB=HTAC[0x00];var M16zeroes=HTAC[0xF0];var pos;var I16=16;var I63=63;var I64=64;var DU_DCT=fDCTQuant(CDU,fdtbl); //ZigZag reorder
for(var j=0;j<I64;++j){DU[ZigZag[j]]=DU_DCT[j];}var Diff=DU[0]-DC;DC=DU[0]; //Encode DC
if(Diff==0){writeBits(HTDC[0]); // Diff might be 0
}else {pos=32767+Diff;writeBits(HTDC[category[pos]]);writeBits(bitcode[pos]);} //Encode ACs
var end0pos=63; // was const... which is crazy
for(;end0pos>0&&DU[end0pos]==0;end0pos--){}; //end0pos = first element in reverse order !=0
if(end0pos==0){writeBits(EOB);return DC;}var i=1;var lng;while(i<=end0pos){var startpos=i;for(;DU[i]==0&&i<=end0pos;++i){}var nrzeroes=i-startpos;if(nrzeroes>=I16){lng=nrzeroes>>4;for(var nrmarker=1;nrmarker<=lng;++nrmarker){writeBits(M16zeroes);}nrzeroes=nrzeroes&0xF;}pos=32767+DU[i];writeBits(HTAC[(nrzeroes<<4)+category[pos]]);writeBits(bitcode[pos]);i++;}if(end0pos!=I63){writeBits(EOB);}return DC;}function initCharLookupTable(){var sfcc=String.fromCharCode;for(var i=0;i<256;i++){ ///// ACHTUNG // 255
clt[i]=sfcc(i);}}this.encode=function(image,quality) // image data object
{var time_start=new Date().getTime();if(quality)setQuality(quality); // Initialize bit writer
byteout=new Array();bytenew=0;bytepos=7; // Add JPEG headers
writeWord(0xFFD8); // SOI
writeAPP0();writeDQT();writeSOF0(image.width,image.height);writeDHT();writeSOS(); // Encode 8x8 macroblocks
var DCY=0;var DCU=0;var DCV=0;bytenew=0;bytepos=7;this.encode.displayName="_encode_";var imageData=image.data;var width=image.width;var height=image.height;var quadWidth=width*4;var tripleWidth=width*3;var x,y=0;var r,g,b;var start,p,col,row,pos;while(y<height){x=0;while(x<quadWidth){start=quadWidth*y+x;p=start;col=-1;row=0;for(pos=0;pos<64;pos++){row=pos>>3; // /8
col=(pos&7)*4; // %8
p=start+row*quadWidth+col;if(y+row>=height){ // padding bottom
p-=quadWidth*(y+1+row-height);}if(x+col>=quadWidth){ // padding right	
p-=x+col-quadWidth+4;}r=imageData[p++];g=imageData[p++];b=imageData[p++]; /* // calculate YUV values dynamically
					YDU[pos]=((( 0.29900)*r+( 0.58700)*g+( 0.11400)*b))-128; //-0x80
					UDU[pos]=(((-0.16874)*r+(-0.33126)*g+( 0.50000)*b));
					VDU[pos]=((( 0.50000)*r+(-0.41869)*g+(-0.08131)*b));
					*/ // use lookup table (slightly faster)
YDU[pos]=(RGB_YUV_TABLE[r]+RGB_YUV_TABLE[g+256>>0]+RGB_YUV_TABLE[b+512>>0]>>16)-128;UDU[pos]=(RGB_YUV_TABLE[r+768>>0]+RGB_YUV_TABLE[g+1024>>0]+RGB_YUV_TABLE[b+1280>>0]>>16)-128;VDU[pos]=(RGB_YUV_TABLE[r+1280>>0]+RGB_YUV_TABLE[g+1536>>0]+RGB_YUV_TABLE[b+1792>>0]>>16)-128;}DCY=processDU(YDU,fdtbl_Y,DCY,YDC_HT,YAC_HT);DCU=processDU(UDU,fdtbl_UV,DCU,UVDC_HT,UVAC_HT);DCV=processDU(VDU,fdtbl_UV,DCV,UVDC_HT,UVAC_HT);x+=32;}y+=8;} ////////////////////////////////////////////////////////////////
// Do the bit alignment of the EOI marker
if(bytepos>=0){var fillbits=[];fillbits[1]=bytepos+1;fillbits[0]=(1<<bytepos+1)-1;writeBits(fillbits);}writeWord(0xFFD9); //EOI
//return new Uint8Array(byteout);
return new Buffer(byteout);var jpegDataUri='data:image/jpeg;base64,'+btoa(byteout.join(''));byteout=[]; // benchmarking
var duration=new Date().getTime()-time_start; //console.log('Encoding time: '+ duration + 'ms');
//
return jpegDataUri;};function setQuality(quality){if(quality<=0){quality=1;}if(quality>100){quality=100;}if(currentQuality==quality)return; // don't recalc if unchanged
var sf=0;if(quality<50){sf=Math.floor(5000/quality);}else {sf=Math.floor(200-quality*2);}initQuantTables(sf);currentQuality=quality; //console.log('Quality set to: '+quality +'%');
}function init(){var time_start=new Date().getTime();if(!quality)quality=50; // Create tables
initCharLookupTable();initHuffmanTbl();initCategoryNumber();initRGBYUVTable();setQuality(quality);var duration=new Date().getTime()-time_start; //console.log('Initialization '+ duration + 'ms');
}init();};module.exports=encode;function encode(imgData,qu){if(typeof qu==='undefined')qu=50;var encoder=new JPEGEncoder(qu);var data=encoder.encode(imgData,qu);return {data:data,width:imgData.width,height:imgData.height};} // helper function to get the imageData of an existing image on the current page.
function getImageDataFromImage(idOrElement){var theImg=typeof idOrElement=='string'?document.getElementById(idOrElement):idOrElement;var cvs=document.createElement('canvas');cvs.width=theImg.width;cvs.height=theImg.height;var ctx=cvs.getContext("2d");ctx.drawImage(theImg,0,0);return ctx.getImageData(0,0,cvs.width,cvs.height);}}).call(this,require("buffer").Buffer);},{"buffer":14}],39:[function(require,module,exports){(function(Buffer){var xhr=require('xhr');var noop=function noop(){};var parseASCII=require('parse-bmfont-ascii');var parseXML=require('parse-bmfont-xml');var readBinary=require('parse-bmfont-binary');var isBinaryFormat=require('./lib/is-binary');var xtend=require('xtend');var xml2=function hasXML2(){return window.XMLHttpRequest&&"withCredentials" in new XMLHttpRequest();}();module.exports=function(opt,cb){cb=typeof cb==='function'?cb:noop;if(typeof opt==='string')opt={uri:opt};else if(!opt)opt={};var expectBinary=opt.binary;if(expectBinary)opt=getBinaryOpts(opt);xhr(opt,function(err,res,body){if(err)return cb(err);if(!/^2/.test(res.statusCode))return cb(new Error('http status code: '+res.statusCode));if(!body)return cb(new Error('no body result'));var binary=false; //if the response type is an array buffer,
//we need to convert it into a regular Buffer object
if(isArrayBuffer(body)){var array=new Uint8Array(body);body=new Buffer(array,'binary');} //now check the string/Buffer response
//and see if it has a binary BMF header
if(isBinaryFormat(body)){binary=true; //if we have a string, turn it into a Buffer
if(typeof body==='string')body=new Buffer(body,'binary');} //we are not parsing a binary format, just ASCII/XML/etc
if(!binary){ //might still be a buffer if responseType is 'arraybuffer'
if(Buffer.isBuffer(body))body=body.toString(opt.encoding);body=body.trim();}var result;try{var type=res.headers['content-type'];if(binary)result=readBinary(body);else if(/json/.test(type)||body.charAt(0)==='{')result=JSON.parse(body);else if(/xml/.test(type)||body.charAt(0)==='<')result=parseXML(body);else result=parseASCII(body);}catch(e){cb(new Error('error parsing font '+e.message));cb=noop;}cb(null,result);});};function isArrayBuffer(arr){var str=Object.prototype.toString;return str.call(arr)==='[object ArrayBuffer]';}function getBinaryOpts(opt){ //IE10+ and other modern browsers support array buffers
if(xml2)return xtend(opt,{responseType:'arraybuffer'});if(typeof window.XMLHttpRequest==='undefined')throw new Error('your browser does not support XHR loading'); //IE9 and XML1 browsers could still use an override
var req=new window.XMLHttpRequest();req.overrideMimeType('text/plain; charset=x-user-defined');return xtend({xhr:req},opt);}}).call(this,require("buffer").Buffer);},{"./lib/is-binary":40,"buffer":14,"parse-bmfont-ascii":55,"parse-bmfont-binary":56,"parse-bmfont-xml":57,"xhr":105,"xtend":107}],40:[function(require,module,exports){(function(Buffer){var equal=require('buffer-equal');var HEADER=new Buffer([66,77,70,3]);module.exports=function(buf){if(typeof buf==='string')return buf.substring(0,3)==='BMF';return buf.length>4&&equal(buf.slice(0,4),HEADER);};}).call(this,require("buffer").Buffer);},{"buffer":14,"buffer-equal":13}],41:[function(require,module,exports){(function(process){var path=require('path');var fs=require('fs');function Mime(){ // Map of extension -> mime type
this.types=Object.create(null); // Map of mime type -> extension
this.extensions=Object.create(null);} /**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * @param map (Object) type definitions
 */Mime.prototype.define=function(map){for(var type in map){var exts=map[type];for(var i=0;i<exts.length;i++){if(process.env.DEBUG_MIME&&this.types[exts]){console.warn(this._loading.replace(/.*\//,''),'changes "'+exts[i]+'" extension type from '+this.types[exts]+' to '+type);}this.types[exts[i]]=type;} // Default extension is the first one we encounter
if(!this.extensions[type]){this.extensions[type]=exts[0];}}}; /**
 * Load an Apache2-style ".types" file
 *
 * This may be called multiple times (it's expected).  Where files declare
 * overlapping types/extensions, the last file wins.
 *
 * @param file (String) path of file to load.
 */Mime.prototype.load=function(file){this._loading=file; // Read file and split into lines
var map={},content=fs.readFileSync(file,'ascii'),lines=content.split(/[\r\n]+/);lines.forEach(function(line){ // Clean up whitespace/comments, and split into fields
var fields=line.replace(/\s*#.*|^\s*|\s*$/g,'').split(/\s+/);map[fields.shift()]=fields;});this.define(map);this._loading=null;}; /**
 * Lookup a mime type based on extension
 */Mime.prototype.lookup=function(path,fallback){var ext=path.replace(/.*[\.\/\\]/,'').toLowerCase();return this.types[ext]||fallback||this.default_type;}; /**
 * Return file extension associated with a mime type
 */Mime.prototype.extension=function(mimeType){var type=mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();return this.extensions[type];}; // Default instance
var mime=new Mime(); // Define built-in types
mime.define(require('./types.json')); // Default type
mime.default_type=mime.lookup('bin'); //
// Additional API specific to the default instance
//
mime.Mime=Mime; /**
 * Lookup a charset based on mime type.
 */mime.charsets={lookup:function lookup(mimeType,fallback){ // Assume text types are utf8
return (/^text\//.test(mimeType)?'UTF-8':fallback);}};module.exports=mime;}).call(this,require('_process'));},{"./types.json":42,"_process":12,"fs":11,"path":60}],42:[function(require,module,exports){module.exports={"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomsvc+xml":["atomsvc"],"application/ccxml+xml":["ccxml"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mdp"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma"],"application/emma+xml":["emma"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/font-tdpfr":["pfr"],"application/font-woff":["woff"],"application/font-woff2":["woff2"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/java-archive":["jar"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/patch-ops-error+xml":["xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/prs.cww":["cww"],"application/pskc+xml":["pskcxml"],"application/rdf+xml":["rdf"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/vnd.3gpp.pic-bw-large":["plb"],"application/vnd.3gpp.pic-bw-small":["psb"],"application/vnd.3gpp.pic-bw-var":["pvb"],"application/vnd.3gpp2.tcap":["tcap"],"application/vnd.3m.post-it-notes":["pwn"],"application/vnd.accpac.simply.aso":["aso"],"application/vnd.accpac.simply.imp":["imp"],"application/vnd.acucobol":["acu"],"application/vnd.acucorp":["atc","acutc"],"application/vnd.adobe.air-application-installer-package+zip":["air"],"application/vnd.adobe.formscentral.fcdt":["fcdt"],"application/vnd.adobe.fxp":["fxp","fxpl"],"application/vnd.adobe.xdp+xml":["xdp"],"application/vnd.adobe.xfdf":["xfdf"],"application/vnd.ahead.space":["ahead"],"application/vnd.airzip.filesecure.azf":["azf"],"application/vnd.airzip.filesecure.azs":["azs"],"application/vnd.amazon.ebook":["azw"],"application/vnd.americandynamics.acc":["acc"],"application/vnd.amiga.ami":["ami"],"application/vnd.android.package-archive":["apk"],"application/vnd.anser-web-certificate-issue-initiation":["cii"],"application/vnd.anser-web-funds-transfer-initiation":["fti"],"application/vnd.antix.game-component":["atx"],"application/vnd.apple.installer+xml":["mpkg"],"application/vnd.apple.mpegurl":["m3u8"],"application/vnd.aristanetworks.swi":["swi"],"application/vnd.astraea-software.iota":["iota"],"application/vnd.audiograph":["aep"],"application/vnd.blueice.multipass":["mpm"],"application/vnd.bmi":["bmi"],"application/vnd.businessobjects":["rep"],"application/vnd.chemdraw+xml":["cdxml"],"application/vnd.chipnuts.karaoke-mmd":["mmd"],"application/vnd.cinderella":["cdy"],"application/vnd.claymore":["cla"],"application/vnd.cloanto.rp9":["rp9"],"application/vnd.clonk.c4group":["c4g","c4d","c4f","c4p","c4u"],"application/vnd.cluetrust.cartomobile-config":["c11amc"],"application/vnd.cluetrust.cartomobile-config-pkg":["c11amz"],"application/vnd.commonspace":["csp"],"application/vnd.contact.cmsg":["cdbcmsg"],"application/vnd.cosmocaller":["cmc"],"application/vnd.crick.clicker":["clkx"],"application/vnd.crick.clicker.keyboard":["clkk"],"application/vnd.crick.clicker.palette":["clkp"],"application/vnd.crick.clicker.template":["clkt"],"application/vnd.crick.clicker.wordbank":["clkw"],"application/vnd.criticaltools.wbs+xml":["wbs"],"application/vnd.ctc-posml":["pml"],"application/vnd.cups-ppd":["ppd"],"application/vnd.curl.car":["car"],"application/vnd.curl.pcurl":["pcurl"],"application/vnd.dart":["dart"],"application/vnd.data-vision.rdz":["rdz"],"application/vnd.dece.data":["uvf","uvvf","uvd","uvvd"],"application/vnd.dece.ttml+xml":["uvt","uvvt"],"application/vnd.dece.unspecified":["uvx","uvvx"],"application/vnd.dece.zip":["uvz","uvvz"],"application/vnd.denovo.fcselayout-link":["fe_launch"],"application/vnd.dna":["dna"],"application/vnd.dolby.mlp":["mlp"],"application/vnd.dpgraph":["dpg"],"application/vnd.dreamfactory":["dfac"],"application/vnd.ds-keypoint":["kpxx"],"application/vnd.dvb.ait":["ait"],"application/vnd.dvb.service":["svc"],"application/vnd.dynageo":["geo"],"application/vnd.ecowin.chart":["mag"],"application/vnd.enliven":["nml"],"application/vnd.epson.esf":["esf"],"application/vnd.epson.msf":["msf"],"application/vnd.epson.quickanime":["qam"],"application/vnd.epson.salt":["slt"],"application/vnd.epson.ssf":["ssf"],"application/vnd.eszigno3+xml":["es3","et3"],"application/vnd.ezpix-album":["ez2"],"application/vnd.ezpix-package":["ez3"],"application/vnd.fdf":["fdf"],"application/vnd.fdsn.mseed":["mseed"],"application/vnd.fdsn.seed":["seed","dataless"],"application/vnd.flographit":["gph"],"application/vnd.fluxtime.clip":["ftc"],"application/vnd.framemaker":["fm","frame","maker","book"],"application/vnd.frogans.fnc":["fnc"],"application/vnd.frogans.ltf":["ltf"],"application/vnd.fsc.weblaunch":["fsc"],"application/vnd.fujitsu.oasys":["oas"],"application/vnd.fujitsu.oasys2":["oa2"],"application/vnd.fujitsu.oasys3":["oa3"],"application/vnd.fujitsu.oasysgp":["fg5"],"application/vnd.fujitsu.oasysprs":["bh2"],"application/vnd.fujixerox.ddd":["ddd"],"application/vnd.fujixerox.docuworks":["xdw"],"application/vnd.fujixerox.docuworks.binder":["xbd"],"application/vnd.fuzzysheet":["fzs"],"application/vnd.genomatix.tuxedo":["txd"],"application/vnd.geogebra.file":["ggb"],"application/vnd.geogebra.tool":["ggt"],"application/vnd.geometry-explorer":["gex","gre"],"application/vnd.geonext":["gxt"],"application/vnd.geoplan":["g2w"],"application/vnd.geospace":["g3w"],"application/vnd.gmx":["gmx"],"application/vnd.google-earth.kml+xml":["kml"],"application/vnd.google-earth.kmz":["kmz"],"application/vnd.grafeq":["gqf","gqs"],"application/vnd.groove-account":["gac"],"application/vnd.groove-help":["ghf"],"application/vnd.groove-identity-message":["gim"],"application/vnd.groove-injector":["grv"],"application/vnd.groove-tool-message":["gtm"],"application/vnd.groove-tool-template":["tpl"],"application/vnd.groove-vcard":["vcg"],"application/vnd.hal+xml":["hal"],"application/vnd.handheld-entertainment+xml":["zmm"],"application/vnd.hbci":["hbci"],"application/vnd.hhe.lesson-player":["les"],"application/vnd.hp-hpgl":["hpgl"],"application/vnd.hp-hpid":["hpid"],"application/vnd.hp-hps":["hps"],"application/vnd.hp-jlyt":["jlt"],"application/vnd.hp-pcl":["pcl"],"application/vnd.hp-pclxl":["pclxl"],"application/vnd.ibm.minipay":["mpy"],"application/vnd.ibm.modcap":["afp","listafp","list3820"],"application/vnd.ibm.rights-management":["irm"],"application/vnd.ibm.secure-container":["sc"],"application/vnd.iccprofile":["icc","icm"],"application/vnd.igloader":["igl"],"application/vnd.immervision-ivp":["ivp"],"application/vnd.immervision-ivu":["ivu"],"application/vnd.insors.igm":["igm"],"application/vnd.intercon.formnet":["xpw","xpx"],"application/vnd.intergeo":["i2g"],"application/vnd.intu.qbo":["qbo"],"application/vnd.intu.qfx":["qfx"],"application/vnd.ipunplugged.rcprofile":["rcprofile"],"application/vnd.irepository.package+xml":["irp"],"application/vnd.is-xpr":["xpr"],"application/vnd.isac.fcs":["fcs"],"application/vnd.jam":["jam"],"application/vnd.jcp.javame.midlet-rms":["rms"],"application/vnd.jisp":["jisp"],"application/vnd.joost.joda-archive":["joda"],"application/vnd.kahootz":["ktz","ktr"],"application/vnd.kde.karbon":["karbon"],"application/vnd.kde.kchart":["chrt"],"application/vnd.kde.kformula":["kfo"],"application/vnd.kde.kivio":["flw"],"application/vnd.kde.kontour":["kon"],"application/vnd.kde.kpresenter":["kpr","kpt"],"application/vnd.kde.kspread":["ksp"],"application/vnd.kde.kword":["kwd","kwt"],"application/vnd.kenameaapp":["htke"],"application/vnd.kidspiration":["kia"],"application/vnd.kinar":["kne","knp"],"application/vnd.koan":["skp","skd","skt","skm"],"application/vnd.kodak-descriptor":["sse"],"application/vnd.las.las+xml":["lasxml"],"application/vnd.llamagraphics.life-balance.desktop":["lbd"],"application/vnd.llamagraphics.life-balance.exchange+xml":["lbe"],"application/vnd.lotus-1-2-3":["123"],"application/vnd.lotus-approach":["apr"],"application/vnd.lotus-freelance":["pre"],"application/vnd.lotus-notes":["nsf"],"application/vnd.lotus-organizer":["org"],"application/vnd.lotus-screencam":["scm"],"application/vnd.lotus-wordpro":["lwp"],"application/vnd.macports.portpkg":["portpkg"],"application/vnd.mcd":["mcd"],"application/vnd.medcalcdata":["mc1"],"application/vnd.mediastation.cdkey":["cdkey"],"application/vnd.mfer":["mwf"],"application/vnd.mfmp":["mfm"],"application/vnd.micrografx.flo":["flo"],"application/vnd.micrografx.igx":["igx"],"application/vnd.mif":["mif"],"application/vnd.mobius.daf":["daf"],"application/vnd.mobius.dis":["dis"],"application/vnd.mobius.mbk":["mbk"],"application/vnd.mobius.mqy":["mqy"],"application/vnd.mobius.msl":["msl"],"application/vnd.mobius.plc":["plc"],"application/vnd.mobius.txf":["txf"],"application/vnd.mophun.application":["mpn"],"application/vnd.mophun.certificate":["mpc"],"application/vnd.mozilla.xul+xml":["xul"],"application/vnd.ms-artgalry":["cil"],"application/vnd.ms-cab-compressed":["cab"],"application/vnd.ms-excel":["xls","xlm","xla","xlc","xlt","xlw"],"application/vnd.ms-excel.addin.macroenabled.12":["xlam"],"application/vnd.ms-excel.sheet.binary.macroenabled.12":["xlsb"],"application/vnd.ms-excel.sheet.macroenabled.12":["xlsm"],"application/vnd.ms-excel.template.macroenabled.12":["xltm"],"application/vnd.ms-fontobject":["eot"],"application/vnd.ms-htmlhelp":["chm"],"application/vnd.ms-ims":["ims"],"application/vnd.ms-lrm":["lrm"],"application/vnd.ms-officetheme":["thmx"],"application/vnd.ms-pki.seccat":["cat"],"application/vnd.ms-pki.stl":["stl"],"application/vnd.ms-powerpoint":["ppt","pps","pot"],"application/vnd.ms-powerpoint.addin.macroenabled.12":["ppam"],"application/vnd.ms-powerpoint.presentation.macroenabled.12":["pptm"],"application/vnd.ms-powerpoint.slide.macroenabled.12":["sldm"],"application/vnd.ms-powerpoint.slideshow.macroenabled.12":["ppsm"],"application/vnd.ms-powerpoint.template.macroenabled.12":["potm"],"application/vnd.ms-project":["mpp","mpt"],"application/vnd.ms-word.document.macroenabled.12":["docm"],"application/vnd.ms-word.template.macroenabled.12":["dotm"],"application/vnd.ms-works":["wps","wks","wcm","wdb"],"application/vnd.ms-wpl":["wpl"],"application/vnd.ms-xpsdocument":["xps"],"application/vnd.mseq":["mseq"],"application/vnd.musician":["mus"],"application/vnd.muvee.style":["msty"],"application/vnd.mynfc":["taglet"],"application/vnd.neurolanguage.nlu":["nlu"],"application/vnd.nitf":["ntf","nitf"],"application/vnd.noblenet-directory":["nnd"],"application/vnd.noblenet-sealer":["nns"],"application/vnd.noblenet-web":["nnw"],"application/vnd.nokia.n-gage.data":["ngdat"],"application/vnd.nokia.radio-preset":["rpst"],"application/vnd.nokia.radio-presets":["rpss"],"application/vnd.novadigm.edm":["edm"],"application/vnd.novadigm.edx":["edx"],"application/vnd.novadigm.ext":["ext"],"application/vnd.oasis.opendocument.chart":["odc"],"application/vnd.oasis.opendocument.chart-template":["otc"],"application/vnd.oasis.opendocument.database":["odb"],"application/vnd.oasis.opendocument.formula":["odf"],"application/vnd.oasis.opendocument.formula-template":["odft"],"application/vnd.oasis.opendocument.graphics":["odg"],"application/vnd.oasis.opendocument.graphics-template":["otg"],"application/vnd.oasis.opendocument.image":["odi"],"application/vnd.oasis.opendocument.image-template":["oti"],"application/vnd.oasis.opendocument.presentation":["odp"],"application/vnd.oasis.opendocument.presentation-template":["otp"],"application/vnd.oasis.opendocument.spreadsheet":["ods"],"application/vnd.oasis.opendocument.spreadsheet-template":["ots"],"application/vnd.oasis.opendocument.text":["odt"],"application/vnd.oasis.opendocument.text-master":["odm"],"application/vnd.oasis.opendocument.text-template":["ott"],"application/vnd.oasis.opendocument.text-web":["oth"],"application/vnd.olpc-sugar":["xo"],"application/vnd.oma.dd2+xml":["dd2"],"application/vnd.openofficeorg.extension":["oxt"],"application/vnd.openxmlformats-officedocument.presentationml.presentation":["pptx"],"application/vnd.openxmlformats-officedocument.presentationml.slide":["sldx"],"application/vnd.openxmlformats-officedocument.presentationml.slideshow":["ppsx"],"application/vnd.openxmlformats-officedocument.presentationml.template":["potx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":["xlsx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.template":["xltx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.document":["docx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.template":["dotx"],"application/vnd.osgeo.mapguide.package":["mgp"],"application/vnd.osgi.dp":["dp"],"application/vnd.osgi.subsystem":["esa"],"application/vnd.palm":["pdb","pqa","oprc"],"application/vnd.pawaafile":["paw"],"application/vnd.pg.format":["str"],"application/vnd.pg.osasli":["ei6"],"application/vnd.picsel":["efif"],"application/vnd.pmi.widget":["wg"],"application/vnd.pocketlearn":["plf"],"application/vnd.powerbuilder6":["pbd"],"application/vnd.previewsystems.box":["box"],"application/vnd.proteus.magazine":["mgz"],"application/vnd.publishare-delta-tree":["qps"],"application/vnd.pvi.ptid1":["ptid"],"application/vnd.quark.quarkxpress":["qxd","qxt","qwd","qwt","qxl","qxb"],"application/vnd.realvnc.bed":["bed"],"application/vnd.recordare.musicxml":["mxl"],"application/vnd.recordare.musicxml+xml":["musicxml"],"application/vnd.rig.cryptonote":["cryptonote"],"application/vnd.rim.cod":["cod"],"application/vnd.rn-realmedia":["rm"],"application/vnd.rn-realmedia-vbr":["rmvb"],"application/vnd.route66.link66+xml":["link66"],"application/vnd.sailingtracker.track":["st"],"application/vnd.seemail":["see"],"application/vnd.sema":["sema"],"application/vnd.semd":["semd"],"application/vnd.semf":["semf"],"application/vnd.shana.informed.formdata":["ifm"],"application/vnd.shana.informed.formtemplate":["itp"],"application/vnd.shana.informed.interchange":["iif"],"application/vnd.shana.informed.package":["ipk"],"application/vnd.simtech-mindmapper":["twd","twds"],"application/vnd.smaf":["mmf"],"application/vnd.smart.teacher":["teacher"],"application/vnd.solent.sdkm+xml":["sdkm","sdkd"],"application/vnd.spotfire.dxp":["dxp"],"application/vnd.spotfire.sfs":["sfs"],"application/vnd.stardivision.calc":["sdc"],"application/vnd.stardivision.draw":["sda"],"application/vnd.stardivision.impress":["sdd"],"application/vnd.stardivision.math":["smf"],"application/vnd.stardivision.writer":["sdw","vor"],"application/vnd.stardivision.writer-global":["sgl"],"application/vnd.stepmania.package":["smzip"],"application/vnd.stepmania.stepchart":["sm"],"application/vnd.sun.xml.calc":["sxc"],"application/vnd.sun.xml.calc.template":["stc"],"application/vnd.sun.xml.draw":["sxd"],"application/vnd.sun.xml.draw.template":["std"],"application/vnd.sun.xml.impress":["sxi"],"application/vnd.sun.xml.impress.template":["sti"],"application/vnd.sun.xml.math":["sxm"],"application/vnd.sun.xml.writer":["sxw"],"application/vnd.sun.xml.writer.global":["sxg"],"application/vnd.sun.xml.writer.template":["stw"],"application/vnd.sus-calendar":["sus","susp"],"application/vnd.svd":["svd"],"application/vnd.symbian.install":["sis","sisx"],"application/vnd.syncml+xml":["xsm"],"application/vnd.syncml.dm+wbxml":["bdm"],"application/vnd.syncml.dm+xml":["xdm"],"application/vnd.tao.intent-module-archive":["tao"],"application/vnd.tcpdump.pcap":["pcap","cap","dmp"],"application/vnd.tmobile-livetv":["tmo"],"application/vnd.trid.tpt":["tpt"],"application/vnd.triscape.mxs":["mxs"],"application/vnd.trueapp":["tra"],"application/vnd.ufdl":["ufd","ufdl"],"application/vnd.uiq.theme":["utz"],"application/vnd.umajin":["umj"],"application/vnd.unity":["unityweb"],"application/vnd.uoml+xml":["uoml"],"application/vnd.vcx":["vcx"],"application/vnd.visio":["vsd","vst","vss","vsw"],"application/vnd.visionary":["vis"],"application/vnd.vsf":["vsf"],"application/vnd.wap.wbxml":["wbxml"],"application/vnd.wap.wmlc":["wmlc"],"application/vnd.wap.wmlscriptc":["wmlsc"],"application/vnd.webturbo":["wtb"],"application/vnd.wolfram.player":["nbp"],"application/vnd.wordperfect":["wpd"],"application/vnd.wqd":["wqd"],"application/vnd.wt.stf":["stf"],"application/vnd.xara":["xar"],"application/vnd.xfdl":["xfdl"],"application/vnd.yamaha.hv-dic":["hvd"],"application/vnd.yamaha.hv-script":["hvs"],"application/vnd.yamaha.hv-voice":["hvp"],"application/vnd.yamaha.openscoreformat":["osf"],"application/vnd.yamaha.openscoreformat.osfpvg+xml":["osfpvg"],"application/vnd.yamaha.smaf-audio":["saf"],"application/vnd.yamaha.smaf-phrase":["spf"],"application/vnd.yellowriver-custom-menu":["cmp"],"application/vnd.zul":["zir","zirz"],"application/vnd.zzazz.deck+xml":["zaz"],"application/voicexml+xml":["vxml"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/x-7z-compressed":["7z"],"application/x-abiword":["abw"],"application/x-ace-compressed":["ace"],"application/x-apple-diskimage":["dmg"],"application/x-authorware-bin":["aab","x32","u32","vox"],"application/x-authorware-map":["aam"],"application/x-authorware-seg":["aas"],"application/x-bcpio":["bcpio"],"application/x-bittorrent":["torrent"],"application/x-blorb":["blb","blorb"],"application/x-bzip":["bz"],"application/x-bzip2":["bz2","boz"],"application/x-cbr":["cbr","cba","cbt","cbz","cb7"],"application/x-cdlink":["vcd"],"application/x-cfs-compressed":["cfs"],"application/x-chat":["chat"],"application/x-chess-pgn":["pgn"],"application/x-chrome-extension":["crx"],"application/x-conference":["nsc"],"application/x-cpio":["cpio"],"application/x-csh":["csh"],"application/x-debian-package":["deb","udeb"],"application/x-dgc-compressed":["dgc"],"application/x-director":["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"],"application/x-doom":["wad"],"application/x-dtbncx+xml":["ncx"],"application/x-dtbook+xml":["dtb"],"application/x-dtbresource+xml":["res"],"application/x-dvi":["dvi"],"application/x-envoy":["evy"],"application/x-eva":["eva"],"application/x-font-bdf":["bdf"],"application/x-font-ghostscript":["gsf"],"application/x-font-linux-psf":["psf"],"application/x-font-otf":["otf"],"application/x-font-pcf":["pcf"],"application/x-font-snf":["snf"],"application/x-font-ttf":["ttf","ttc"],"application/x-font-type1":["pfa","pfb","pfm","afm"],"application/x-freearc":["arc"],"application/x-futuresplash":["spl"],"application/x-gca-compressed":["gca"],"application/x-glulx":["ulx"],"application/x-gnumeric":["gnumeric"],"application/x-gramps-xml":["gramps"],"application/x-gtar":["gtar"],"application/x-hdf":["hdf"],"application/x-install-instructions":["install"],"application/x-iso9660-image":["iso"],"application/x-java-jnlp-file":["jnlp"],"application/x-latex":["latex"],"application/x-lua-bytecode":["luac"],"application/x-lzh-compressed":["lzh","lha"],"application/x-mie":["mie"],"application/x-mobipocket-ebook":["prc","mobi"],"application/x-ms-application":["application"],"application/x-ms-shortcut":["lnk"],"application/x-ms-wmd":["wmd"],"application/x-ms-wmz":["wmz"],"application/x-ms-xbap":["xbap"],"application/x-msaccess":["mdb"],"application/x-msbinder":["obd"],"application/x-mscardfile":["crd"],"application/x-msclip":["clp"],"application/x-msdownload":["exe","dll","com","bat","msi"],"application/x-msmediaview":["mvb","m13","m14"],"application/x-msmetafile":["wmf","wmz","emf","emz"],"application/x-msmoney":["mny"],"application/x-mspublisher":["pub"],"application/x-msschedule":["scd"],"application/x-msterminal":["trm"],"application/x-mswrite":["wri"],"application/x-netcdf":["nc","cdf"],"application/x-nzb":["nzb"],"application/x-pkcs12":["p12","pfx"],"application/x-pkcs7-certificates":["p7b","spc"],"application/x-pkcs7-certreqresp":["p7r"],"application/x-rar-compressed":["rar"],"application/x-research-info-systems":["ris"],"application/x-sh":["sh"],"application/x-shar":["shar"],"application/x-shockwave-flash":["swf"],"application/x-silverlight-app":["xap"],"application/x-sql":["sql"],"application/x-stuffit":["sit"],"application/x-stuffitx":["sitx"],"application/x-subrip":["srt"],"application/x-sv4cpio":["sv4cpio"],"application/x-sv4crc":["sv4crc"],"application/x-t3vm-image":["t3"],"application/x-tads":["gam"],"application/x-tar":["tar"],"application/x-tcl":["tcl"],"application/x-tex":["tex"],"application/x-tex-tfm":["tfm"],"application/x-texinfo":["texinfo","texi"],"application/x-tgif":["obj"],"application/x-ustar":["ustar"],"application/x-wais-source":["src"],"application/x-web-app-manifest+json":["webapp"],"application/x-x509-ca-cert":["der","crt"],"application/x-xfig":["fig"],"application/x-xliff+xml":["xlf"],"application/x-xpinstall":["xpi"],"application/x-xz":["xz"],"application/x-zmachine":["z1","z2","z3","z4","z5","z6","z7","z8"],"application/xaml+xml":["xaml"],"application/xcap-diff+xml":["xdf"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xml":["xml","xsl","xsd"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mp4":["mp4a","m4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/vnd.dece.audio":["uva","uvva"],"audio/vnd.digital-winds":["eol"],"audio/vnd.dra":["dra"],"audio/vnd.dts":["dts"],"audio/vnd.dts.hd":["dtshd"],"audio/vnd.lucent.voice":["lvp"],"audio/vnd.ms-playready.media.pya":["pya"],"audio/vnd.nuera.ecelp4800":["ecelp4800"],"audio/vnd.nuera.ecelp7470":["ecelp7470"],"audio/vnd.nuera.ecelp9600":["ecelp9600"],"audio/vnd.rip":["rip"],"audio/webm":["weba"],"audio/x-aac":["aac"],"audio/x-aiff":["aif","aiff","aifc"],"audio/x-caf":["caf"],"audio/x-flac":["flac"],"audio/x-matroska":["mka"],"audio/x-mpegurl":["m3u"],"audio/x-ms-wax":["wax"],"audio/x-ms-wma":["wma"],"audio/x-pn-realaudio":["ram","ra"],"audio/x-pn-realaudio-plugin":["rmp"],"audio/x-wav":["wav"],"audio/xm":["xm"],"chemical/x-cdx":["cdx"],"chemical/x-cif":["cif"],"chemical/x-cmdf":["cmdf"],"chemical/x-cml":["cml"],"chemical/x-csml":["csml"],"chemical/x-xyz":["xyz"],"font/opentype":["otf"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/g3fax":["g3"],"image/gif":["gif"],"image/ief":["ief"],"image/jpeg":["jpeg","jpg","jpe"],"image/ktx":["ktx"],"image/png":["png"],"image/prs.btif":["btif"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/tiff":["tiff","tif"],"image/vnd.adobe.photoshop":["psd"],"image/vnd.dece.graphic":["uvi","uvvi","uvg","uvvg"],"image/vnd.djvu":["djvu","djv"],"image/vnd.dvb.subtitle":["sub"],"image/vnd.dwg":["dwg"],"image/vnd.dxf":["dxf"],"image/vnd.fastbidsheet":["fbs"],"image/vnd.fpx":["fpx"],"image/vnd.fst":["fst"],"image/vnd.fujixerox.edmics-mmr":["mmr"],"image/vnd.fujixerox.edmics-rlc":["rlc"],"image/vnd.ms-modi":["mdi"],"image/vnd.ms-photo":["wdp"],"image/vnd.net-fpx":["npx"],"image/vnd.wap.wbmp":["wbmp"],"image/vnd.xiff":["xif"],"image/webp":["webp"],"image/x-3ds":["3ds"],"image/x-cmu-raster":["ras"],"image/x-cmx":["cmx"],"image/x-freehand":["fh","fhc","fh4","fh5","fh7"],"image/x-icon":["ico"],"image/x-mrsid-image":["sid"],"image/x-pcx":["pcx"],"image/x-pict":["pic","pct"],"image/x-portable-anymap":["pnm"],"image/x-portable-bitmap":["pbm"],"image/x-portable-graymap":["pgm"],"image/x-portable-pixmap":["ppm"],"image/x-rgb":["rgb"],"image/x-tga":["tga"],"image/x-xbitmap":["xbm"],"image/x-xpixmap":["xpm"],"image/x-xwindowdump":["xwd"],"message/rfc822":["eml","mime"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/vnd.collada+xml":["dae"],"model/vnd.dwf":["dwf"],"model/vnd.gdl":["gdl"],"model/vnd.gtw":["gtw"],"model/vnd.mts":["mts"],"model/vnd.vtu":["vtu"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["x3db","x3dbz"],"model/x3d+vrml":["x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee"],"text/css":["css"],"text/csv":["csv"],"text/hjson":["hjson"],"text/html":["html","htm"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/prs.lines.tag":["dsc"],"text/richtext":["rtx"],"text/sgml":["sgml","sgm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vnd.curl":["curl"],"text/vnd.curl.dcurl":["dcurl"],"text/vnd.curl.mcurl":["mcurl"],"text/vnd.curl.scurl":["scurl"],"text/vnd.dvb.subtitle":["sub"],"text/vnd.fly":["fly"],"text/vnd.fmi.flexstor":["flx"],"text/vnd.graphviz":["gv"],"text/vnd.in3d.3dml":["3dml"],"text/vnd.in3d.spot":["spot"],"text/vnd.sun.j2me.app-descriptor":["jad"],"text/vnd.wap.wml":["wml"],"text/vnd.wap.wmlscript":["wmls"],"text/vtt":["vtt"],"text/x-asm":["s","asm"],"text/x-c":["c","cc","cxx","cpp","h","hh","dic"],"text/x-component":["htc"],"text/x-fortran":["f","for","f77","f90"],"text/x-handlebars-template":["hbs"],"text/x-java-source":["java"],"text/x-lua":["lua"],"text/x-markdown":["markdown","md","mkd"],"text/x-nfo":["nfo"],"text/x-opml":["opml"],"text/x-pascal":["p","pas"],"text/x-sass":["sass"],"text/x-scss":["scss"],"text/x-setext":["etx"],"text/x-sfv":["sfv"],"text/x-uuencode":["uu"],"text/x-vcalendar":["vcs"],"text/x-vcard":["vcf"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/vnd.dece.hd":["uvh","uvvh"],"video/vnd.dece.mobile":["uvm","uvvm"],"video/vnd.dece.pd":["uvp","uvvp"],"video/vnd.dece.sd":["uvs","uvvs"],"video/vnd.dece.video":["uvv","uvvv"],"video/vnd.dvb.file":["dvb"],"video/vnd.fvt":["fvt"],"video/vnd.mpegurl":["mxu","m4u"],"video/vnd.ms-playready.media.pyv":["pyv"],"video/vnd.uvvu.mp4":["uvu","uvvu"],"video/vnd.vivo":["viv"],"video/webm":["webm"],"video/x-f4v":["f4v"],"video/x-fli":["fli"],"video/x-flv":["flv"],"video/x-m4v":["m4v"],"video/x-matroska":["mkv","mk3d","mks"],"video/x-mng":["mng"],"video/x-ms-asf":["asf","asx"],"video/x-ms-vob":["vob"],"video/x-ms-wm":["wm"],"video/x-ms-wmv":["wmv"],"video/x-ms-wmx":["wmx"],"video/x-ms-wvx":["wvx"],"video/x-msvideo":["avi"],"video/x-sgi-movie":["movie"],"video/x-smv":["smv"],"x-conference/x-cooltalk":["ice"]};},{}],43:[function(require,module,exports){module.exports=once;once.proto=once(function(){Object.defineProperty(Function.prototype,'once',{value:function value(){return once(this);},configurable:true});});function once(fn){var called=false;return function(){if(called)return;called=true;return fn.apply(this,arguments);};}},{}],44:[function(require,module,exports){'use strict';var TYPED_OK=typeof Uint8Array!=='undefined'&&typeof Uint16Array!=='undefined'&&typeof Int32Array!=='undefined';exports.assign=function(obj /*from1, from2, from3, ...*/){var sources=Array.prototype.slice.call(arguments,1);while(sources.length){var source=sources.shift();if(!source){continue;}if((typeof source==="undefined"?"undefined":_typeof(source))!=='object'){throw new TypeError(source+'must be non-object');}for(var p in source){if(source.hasOwnProperty(p)){obj[p]=source[p];}}}return obj;}; // reduce buffer size, avoiding mem copy
exports.shrinkBuf=function(buf,size){if(buf.length===size){return buf;}if(buf.subarray){return buf.subarray(0,size);}buf.length=size;return buf;};var fnTyped={arraySet:function arraySet(dest,src,src_offs,len,dest_offs){if(src.subarray&&dest.subarray){dest.set(src.subarray(src_offs,src_offs+len),dest_offs);return;} // Fallback to ordinary array
for(var i=0;i<len;i++){dest[dest_offs+i]=src[src_offs+i];}}, // Join array of chunks to single array.
flattenChunks:function flattenChunks(chunks){var i,l,len,pos,chunk,result; // calculate data length
len=0;for(i=0,l=chunks.length;i<l;i++){len+=chunks[i].length;} // join chunks
result=new Uint8Array(len);pos=0;for(i=0,l=chunks.length;i<l;i++){chunk=chunks[i];result.set(chunk,pos);pos+=chunk.length;}return result;}};var fnUntyped={arraySet:function arraySet(dest,src,src_offs,len,dest_offs){for(var i=0;i<len;i++){dest[dest_offs+i]=src[src_offs+i];}}, // Join array of chunks to single array.
flattenChunks:function flattenChunks(chunks){return [].concat.apply([],chunks);}}; // Enable/Disable typed arrays use, for testing
//
exports.setTyped=function(on){if(on){exports.Buf8=Uint8Array;exports.Buf16=Uint16Array;exports.Buf32=Int32Array;exports.assign(exports,fnTyped);}else {exports.Buf8=Array;exports.Buf16=Array;exports.Buf32=Array;exports.assign(exports,fnUntyped);}};exports.setTyped(TYPED_OK);},{}],45:[function(require,module,exports){'use strict'; // Note: adler32 takes 12% for level 0 and 2% for level 6.
// It doesn't worth to make additional optimizationa as in original.
// Small size is preferable.
function adler32(adler,buf,len,pos){var s1=adler&0xffff|0,s2=adler>>>16&0xffff|0,n=0;while(len!==0){ // Set limit ~ twice less than 5552, to keep
// s2 in 31-bits, because we force signed ints.
// in other case %= will fail.
n=len>2000?2000:len;len-=n;do {s1=s1+buf[pos++]|0;s2=s2+s1|0;}while(--n);s1%=65521;s2%=65521;}return s1|s2<<16|0;}module.exports=adler32;},{}],46:[function(require,module,exports){module.exports={ /* Allowed flush values; see deflate() and inflate() below for details */Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6, /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3, //Z_MEM_ERROR:     -4,
Z_BUF_ERROR:-5, //Z_VERSION_ERROR: -6,
/* compression levels */Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0, /* Possible values of the data_type field (though see inflate()) */Z_BINARY:0,Z_TEXT:1, //Z_ASCII:                1, // = Z_TEXT (deprecated)
Z_UNKNOWN:2, /* The deflate compression method */Z_DEFLATED:8 //Z_NULL:                 null // Use -1 or null inline, depending on var type
};},{}],47:[function(require,module,exports){'use strict'; // Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.
// Use ordinary array, since untyped makes no boost here
function makeTable(){var c,table=[];for(var n=0;n<256;n++){c=n;for(var k=0;k<8;k++){c=c&1?0xEDB88320^c>>>1:c>>>1;}table[n]=c;}return table;} // Create table on load. Just 255 signed longs. Not a problem.
var crcTable=makeTable();function crc32(crc,buf,len,pos){var t=crcTable,end=pos+len;crc=crc^-1;for(var i=pos;i<end;i++){crc=crc>>>8^t[(crc^buf[i])&0xFF];}return crc^-1; // >>> 0;
}module.exports=crc32;},{}],48:[function(require,module,exports){'use strict';var utils=require('../utils/common');var trees=require('./trees');var adler32=require('./adler32');var crc32=require('./crc32');var msg=require('./messages'); /* Public constants ==========================================================*/ /* ===========================================================================*/ /* Allowed flush values; see deflate() and inflate() below for details */var Z_NO_FLUSH=0;var Z_PARTIAL_FLUSH=1; //var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH=3;var Z_FINISH=4;var Z_BLOCK=5; //var Z_TREES         = 6;
/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */var Z_OK=0;var Z_STREAM_END=1; //var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR=-2;var Z_DATA_ERROR=-3; //var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR=-5; //var Z_VERSION_ERROR = -6;
/* compression levels */ //var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION=-1;var Z_FILTERED=1;var Z_HUFFMAN_ONLY=2;var Z_RLE=3;var Z_FIXED=4;var Z_DEFAULT_STRATEGY=0; /* Possible values of the data_type field (though see inflate()) */ //var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN=2; /* The deflate compression method */var Z_DEFLATED=8; /*============================================================================*/var MAX_MEM_LEVEL=9; /* Maximum value for memLevel in deflateInit2 */var MAX_WBITS=15; /* 32K LZ77 window */var DEF_MEM_LEVEL=8;var LENGTH_CODES=29; /* number of length codes, not counting the special END_BLOCK code */var LITERALS=256; /* number of literal bytes 0..255 */var L_CODES=LITERALS+1+LENGTH_CODES; /* number of Literal or Length codes, including the END_BLOCK code */var D_CODES=30; /* number of distance codes */var BL_CODES=19; /* number of codes used to transfer the bit lengths */var HEAP_SIZE=2*L_CODES+1; /* maximum heap size */var MAX_BITS=15; /* All codes must not exceed MAX_BITS bits */var MIN_MATCH=3;var MAX_MATCH=258;var MIN_LOOKAHEAD=MAX_MATCH+MIN_MATCH+1;var PRESET_DICT=0x20;var INIT_STATE=42;var EXTRA_STATE=69;var NAME_STATE=73;var COMMENT_STATE=91;var HCRC_STATE=103;var BUSY_STATE=113;var FINISH_STATE=666;var BS_NEED_MORE=1; /* block not completed, need more input or more output */var BS_BLOCK_DONE=2; /* block flush performed */var BS_FINISH_STARTED=3; /* finish started, need only more output at next deflate */var BS_FINISH_DONE=4; /* finish done, accept no more input or output */var OS_CODE=0x03; // Unix :) . Don't detect, use this default.
function err(strm,errorCode){strm.msg=msg[errorCode];return errorCode;}function rank(f){return (f<<1)-(f>4?9:0);}function zero(buf){var len=buf.length;while(--len>=0){buf[len]=0;}} /* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */function flush_pending(strm){var s=strm.state; //_tr_flush_bits(s);
var len=s.pending;if(len>strm.avail_out){len=strm.avail_out;}if(len===0){return;}utils.arraySet(strm.output,s.pending_buf,s.pending_out,len,strm.next_out);strm.next_out+=len;s.pending_out+=len;strm.total_out+=len;strm.avail_out-=len;s.pending-=len;if(s.pending===0){s.pending_out=0;}}function flush_block_only(s,last){trees._tr_flush_block(s,s.block_start>=0?s.block_start:-1,s.strstart-s.block_start,last);s.block_start=s.strstart;flush_pending(s.strm);}function put_byte(s,b){s.pending_buf[s.pending++]=b;} /* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */function putShortMSB(s,b){ //  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
s.pending_buf[s.pending++]=b>>>8&0xff;s.pending_buf[s.pending++]=b&0xff;} /* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */function read_buf(strm,buf,start,size){var len=strm.avail_in;if(len>size){len=size;}if(len===0){return 0;}strm.avail_in-=len;utils.arraySet(buf,strm.input,strm.next_in,len,start);if(strm.state.wrap===1){strm.adler=adler32(strm.adler,buf,len,start);}else if(strm.state.wrap===2){strm.adler=crc32(strm.adler,buf,len,start);}strm.next_in+=len;strm.total_in+=len;return len;} /* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */function longest_match(s,cur_match){var chain_length=s.max_chain_length; /* max hash chain length */var scan=s.strstart; /* current string */var match; /* matched string */var len; /* length of current match */var best_len=s.prev_length; /* best match length so far */var nice_match=s.nice_match; /* stop if match long enough */var limit=s.strstart>s.w_size-MIN_LOOKAHEAD?s.strstart-(s.w_size-MIN_LOOKAHEAD):0 /*NIL*/;var _win=s.window; // shortcut
var wmask=s.w_mask;var prev=s.prev; /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */var strend=s.strstart+MAX_MATCH;var scan_end1=_win[scan+best_len-1];var scan_end=_win[scan+best_len]; /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */ // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");
/* Do not waste too much time if we already have a good match: */if(s.prev_length>=s.good_match){chain_length>>=2;} /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */if(nice_match>s.lookahead){nice_match=s.lookahead;} // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");
do { // Assert(cur_match < s->strstart, "no future");
match=cur_match; /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */if(_win[match+best_len]!==scan_end||_win[match+best_len-1]!==scan_end1||_win[match]!==_win[scan]||_win[++match]!==_win[scan+1]){continue;} /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */scan+=2;match++; // Assert(*scan == *match, "match[2]?");
/* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */do { /*jshint noempty:false*/}while(_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&scan<strend); // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");
len=MAX_MATCH-(strend-scan);scan=strend-MAX_MATCH;if(len>best_len){s.match_start=cur_match;best_len=len;if(len>=nice_match){break;}scan_end1=_win[scan+best_len-1];scan_end=_win[scan+best_len];}}while((cur_match=prev[cur_match&wmask])>limit&&--chain_length!==0);if(best_len<=s.lookahead){return best_len;}return s.lookahead;} /* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */function fill_window(s){var _w_size=s.w_size;var p,n,m,more,str; //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");
do {more=s.window_size-s.lookahead-s.strstart; // JS ints have 32 bit, block below not needed
/* Deal with !@#$% 64K limit: */ //if (sizeof(int) <= 2) {
//    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
//        more = wsize;
//
//  } else if (more == (unsigned)(-1)) {
//        /* Very unlikely, but possible on 16 bit machine if
//         * strstart == 0 && lookahead == 1 (input done a byte at time)
//         */
//        more--;
//    }
//}
/* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */if(s.strstart>=_w_size+(_w_size-MIN_LOOKAHEAD)){utils.arraySet(s.window,s.window,_w_size,_w_size,0);s.match_start-=_w_size;s.strstart-=_w_size; /* we now have strstart >= MAX_DIST */s.block_start-=_w_size; /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */n=s.hash_size;p=n;do {m=s.head[--p];s.head[p]=m>=_w_size?m-_w_size:0;}while(--n);n=_w_size;p=n;do {m=s.prev[--p];s.prev[p]=m>=_w_size?m-_w_size:0; /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */}while(--n);more+=_w_size;}if(s.strm.avail_in===0){break;} /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */ //Assert(more >= 2, "more < 2");
n=read_buf(s.strm,s.window,s.strstart+s.lookahead,more);s.lookahead+=n; /* Initialize the hash value now that we have some input: */if(s.lookahead+s.insert>=MIN_MATCH){str=s.strstart-s.insert;s.ins_h=s.window[str]; /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */s.ins_h=(s.ins_h<<s.hash_shift^s.window[str+1])&s.hash_mask; //#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
while(s.insert){ /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */s.ins_h=(s.ins_h<<s.hash_shift^s.window[str+MIN_MATCH-1])&s.hash_mask;s.prev[str&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=str;str++;s.insert--;if(s.lookahead+s.insert<MIN_MATCH){break;}}} /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */}while(s.lookahead<MIN_LOOKAHEAD&&s.strm.avail_in!==0); /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */ //  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
} /* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */function deflate_stored(s,flush){ /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */var max_block_size=0xffff;if(max_block_size>s.pending_buf_size-5){max_block_size=s.pending_buf_size-5;} /* Copy as much as possible from input to output: */for(;;){ /* Fill the window as much as possible: */if(s.lookahead<=1){ //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
//  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }
fill_window(s);if(s.lookahead===0&&flush===Z_NO_FLUSH){return BS_NEED_MORE;}if(s.lookahead===0){break;} /* flush the current block */} //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");
s.strstart+=s.lookahead;s.lookahead=0; /* Emit a stored block if pending_buf will be full: */var max_start=s.block_start+max_block_size;if(s.strstart===0||s.strstart>=max_start){ /* strstart == 0 is possible when wraparound on 16-bit machine */s.lookahead=s.strstart-max_start;s.strstart=max_start; /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/} /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */if(s.strstart-s.block_start>=s.w_size-MIN_LOOKAHEAD){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}}s.insert=0;if(flush===Z_FINISH){ /*** FLUSH_BLOCK(s, 1); ***/flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED;} /***/return BS_FINISH_DONE;}if(s.strstart>s.block_start){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}return BS_NEED_MORE;} /* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */function deflate_fast(s,flush){var hash_head; /* head of the hash chain */var bflush; /* set if current block must be flushed */for(;;){ /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */if(s.lookahead<MIN_LOOKAHEAD){fill_window(s);if(s.lookahead<MIN_LOOKAHEAD&&flush===Z_NO_FLUSH){return BS_NEED_MORE;}if(s.lookahead===0){break; /* flush the current block */}} /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */hash_head=0 /*NIL*/;if(s.lookahead>=MIN_MATCH){ /*** INSERT_STRING(s, s.strstart, hash_head); ***/s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart; /***/} /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */if(hash_head!==0 /*NIL*/&&s.strstart-hash_head<=s.w_size-MIN_LOOKAHEAD){ /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */s.match_length=longest_match(s,hash_head); /* longest_match() sets match_start */}if(s.match_length>=MIN_MATCH){ // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only
/*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/bflush=trees._tr_tally(s,s.strstart-s.match_start,s.match_length-MIN_MATCH);s.lookahead-=s.match_length; /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */if(s.match_length<=s.max_lazy_match /*max_insert_length*/&&s.lookahead>=MIN_MATCH){s.match_length--; /* string at strstart already in table */do {s.strstart++; /*** INSERT_STRING(s, s.strstart, hash_head); ***/s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart; /***/ /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */}while(--s.match_length!==0);s.strstart++;}else {s.strstart+=s.match_length;s.match_length=0;s.ins_h=s.window[s.strstart]; /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+1])&s.hash_mask; //#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
/* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */}}else { /* No match, output a literal byte */ //Tracevv((stderr,"%c", s.window[s.strstart]));
/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++;}if(bflush){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}}s.insert=s.strstart<MIN_MATCH-1?s.strstart:MIN_MATCH-1;if(flush===Z_FINISH){ /*** FLUSH_BLOCK(s, 1); ***/flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED;} /***/return BS_FINISH_DONE;}if(s.last_lit){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}return BS_BLOCK_DONE;} /* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */function deflate_slow(s,flush){var hash_head; /* head of hash chain */var bflush; /* set if current block must be flushed */var max_insert; /* Process the input block. */for(;;){ /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */if(s.lookahead<MIN_LOOKAHEAD){fill_window(s);if(s.lookahead<MIN_LOOKAHEAD&&flush===Z_NO_FLUSH){return BS_NEED_MORE;}if(s.lookahead===0){break;} /* flush the current block */} /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */hash_head=0 /*NIL*/;if(s.lookahead>=MIN_MATCH){ /*** INSERT_STRING(s, s.strstart, hash_head); ***/s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart; /***/} /* Find the longest match, discarding those <= prev_length.
     */s.prev_length=s.match_length;s.prev_match=s.match_start;s.match_length=MIN_MATCH-1;if(hash_head!==0 /*NIL*/&&s.prev_length<s.max_lazy_match&&s.strstart-hash_head<=s.w_size-MIN_LOOKAHEAD /*MAX_DIST(s)*/){ /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */s.match_length=longest_match(s,hash_head); /* longest_match() sets match_start */if(s.match_length<=5&&(s.strategy===Z_FILTERED||s.match_length===MIN_MATCH&&s.strstart-s.match_start>4096 /*TOO_FAR*/)){ /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */s.match_length=MIN_MATCH-1;}} /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */if(s.prev_length>=MIN_MATCH&&s.match_length<=s.prev_length){max_insert=s.strstart+s.lookahead-MIN_MATCH; /* Do not insert strings in hash table beyond this. */ //check_match(s, s.strstart-1, s.prev_match, s.prev_length);
/***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/bflush=trees._tr_tally(s,s.strstart-1-s.prev_match,s.prev_length-MIN_MATCH); /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */s.lookahead-=s.prev_length-1;s.prev_length-=2;do {if(++s.strstart<=max_insert){ /*** INSERT_STRING(s, s.strstart, hash_head); ***/s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart; /***/}}while(--s.prev_length!==0);s.match_available=0;s.match_length=MIN_MATCH-1;s.strstart++;if(bflush){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}}else if(s.match_available){ /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */ //Tracevv((stderr,"%c", s->window[s->strstart-1]));
/*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/bflush=trees._tr_tally(s,0,s.window[s.strstart-1]);if(bflush){ /*** FLUSH_BLOCK_ONLY(s, 0) ***/flush_block_only(s,false); /***/}s.strstart++;s.lookahead--;if(s.strm.avail_out===0){return BS_NEED_MORE;}}else { /* There is no previous match to compare with, wait for
       * the next step to decide.
       */s.match_available=1;s.strstart++;s.lookahead--;}} //Assert (flush != Z_NO_FLUSH, "no flush?");
if(s.match_available){ //Tracevv((stderr,"%c", s->window[s->strstart-1]));
/*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/bflush=trees._tr_tally(s,0,s.window[s.strstart-1]);s.match_available=0;}s.insert=s.strstart<MIN_MATCH-1?s.strstart:MIN_MATCH-1;if(flush===Z_FINISH){ /*** FLUSH_BLOCK(s, 1); ***/flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED;} /***/return BS_FINISH_DONE;}if(s.last_lit){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}return BS_BLOCK_DONE;} /* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */function deflate_rle(s,flush){var bflush; /* set if current block must be flushed */var prev; /* byte at distance one to match */var scan,strend; /* scan goes up to strend for length of run */var _win=s.window;for(;;){ /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */if(s.lookahead<=MAX_MATCH){fill_window(s);if(s.lookahead<=MAX_MATCH&&flush===Z_NO_FLUSH){return BS_NEED_MORE;}if(s.lookahead===0){break;} /* flush the current block */} /* See how many times the previous byte repeats */s.match_length=0;if(s.lookahead>=MIN_MATCH&&s.strstart>0){scan=s.strstart-1;prev=_win[scan];if(prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]){strend=s.strstart+MAX_MATCH;do { /*jshint noempty:false*/}while(prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&scan<strend);s.match_length=MAX_MATCH-(strend-scan);if(s.match_length>s.lookahead){s.match_length=s.lookahead;}} //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
} /* Emit match if have run of MIN_MATCH or longer, else emit literal */if(s.match_length>=MIN_MATCH){ //check_match(s, s.strstart, s.strstart - 1, s.match_length);
/*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/bflush=trees._tr_tally(s,1,s.match_length-MIN_MATCH);s.lookahead-=s.match_length;s.strstart+=s.match_length;s.match_length=0;}else { /* No match, output a literal byte */ //Tracevv((stderr,"%c", s->window[s->strstart]));
/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++;}if(bflush){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}}s.insert=0;if(flush===Z_FINISH){ /*** FLUSH_BLOCK(s, 1); ***/flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED;} /***/return BS_FINISH_DONE;}if(s.last_lit){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}return BS_BLOCK_DONE;} /* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */function deflate_huff(s,flush){var bflush; /* set if current block must be flushed */for(;;){ /* Make sure that we have a literal to write. */if(s.lookahead===0){fill_window(s);if(s.lookahead===0){if(flush===Z_NO_FLUSH){return BS_NEED_MORE;}break; /* flush the current block */}} /* Output a literal byte */s.match_length=0; //Tracevv((stderr,"%c", s->window[s->strstart]));
/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++;if(bflush){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}}s.insert=0;if(flush===Z_FINISH){ /*** FLUSH_BLOCK(s, 1); ***/flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED;} /***/return BS_FINISH_DONE;}if(s.last_lit){ /*** FLUSH_BLOCK(s, 0); ***/flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE;} /***/}return BS_BLOCK_DONE;} /* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */var Config=function Config(good_length,max_lazy,nice_length,max_chain,func){this.good_length=good_length;this.max_lazy=max_lazy;this.nice_length=nice_length;this.max_chain=max_chain;this.func=func;};var configuration_table;configuration_table=[ /*      good lazy nice chain */new Config(0,0,0,0,deflate_stored), /* 0 store only */new Config(4,4,8,4,deflate_fast), /* 1 max speed, no lazy matches */new Config(4,5,16,8,deflate_fast), /* 2 */new Config(4,6,32,32,deflate_fast), /* 3 */new Config(4,4,16,16,deflate_slow), /* 4 lazy matches */new Config(8,16,32,32,deflate_slow), /* 5 */new Config(8,16,128,128,deflate_slow), /* 6 */new Config(8,32,128,256,deflate_slow), /* 7 */new Config(32,128,258,1024,deflate_slow), /* 8 */new Config(32,258,258,4096,deflate_slow) /* 9 max compression */]; /* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */function lm_init(s){s.window_size=2*s.w_size; /*** CLEAR_HASH(s); ***/zero(s.head); // Fill with NIL (= 0);
/* Set the default configuration parameters:
   */s.max_lazy_match=configuration_table[s.level].max_lazy;s.good_match=configuration_table[s.level].good_length;s.nice_match=configuration_table[s.level].nice_length;s.max_chain_length=configuration_table[s.level].max_chain;s.strstart=0;s.block_start=0;s.lookahead=0;s.insert=0;s.match_length=s.prev_length=MIN_MATCH-1;s.match_available=0;s.ins_h=0;}function DeflateState(){this.strm=null; /* pointer back to this zlib stream */this.status=0; /* as the name implies */this.pending_buf=null; /* output still pending */this.pending_buf_size=0; /* size of pending_buf */this.pending_out=0; /* next pending byte to output to the stream */this.pending=0; /* nb of bytes in the pending buffer */this.wrap=0; /* bit 0 true for zlib, bit 1 true for gzip */this.gzhead=null; /* gzip header information to write */this.gzindex=0; /* where in extra, name, or comment */this.method=Z_DEFLATED; /* can only be DEFLATED */this.last_flush=-1; /* value of flush param for previous deflate call */this.w_size=0; /* LZ77 window size (32K by default) */this.w_bits=0; /* log2(w_size)  (8..16) */this.w_mask=0; /* w_size - 1 */this.window=null; /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */this.window_size=0; /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */this.prev=null; /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */this.head=null; /* Heads of the hash chains or NIL. */this.ins_h=0; /* hash index of string to be inserted */this.hash_size=0; /* number of elements in hash table */this.hash_bits=0; /* log2(hash_size) */this.hash_mask=0; /* hash_size-1 */this.hash_shift=0; /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */this.block_start=0; /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */this.match_length=0; /* length of best match */this.prev_match=0; /* previous match */this.match_available=0; /* set if previous match exists */this.strstart=0; /* start of string to insert */this.match_start=0; /* start of matching string */this.lookahead=0; /* number of valid bytes ahead in window */this.prev_length=0; /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */this.max_chain_length=0; /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */this.max_lazy_match=0; /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */ // That's alias to max_lazy_match, don't use directly
//this.max_insert_length = 0;
/* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */this.level=0; /* compression level (1..9) */this.strategy=0; /* favor or force Huffman coding*/this.good_match=0; /* Use a faster search when the previous match is longer than this */this.nice_match=0; /* Stop searching when current match exceeds this */ /* used by trees.c: */ /* Didn't use ct_data typedef below to suppress compiler warning */ // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
// struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
// struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */
// Use flat array of DOUBLE size, with interleaved fata,
// because JS does not support effective
this.dyn_ltree=new utils.Buf16(HEAP_SIZE*2);this.dyn_dtree=new utils.Buf16((2*D_CODES+1)*2);this.bl_tree=new utils.Buf16((2*BL_CODES+1)*2);zero(this.dyn_ltree);zero(this.dyn_dtree);zero(this.bl_tree);this.l_desc=null; /* desc. for literal tree */this.d_desc=null; /* desc. for distance tree */this.bl_desc=null; /* desc. for bit length tree */ //ush bl_count[MAX_BITS+1];
this.bl_count=new utils.Buf16(MAX_BITS+1); /* number of codes at each bit length for an optimal tree */ //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
this.heap=new utils.Buf16(2*L_CODES+1); /* heap used to build the Huffman trees */zero(this.heap);this.heap_len=0; /* number of elements in the heap */this.heap_max=0; /* element of largest frequency */ /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */this.depth=new utils.Buf16(2*L_CODES+1); //uch depth[2*L_CODES+1];
zero(this.depth); /* Depth of each subtree used as tie breaker for trees of equal frequency
   */this.l_buf=0; /* buffer index for literals or lengths */this.lit_bufsize=0; /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */this.last_lit=0; /* running index in l_buf */this.d_buf=0; /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */this.opt_len=0; /* bit length of current block with optimal trees */this.static_len=0; /* bit length of current block with static trees */this.matches=0; /* number of string matches in current block */this.insert=0; /* bytes at end of window left to insert */this.bi_buf=0; /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */this.bi_valid=0; /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */ // Used for window memory init. We safely ignore it for JS. That makes
// sense only for pointers and memory check tools.
//this.high_water = 0;
/* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */}function deflateResetKeep(strm){var s;if(!strm||!strm.state){return err(strm,Z_STREAM_ERROR);}strm.total_in=strm.total_out=0;strm.data_type=Z_UNKNOWN;s=strm.state;s.pending=0;s.pending_out=0;if(s.wrap<0){s.wrap=-s.wrap; /* was made negative by deflate(..., Z_FINISH); */}s.status=s.wrap?INIT_STATE:BUSY_STATE;strm.adler=s.wrap===2?0 // crc32(0, Z_NULL, 0)
:1; // adler32(0, Z_NULL, 0)
s.last_flush=Z_NO_FLUSH;trees._tr_init(s);return Z_OK;}function deflateReset(strm){var ret=deflateResetKeep(strm);if(ret===Z_OK){lm_init(strm.state);}return ret;}function deflateSetHeader(strm,head){if(!strm||!strm.state){return Z_STREAM_ERROR;}if(strm.state.wrap!==2){return Z_STREAM_ERROR;}strm.state.gzhead=head;return Z_OK;}function deflateInit2(strm,level,method,windowBits,memLevel,strategy){if(!strm){ // === Z_NULL
return Z_STREAM_ERROR;}var wrap=1;if(level===Z_DEFAULT_COMPRESSION){level=6;}if(windowBits<0){ /* suppress zlib wrapper */wrap=0;windowBits=-windowBits;}else if(windowBits>15){wrap=2; /* write gzip wrapper instead */windowBits-=16;}if(memLevel<1||memLevel>MAX_MEM_LEVEL||method!==Z_DEFLATED||windowBits<8||windowBits>15||level<0||level>9||strategy<0||strategy>Z_FIXED){return err(strm,Z_STREAM_ERROR);}if(windowBits===8){windowBits=9;} /* until 256-byte window bug fixed */var s=new DeflateState();strm.state=s;s.strm=strm;s.wrap=wrap;s.gzhead=null;s.w_bits=windowBits;s.w_size=1<<s.w_bits;s.w_mask=s.w_size-1;s.hash_bits=memLevel+7;s.hash_size=1<<s.hash_bits;s.hash_mask=s.hash_size-1;s.hash_shift=~ ~((s.hash_bits+MIN_MATCH-1)/MIN_MATCH);s.window=new utils.Buf8(s.w_size*2);s.head=new utils.Buf16(s.hash_size);s.prev=new utils.Buf16(s.w_size); // Don't need mem init magic for JS.
//s.high_water = 0;  /* nothing written to s->window yet */
s.lit_bufsize=1<<memLevel+6; /* 16K elements by default */s.pending_buf_size=s.lit_bufsize*4;s.pending_buf=new utils.Buf8(s.pending_buf_size);s.d_buf=s.lit_bufsize>>1;s.l_buf=(1+2)*s.lit_bufsize;s.level=level;s.strategy=strategy;s.method=method;return deflateReset(strm);}function deflateInit(strm,level){return deflateInit2(strm,level,Z_DEFLATED,MAX_WBITS,DEF_MEM_LEVEL,Z_DEFAULT_STRATEGY);}function deflate(strm,flush){var old_flush,s;var beg,val; // for gzip header write only
if(!strm||!strm.state||flush>Z_BLOCK||flush<0){return strm?err(strm,Z_STREAM_ERROR):Z_STREAM_ERROR;}s=strm.state;if(!strm.output||!strm.input&&strm.avail_in!==0||s.status===FINISH_STATE&&flush!==Z_FINISH){return err(strm,strm.avail_out===0?Z_BUF_ERROR:Z_STREAM_ERROR);}s.strm=strm; /* just in case */old_flush=s.last_flush;s.last_flush=flush; /* Write the header */if(s.status===INIT_STATE){if(s.wrap===2){ // GZIP header
strm.adler=0; //crc32(0L, Z_NULL, 0);
put_byte(s,31);put_byte(s,139);put_byte(s,8);if(!s.gzhead){ // s->gzhead == Z_NULL
put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,s.level===9?2:s.strategy>=Z_HUFFMAN_ONLY||s.level<2?4:0);put_byte(s,OS_CODE);s.status=BUSY_STATE;}else {put_byte(s,(s.gzhead.text?1:0)+(s.gzhead.hcrc?2:0)+(!s.gzhead.extra?0:4)+(!s.gzhead.name?0:8)+(!s.gzhead.comment?0:16));put_byte(s,s.gzhead.time&0xff);put_byte(s,s.gzhead.time>>8&0xff);put_byte(s,s.gzhead.time>>16&0xff);put_byte(s,s.gzhead.time>>24&0xff);put_byte(s,s.level===9?2:s.strategy>=Z_HUFFMAN_ONLY||s.level<2?4:0);put_byte(s,s.gzhead.os&0xff);if(s.gzhead.extra&&s.gzhead.extra.length){put_byte(s,s.gzhead.extra.length&0xff);put_byte(s,s.gzhead.extra.length>>8&0xff);}if(s.gzhead.hcrc){strm.adler=crc32(strm.adler,s.pending_buf,s.pending,0);}s.gzindex=0;s.status=EXTRA_STATE;}}else  // DEFLATE header
{var header=Z_DEFLATED+(s.w_bits-8<<4)<<8;var level_flags=-1;if(s.strategy>=Z_HUFFMAN_ONLY||s.level<2){level_flags=0;}else if(s.level<6){level_flags=1;}else if(s.level===6){level_flags=2;}else {level_flags=3;}header|=level_flags<<6;if(s.strstart!==0){header|=PRESET_DICT;}header+=31-header%31;s.status=BUSY_STATE;putShortMSB(s,header); /* Save the adler32 of the preset dictionary: */if(s.strstart!==0){putShortMSB(s,strm.adler>>>16);putShortMSB(s,strm.adler&0xffff);}strm.adler=1; // adler32(0L, Z_NULL, 0);
}} //#ifdef GZIP
if(s.status===EXTRA_STATE){if(s.gzhead.extra /* != Z_NULL*/){beg=s.pending; /* start of bytes to update crc */while(s.gzindex<(s.gzhead.extra.length&0xffff)){if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg);}flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){break;}}put_byte(s,s.gzhead.extra[s.gzindex]&0xff);s.gzindex++;}if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg);}if(s.gzindex===s.gzhead.extra.length){s.gzindex=0;s.status=NAME_STATE;}}else {s.status=NAME_STATE;}}if(s.status===NAME_STATE){if(s.gzhead.name /* != Z_NULL*/){beg=s.pending; /* start of bytes to update crc */ //int val;
do {if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg);}flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){val=1;break;}} // JS specific: little magic to add zero terminator to end of string
if(s.gzindex<s.gzhead.name.length){val=s.gzhead.name.charCodeAt(s.gzindex++)&0xff;}else {val=0;}put_byte(s,val);}while(val!==0);if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg);}if(val===0){s.gzindex=0;s.status=COMMENT_STATE;}}else {s.status=COMMENT_STATE;}}if(s.status===COMMENT_STATE){if(s.gzhead.comment /* != Z_NULL*/){beg=s.pending; /* start of bytes to update crc */ //int val;
do {if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg);}flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){val=1;break;}} // JS specific: little magic to add zero terminator to end of string
if(s.gzindex<s.gzhead.comment.length){val=s.gzhead.comment.charCodeAt(s.gzindex++)&0xff;}else {val=0;}put_byte(s,val);}while(val!==0);if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg);}if(val===0){s.status=HCRC_STATE;}}else {s.status=HCRC_STATE;}}if(s.status===HCRC_STATE){if(s.gzhead.hcrc){if(s.pending+2>s.pending_buf_size){flush_pending(strm);}if(s.pending+2<=s.pending_buf_size){put_byte(s,strm.adler&0xff);put_byte(s,strm.adler>>8&0xff);strm.adler=0; //crc32(0L, Z_NULL, 0);
s.status=BUSY_STATE;}}else {s.status=BUSY_STATE;}} //#endif
/* Flush as much pending output as possible */if(s.pending!==0){flush_pending(strm);if(strm.avail_out===0){ /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */s.last_flush=-1;return Z_OK;} /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */}else if(strm.avail_in===0&&rank(flush)<=rank(old_flush)&&flush!==Z_FINISH){return err(strm,Z_BUF_ERROR);} /* User must not provide more input after the first FINISH: */if(s.status===FINISH_STATE&&strm.avail_in!==0){return err(strm,Z_BUF_ERROR);} /* Start a new block or continue the current one.
   */if(strm.avail_in!==0||s.lookahead!==0||flush!==Z_NO_FLUSH&&s.status!==FINISH_STATE){var bstate=s.strategy===Z_HUFFMAN_ONLY?deflate_huff(s,flush):s.strategy===Z_RLE?deflate_rle(s,flush):configuration_table[s.level].func(s,flush);if(bstate===BS_FINISH_STARTED||bstate===BS_FINISH_DONE){s.status=FINISH_STATE;}if(bstate===BS_NEED_MORE||bstate===BS_FINISH_STARTED){if(strm.avail_out===0){s.last_flush=-1; /* avoid BUF_ERROR next call, see above */}return Z_OK; /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */}if(bstate===BS_BLOCK_DONE){if(flush===Z_PARTIAL_FLUSH){trees._tr_align(s);}else if(flush!==Z_BLOCK){ /* FULL_FLUSH or SYNC_FLUSH */trees._tr_stored_block(s,0,0,false); /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */if(flush===Z_FULL_FLUSH){ /*** CLEAR_HASH(s); ***/ /* forget history */zero(s.head); // Fill with NIL (= 0);
if(s.lookahead===0){s.strstart=0;s.block_start=0;s.insert=0;}}}flush_pending(strm);if(strm.avail_out===0){s.last_flush=-1; /* avoid BUF_ERROR at next call, see above */return Z_OK;}}} //Assert(strm->avail_out > 0, "bug2");
//if (strm.avail_out <= 0) { throw new Error("bug2");}
if(flush!==Z_FINISH){return Z_OK;}if(s.wrap<=0){return Z_STREAM_END;} /* Write the trailer */if(s.wrap===2){put_byte(s,strm.adler&0xff);put_byte(s,strm.adler>>8&0xff);put_byte(s,strm.adler>>16&0xff);put_byte(s,strm.adler>>24&0xff);put_byte(s,strm.total_in&0xff);put_byte(s,strm.total_in>>8&0xff);put_byte(s,strm.total_in>>16&0xff);put_byte(s,strm.total_in>>24&0xff);}else {putShortMSB(s,strm.adler>>>16);putShortMSB(s,strm.adler&0xffff);}flush_pending(strm); /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */if(s.wrap>0){s.wrap=-s.wrap;} /* write the trailer only once! */return s.pending!==0?Z_OK:Z_STREAM_END;}function deflateEnd(strm){var status;if(!strm /*== Z_NULL*/||!strm.state /*== Z_NULL*/){return Z_STREAM_ERROR;}status=strm.state.status;if(status!==INIT_STATE&&status!==EXTRA_STATE&&status!==NAME_STATE&&status!==COMMENT_STATE&&status!==HCRC_STATE&&status!==BUSY_STATE&&status!==FINISH_STATE){return err(strm,Z_STREAM_ERROR);}strm.state=null;return status===BUSY_STATE?err(strm,Z_DATA_ERROR):Z_OK;} /* =========================================================================
 * Copy the source state to the destination state
 */ //function deflateCopy(dest, source) {
//
//}
exports.deflateInit=deflateInit;exports.deflateInit2=deflateInit2;exports.deflateReset=deflateReset;exports.deflateResetKeep=deflateResetKeep;exports.deflateSetHeader=deflateSetHeader;exports.deflate=deflate;exports.deflateEnd=deflateEnd;exports.deflateInfo='pako deflate (from Nodeca project)'; /* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/},{"../utils/common":44,"./adler32":45,"./crc32":47,"./messages":52,"./trees":53}],49:[function(require,module,exports){'use strict'; // See state defs from inflate.js
var BAD=30; /* got a data error -- remain here until reset */var TYPE=12; /* i: waiting for type bits, including last-flag bit */ /*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */module.exports=function inflate_fast(strm,start){var state;var _in; /* local strm.input */var last; /* have enough input while in < last */var _out; /* local strm.output */var beg; /* inflate()'s initial strm.output */var end; /* while out < end, enough space available */ //#ifdef INFLATE_STRICT
var dmax; /* maximum distance from zlib header */ //#endif
var wsize; /* window size or zero if not using window */var whave; /* valid bytes in the window */var wnext; /* window write index */ // Use `s_window` instead `window`, avoid conflict with instrumentation tools
var s_window; /* allocated sliding window, if wsize != 0 */var hold; /* local strm.hold */var bits; /* local strm.bits */var lcode; /* local strm.lencode */var dcode; /* local strm.distcode */var lmask; /* mask for first level of length codes */var dmask; /* mask for first level of distance codes */var here; /* retrieved table entry */var op; /* code bits, operation, extra bits, or */ /*  window position, window bytes to copy */var len; /* match length, unused bytes */var dist; /* match distance */var from; /* where to copy match from */var from_source;var input,output; // JS specific, because we have no pointers
/* copy state to local variables */state=strm.state; //here = state.here;
_in=strm.next_in;input=strm.input;last=_in+(strm.avail_in-5);_out=strm.next_out;output=strm.output;beg=_out-(start-strm.avail_out);end=_out+(strm.avail_out-257); //#ifdef INFLATE_STRICT
dmax=state.dmax; //#endif
wsize=state.wsize;whave=state.whave;wnext=state.wnext;s_window=state.window;hold=state.hold;bits=state.bits;lcode=state.lencode;dcode=state.distcode;lmask=(1<<state.lenbits)-1;dmask=(1<<state.distbits)-1; /* decode literals and length/distances until end-of-block or not enough
     input data or output space */top: do {if(bits<15){hold+=input[_in++]<<bits;bits+=8;hold+=input[_in++]<<bits;bits+=8;}here=lcode[hold&lmask];dolen: for(;;){ // Goto emulation
op=here>>>24 /*here.bits*/;hold>>>=op;bits-=op;op=here>>>16&0xff /*here.op*/;if(op===0){ /* literal */ //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
//        "inflate:         literal '%c'\n" :
//        "inflate:         literal 0x%02x\n", here.val));
output[_out++]=here&0xffff /*here.val*/;}else if(op&16){ /* length base */len=here&0xffff /*here.val*/;op&=15; /* number of extra bits */if(op){if(bits<op){hold+=input[_in++]<<bits;bits+=8;}len+=hold&(1<<op)-1;hold>>>=op;bits-=op;} //Tracevv((stderr, "inflate:         length %u\n", len));
if(bits<15){hold+=input[_in++]<<bits;bits+=8;hold+=input[_in++]<<bits;bits+=8;}here=dcode[hold&dmask];dodist: for(;;){ // goto emulation
op=here>>>24 /*here.bits*/;hold>>>=op;bits-=op;op=here>>>16&0xff /*here.op*/;if(op&16){ /* distance base */dist=here&0xffff /*here.val*/;op&=15; /* number of extra bits */if(bits<op){hold+=input[_in++]<<bits;bits+=8;if(bits<op){hold+=input[_in++]<<bits;bits+=8;}}dist+=hold&(1<<op)-1; //#ifdef INFLATE_STRICT
if(dist>dmax){strm.msg='invalid distance too far back';state.mode=BAD;break top;} //#endif
hold>>>=op;bits-=op; //Tracevv((stderr, "inflate:         distance %u\n", dist));
op=_out-beg; /* max distance in output */if(dist>op){ /* see if copy from window */op=dist-op; /* distance back in window */if(op>whave){if(state.sane){strm.msg='invalid distance too far back';state.mode=BAD;break top;} // (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
}from=0; // window index
from_source=s_window;if(wnext===0){ /* very common case */from+=wsize-op;if(op<len){ /* some from window */len-=op;do {output[_out++]=s_window[from++];}while(--op);from=_out-dist; /* rest from output */from_source=output;}}else if(wnext<op){ /* wrap around window */from+=wsize+wnext-op;op-=wnext;if(op<len){ /* some from end of window */len-=op;do {output[_out++]=s_window[from++];}while(--op);from=0;if(wnext<len){ /* some from start of window */op=wnext;len-=op;do {output[_out++]=s_window[from++];}while(--op);from=_out-dist; /* rest from output */from_source=output;}}}else { /* contiguous in window */from+=wnext-op;if(op<len){ /* some from window */len-=op;do {output[_out++]=s_window[from++];}while(--op);from=_out-dist; /* rest from output */from_source=output;}}while(len>2){output[_out++]=from_source[from++];output[_out++]=from_source[from++];output[_out++]=from_source[from++];len-=3;}if(len){output[_out++]=from_source[from++];if(len>1){output[_out++]=from_source[from++];}}}else {from=_out-dist; /* copy direct from output */do { /* minimum length is three */output[_out++]=output[from++];output[_out++]=output[from++];output[_out++]=output[from++];len-=3;}while(len>2);if(len){output[_out++]=output[from++];if(len>1){output[_out++]=output[from++];}}}}else if((op&64)===0){ /* 2nd level distance code */here=dcode[(here&0xffff)+( /*here.val*/hold&(1<<op)-1)];continue dodist;}else {strm.msg='invalid distance code';state.mode=BAD;break top;}break; // need to emulate goto via "continue"
}}else if((op&64)===0){ /* 2nd level length code */here=lcode[(here&0xffff)+( /*here.val*/hold&(1<<op)-1)];continue dolen;}else if(op&32){ /* end-of-block */ //Tracevv((stderr, "inflate:         end of block\n"));
state.mode=TYPE;break top;}else {strm.msg='invalid literal/length code';state.mode=BAD;break top;}break; // need to emulate goto via "continue"
}}while(_in<last&&_out<end); /* return unused bytes (on entry, bits < 8, so in won't go too far back) */len=bits>>3;_in-=len;bits-=len<<3;hold&=(1<<bits)-1; /* update state and return */strm.next_in=_in;strm.next_out=_out;strm.avail_in=_in<last?5+(last-_in):5-(_in-last);strm.avail_out=_out<end?257+(end-_out):257-(_out-end);state.hold=hold;state.bits=bits;return;};},{}],50:[function(require,module,exports){'use strict';var utils=require('../utils/common');var adler32=require('./adler32');var crc32=require('./crc32');var inflate_fast=require('./inffast');var inflate_table=require('./inftrees');var CODES=0;var LENS=1;var DISTS=2; /* Public constants ==========================================================*/ /* ===========================================================================*/ /* Allowed flush values; see deflate() and inflate() below for details */ //var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH=4;var Z_BLOCK=5;var Z_TREES=6; /* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */var Z_OK=0;var Z_STREAM_END=1;var Z_NEED_DICT=2; //var Z_ERRNO         = -1;
var Z_STREAM_ERROR=-2;var Z_DATA_ERROR=-3;var Z_MEM_ERROR=-4;var Z_BUF_ERROR=-5; //var Z_VERSION_ERROR = -6;
/* The deflate compression method */var Z_DEFLATED=8; /* STATES ====================================================================*/ /* ===========================================================================*/var HEAD=1; /* i: waiting for magic header */var FLAGS=2; /* i: waiting for method and flags (gzip) */var TIME=3; /* i: waiting for modification time (gzip) */var OS=4; /* i: waiting for extra flags and operating system (gzip) */var EXLEN=5; /* i: waiting for extra length (gzip) */var EXTRA=6; /* i: waiting for extra bytes (gzip) */var NAME=7; /* i: waiting for end of file name (gzip) */var COMMENT=8; /* i: waiting for end of comment (gzip) */var HCRC=9; /* i: waiting for header crc (gzip) */var DICTID=10; /* i: waiting for dictionary check value */var DICT=11; /* waiting for inflateSetDictionary() call */var TYPE=12; /* i: waiting for type bits, including last-flag bit */var TYPEDO=13; /* i: same, but skip check to exit inflate on new block */var STORED=14; /* i: waiting for stored size (length and complement) */var COPY_=15; /* i/o: same as COPY below, but only first time in */var COPY=16; /* i/o: waiting for input or output to copy stored block */var TABLE=17; /* i: waiting for dynamic block table lengths */var LENLENS=18; /* i: waiting for code length code lengths */var CODELENS=19; /* i: waiting for length/lit and distance code lengths */var LEN_=20; /* i: same as LEN below, but only first time in */var LEN=21; /* i: waiting for length/lit/eob code */var LENEXT=22; /* i: waiting for length extra bits */var DIST=23; /* i: waiting for distance code */var DISTEXT=24; /* i: waiting for distance extra bits */var MATCH=25; /* o: waiting for output space to copy string */var LIT=26; /* o: waiting for output space to write literal */var CHECK=27; /* i: waiting for 32-bit check value */var LENGTH=28; /* i: waiting for 32-bit length (gzip) */var DONE=29; /* finished check, done -- remain here until reset */var BAD=30; /* got a data error -- remain here until reset */var MEM=31; /* got an inflate() memory error -- remain here until reset */var SYNC=32; /* looking for synchronization bytes to restart inflate() */ /* ===========================================================================*/var ENOUGH_LENS=852;var ENOUGH_DISTS=592; //var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);
var MAX_WBITS=15; /* 32K LZ77 window */var DEF_WBITS=MAX_WBITS;function ZSWAP32(q){return (q>>>24&0xff)+(q>>>8&0xff00)+((q&0xff00)<<8)+((q&0xff)<<24);}function InflateState(){this.mode=0; /* current inflate mode */this.last=false; /* true if processing last block */this.wrap=0; /* bit 0 true for zlib, bit 1 true for gzip */this.havedict=false; /* true if dictionary provided */this.flags=0; /* gzip header method and flags (0 if zlib) */this.dmax=0; /* zlib header max distance (INFLATE_STRICT) */this.check=0; /* protected copy of check value */this.total=0; /* protected copy of output count */ // TODO: may be {}
this.head=null; /* where to save gzip header information */ /* sliding window */this.wbits=0; /* log base 2 of requested window size */this.wsize=0; /* window size or zero if not using window */this.whave=0; /* valid bytes in the window */this.wnext=0; /* window write index */this.window=null; /* allocated sliding window, if needed */ /* bit accumulator */this.hold=0; /* input bit accumulator */this.bits=0; /* number of bits in "in" */ /* for string and stored block copying */this.length=0; /* literal or length of data to copy */this.offset=0; /* distance back to copy string from */ /* for table and code decoding */this.extra=0; /* extra bits needed */ /* fixed and dynamic code tables */this.lencode=null; /* starting table for length/literal codes */this.distcode=null; /* starting table for distance codes */this.lenbits=0; /* index bits for lencode */this.distbits=0; /* index bits for distcode */ /* dynamic table building */this.ncode=0; /* number of code length code lengths */this.nlen=0; /* number of length code lengths */this.ndist=0; /* number of distance code lengths */this.have=0; /* number of code lengths in lens[] */this.next=null; /* next available space in codes[] */this.lens=new utils.Buf16(320); /* temporary storage for code lengths */this.work=new utils.Buf16(288); /* work area for code table building */ /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */ //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
this.lendyn=null; /* dynamic table for length/literal codes (JS specific) */this.distdyn=null; /* dynamic table for distance codes (JS specific) */this.sane=0; /* if false, allow invalid distance too far */this.back=0; /* bits back of last unprocessed length/lit */this.was=0; /* initial length of match */}function inflateResetKeep(strm){var state;if(!strm||!strm.state){return Z_STREAM_ERROR;}state=strm.state;strm.total_in=strm.total_out=state.total=0;strm.msg=''; /*Z_NULL*/if(state.wrap){ /* to support ill-conceived Java test suite */strm.adler=state.wrap&1;}state.mode=HEAD;state.last=0;state.havedict=0;state.dmax=32768;state.head=null /*Z_NULL*/;state.hold=0;state.bits=0; //state.lencode = state.distcode = state.next = state.codes;
state.lencode=state.lendyn=new utils.Buf32(ENOUGH_LENS);state.distcode=state.distdyn=new utils.Buf32(ENOUGH_DISTS);state.sane=1;state.back=-1; //Tracev((stderr, "inflate: reset\n"));
return Z_OK;}function inflateReset(strm){var state;if(!strm||!strm.state){return Z_STREAM_ERROR;}state=strm.state;state.wsize=0;state.whave=0;state.wnext=0;return inflateResetKeep(strm);}function inflateReset2(strm,windowBits){var wrap;var state; /* get the state */if(!strm||!strm.state){return Z_STREAM_ERROR;}state=strm.state; /* extract wrap request from windowBits parameter */if(windowBits<0){wrap=0;windowBits=-windowBits;}else {wrap=(windowBits>>4)+1;if(windowBits<48){windowBits&=15;}} /* set number of window bits, free window if different */if(windowBits&&(windowBits<8||windowBits>15)){return Z_STREAM_ERROR;}if(state.window!==null&&state.wbits!==windowBits){state.window=null;} /* update state and reset the rest of it */state.wrap=wrap;state.wbits=windowBits;return inflateReset(strm);}function inflateInit2(strm,windowBits){var ret;var state;if(!strm){return Z_STREAM_ERROR;} //strm.msg = Z_NULL;                 /* in case we return an error */
state=new InflateState(); //if (state === Z_NULL) return Z_MEM_ERROR;
//Tracev((stderr, "inflate: allocated\n"));
strm.state=state;state.window=null /*Z_NULL*/;ret=inflateReset2(strm,windowBits);if(ret!==Z_OK){strm.state=null /*Z_NULL*/;}return ret;}function inflateInit(strm){return inflateInit2(strm,DEF_WBITS);} /*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */var virgin=true;var lenfix,distfix; // We have no pointers in JS, so keep tables separate
function fixedtables(state){ /* build fixed huffman tables if first call (may not be thread safe) */if(virgin){var sym;lenfix=new utils.Buf32(512);distfix=new utils.Buf32(32); /* literal/length table */sym=0;while(sym<144){state.lens[sym++]=8;}while(sym<256){state.lens[sym++]=9;}while(sym<280){state.lens[sym++]=7;}while(sym<288){state.lens[sym++]=8;}inflate_table(LENS,state.lens,0,288,lenfix,0,state.work,{bits:9}); /* distance table */sym=0;while(sym<32){state.lens[sym++]=5;}inflate_table(DISTS,state.lens,0,32,distfix,0,state.work,{bits:5}); /* do this just once */virgin=false;}state.lencode=lenfix;state.lenbits=9;state.distcode=distfix;state.distbits=5;} /*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */function updatewindow(strm,src,end,copy){var dist;var state=strm.state; /* if it hasn't been done already, allocate space for the window */if(state.window===null){state.wsize=1<<state.wbits;state.wnext=0;state.whave=0;state.window=new utils.Buf8(state.wsize);} /* copy state->wsize or less output bytes into the circular window */if(copy>=state.wsize){utils.arraySet(state.window,src,end-state.wsize,state.wsize,0);state.wnext=0;state.whave=state.wsize;}else {dist=state.wsize-state.wnext;if(dist>copy){dist=copy;} //zmemcpy(state->window + state->wnext, end - copy, dist);
utils.arraySet(state.window,src,end-copy,dist,state.wnext);copy-=dist;if(copy){ //zmemcpy(state->window, end - copy, copy);
utils.arraySet(state.window,src,end-copy,copy,0);state.wnext=copy;state.whave=state.wsize;}else {state.wnext+=dist;if(state.wnext===state.wsize){state.wnext=0;}if(state.whave<state.wsize){state.whave+=dist;}}}return 0;}function inflate(strm,flush){var state;var input,output; // input/output buffers
var next; /* next input INDEX */var put; /* next output INDEX */var have,left; /* available input and output */var hold; /* bit buffer */var bits; /* bits in bit buffer */var _in,_out; /* save starting available input and output */var copy; /* number of stored or match bytes to copy */var from; /* where to copy match bytes from */var from_source;var here=0; /* current decoding table entry */var here_bits,here_op,here_val; // paked "here" denormalized (JS specific)
//var last;                   /* parent table entry */
var last_bits,last_op,last_val; // paked "last" denormalized (JS specific)
var len; /* length to copy for repeats, bits to drop */var ret; /* return code */var hbuf=new utils.Buf8(4); /* buffer for gzip header crc calculation */var opts;var n; // temporary var for NEED_BITS
var order= /* permutation of code lengths */[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!strm||!strm.state||!strm.output||!strm.input&&strm.avail_in!==0){return Z_STREAM_ERROR;}state=strm.state;if(state.mode===TYPE){state.mode=TYPEDO;} /* skip check */ //--- LOAD() ---
put=strm.next_out;output=strm.output;left=strm.avail_out;next=strm.next_in;input=strm.input;have=strm.avail_in;hold=state.hold;bits=state.bits; //---
_in=have;_out=left;ret=Z_OK;inf_leave:  // goto emulation
for(;;){switch(state.mode){case HEAD:if(state.wrap===0){state.mode=TYPEDO;break;} //=== NEEDBITS(16);
while(bits<16){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
if(state.wrap&2&&hold===0x8b1f){ /* gzip header */state.check=0 /*crc32(0L, Z_NULL, 0)*/; //=== CRC2(state.check, hold);
hbuf[0]=hold&0xff;hbuf[1]=hold>>>8&0xff;state.check=crc32(state.check,hbuf,2,0); //===//
//=== INITBITS();
hold=0;bits=0; //===//
state.mode=FLAGS;break;}state.flags=0; /* expect zlib header */if(state.head){state.head.done=false;}if(!(state.wrap&1)|| /* check if zlib header allowed */(((hold&0xff)<< /*BITS(8)*/8)+(hold>>8))%31){strm.msg='incorrect header check';state.mode=BAD;break;}if((hold&0x0f)!== /*BITS(4)*/Z_DEFLATED){strm.msg='unknown compression method';state.mode=BAD;break;} //--- DROPBITS(4) ---//
hold>>>=4;bits-=4; //---//
len=(hold&0x0f)+ /*BITS(4)*/8;if(state.wbits===0){state.wbits=len;}else if(len>state.wbits){strm.msg='invalid window size';state.mode=BAD;break;}state.dmax=1<<len; //Tracev((stderr, "inflate:   zlib header ok\n"));
strm.adler=state.check=1 /*adler32(0L, Z_NULL, 0)*/;state.mode=hold&0x200?DICTID:TYPE; //=== INITBITS();
hold=0;bits=0; //===//
break;case FLAGS: //=== NEEDBITS(16); */
while(bits<16){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
state.flags=hold;if((state.flags&0xff)!==Z_DEFLATED){strm.msg='unknown compression method';state.mode=BAD;break;}if(state.flags&0xe000){strm.msg='unknown header flags set';state.mode=BAD;break;}if(state.head){state.head.text=hold>>8&1;}if(state.flags&0x0200){ //=== CRC2(state.check, hold);
hbuf[0]=hold&0xff;hbuf[1]=hold>>>8&0xff;state.check=crc32(state.check,hbuf,2,0); //===//
} //=== INITBITS();
hold=0;bits=0; //===//
state.mode=TIME; /* falls through */case TIME: //=== NEEDBITS(32); */
while(bits<32){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
if(state.head){state.head.time=hold;}if(state.flags&0x0200){ //=== CRC4(state.check, hold)
hbuf[0]=hold&0xff;hbuf[1]=hold>>>8&0xff;hbuf[2]=hold>>>16&0xff;hbuf[3]=hold>>>24&0xff;state.check=crc32(state.check,hbuf,4,0); //===
} //=== INITBITS();
hold=0;bits=0; //===//
state.mode=OS; /* falls through */case OS: //=== NEEDBITS(16); */
while(bits<16){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
if(state.head){state.head.xflags=hold&0xff;state.head.os=hold>>8;}if(state.flags&0x0200){ //=== CRC2(state.check, hold);
hbuf[0]=hold&0xff;hbuf[1]=hold>>>8&0xff;state.check=crc32(state.check,hbuf,2,0); //===//
} //=== INITBITS();
hold=0;bits=0; //===//
state.mode=EXLEN; /* falls through */case EXLEN:if(state.flags&0x0400){ //=== NEEDBITS(16); */
while(bits<16){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
state.length=hold;if(state.head){state.head.extra_len=hold;}if(state.flags&0x0200){ //=== CRC2(state.check, hold);
hbuf[0]=hold&0xff;hbuf[1]=hold>>>8&0xff;state.check=crc32(state.check,hbuf,2,0); //===//
} //=== INITBITS();
hold=0;bits=0; //===//
}else if(state.head){state.head.extra=null /*Z_NULL*/;}state.mode=EXTRA; /* falls through */case EXTRA:if(state.flags&0x0400){copy=state.length;if(copy>have){copy=have;}if(copy){if(state.head){len=state.head.extra_len-state.length;if(!state.head.extra){ // Use untyped array for more conveniend processing later
state.head.extra=new Array(state.head.extra_len);}utils.arraySet(state.head.extra,input,next, // extra field is limited to 65536 bytes
// - no need for additional size check
copy, /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/len); //zmemcpy(state.head.extra + len, next,
//        len + copy > state.head.extra_max ?
//        state.head.extra_max - len : copy);
}if(state.flags&0x0200){state.check=crc32(state.check,input,copy,next);}have-=copy;next+=copy;state.length-=copy;}if(state.length){break inf_leave;}}state.length=0;state.mode=NAME; /* falls through */case NAME:if(state.flags&0x0800){if(have===0){break inf_leave;}copy=0;do { // TODO: 2 or 1 bytes?
len=input[next+copy++]; /* use constant limit because in js we should not preallocate memory */if(state.head&&len&&state.length<65536 /*state.head.name_max*/){state.head.name+=String.fromCharCode(len);}}while(len&&copy<have);if(state.flags&0x0200){state.check=crc32(state.check,input,copy,next);}have-=copy;next+=copy;if(len){break inf_leave;}}else if(state.head){state.head.name=null;}state.length=0;state.mode=COMMENT; /* falls through */case COMMENT:if(state.flags&0x1000){if(have===0){break inf_leave;}copy=0;do {len=input[next+copy++]; /* use constant limit because in js we should not preallocate memory */if(state.head&&len&&state.length<65536 /*state.head.comm_max*/){state.head.comment+=String.fromCharCode(len);}}while(len&&copy<have);if(state.flags&0x0200){state.check=crc32(state.check,input,copy,next);}have-=copy;next+=copy;if(len){break inf_leave;}}else if(state.head){state.head.comment=null;}state.mode=HCRC; /* falls through */case HCRC:if(state.flags&0x0200){ //=== NEEDBITS(16); */
while(bits<16){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
if(hold!==(state.check&0xffff)){strm.msg='header crc mismatch';state.mode=BAD;break;} //=== INITBITS();
hold=0;bits=0; //===//
}if(state.head){state.head.hcrc=state.flags>>9&1;state.head.done=true;}strm.adler=state.check=0 /*crc32(0L, Z_NULL, 0)*/;state.mode=TYPE;break;case DICTID: //=== NEEDBITS(32); */
while(bits<32){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
strm.adler=state.check=ZSWAP32(hold); //=== INITBITS();
hold=0;bits=0; //===//
state.mode=DICT; /* falls through */case DICT:if(state.havedict===0){ //--- RESTORE() ---
strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits; //---
return Z_NEED_DICT;}strm.adler=state.check=1 /*adler32(0L, Z_NULL, 0)*/;state.mode=TYPE; /* falls through */case TYPE:if(flush===Z_BLOCK||flush===Z_TREES){break inf_leave;} /* falls through */case TYPEDO:if(state.last){ //--- BYTEBITS() ---//
hold>>>=bits&7;bits-=bits&7; //---//
state.mode=CHECK;break;} //=== NEEDBITS(3); */
while(bits<3){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
state.last=hold&0x01 /*BITS(1)*/; //--- DROPBITS(1) ---//
hold>>>=1;bits-=1; //---//
switch(hold&0x03){ /*BITS(2)*/case 0: /* stored block */ //Tracev((stderr, "inflate:     stored block%s\n",
//        state.last ? " (last)" : ""));
state.mode=STORED;break;case 1: /* fixed block */fixedtables(state); //Tracev((stderr, "inflate:     fixed codes block%s\n",
//        state.last ? " (last)" : ""));
state.mode=LEN_; /* decode codes */if(flush===Z_TREES){ //--- DROPBITS(2) ---//
hold>>>=2;bits-=2; //---//
break inf_leave;}break;case 2: /* dynamic block */ //Tracev((stderr, "inflate:     dynamic codes block%s\n",
//        state.last ? " (last)" : ""));
state.mode=TABLE;break;case 3:strm.msg='invalid block type';state.mode=BAD;} //--- DROPBITS(2) ---//
hold>>>=2;bits-=2; //---//
break;case STORED: //--- BYTEBITS() ---// /* go to byte boundary */
hold>>>=bits&7;bits-=bits&7; //---//
//=== NEEDBITS(32); */
while(bits<32){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
if((hold&0xffff)!==(hold>>>16^0xffff)){strm.msg='invalid stored block lengths';state.mode=BAD;break;}state.length=hold&0xffff; //Tracev((stderr, "inflate:       stored length %u\n",
//        state.length));
//=== INITBITS();
hold=0;bits=0; //===//
state.mode=COPY_;if(flush===Z_TREES){break inf_leave;} /* falls through */case COPY_:state.mode=COPY; /* falls through */case COPY:copy=state.length;if(copy){if(copy>have){copy=have;}if(copy>left){copy=left;}if(copy===0){break inf_leave;} //--- zmemcpy(put, next, copy); ---
utils.arraySet(output,input,next,copy,put); //---//
have-=copy;next+=copy;left-=copy;put+=copy;state.length-=copy;break;} //Tracev((stderr, "inflate:       stored end\n"));
state.mode=TYPE;break;case TABLE: //=== NEEDBITS(14); */
while(bits<14){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
state.nlen=(hold&0x1f)+ /*BITS(5)*/257; //--- DROPBITS(5) ---//
hold>>>=5;bits-=5; //---//
state.ndist=(hold&0x1f)+ /*BITS(5)*/1; //--- DROPBITS(5) ---//
hold>>>=5;bits-=5; //---//
state.ncode=(hold&0x0f)+ /*BITS(4)*/4; //--- DROPBITS(4) ---//
hold>>>=4;bits-=4; //---//
//#ifndef PKZIP_BUG_WORKAROUND
if(state.nlen>286||state.ndist>30){strm.msg='too many length or distance symbols';state.mode=BAD;break;} //#endif
//Tracev((stderr, "inflate:       table sizes ok\n"));
state.have=0;state.mode=LENLENS; /* falls through */case LENLENS:while(state.have<state.ncode){ //=== NEEDBITS(3);
while(bits<3){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
state.lens[order[state.have++]]=hold&0x07; //BITS(3);
//--- DROPBITS(3) ---//
hold>>>=3;bits-=3; //---//
}while(state.have<19){state.lens[order[state.have++]]=0;} // We have separate tables & no pointers. 2 commented lines below not needed.
//state.next = state.codes;
//state.lencode = state.next;
// Switch to use dynamic table
state.lencode=state.lendyn;state.lenbits=7;opts={bits:state.lenbits};ret=inflate_table(CODES,state.lens,0,19,state.lencode,0,state.work,opts);state.lenbits=opts.bits;if(ret){strm.msg='invalid code lengths set';state.mode=BAD;break;} //Tracev((stderr, "inflate:       code lengths ok\n"));
state.have=0;state.mode=CODELENS; /* falls through */case CODELENS:while(state.have<state.nlen+state.ndist){for(;;){here=state.lencode[hold&(1<<state.lenbits)-1]; /*BITS(state.lenbits)*/here_bits=here>>>24;here_op=here>>>16&0xff;here_val=here&0xffff;if(here_bits<=bits){break;} //--- PULLBYTE() ---//
if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8; //---//
}if(here_val<16){ //--- DROPBITS(here.bits) ---//
hold>>>=here_bits;bits-=here_bits; //---//
state.lens[state.have++]=here_val;}else {if(here_val===16){ //=== NEEDBITS(here.bits + 2);
n=here_bits+2;while(bits<n){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
//--- DROPBITS(here.bits) ---//
hold>>>=here_bits;bits-=here_bits; //---//
if(state.have===0){strm.msg='invalid bit length repeat';state.mode=BAD;break;}len=state.lens[state.have-1];copy=3+(hold&0x03); //BITS(2);
//--- DROPBITS(2) ---//
hold>>>=2;bits-=2; //---//
}else if(here_val===17){ //=== NEEDBITS(here.bits + 3);
n=here_bits+3;while(bits<n){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
//--- DROPBITS(here.bits) ---//
hold>>>=here_bits;bits-=here_bits; //---//
len=0;copy=3+(hold&0x07); //BITS(3);
//--- DROPBITS(3) ---//
hold>>>=3;bits-=3; //---//
}else { //=== NEEDBITS(here.bits + 7);
n=here_bits+7;while(bits<n){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
//--- DROPBITS(here.bits) ---//
hold>>>=here_bits;bits-=here_bits; //---//
len=0;copy=11+(hold&0x7f); //BITS(7);
//--- DROPBITS(7) ---//
hold>>>=7;bits-=7; //---//
}if(state.have+copy>state.nlen+state.ndist){strm.msg='invalid bit length repeat';state.mode=BAD;break;}while(copy--){state.lens[state.have++]=len;}}} /* handle error breaks in while */if(state.mode===BAD){break;} /* check for end-of-block code (better have one) */if(state.lens[256]===0){strm.msg='invalid code -- missing end-of-block';state.mode=BAD;break;} /* build code tables -- note: do not change the lenbits or distbits
         values here (9 and 6) without reading the comments in inftrees.h
         concerning the ENOUGH constants, which depend on those values */state.lenbits=9;opts={bits:state.lenbits};ret=inflate_table(LENS,state.lens,0,state.nlen,state.lencode,0,state.work,opts); // We have separate tables & no pointers. 2 commented lines below not needed.
// state.next_index = opts.table_index;
state.lenbits=opts.bits; // state.lencode = state.next;
if(ret){strm.msg='invalid literal/lengths set';state.mode=BAD;break;}state.distbits=6; //state.distcode.copy(state.codes);
// Switch to use dynamic table
state.distcode=state.distdyn;opts={bits:state.distbits};ret=inflate_table(DISTS,state.lens,state.nlen,state.ndist,state.distcode,0,state.work,opts); // We have separate tables & no pointers. 2 commented lines below not needed.
// state.next_index = opts.table_index;
state.distbits=opts.bits; // state.distcode = state.next;
if(ret){strm.msg='invalid distances set';state.mode=BAD;break;} //Tracev((stderr, 'inflate:       codes ok\n'));
state.mode=LEN_;if(flush===Z_TREES){break inf_leave;} /* falls through */case LEN_:state.mode=LEN; /* falls through */case LEN:if(have>=6&&left>=258){ //--- RESTORE() ---
strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits; //---
inflate_fast(strm,_out); //--- LOAD() ---
put=strm.next_out;output=strm.output;left=strm.avail_out;next=strm.next_in;input=strm.input;have=strm.avail_in;hold=state.hold;bits=state.bits; //---
if(state.mode===TYPE){state.back=-1;}break;}state.back=0;for(;;){here=state.lencode[hold&(1<<state.lenbits)-1]; /*BITS(state.lenbits)*/here_bits=here>>>24;here_op=here>>>16&0xff;here_val=here&0xffff;if(here_bits<=bits){break;} //--- PULLBYTE() ---//
if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8; //---//
}if(here_op&&(here_op&0xf0)===0){last_bits=here_bits;last_op=here_op;last_val=here_val;for(;;){here=state.lencode[last_val+((hold&(1<<last_bits+last_op)-1)>> /*BITS(last.bits + last.op)*/last_bits)];here_bits=here>>>24;here_op=here>>>16&0xff;here_val=here&0xffff;if(last_bits+here_bits<=bits){break;} //--- PULLBYTE() ---//
if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8; //---//
} //--- DROPBITS(last.bits) ---//
hold>>>=last_bits;bits-=last_bits; //---//
state.back+=last_bits;} //--- DROPBITS(here.bits) ---//
hold>>>=here_bits;bits-=here_bits; //---//
state.back+=here_bits;state.length=here_val;if(here_op===0){ //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
//        "inflate:         literal '%c'\n" :
//        "inflate:         literal 0x%02x\n", here.val));
state.mode=LIT;break;}if(here_op&32){ //Tracevv((stderr, "inflate:         end of block\n"));
state.back=-1;state.mode=TYPE;break;}if(here_op&64){strm.msg='invalid literal/length code';state.mode=BAD;break;}state.extra=here_op&15;state.mode=LENEXT; /* falls through */case LENEXT:if(state.extra){ //=== NEEDBITS(state.extra);
n=state.extra;while(bits<n){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
state.length+=hold&(1<<state.extra)-1 /*BITS(state.extra)*/; //--- DROPBITS(state.extra) ---//
hold>>>=state.extra;bits-=state.extra; //---//
state.back+=state.extra;} //Tracevv((stderr, "inflate:         length %u\n", state.length));
state.was=state.length;state.mode=DIST; /* falls through */case DIST:for(;;){here=state.distcode[hold&(1<<state.distbits)-1]; /*BITS(state.distbits)*/here_bits=here>>>24;here_op=here>>>16&0xff;here_val=here&0xffff;if(here_bits<=bits){break;} //--- PULLBYTE() ---//
if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8; //---//
}if((here_op&0xf0)===0){last_bits=here_bits;last_op=here_op;last_val=here_val;for(;;){here=state.distcode[last_val+((hold&(1<<last_bits+last_op)-1)>> /*BITS(last.bits + last.op)*/last_bits)];here_bits=here>>>24;here_op=here>>>16&0xff;here_val=here&0xffff;if(last_bits+here_bits<=bits){break;} //--- PULLBYTE() ---//
if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8; //---//
} //--- DROPBITS(last.bits) ---//
hold>>>=last_bits;bits-=last_bits; //---//
state.back+=last_bits;} //--- DROPBITS(here.bits) ---//
hold>>>=here_bits;bits-=here_bits; //---//
state.back+=here_bits;if(here_op&64){strm.msg='invalid distance code';state.mode=BAD;break;}state.offset=here_val;state.extra=here_op&15;state.mode=DISTEXT; /* falls through */case DISTEXT:if(state.extra){ //=== NEEDBITS(state.extra);
n=state.extra;while(bits<n){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
state.offset+=hold&(1<<state.extra)-1 /*BITS(state.extra)*/; //--- DROPBITS(state.extra) ---//
hold>>>=state.extra;bits-=state.extra; //---//
state.back+=state.extra;} //#ifdef INFLATE_STRICT
if(state.offset>state.dmax){strm.msg='invalid distance too far back';state.mode=BAD;break;} //#endif
//Tracevv((stderr, "inflate:         distance %u\n", state.offset));
state.mode=MATCH; /* falls through */case MATCH:if(left===0){break inf_leave;}copy=_out-left;if(state.offset>copy){ /* copy from window */copy=state.offset-copy;if(copy>state.whave){if(state.sane){strm.msg='invalid distance too far back';state.mode=BAD;break;} // (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
}if(copy>state.wnext){copy-=state.wnext;from=state.wsize-copy;}else {from=state.wnext-copy;}if(copy>state.length){copy=state.length;}from_source=state.window;}else { /* copy from output */from_source=output;from=put-state.offset;copy=state.length;}if(copy>left){copy=left;}left-=copy;state.length-=copy;do {output[put++]=from_source[from++];}while(--copy);if(state.length===0){state.mode=LEN;}break;case LIT:if(left===0){break inf_leave;}output[put++]=state.length;left--;state.mode=LEN;break;case CHECK:if(state.wrap){ //=== NEEDBITS(32);
while(bits<32){if(have===0){break inf_leave;}have--; // Use '|' insdead of '+' to make sure that result is signed
hold|=input[next++]<<bits;bits+=8;} //===//
_out-=left;strm.total_out+=_out;state.total+=_out;if(_out){strm.adler=state.check= /*UPDATE(state.check, put - _out, _out);*/state.flags?crc32(state.check,output,_out,put-_out):adler32(state.check,output,_out,put-_out);}_out=left; // NB: crc32 stored as signed 32-bit int, ZSWAP32 returns signed too
if((state.flags?hold:ZSWAP32(hold))!==state.check){strm.msg='incorrect data check';state.mode=BAD;break;} //=== INITBITS();
hold=0;bits=0; //===//
//Tracev((stderr, "inflate:   check matches trailer\n"));
}state.mode=LENGTH; /* falls through */case LENGTH:if(state.wrap&&state.flags){ //=== NEEDBITS(32);
while(bits<32){if(have===0){break inf_leave;}have--;hold+=input[next++]<<bits;bits+=8;} //===//
if(hold!==(state.total&0xffffffff)){strm.msg='incorrect length check';state.mode=BAD;break;} //=== INITBITS();
hold=0;bits=0; //===//
//Tracev((stderr, "inflate:   length matches trailer\n"));
}state.mode=DONE; /* falls through */case DONE:ret=Z_STREAM_END;break inf_leave;case BAD:ret=Z_DATA_ERROR;break inf_leave;case MEM:return Z_MEM_ERROR;case SYNC: /* falls through */default:return Z_STREAM_ERROR;}} // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"
/*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */ //--- RESTORE() ---
strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits; //---
if(state.wsize||_out!==strm.avail_out&&state.mode<BAD&&(state.mode<CHECK||flush!==Z_FINISH)){if(updatewindow(strm,strm.output,strm.next_out,_out-strm.avail_out)){state.mode=MEM;return Z_MEM_ERROR;}}_in-=strm.avail_in;_out-=strm.avail_out;strm.total_in+=_in;strm.total_out+=_out;state.total+=_out;if(state.wrap&&_out){strm.adler=state.check= /*UPDATE(state.check, strm.next_out - _out, _out);*/state.flags?crc32(state.check,output,_out,strm.next_out-_out):adler32(state.check,output,_out,strm.next_out-_out);}strm.data_type=state.bits+(state.last?64:0)+(state.mode===TYPE?128:0)+(state.mode===LEN_||state.mode===COPY_?256:0);if((_in===0&&_out===0||flush===Z_FINISH)&&ret===Z_OK){}return ret;}function inflateEnd(strm){if(!strm||!strm.state /*|| strm->zfree == (free_func)0*/){return Z_STREAM_ERROR;}var state=strm.state;if(state.window){state.window=null;}strm.state=null;return Z_OK;}function inflateGetHeader(strm,head){var state; /* check state */if(!strm||!strm.state){return Z_STREAM_ERROR;}state=strm.state;if((state.wrap&2)===0){return Z_STREAM_ERROR;} /* save header structure */state.head=head;head.done=false;return Z_OK;}exports.inflateReset=inflateReset;exports.inflateReset2=inflateReset2;exports.inflateResetKeep=inflateResetKeep;exports.inflateInit=inflateInit;exports.inflateInit2=inflateInit2;exports.inflate=inflate;exports.inflateEnd=inflateEnd;exports.inflateGetHeader=inflateGetHeader;exports.inflateInfo='pako inflate (from Nodeca project)'; /* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/},{"../utils/common":44,"./adler32":45,"./crc32":47,"./inffast":49,"./inftrees":51}],51:[function(require,module,exports){'use strict';var utils=require('../utils/common');var MAXBITS=15;var ENOUGH_LENS=852;var ENOUGH_DISTS=592; //var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);
var CODES=0;var LENS=1;var DISTS=2;var lbase=[ /* Length codes 257..285 base */3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0];var lext=[ /* Length codes 257..285 extra */16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78];var dbase=[ /* Distance codes 0..29 base */1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0];var dext=[ /* Distance codes 0..29 extra */16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];module.exports=function inflate_table(type,lens,lens_index,codes,table,table_index,work,opts){var bits=opts.bits; //here = opts.here; /* table entry for duplication */
var len=0; /* a code's length in bits */var sym=0; /* index of code symbols */var min=0,max=0; /* minimum and maximum code lengths */var root=0; /* number of index bits for root table */var curr=0; /* number of index bits for current table */var drop=0; /* code bits to drop for sub-table */var left=0; /* number of prefix codes available */var used=0; /* code entries in table used */var huff=0; /* Huffman code */var incr; /* for incrementing code, index */var fill; /* index for replicating entries */var low; /* low bits for current root entry */var mask; /* mask for low root bits */var next; /* next available space in table */var base=null; /* base value table to use */var base_index=0; //  var shoextra;    /* extra bits table to use */
var end; /* use base and extra for symbol > end */var count=new utils.Buf16(MAXBITS+1); //[MAXBITS+1];    /* number of codes of each length */
var offs=new utils.Buf16(MAXBITS+1); //[MAXBITS+1];     /* offsets in table for each length */
var extra=null;var extra_index=0;var here_bits,here_op,here_val; /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */ /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */for(len=0;len<=MAXBITS;len++){count[len]=0;}for(sym=0;sym<codes;sym++){count[lens[lens_index+sym]]++;} /* bound code lengths, force root to be within code lengths */root=bits;for(max=MAXBITS;max>=1;max--){if(count[max]!==0){break;}}if(root>max){root=max;}if(max===0){ /* no symbols to code at all */ //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
//table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
//table.val[opts.table_index++] = 0;   //here.val = (var short)0;
table[table_index++]=1<<24|64<<16|0; //table.op[opts.table_index] = 64;
//table.bits[opts.table_index] = 1;
//table.val[opts.table_index++] = 0;
table[table_index++]=1<<24|64<<16|0;opts.bits=1;return 0; /* no symbols, but wait for decoding to report error */}for(min=1;min<max;min++){if(count[min]!==0){break;}}if(root<min){root=min;} /* check for an over-subscribed or incomplete set of lengths */left=1;for(len=1;len<=MAXBITS;len++){left<<=1;left-=count[len];if(left<0){return -1;} /* over-subscribed */}if(left>0&&(type===CODES||max!==1)){return -1; /* incomplete set */} /* generate offsets into symbol table for each length for sorting */offs[1]=0;for(len=1;len<MAXBITS;len++){offs[len+1]=offs[len]+count[len];} /* sort symbols by length, by symbol order within each length */for(sym=0;sym<codes;sym++){if(lens[lens_index+sym]!==0){work[offs[lens[lens_index+sym]]++]=sym;}} /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */ /* set up for code type */ // poor man optimization - use if-else instead of switch,
// to avoid deopts in old v8
if(type===CODES){base=extra=work; /* dummy value--not used */end=19;}else if(type===LENS){base=lbase;base_index-=257;extra=lext;extra_index-=257;end=256;}else { /* DISTS */base=dbase;extra=dext;end=-1;} /* initialize opts for loop */huff=0; /* starting code */sym=0; /* starting code symbol */len=min; /* starting code length */next=table_index; /* current table to fill in */curr=root; /* current table index bits */drop=0; /* current bits to drop from code for index */low=-1; /* trigger new sub-table when len > root */used=1<<root; /* use root table entries */mask=used-1; /* mask for comparing low */ /* check available table space */if(type===LENS&&used>ENOUGH_LENS||type===DISTS&&used>ENOUGH_DISTS){return 1;}var i=0; /* process all codes and make table entries */for(;;){i++; /* create table entry */here_bits=len-drop;if(work[sym]<end){here_op=0;here_val=work[sym];}else if(work[sym]>end){here_op=extra[extra_index+work[sym]];here_val=base[base_index+work[sym]];}else {here_op=32+64; /* end of block */here_val=0;} /* replicate for those indices with low len bits equal to huff */incr=1<<len-drop;fill=1<<curr;min=fill; /* save offset to next table */do {fill-=incr;table[next+(huff>>drop)+fill]=here_bits<<24|here_op<<16|here_val|0;}while(fill!==0); /* backwards increment the len-bit code huff */incr=1<<len-1;while(huff&incr){incr>>=1;}if(incr!==0){huff&=incr-1;huff+=incr;}else {huff=0;} /* go to next symbol, update count, len */sym++;if(--count[len]===0){if(len===max){break;}len=lens[lens_index+work[sym]];} /* create new sub-table if needed */if(len>root&&(huff&mask)!==low){ /* if first time, transition to sub-tables */if(drop===0){drop=root;} /* increment past last table */next+=min; /* here min is 1 << curr */ /* determine length of next table */curr=len-drop;left=1<<curr;while(curr+drop<max){left-=count[curr+drop];if(left<=0){break;}curr++;left<<=1;} /* check for enough space */used+=1<<curr;if(type===LENS&&used>ENOUGH_LENS||type===DISTS&&used>ENOUGH_DISTS){return 1;} /* point entry in root table to sub-table */low=huff&mask; /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/table[low]=root<<24|curr<<16|next-table_index|0;}} /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */if(huff!==0){ //table.op[next + huff] = 64;            /* invalid code marker */
//table.bits[next + huff] = len - drop;
//table.val[next + huff] = 0;
table[next+huff]=len-drop<<24|64<<16|0;} /* set return parameters */ //opts.table_index += used;
opts.bits=root;return 0;};},{"../utils/common":44}],52:[function(require,module,exports){'use strict';module.exports={'2':'need dictionary', /* Z_NEED_DICT       2  */'1':'stream end', /* Z_STREAM_END      1  */'0':'', /* Z_OK              0  */'-1':'file error', /* Z_ERRNO         (-1) */'-2':'stream error', /* Z_STREAM_ERROR  (-2) */'-3':'data error', /* Z_DATA_ERROR    (-3) */'-4':'insufficient memory', /* Z_MEM_ERROR     (-4) */'-5':'buffer error', /* Z_BUF_ERROR     (-5) */'-6':'incompatible version' /* Z_VERSION_ERROR (-6) */};},{}],53:[function(require,module,exports){'use strict';var utils=require('../utils/common'); /* Public constants ==========================================================*/ /* ===========================================================================*/ //var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED=4; //var Z_DEFAULT_STRATEGY  = 0;
/* Possible values of the data_type field (though see inflate()) */var Z_BINARY=0;var Z_TEXT=1; //var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN=2; /*============================================================================*/function zero(buf){var len=buf.length;while(--len>=0){buf[len]=0;}} // From zutil.h
var STORED_BLOCK=0;var STATIC_TREES=1;var DYN_TREES=2; /* The three kinds of block type */var MIN_MATCH=3;var MAX_MATCH=258; /* The minimum and maximum match lengths */ // From deflate.h
/* ===========================================================================
 * Internal compression state.
 */var LENGTH_CODES=29; /* number of length codes, not counting the special END_BLOCK code */var LITERALS=256; /* number of literal bytes 0..255 */var L_CODES=LITERALS+1+LENGTH_CODES; /* number of Literal or Length codes, including the END_BLOCK code */var D_CODES=30; /* number of distance codes */var BL_CODES=19; /* number of codes used to transfer the bit lengths */var HEAP_SIZE=2*L_CODES+1; /* maximum heap size */var MAX_BITS=15; /* All codes must not exceed MAX_BITS bits */var Buf_size=16; /* size of bit buffer in bi_buf */ /* ===========================================================================
 * Constants
 */var MAX_BL_BITS=7; /* Bit length codes must not exceed MAX_BL_BITS bits */var END_BLOCK=256; /* end of block literal code */var REP_3_6=16; /* repeat previous bit length 3-6 times (2 bits of repeat count) */var REPZ_3_10=17; /* repeat a zero length 3-10 times  (3 bits of repeat count) */var REPZ_11_138=18; /* repeat a zero length 11-138 times  (7 bits of repeat count) */var extra_lbits= /* extra bits for each length code */[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];var extra_dbits= /* extra bits for each distance code */[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];var extra_blbits= /* extra bits for each bit length code */[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];var bl_order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]; /* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */ /* ===========================================================================
 * Local data. These are initialized only once.
 */ // We pre-fill arrays with 0 to avoid uninitialized gaps
var DIST_CODE_LEN=512; /* see definition of array dist_code below */ // !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
var static_ltree=new Array((L_CODES+2)*2);zero(static_ltree); /* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */var static_dtree=new Array(D_CODES*2);zero(static_dtree); /* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */var _dist_code=new Array(DIST_CODE_LEN);zero(_dist_code); /* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */var _length_code=new Array(MAX_MATCH-MIN_MATCH+1);zero(_length_code); /* length code for each normalized match length (0 == MIN_MATCH) */var base_length=new Array(LENGTH_CODES);zero(base_length); /* First normalized length for each code (0 = MIN_MATCH) */var base_dist=new Array(D_CODES);zero(base_dist); /* First normalized distance for each code (0 = distance of 1) */var StaticTreeDesc=function StaticTreeDesc(static_tree,extra_bits,extra_base,elems,max_length){this.static_tree=static_tree; /* static tree or NULL */this.extra_bits=extra_bits; /* extra bits for each code or NULL */this.extra_base=extra_base; /* base index for extra_bits */this.elems=elems; /* max number of elements in the tree */this.max_length=max_length; /* max bit length for the codes */ // show if `static_tree` has data or dummy - needed for monomorphic objects
this.has_stree=static_tree&&static_tree.length;};var static_l_desc;var static_d_desc;var static_bl_desc;var TreeDesc=function TreeDesc(dyn_tree,stat_desc){this.dyn_tree=dyn_tree; /* the dynamic tree */this.max_code=0; /* largest code with non zero frequency */this.stat_desc=stat_desc; /* the corresponding static tree */};function d_code(dist){return dist<256?_dist_code[dist]:_dist_code[256+(dist>>>7)];} /* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */function put_short(s,w){ //    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
s.pending_buf[s.pending++]=w&0xff;s.pending_buf[s.pending++]=w>>>8&0xff;} /* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */function send_bits(s,value,length){if(s.bi_valid>Buf_size-length){s.bi_buf|=value<<s.bi_valid&0xffff;put_short(s,s.bi_buf);s.bi_buf=value>>Buf_size-s.bi_valid;s.bi_valid+=length-Buf_size;}else {s.bi_buf|=value<<s.bi_valid&0xffff;s.bi_valid+=length;}}function send_code(s,c,tree){send_bits(s,tree[c*2] /*.Code*/,tree[c*2+1] /*.Len*/);} /* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */function bi_reverse(code,len){var res=0;do {res|=code&1;code>>>=1;res<<=1;}while(--len>0);return res>>>1;} /* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */function bi_flush(s){if(s.bi_valid===16){put_short(s,s.bi_buf);s.bi_buf=0;s.bi_valid=0;}else if(s.bi_valid>=8){s.pending_buf[s.pending++]=s.bi_buf&0xff;s.bi_buf>>=8;s.bi_valid-=8;}} /* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */function gen_bitlen(s,desc) //    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{var tree=desc.dyn_tree;var max_code=desc.max_code;var stree=desc.stat_desc.static_tree;var has_stree=desc.stat_desc.has_stree;var extra=desc.stat_desc.extra_bits;var base=desc.stat_desc.extra_base;var max_length=desc.stat_desc.max_length;var h; /* heap index */var n,m; /* iterate over the tree elements */var bits; /* bit length */var xbits; /* extra bits */var f; /* frequency */var overflow=0; /* number of elements with bit length too large */for(bits=0;bits<=MAX_BITS;bits++){s.bl_count[bits]=0;} /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */tree[s.heap[s.heap_max]*2+1] /*.Len*/=0; /* root of the heap */for(h=s.heap_max+1;h<HEAP_SIZE;h++){n=s.heap[h];bits=tree[tree[n*2+1] /*.Dad*/*2+1] /*.Len*/+1;if(bits>max_length){bits=max_length;overflow++;}tree[n*2+1] /*.Len*/=bits; /* We overwrite tree[n].Dad which is no longer needed */if(n>max_code){continue;} /* not a leaf node */s.bl_count[bits]++;xbits=0;if(n>=base){xbits=extra[n-base];}f=tree[n*2] /*.Freq*/;s.opt_len+=f*(bits+xbits);if(has_stree){s.static_len+=f*(stree[n*2+1] /*.Len*/+xbits);}}if(overflow===0){return;} // Trace((stderr,"\nbit length overflow\n"));
/* This happens for example on obj2 and pic of the Calgary corpus */ /* Find the first bit length which could increase: */do {bits=max_length-1;while(s.bl_count[bits]===0){bits--;}s.bl_count[bits]--; /* move one leaf down the tree */s.bl_count[bits+1]+=2; /* move one overflow item as its brother */s.bl_count[max_length]--; /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */overflow-=2;}while(overflow>0); /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */for(bits=max_length;bits!==0;bits--){n=s.bl_count[bits];while(n!==0){m=s.heap[--h];if(m>max_code){continue;}if(tree[m*2+1] /*.Len*/!==bits){ // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
s.opt_len+=(bits-tree[m*2+1] /*.Len*/)*tree[m*2] /*.Freq*/;tree[m*2+1] /*.Len*/=bits;}n--;}}} /* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */function gen_codes(tree,max_code,bl_count) //    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{var next_code=new Array(MAX_BITS+1); /* next code value for each bit length */var code=0; /* running code value */var bits; /* bit index */var n; /* code index */ /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */for(bits=1;bits<=MAX_BITS;bits++){next_code[bits]=code=code+bl_count[bits-1]<<1;} /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */ //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
//        "inconsistent bit counts");
//Tracev((stderr,"\ngen_codes: max_code %d ", max_code));
for(n=0;n<=max_code;n++){var len=tree[n*2+1] /*.Len*/;if(len===0){continue;} /* Now reverse the bits */tree[n*2] /*.Code*/=bi_reverse(next_code[len]++,len); //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
//     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
}} /* ===========================================================================
 * Initialize the various 'constant' tables.
 */function tr_static_init(){var n; /* iterates over tree elements */var bits; /* bit counter */var length; /* length value */var code; /* code value */var dist; /* distance index */var bl_count=new Array(MAX_BITS+1); /* number of codes at each bit length for an optimal tree */ // do check in _tr_init()
//if (static_init_done) return;
/* For some embedded targets, global variables are not initialized: */ /*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/ /* Initialize the mapping length (0..255) -> length code (0..28) */length=0;for(code=0;code<LENGTH_CODES-1;code++){base_length[code]=length;for(n=0;n<1<<extra_lbits[code];n++){_length_code[length++]=code;}} //Assert (length == 256, "tr_static_init: length != 256");
/* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */_length_code[length-1]=code; /* Initialize the mapping dist (0..32K) -> dist code (0..29) */dist=0;for(code=0;code<16;code++){base_dist[code]=dist;for(n=0;n<1<<extra_dbits[code];n++){_dist_code[dist++]=code;}} //Assert (dist == 256, "tr_static_init: dist != 256");
dist>>=7; /* from now on, all distances are divided by 128 */for(;code<D_CODES;code++){base_dist[code]=dist<<7;for(n=0;n<1<<extra_dbits[code]-7;n++){_dist_code[256+dist++]=code;}} //Assert (dist == 256, "tr_static_init: 256+dist != 512");
/* Construct the codes of the static literal tree */for(bits=0;bits<=MAX_BITS;bits++){bl_count[bits]=0;}n=0;while(n<=143){static_ltree[n*2+1] /*.Len*/=8;n++;bl_count[8]++;}while(n<=255){static_ltree[n*2+1] /*.Len*/=9;n++;bl_count[9]++;}while(n<=279){static_ltree[n*2+1] /*.Len*/=7;n++;bl_count[7]++;}while(n<=287){static_ltree[n*2+1] /*.Len*/=8;n++;bl_count[8]++;} /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */gen_codes(static_ltree,L_CODES+1,bl_count); /* The static distance tree is trivial: */for(n=0;n<D_CODES;n++){static_dtree[n*2+1] /*.Len*/=5;static_dtree[n*2] /*.Code*/=bi_reverse(n,5);} // Now data ready and we can init static trees
static_l_desc=new StaticTreeDesc(static_ltree,extra_lbits,LITERALS+1,L_CODES,MAX_BITS);static_d_desc=new StaticTreeDesc(static_dtree,extra_dbits,0,D_CODES,MAX_BITS);static_bl_desc=new StaticTreeDesc(new Array(0),extra_blbits,0,BL_CODES,MAX_BL_BITS); //static_init_done = true;
} /* ===========================================================================
 * Initialize a new block.
 */function init_block(s){var n; /* iterates over tree elements */ /* Initialize the trees. */for(n=0;n<L_CODES;n++){s.dyn_ltree[n*2] /*.Freq*/=0;}for(n=0;n<D_CODES;n++){s.dyn_dtree[n*2] /*.Freq*/=0;}for(n=0;n<BL_CODES;n++){s.bl_tree[n*2] /*.Freq*/=0;}s.dyn_ltree[END_BLOCK*2] /*.Freq*/=1;s.opt_len=s.static_len=0;s.last_lit=s.matches=0;} /* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */function bi_windup(s){if(s.bi_valid>8){put_short(s,s.bi_buf);}else if(s.bi_valid>0){ //put_byte(s, (Byte)s->bi_buf);
s.pending_buf[s.pending++]=s.bi_buf;}s.bi_buf=0;s.bi_valid=0;} /* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */function copy_block(s,buf,len,header) //DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{bi_windup(s); /* align on byte boundary */if(header){put_short(s,len);put_short(s,~len);} //  while (len--) {
//    put_byte(s, *buf++);
//  }
utils.arraySet(s.pending_buf,s.window,buf,len,s.pending);s.pending+=len;} /* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */function smaller(tree,n,m,depth){var _n2=n*2;var _m2=m*2;return tree[_n2] /*.Freq*/<tree[_m2] /*.Freq*/||tree[_n2] /*.Freq*/===tree[_m2] /*.Freq*/&&depth[n]<=depth[m];} /* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */function pqdownheap(s,tree,k) //    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{var v=s.heap[k];var j=k<<1; /* left son of k */while(j<=s.heap_len){ /* Set j to the smallest of the two sons: */if(j<s.heap_len&&smaller(tree,s.heap[j+1],s.heap[j],s.depth)){j++;} /* Exit if v is smaller than both sons */if(smaller(tree,v,s.heap[j],s.depth)){break;} /* Exchange v with the smallest son */s.heap[k]=s.heap[j];k=j; /* And continue down the tree, setting j to the left son of k */j<<=1;}s.heap[k]=v;} // inlined manually
// var SMALLEST = 1;
/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */function compress_block(s,ltree,dtree) //    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{var dist; /* distance of matched string */var lc; /* match length or unmatched char (if dist == 0) */var lx=0; /* running index in l_buf */var code; /* the code to send */var extra; /* number of extra bits to send */if(s.last_lit!==0){do {dist=s.pending_buf[s.d_buf+lx*2]<<8|s.pending_buf[s.d_buf+lx*2+1];lc=s.pending_buf[s.l_buf+lx];lx++;if(dist===0){send_code(s,lc,ltree); /* send a literal byte */ //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
}else { /* Here, lc is the match length - MIN_MATCH */code=_length_code[lc];send_code(s,code+LITERALS+1,ltree); /* send the length code */extra=extra_lbits[code];if(extra!==0){lc-=base_length[code];send_bits(s,lc,extra); /* send the extra length bits */}dist--; /* dist is now the match distance - 1 */code=d_code(dist); //Assert (code < D_CODES, "bad d_code");
send_code(s,code,dtree); /* send the distance code */extra=extra_dbits[code];if(extra!==0){dist-=base_dist[code];send_bits(s,dist,extra); /* send the extra distance bits */}} /* literal or match pair ? */ /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */ //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
//       "pendingBuf overflow");
}while(lx<s.last_lit);}send_code(s,END_BLOCK,ltree);} /* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */function build_tree(s,desc) //    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{var tree=desc.dyn_tree;var stree=desc.stat_desc.static_tree;var has_stree=desc.stat_desc.has_stree;var elems=desc.stat_desc.elems;var n,m; /* iterate over heap elements */var max_code=-1; /* largest code with non zero frequency */var node; /* new node being created */ /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */s.heap_len=0;s.heap_max=HEAP_SIZE;for(n=0;n<elems;n++){if(tree[n*2] /*.Freq*/!==0){s.heap[++s.heap_len]=max_code=n;s.depth[n]=0;}else {tree[n*2+1] /*.Len*/=0;}} /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */while(s.heap_len<2){node=s.heap[++s.heap_len]=max_code<2?++max_code:0;tree[node*2] /*.Freq*/=1;s.depth[node]=0;s.opt_len--;if(has_stree){s.static_len-=stree[node*2+1] /*.Len*/;} /* node is 0 or 1 so it does not have extra bits */}desc.max_code=max_code; /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */for(n=s.heap_len>>1 /*int /2*/;n>=1;n--){pqdownheap(s,tree,n);} /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */node=elems; /* next internal node of the tree */do { //pqremove(s, tree, n);  /* n = node of least frequency */
/*** pqremove ***/n=s.heap[1 /*SMALLEST*/];s.heap[1 /*SMALLEST*/]=s.heap[s.heap_len--];pqdownheap(s,tree,1 /*SMALLEST*/); /***/m=s.heap[1 /*SMALLEST*/]; /* m = node of next least frequency */s.heap[--s.heap_max]=n; /* keep the nodes sorted by frequency */s.heap[--s.heap_max]=m; /* Create a new node father of n and m */tree[node*2] /*.Freq*/=tree[n*2] /*.Freq*/+tree[m*2] /*.Freq*/;s.depth[node]=(s.depth[n]>=s.depth[m]?s.depth[n]:s.depth[m])+1;tree[n*2+1] /*.Dad*/=tree[m*2+1] /*.Dad*/=node; /* and insert the new node in the heap */s.heap[1 /*SMALLEST*/]=node++;pqdownheap(s,tree,1 /*SMALLEST*/);}while(s.heap_len>=2);s.heap[--s.heap_max]=s.heap[1 /*SMALLEST*/]; /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */gen_bitlen(s,desc); /* The field len is now set, we can generate the bit codes */gen_codes(tree,max_code,s.bl_count);} /* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */function scan_tree(s,tree,max_code) //    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{var n; /* iterates over all tree elements */var prevlen=-1; /* last emitted length */var curlen; /* length of current code */var nextlen=tree[0*2+1] /*.Len*/; /* length of next code */var count=0; /* repeat count of the current code */var max_count=7; /* max repeat count */var min_count=4; /* min repeat count */if(nextlen===0){max_count=138;min_count=3;}tree[(max_code+1)*2+1] /*.Len*/=0xffff; /* guard */for(n=0;n<=max_code;n++){curlen=nextlen;nextlen=tree[(n+1)*2+1] /*.Len*/;if(++count<max_count&&curlen===nextlen){continue;}else if(count<min_count){s.bl_tree[curlen*2] /*.Freq*/+=count;}else if(curlen!==0){if(curlen!==prevlen){s.bl_tree[curlen*2] /*.Freq*/++;}s.bl_tree[REP_3_6*2] /*.Freq*/++;}else if(count<=10){s.bl_tree[REPZ_3_10*2] /*.Freq*/++;}else {s.bl_tree[REPZ_11_138*2] /*.Freq*/++;}count=0;prevlen=curlen;if(nextlen===0){max_count=138;min_count=3;}else if(curlen===nextlen){max_count=6;min_count=3;}else {max_count=7;min_count=4;}}} /* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */function send_tree(s,tree,max_code) //    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{var n; /* iterates over all tree elements */var prevlen=-1; /* last emitted length */var curlen; /* length of current code */var nextlen=tree[0*2+1] /*.Len*/; /* length of next code */var count=0; /* repeat count of the current code */var max_count=7; /* max repeat count */var min_count=4; /* min repeat count */ /* tree[max_code+1].Len = -1; */ /* guard already set */if(nextlen===0){max_count=138;min_count=3;}for(n=0;n<=max_code;n++){curlen=nextlen;nextlen=tree[(n+1)*2+1] /*.Len*/;if(++count<max_count&&curlen===nextlen){continue;}else if(count<min_count){do {send_code(s,curlen,s.bl_tree);}while(--count!==0);}else if(curlen!==0){if(curlen!==prevlen){send_code(s,curlen,s.bl_tree);count--;} //Assert(count >= 3 && count <= 6, " 3_6?");
send_code(s,REP_3_6,s.bl_tree);send_bits(s,count-3,2);}else if(count<=10){send_code(s,REPZ_3_10,s.bl_tree);send_bits(s,count-3,3);}else {send_code(s,REPZ_11_138,s.bl_tree);send_bits(s,count-11,7);}count=0;prevlen=curlen;if(nextlen===0){max_count=138;min_count=3;}else if(curlen===nextlen){max_count=6;min_count=3;}else {max_count=7;min_count=4;}}} /* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */function build_bl_tree(s){var max_blindex; /* index of last bit length code of non zero freq */ /* Determine the bit length frequencies for literal and distance trees */scan_tree(s,s.dyn_ltree,s.l_desc.max_code);scan_tree(s,s.dyn_dtree,s.d_desc.max_code); /* Build the bit length tree: */build_tree(s,s.bl_desc); /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */ /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */for(max_blindex=BL_CODES-1;max_blindex>=3;max_blindex--){if(s.bl_tree[bl_order[max_blindex]*2+1] /*.Len*/!==0){break;}} /* Update opt_len to include the bit length tree and counts */s.opt_len+=3*(max_blindex+1)+5+5+4; //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
//        s->opt_len, s->static_len));
return max_blindex;} /* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */function send_all_trees(s,lcodes,dcodes,blcodes) //    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{var rank; /* index in bl_order */ //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
//Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
//        "too many codes");
//Tracev((stderr, "\nbl counts: "));
send_bits(s,lcodes-257,5); /* not +255 as stated in appnote.txt */send_bits(s,dcodes-1,5);send_bits(s,blcodes-4,4); /* not -3 as stated in appnote.txt */for(rank=0;rank<blcodes;rank++){ //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
send_bits(s,s.bl_tree[bl_order[rank]*2+1] /*.Len*/,3);} //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));
send_tree(s,s.dyn_ltree,lcodes-1); /* literal tree */ //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));
send_tree(s,s.dyn_dtree,dcodes-1); /* distance tree */ //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
} /* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */function detect_data_type(s){ /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */var black_mask=0xf3ffc07f;var n; /* Check for non-textual ("black-listed") bytes. */for(n=0;n<=31;n++,black_mask>>>=1){if(black_mask&1&&s.dyn_ltree[n*2] /*.Freq*/!==0){return Z_BINARY;}} /* Check for textual ("white-listed") bytes. */if(s.dyn_ltree[9*2] /*.Freq*/!==0||s.dyn_ltree[10*2] /*.Freq*/!==0||s.dyn_ltree[13*2] /*.Freq*/!==0){return Z_TEXT;}for(n=32;n<LITERALS;n++){if(s.dyn_ltree[n*2] /*.Freq*/!==0){return Z_TEXT;}} /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */return Z_BINARY;}var static_init_done=false; /* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */function _tr_init(s){if(!static_init_done){tr_static_init();static_init_done=true;}s.l_desc=new TreeDesc(s.dyn_ltree,static_l_desc);s.d_desc=new TreeDesc(s.dyn_dtree,static_d_desc);s.bl_desc=new TreeDesc(s.bl_tree,static_bl_desc);s.bi_buf=0;s.bi_valid=0; /* Initialize the first block of the first file: */init_block(s);} /* ===========================================================================
 * Send a stored block
 */function _tr_stored_block(s,buf,stored_len,last) //DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{send_bits(s,(STORED_BLOCK<<1)+(last?1:0),3); /* send block type */copy_block(s,buf,stored_len,true); /* with header */} /* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */function _tr_align(s){send_bits(s,STATIC_TREES<<1,3);send_code(s,END_BLOCK,static_ltree);bi_flush(s);} /* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */function _tr_flush_block(s,buf,stored_len,last) //DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{var opt_lenb,static_lenb; /* opt_len and static_len in bytes */var max_blindex=0; /* index of last bit length code of non zero freq */ /* Build the Huffman trees unless a stored block is forced */if(s.level>0){ /* Check if the file is binary or text */if(s.strm.data_type===Z_UNKNOWN){s.strm.data_type=detect_data_type(s);} /* Construct the literal and distance trees */build_tree(s,s.l_desc); // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
//        s->static_len));
build_tree(s,s.d_desc); // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
//        s->static_len));
/* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */ /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */max_blindex=build_bl_tree(s); /* Determine the best encoding. Compute the block lengths in bytes. */opt_lenb=s.opt_len+3+7>>>3;static_lenb=s.static_len+3+7>>>3; // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
//        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
//        s->last_lit));
if(static_lenb<=opt_lenb){opt_lenb=static_lenb;}}else { // Assert(buf != (char*)0, "lost buf");
opt_lenb=static_lenb=stored_len+5; /* force a stored block */}if(stored_len+4<=opt_lenb&&buf!==-1){ /* 4: two words for the lengths */ /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */_tr_stored_block(s,buf,stored_len,last);}else if(s.strategy===Z_FIXED||static_lenb===opt_lenb){send_bits(s,(STATIC_TREES<<1)+(last?1:0),3);compress_block(s,static_ltree,static_dtree);}else {send_bits(s,(DYN_TREES<<1)+(last?1:0),3);send_all_trees(s,s.l_desc.max_code+1,s.d_desc.max_code+1,max_blindex+1);compress_block(s,s.dyn_ltree,s.dyn_dtree);} // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
/* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */init_block(s);if(last){bi_windup(s);} // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
//       s->compressed_len-7*last));
} /* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */function _tr_tally(s,dist,lc) //    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{ //var out_length, in_length, dcode;
s.pending_buf[s.d_buf+s.last_lit*2]=dist>>>8&0xff;s.pending_buf[s.d_buf+s.last_lit*2+1]=dist&0xff;s.pending_buf[s.l_buf+s.last_lit]=lc&0xff;s.last_lit++;if(dist===0){ /* lc is the unmatched char */s.dyn_ltree[lc*2] /*.Freq*/++;}else {s.matches++; /* Here, lc is the match length - MIN_MATCH */dist--; /* dist = match distance - 1 */ //Assert((ush)dist < (ush)MAX_DIST(s) &&
//       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
//       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");
s.dyn_ltree[(_length_code[lc]+LITERALS+1)*2] /*.Freq*/++;s.dyn_dtree[d_code(dist)*2] /*.Freq*/++;} // (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif
return s.last_lit===s.lit_bufsize-1; /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */}exports._tr_init=_tr_init;exports._tr_stored_block=_tr_stored_block;exports._tr_flush_block=_tr_flush_block;exports._tr_tally=_tr_tally;exports._tr_align=_tr_align;},{"../utils/common":44}],54:[function(require,module,exports){'use strict';function ZStream(){ /* next input byte */this.input=null; // JS specific, because we have no pointers
this.next_in=0; /* number of bytes available at input */this.avail_in=0; /* total number of input bytes read so far */this.total_in=0; /* next output byte should be put there */this.output=null; // JS specific, because we have no pointers
this.next_out=0; /* remaining free space at output */this.avail_out=0; /* total number of bytes output so far */this.total_out=0; /* last error message, NULL if no error */this.msg='' /*Z_NULL*/; /* not visible by applications */this.state=null; /* best guess about the data type: binary or text */this.data_type=2 /*Z_UNKNOWN*/; /* adler32 value of the uncompressed data */this.adler=0;}module.exports=ZStream;},{}],55:[function(require,module,exports){module.exports=function parseBMFontAscii(data){if(!data)throw new Error('no data provided');data=data.toString().trim();var output={pages:[],chars:[],kernings:[]};var lines=data.split(/\r\n?|\n/g);if(lines.length===0)throw new Error('no data in BMFont file');for(var i=0;i<lines.length;i++){var lineData=splitLine(lines[i],i);if(!lineData) //skip empty lines
continue;if(lineData.key==='page'){if(typeof lineData.data.id!=='number')throw new Error('malformed file at line '+i+' -- needs page id=N');if(typeof lineData.data.file!=='string')throw new Error('malformed file at line '+i+' -- needs page file="path"');output.pages[lineData.data.id]=lineData.data.file;}else if(lineData.key==='chars'||lineData.key==='kernings'){ //... do nothing for these two ...
}else if(lineData.key==='char'){output.chars.push(lineData.data);}else if(lineData.key==='kerning'){output.kernings.push(lineData.data);}else {output[lineData.key]=lineData.data;}}return output;};function splitLine(line,idx){line=line.replace(/\t+/g,' ').trim();if(!line)return null;var space=line.indexOf(' ');if(space===-1)throw new Error("no named row at line "+idx);var key=line.substring(0,space);line=line.substring(space+1); //clear "letter" field as it is non-standard and
//requires additional complexity to parse " / = symbols
line=line.replace(/letter=[\'\"]\S+[\'\"]/gi,'');line=line.split("=");line=line.map(function(str){return str.trim().match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);});var data=[];for(var i=0;i<line.length;i++){var dt=line[i];if(i===0){data.push({key:dt[0],data:""});}else if(i===line.length-1){data[data.length-1].data=parseData(dt[0]);}else {data[data.length-1].data=parseData(dt[0]);data.push({key:dt[1],data:""});}}var out={key:key,data:{}};data.forEach(function(v){out.data[v.key]=v.data;});return out;}function parseData(data){if(!data||data.length===0)return "";if(data.indexOf('"')===0||data.indexOf("'")===0)return data.substring(1,data.length-1);if(data.indexOf(',')!==-1)return parseIntList(data);return parseInt(data,10);}function parseIntList(data){return data.split(',').map(function(val){return parseInt(val,10);});}},{}],56:[function(require,module,exports){var HEADER=[66,77,70];module.exports=function readBMFontBinary(buf){if(buf.length<6)throw new Error('invalid buffer length for BMFont');var header=HEADER.every(function(byte,i){return buf.readUInt8(i)===byte;});if(!header)throw new Error('BMFont missing BMF byte header');var i=3;var vers=buf.readUInt8(i++);if(vers>3)throw new Error('Only supports BMFont Binary v3 (BMFont App v1.10)');var target={kernings:[],chars:[]};for(var b=0;b<5;b++){i+=readBlock(target,buf,i);}return target;};function readBlock(target,buf,i){if(i>buf.length-1)return 0;var blockID=buf.readUInt8(i++);var blockSize=buf.readInt32LE(i);i+=4;switch(blockID){case 1:target.info=readInfo(buf,i);break;case 2:target.common=readCommon(buf,i);break;case 3:target.pages=readPages(buf,i,blockSize);break;case 4:target.chars=readChars(buf,i,blockSize);break;case 5:target.kernings=readKernings(buf,i,blockSize);break;}return 5+blockSize;}function readInfo(buf,i){var info={};info.size=buf.readInt16LE(i);var bitField=buf.readUInt8(i+2);info.smooth=bitField>>7&1;info.unicode=bitField>>6&1;info.italic=bitField>>5&1;info.bold=bitField>>4&1; //fixedHeight is only mentioned in binary spec 
if(bitField>>3&1)info.fixedHeight=1;info.charset=buf.readUInt8(i+3)||'';info.stretchH=buf.readUInt16LE(i+4);info.aa=buf.readUInt8(i+6);info.padding=[buf.readInt8(i+7),buf.readInt8(i+8),buf.readInt8(i+9),buf.readInt8(i+10)];info.spacing=[buf.readInt8(i+11),buf.readInt8(i+12)];info.outline=buf.readUInt8(i+13);info.face=readStringNT(buf,i+14);return info;}function readCommon(buf,i){var common={};common.lineHeight=buf.readUInt16LE(i);common.base=buf.readUInt16LE(i+2);common.scaleW=buf.readUInt16LE(i+4);common.scaleH=buf.readUInt16LE(i+6);common.pages=buf.readUInt16LE(i+8);var bitField=buf.readUInt8(i+10);common.packed=0;common.alphaChnl=buf.readUInt8(i+11);common.redChnl=buf.readUInt8(i+12);common.greenChnl=buf.readUInt8(i+13);common.blueChnl=buf.readUInt8(i+14);return common;}function readPages(buf,i,size){var pages=[];var text=readNameNT(buf,i);var len=text.length+1;var count=size/len;for(var c=0;c<count;c++){pages[c]=buf.slice(i,i+text.length).toString('utf8');i+=len;}return pages;}function readChars(buf,i,blockSize){var chars=[];var count=blockSize/20;for(var c=0;c<count;c++){var char={};var off=c*20;char.id=buf.readUInt32LE(i+0+off);char.x=buf.readUInt16LE(i+4+off);char.y=buf.readUInt16LE(i+6+off);char.width=buf.readUInt16LE(i+8+off);char.height=buf.readUInt16LE(i+10+off);char.xoffset=buf.readInt16LE(i+12+off);char.yoffset=buf.readInt16LE(i+14+off);char.xadvance=buf.readInt16LE(i+16+off);char.page=buf.readUInt8(i+18+off);char.chnl=buf.readUInt8(i+19+off);chars[c]=char;}return chars;}function readKernings(buf,i,blockSize){var kernings=[];var count=blockSize/10;for(var c=0;c<count;c++){var kern={};var off=c*10;kern.first=buf.readUInt32LE(i+0+off);kern.second=buf.readUInt32LE(i+4+off);kern.amount=buf.readInt16LE(i+8+off);kernings[c]=kern;}return kernings;}function readNameNT(buf,offset){var pos=offset;for(;pos<buf.length;pos++){if(buf[pos]===0x00)break;}return buf.slice(offset,pos);}function readStringNT(buf,offset){return readNameNT(buf,offset).toString('utf8');}},{}],57:[function(require,module,exports){var parseAttributes=require('./parse-attribs');var parseFromString=require('xml-parse-from-string'); //In some cases element.attribute.nodeName can return
//all lowercase values.. so we need to map them to the correct 
//case
var NAME_MAP={scaleh:'scaleH',scalew:'scaleW',stretchh:'stretchH',lineheight:'lineHeight',alphachnl:'alphaChnl',redchnl:'redChnl',greenchnl:'greenChnl',bluechnl:'blueChnl'};module.exports=function parse(data){data=data.toString();var xmlRoot=parseFromString(data);var output={pages:[],chars:[],kernings:[]} //get config settings
;['info','common'].forEach(function(key){var element=xmlRoot.getElementsByTagName(key)[0];if(element)output[key]=parseAttributes(getAttribs(element));}); //get page info
var pageRoot=xmlRoot.getElementsByTagName('pages')[0];if(!pageRoot)throw new Error('malformed file -- no <pages> element');var pages=pageRoot.getElementsByTagName('page');for(var i=0;i<pages.length;i++){var p=pages[i];var id=parseInt(p.getAttribute('id'),10);var file=p.getAttribute('file');if(isNaN(id))throw new Error('malformed file -- page "id" attribute is NaN');if(!file)throw new Error('malformed file -- needs page "file" attribute');output.pages[parseInt(id,10)]=file;} //get kernings / chars
;['chars','kernings'].forEach(function(key){var element=xmlRoot.getElementsByTagName(key)[0];if(!element)return;var childTag=key.substring(0,key.length-1);var children=element.getElementsByTagName(childTag);for(var i=0;i<children.length;i++){var child=children[i];output[key].push(parseAttributes(getAttribs(child)));}});return output;};function getAttribs(element){var attribs=getAttribList(element);return attribs.reduce(function(dict,attrib){var key=mapName(attrib.nodeName);dict[key]=attrib.nodeValue;return dict;},{});}function getAttribList(element){ //IE8+ and modern browsers
var attribs=[];for(var i=0;i<element.attributes.length;i++){attribs.push(element.attributes[i]);}return attribs;}function mapName(nodeName){return NAME_MAP[nodeName.toLowerCase()]||nodeName;}},{"./parse-attribs":58,"xml-parse-from-string":106}],58:[function(require,module,exports){ //Some versions of GlyphDesigner have a typo
//that causes some bugs with parsing. 
//Need to confirm with recent version of the software
//to see whether this is still an issue or not.
var GLYPH_DESIGNER_ERROR='chasrset';module.exports=function parseAttributes(obj){if(GLYPH_DESIGNER_ERROR in obj){obj['charset']=obj[GLYPH_DESIGNER_ERROR];delete obj[GLYPH_DESIGNER_ERROR];}for(var k in obj){if(k==='face'||k==='charset')continue;else if(k==='padding'||k==='spacing')obj[k]=parseIntList(obj[k]);else obj[k]=parseInt(obj[k],10);}return obj;};function parseIntList(data){return data.split(',').map(function(val){return parseInt(val,10);});}},{}],59:[function(require,module,exports){var trim=require('trim'),forEach=require('for-each'),isArray=function isArray(arg){return Object.prototype.toString.call(arg)==='[object Array]';};module.exports=function(headers){if(!headers)return {};var result={};forEach(trim(headers).split('\n'),function(row){var index=row.indexOf(':'),key=trim(row.slice(0,index)).toLowerCase(),value=trim(row.slice(index+1));if(typeof result[key]==='undefined'){result[key]=value;}else if(isArray(result[key])){result[key].push(value);}else {result[key]=[result[key],value];}});return result;};},{"for-each":28,"trim":100}],60:[function(require,module,exports){(function(process){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts,allowAboveRoot){ // if the path tries to go above the root, `up` ends up > 0
var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==='.'){parts.splice(i,1);}else if(last==='..'){parts.splice(i,1);up++;}else if(up){parts.splice(i,1);up--;}} // if the path is allowed to go above the root, restore leading ..s
if(allowAboveRoot){for(;up--;up){parts.unshift('..');}}return parts;} // Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;var splitPath=function splitPath(filename){return splitPathRe.exec(filename).slice(1);}; // path.resolve([from ...], to)
// posix version
exports.resolve=function(){var resolvedPath='',resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:process.cwd(); // Skip empty and invalid entries
if(typeof path!=='string'){throw new TypeError('Arguments to path.resolve must be strings');}else if(!path){continue;}resolvedPath=path+'/'+resolvedPath;resolvedAbsolute=path.charAt(0)==='/';} // At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)
// Normalize the path
resolvedPath=normalizeArray(filter(resolvedPath.split('/'),function(p){return !!p;}),!resolvedAbsolute).join('/');return (resolvedAbsolute?'/':'')+resolvedPath||'.';}; // path.normalize(path)
// posix version
exports.normalize=function(path){var isAbsolute=exports.isAbsolute(path),trailingSlash=substr(path,-1)==='/'; // Normalize the path
path=normalizeArray(filter(path.split('/'),function(p){return !!p;}),!isAbsolute).join('/');if(!path&&!isAbsolute){path='.';}if(path&&trailingSlash){path+='/';}return (isAbsolute?'/':'')+path;}; // posix version
exports.isAbsolute=function(path){return path.charAt(0)==='/';}; // posix version
exports.join=function(){var paths=Array.prototype.slice.call(arguments,0);return exports.normalize(filter(paths,function(p,index){if(typeof p!=='string'){throw new TypeError('Arguments to path.join must be strings');}return p;}).join('/'));}; // path.relative(from, to)
// posix version
exports.relative=function(from,to){from=exports.resolve(from).substr(1);to=exports.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=='')break;}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=='')break;}if(start>end)return [];return arr.slice(start,end-start+1);}var fromParts=trim(from.split('/'));var toParts=trim(to.split('/'));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break;}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push('..');}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join('/');};exports.sep='/';exports.delimiter=':';exports.dirname=function(path){var result=splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){ // No dirname whatsoever
return '.';}if(dir){ // It has a dirname, strip trailing slash
dir=dir.substr(0,dir.length-1);}return root+dir;};exports.basename=function(path,ext){var f=splitPath(path)[2]; // TODO: make this comparison case-insensitive on windows?
if(ext&&f.substr(-1*ext.length)===ext){f=f.substr(0,f.length-ext.length);}return f;};exports.extname=function(path){return splitPath(path)[3];};function filter(xs,f){if(xs.filter)return xs.filter(f);var res=[];for(var i=0;i<xs.length;i++){if(f(xs[i],i,xs))res.push(xs[i]);}return res;} // String.prototype.substr - negative index don't work in IE8
var substr='ab'.substr(-1)==='b'?function(str,start,len){return str.substr(start,len);}:function(str,start,len){if(start<0)start=str.length+start;return str.substr(start,len);};}).call(this,require('_process'));},{"_process":12}],61:[function(require,module,exports){'use strict';module.exports=pixelmatch;function pixelmatch(img1,img2,output,width,height,options){if(!options)options={};var threshold=options.threshold===undefined?0.1:options.threshold; // maximum acceptable square distance between two colors;
// 35215 is the maximum possible value for the YIQ difference metric
var maxDelta=35215*threshold*threshold,diff=0; // compare each pixel of one image against the other one
for(var y=0;y<height;y++){for(var x=0;x<width;x++){var pos=(y*width+x)*4; // squared YUV distance between colors at this pixel position
var delta=colorDelta(img1,img2,pos,pos); // the color difference is above the threshold
if(delta>maxDelta){ // check it's a real rendering difference or just anti-aliasing
if(!options.includeAA&&(antialiased(img1,x,y,width,height,img2)||antialiased(img2,x,y,width,height,img1))){ // one of the pixels is anti-aliasing; draw as yellow and do not count as difference
if(output)drawPixel(output,pos,255,255,0);}else { // found substantial difference not caused by anti-aliasing; draw it as red
if(output)drawPixel(output,pos,255,0,0);diff++;}}else if(output){ // pixels are similar; draw background as grayscale image blended with white
var val=blend(grayPixel(img1,pos),0.1);drawPixel(output,pos,val,val,val);}}} // return the number of different pixels
return diff;} // check if a pixel is likely a part of anti-aliasing;
// based on "Anti-aliased Pixel and Intensity Slope Detector" paper by V. Vysniauskas, 2009
function antialiased(img,x1,y1,width,height,img2){var x0=Math.max(x1-1,0),y0=Math.max(y1-1,0),x2=Math.min(x1+1,width-1),y2=Math.min(y1+1,height-1),pos=(y1*width+x1)*4,zeroes=0,positives=0,negatives=0,min=0,max=0,minX,minY,maxX,maxY; // go through 8 adjacent pixels
for(var x=x0;x<=x2;x++){for(var y=y0;y<=y2;y++){if(x===x1&&y===y1)continue; // brightness delta between the center pixel and adjacent one
var delta=colorDelta(img,img,pos,(y*width+x)*4,true); // count the number of equal, darker and brighter adjacent pixels
if(delta===0)zeroes++;else if(delta<0)negatives++;else if(delta>0)positives++; // if found more than 2 equal siblings, it's definitely not anti-aliasing
if(zeroes>2)return false;if(!img2)continue; // remember the darkest pixel
if(delta<min){min=delta;minX=x;minY=y;} // remember the brightest pixel
if(delta>max){max=delta;maxX=x;maxY=y;}}}if(!img2)return true; // if there are no both darker and brighter pixels among siblings, it's not anti-aliasing
if(negatives===0||positives===0)return false; // if either the darkest or the brightest pixel has more than 2 equal siblings in both images
// (definitely not anti-aliased), this pixel is anti-aliased
return !antialiased(img,minX,minY,width,height)&&!antialiased(img2,minX,minY,width,height)||!antialiased(img,maxX,maxY,width,height)&&!antialiased(img2,maxX,maxY,width,height);} // calculate color difference according to the paper "Measuring perceived color difference
// using YIQ NTSC transmission color space in mobile applications" by Y. Kotsarenko and F. Ramos
function colorDelta(img1,img2,k,m,yOnly){var a1=img1[k+3]/255,a2=img2[m+3]/255,r1=blend(img1[k+0],a1),g1=blend(img1[k+1],a1),b1=blend(img1[k+2],a1),r2=blend(img2[m+0],a2),g2=blend(img2[m+1],a2),b2=blend(img2[m+2],a2),y=rgb2y(r1,g1,b1)-rgb2y(r2,g2,b2);if(yOnly)return y; // brightness difference only
var i=rgb2i(r1,g1,b1)-rgb2i(r2,g2,b2),q=rgb2q(r1,g1,b1)-rgb2q(r2,g2,b2);return 0.5053*y*y+0.299*i*i+0.1957*q*q;}function rgb2y(r,g,b){return r*0.29889531+g*0.58662247+b*0.11448223;}function rgb2i(r,g,b){return r*0.59597799-g*0.27417610-b*0.32180189;}function rgb2q(r,g,b){return r*0.21147017-g*0.52261711+b*0.31114694;} // blend semi-transparent color with white
function blend(c,a){return 255+(c-255)*a;}function drawPixel(output,pos,r,g,b){output[pos+0]=r;output[pos+1]=g;output[pos+2]=b;output[pos+3]=255;}function grayPixel(img,i){var a=img[i+3]/255,r=blend(img[i+0],a),g=blend(img[i+1],a),b=blend(img[i+2],a);return rgb2y(r,g,b);}},{}],62:[function(require,module,exports){(function(Buffer){'use strict';var interlaceUtils=require('./interlace');var pixelBppMap={1:{ // L
0:0,1:0,2:0,3:0xff},2:{ // LA
0:0,1:0,2:0,3:1},3:{ // RGB
0:0,1:1,2:2,3:0xff},4:{ // RGBA
0:0,1:1,2:2,3:3}};function bitRetriever(data,depth){var leftOver=[];var i=0;function split(){if(i===data.length){throw new Error('Ran out of data');}var byte=data[i];i++;var byte8,byte7,byte6,byte5,byte4,byte3,byte2,byte1;switch(depth){default:throw new Error('unrecognised depth');case 16:byte2=data[i];i++;leftOver.push((byte<<8)+byte2);break;case 4:byte2=byte&0x0f;byte1=byte>>4;leftOver.push(byte1,byte2);break;case 2:byte4=byte&3;byte3=byte>>2&3;byte2=byte>>4&3;byte1=byte>>6&3;leftOver.push(byte1,byte2,byte3,byte4);break;case 1:byte8=byte&1;byte7=byte>>1&1;byte6=byte>>2&1;byte5=byte>>3&1;byte4=byte>>4&1;byte3=byte>>5&1;byte2=byte>>6&1;byte1=byte>>7&1;leftOver.push(byte1,byte2,byte3,byte4,byte5,byte6,byte7,byte8);break;}}return {get:function get(count){while(leftOver.length<count){split();}var returner=leftOver.slice(0,count);leftOver=leftOver.slice(count);return returner;},resetAfterLine:function resetAfterLine(){leftOver.length=0;},end:function end(){if(i!==data.length){throw new Error('extra data found');}}};}function mapImage8Bit(image,pxData,getPxPos,bpp,data,rawPos){ // eslint-disable-line max-params
var imageWidth=image.width;var imageHeight=image.height;var imagePass=image.index;for(var y=0;y<imageHeight;y++){for(var x=0;x<imageWidth;x++){var pxPos=getPxPos(x,y,imagePass);for(var i=0;i<4;i++){var idx=pixelBppMap[bpp][i];if(i===data.length){throw new Error('Ran out of data');}pxData[pxPos+i]=idx!==0xff?data[idx+rawPos]:0xff;}rawPos+=bpp; //eslint-disable-line no-param-reassign
}}return rawPos;}function mapImageCustomBit(image,pxData,getPxPos,bpp,bits,maxBit){ // eslint-disable-line max-params
var imageWidth=image.width;var imageHeight=image.height;var imagePass=image.index;for(var y=0;y<imageHeight;y++){for(var x=0;x<imageWidth;x++){var pixelData=bits.get(bpp);var pxPos=getPxPos(x,y,imagePass);for(var i=0;i<4;i++){var idx=pixelBppMap[bpp][i];pxData[pxPos+i]=idx!==0xff?pixelData[idx]:maxBit;}}bits.resetAfterLine();}}exports.dataToBitMap=function(data,bitmapInfo){var width=bitmapInfo.width;var height=bitmapInfo.height;var depth=bitmapInfo.depth;var bpp=bitmapInfo.bpp;var interlace=bitmapInfo.interlace;if(depth!==8){var bits=bitRetriever(data,depth);}var pxData;if(depth<=8){pxData=new Buffer(width*height*4);}else {pxData=new Uint16Array(width*height*4);}var maxBit=Math.pow(2,depth)-1;var rawPos=0;var images;var getPxPos;if(interlace){images=interlaceUtils.getImagePasses(width,height);getPxPos=interlaceUtils.getInterlaceIterator(width,height);}else {var nonInterlacedPxPos=0;getPxPos=function getPxPos(){var returner=nonInterlacedPxPos;nonInterlacedPxPos+=4;return returner;};images=[{width:width,height:height}];}for(var imageIndex=0;imageIndex<images.length;imageIndex++){if(depth===8){rawPos=mapImage8Bit(images[imageIndex],pxData,getPxPos,bpp,data,rawPos);}else {mapImageCustomBit(images[imageIndex],pxData,getPxPos,bpp,bits,maxBit);}}if(depth===8){if(rawPos!==data.length){throw new Error('extra data found');}}else {bits.end();}return pxData;};}).call(this,require("buffer").Buffer);},{"./interlace":72,"buffer":14}],63:[function(require,module,exports){(function(Buffer){'use strict';var constants=require('./constants');module.exports=function(data,width,height,options){var outHasAlpha=options.colorType===constants.COLORTYPE_COLOR_ALPHA;if(options.inputHasAlpha&&outHasAlpha){return data;}if(!options.inputHasAlpha&&!outHasAlpha){return data;}var outBpp=outHasAlpha?4:3;var outData=new Buffer(width*height*outBpp);var inBpp=options.inputHasAlpha?4:3;var inIndex=0;var outIndex=0;var bgColor=options.bgColor||{};if(bgColor.red===undefined){bgColor.red=255;}if(bgColor.green===undefined){bgColor.green=255;}if(bgColor.blue===undefined){bgColor.blue=255;}for(var y=0;y<height;y++){for(var x=0;x<width;x++){var red=data[inIndex];var green=data[inIndex+1];var blue=data[inIndex+2];var alpha;if(options.inputHasAlpha){alpha=data[inIndex+3];if(!outHasAlpha){alpha/=255;red=Math.min(Math.max(Math.round((1-alpha)*bgColor.red+alpha*red),0),255);green=Math.min(Math.max(Math.round((1-alpha)*bgColor.green+alpha*green),0),255);blue=Math.min(Math.max(Math.round((1-alpha)*bgColor.blue+alpha*blue),0),255);}}else {alpha=255;}outData[outIndex]=red;outData[outIndex+1]=green;outData[outIndex+2]=blue;if(outHasAlpha){outData[outIndex+3]=alpha;}inIndex+=inBpp;outIndex+=outBpp;}}return outData;};}).call(this,require("buffer").Buffer);},{"./constants":65,"buffer":14}],64:[function(require,module,exports){(function(process,Buffer){'use strict';var util=require('util');var Stream=require('stream');var ChunkStream=module.exports=function(){Stream.call(this);this._buffers=[];this._buffered=0;this._reads=[];this._paused=false;this._encoding='utf8';this.writable=true;};util.inherits(ChunkStream,Stream);ChunkStream.prototype.read=function(length,callback){this._reads.push({length:Math.abs(length), // if length < 0 then at most this length
allowLess:length<0,func:callback});process.nextTick(function(){this._process(); // its paused and there is not enought data then ask for more
if(this._paused&&this._reads.length>0){this._paused=false;this.emit('drain');}}.bind(this));};ChunkStream.prototype.write=function(data,encoding){if(!this.writable){this.emit('error',new Error('Stream not writable'));return false;}var dataBuffer;if(Buffer.isBuffer(data)){dataBuffer=data;}else {dataBuffer=new Buffer(data,encoding||this._encoding);}this._buffers.push(dataBuffer);this._buffered+=dataBuffer.length;this._process(); // ok if there are no more read requests
if(this._reads&&this._reads.length===0){this._paused=true;}return this.writable&&!this._paused;};ChunkStream.prototype.end=function(data,encoding){if(data){this.write(data,encoding);}this.writable=false; // already destroyed
if(!this._buffers){return;} // enqueue or handle end
if(this._buffers.length===0){this._end();}else {this._buffers.push(null);this._process();}};ChunkStream.prototype.destroySoon=ChunkStream.prototype.end;ChunkStream.prototype._end=function(){if(this._reads.length>0){this.emit('error',new Error('There are some read requests waitng on finished stream'));}this.destroy();};ChunkStream.prototype.destroy=function(){if(!this._buffers){return;}this.writable=false;this._reads=null;this._buffers=null;this.emit('close');};ChunkStream.prototype._processReadAllowingLess=function(read){ // ok there is any data so that we can satisfy this request
this._reads.shift(); // == read
// first we need to peek into first buffer
var smallerBuf=this._buffers[0]; // ok there is more data than we need
if(smallerBuf.length>read.length){this._buffered-=read.length;this._buffers[0]=smallerBuf.slice(read.length);read.func.call(this,smallerBuf.slice(0,read.length));}else { // ok this is less than maximum length so use it all
this._buffered-=smallerBuf.length;this._buffers.shift(); // == smallerBuf
read.func.call(this,smallerBuf);}};ChunkStream.prototype._processRead=function(read){this._reads.shift(); // == read
var pos=0;var count=0;var data=new Buffer(read.length); // create buffer for all data
while(pos<read.length){var buf=this._buffers[count++];var len=Math.min(buf.length,read.length-pos);buf.copy(data,pos,0,len);pos+=len; // last buffer wasn't used all so just slice it and leave
if(len!==buf.length){this._buffers[--count]=buf.slice(len);}} // remove all used buffers
if(count>0){this._buffers.splice(0,count);}this._buffered-=read.length;read.func.call(this,data);};ChunkStream.prototype._process=function(){try{ // as long as there is any data and read requests
while(this._buffered>0&&this._reads&&this._reads.length>0){var read=this._reads[0]; // read any data (but no more than length)
if(read.allowLess){this._processReadAllowingLess(read);}else if(this._buffered>=read.length){ // ok we can meet some expectations
this._processRead(read);}else { // not enought data to satisfy first request in queue
// so we need to wait for more
break;}}if(this._buffers&&this._buffers.length>0&&this._buffers[0]===null){this._end();}}catch(ex){this.emit('error',ex);}};}).call(this,require('_process'),require("buffer").Buffer);},{"_process":12,"buffer":14,"stream":95,"util":104}],65:[function(require,module,exports){'use strict';module.exports={PNG_SIGNATURE:[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a],TYPE_IHDR:0x49484452,TYPE_IEND:0x49454e44,TYPE_IDAT:0x49444154,TYPE_PLTE:0x504c5445,TYPE_tRNS:0x74524e53, // eslint-disable-line camelcase
TYPE_gAMA:0x67414d41, // eslint-disable-line camelcase
// color-type bits
COLORTYPE_GRAYSCALE:0,COLORTYPE_PALETTE:1,COLORTYPE_COLOR:2,COLORTYPE_ALPHA:4, // e.g. grayscale and alpha
// color-type combinations
COLORTYPE_PALETTE_COLOR:3,COLORTYPE_COLOR_ALPHA:6,COLORTYPE_TO_BPP_MAP:{0:1,2:3,3:1,4:2,6:4},GAMMA_DIVISION:100000};},{}],66:[function(require,module,exports){'use strict';var crcTable=[];(function(){for(var i=0;i<256;i++){var currentCrc=i;for(var j=0;j<8;j++){if(currentCrc&1){currentCrc=0xedb88320^currentCrc>>>1;}else {currentCrc=currentCrc>>>1;}}crcTable[i]=currentCrc;}})();var CrcCalculator=module.exports=function(){this._crc=-1;};CrcCalculator.prototype.write=function(data){for(var i=0;i<data.length;i++){this._crc=crcTable[(this._crc^data[i])&0xff]^this._crc>>>8;}return true;};CrcCalculator.prototype.crc32=function(){return this._crc^-1;};CrcCalculator.crc32=function(buf){var crc=-1;for(var i=0;i<buf.length;i++){crc=crcTable[(crc^buf[i])&0xff]^crc>>>8;}return crc^-1;};},{}],67:[function(require,module,exports){(function(Buffer){'use strict';var paethPredictor=require('./paeth-predictor');function filterNone(pxData,pxPos,byteWidth,rawData,rawPos){pxData.copy(rawData,rawPos,pxPos,pxPos+byteWidth);}function filterSumNone(pxData,pxPos,byteWidth){var sum=0;var length=pxPos+byteWidth;for(var i=pxPos;i<length;i++){sum+=Math.abs(pxData[i]);}return sum;}function filterSub(pxData,pxPos,byteWidth,rawData,rawPos,bpp){for(var x=0;x<byteWidth;x++){var left=x>=bpp?pxData[pxPos+x-bpp]:0;var val=pxData[pxPos+x]-left;rawData[rawPos+x]=val;}}function filterSumSub(pxData,pxPos,byteWidth,bpp){var sum=0;for(var x=0;x<byteWidth;x++){var left=x>=bpp?pxData[pxPos+x-bpp]:0;var val=pxData[pxPos+x]-left;sum+=Math.abs(val);}return sum;}function filterUp(pxData,pxPos,byteWidth,rawData,rawPos){for(var x=0;x<byteWidth;x++){var up=pxPos>0?pxData[pxPos+x-byteWidth]:0;var val=pxData[pxPos+x]-up;rawData[rawPos+x]=val;}}function filterSumUp(pxData,pxPos,byteWidth){var sum=0;var length=pxPos+byteWidth;for(var x=pxPos;x<length;x++){var up=pxPos>0?pxData[x-byteWidth]:0;var val=pxData[x]-up;sum+=Math.abs(val);}return sum;}function filterAvg(pxData,pxPos,byteWidth,rawData,rawPos,bpp){for(var x=0;x<byteWidth;x++){var left=x>=bpp?pxData[pxPos+x-bpp]:0;var up=pxPos>0?pxData[pxPos+x-byteWidth]:0;var val=pxData[pxPos+x]-(left+up>>1);rawData[rawPos+x]=val;}}function filterSumAvg(pxData,pxPos,byteWidth,bpp){var sum=0;for(var x=0;x<byteWidth;x++){var left=x>=bpp?pxData[pxPos+x-bpp]:0;var up=pxPos>0?pxData[pxPos+x-byteWidth]:0;var val=pxData[pxPos+x]-(left+up>>1);sum+=Math.abs(val);}return sum;}function filterPaeth(pxData,pxPos,byteWidth,rawData,rawPos,bpp){for(var x=0;x<byteWidth;x++){var left=x>=bpp?pxData[pxPos+x-bpp]:0;var up=pxPos>0?pxData[pxPos+x-byteWidth]:0;var upleft=pxPos>0&&x>=bpp?pxData[pxPos+x-(byteWidth+bpp)]:0;var val=pxData[pxPos+x]-paethPredictor(left,up,upleft);rawData[rawPos+x]=val;}}function filterSumPaeth(pxData,pxPos,byteWidth,bpp){var sum=0;for(var x=0;x<byteWidth;x++){var left=x>=bpp?pxData[pxPos+x-bpp]:0;var up=pxPos>0?pxData[pxPos+x-byteWidth]:0;var upleft=pxPos>0&&x>=bpp?pxData[pxPos+x-(byteWidth+bpp)]:0;var val=pxData[pxPos+x]-paethPredictor(left,up,upleft);sum+=Math.abs(val);}return sum;}var filters={0:filterNone,1:filterSub,2:filterUp,3:filterAvg,4:filterPaeth};var filterSums={0:filterSumNone,1:filterSumSub,2:filterSumUp,3:filterSumAvg,4:filterSumPaeth};module.exports=function(pxData,width,height,options,bpp){var filterTypes;if(!('filterType' in options)||options.filterType===-1){filterTypes=[0,1,2,3,4];}else if(typeof options.filterType==='number'){filterTypes=[options.filterType];}else {throw new Error('unrecognised filter types');}var byteWidth=width*bpp;var rawPos=0;var pxPos=0;var rawData=new Buffer((byteWidth+1)*height);var sel=filterTypes[0];for(var y=0;y<height;y++){if(filterTypes.length>1){ // find best filter for this line (with lowest sum of values)
var min=Infinity;for(var i=0;i<filterTypes.length;i++){var sum=filterSums[filterTypes[i]](pxData,pxPos,byteWidth,bpp);if(sum<min){sel=filterTypes[i];min=sum;}}}rawData[rawPos]=sel;rawPos++;filters[sel](pxData,pxPos,byteWidth,rawData,rawPos,bpp);rawPos+=byteWidth;pxPos+=byteWidth;}return rawData;};}).call(this,require("buffer").Buffer);},{"./paeth-predictor":76,"buffer":14}],68:[function(require,module,exports){(function(Buffer){'use strict';var util=require('util');var ChunkStream=require('./chunkstream');var Filter=require('./filter-parse');var FilterAsync=module.exports=function(bitmapInfo){ChunkStream.call(this);var buffers=[];var that=this;this._filter=new Filter(bitmapInfo,{read:this.read.bind(this),write:function write(buffer){buffers.push(buffer);},complete:function complete(){that.emit('complete',Buffer.concat(buffers));}});this._filter.start();};util.inherits(FilterAsync,ChunkStream);}).call(this,require("buffer").Buffer);},{"./chunkstream":64,"./filter-parse":70,"buffer":14,"util":104}],69:[function(require,module,exports){(function(Buffer){'use strict';var SyncReader=require('./sync-reader');var Filter=require('./filter-parse');exports.process=function(inBuffer,bitmapInfo){var outBuffers=[];var reader=new SyncReader(inBuffer);var filter=new Filter(bitmapInfo,{read:reader.read.bind(reader),write:function write(bufferPart){outBuffers.push(bufferPart);},complete:function complete(){}});filter.start();reader.process();return Buffer.concat(outBuffers);};}).call(this,require("buffer").Buffer);},{"./filter-parse":70,"./sync-reader":82,"buffer":14}],70:[function(require,module,exports){(function(Buffer){'use strict';var interlaceUtils=require('./interlace');var paethPredictor=require('./paeth-predictor');function getByteWidth(width,bpp,depth){var byteWidth=width*bpp;if(depth!==8){byteWidth=Math.ceil(byteWidth/(8/depth));}return byteWidth;}var Filter=module.exports=function(bitmapInfo,dependencies){var width=bitmapInfo.width;var height=bitmapInfo.height;var interlace=bitmapInfo.interlace;var bpp=bitmapInfo.bpp;var depth=bitmapInfo.depth;this.read=dependencies.read;this.write=dependencies.write;this.complete=dependencies.complete;this._imageIndex=0;this._images=[];if(interlace){var passes=interlaceUtils.getImagePasses(width,height);for(var i=0;i<passes.length;i++){this._images.push({byteWidth:getByteWidth(passes[i].width,bpp,depth),height:passes[i].height,lineIndex:0});}}else {this._images.push({byteWidth:getByteWidth(width,bpp,depth),height:height,lineIndex:0});} // when filtering the line we look at the pixel to the left
// the spec also says it is done on a byte level regardless of the number of pixels
// so if the depth is byte compatible (8 or 16) we subtract the bpp in order to compare back
// a pixel rather than just a different byte part. However if we are sub byte, we ignore.
if(depth===8){this._xComparison=bpp;}else if(depth===16){this._xComparison=bpp*2;}else {this._xComparison=1;}};Filter.prototype.start=function(){this.read(this._images[this._imageIndex].byteWidth+1,this._reverseFilterLine.bind(this));};Filter.prototype._unFilterType1=function(rawData,unfilteredLine,byteWidth){var xComparison=this._xComparison;var xBiggerThan=xComparison-1;for(var x=0;x<byteWidth;x++){var rawByte=rawData[1+x];var f1Left=x>xBiggerThan?unfilteredLine[x-xComparison]:0;unfilteredLine[x]=rawByte+f1Left;}};Filter.prototype._unFilterType2=function(rawData,unfilteredLine,byteWidth){var lastLine=this._lastLine;for(var x=0;x<byteWidth;x++){var rawByte=rawData[1+x];var f2Up=lastLine?lastLine[x]:0;unfilteredLine[x]=rawByte+f2Up;}};Filter.prototype._unFilterType3=function(rawData,unfilteredLine,byteWidth){var xComparison=this._xComparison;var xBiggerThan=xComparison-1;var lastLine=this._lastLine;for(var x=0;x<byteWidth;x++){var rawByte=rawData[1+x];var f3Up=lastLine?lastLine[x]:0;var f3Left=x>xBiggerThan?unfilteredLine[x-xComparison]:0;var f3Add=Math.floor((f3Left+f3Up)/2);unfilteredLine[x]=rawByte+f3Add;}};Filter.prototype._unFilterType4=function(rawData,unfilteredLine,byteWidth){var xComparison=this._xComparison;var xBiggerThan=xComparison-1;var lastLine=this._lastLine;for(var x=0;x<byteWidth;x++){var rawByte=rawData[1+x];var f4Up=lastLine?lastLine[x]:0;var f4Left=x>xBiggerThan?unfilteredLine[x-xComparison]:0;var f4UpLeft=x>xBiggerThan&&lastLine?lastLine[x-xComparison]:0;var f4Add=paethPredictor(f4Left,f4Up,f4UpLeft);unfilteredLine[x]=rawByte+f4Add;}};Filter.prototype._reverseFilterLine=function(rawData){var filter=rawData[0];var unfilteredLine;var currentImage=this._images[this._imageIndex];var byteWidth=currentImage.byteWidth;if(filter===0){unfilteredLine=rawData.slice(1,byteWidth+1);}else {unfilteredLine=new Buffer(byteWidth);switch(filter){case 1:this._unFilterType1(rawData,unfilteredLine,byteWidth);break;case 2:this._unFilterType2(rawData,unfilteredLine,byteWidth);break;case 3:this._unFilterType3(rawData,unfilteredLine,byteWidth);break;case 4:this._unFilterType4(rawData,unfilteredLine,byteWidth);break;default:throw new Error('Unrecognised filter type - '+filter);}}this.write(unfilteredLine);currentImage.lineIndex++;if(currentImage.lineIndex>=currentImage.height){this._lastLine=null;this._imageIndex++;currentImage=this._images[this._imageIndex];}else {this._lastLine=unfilteredLine;}if(currentImage){ // read, using the byte width that may be from the new current image
this.read(currentImage.byteWidth+1,this._reverseFilterLine.bind(this));}else {this._lastLine=null;this.complete();}};}).call(this,require("buffer").Buffer);},{"./interlace":72,"./paeth-predictor":76,"buffer":14}],71:[function(require,module,exports){(function(Buffer){'use strict';function dePalette(indata,outdata,width,height,palette){var pxPos=0; // use values from palette
for(var y=0;y<height;y++){for(var x=0;x<width;x++){var color=palette[indata[pxPos]];if(!color){throw new Error('index '+indata[pxPos]+' not in palette');}for(var i=0;i<4;i++){outdata[pxPos+i]=color[i];}pxPos+=4;}}}function replaceTransparentColor(indata,outdata,width,height,transColor){var pxPos=0;for(var y=0;y<height;y++){for(var x=0;x<width;x++){var makeTrans=false;if(transColor.length===1){if(transColor[0]===indata[pxPos]){makeTrans=true;}}else if(transColor[0]===indata[pxPos]&&transColor[1]===indata[pxPos+1]&&transColor[2]===indata[pxPos+2]){makeTrans=true;}if(makeTrans){for(var i=0;i<4;i++){outdata[pxPos+i]=0;}}pxPos+=4;}}}function scaleDepth(indata,outdata,width,height,depth){var maxOutSample=255;var maxInSample=Math.pow(2,depth)-1;var pxPos=0;for(var y=0;y<height;y++){for(var x=0;x<width;x++){for(var i=0;i<4;i++){outdata[pxPos+i]=Math.floor(indata[pxPos+i]*maxOutSample/maxInSample+0.5);}pxPos+=4;}}}module.exports=function(indata,imageData){var depth=imageData.depth;var width=imageData.width;var height=imageData.height;var colorType=imageData.colorType;var transColor=imageData.transColor;var palette=imageData.palette;var outdata=indata; // only different for 16 bits
if(colorType===3){ // paletted
dePalette(indata,outdata,width,height,palette);}else {if(transColor){replaceTransparentColor(indata,outdata,width,height,transColor);} // if it needs scaling
if(depth!==8){ // if we need to change the buffer size
if(depth===16){outdata=new Buffer(width*height*4);}scaleDepth(indata,outdata,width,height,depth);}}return outdata;};}).call(this,require("buffer").Buffer);},{"buffer":14}],72:[function(require,module,exports){'use strict'; // Adam 7
//   0 1 2 3 4 5 6 7
// 0 x 6 4 6 x 6 4 6
// 1 7 7 7 7 7 7 7 7
// 2 5 6 5 6 5 6 5 6
// 3 7 7 7 7 7 7 7 7
// 4 3 6 4 6 3 6 4 6
// 5 7 7 7 7 7 7 7 7
// 6 5 6 5 6 5 6 5 6
// 7 7 7 7 7 7 7 7 7
var imagePasses=[{ // pass 1 - 1px
x:[0],y:[0]},{ // pass 2 - 1px
x:[4],y:[0]},{ // pass 3 - 2px
x:[0,4],y:[4]},{ // pass 4 - 4px
x:[2,6],y:[0,4]},{ // pass 5 - 8px
x:[0,2,4,6],y:[2,6]},{ // pass 6 - 16px
x:[1,3,5,7],y:[0,2,4,6]},{ // pass 7 - 32px
x:[0,1,2,3,4,5,6,7],y:[1,3,5,7]}];exports.getImagePasses=function(width,height){var images=[];var xLeftOver=width%8;var yLeftOver=height%8;var xRepeats=(width-xLeftOver)/8;var yRepeats=(height-yLeftOver)/8;for(var i=0;i<imagePasses.length;i++){var pass=imagePasses[i];var passWidth=xRepeats*pass.x.length;var passHeight=yRepeats*pass.y.length;for(var j=0;j<pass.x.length;j++){if(pass.x[j]<xLeftOver){passWidth++;}else {break;}}for(j=0;j<pass.y.length;j++){if(pass.y[j]<yLeftOver){passHeight++;}else {break;}}if(passWidth>0&&passHeight>0){images.push({width:passWidth,height:passHeight,index:i});}}return images;};exports.getInterlaceIterator=function(width){return function(x,y,pass){var outerXLeftOver=x%imagePasses[pass].x.length;var outerX=(x-outerXLeftOver)/imagePasses[pass].x.length*8+imagePasses[pass].x[outerXLeftOver];var outerYLeftOver=y%imagePasses[pass].y.length;var outerY=(y-outerYLeftOver)/imagePasses[pass].y.length*8+imagePasses[pass].y[outerYLeftOver];return outerX*4+outerY*width*4;};};},{}],73:[function(require,module,exports){(function(Buffer){'use strict';var util=require('util');var Stream=require('stream');var constants=require('./constants');var Packer=require('./packer');var PackerAsync=module.exports=function(opt){Stream.call(this);var options=opt||{};this._packer=new Packer(options);this._deflate=this._packer.createDeflate();this.readable=true;};util.inherits(PackerAsync,Stream);PackerAsync.prototype.pack=function(data,width,height,gamma){ // Signature
this.emit('data',new Buffer(constants.PNG_SIGNATURE));this.emit('data',this._packer.packIHDR(width,height));if(gamma){this.emit('data',this._packer.packGAMA(gamma));}var filteredData=this._packer.filterData(data,width,height); // compress it
this._deflate.on('error',this.emit.bind(this,'error'));this._deflate.on('data',function(compressedData){this.emit('data',this._packer.packIDAT(compressedData));}.bind(this));this._deflate.on('end',function(){this.emit('data',this._packer.packIEND());this.emit('end');}.bind(this));this._deflate.end(filteredData);};}).call(this,require("buffer").Buffer);},{"./constants":65,"./packer":75,"buffer":14,"stream":95,"util":104}],74:[function(require,module,exports){(function(Buffer){'use strict';var zlib=require('zlib');var constants=require('./constants');var Packer=require('./packer');module.exports=function(metaData,opt){var options=opt||{};var packer=new Packer(options);var chunks=[]; // Signature
chunks.push(new Buffer(constants.PNG_SIGNATURE)); // Header
chunks.push(packer.packIHDR(metaData.width,metaData.height));if(metaData.gamma){chunks.push(packer.packGAMA(metaData.gamma));}var filteredData=packer.filterData(metaData.data,metaData.width,metaData.height); // compress it
var compressedData=zlib.deflateSync(filteredData,packer.getDeflateOptions());filteredData=null;if(!compressedData||!compressedData.length){throw new Error('bad png - invalid compressed data response');}chunks.push(packer.packIDAT(compressedData)); // End
chunks.push(packer.packIEND());return Buffer.concat(chunks);};}).call(this,require("buffer").Buffer);},{"./constants":65,"./packer":75,"buffer":14,"zlib":10}],75:[function(require,module,exports){(function(Buffer){'use strict';var constants=require('./constants');var CrcStream=require('./crc');var bitPacker=require('./bitpacker');var filter=require('./filter-pack');var zlib=require('zlib');var Packer=module.exports=function(options){this._options=options;options.deflateChunkSize=options.deflateChunkSize||32*1024;options.deflateLevel=options.deflateLevel!=null?options.deflateLevel:9;options.deflateStrategy=options.deflateStrategy!=null?options.deflateStrategy:3;options.inputHasAlpha=options.inputHasAlpha!=null?options.inputHasAlpha:true;options.deflateFactory=options.deflateFactory||zlib.createDeflate;options.bitDepth=options.bitDepth||8;options.colorType=typeof options.colorType==='number'?options.colorType:constants.COLORTYPE_COLOR_ALPHA;if(options.colorType!==constants.COLORTYPE_COLOR&&options.colorType!==constants.COLORTYPE_COLOR_ALPHA){throw new Error('option color type:'+options.colorType+' is not supported at present');}if(options.bitDepth!==8){throw new Error('option bit depth:'+options.bitDepth+' is not supported at present');}};Packer.prototype.getDeflateOptions=function(){return {chunkSize:this._options.deflateChunkSize,level:this._options.deflateLevel,strategy:this._options.deflateStrategy};};Packer.prototype.createDeflate=function(){return this._options.deflateFactory(this.getDeflateOptions());};Packer.prototype.filterData=function(data,width,height){ // convert to correct format for filtering (e.g. right bpp and bit depth)
var packedData=bitPacker(data,width,height,this._options); // filter pixel data
var bpp=constants.COLORTYPE_TO_BPP_MAP[this._options.colorType];var filteredData=filter(packedData,width,height,this._options,bpp);return filteredData;};Packer.prototype._packChunk=function(type,data){var len=data?data.length:0;var buf=new Buffer(len+12);buf.writeUInt32BE(len,0);buf.writeUInt32BE(type,4);if(data){data.copy(buf,8);}buf.writeInt32BE(CrcStream.crc32(buf.slice(4,buf.length-4)),buf.length-4);return buf;};Packer.prototype.packGAMA=function(gamma){var buf=new Buffer(4);buf.writeUInt32BE(Math.floor(gamma*constants.GAMMA_DIVISION),0);return this._packChunk(constants.TYPE_gAMA,buf);};Packer.prototype.packIHDR=function(width,height){var buf=new Buffer(13);buf.writeUInt32BE(width,0);buf.writeUInt32BE(height,4);buf[8]=this._options.bitDepth; // Bit depth
buf[9]=this._options.colorType; // colorType
buf[10]=0; // compression
buf[11]=0; // filter
buf[12]=0; // interlace
return this._packChunk(constants.TYPE_IHDR,buf);};Packer.prototype.packIDAT=function(data){return this._packChunk(constants.TYPE_IDAT,data);};Packer.prototype.packIEND=function(){return this._packChunk(constants.TYPE_IEND,null);};}).call(this,require("buffer").Buffer);},{"./bitpacker":63,"./constants":65,"./crc":66,"./filter-pack":67,"buffer":14,"zlib":10}],76:[function(require,module,exports){'use strict';module.exports=function paethPredictor(left,above,upLeft){var paeth=left+above-upLeft;var pLeft=Math.abs(paeth-left);var pAbove=Math.abs(paeth-above);var pUpLeft=Math.abs(paeth-upLeft);if(pLeft<=pAbove&&pLeft<=pUpLeft){return left;}if(pAbove<=pUpLeft){return above;}return upLeft;};},{}],77:[function(require,module,exports){'use strict';var util=require('util');var zlib=require('zlib');var ChunkStream=require('./chunkstream');var FilterAsync=require('./filter-parse-async');var Parser=require('./parser');var bitmapper=require('./bitmapper');var formatNormaliser=require('./format-normaliser');var ParserAsync=module.exports=function(options){ChunkStream.call(this);this._parser=new Parser(options,{read:this.read.bind(this),error:this._handleError.bind(this),metadata:this._handleMetaData.bind(this),gamma:this.emit.bind(this,'gamma'),palette:this._handlePalette.bind(this),transColor:this._handleTransColor.bind(this),finished:this._finished.bind(this),inflateData:this._inflateData.bind(this)});this._options=options;this.writable=true;this._parser.start();};util.inherits(ParserAsync,ChunkStream);ParserAsync.prototype._handleError=function(err){this.emit('error',err);this.writable=false;this.destroy();if(this._inflate&&this._inflate.destroy){this._inflate.destroy();}this.errord=true;};ParserAsync.prototype._inflateData=function(data){if(!this._inflate){this._inflate=zlib.createInflate();this._inflate.on('error',this.emit.bind(this,'error'));this._filter.on('complete',this._complete.bind(this));this._inflate.pipe(this._filter);}this._inflate.write(data);};ParserAsync.prototype._handleMetaData=function(metaData){this.emit('metadata',metaData);this._bitmapInfo=Object.create(metaData);this._filter=new FilterAsync(this._bitmapInfo);};ParserAsync.prototype._handleTransColor=function(transColor){this._bitmapInfo.transColor=transColor;};ParserAsync.prototype._handlePalette=function(palette){this._bitmapInfo.palette=palette;};ParserAsync.prototype._finished=function(){if(this.errord){return;}if(!this._inflate){this.emit('error','No Inflate block');}else { // no more data to inflate
this._inflate.end();}this.destroySoon();};ParserAsync.prototype._complete=function(filteredData){if(this.errord){return;}try{var bitmapData=bitmapper.dataToBitMap(filteredData,this._bitmapInfo);var normalisedBitmapData=formatNormaliser(bitmapData,this._bitmapInfo);bitmapData=null;}catch(ex){this._handleError(ex);return;}this.emit('parsed',normalisedBitmapData);};},{"./bitmapper":62,"./chunkstream":64,"./filter-parse-async":68,"./format-normaliser":71,"./parser":79,"util":104,"zlib":10}],78:[function(require,module,exports){(function(Buffer){'use strict';var zlib=require('zlib');var SyncReader=require('./sync-reader');var FilterSync=require('./filter-parse-sync');var Parser=require('./parser');var bitmapper=require('./bitmapper');var formatNormaliser=require('./format-normaliser');module.exports=function(buffer,options){var err;function handleError(_err_){err=_err_;}var metaData;function handleMetaData(_metaData_){metaData=_metaData_;}function handleTransColor(transColor){metaData.transColor=transColor;}function handlePalette(palette){metaData.palette=palette;}var gamma;function handleGamma(_gamma_){gamma=_gamma_;}var inflateDataList=[];function handleInflateData(inflatedData){inflateDataList.push(inflatedData);}var reader=new SyncReader(buffer);var parser=new Parser(options,{read:reader.read.bind(reader),error:handleError,metadata:handleMetaData,gamma:handleGamma,palette:handlePalette,transColor:handleTransColor,inflateData:handleInflateData});parser.start();reader.process();if(err){throw err;} //join together the inflate datas
var inflateData=Buffer.concat(inflateDataList);inflateDataList.length=0;var inflatedData=zlib.inflateSync(inflateData);inflateData=null;if(!inflatedData||!inflatedData.length){throw new Error('bad png - invalid inflate data response');}var unfilteredData=FilterSync.process(inflatedData,metaData);inflateData=null;var bitmapData=bitmapper.dataToBitMap(unfilteredData,metaData);unfilteredData=null;var normalisedBitmapData=formatNormaliser(bitmapData,metaData);metaData.data=normalisedBitmapData;metaData.gamma=gamma||0;return metaData;};}).call(this,require("buffer").Buffer);},{"./bitmapper":62,"./filter-parse-sync":69,"./format-normaliser":71,"./parser":79,"./sync-reader":82,"buffer":14,"zlib":10}],79:[function(require,module,exports){(function(Buffer){'use strict';var constants=require('./constants');var CrcCalculator=require('./crc');var Parser=module.exports=function(options,dependencies){this._options=options;options.checkCRC=options.checkCRC!==false;this._hasIHDR=false;this._hasIEND=false; // input flags/metadata
this._palette=[];this._colorType=0;this._chunks={};this._chunks[constants.TYPE_IHDR]=this._handleIHDR.bind(this);this._chunks[constants.TYPE_IEND]=this._handleIEND.bind(this);this._chunks[constants.TYPE_IDAT]=this._handleIDAT.bind(this);this._chunks[constants.TYPE_PLTE]=this._handlePLTE.bind(this);this._chunks[constants.TYPE_tRNS]=this._handleTRNS.bind(this);this._chunks[constants.TYPE_gAMA]=this._handleGAMA.bind(this);this.read=dependencies.read;this.error=dependencies.error;this.metadata=dependencies.metadata;this.gamma=dependencies.gamma;this.transColor=dependencies.transColor;this.palette=dependencies.palette;this.parsed=dependencies.parsed;this.inflateData=dependencies.inflateData;this.inflateData=dependencies.inflateData;this.finished=dependencies.finished;};Parser.prototype.start=function(){this.read(constants.PNG_SIGNATURE.length,this._parseSignature.bind(this));};Parser.prototype._parseSignature=function(data){var signature=constants.PNG_SIGNATURE;for(var i=0;i<signature.length;i++){if(data[i]!==signature[i]){this.error(new Error('Invalid file signature'));return;}}this.read(8,this._parseChunkBegin.bind(this));};Parser.prototype._parseChunkBegin=function(data){ // chunk content length
var length=data.readUInt32BE(0); // chunk type
var type=data.readUInt32BE(4);var name='';for(var i=4;i<8;i++){name+=String.fromCharCode(data[i]);} //console.log('chunk ', name, length);
// chunk flags
var ancillary=Boolean(data[4]&0x20); // or critical
//    priv = Boolean(data[5] & 0x20), // or public
//    safeToCopy = Boolean(data[7] & 0x20); // or unsafe
if(!this._hasIHDR&&type!==constants.TYPE_IHDR){this.error(new Error('Expected IHDR on beggining'));return;}this._crc=new CrcCalculator();this._crc.write(new Buffer(name));if(this._chunks[type]){return this._chunks[type](length);}if(!ancillary){this.error(new Error('Unsupported critical chunk type '+name));return;}this.read(length+4,this._skipChunk.bind(this));};Parser.prototype._skipChunk=function() /*data*/{this.read(8,this._parseChunkBegin.bind(this));};Parser.prototype._handleChunkEnd=function(){this.read(4,this._parseChunkEnd.bind(this));};Parser.prototype._parseChunkEnd=function(data){var fileCrc=data.readInt32BE(0);var calcCrc=this._crc.crc32(); // check CRC
if(this._options.checkCRC&&calcCrc!==fileCrc){this.error(new Error('Crc error - '+fileCrc+' - '+calcCrc));return;}if(!this._hasIEND){this.read(8,this._parseChunkBegin.bind(this));}};Parser.prototype._handleIHDR=function(length){this.read(length,this._parseIHDR.bind(this));};Parser.prototype._parseIHDR=function(data){this._crc.write(data);var width=data.readUInt32BE(0);var height=data.readUInt32BE(4);var depth=data[8];var colorType=data[9]; // bits: 1 palette, 2 color, 4 alpha
var compr=data[10];var filter=data[11];var interlace=data[12]; // console.log('    width', width, 'height', height,
//     'depth', depth, 'colorType', colorType,
//     'compr', compr, 'filter', filter, 'interlace', interlace
// );
if(depth!==8&&depth!==4&&depth!==2&&depth!==1&&depth!==16){this.error(new Error('Unsupported bit depth '+depth));return;}if(!(colorType in constants.COLORTYPE_TO_BPP_MAP)){this.error(new Error('Unsupported color type'));return;}if(compr!==0){this.error(new Error('Unsupported compression method'));return;}if(filter!==0){this.error(new Error('Unsupported filter method'));return;}if(interlace!==0&&interlace!==1){this.error(new Error('Unsupported interlace method'));return;}this._colorType=colorType;var bpp=constants.COLORTYPE_TO_BPP_MAP[this._colorType];this._hasIHDR=true;this.metadata({width:width,height:height,depth:depth,interlace:Boolean(interlace),palette:Boolean(colorType&constants.COLORTYPE_PALETTE),color:Boolean(colorType&constants.COLORTYPE_COLOR),alpha:Boolean(colorType&constants.COLORTYPE_ALPHA),bpp:bpp,colorType:colorType});this._handleChunkEnd();};Parser.prototype._handlePLTE=function(length){this.read(length,this._parsePLTE.bind(this));};Parser.prototype._parsePLTE=function(data){this._crc.write(data);var entries=Math.floor(data.length/3); // console.log('Palette:', entries);
for(var i=0;i<entries;i++){this._palette.push([data[i*3],data[i*3+1],data[i*3+2],0xff]);}this.palette(this._palette);this._handleChunkEnd();};Parser.prototype._handleTRNS=function(length){this.read(length,this._parseTRNS.bind(this));};Parser.prototype._parseTRNS=function(data){this._crc.write(data); // palette
if(this._colorType===constants.COLORTYPE_PALETTE_COLOR){if(this._palette.length===0){this.error(new Error('Transparency chunk must be after palette'));return;}if(data.length>this._palette.length){this.error(new Error('More transparent colors than palette size'));return;}for(var i=0;i<data.length;i++){this._palette[i][3]=data[i];}this.palette(this._palette);} // for colorType 0 (grayscale) and 2 (rgb)
// there might be one gray/color defined as transparent
if(this._colorType===constants.COLORTYPE_GRAYSCALE){ // grey, 2 bytes
this.transColor([data.readUInt16BE(0)]);}if(this._colorType===constants.COLORTYPE_COLOR){this.transColor([data.readUInt16BE(0),data.readUInt16BE(2),data.readUInt16BE(4)]);}this._handleChunkEnd();};Parser.prototype._handleGAMA=function(length){this.read(length,this._parseGAMA.bind(this));};Parser.prototype._parseGAMA=function(data){this._crc.write(data);this.gamma(data.readUInt32BE(0)/constants.GAMMA_DIVISION);this._handleChunkEnd();};Parser.prototype._handleIDAT=function(length){this.read(-length,this._parseIDAT.bind(this,length));};Parser.prototype._parseIDAT=function(length,data){this._crc.write(data);if(this._colorType===constants.COLORTYPE_PALETTE_COLOR&&this._palette.length===0){throw new Error('Expected palette not found');}this.inflateData(data);var leftOverLength=length-data.length;if(leftOverLength>0){this._handleIDAT(leftOverLength);}else {this._handleChunkEnd();}};Parser.prototype._handleIEND=function(length){this.read(length,this._parseIEND.bind(this));};Parser.prototype._parseIEND=function(data){this._crc.write(data);this._hasIEND=true;this._handleChunkEnd();if(this.finished){this.finished();}};}).call(this,require("buffer").Buffer);},{"./constants":65,"./crc":66,"buffer":14}],80:[function(require,module,exports){'use strict';var parse=require('./parser-sync');var pack=require('./packer-sync');exports.read=function(buffer,options){return parse(buffer,options||{});};exports.write=function(png){return pack(png);};},{"./packer-sync":74,"./parser-sync":78}],81:[function(require,module,exports){(function(process,Buffer){'use strict';var util=require('util');var Stream=require('stream');var Parser=require('./parser-async');var Packer=require('./packer-async');var PNGSync=require('./png-sync');var PNG=exports.PNG=function(options){Stream.call(this);options=options||{}; // eslint-disable-line no-param-reassign
this.width=options.width||0;this.height=options.height||0;this.data=this.width>0&&this.height>0?new Buffer(4*this.width*this.height):null;if(options.fill&&this.data){this.data.fill(0);}this.gamma=0;this.readable=this.writable=true;this._parser=new Parser(options);this._parser.on('error',this.emit.bind(this,'error'));this._parser.on('close',this._handleClose.bind(this));this._parser.on('metadata',this._metadata.bind(this));this._parser.on('gamma',this._gamma.bind(this));this._parser.on('parsed',function(data){this.data=data;this.emit('parsed',data);}.bind(this));this._packer=new Packer(options);this._packer.on('data',this.emit.bind(this,'data'));this._packer.on('end',this.emit.bind(this,'end'));this._parser.on('close',this._handleClose.bind(this));this._packer.on('error',this.emit.bind(this,'error'));};util.inherits(PNG,Stream);PNG.sync=PNGSync;PNG.prototype.pack=function(){if(!this.data||!this.data.length){this.emit('error','No data provided');return this;}process.nextTick(function(){this._packer.pack(this.data,this.width,this.height,this.gamma);}.bind(this));return this;};PNG.prototype.parse=function(data,callback){if(callback){var onParsed,onError;onParsed=function(parsedData){this.removeListener('error',onError);this.data=parsedData;callback(null,this);}.bind(this);onError=function(err){this.removeListener('parsed',onParsed);callback(err,null);}.bind(this);this.once('parsed',onParsed);this.once('error',onError);}this.end(data);return this;};PNG.prototype.write=function(data){this._parser.write(data);return true;};PNG.prototype.end=function(data){this._parser.end(data);};PNG.prototype._metadata=function(metadata){this.width=metadata.width;this.height=metadata.height;this.emit('metadata',metadata);};PNG.prototype._gamma=function(gamma){this.gamma=gamma;};PNG.prototype._handleClose=function(){if(!this._parser.writable&&!this._packer.readable){this.emit('close');}};PNG.bitblt=function(src,dst,srcX,srcY,width,height,deltaX,deltaY){ // eslint-disable-line max-params
if(srcX>src.width||srcY>src.height||srcX+width>src.width||srcY+height>src.height){throw new Error('bitblt reading outside image');}if(deltaX>dst.width||deltaY>dst.height||deltaX+width>dst.width||deltaY+height>dst.height){throw new Error('bitblt writing outside image');}for(var y=0;y<height;y++){src.data.copy(dst.data,(deltaY+y)*dst.width+deltaX<<2,(srcY+y)*src.width+srcX<<2,(srcY+y)*src.width+srcX+width<<2);}};PNG.prototype.bitblt=function(dst,srcX,srcY,width,height,deltaX,deltaY){ // eslint-disable-line max-params
PNG.bitblt(this,dst,srcX,srcY,width,height,deltaX,deltaY);return this;};PNG.adjustGamma=function(src){if(src.gamma){for(var y=0;y<src.height;y++){for(var x=0;x<src.width;x++){var idx=src.width*y+x<<2;for(var i=0;i<3;i++){var sample=src.data[idx+i]/255;sample=Math.pow(sample,1/2.2/src.gamma);src.data[idx+i]=Math.round(sample*255);}}}src.gamma=0;}};PNG.prototype.adjustGamma=function(){PNG.adjustGamma(this);};}).call(this,require('_process'),require("buffer").Buffer);},{"./packer-async":73,"./parser-async":77,"./png-sync":80,"_process":12,"buffer":14,"stream":95,"util":104}],82:[function(require,module,exports){'use strict';var SyncReader=module.exports=function(buffer){this._buffer=buffer;this._reads=[];};SyncReader.prototype.read=function(length,callback){this._reads.push({length:Math.abs(length), // if length < 0 then at most this length
allowLess:length<0,func:callback});};SyncReader.prototype.process=function(){ // as long as there is any data and read requests
while(this._reads.length>0&&this._buffer.length){var read=this._reads[0];if(this._buffer.length&&(this._buffer.length>=read.length||read.allowLess)){ // ok there is any data so that we can satisfy this request
this._reads.shift(); // == read
var buf=this._buffer;this._buffer=buf.slice(read.length);read.func.call(this,buf.slice(0,read.length));}else {break;}}if(this._reads.length>0){return new Error('There are some read requests waitng on finished stream');}if(this._buffer.length>0){return new Error('unrecognised content at end of stream');}};},{}],83:[function(require,module,exports){(function(process){'use strict';if(!process.version||process.version.indexOf('v0.')===0||process.version.indexOf('v1.')===0&&process.version.indexOf('v1.8.')!==0){module.exports=nextTick;}else {module.exports=process.nextTick;}function nextTick(fn){var args=new Array(arguments.length-1);var i=0;while(i<args.length){args[i++]=arguments[i];}process.nextTick(function afterTick(){fn.apply(null,args);});}}).call(this,require('_process'));},{"_process":12}],84:[function(require,module,exports){(function(Buffer){'use strict';var fs=require('fs');module.exports=function(filepath,pos,len,cb){var buf=new Buffer(len);fs.open(filepath,'r',function(err,fd){if(err){return cb(err);}fs.read(fd,buf,0,len,pos,function(err,bytesRead,buf){if(err){return cb(err);}fs.close(fd,function(err){if(err){return cb(err);}if(bytesRead<len){buf=buf.slice(0,bytesRead);}cb(null,buf);});});});};module.exports.sync=function(filepath,pos,len){var buf=new Buffer(len);var fd=fs.openSync(filepath,'r');var bytesRead=fs.readSync(fd,buf,0,len,pos);fs.closeSync(fd);if(bytesRead<len){buf=buf.slice(0,bytesRead);}return buf;};}).call(this,require("buffer").Buffer);},{"buffer":14,"fs":11}],85:[function(require,module,exports){module.exports=require("./lib/_stream_duplex.js");},{"./lib/_stream_duplex.js":86}],86:[function(require,module,exports){ // a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.
'use strict'; /*<replacement>*/var objectKeys=Object.keys||function(obj){var keys=[];for(var key in obj){keys.push(key);}return keys;}; /*</replacement>*/module.exports=Duplex; /*<replacement>*/var processNextTick=require('process-nextick-args'); /*</replacement>*/ /*<replacement>*/var util=require('core-util-is');util.inherits=require('inherits'); /*</replacement>*/var Readable=require('./_stream_readable');var Writable=require('./_stream_writable');util.inherits(Duplex,Readable);var keys=objectKeys(Writable.prototype);for(var v=0;v<keys.length;v++){var method=keys[v];if(!Duplex.prototype[method])Duplex.prototype[method]=Writable.prototype[method];}function Duplex(options){if(!(this instanceof Duplex))return new Duplex(options);Readable.call(this,options);Writable.call(this,options);if(options&&options.readable===false)this.readable=false;if(options&&options.writable===false)this.writable=false;this.allowHalfOpen=true;if(options&&options.allowHalfOpen===false)this.allowHalfOpen=false;this.once('end',onend);} // the no-half-open enforcer
function onend(){ // if we allow half-open state, or if the writable side ended,
// then we're ok.
if(this.allowHalfOpen||this._writableState.ended)return; // no more data can be written.
// But allow more writes to happen in this tick.
processNextTick(onEndNT,this);}function onEndNT(self){self.end();}function forEach(xs,f){for(var i=0,l=xs.length;i<l;i++){f(xs[i],i);}}},{"./_stream_readable":88,"./_stream_writable":90,"core-util-is":15,"inherits":31,"process-nextick-args":83}],87:[function(require,module,exports){ // a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.
'use strict';module.exports=PassThrough;var Transform=require('./_stream_transform'); /*<replacement>*/var util=require('core-util-is');util.inherits=require('inherits'); /*</replacement>*/util.inherits(PassThrough,Transform);function PassThrough(options){if(!(this instanceof PassThrough))return new PassThrough(options);Transform.call(this,options);}PassThrough.prototype._transform=function(chunk,encoding,cb){cb(null,chunk);};},{"./_stream_transform":89,"core-util-is":15,"inherits":31}],88:[function(require,module,exports){(function(process){'use strict';module.exports=Readable; /*<replacement>*/var processNextTick=require('process-nextick-args'); /*</replacement>*/ /*<replacement>*/var isArray=require('isarray'); /*</replacement>*/ /*<replacement>*/var Buffer=require('buffer').Buffer; /*</replacement>*/Readable.ReadableState=ReadableState;var EE=require('events'); /*<replacement>*/var EElistenerCount=function EElistenerCount(emitter,type){return emitter.listeners(type).length;}; /*</replacement>*/ /*<replacement>*/var Stream;(function(){try{Stream=require('st'+'ream');}catch(_){}finally {if(!Stream)Stream=require('events').EventEmitter;}})(); /*</replacement>*/var Buffer=require('buffer').Buffer; /*<replacement>*/var util=require('core-util-is');util.inherits=require('inherits'); /*</replacement>*/ /*<replacement>*/var debugUtil=require('util');var debug=undefined;if(debugUtil&&debugUtil.debuglog){debug=debugUtil.debuglog('stream');}else {debug=function debug(){};} /*</replacement>*/var StringDecoder;util.inherits(Readable,Stream);var Duplex;function ReadableState(options,stream){Duplex=Duplex||require('./_stream_duplex');options=options||{}; // object stream flag. Used to make read(n) ignore n and to
// make all the buffer merging and length checks go away
this.objectMode=!!options.objectMode;if(stream instanceof Duplex)this.objectMode=this.objectMode||!!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
// Note: 0 is a valid value, means "don't call _read preemptively ever"
var hwm=options.highWaterMark;var defaultHwm=this.objectMode?16:16*1024;this.highWaterMark=hwm||hwm===0?hwm:defaultHwm; // cast to ints.
this.highWaterMark=~ ~this.highWaterMark;this.buffer=[];this.length=0;this.pipes=null;this.pipesCount=0;this.flowing=null;this.ended=false;this.endEmitted=false;this.reading=false; // a flag to be able to tell if the onwrite cb is called immediately,
// or on a later tick.  We set this to true at first, because any
// actions that shouldn't happen until "later" should generally also
// not happen before the first write call.
this.sync=true; // whenever we return null, then we set a flag to say
// that we're awaiting a 'readable' event emission.
this.needReadable=false;this.emittedReadable=false;this.readableListening=false;this.resumeScheduled=false; // Crypto is kind of old and crusty.  Historically, its default string
// encoding is 'binary' so we have to make this configurable.
// Everything else in the universe uses 'utf8', though.
this.defaultEncoding=options.defaultEncoding||'utf8'; // when piping, we only care about 'readable' events that happen
// after read()ing all the bytes and not getting any pushback.
this.ranOut=false; // the number of writers that are awaiting a drain event in .pipe()s
this.awaitDrain=0; // if true, a maybeReadMore has been scheduled
this.readingMore=false;this.decoder=null;this.encoding=null;if(options.encoding){if(!StringDecoder)StringDecoder=require('string_decoder/').StringDecoder;this.decoder=new StringDecoder(options.encoding);this.encoding=options.encoding;}}var Duplex;function Readable(options){Duplex=Duplex||require('./_stream_duplex');if(!(this instanceof Readable))return new Readable(options);this._readableState=new ReadableState(options,this); // legacy
this.readable=true;if(options&&typeof options.read==='function')this._read=options.read;Stream.call(this);} // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push=function(chunk,encoding){var state=this._readableState;if(!state.objectMode&&typeof chunk==='string'){encoding=encoding||state.defaultEncoding;if(encoding!==state.encoding){chunk=new Buffer(chunk,encoding);encoding='';}}return readableAddChunk(this,state,chunk,encoding,false);}; // Unshift should *always* be something directly out of read()
Readable.prototype.unshift=function(chunk){var state=this._readableState;return readableAddChunk(this,state,chunk,'',true);};Readable.prototype.isPaused=function(){return this._readableState.flowing===false;};function readableAddChunk(stream,state,chunk,encoding,addToFront){var er=chunkInvalid(state,chunk);if(er){stream.emit('error',er);}else if(chunk===null){state.reading=false;onEofChunk(stream,state);}else if(state.objectMode||chunk&&chunk.length>0){if(state.ended&&!addToFront){var e=new Error('stream.push() after EOF');stream.emit('error',e);}else if(state.endEmitted&&addToFront){var e=new Error('stream.unshift() after end event');stream.emit('error',e);}else {var skipAdd;if(state.decoder&&!addToFront&&!encoding){chunk=state.decoder.write(chunk);skipAdd=!state.objectMode&&chunk.length===0;}if(!addToFront)state.reading=false; // Don't add to the buffer if we've decoded to an empty string chunk and
// we're not in object mode
if(!skipAdd){ // if we want the data now, just emit it.
if(state.flowing&&state.length===0&&!state.sync){stream.emit('data',chunk);stream.read(0);}else { // update the buffer info.
state.length+=state.objectMode?1:chunk.length;if(addToFront)state.buffer.unshift(chunk);else state.buffer.push(chunk);if(state.needReadable)emitReadable(stream);}}maybeReadMore(stream,state);}}else if(!addToFront){state.reading=false;}return needMoreData(state);} // if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state){return !state.ended&&(state.needReadable||state.length<state.highWaterMark||state.length===0);} // backwards compatibility.
Readable.prototype.setEncoding=function(enc){if(!StringDecoder)StringDecoder=require('string_decoder/').StringDecoder;this._readableState.decoder=new StringDecoder(enc);this._readableState.encoding=enc;return this;}; // Don't raise the hwm > 8MB
var MAX_HWM=0x800000;function computeNewHighWaterMark(n){if(n>=MAX_HWM){n=MAX_HWM;}else { // Get the next highest power of 2
n--;n|=n>>>1;n|=n>>>2;n|=n>>>4;n|=n>>>8;n|=n>>>16;n++;}return n;}function howMuchToRead(n,state){if(state.length===0&&state.ended)return 0;if(state.objectMode)return n===0?0:1;if(n===null||isNaN(n)){ // only flow one buffer at a time
if(state.flowing&&state.buffer.length)return state.buffer[0].length;else return state.length;}if(n<=0)return 0; // If we're asking for more than the target buffer level,
// then raise the water mark.  Bump up to the next highest
// power of 2, to prevent increasing it excessively in tiny
// amounts.
if(n>state.highWaterMark)state.highWaterMark=computeNewHighWaterMark(n); // don't have that much.  return null, unless we've ended.
if(n>state.length){if(!state.ended){state.needReadable=true;return 0;}else {return state.length;}}return n;} // you can override either this method, or the async _read(n) below.
Readable.prototype.read=function(n){debug('read',n);var state=this._readableState;var nOrig=n;if(typeof n!=='number'||n>0)state.emittedReadable=false; // if we're doing read(0) to trigger a readable event, but we
// already have a bunch of data in the buffer, then just trigger
// the 'readable' event and move on.
if(n===0&&state.needReadable&&(state.length>=state.highWaterMark||state.ended)){debug('read: emitReadable',state.length,state.ended);if(state.length===0&&state.ended)endReadable(this);else emitReadable(this);return null;}n=howMuchToRead(n,state); // if we've ended, and we're now clear, then finish it up.
if(n===0&&state.ended){if(state.length===0)endReadable(this);return null;} // All the actual chunk generation logic needs to be
// *below* the call to _read.  The reason is that in certain
// synthetic stream cases, such as passthrough streams, _read
// may be a completely synchronous operation which may change
// the state of the read buffer, providing enough data when
// before there was *not* enough.
//
// So, the steps are:
// 1. Figure out what the state of things will be after we do
// a read from the buffer.
//
// 2. If that resulting state will trigger a _read, then call _read.
// Note that this may be asynchronous, or synchronous.  Yes, it is
// deeply ugly to write APIs this way, but that still doesn't mean
// that the Readable class should behave improperly, as streams are
// designed to be sync/async agnostic.
// Take note if the _read call is sync or async (ie, if the read call
// has returned yet), so that we know whether or not it's safe to emit
// 'readable' etc.
//
// 3. Actually pull the requested chunks out of the buffer and return.
// if we need a readable event, then we need to do some reading.
var doRead=state.needReadable;debug('need readable',doRead); // if we currently have less than the highWaterMark, then also read some
if(state.length===0||state.length-n<state.highWaterMark){doRead=true;debug('length less than watermark',doRead);} // however, if we've ended, then there's no point, and if we're already
// reading, then it's unnecessary.
if(state.ended||state.reading){doRead=false;debug('reading or ended',doRead);}if(doRead){debug('do read');state.reading=true;state.sync=true; // if the length is currently zero, then we *need* a readable event.
if(state.length===0)state.needReadable=true; // call internal read method
this._read(state.highWaterMark);state.sync=false;} // If _read pushed data synchronously, then `reading` will be false,
// and we need to re-evaluate how much data we can return to the user.
if(doRead&&!state.reading)n=howMuchToRead(nOrig,state);var ret;if(n>0)ret=fromList(n,state);else ret=null;if(ret===null){state.needReadable=true;n=0;}state.length-=n; // If we have nothing in the buffer, then we want to know
// as soon as we *do* get something into the buffer.
if(state.length===0&&!state.ended)state.needReadable=true; // If we tried to read() past the EOF, then emit end on the next tick.
if(nOrig!==n&&state.ended&&state.length===0)endReadable(this);if(ret!==null)this.emit('data',ret);return ret;};function chunkInvalid(state,chunk){var er=null;if(!Buffer.isBuffer(chunk)&&typeof chunk!=='string'&&chunk!==null&&chunk!==undefined&&!state.objectMode){er=new TypeError('Invalid non-string/buffer chunk');}return er;}function onEofChunk(stream,state){if(state.ended)return;if(state.decoder){var chunk=state.decoder.end();if(chunk&&chunk.length){state.buffer.push(chunk);state.length+=state.objectMode?1:chunk.length;}}state.ended=true; // emit 'readable' now to make sure it gets picked up.
emitReadable(stream);} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream){var state=stream._readableState;state.needReadable=false;if(!state.emittedReadable){debug('emitReadable',state.flowing);state.emittedReadable=true;if(state.sync)processNextTick(emitReadable_,stream);else emitReadable_(stream);}}function emitReadable_(stream){debug('emit readable');stream.emit('readable');flow(stream);} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream,state){if(!state.readingMore){state.readingMore=true;processNextTick(maybeReadMore_,stream,state);}}function maybeReadMore_(stream,state){var len=state.length;while(!state.reading&&!state.flowing&&!state.ended&&state.length<state.highWaterMark){debug('maybeReadMore read 0');stream.read(0);if(len===state.length) // didn't get any data, stop spinning.
break;else len=state.length;}state.readingMore=false;} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read=function(n){this.emit('error',new Error('not implemented'));};Readable.prototype.pipe=function(dest,pipeOpts){var src=this;var state=this._readableState;switch(state.pipesCount){case 0:state.pipes=dest;break;case 1:state.pipes=[state.pipes,dest];break;default:state.pipes.push(dest);break;}state.pipesCount+=1;debug('pipe count=%d opts=%j',state.pipesCount,pipeOpts);var doEnd=(!pipeOpts||pipeOpts.end!==false)&&dest!==process.stdout&&dest!==process.stderr;var endFn=doEnd?onend:cleanup;if(state.endEmitted)processNextTick(endFn);else src.once('end',endFn);dest.on('unpipe',onunpipe);function onunpipe(readable){debug('onunpipe');if(readable===src){cleanup();}}function onend(){debug('onend');dest.end();} // when the dest drains, it reduces the awaitDrain counter
// on the source.  This would be more elegant with a .once()
// handler in flow(), but adding and removing repeatedly is
// too slow.
var ondrain=pipeOnDrain(src);dest.on('drain',ondrain);var cleanedUp=false;function cleanup(){debug('cleanup'); // cleanup event handlers once the pipe is broken
dest.removeListener('close',onclose);dest.removeListener('finish',onfinish);dest.removeListener('drain',ondrain);dest.removeListener('error',onerror);dest.removeListener('unpipe',onunpipe);src.removeListener('end',onend);src.removeListener('end',cleanup);src.removeListener('data',ondata);cleanedUp=true; // if the reader is waiting for a drain event from this
// specific writer, then it would cause it to never start
// flowing again.
// So, if this is awaiting a drain, then we just call it now.
// If we don't know, then assume that we are waiting for one.
if(state.awaitDrain&&(!dest._writableState||dest._writableState.needDrain))ondrain();}src.on('data',ondata);function ondata(chunk){debug('ondata');var ret=dest.write(chunk);if(false===ret){ // If the user unpiped during `dest.write()`, it is possible
// to get stuck in a permanently paused state if that write
// also returned false.
if(state.pipesCount===1&&state.pipes[0]===dest&&src.listenerCount('data')===1&&!cleanedUp){debug('false write response, pause',src._readableState.awaitDrain);src._readableState.awaitDrain++;}src.pause();}} // if the dest has an error, then stop piping into it.
// however, don't suppress the throwing behavior for this.
function onerror(er){debug('onerror',er);unpipe();dest.removeListener('error',onerror);if(EElistenerCount(dest,'error')===0)dest.emit('error',er);} // This is a brutally ugly hack to make sure that our error handler
// is attached before any userland ones.  NEVER DO THIS.
if(!dest._events||!dest._events.error)dest.on('error',onerror);else if(isArray(dest._events.error))dest._events.error.unshift(onerror);else dest._events.error=[onerror,dest._events.error]; // Both close and finish should trigger unpipe, but only once.
function onclose(){dest.removeListener('finish',onfinish);unpipe();}dest.once('close',onclose);function onfinish(){debug('onfinish');dest.removeListener('close',onclose);unpipe();}dest.once('finish',onfinish);function unpipe(){debug('unpipe');src.unpipe(dest);} // tell the dest that it's being piped to
dest.emit('pipe',src); // start the flow if it hasn't been started already.
if(!state.flowing){debug('pipe resume');src.resume();}return dest;};function pipeOnDrain(src){return function(){var state=src._readableState;debug('pipeOnDrain',state.awaitDrain);if(state.awaitDrain)state.awaitDrain--;if(state.awaitDrain===0&&EElistenerCount(src,'data')){state.flowing=true;flow(src);}};}Readable.prototype.unpipe=function(dest){var state=this._readableState; // if we're not piping anywhere, then do nothing.
if(state.pipesCount===0)return this; // just one destination.  most common case.
if(state.pipesCount===1){ // passed in one, but it's not the right one.
if(dest&&dest!==state.pipes)return this;if(!dest)dest=state.pipes; // got a match.
state.pipes=null;state.pipesCount=0;state.flowing=false;if(dest)dest.emit('unpipe',this);return this;} // slow case. multiple pipe destinations.
if(!dest){ // remove all.
var dests=state.pipes;var len=state.pipesCount;state.pipes=null;state.pipesCount=0;state.flowing=false;for(var _i=0;_i<len;_i++){dests[_i].emit('unpipe',this);}return this;} // try to find the right one.
var i=indexOf(state.pipes,dest);if(i===-1)return this;state.pipes.splice(i,1);state.pipesCount-=1;if(state.pipesCount===1)state.pipes=state.pipes[0];dest.emit('unpipe',this);return this;}; // set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on=function(ev,fn){var res=Stream.prototype.on.call(this,ev,fn); // If listening to data, and it has not explicitly been paused,
// then call resume to start the flow of data on the next tick.
if(ev==='data'&&false!==this._readableState.flowing){this.resume();}if(ev==='readable'&&!this._readableState.endEmitted){var state=this._readableState;if(!state.readableListening){state.readableListening=true;state.emittedReadable=false;state.needReadable=true;if(!state.reading){processNextTick(nReadingNextTick,this);}else if(state.length){emitReadable(this,state);}}}return res;};Readable.prototype.addListener=Readable.prototype.on;function nReadingNextTick(self){debug('readable nexttick read 0');self.read(0);} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume=function(){var state=this._readableState;if(!state.flowing){debug('resume');state.flowing=true;resume(this,state);}return this;};function resume(stream,state){if(!state.resumeScheduled){state.resumeScheduled=true;processNextTick(resume_,stream,state);}}function resume_(stream,state){if(!state.reading){debug('resume read 0');stream.read(0);}state.resumeScheduled=false;stream.emit('resume');flow(stream);if(state.flowing&&!state.reading)stream.read(0);}Readable.prototype.pause=function(){debug('call pause flowing=%j',this._readableState.flowing);if(false!==this._readableState.flowing){debug('pause');this._readableState.flowing=false;this.emit('pause');}return this;};function flow(stream){var state=stream._readableState;debug('flow',state.flowing);if(state.flowing){do {var chunk=stream.read();}while(null!==chunk&&state.flowing);}} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap=function(stream){var state=this._readableState;var paused=false;var self=this;stream.on('end',function(){debug('wrapped end');if(state.decoder&&!state.ended){var chunk=state.decoder.end();if(chunk&&chunk.length)self.push(chunk);}self.push(null);});stream.on('data',function(chunk){debug('wrapped data');if(state.decoder)chunk=state.decoder.write(chunk); // don't skip over falsy values in objectMode
if(state.objectMode&&(chunk===null||chunk===undefined))return;else if(!state.objectMode&&(!chunk||!chunk.length))return;var ret=self.push(chunk);if(!ret){paused=true;stream.pause();}}); // proxy all the other methods.
// important when wrapping filters and duplexes.
for(var i in stream){if(this[i]===undefined&&typeof stream[i]==='function'){this[i]=function(method){return function(){return stream[method].apply(stream,arguments);};}(i);}} // proxy certain important events.
var events=['error','close','destroy','pause','resume'];forEach(events,function(ev){stream.on(ev,self.emit.bind(self,ev));}); // when we try to consume some more bytes, simply unpause the
// underlying stream.
self._read=function(n){debug('wrapped _read',n);if(paused){paused=false;stream.resume();}};return self;}; // exposed for testing purposes only.
Readable._fromList=fromList; // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n,state){var list=state.buffer;var length=state.length;var stringMode=!!state.decoder;var objectMode=!!state.objectMode;var ret; // nothing in the list, definitely empty.
if(list.length===0)return null;if(length===0)ret=null;else if(objectMode)ret=list.shift();else if(!n||n>=length){ // read it all, truncate the array.
if(stringMode)ret=list.join('');else if(list.length===1)ret=list[0];else ret=Buffer.concat(list,length);list.length=0;}else { // read just some of it.
if(n<list[0].length){ // just take a part of the first list item.
// slice is the same for buffers and strings.
var buf=list[0];ret=buf.slice(0,n);list[0]=buf.slice(n);}else if(n===list[0].length){ // first list is a perfect match
ret=list.shift();}else { // complex case.
// we have enough to cover it, but it spans past the first buffer.
if(stringMode)ret='';else ret=new Buffer(n);var c=0;for(var i=0,l=list.length;i<l&&c<n;i++){var buf=list[0];var cpy=Math.min(n-c,buf.length);if(stringMode)ret+=buf.slice(0,cpy);else buf.copy(ret,c,0,cpy);if(cpy<buf.length)list[0]=buf.slice(cpy);else list.shift();c+=cpy;}}}return ret;}function endReadable(stream){var state=stream._readableState; // If we get here before consuming all the bytes, then that is a
// bug in node.  Should never happen.
if(state.length>0)throw new Error('endReadable called on non-empty stream');if(!state.endEmitted){state.ended=true;processNextTick(endReadableNT,state,stream);}}function endReadableNT(state,stream){ // Check that we didn't get one last unshift.
if(!state.endEmitted&&state.length===0){state.endEmitted=true;stream.readable=false;stream.emit('end');}}function forEach(xs,f){for(var i=0,l=xs.length;i<l;i++){f(xs[i],i);}}function indexOf(xs,x){for(var i=0,l=xs.length;i<l;i++){if(xs[i]===x)return i;}return -1;}}).call(this,require('_process'));},{"./_stream_duplex":86,"_process":12,"buffer":14,"core-util-is":15,"events":17,"inherits":31,"isarray":35,"process-nextick-args":83,"string_decoder/":98,"util":8}],89:[function(require,module,exports){ // a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.
'use strict';module.exports=Transform;var Duplex=require('./_stream_duplex'); /*<replacement>*/var util=require('core-util-is');util.inherits=require('inherits'); /*</replacement>*/util.inherits(Transform,Duplex);function TransformState(stream){this.afterTransform=function(er,data){return afterTransform(stream,er,data);};this.needTransform=false;this.transforming=false;this.writecb=null;this.writechunk=null;this.writeencoding=null;}function afterTransform(stream,er,data){var ts=stream._transformState;ts.transforming=false;var cb=ts.writecb;if(!cb)return stream.emit('error',new Error('no writecb in Transform class'));ts.writechunk=null;ts.writecb=null;if(data!==null&&data!==undefined)stream.push(data);cb(er);var rs=stream._readableState;rs.reading=false;if(rs.needReadable||rs.length<rs.highWaterMark){stream._read(rs.highWaterMark);}}function Transform(options){if(!(this instanceof Transform))return new Transform(options);Duplex.call(this,options);this._transformState=new TransformState(this); // when the writable side finishes, then flush out anything remaining.
var stream=this; // start out asking for a readable event once data is transformed.
this._readableState.needReadable=true; // we have implemented the _read method, and done the other things
// that Readable wants before the first _read call, so unset the
// sync guard flag.
this._readableState.sync=false;if(options){if(typeof options.transform==='function')this._transform=options.transform;if(typeof options.flush==='function')this._flush=options.flush;}this.once('prefinish',function(){if(typeof this._flush==='function')this._flush(function(er){done(stream,er);});else done(stream);});}Transform.prototype.push=function(chunk,encoding){this._transformState.needTransform=false;return Duplex.prototype.push.call(this,chunk,encoding);}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform=function(chunk,encoding,cb){throw new Error('not implemented');};Transform.prototype._write=function(chunk,encoding,cb){var ts=this._transformState;ts.writecb=cb;ts.writechunk=chunk;ts.writeencoding=encoding;if(!ts.transforming){var rs=this._readableState;if(ts.needTransform||rs.needReadable||rs.length<rs.highWaterMark)this._read(rs.highWaterMark);}}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read=function(n){var ts=this._transformState;if(ts.writechunk!==null&&ts.writecb&&!ts.transforming){ts.transforming=true;this._transform(ts.writechunk,ts.writeencoding,ts.afterTransform);}else { // mark that we need a transform, so that any data that comes in
// will get processed, now that we've asked for it.
ts.needTransform=true;}};function done(stream,er){if(er)return stream.emit('error',er); // if there's nothing in the write buffer, then that means
// that nothing more will ever be provided
var ws=stream._writableState;var ts=stream._transformState;if(ws.length)throw new Error('calling transform done when ws.length != 0');if(ts.transforming)throw new Error('calling transform done when still transforming');return stream.push(null);}},{"./_stream_duplex":86,"core-util-is":15,"inherits":31}],90:[function(require,module,exports){(function(process){ // A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.
'use strict';module.exports=Writable; /*<replacement>*/var processNextTick=require('process-nextick-args'); /*</replacement>*/ /*<replacement>*/var asyncWrite=!process.browser&&['v0.10','v0.9.'].indexOf(process.version.slice(0,5))>-1?setImmediate:processNextTick; /*</replacement>*/ /*<replacement>*/var Buffer=require('buffer').Buffer; /*</replacement>*/Writable.WritableState=WritableState; /*<replacement>*/var util=require('core-util-is');util.inherits=require('inherits'); /*</replacement>*/ /*<replacement>*/var internalUtil={deprecate:require('util-deprecate')}; /*</replacement>*/ /*<replacement>*/var Stream;(function(){try{Stream=require('st'+'ream');}catch(_){}finally {if(!Stream)Stream=require('events').EventEmitter;}})(); /*</replacement>*/var Buffer=require('buffer').Buffer;util.inherits(Writable,Stream);function nop(){}function WriteReq(chunk,encoding,cb){this.chunk=chunk;this.encoding=encoding;this.callback=cb;this.next=null;}var Duplex;function WritableState(options,stream){Duplex=Duplex||require('./_stream_duplex');options=options||{}; // object stream flag to indicate whether or not this stream
// contains buffers or objects.
this.objectMode=!!options.objectMode;if(stream instanceof Duplex)this.objectMode=this.objectMode||!!options.writableObjectMode; // the point at which write() starts returning false
// Note: 0 is a valid value, means that we always return false if
// the entire buffer is not flushed immediately on write()
var hwm=options.highWaterMark;var defaultHwm=this.objectMode?16:16*1024;this.highWaterMark=hwm||hwm===0?hwm:defaultHwm; // cast to ints.
this.highWaterMark=~ ~this.highWaterMark;this.needDrain=false; // at the start of calling end()
this.ending=false; // when end() has been called, and returned
this.ended=false; // when 'finish' is emitted
this.finished=false; // should we decode strings into buffers before passing to _write?
// this is here so that some node-core streams can optimize string
// handling at a lower level.
var noDecode=options.decodeStrings===false;this.decodeStrings=!noDecode; // Crypto is kind of old and crusty.  Historically, its default string
// encoding is 'binary' so we have to make this configurable.
// Everything else in the universe uses 'utf8', though.
this.defaultEncoding=options.defaultEncoding||'utf8'; // not an actual buffer we keep track of, but a measurement
// of how much we're waiting to get pushed to some underlying
// socket or file.
this.length=0; // a flag to see when we're in the middle of a write.
this.writing=false; // when true all writes will be buffered until .uncork() call
this.corked=0; // a flag to be able to tell if the onwrite cb is called immediately,
// or on a later tick.  We set this to true at first, because any
// actions that shouldn't happen until "later" should generally also
// not happen before the first write call.
this.sync=true; // a flag to know if we're processing previously buffered items, which
// may call the _write() callback in the same tick, so that we don't
// end up in an overlapped onwrite situation.
this.bufferProcessing=false; // the callback that's passed to _write(chunk,cb)
this.onwrite=function(er){onwrite(stream,er);}; // the callback that the user supplies to write(chunk,encoding,cb)
this.writecb=null; // the amount that is being written when _write is called.
this.writelen=0;this.bufferedRequest=null;this.lastBufferedRequest=null; // number of pending user-supplied write callbacks
// this must be 0 before 'finish' can be emitted
this.pendingcb=0; // emit prefinish if the only thing we're waiting for is _write cbs
// This is relevant for synchronous Transform streams
this.prefinished=false; // True if the error was already emitted and should not be thrown again
this.errorEmitted=false; // count buffered requests
this.bufferedRequestCount=0; // create the two objects needed to store the corked requests
// they are not a linked list, as no new elements are inserted in there
this.corkedRequestsFree=new CorkedRequest(this);this.corkedRequestsFree.next=new CorkedRequest(this);}WritableState.prototype.getBuffer=function writableStateGetBuffer(){var current=this.bufferedRequest;var out=[];while(current){out.push(current);current=current.next;}return out;};(function(){try{Object.defineProperty(WritableState.prototype,'buffer',{get:internalUtil.deprecate(function(){return this.getBuffer();},'_writableState.buffer is deprecated. Use _writableState.getBuffer '+'instead.')});}catch(_){}})();var Duplex;function Writable(options){Duplex=Duplex||require('./_stream_duplex'); // Writable ctor is applied to Duplexes, though they're not
// instanceof Writable, they're instanceof Readable.
if(!(this instanceof Writable)&&!(this instanceof Duplex))return new Writable(options);this._writableState=new WritableState(options,this); // legacy.
this.writable=true;if(options){if(typeof options.write==='function')this._write=options.write;if(typeof options.writev==='function')this._writev=options.writev;}Stream.call(this);} // Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe=function(){this.emit('error',new Error('Cannot pipe. Not readable.'));};function writeAfterEnd(stream,cb){var er=new Error('write after end'); // TODO: defer error events consistently everywhere, not just the cb
stream.emit('error',er);processNextTick(cb,er);} // If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream,state,chunk,cb){var valid=true;if(!Buffer.isBuffer(chunk)&&typeof chunk!=='string'&&chunk!==null&&chunk!==undefined&&!state.objectMode){var er=new TypeError('Invalid non-string/buffer chunk');stream.emit('error',er);processNextTick(cb,er);valid=false;}return valid;}Writable.prototype.write=function(chunk,encoding,cb){var state=this._writableState;var ret=false;if(typeof encoding==='function'){cb=encoding;encoding=null;}if(Buffer.isBuffer(chunk))encoding='buffer';else if(!encoding)encoding=state.defaultEncoding;if(typeof cb!=='function')cb=nop;if(state.ended)writeAfterEnd(this,cb);else if(validChunk(this,state,chunk,cb)){state.pendingcb++;ret=writeOrBuffer(this,state,chunk,encoding,cb);}return ret;};Writable.prototype.cork=function(){var state=this._writableState;state.corked++;};Writable.prototype.uncork=function(){var state=this._writableState;if(state.corked){state.corked--;if(!state.writing&&!state.corked&&!state.finished&&!state.bufferProcessing&&state.bufferedRequest)clearBuffer(this,state);}};Writable.prototype.setDefaultEncoding=function setDefaultEncoding(encoding){ // node::ParseEncoding() requires lower case.
if(typeof encoding==='string')encoding=encoding.toLowerCase();if(!(['hex','utf8','utf-8','ascii','binary','base64','ucs2','ucs-2','utf16le','utf-16le','raw'].indexOf((encoding+'').toLowerCase())>-1))throw new TypeError('Unknown encoding: '+encoding);this._writableState.defaultEncoding=encoding;};function decodeChunk(state,chunk,encoding){if(!state.objectMode&&state.decodeStrings!==false&&typeof chunk==='string'){chunk=new Buffer(chunk,encoding);}return chunk;} // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream,state,chunk,encoding,cb){chunk=decodeChunk(state,chunk,encoding);if(Buffer.isBuffer(chunk))encoding='buffer';var len=state.objectMode?1:chunk.length;state.length+=len;var ret=state.length<state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.
if(!ret)state.needDrain=true;if(state.writing||state.corked){var last=state.lastBufferedRequest;state.lastBufferedRequest=new WriteReq(chunk,encoding,cb);if(last){last.next=state.lastBufferedRequest;}else {state.bufferedRequest=state.lastBufferedRequest;}state.bufferedRequestCount+=1;}else {doWrite(stream,state,false,len,chunk,encoding,cb);}return ret;}function doWrite(stream,state,writev,len,chunk,encoding,cb){state.writelen=len;state.writecb=cb;state.writing=true;state.sync=true;if(writev)stream._writev(chunk,state.onwrite);else stream._write(chunk,encoding,state.onwrite);state.sync=false;}function onwriteError(stream,state,sync,er,cb){--state.pendingcb;if(sync)processNextTick(cb,er);else cb(er);stream._writableState.errorEmitted=true;stream.emit('error',er);}function onwriteStateUpdate(state){state.writing=false;state.writecb=null;state.length-=state.writelen;state.writelen=0;}function onwrite(stream,er){var state=stream._writableState;var sync=state.sync;var cb=state.writecb;onwriteStateUpdate(state);if(er)onwriteError(stream,state,sync,er,cb);else { // Check if we're actually ready to finish, but don't emit yet
var finished=needFinish(state);if(!finished&&!state.corked&&!state.bufferProcessing&&state.bufferedRequest){clearBuffer(stream,state);}if(sync){ /*<replacement>*/asyncWrite(afterWrite,stream,state,finished,cb); /*</replacement>*/}else {afterWrite(stream,state,finished,cb);}}}function afterWrite(stream,state,finished,cb){if(!finished)onwriteDrain(stream,state);state.pendingcb--;cb();finishMaybe(stream,state);} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream,state){if(state.length===0&&state.needDrain){state.needDrain=false;stream.emit('drain');}} // if there's something in the buffer waiting, then process it
function clearBuffer(stream,state){state.bufferProcessing=true;var entry=state.bufferedRequest;if(stream._writev&&entry&&entry.next){ // Fast case, write everything using _writev()
var l=state.bufferedRequestCount;var buffer=new Array(l);var holder=state.corkedRequestsFree;holder.entry=entry;var count=0;while(entry){buffer[count]=entry;entry=entry.next;count+=1;}doWrite(stream,state,true,state.length,buffer,'',holder.finish); // doWrite is always async, defer these to save a bit of time
// as the hot path ends with doWrite
state.pendingcb++;state.lastBufferedRequest=null;state.corkedRequestsFree=holder.next;holder.next=null;}else { // Slow case, write chunks one-by-one
while(entry){var chunk=entry.chunk;var encoding=entry.encoding;var cb=entry.callback;var len=state.objectMode?1:chunk.length;doWrite(stream,state,false,len,chunk,encoding,cb);entry=entry.next; // if we didn't call the onwrite immediately, then
// it means that we need to wait until it does.
// also, that means that the chunk and cb are currently
// being processed, so move the buffer counter past them.
if(state.writing){break;}}if(entry===null)state.lastBufferedRequest=null;}state.bufferedRequestCount=0;state.bufferedRequest=entry;state.bufferProcessing=false;}Writable.prototype._write=function(chunk,encoding,cb){cb(new Error('not implemented'));};Writable.prototype._writev=null;Writable.prototype.end=function(chunk,encoding,cb){var state=this._writableState;if(typeof chunk==='function'){cb=chunk;chunk=null;encoding=null;}else if(typeof encoding==='function'){cb=encoding;encoding=null;}if(chunk!==null&&chunk!==undefined)this.write(chunk,encoding); // .end() fully uncorks
if(state.corked){state.corked=1;this.uncork();} // ignore unnecessary end() calls.
if(!state.ending&&!state.finished)endWritable(this,state,cb);};function needFinish(state){return state.ending&&state.length===0&&state.bufferedRequest===null&&!state.finished&&!state.writing;}function prefinish(stream,state){if(!state.prefinished){state.prefinished=true;stream.emit('prefinish');}}function finishMaybe(stream,state){var need=needFinish(state);if(need){if(state.pendingcb===0){prefinish(stream,state);state.finished=true;stream.emit('finish');}else {prefinish(stream,state);}}return need;}function endWritable(stream,state,cb){state.ending=true;finishMaybe(stream,state);if(cb){if(state.finished)processNextTick(cb);else stream.once('finish',cb);}state.ended=true;stream.writable=false;} // It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state){var _this=this;this.next=null;this.entry=null;this.finish=function(err){var entry=_this.entry;_this.entry=null;while(entry){var cb=entry.callback;state.pendingcb--;cb(err);entry=entry.next;}if(state.corkedRequestsFree){state.corkedRequestsFree.next=_this;}else {state.corkedRequestsFree=_this;}};}}).call(this,require('_process'));},{"./_stream_duplex":86,"_process":12,"buffer":14,"core-util-is":15,"events":17,"inherits":31,"process-nextick-args":83,"util-deprecate":102}],91:[function(require,module,exports){module.exports=require("./lib/_stream_passthrough.js");},{"./lib/_stream_passthrough.js":87}],92:[function(require,module,exports){var Stream=function(){try{return require('st'+'ream'); // hack to fix a circular dependency issue when used with browserify
}catch(_){}}();exports=module.exports=require('./lib/_stream_readable.js');exports.Stream=Stream||exports;exports.Readable=exports;exports.Writable=require('./lib/_stream_writable.js');exports.Duplex=require('./lib/_stream_duplex.js');exports.Transform=require('./lib/_stream_transform.js');exports.PassThrough=require('./lib/_stream_passthrough.js');},{"./lib/_stream_duplex.js":86,"./lib/_stream_passthrough.js":87,"./lib/_stream_readable.js":88,"./lib/_stream_transform.js":89,"./lib/_stream_writable.js":90}],93:[function(require,module,exports){module.exports=require("./lib/_stream_transform.js");},{"./lib/_stream_transform.js":89}],94:[function(require,module,exports){module.exports=require("./lib/_stream_writable.js");},{"./lib/_stream_writable.js":90}],95:[function(require,module,exports){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
module.exports=Stream;var EE=require('events').EventEmitter;var inherits=require('inherits');inherits(Stream,EE);Stream.Readable=require('readable-stream/readable.js');Stream.Writable=require('readable-stream/writable.js');Stream.Duplex=require('readable-stream/duplex.js');Stream.Transform=require('readable-stream/transform.js');Stream.PassThrough=require('readable-stream/passthrough.js'); // Backwards-compat with node 0.4.x
Stream.Stream=Stream; // old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.
function Stream(){EE.call(this);}Stream.prototype.pipe=function(dest,options){var source=this;function ondata(chunk){if(dest.writable){if(false===dest.write(chunk)&&source.pause){source.pause();}}}source.on('data',ondata);function ondrain(){if(source.readable&&source.resume){source.resume();}}dest.on('drain',ondrain); // If the 'end' option is not supplied, dest.end() will be called when
// source gets the 'end' or 'close' events.  Only dest.end() once.
if(!dest._isStdio&&(!options||options.end!==false)){source.on('end',onend);source.on('close',onclose);}var didOnEnd=false;function onend(){if(didOnEnd)return;didOnEnd=true;dest.end();}function onclose(){if(didOnEnd)return;didOnEnd=true;if(typeof dest.destroy==='function')dest.destroy();} // don't leave dangling pipes when there are errors.
function onerror(er){cleanup();if(EE.listenerCount(this,'error')===0){throw er; // Unhandled stream error in pipe.
}}source.on('error',onerror);dest.on('error',onerror); // remove all the event listeners that were added.
function cleanup(){source.removeListener('data',ondata);dest.removeListener('drain',ondrain);source.removeListener('end',onend);source.removeListener('close',onclose);source.removeListener('error',onerror);dest.removeListener('error',onerror);source.removeListener('end',cleanup);source.removeListener('close',cleanup);dest.removeListener('close',cleanup);}source.on('end',cleanup);source.on('close',cleanup);dest.on('close',cleanup);dest.emit('pipe',source); // Allow for unix-like usage: A.pipe(B).pipe(C)
return dest;};},{"events":17,"inherits":31,"readable-stream/duplex.js":85,"readable-stream/passthrough.js":91,"readable-stream/readable.js":92,"readable-stream/transform.js":93,"readable-stream/writable.js":94}],96:[function(require,module,exports){module.exports=require('stream-to').buffer;},{"stream-to":97}],97:[function(require,module,exports){(function(Buffer){exports.array=toArray;exports.buffer=toBuffer;function toArray(stream,callback){var arr=[];stream.on('data',onData);stream.once('end',onEnd);stream.once('error',callback);stream.once('error',cleanup);stream.once('close',cleanup);function onData(doc){arr.push(doc);}function onEnd(){callback(null,arr);cleanup();}function cleanup(){arr=null;stream.removeListener('data',onData);stream.removeListener('end',onEnd);stream.removeListener('error',callback);stream.removeListener('error',cleanup);stream.removeListener('close',cleanup);}return stream;}function toBuffer(stream,callback){toArray(stream,function(err,arr){if(err||!arr)callback(err);else callback(null,Buffer.concat(arr));});return stream;}}).call(this,require("buffer").Buffer);},{"buffer":14}],98:[function(require,module,exports){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var Buffer=require('buffer').Buffer;var isBufferEncoding=Buffer.isEncoding||function(encoding){switch(encoding&&encoding.toLowerCase()){case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':return true;default:return false;}};function assertEncoding(encoding){if(encoding&&!isBufferEncoding(encoding)){throw new Error('Unknown encoding: '+encoding);}} // StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder=exports.StringDecoder=function(encoding){this.encoding=(encoding||'utf8').toLowerCase().replace(/[-_]/,'');assertEncoding(encoding);switch(this.encoding){case 'utf8': // CESU-8 represents each of Surrogate Pair by 3-bytes
this.surrogateSize=3;break;case 'ucs2':case 'utf16le': // UTF-16 represents each of Surrogate Pair by 2-bytes
this.surrogateSize=2;this.detectIncompleteChar=utf16DetectIncompleteChar;break;case 'base64': // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
this.surrogateSize=3;this.detectIncompleteChar=base64DetectIncompleteChar;break;default:this.write=passThroughWrite;return;} // Enough space to store all bytes of a single character. UTF-8 needs 4
// bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
this.charBuffer=new Buffer(6); // Number of bytes received for the current incomplete multi-byte character.
this.charReceived=0; // Number of bytes expected for the current incomplete multi-byte character.
this.charLength=0;}; // write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write=function(buffer){var charStr=''; // if our last write ended with an incomplete multibyte character
while(this.charLength){ // determine how many remaining bytes this buffer has to offer for this char
var available=buffer.length>=this.charLength-this.charReceived?this.charLength-this.charReceived:buffer.length; // add the new bytes to the char buffer
buffer.copy(this.charBuffer,this.charReceived,0,available);this.charReceived+=available;if(this.charReceived<this.charLength){ // still not enough chars in this buffer? wait for more ...
return '';} // remove bytes belonging to the current character from the buffer
buffer=buffer.slice(available,buffer.length); // get the character that was split
charStr=this.charBuffer.slice(0,this.charLength).toString(this.encoding); // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
var charCode=charStr.charCodeAt(charStr.length-1);if(charCode>=0xD800&&charCode<=0xDBFF){this.charLength+=this.surrogateSize;charStr='';continue;}this.charReceived=this.charLength=0; // if there are no more bytes in this buffer, just emit our char
if(buffer.length===0){return charStr;}break;} // determine and set charLength / charReceived
this.detectIncompleteChar(buffer);var end=buffer.length;if(this.charLength){ // buffer the incomplete character bytes we got
buffer.copy(this.charBuffer,0,buffer.length-this.charReceived,end);end-=this.charReceived;}charStr+=buffer.toString(this.encoding,0,end);var end=charStr.length-1;var charCode=charStr.charCodeAt(end); // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
if(charCode>=0xD800&&charCode<=0xDBFF){var size=this.surrogateSize;this.charLength+=size;this.charReceived+=size;this.charBuffer.copy(this.charBuffer,size,0,size);buffer.copy(this.charBuffer,0,0,size);return charStr.substring(0,end);} // or just emit the charStr
return charStr;}; // detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar=function(buffer){ // determine how many bytes we have to check at the end of this buffer
var i=buffer.length>=3?3:buffer.length; // Figure out if one of the last i bytes of our buffer announces an
// incomplete char.
for(;i>0;i--){var c=buffer[buffer.length-i]; // See http://en.wikipedia.org/wiki/UTF-8#Description
// 110XXXXX
if(i==1&&c>>5==0x06){this.charLength=2;break;} // 1110XXXX
if(i<=2&&c>>4==0x0E){this.charLength=3;break;} // 11110XXX
if(i<=3&&c>>3==0x1E){this.charLength=4;break;}}this.charReceived=i;};StringDecoder.prototype.end=function(buffer){var res='';if(buffer&&buffer.length)res=this.write(buffer);if(this.charReceived){var cr=this.charReceived;var buf=this.charBuffer;var enc=this.encoding;res+=buf.slice(0,cr).toString(enc);}return res;};function passThroughWrite(buffer){return buffer.toString(this.encoding);}function utf16DetectIncompleteChar(buffer){this.charReceived=buffer.length%2;this.charLength=this.charReceived?2:0;}function base64DetectIncompleteChar(buffer){this.charReceived=buffer.length%3;this.charLength=this.charReceived?3:0;}},{"buffer":14}],99:[function(require,module,exports){ // TinyColor v1.3.0
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License
(function(){var trimLeft=/^\s+/,trimRight=/\s+$/,tinyCounter=0,math=Math,mathRound=math.round,mathMin=math.min,mathMax=math.max,mathRandom=math.random;function tinycolor(color,opts){color=color?color:'';opts=opts||{}; // If input is already a tinycolor, return itself
if(color instanceof tinycolor){return color;} // If we are called as a function, call using new instead
if(!(this instanceof tinycolor)){return new tinycolor(color,opts);}var rgb=inputToRGB(color);this._originalInput=color,this._r=rgb.r,this._g=rgb.g,this._b=rgb.b,this._a=rgb.a,this._roundA=mathRound(100*this._a)/100,this._format=opts.format||rgb.format;this._gradientType=opts.gradientType; // Don't let the range of [0,255] come back in [0,1].
// Potentially lose a little bit of precision here, but will fix issues where
// .5 gets interpreted as half of the total, instead of half of 1
// If it was supposed to be 128, this was already taken care of by `inputToRgb`
if(this._r<1){this._r=mathRound(this._r);}if(this._g<1){this._g=mathRound(this._g);}if(this._b<1){this._b=mathRound(this._b);}this._ok=rgb.ok;this._tc_id=tinyCounter++;}tinycolor.prototype={isDark:function isDark(){return this.getBrightness()<128;},isLight:function isLight(){return !this.isDark();},isValid:function isValid(){return this._ok;},getOriginalInput:function getOriginalInput(){return this._originalInput;},getFormat:function getFormat(){return this._format;},getAlpha:function getAlpha(){return this._a;},getBrightness:function getBrightness(){ //http://www.w3.org/TR/AERT#color-contrast
var rgb=this.toRgb();return (rgb.r*299+rgb.g*587+rgb.b*114)/1000;},getLuminance:function getLuminance(){ //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
var rgb=this.toRgb();var RsRGB,GsRGB,BsRGB,R,G,B;RsRGB=rgb.r/255;GsRGB=rgb.g/255;BsRGB=rgb.b/255;if(RsRGB<=0.03928){R=RsRGB/12.92;}else {R=Math.pow((RsRGB+0.055)/1.055,2.4);}if(GsRGB<=0.03928){G=GsRGB/12.92;}else {G=Math.pow((GsRGB+0.055)/1.055,2.4);}if(BsRGB<=0.03928){B=BsRGB/12.92;}else {B=Math.pow((BsRGB+0.055)/1.055,2.4);}return 0.2126*R+0.7152*G+0.0722*B;},setAlpha:function setAlpha(value){this._a=boundAlpha(value);this._roundA=mathRound(100*this._a)/100;return this;},toHsv:function toHsv(){var hsv=rgbToHsv(this._r,this._g,this._b);return {h:hsv.h*360,s:hsv.s,v:hsv.v,a:this._a};},toHsvString:function toHsvString(){var hsv=rgbToHsv(this._r,this._g,this._b);var h=mathRound(hsv.h*360),s=mathRound(hsv.s*100),v=mathRound(hsv.v*100);return this._a==1?"hsv("+h+", "+s+"%, "+v+"%)":"hsva("+h+", "+s+"%, "+v+"%, "+this._roundA+")";},toHsl:function toHsl(){var hsl=rgbToHsl(this._r,this._g,this._b);return {h:hsl.h*360,s:hsl.s,l:hsl.l,a:this._a};},toHslString:function toHslString(){var hsl=rgbToHsl(this._r,this._g,this._b);var h=mathRound(hsl.h*360),s=mathRound(hsl.s*100),l=mathRound(hsl.l*100);return this._a==1?"hsl("+h+", "+s+"%, "+l+"%)":"hsla("+h+", "+s+"%, "+l+"%, "+this._roundA+")";},toHex:function toHex(allow3Char){return rgbToHex(this._r,this._g,this._b,allow3Char);},toHexString:function toHexString(allow3Char){return '#'+this.toHex(allow3Char);},toHex8:function toHex8(){return rgbaToHex(this._r,this._g,this._b,this._a);},toHex8String:function toHex8String(){return '#'+this.toHex8();},toRgb:function toRgb(){return {r:mathRound(this._r),g:mathRound(this._g),b:mathRound(this._b),a:this._a};},toRgbString:function toRgbString(){return this._a==1?"rgb("+mathRound(this._r)+", "+mathRound(this._g)+", "+mathRound(this._b)+")":"rgba("+mathRound(this._r)+", "+mathRound(this._g)+", "+mathRound(this._b)+", "+this._roundA+")";},toPercentageRgb:function toPercentageRgb(){return {r:mathRound(bound01(this._r,255)*100)+"%",g:mathRound(bound01(this._g,255)*100)+"%",b:mathRound(bound01(this._b,255)*100)+"%",a:this._a};},toPercentageRgbString:function toPercentageRgbString(){return this._a==1?"rgb("+mathRound(bound01(this._r,255)*100)+"%, "+mathRound(bound01(this._g,255)*100)+"%, "+mathRound(bound01(this._b,255)*100)+"%)":"rgba("+mathRound(bound01(this._r,255)*100)+"%, "+mathRound(bound01(this._g,255)*100)+"%, "+mathRound(bound01(this._b,255)*100)+"%, "+this._roundA+")";},toName:function toName(){if(this._a===0){return "transparent";}if(this._a<1){return false;}return hexNames[rgbToHex(this._r,this._g,this._b,true)]||false;},toFilter:function toFilter(secondColor){var hex8String='#'+rgbaToHex(this._r,this._g,this._b,this._a);var secondHex8String=hex8String;var gradientType=this._gradientType?"GradientType = 1, ":"";if(secondColor){var s=tinycolor(secondColor);secondHex8String=s.toHex8String();}return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";},toString:function toString(format){var formatSet=!!format;format=format||this._format;var formattedString=false;var hasAlpha=this._a<1&&this._a>=0;var needsAlphaFormat=!formatSet&&hasAlpha&&(format==="hex"||format==="hex6"||format==="hex3"||format==="name");if(needsAlphaFormat){ // Special case for "transparent", all other non-alpha formats
// will return rgba when there is transparency.
if(format==="name"&&this._a===0){return this.toName();}return this.toRgbString();}if(format==="rgb"){formattedString=this.toRgbString();}if(format==="prgb"){formattedString=this.toPercentageRgbString();}if(format==="hex"||format==="hex6"){formattedString=this.toHexString();}if(format==="hex3"){formattedString=this.toHexString(true);}if(format==="hex8"){formattedString=this.toHex8String();}if(format==="name"){formattedString=this.toName();}if(format==="hsl"){formattedString=this.toHslString();}if(format==="hsv"){formattedString=this.toHsvString();}return formattedString||this.toHexString();},clone:function clone(){return tinycolor(this.toString());},_applyModification:function _applyModification(fn,args){var color=fn.apply(null,[this].concat([].slice.call(args)));this._r=color._r;this._g=color._g;this._b=color._b;this.setAlpha(color._a);return this;},lighten:function lighten(){return this._applyModification(_lighten,arguments);},brighten:function brighten(){return this._applyModification(_brighten,arguments);},darken:function darken(){return this._applyModification(_darken,arguments);},desaturate:function desaturate(){return this._applyModification(_desaturate,arguments);},saturate:function saturate(){return this._applyModification(_saturate,arguments);},greyscale:function greyscale(){return this._applyModification(_greyscale,arguments);},spin:function spin(){return this._applyModification(_spin,arguments);},_applyCombination:function _applyCombination(fn,args){return fn.apply(null,[this].concat([].slice.call(args)));},analogous:function analogous(){return this._applyCombination(_analogous,arguments);},complement:function complement(){return this._applyCombination(_complement,arguments);},monochromatic:function monochromatic(){return this._applyCombination(_monochromatic,arguments);},splitcomplement:function splitcomplement(){return this._applyCombination(_splitcomplement,arguments);},triad:function triad(){return this._applyCombination(_triad,arguments);},tetrad:function tetrad(){return this._applyCombination(_tetrad,arguments);}}; // If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
tinycolor.fromRatio=function(color,opts){if((typeof color==="undefined"?"undefined":_typeof(color))=="object"){var newColor={};for(var i in color){if(color.hasOwnProperty(i)){if(i==="a"){newColor[i]=color[i];}else {newColor[i]=convertToPercentage(color[i]);}}}color=newColor;}return tinycolor(color,opts);}; // Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "#ff000000" or "ff000000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
function inputToRGB(color){var rgb={r:0,g:0,b:0};var a=1;var ok=false;var format=false;if(typeof color=="string"){color=stringInputToObject(color);}if((typeof color==="undefined"?"undefined":_typeof(color))=="object"){if(color.hasOwnProperty("r")&&color.hasOwnProperty("g")&&color.hasOwnProperty("b")){rgb=rgbToRgb(color.r,color.g,color.b);ok=true;format=String(color.r).substr(-1)==="%"?"prgb":"rgb";}else if(color.hasOwnProperty("h")&&color.hasOwnProperty("s")&&color.hasOwnProperty("v")){color.s=convertToPercentage(color.s);color.v=convertToPercentage(color.v);rgb=hsvToRgb(color.h,color.s,color.v);ok=true;format="hsv";}else if(color.hasOwnProperty("h")&&color.hasOwnProperty("s")&&color.hasOwnProperty("l")){color.s=convertToPercentage(color.s);color.l=convertToPercentage(color.l);rgb=hslToRgb(color.h,color.s,color.l);ok=true;format="hsl";}if(color.hasOwnProperty("a")){a=color.a;}}a=boundAlpha(a);return {ok:ok,format:color.format||format,r:mathMin(255,mathMax(rgb.r,0)),g:mathMin(255,mathMax(rgb.g,0)),b:mathMin(255,mathMax(rgb.b,0)),a:a};} // Conversion Functions
// --------------------
// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>
// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
function rgbToRgb(r,g,b){return {r:bound01(r,255)*255,g:bound01(g,255)*255,b:bound01(b,255)*255};} // `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(r,g,b){r=bound01(r,255);g=bound01(g,255);b=bound01(b,255);var max=mathMax(r,g,b),min=mathMin(r,g,b);var h,s,l=(max+min)/2;if(max==min){h=s=0; // achromatic
}else {var d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}return {h:h,s:s,l:l};} // `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hslToRgb(h,s,l){var r,g,b;h=bound01(h,360);s=bound01(s,100);l=bound01(l,100);function hue2rgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}if(s===0){r=g=b=l; // achromatic
}else {var q=l<0.5?l*(1+s):l+s-l*s;var p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3);}return {r:r*255,g:g*255,b:b*255};} // `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
function rgbToHsv(r,g,b){r=bound01(r,255);g=bound01(g,255);b=bound01(b,255);var max=mathMax(r,g,b),min=mathMin(r,g,b);var h,s,v=max;var d=max-min;s=max===0?0:d/max;if(max==min){h=0; // achromatic
}else {switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}return {h:h,s:s,v:v};} // `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hsvToRgb(h,s,v){h=bound01(h,360)*6;s=bound01(s,100);v=bound01(v,100);var i=math.floor(h),f=h-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s),mod=i%6,r=[v,q,p,p,t,v][mod],g=[t,v,v,q,p,p][mod],b=[p,p,t,v,v,q][mod];return {r:r*255,g:g*255,b:b*255};} // `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
function rgbToHex(r,g,b,allow3Char){var hex=[pad2(mathRound(r).toString(16)),pad2(mathRound(g).toString(16)),pad2(mathRound(b).toString(16))]; // Return a 3 character hex if possible
if(allow3Char&&hex[0].charAt(0)==hex[0].charAt(1)&&hex[1].charAt(0)==hex[1].charAt(1)&&hex[2].charAt(0)==hex[2].charAt(1)){return hex[0].charAt(0)+hex[1].charAt(0)+hex[2].charAt(0);}return hex.join("");} // `rgbaToHex`
// Converts an RGBA color plus alpha transparency to hex
// Assumes r, g, b and a are contained in the set [0, 255]
// Returns an 8 character hex
function rgbaToHex(r,g,b,a){var hex=[pad2(convertDecimalToHex(a)),pad2(mathRound(r).toString(16)),pad2(mathRound(g).toString(16)),pad2(mathRound(b).toString(16))];return hex.join("");} // `equals`
// Can be called with any tinycolor input
tinycolor.equals=function(color1,color2){if(!color1||!color2){return false;}return tinycolor(color1).toRgbString()==tinycolor(color2).toRgbString();};tinycolor.random=function(){return tinycolor.fromRatio({r:mathRandom(),g:mathRandom(),b:mathRandom()});}; // Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>
function _desaturate(color,amount){amount=amount===0?0:amount||10;var hsl=tinycolor(color).toHsl();hsl.s-=amount/100;hsl.s=clamp01(hsl.s);return tinycolor(hsl);}function _saturate(color,amount){amount=amount===0?0:amount||10;var hsl=tinycolor(color).toHsl();hsl.s+=amount/100;hsl.s=clamp01(hsl.s);return tinycolor(hsl);}function _greyscale(color){return tinycolor(color).desaturate(100);}function _lighten(color,amount){amount=amount===0?0:amount||10;var hsl=tinycolor(color).toHsl();hsl.l+=amount/100;hsl.l=clamp01(hsl.l);return tinycolor(hsl);}function _brighten(color,amount){amount=amount===0?0:amount||10;var rgb=tinycolor(color).toRgb();rgb.r=mathMax(0,mathMin(255,rgb.r-mathRound(255*-(amount/100))));rgb.g=mathMax(0,mathMin(255,rgb.g-mathRound(255*-(amount/100))));rgb.b=mathMax(0,mathMin(255,rgb.b-mathRound(255*-(amount/100))));return tinycolor(rgb);}function _darken(color,amount){amount=amount===0?0:amount||10;var hsl=tinycolor(color).toHsl();hsl.l-=amount/100;hsl.l=clamp01(hsl.l);return tinycolor(hsl);} // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
function _spin(color,amount){var hsl=tinycolor(color).toHsl();var hue=(mathRound(hsl.h)+amount)%360;hsl.h=hue<0?360+hue:hue;return tinycolor(hsl);} // Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>
function _complement(color){var hsl=tinycolor(color).toHsl();hsl.h=(hsl.h+180)%360;return tinycolor(hsl);}function _triad(color){var hsl=tinycolor(color).toHsl();var h=hsl.h;return [tinycolor(color),tinycolor({h:(h+120)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+240)%360,s:hsl.s,l:hsl.l})];}function _tetrad(color){var hsl=tinycolor(color).toHsl();var h=hsl.h;return [tinycolor(color),tinycolor({h:(h+90)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+180)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+270)%360,s:hsl.s,l:hsl.l})];}function _splitcomplement(color){var hsl=tinycolor(color).toHsl();var h=hsl.h;return [tinycolor(color),tinycolor({h:(h+72)%360,s:hsl.s,l:hsl.l}),tinycolor({h:(h+216)%360,s:hsl.s,l:hsl.l})];}function _analogous(color,results,slices){results=results||6;slices=slices||30;var hsl=tinycolor(color).toHsl();var part=360/slices;var ret=[tinycolor(color)];for(hsl.h=(hsl.h-(part*results>>1)+720)%360;--results;){hsl.h=(hsl.h+part)%360;ret.push(tinycolor(hsl));}return ret;}function _monochromatic(color,results){results=results||6;var hsv=tinycolor(color).toHsv();var h=hsv.h,s=hsv.s,v=hsv.v;var ret=[];var modification=1/results;while(results--){ret.push(tinycolor({h:h,s:s,v:v}));v=(v+modification)%1;}return ret;} // Utility Functions
// ---------------------
tinycolor.mix=function(color1,color2,amount){amount=amount===0?0:amount||50;var rgb1=tinycolor(color1).toRgb();var rgb2=tinycolor(color2).toRgb();var p=amount/100;var w=p*2-1;var a=rgb2.a-rgb1.a;var w1;if(w*a==-1){w1=w;}else {w1=(w+a)/(1+w*a);}w1=(w1+1)/2;var w2=1-w1;var rgba={r:rgb2.r*w1+rgb1.r*w2,g:rgb2.g*w1+rgb1.g*w2,b:rgb2.b*w1+rgb1.b*w2,a:rgb2.a*p+rgb1.a*(1-p)};return tinycolor(rgba);}; // Readability Functions
// ---------------------
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)
// `contrast`
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
tinycolor.readability=function(color1,color2){var c1=tinycolor(color1);var c2=tinycolor(color2);return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05)/(Math.min(c1.getLuminance(),c2.getLuminance())+0.05);}; // `isReadable`
// Ensure that foreground and background color combinations meet WCAG2 guidelines.
// The third argument is an optional Object.
//      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
//      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.
// *Example*
//    tinycolor.isReadable("#000", "#111") => false
//    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
tinycolor.isReadable=function(color1,color2,wcag2){var readability=tinycolor.readability(color1,color2);var wcag2Parms,out;out=false;wcag2Parms=validateWCAG2Parms(wcag2);switch(wcag2Parms.level+wcag2Parms.size){case "AAsmall":case "AAAlarge":out=readability>=4.5;break;case "AAlarge":out=readability>=3;break;case "AAAsmall":out=readability>=7;break;}return out;}; // `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// Optionally returns Black or White if the most readable color is unreadable.
// *Example*
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
tinycolor.mostReadable=function(baseColor,colorList,args){var bestColor=null;var bestScore=0;var readability;var includeFallbackColors,level,size;args=args||{};includeFallbackColors=args.includeFallbackColors;level=args.level;size=args.size;for(var i=0;i<colorList.length;i++){readability=tinycolor.readability(baseColor,colorList[i]);if(readability>bestScore){bestScore=readability;bestColor=tinycolor(colorList[i]);}}if(tinycolor.isReadable(baseColor,bestColor,{"level":level,"size":size})||!includeFallbackColors){return bestColor;}else {args.includeFallbackColors=false;return tinycolor.mostReadable(baseColor,["#fff","#000"],args);}}; // Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
var names=tinycolor.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"}; // Make it easy to access colors via `hexNames[hex]`
var hexNames=tinycolor.hexNames=flip(names); // Utilities
// ---------
// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
function flip(o){var flipped={};for(var i in o){if(o.hasOwnProperty(i)){flipped[o[i]]=i;}}return flipped;} // Return a valid alpha value [0,1] with all invalid values being set to 1
function boundAlpha(a){a=parseFloat(a);if(isNaN(a)||a<0||a>1){a=1;}return a;} // Take input from [0, n] and return it as [0, 1]
function bound01(n,max){if(isOnePointZero(n)){n="100%";}var processPercent=isPercentage(n);n=mathMin(max,mathMax(0,parseFloat(n))); // Automatically convert percentage into number
if(processPercent){n=parseInt(n*max,10)/100;} // Handle floating point rounding errors
if(math.abs(n-max)<0.000001){return 1;} // Convert into [0, 1] range if it isn't already
return n%max/parseFloat(max);} // Force a number between 0 and 1
function clamp01(val){return mathMin(1,mathMax(0,val));} // Parse a base-16 hex value into a base-10 integer
function parseIntFromHex(val){return parseInt(val,16);} // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
function isOnePointZero(n){return typeof n=="string"&&n.indexOf('.')!=-1&&parseFloat(n)===1;} // Check to see if string passed in is a percentage
function isPercentage(n){return typeof n==="string"&&n.indexOf('%')!=-1;} // Force a hex value to have 2 characters
function pad2(c){return c.length==1?'0'+c:''+c;} // Replace a decimal with it's percentage value
function convertToPercentage(n){if(n<=1){n=n*100+"%";}return n;} // Converts a decimal to a hex value
function convertDecimalToHex(d){return Math.round(parseFloat(d)*255).toString(16);} // Converts a hex value to a decimal
function convertHexToDecimal(h){return parseIntFromHex(h)/255;}var matchers=function(){ // <http://www.w3.org/TR/css3-values/#integers>
var CSS_INTEGER="[-\\+]?\\d+%?"; // <http://www.w3.org/TR/css3-values/#number-value>
var CSS_NUMBER="[-\\+]?\\d*\\.\\d+%?"; // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
var CSS_UNIT="(?:"+CSS_NUMBER+")|(?:"+CSS_INTEGER+")"; // Actual matching.
// Parentheses and commas are optional, but not required.
// Whitespace can take the place of commas or opening paren
var PERMISSIVE_MATCH3="[\\s|\\(]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")\\s*\\)?";var PERMISSIVE_MATCH4="[\\s|\\(]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")[,|\\s]+("+CSS_UNIT+")\\s*\\)?";return {rgb:new RegExp("rgb"+PERMISSIVE_MATCH3),rgba:new RegExp("rgba"+PERMISSIVE_MATCH4),hsl:new RegExp("hsl"+PERMISSIVE_MATCH3),hsla:new RegExp("hsla"+PERMISSIVE_MATCH4),hsv:new RegExp("hsv"+PERMISSIVE_MATCH3),hsva:new RegExp("hsva"+PERMISSIVE_MATCH4),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/};}(); // `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
function stringInputToObject(color){color=color.replace(trimLeft,'').replace(trimRight,'').toLowerCase();var named=false;if(names[color]){color=names[color];named=true;}else if(color=='transparent'){return {r:0,g:0,b:0,a:0,format:"name"};} // Try to match string input using regular expressions.
// Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
// Just return an object and let the conversion functions handle that.
// This way the result will be the same whether the tinycolor is initialized with string or object.
var match;if(match=matchers.rgb.exec(color)){return {r:match[1],g:match[2],b:match[3]};}if(match=matchers.rgba.exec(color)){return {r:match[1],g:match[2],b:match[3],a:match[4]};}if(match=matchers.hsl.exec(color)){return {h:match[1],s:match[2],l:match[3]};}if(match=matchers.hsla.exec(color)){return {h:match[1],s:match[2],l:match[3],a:match[4]};}if(match=matchers.hsv.exec(color)){return {h:match[1],s:match[2],v:match[3]};}if(match=matchers.hsva.exec(color)){return {h:match[1],s:match[2],v:match[3],a:match[4]};}if(match=matchers.hex8.exec(color)){return {a:convertHexToDecimal(match[1]),r:parseIntFromHex(match[2]),g:parseIntFromHex(match[3]),b:parseIntFromHex(match[4]),format:named?"name":"hex8"};}if(match=matchers.hex6.exec(color)){return {r:parseIntFromHex(match[1]),g:parseIntFromHex(match[2]),b:parseIntFromHex(match[3]),format:named?"name":"hex"};}if(match=matchers.hex3.exec(color)){return {r:parseIntFromHex(match[1]+''+match[1]),g:parseIntFromHex(match[2]+''+match[2]),b:parseIntFromHex(match[3]+''+match[3]),format:named?"name":"hex"};}return false;}function validateWCAG2Parms(parms){ // return valid WCAG2 parms for isReadable.
// If input parms are invalid, return {"level":"AA", "size":"small"}
var level,size;parms=parms||{"level":"AA","size":"small"};level=(parms.level||"AA").toUpperCase();size=(parms.size||"small").toLowerCase();if(level!=="AA"&&level!=="AAA"){level="AA";}if(size!=="small"&&size!=="large"){size="small";}return {"level":level,"size":size};} // Node: Export function
if(typeof module!=="undefined"&&module.exports){module.exports=tinycolor;} // AMD/requirejs: Define the module
else if(typeof define==='function'&&define.amd){define(function(){return tinycolor;});} // Browser: Expose to window
else {window.tinycolor=tinycolor;}})();},{}],100:[function(require,module,exports){exports=module.exports=trim;function trim(str){return str.replace(/^\s*|\s*$/g,'');}exports.left=function(str){return str.replace(/^\s*/,'');};exports.right=function(str){return str.replace(/\s*$/,'');};},{}],101:[function(require,module,exports){'use strict';var ipRegex=require('ip-regex');module.exports=function(opts){opts=opts||{};var protocol='(?:(?:[a-z]+:)?//)';var auth='(?:\\S+(?::\\S*)?@)?';var ip=ipRegex.v4().source;var host="(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)";var domain="(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*";var tld="(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))";var port='(?::\\d{2,5})?';var path='(?:[/?#][^\\s"]*)?';var regex=[protocol,auth,'(?:localhost|'+ip+'|'+host+domain+tld+')',port,path].join('');return opts.exact?new RegExp('(?:^'+regex+'$)','i'):new RegExp(regex,'ig');};},{"ip-regex":32}],102:[function(require,module,exports){(function(global){ /**
 * Module exports.
 */module.exports=deprecate; /**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */function deprecate(fn,msg){if(config('noDeprecation')){return fn;}var warned=false;function deprecated(){if(!warned){if(config('throwDeprecation')){throw new Error(msg);}else if(config('traceDeprecation')){console.trace(msg);}else {console.warn(msg);}warned=true;}return fn.apply(this,arguments);}return deprecated;} /**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */function config(name){ // accessing global.localStorage can trigger a DOMException in sandboxed iframes
try{if(!global.localStorage)return false;}catch(_){return false;}var val=global.localStorage[name];if(null==val)return false;return String(val).toLowerCase()==='true';}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],103:[function(require,module,exports){module.exports=function isBuffer(arg){return arg&&(typeof arg==="undefined"?"undefined":_typeof(arg))==='object'&&typeof arg.copy==='function'&&typeof arg.fill==='function'&&typeof arg.readUInt8==='function';};},{}],104:[function(require,module,exports){(function(process,global){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var formatRegExp=/%[sdj%]/g;exports.format=function(f){if(!isString(f)){var objects=[];for(var i=0;i<arguments.length;i++){objects.push(inspect(arguments[i]));}return objects.join(' ');}var i=1;var args=arguments;var len=args.length;var str=String(f).replace(formatRegExp,function(x){if(x==='%%')return '%';if(i>=len)return x;switch(x){case '%s':return String(args[i++]);case '%d':return Number(args[i++]);case '%j':try{return JSON.stringify(args[i++]);}catch(_){return '[Circular]';}default:return x;}});for(var x=args[i];i<len;x=args[++i]){if(isNull(x)||!isObject(x)){str+=' '+x;}else {str+=' '+inspect(x);}}return str;}; // Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate=function(fn,msg){ // Allow for deprecating things in the process of starting up.
if(isUndefined(global.process)){return function(){return exports.deprecate(fn,msg).apply(this,arguments);};}if(process.noDeprecation===true){return fn;}var warned=false;function deprecated(){if(!warned){if(process.throwDeprecation){throw new Error(msg);}else if(process.traceDeprecation){console.trace(msg);}else {console.error(msg);}warned=true;}return fn.apply(this,arguments);}return deprecated;};var debugs={};var debugEnviron;exports.debuglog=function(set){if(isUndefined(debugEnviron))debugEnviron=process.env.NODE_DEBUG||'';set=set.toUpperCase();if(!debugs[set]){if(new RegExp('\\b'+set+'\\b','i').test(debugEnviron)){var pid=process.pid;debugs[set]=function(){var msg=exports.format.apply(exports,arguments);console.error('%s %d: %s',set,pid,msg);};}else {debugs[set]=function(){};}}return debugs[set];}; /**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */ /* legacy: obj, showHidden, depth, colors*/function inspect(obj,opts){ // default options
var ctx={seen:[],stylize:stylizeNoColor}; // legacy...
if(arguments.length>=3)ctx.depth=arguments[2];if(arguments.length>=4)ctx.colors=arguments[3];if(isBoolean(opts)){ // legacy...
ctx.showHidden=opts;}else if(opts){ // got an "options" object
exports._extend(ctx,opts);} // set default options
if(isUndefined(ctx.showHidden))ctx.showHidden=false;if(isUndefined(ctx.depth))ctx.depth=2;if(isUndefined(ctx.colors))ctx.colors=false;if(isUndefined(ctx.customInspect))ctx.customInspect=true;if(ctx.colors)ctx.stylize=stylizeWithColor;return formatValue(ctx,obj,ctx.depth);}exports.inspect=inspect; // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors={'bold':[1,22],'italic':[3,23],'underline':[4,24],'inverse':[7,27],'white':[37,39],'grey':[90,39],'black':[30,39],'blue':[34,39],'cyan':[36,39],'green':[32,39],'magenta':[35,39],'red':[31,39],'yellow':[33,39]}; // Don't use 'blue' not visible on cmd.exe
inspect.styles={'special':'cyan','number':'yellow','boolean':'yellow','undefined':'grey','null':'bold','string':'green','date':'magenta', // "name": intentionally not styling
'regexp':'red'};function stylizeWithColor(str,styleType){var style=inspect.styles[styleType];if(style){return "\u001b["+inspect.colors[style][0]+'m'+str+"\u001b["+inspect.colors[style][1]+'m';}else {return str;}}function stylizeNoColor(str,styleType){return str;}function arrayToHash(array){var hash={};array.forEach(function(val,idx){hash[val]=true;});return hash;}function formatValue(ctx,value,recurseTimes){ // Provide a hook for user-specified inspect functions.
// Check that value is an object with an inspect function on it
if(ctx.customInspect&&value&&isFunction(value.inspect)&& // Filter out the util module, it's inspect function is special
value.inspect!==exports.inspect&& // Also filter out any prototype objects using the circular check.
!(value.constructor&&value.constructor.prototype===value)){var ret=value.inspect(recurseTimes,ctx);if(!isString(ret)){ret=formatValue(ctx,ret,recurseTimes);}return ret;} // Primitive types cannot have properties
var primitive=formatPrimitive(ctx,value);if(primitive){return primitive;} // Look up the keys of the object.
var keys=Object.keys(value);var visibleKeys=arrayToHash(keys);if(ctx.showHidden){keys=Object.getOwnPropertyNames(value);} // IE doesn't make error fields non-enumerable
// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
if(isError(value)&&(keys.indexOf('message')>=0||keys.indexOf('description')>=0)){return formatError(value);} // Some type of object without properties can be shortcutted.
if(keys.length===0){if(isFunction(value)){var name=value.name?': '+value.name:'';return ctx.stylize('[Function'+name+']','special');}if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp');}if(isDate(value)){return ctx.stylize(Date.prototype.toString.call(value),'date');}if(isError(value)){return formatError(value);}}var base='',array=false,braces=['{','}']; // Make Array say that they are Array
if(isArray(value)){array=true;braces=['[',']'];} // Make functions say that they are functions
if(isFunction(value)){var n=value.name?': '+value.name:'';base=' [Function'+n+']';} // Make RegExps say that they are RegExps
if(isRegExp(value)){base=' '+RegExp.prototype.toString.call(value);} // Make dates with properties first say the date
if(isDate(value)){base=' '+Date.prototype.toUTCString.call(value);} // Make error with message first say the error
if(isError(value)){base=' '+formatError(value);}if(keys.length===0&&(!array||value.length==0)){return braces[0]+base+braces[1];}if(recurseTimes<0){if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp');}else {return ctx.stylize('[Object]','special');}}ctx.seen.push(value);var output;if(array){output=formatArray(ctx,value,recurseTimes,visibleKeys,keys);}else {output=keys.map(function(key){return formatProperty(ctx,value,recurseTimes,visibleKeys,key,array);});}ctx.seen.pop();return reduceToSingleString(output,base,braces);}function formatPrimitive(ctx,value){if(isUndefined(value))return ctx.stylize('undefined','undefined');if(isString(value)){var simple='\''+JSON.stringify(value).replace(/^"|"$/g,'').replace(/'/g,"\\'").replace(/\\"/g,'"')+'\'';return ctx.stylize(simple,'string');}if(isNumber(value))return ctx.stylize(''+value,'number');if(isBoolean(value))return ctx.stylize(''+value,'boolean'); // For some reason typeof null is "object", so special case here.
if(isNull(value))return ctx.stylize('null','null');}function formatError(value){return '['+Error.prototype.toString.call(value)+']';}function formatArray(ctx,value,recurseTimes,visibleKeys,keys){var output=[];for(var i=0,l=value.length;i<l;++i){if(hasOwnProperty(value,String(i))){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,String(i),true));}else {output.push('');}}keys.forEach(function(key){if(!key.match(/^\d+$/)){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,key,true));}});return output;}function formatProperty(ctx,value,recurseTimes,visibleKeys,key,array){var name,str,desc;desc=Object.getOwnPropertyDescriptor(value,key)||{value:value[key]};if(desc.get){if(desc.set){str=ctx.stylize('[Getter/Setter]','special');}else {str=ctx.stylize('[Getter]','special');}}else {if(desc.set){str=ctx.stylize('[Setter]','special');}}if(!hasOwnProperty(visibleKeys,key)){name='['+key+']';}if(!str){if(ctx.seen.indexOf(desc.value)<0){if(isNull(recurseTimes)){str=formatValue(ctx,desc.value,null);}else {str=formatValue(ctx,desc.value,recurseTimes-1);}if(str.indexOf('\n')>-1){if(array){str=str.split('\n').map(function(line){return '  '+line;}).join('\n').substr(2);}else {str='\n'+str.split('\n').map(function(line){return '   '+line;}).join('\n');}}}else {str=ctx.stylize('[Circular]','special');}}if(isUndefined(name)){if(array&&key.match(/^\d+$/)){return str;}name=JSON.stringify(''+key);if(name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)){name=name.substr(1,name.length-2);name=ctx.stylize(name,'name');}else {name=name.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'");name=ctx.stylize(name,'string');}}return name+': '+str;}function reduceToSingleString(output,base,braces){var numLinesEst=0;var length=output.reduce(function(prev,cur){numLinesEst++;if(cur.indexOf('\n')>=0)numLinesEst++;return prev+cur.replace(/\u001b\[\d\d?m/g,'').length+1;},0);if(length>60){return braces[0]+(base===''?'':base+'\n ')+' '+output.join(',\n  ')+' '+braces[1];}return braces[0]+base+' '+output.join(', ')+' '+braces[1];} // NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar){return Array.isArray(ar);}exports.isArray=isArray;function isBoolean(arg){return typeof arg==='boolean';}exports.isBoolean=isBoolean;function isNull(arg){return arg===null;}exports.isNull=isNull;function isNullOrUndefined(arg){return arg==null;}exports.isNullOrUndefined=isNullOrUndefined;function isNumber(arg){return typeof arg==='number';}exports.isNumber=isNumber;function isString(arg){return typeof arg==='string';}exports.isString=isString;function isSymbol(arg){return (typeof arg==="undefined"?"undefined":_typeof(arg))==='symbol';}exports.isSymbol=isSymbol;function isUndefined(arg){return arg===void 0;}exports.isUndefined=isUndefined;function isRegExp(re){return isObject(re)&&objectToString(re)==='[object RegExp]';}exports.isRegExp=isRegExp;function isObject(arg){return (typeof arg==="undefined"?"undefined":_typeof(arg))==='object'&&arg!==null;}exports.isObject=isObject;function isDate(d){return isObject(d)&&objectToString(d)==='[object Date]';}exports.isDate=isDate;function isError(e){return isObject(e)&&(objectToString(e)==='[object Error]'||e instanceof Error);}exports.isError=isError;function isFunction(arg){return typeof arg==='function';}exports.isFunction=isFunction;function isPrimitive(arg){return arg===null||typeof arg==='boolean'||typeof arg==='number'||typeof arg==='string'||(typeof arg==="undefined"?"undefined":_typeof(arg))==='symbol'|| // ES6 symbol
typeof arg==='undefined';}exports.isPrimitive=isPrimitive;exports.isBuffer=require('./support/isBuffer');function objectToString(o){return Object.prototype.toString.call(o);}function pad(n){return n<10?'0'+n.toString(10):n.toString(10);}var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; // 26 Feb 16:19:34
function timestamp(){var d=new Date();var time=[pad(d.getHours()),pad(d.getMinutes()),pad(d.getSeconds())].join(':');return [d.getDate(),months[d.getMonth()],time].join(' ');} // log is just a thin wrapper to console.log that prepends a timestamp
exports.log=function(){console.log('%s - %s',timestamp(),exports.format.apply(exports,arguments));}; /**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */exports.inherits=require('inherits');exports._extend=function(origin,add){ // Don't do anything if add isn't an object
if(!add||!isObject(add))return origin;var keys=Object.keys(add);var i=keys.length;while(i--){origin[keys[i]]=add[keys[i]];}return origin;};function hasOwnProperty(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop);}}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"./support/isBuffer":103,"_process":12,"inherits":31}],105:[function(require,module,exports){"use strict";var window=require("global/window");var once=require("once");var isFunction=require("is-function");var parseHeaders=require("parse-headers");var xtend=require("xtend");module.exports=createXHR;createXHR.XMLHttpRequest=window.XMLHttpRequest||noop;createXHR.XDomainRequest="withCredentials" in new createXHR.XMLHttpRequest()?createXHR.XMLHttpRequest:window.XDomainRequest;forEachArray(["get","put","post","patch","head","delete"],function(method){createXHR[method==="delete"?"del":method]=function(uri,options,callback){options=initParams(uri,options,callback);options.method=method.toUpperCase();return _createXHR(options);};});function forEachArray(array,iterator){for(var i=0;i<array.length;i++){iterator(array[i]);}}function isEmpty(obj){for(var i in obj){if(obj.hasOwnProperty(i))return false;}return true;}function initParams(uri,options,callback){var params=uri;if(isFunction(options)){callback=options;if(typeof uri==="string"){params={uri:uri};}}else {params=xtend(options,{uri:uri});}params.callback=callback;return params;}function createXHR(uri,options,callback){options=initParams(uri,options,callback);return _createXHR(options);}function _createXHR(options){var callback=options.callback;if(typeof callback==="undefined"){throw new Error("callback argument missing");}callback=once(callback);function readystatechange(){if(xhr.readyState===4){loadFunc();}}function getBody(){ // Chrome with requestType=blob throws errors arround when even testing access to responseText
var body=undefined;if(xhr.response){body=xhr.response;}else if(xhr.responseType==="text"||!xhr.responseType){body=xhr.responseText||xhr.responseXML;}if(isJson){try{body=JSON.parse(body);}catch(e){}}return body;}var failureResponse={body:undefined,headers:{},statusCode:0,method:method,url:uri,rawRequest:xhr};function errorFunc(evt){clearTimeout(timeoutTimer);if(!(evt instanceof Error)){evt=new Error(""+(evt||"Unknown XMLHttpRequest Error"));}evt.statusCode=0;callback(evt,failureResponse);} // will load the data & process the response in a special response object
function loadFunc(){if(aborted)return;var status;clearTimeout(timeoutTimer);if(options.useXDR&&xhr.status===undefined){ //IE8 CORS GET successful response doesn't have a status field, but body is fine
status=200;}else {status=xhr.status===1223?204:xhr.status;}var response=failureResponse;var err=null;if(status!==0){response={body:getBody(),statusCode:status,method:method,headers:{},url:uri,rawRequest:xhr};if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
response.headers=parseHeaders(xhr.getAllResponseHeaders());}}else {err=new Error("Internal XMLHttpRequest Error");}callback(err,response,response.body);}var xhr=options.xhr||null;if(!xhr){if(options.cors||options.useXDR){xhr=new createXHR.XDomainRequest();}else {xhr=new createXHR.XMLHttpRequest();}}var key;var aborted;var uri=xhr.url=options.uri||options.url;var method=xhr.method=options.method||"GET";var body=options.body||options.data||null;var headers=xhr.headers=options.headers||{};var sync=!!options.sync;var isJson=false;var timeoutTimer;if("json" in options){isJson=true;headers["accept"]||headers["Accept"]||(headers["Accept"]="application/json"); //Don't override existing accept header declared by user
if(method!=="GET"&&method!=="HEAD"){headers["content-type"]||headers["Content-Type"]||(headers["Content-Type"]="application/json"); //Don't override existing accept header declared by user
body=JSON.stringify(options.json);}}xhr.onreadystatechange=readystatechange;xhr.onload=loadFunc;xhr.onerror=errorFunc; // IE9 must have onprogress be set to a unique function.
xhr.onprogress=function(){ // IE must die
};xhr.ontimeout=errorFunc;xhr.open(method,uri,!sync,options.username,options.password); //has to be after open
if(!sync){xhr.withCredentials=!!options.withCredentials;} // Cannot set timeout with sync request
// not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
// both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
if(!sync&&options.timeout>0){timeoutTimer=setTimeout(function(){aborted=true; //IE9 may still call readystatechange
xhr.abort("timeout");var e=new Error("XMLHttpRequest timeout");e.code="ETIMEDOUT";errorFunc(e);},options.timeout);}if(xhr.setRequestHeader){for(key in headers){if(headers.hasOwnProperty(key)){xhr.setRequestHeader(key,headers[key]);}}}else if(options.headers&&!isEmpty(options.headers)){throw new Error("Headers cannot be set on an XDomainRequest object");}if("responseType" in options){xhr.responseType=options.responseType;}if("beforeSend" in options&&typeof options.beforeSend==="function"){options.beforeSend(xhr);}xhr.send(body);return xhr;}function noop(){}},{"global/window":29,"is-function":34,"once":43,"parse-headers":59,"xtend":107}],106:[function(require,module,exports){module.exports=function xmlparser(){ //common browsers
if(typeof window.DOMParser!=='undefined'){return function(str){var parser=new window.DOMParser();return parser.parseFromString(str,'application/xml');};} //IE8 fallback
if(typeof window.ActiveXObject!=='undefined'&&new window.ActiveXObject('Microsoft.XMLDOM')){return function(str){var xmlDoc=new window.ActiveXObject("Microsoft.XMLDOM");xmlDoc.async="false";xmlDoc.loadXML(str);return xmlDoc;};} //last resort fallback
return function(str){var div=document.createElement('div');div.innerHTML=str;return div;};}();},{}],107:[function(require,module,exports){module.exports=extend;var hasOwnProperty=Object.prototype.hasOwnProperty;function extend(){var target={};for(var i=0;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;}},{}],108:[function(require,module,exports){function ImagePHash(t,a){this.size=this.size||t,this.smallerSize=this.smallerSize||a,initCoefficients(this.size);}function intToRGBA(t){var a={};return a.r=Math.floor(t/Math.pow(256,3)),a.g=Math.floor((t-a.r*Math.pow(256,3))/Math.pow(256,2)),a.b=Math.floor((t-a.r*Math.pow(256,3)-a.g*Math.pow(256,2))/Math.pow(256,1)),a.a=Math.floor((t-a.r*Math.pow(256,3)-a.g*Math.pow(256,2)-a.b*Math.pow(256,1))/Math.pow(256,0)),a;}function initCoefficients(t){for(var a=1;t>a;a++){c[a]=1;}c[0]=1/Math.sqrt(2);}function applyDCT(t,a){for(var r=a,e=[],o=0;r>o;o++){e[o]=[];for(var i=0;r>i;i++){for(var s=0,h=0;r>h;h++){for(var l=0;r>l;l++){s+=Math.cos((2*h+1)/(2*r)*o*Math.PI)*Math.cos((2*l+1)/(2*r)*i*Math.PI)*t[h][l];}}s*=c[o]*c[i]/4,e[o][i]=s;}}return e;}ImagePHash.prototype.size=32,ImagePHash.prototype.smallerSize=8,ImagePHash.prototype.distance=function(t,a){for(var r=0,e=0;e<t.length;e++){t[e]!=a[e]&&r++;}return r/t.length;},ImagePHash.prototype.getHash=function(t){t=t.clone().resize(this.size,this.size),t.grayscale();for(var a=[],r=0;r<t.bitmap.width;r++){a[r]=[];for(var e=0;e<t.bitmap.height;e++){a[r][e]=intToRGBA(t.getPixelColor(r,e)).b;}}for(var o=applyDCT(a,this.size),i=0,r=0;r<this.smallerSize;r++){for(var e=0;e<this.smallerSize;e++){i+=o[r][e];}}for(var s=i/(this.smallerSize*this.smallerSize),h="",r=0;r<this.smallerSize;r++){for(var e=0;e<this.smallerSize;e++){h+=o[r][e]>s?"1":"0";}}return h;};var c=[];module.exports=ImagePHash;},{}],109:[function(require,module,exports){function Resize(i,t,e,h,s,r,l){this.widthOriginal=Math.abs(parseInt(i)||0),this.heightOriginal=Math.abs(parseInt(t)||0),this.targetWidth=Math.abs(parseInt(e)||0),this.targetHeight=Math.abs(parseInt(h)||0),this.colorChannels=s?4:3,this.interpolationPass=!!r,this.resizeCallback="function"==typeof l?l:function(i){},this.targetWidthMultipliedByChannels=this.targetWidth*this.colorChannels,this.originalWidthMultipliedByChannels=this.widthOriginal*this.colorChannels,this.originalHeightMultipliedByChannels=this.heightOriginal*this.colorChannels,this.widthPassResultSize=this.targetWidthMultipliedByChannels*this.heightOriginal,this.finalResultSize=this.targetWidthMultipliedByChannels*this.targetHeight,this.initialize();}Resize.prototype.initialize=function(){if(!(this.widthOriginal>0&&this.heightOriginal>0&&this.targetWidth>0&&this.targetHeight>0))throw new Error("Invalid settings specified for the resizer.");this.configurePasses();},Resize.prototype.configurePasses=function(){this.widthOriginal==this.targetWidth?this.resizeWidth=this.bypassResizer:(this.ratioWeightWidthPass=this.widthOriginal/this.targetWidth,this.ratioWeightWidthPass<1&&this.interpolationPass?(this.initializeFirstPassBuffers(!0),this.resizeWidth=4==this.colorChannels?this.resizeWidthInterpolatedRGBA:this.resizeWidthInterpolatedRGB):(this.initializeFirstPassBuffers(!1),this.resizeWidth=4==this.colorChannels?this.resizeWidthRGBA:this.resizeWidthRGB)),this.heightOriginal==this.targetHeight?this.resizeHeight=this.bypassResizer:(this.ratioWeightHeightPass=this.heightOriginal/this.targetHeight,this.ratioWeightHeightPass<1&&this.interpolationPass?(this.initializeSecondPassBuffers(!0),this.resizeHeight=this.resizeHeightInterpolated):(this.initializeSecondPassBuffers(!1),this.resizeHeight=4==this.colorChannels?this.resizeHeightRGBA:this.resizeHeightRGB));},Resize.prototype.resizeWidthRGB=function(i){var t=this.ratioWeightWidthPass,e=1/t,h=0,s=0,r=0,l=0,n=0,a=0,o=0,d=this.originalWidthMultipliedByChannels-2,u=this.targetWidthMultipliedByChannels-2,g=this.outputWidthWorkBench,f=this.widthBuffer;do {for(n=0;n<this.originalHeightMultipliedByChannels;){g[n++]=0,g[n++]=0,g[n++]=0;}h=t;do {if(s=1+r-l,!(h>=s)){for(n=0,a=r;n<this.originalHeightMultipliedByChannels;a+=d){g[n++]+=i[a++]*h,g[n++]+=i[a++]*h,g[n++]+=i[a]*h;}l+=h;break;}for(n=0,a=r;n<this.originalHeightMultipliedByChannels;a+=d){g[n++]+=i[a++]*s,g[n++]+=i[a++]*s,g[n++]+=i[a]*s;}l=r+=3,h-=s;}while(h>0&&r<this.originalWidthMultipliedByChannels);for(n=0,a=o;n<this.originalHeightMultipliedByChannels;a+=u){f[a++]=g[n++]*e,f[a++]=g[n++]*e,f[a]=g[n++]*e;}o+=3;}while(o<this.targetWidthMultipliedByChannels);return f;},Resize.prototype.resizeWidthInterpolatedRGB=function(i){for(var t=this.ratioWeightWidthPass,e=0,h=0,s=0,r=0,l=0,n=this.widthBuffer,a=0;1/3>e;a+=3,e+=t){for(h=a,s=0;h<this.widthPassResultSize;s+=this.originalWidthMultipliedByChannels,h+=this.targetWidthMultipliedByChannels){n[h]=i[s],n[h+1]=i[s+1],n[h+2]=i[s+2];}}e-=1/3;for(var o=this.widthOriginal-1;o>e;a+=3,e+=t){for(l=e%1,r=1-l,h=a,s=3*Math.floor(e);h<this.widthPassResultSize;s+=this.originalWidthMultipliedByChannels,h+=this.targetWidthMultipliedByChannels){n[h]=i[s]*r+i[s+3]*l,n[h+1]=i[s+1]*r+i[s+4]*l,n[h+2]=i[s+2]*r+i[s+5]*l;}}for(o=this.originalWidthMultipliedByChannels-3;a<this.targetWidthMultipliedByChannels;a+=3){for(h=a,s=o;h<this.widthPassResultSize;s+=this.originalWidthMultipliedByChannels,h+=this.targetWidthMultipliedByChannels){n[h]=i[s],n[h+1]=i[s+1],n[h+2]=i[s+2];}}return n;},Resize.prototype.resizeWidthRGBA=function(i){var t=this.ratioWeightWidthPass,e=1/t,h=0,s=0,r=0,l=0,n=0,a=0,o=0,d=this.originalWidthMultipliedByChannels-3,u=this.targetWidthMultipliedByChannels-3,g=this.outputWidthWorkBench,f=this.widthBuffer;do {for(n=0;n<this.originalHeightMultipliedByChannels;){g[n++]=0,g[n++]=0,g[n++]=0,g[n++]=0;}h=t;do {if(s=1+r-l,!(h>=s)){for(n=0,a=r;n<this.originalHeightMultipliedByChannels;a+=d){g[n++]+=i[a++]*h,g[n++]+=i[a++]*h,g[n++]+=i[a++]*h,g[n++]+=i[a]*h;}l+=h;break;}for(n=0,a=r;n<this.originalHeightMultipliedByChannels;a+=d){g[n++]+=i[a++]*s,g[n++]+=i[a++]*s,g[n++]+=i[a++]*s,g[n++]+=i[a]*s;}l=r+=4,h-=s;}while(h>0&&r<this.originalWidthMultipliedByChannels);for(n=0,a=o;n<this.originalHeightMultipliedByChannels;a+=u){f[a++]=g[n++]*e,f[a++]=g[n++]*e,f[a++]=g[n++]*e,f[a]=g[n++]*e;}o+=4;}while(o<this.targetWidthMultipliedByChannels);return f;},Resize.prototype.resizeWidthInterpolatedRGBA=function(i){for(var t=this.ratioWeightWidthPass,e=0,h=0,s=0,r=0,l=0,n=this.widthBuffer,a=0;1/3>e;a+=4,e+=t){for(h=a,s=0;h<this.widthPassResultSize;s+=this.originalWidthMultipliedByChannels,h+=this.targetWidthMultipliedByChannels){n[h]=i[s],n[h+1]=i[s+1],n[h+2]=i[s+2],n[h+3]=i[s+3];}}e-=1/3;for(var o=this.widthOriginal-1;o>e;a+=4,e+=t){for(l=e%1,r=1-l,h=a,s=4*Math.floor(e);h<this.widthPassResultSize;s+=this.originalWidthMultipliedByChannels,h+=this.targetWidthMultipliedByChannels){n[h]=i[s]*r+i[s+4]*l,n[h+1]=i[s+1]*r+i[s+5]*l,n[h+2]=i[s+2]*r+i[s+6]*l,n[h+3]=i[s+3]*r+i[s+7]*l;}}for(o=this.originalWidthMultipliedByChannels-4;a<this.targetWidthMultipliedByChannels;a+=4){for(h=a,s=o;h<this.widthPassResultSize;s+=this.originalWidthMultipliedByChannels,h+=this.targetWidthMultipliedByChannels){n[h]=i[s],n[h+1]=i[s+1],n[h+2]=i[s+2],n[h+3]=i[s+3];}}return n;},Resize.prototype.resizeHeightRGB=function(i){var t=this.ratioWeightHeightPass,e=1/t,h=0,s=0,r=0,l=0,n=0,a=0,o=this.outputHeightWorkBench,d=this.heightBuffer;do {for(n=0;n<this.targetWidthMultipliedByChannels;){o[n++]=0,o[n++]=0,o[n++]=0;}h=t;do {if(s=1+r-l,!(h>=s)){for(n=0,s=r;n<this.targetWidthMultipliedByChannels;){o[n++]+=i[s++]*h,o[n++]+=i[s++]*h,o[n++]+=i[s++]*h;}l+=h;break;}for(n=0;n<this.targetWidthMultipliedByChannels;){o[n++]+=i[r++]*s,o[n++]+=i[r++]*s,o[n++]+=i[r++]*s;}l=r,h-=s;}while(h>0&&r<this.widthPassResultSize);for(n=0;n<this.targetWidthMultipliedByChannels;){d[a++]=Math.round(o[n++]*e),d[a++]=Math.round(o[n++]*e),d[a++]=Math.round(o[n++]*e);}}while(a<this.finalResultSize);return d;},Resize.prototype.resizeHeightInterpolated=function(i){for(var t=this.ratioWeightHeightPass,e=0,h=0,s=0,r=0,l=0,n=0,a=0,o=this.heightBuffer;1/3>e;e+=t){for(s=0;s<this.targetWidthMultipliedByChannels;){o[h++]=Math.round(i[s++]);}}e-=1/3;for(var d=this.heightOriginal-1;d>e;e+=t){for(a=e%1,n=1-a,r=Math.floor(e)*this.targetWidthMultipliedByChannels,l=r+this.targetWidthMultipliedByChannels,s=0;s<this.targetWidthMultipliedByChannels;++s){o[h++]=Math.round(i[r++]*n+i[l++]*a);}}for(;h<this.finalResultSize;){for(s=0,r=d*this.targetWidthMultipliedByChannels;s<this.targetWidthMultipliedByChannels;++s){o[h++]=Math.round(i[r++]);}}return o;},Resize.prototype.resizeHeightRGBA=function(i){var t=this.ratioWeightHeightPass,e=1/t,h=0,s=0,r=0,l=0,n=0,a=0,o=this.outputHeightWorkBench,d=this.heightBuffer;do {for(n=0;n<this.targetWidthMultipliedByChannels;){o[n++]=0,o[n++]=0,o[n++]=0,o[n++]=0;}h=t;do {if(s=1+r-l,!(h>=s)){for(n=0,s=r;n<this.targetWidthMultipliedByChannels;){o[n++]+=i[s++]*h,o[n++]+=i[s++]*h,o[n++]+=i[s++]*h,o[n++]+=i[s++]*h;}l+=h;break;}for(n=0;n<this.targetWidthMultipliedByChannels;){o[n++]+=i[r++]*s,o[n++]+=i[r++]*s,o[n++]+=i[r++]*s,o[n++]+=i[r++]*s;}l=r,h-=s;}while(h>0&&r<this.widthPassResultSize);for(n=0;n<this.targetWidthMultipliedByChannels;){d[a++]=Math.round(o[n++]*e),d[a++]=Math.round(o[n++]*e),d[a++]=Math.round(o[n++]*e),d[a++]=Math.round(o[n++]*e);}}while(a<this.finalResultSize);return d;},Resize.prototype.resize=function(i){this.resizeCallback(this.resizeHeight(this.resizeWidth(i)));},Resize.prototype.bypassResizer=function(i){return i;},Resize.prototype.initializeFirstPassBuffers=function(i){this.widthBuffer=this.generateFloatBuffer(this.widthPassResultSize),i||(this.outputWidthWorkBench=this.generateFloatBuffer(this.originalHeightMultipliedByChannels));},Resize.prototype.initializeSecondPassBuffers=function(i){this.heightBuffer=this.generateUint8Buffer(this.finalResultSize),i||(this.outputHeightWorkBench=this.generateFloatBuffer(this.targetWidthMultipliedByChannels));},Resize.prototype.generateFloatBuffer=function(i){try{return new Float32Array(i);}catch(t){return [];}},Resize.prototype.generateUint8Buffer=function(i){try{return new Uint8Array(i);}catch(t){return [];}},module.exports=Resize;},{}],110:[function(require,module,exports){(function(Buffer){"use strict";module.exports={nearestNeighbor:function nearestNeighbor(r,t,a){for(var o=r.width,n=r.height,i=t.width,h=t.height,e=r.data,f=t.data,u=0;h>u;u++){for(var v=0;i>v;v++){var M=4*(u*i+v),d=Math.round(u*n/h),l=Math.round(v*o/i),c=4*(d*o+l);f[M++]=e[c++],f[M++]=e[c++],f[M++]=e[c++],f[M++]=e[c++];}}},bilinearInterpolation:function bilinearInterpolation(r,t,a){for(var o=r.width,n=r.height,i=t.width,h=t.height,e=r.data,f=t.data,u=function u(r,t,a,o,n){return t===o?a:Math.round((r-t)*n+(o-r)*a);},v=function v(r,t,a,n,i,h,_v,M){var d=4*(_v*o+n)+t,l=4*(_v*o+i)+t,c=u(a,n,e[d],i,e[l]);if(M===_v)f[r+t]=c;else {d=4*(M*o+n)+t,l=4*(M*o+i)+t;var m=u(a,n,e[d],i,e[l]);f[r+t]=u(h,_v,c,M,m);}},M=0;h>M;M++){for(var d=0;i>d;d++){var l=4*(M*i+d),c=d*o/i,m=Math.floor(c),p=Math.min(Math.ceil(c),o-1),s=M*n/h,w=Math.floor(s),g=Math.min(Math.ceil(s),n-1);v(l,0,c,m,p,s,w,g),v(l,1,c,m,p,s,w,g),v(l,2,c,m,p,s,w,g),v(l,3,c,m,p,s,w,g);}}},_interpolate2D:function _interpolate2D(r,t,a,o){for(var n=r.data,i=t.data,h=r.width,e=r.height,f=t.width,u=t.height,v=Math.max(1,Math.floor(h/f)),M=f*v,d=Math.max(1,Math.floor(e/u)),l=u*d,c=new Buffer(M*e*4),m=0;e>m;m++){for(var p=0;M>p;p++){for(var s=p*(h-1)/M,w=Math.floor(s),g=s-w,x=4*(m*h+w),b=4*(m*M+p),D=0;4>D;D++){var I=x+D,_=w>0?n[I-4]:2*n[I]-n[I+4],B=n[I],z=n[I+4],N=h-2>w?n[I+8]:2*n[I+4]-n[I];c[b+D]=o(_,B,z,N,g);}}}for(var j=new Buffer(M*l*4),m=0;l>m;m++){for(var p=0;M>p;p++){for(var k=m*(e-1)/l,q=Math.floor(k),g=k-q,b=4*(q*M+p),y=4*(m*M+p),D=0;4>D;D++){var I=b+D,A=q>0?c[I-4*M]:2*c[I]-c[I+4*M],C=c[I],E=c[I+4*M],F=e-2>q?c[I+8*M]:2*c[I+4*M]-c[I];j[y+D]=o(A,C,E,F,g);}}}var G=v*d;if(G>1)for(var m=0;u>m;m++){for(var p=0;f>p;p++){for(var H=0,J=0,K=0,L=0,k=0;d>k;k++){for(var q=m*d+k,s=0;v>s;s++){var w=p*v+s,O=4*(q*M+w);H+=j[O],J+=j[O+1],K+=j[O+2],L+=j[O+3];}}var P=4*(m*f+p);i[P]=Math.round(H/G),i[P+1]=Math.round(J/G),i[P+2]=Math.round(K/G),i[P+3]=Math.round(L/G);}}else t.data=j;},bicubicInterpolation:function bicubicInterpolation(r,t,a){var o=function o(r,t,a,_o,n){var i=_o-a-r+t,h=r-t-i,e=a-r,f=t;return Math.max(0,Math.min(255,i*(n*n*n)+h*(n*n)+e*n+f));};return this._interpolate2D(r,t,a,o);},hermiteInterpolation:function hermiteInterpolation(r,t,a){var o=function o(r,t,a,_o2,n){var i=t,h=.5*(a-r),e=r-2.5*t+2*a-.5*_o2,f=.5*(_o2-r)+1.5*(t-a);return Math.max(0,Math.min(255,Math.round(((f*n+e)*n+h)*n+i)));};return this._interpolate2D(r,t,a,o);},bezierInterpolation:function bezierInterpolation(r,t,a){var o=function o(r,t,a,_o3,n){var i=t+(a-r)/4,h=a-(_o3-t)/4,e=1-n,f=t*e*e*e,u=3*i*e*e*n,v=3*h*e*n*n,M=a*n*n*n;return Math.max(0,Math.min(255,Math.round(f+u+v+M)));};return this._interpolate2D(r,t,a,o);}};}).call(this,require("buffer").Buffer);},{"buffer":14}]},{},[1]);
//    The MIT License (MIT)
//
//    Copyright (c) 2015 Phil Seaton
//
//    Permission is hereby granted, free of charge, to any person obtaining a copy
//    of this software and associated documentation files (the "Software"), to deal
//    in the Software without restriction, including without limitation the rights
//    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//    copies of the Software, and to permit persons to whom the Software is
//    furnished to do so, subject to the following conditions:
//
//    The above copyright notice and this permission notice shall be included in all
//    copies or substantial portions of the Software.
//
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//    SOFTWARE.

if (!self.Buffer && !window.Buffer){
    throw new Error("Node's Buffer() not available in jimp-worker.js");
} else if (!self.Jimp && !window.Jimp) {
    throw new Error("Could not load jimp.min.js in jimp-worker.js");
}

// Utility methods for loading images into Jimp in a web worker context
Jimp.WebWorkerUtils = {
    fetchImageDataFromUrl: function(url,cb){
        // Fetch image data via xhr. Note that this will not work
        // without cross-domain allow-origin headers because of CORS restrictions
        var xhr = new XMLHttpRequest();
        xhr.open( "GET", url, true );
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
            if (xhr.status < 400) cb(this.response,null);
            else cb(null,"HTTP Status " + xhr.status + " for url "+url);
        };
        xhr.onerror = function(e){
            cb(null,e);
        };

        xhr.send();
    },
    bufferFromArrayBuffer: function(arrayBuffer){
        // Prepare a Buffer object from the arrayBuffer. Necessary in the browser > node conversion,
        // But this function is not useful when running in node directly
        var buffer = new Buffer(arrayBuffer.byteLength);
        var view = new Uint8Array(arrayBuffer);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }

        return buffer;
    },
    isArrayBuffer: function(test){
        return Object.prototype.toString.call(test).toLowerCase().indexOf("arraybuffer") > -1;
    }
};

// Override the nodejs implementation of Jimp.read()
delete Jimp.read;
Jimp.read = function(src,cb) {
    var utils = Jimp.WebWorkerUtils;

    return new Promise(
        function(resolve, reject) {
            cb = cb || function(err, image) {
                if (err) reject(err);
                else resolve(image);
            };

            if ("string" == typeof src) {
                // Download via xhr
                utils.fetchImageDataFromUrl(src,function(arrayBuffer,error){
                    if (arrayBuffer) {
                        if (!utils.isArrayBuffer(arrayBuffer)) {
                            cb(new Error("Unrecognized data received for " + src));
                        } else {
                            new Jimp(utils.bufferFromArrayBuffer(arrayBuffer),cb);
                        }
                    } else if (error) {
                        cb(error);
                    }
                });
            } else if (utils.isArrayBuffer(src)) {
                // src is an ArrayBuffer already
                new Jimp(utils.bufferFromArrayBuffer(src), cb);
            } else {
                // src is not a string or ArrayBuffer
                cb(new Error("Jimp expects a single ArrayBuffer or image URL"));
            }
        }
    );
}
