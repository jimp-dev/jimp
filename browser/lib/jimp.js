/*
Jimp v0.2.27
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


var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
      }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {
    (function (global, Buffer) {
      var window = window || self,
          _typeof = "function" == typeof Symbol && "symbol" == _typeof2(Symbol.iterator) ? function (t) {
        return typeof t === "undefined" ? "undefined" : _typeof2(t);
      } : function (t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t === "undefined" ? "undefined" : _typeof2(t);
      };if (function t(e, i, n) {
        function r(o, s) {
          if (!i[o]) {
            if (!e[o]) {
              var l = "function" == typeof require && require;if (!s && l) return l(o, !0);if (a) return a(o, !0);var h = new Error("Cannot find module '" + o + "'");throw h.code = "MODULE_NOT_FOUND", h;
            }var f = i[o] = { exports: {} };e[o][0].call(f.exports, function (t) {
              var i = e[o][1][t];return r(i ? i : t);
            }, f, f.exports, t, e, i, n);
          }return i[o].exports;
        }for (var a = "function" == typeof require && require, o = 0; o < n.length; o++) {
          r(n[o]);
        }return r;
      }({ 1: [function (t, e, i) {
          (function (e, i, n, r, a, o, s, l) {
            function h(t) {
              f(), e.stdout.write(t), X = t.length;
            }function f() {
              for (; X-- > 0;) {
                e.stdout.write("\b");
              }
            }function u() {}function p(t) {
              if (void 0 === t) return !1;if ("function" != typeof t) throw new Error("Callback must be a function");return !0;
            }function d(t, e) {
              if ("string" == typeof t && (t = new Error(t)), "function" == typeof e) return e.call(this, t);throw t;
            }function m() {
              if ("number" == typeof arguments[0] && "number" == typeof arguments[1]) {
                var t = arguments[0],
                    e = arguments[1],
                    i = arguments[2];if ("number" == typeof arguments[2]) {
                  this._background = arguments[2];var i = arguments[3];
                }if (void 0 === i && (i = u), "function" != typeof i) return d.call(this, "cb must be a function", i);this.bitmap = { data: new n(t * e * 4), width: t, height: e };for (var r = 0; r < this.bitmap.data.length; r += 4) {
                  this.bitmap.data.writeUInt32BE(this._background, r);
                }i.call(this, null, this);
              } else if ("object" == _typeof(arguments[0]) && arguments[0].constructor == m) {
                var a = arguments[0],
                    i = arguments[1];if (void 0 === i && (i = u), "function" != typeof i) return d.call(this, "cb must be a function", i);var o = new n(a.bitmap.data.length);a.scan(0, 0, a.bitmap.width, a.bitmap.height, function (t, e, i) {
                  var n = a.bitmap.data.readUInt32BE(i, !0);o.writeUInt32BE(n, i, !0);
                }), this.bitmap = { data: o, width: a.bitmap.width, height: a.bitmap.height }, this._quality = a._quality, this._deflateLevel = a._deflateLevel, this._deflateStrategy = a._deflateStrategy, this._filterType = a._filterType, this._rgba = a._rgba, this._background = a._background, i.call(this, null, this);
              } else if (W({ exact: !0 }).test(arguments[0])) {
                var s = arguments[0],
                    i = arguments[1];if (void 0 === i && (i = u), "function" != typeof i) return d.call(this, "cb must be a function", i);var l = this;T(s, function (t, e, r) {
                  if (t) return d.call(l, t, i);if ("object" != (void 0 === r ? "undefined" : _typeof(r)) || !n.isBuffer(r)) return d.call(l, "Could not load Buffer from URL <" + s + "> (HTTP: " + e.statusCode + ")", i);var a = g(r);return "string" != typeof a ? d.call(l, "Could not find MIME for Buffer <" + s + "> (HTTP: " + e.statusCode + ")", i) : void v.call(l, r, a, i);
                });
              } else if ("string" == typeof arguments[0]) {
                var h = arguments[0],
                    i = arguments[1];if (void 0 === i && (i = u), "function" != typeof i) return d.call(this, "cb must be a function", i);var l = this;b(h, function (t, e) {
                  A.readFile(h, function (t, n) {
                    return t ? d.call(l, t, i) : void v.call(l, n, e, i);
                  });
                });
              } else {
                if ("object" != _typeof(arguments[0])) return d.call(this, "No matching constructor overloading was found. Please see the docs for how to call the Jimp constructor.", i);var f = arguments[0],
                    c = g(f),
                    i = arguments[1];if (!n.isBuffer(f)) return d.call(this, "data must be a Buffer", i);if ("string" != typeof c) return d.call(this, "mime must be a string", i);if ("function" != typeof i) return d.call(this, "cb must be a function", i);v.call(this, f, c, i);
              }
            }function g(t, e) {
              var i = N(t);return i ? i.mime : e ? C.lookup(e) : null;
            }function b(t, e) {
              U(t, 0, 262, function (t, i) {
                if (!t) {
                  var n = N(i);return e && e(null, n && n.mime || "");
                }e(null, "");
              });
            }function v(t, e, i) {
              var r = this;switch (this._originalMime = e.toLowerCase(), this.getMIME()) {case m.MIME_PNG:
                  new R().parse(t, function (t, e) {
                    return t ? d.call(r, t, i) : (r.bitmap = { data: new n(e.data), width: e.width, height: e.height }, i.call(r, null, r));
                  });break;case m.MIME_JPEG:
                  try {
                    return this.bitmap = L.decode(t), w(this, t), i.call(this, null, this);
                  } catch (t) {
                    return i.call(this, t, this);
                  }case m.MIME_BMP:
                  return this.bitmap = P.decode(t), i.call(this, null, this);default:
                  return d.call(this, "Unsupported MIME type: " + e, i);}
            }function w(t, e) {
              var i;try {
                i = j.create(e).parse();
              } catch (t) {
                return;
              }if (i && i.tags && i.tags.Orientation) switch (i.tags.Orientation) {case 1:
                  break;case 2:
                  t.mirror(!0, !1);break;case 3:
                  t.rotate(180);break;case 4:
                  t.mirror(!1, !0);break;case 5:
                  t.mirror(!0, !1).rotate(270);break;case 6:
                  t.rotate(90);break;case 7:
                  t.mirror(!0, !1).rotate(90);break;case 8:
                  t.rotate(270);}
            }function _() {
              var t = { r: new Array(256).fill(0), g: new Array(256).fill(0), b: new Array(256).fill(0) };return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (e, i, n) {
                t.r[this.bitmap.data[n + 0]]++, t.g[this.bitmap.data[n + 1]]++, t.b[this.bitmap.data[n + 2]]++;
              }), t;
            }function y(t) {
              for (var e = Math.round(t / 90) % 4; e < 0;) {
                e += 4;
              }for (; e > 0;) {
                for (var i = new n(this.bitmap.data.length), r = 0, a = 0; a < this.bitmap.width; a++) {
                  for (var o = this.bitmap.height - 1; o >= 0; o--) {
                    var s = this.bitmap.width * o + a << 2,
                        l = this.bitmap.data.readUInt32BE(s, !0);i.writeUInt32BE(l, r, !0), r += 4;
                  }
                }this.bitmap.data = new n(i);var h = this.bitmap.width;this.bitmap.width = this.bitmap.height, this.bitmap.height = h, e--;
              }
            }function x(t, e) {
              function i(t, e) {
                return function (i, n) {
                  return { x: i + t, y: n + e };
                };
              }var r,
                  a,
                  o = t % 360 * Math.PI / 180,
                  s = Math.cos(o),
                  l = Math.sin(o);if (1 == e || "string" == typeof e) {
                r = Math.round(Math.abs(this.bitmap.width * s) + Math.abs(this.bitmap.height * l)), a = Math.round(Math.abs(this.bitmap.width * l) + Math.abs(this.bitmap.height * s));var h = this.clone();this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, e, i) {
                  this.bitmap.data.writeUInt32BE(this._background, i);
                });var f = Math.max(r, a, this.bitmap.width, this.bitmap.height);this.resize(f, f, e), this.blit(h, this.bitmap.width / 2 - h.bitmap.width / 2, this.bitmap.height / 2 - h.bitmap.height / 2);
              }for (var c = new n(this.bitmap.data.length), u = i(-(this.bitmap.width / 2), -(this.bitmap.height / 2)), p = i(this.bitmap.width / 2, this.bitmap.height / 2), d = 0; d < this.bitmap.height; d++) {
                for (var m = 0; m < this.bitmap.width; m++) {
                  var g = u(m, this.bitmap.height - d),
                      b = p(s * g.x - l * g.y, s * g.y + l * g.x);if (b.x >= 0 && b.x < this.bitmap.width && b.y >= 0 && b.y < this.bitmap.height) {
                    var v = (this.bitmap.width * (this.bitmap.height - b.y | 0) + b.x | 0) << 2,
                        w = this.bitmap.data.readUInt32BE(v, !0),
                        _ = this.bitmap.width * d + m << 2;c.writeUInt32BE(w, _);
                  } else {
                    var _ = this.bitmap.width * d + m << 2;c.writeUInt32BE(this._background, _);
                  }
                }
              }if (this.bitmap.data = c, 1 == e || "string" == typeof e) {
                var m = this.bitmap.width / 2 - r / 2,
                    d = this.bitmap.height / 2 - a / 2;this.crop(m, d, r, a);
              }
            }function k(t) {
              return new m(t.bitmap.width, t.bitmap.height, t._background).composite(t, 0, 0).bitmap;
            }function E(t, e) {
              var i = e.map(function (e) {
                return m.read(t + "/" + e);
              });return Y.all(i);
            }function S(t, e, i, n) {
              for (var r = 0; r < n.length; r++) {
                t.chars[n[r]] && (I(this, t, e, i, t.chars[n[r]]), e += (t.kernings[n[r]] && t.kernings[n[r]][n[r + 1]] ? t.kernings[n[r]][n[r + 1]] : 0) + (t.chars[n[r]].xadvance || 0));
              }
            }function I(t, e, i, n, r) {
              if (r.width > 0 && r.height > 0) {
                var a = e.pages[r.page].clone().crop(r.x, r.y, r.width, r.height);return t.composite(a, i + r.xoffset, n + r.yoffset);
              }return t;
            }function M(t, e) {
              for (var i = 0, n = 0; n < e.length; n++) {
                t.chars[e[n]] && (i += t.chars[e[n]].xoffset + (t.kernings[e[n]] && t.kernings[e[n]][e[n + 1]] ? t.kernings[e[n]][e[n + 1]] : 0) + (t.chars[e[n]].xadvance || 0));
              }return i;
            }var A,
                T,
                T,
                R = t("pngjs").PNG,
                L = t("jpeg-js"),
                P = t("bmp-js"),
                C = t("mime"),
                B = t("tinycolor2"),
                z = t("./resize.js"),
                O = t("./resize2.js"),
                D = t("stream-to-buffer"),
                U = t("read-chunk"),
                N = t("file-type"),
                F = t("pixelmatch"),
                j = t("exif-parser"),
                H = t("./phash.js"),
                G = t("bignumber.js"),
                W = t("url-regex"),
                q = t("load-bmfont"),
                Z = t("path"),
                Y = i.Promise || t("es6-promise").Promise,
                X = 0;e.on("exit", f), m.read = function (t, e) {
              return new Y(function (i, r) {
                if (e = e || function (t, e) {
                  t ? r(t) : i(e);
                }, "string" != typeof t && ("object" != (void 0 === t ? "undefined" : _typeof(t)) || !n.isBuffer(t))) return d.call(this, "src must be a string or a Buffer", e);new m(t, e);
              });
            }, m.AUTO = -1, m.MIME_PNG = "image/png", m.MIME_JPEG = "image/jpeg", m.MIME_BMP = "image/bmp", m.PNG_FILTER_AUTO = -1, m.PNG_FILTER_NONE = 0, m.PNG_FILTER_SUB = 1, m.PNG_FILTER_UP = 2, m.PNG_FILTER_AVERAGE = 3, m.PNG_FILTER_PAETH = 4, m.RESIZE_NEAREST_NEIGHBOR = "nearestNeighbor", m.RESIZE_BILINEAR = "bilinearInterpolation", m.RESIZE_BICUBIC = "bicubicInterpolation", m.RESIZE_HERMITE = "hermiteInterpolation", m.RESIZE_BEZIER = "bezierInterpolation", m.HORIZONTAL_ALIGN_LEFT = 1, m.HORIZONTAL_ALIGN_CENTER = 2, m.HORIZONTAL_ALIGN_RIGHT = 4, m.VERTICAL_ALIGN_TOP = 8, m.VERTICAL_ALIGN_MIDDLE = 16, m.VERTICAL_ALIGN_BOTTOM = 32, m.FONT_SANS_8_BLACK = Z.join(l, "fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt"), m.FONT_SANS_16_BLACK = Z.join(l, "fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt"), m.FONT_SANS_32_BLACK = Z.join(l, "fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt"), m.FONT_SANS_64_BLACK = Z.join(l, "fonts/open-sans/open-sans-64-black/open-sans-64-black.fnt"), m.FONT_SANS_128_BLACK = Z.join(l, "fonts/open-sans/open-sans-128-black/open-sans-128-black.fnt"), m.FONT_SANS_8_WHITE = Z.join(l, "fonts/open-sans/open-sans-8-white/open-sans-8-white.fnt"), m.FONT_SANS_16_WHITE = Z.join(l, "fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt"), m.FONT_SANS_32_WHITE = Z.join(l, "fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt"), m.FONT_SANS_64_WHITE = Z.join(l, "fonts/open-sans/open-sans-64-white/open-sans-64-white.fnt"), m.FONT_SANS_128_WHITE = Z.join(l, "fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt"), m.rgbaToInt = function (t, e, i, n, r) {
              if ("number" != typeof t || "number" != typeof e || "number" != typeof i || "number" != typeof n) return d.call(this, "r, g, b and a must be numbers", r);if (t < 0 || t > 255) return d.call(this, "r must be between 0 and 255", r);if ((e < 0 || e > 255) && d.call(this, "g must be between 0 and 255", r), i < 0 || i > 255) return d.call(this, "b must be between 0 and 255", r);if (n < 0 || n > 255) return d.call(this, "a must be between 0 and 255", r);var a = t * Math.pow(256, 3) + e * Math.pow(256, 2) + i * Math.pow(256, 1) + n * Math.pow(256, 0);return p(r) ? r.call(this, null, a) : a;
            }, m.intToRGBA = function (t, e) {
              if ("number" != typeof t) return d.call(this, "i must be a number", e);var i = {};return i.r = Math.floor(t / Math.pow(256, 3)), i.g = Math.floor((t - i.r * Math.pow(256, 3)) / Math.pow(256, 2)), i.b = Math.floor((t - i.r * Math.pow(256, 3) - i.g * Math.pow(256, 2)) / Math.pow(256, 1)), i.a = Math.floor((t - i.r * Math.pow(256, 3) - i.g * Math.pow(256, 2) - i.b * Math.pow(256, 1)) / Math.pow(256, 0)), p(e) ? e.call(this, null, i) : i;
            }, m.limit255 = function (t) {
              return t = Math.max(t, 0), t = Math.min(t, 255);
            }, m.diff = function (t, e, i) {
              if ("object" != (void 0 === t ? "undefined" : _typeof(t)) || t.constructor != m || "object" != (void 0 === e ? "undefined" : _typeof(e)) || e.constructor != m) return d.call(this, "img1 and img2 must be an Jimp images");if (t.bitmap.width != e.bitmap.width || t.bitmap.height != e.bitmap.height) switch (t.bitmap.width * t.bitmap.height > e.bitmap.width * e.bitmap.height) {case !0:
                  t = t.clone().resize(e.bitmap.width, e.bitmap.height);break;default:
                  e = e.clone().resize(t.bitmap.width, t.bitmap.height);}if ("number" != typeof (i = i || .1) || i < 0 || i > 1) return d.call(this, "threshold must be a number between 0 and 1");var n = new m(t.bitmap.width, t.bitmap.height, 4294967295);return { percent: F(t.bitmap.data, e.bitmap.data, n.bitmap.data, n.bitmap.width, n.bitmap.height, { threshold: i }) / (n.bitmap.width * n.bitmap.height), image: n };
            }, m.distance = function (t, e) {
              var i = new H(),
                  n = i.getHash(t),
                  r = i.getHash(e);return i.distance(n, r);
            }, m.prototype.bitmap = { data: null, width: null, height: null }, m.prototype._quality = 100, m.prototype._deflateLevel = 9, m.prototype._deflateStrategy = 3, m.prototype._filterType = m.PNG_FILTER_AUTO, m.prototype._rgba = !0, m.prototype._background = 0, m.prototype._originalMime = m.MIME_PNG, m.prototype.clone = function (t) {
              var e = new m(this);return p(t) ? t.call(e, null, e) : e;
            }, m.prototype.quality = function (t, e) {
              return "number" != typeof t ? d.call(this, "n must be a number", e) : t < 0 || t > 100 ? d.call(this, "n must be a number 0 - 100", e) : (this._quality = Math.round(t), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.deflateLevel = function (t, e) {
              return "number" != typeof t ? d.call(this, "l must be a number", e) : t < 0 || t > 9 ? d.call(this, "l must be a number 0 - 9", e) : (this._deflateLevel = Math.round(t), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.deflateStrategy = function (t, e) {
              return "number" != typeof t ? d.call(this, "s must be a number", e) : t < 0 || t > 3 ? d.call(this, "s must be a number 0 - 3", e) : (this._deflateStrategy = Math.round(t), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.filterType = function (t, e) {
              return "number" != typeof t ? d.call(this, "n must be a number", e) : t < -1 || t > 4 ? d.call(this, "n must be -1 (auto) or a number 0 - 4", e) : (this._filterType = Math.round(t), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.rgba = function (t, e) {
              return "boolean" != typeof t ? d.call(this, "bool must be a boolean, true for RGBA or false for RGB", e) : (this._rgba = t, p(e) ? e.call(this, null, this) : this);
            }, m.prototype.background = function (t, e) {
              return "number" != typeof t ? d.call(this, "hex must be a hexadecimal rgba value", e) : (this._background = t, p(e) ? e.call(this, null, this) : this);
            }, m.prototype.scan = function (t, e, i, n, r, a) {
              if ("number" != typeof t || "number" != typeof e) return d.call(this, "x and y must be numbers", a);if ("number" != typeof i || "number" != typeof n) return d.call(this, "w and h must be numbers", a);if ("function" != typeof r) return d.call(this, "f must be a function", a);t = Math.round(t), e = Math.round(e), i = Math.round(i), n = Math.round(n);for (var o = e; o < e + n; o++) {
                for (var s = t; s < t + i; s++) {
                  var l = this.bitmap.width * o + s << 2;r.call(this, s, o, l);
                }
              }return p(a) ? a.call(this, null, this) : this;
            }, m.prototype.getMIME = function () {
              return this._originalMime || m.MIME_PNG;
            }, m.prototype.getExtension = function () {
              var t = this.getMIME();return C.extension(t);
            }, m.prototype.getPixelIndex = function (t, e, i) {
              if ("number" != typeof t || "number" != typeof e) return d.call(this, "x and y must be numbers", i);t = Math.round(t), e = Math.round(e);var n = this.bitmap.width * e + t << 2;return (t < 0 || t > this.bitmap.width) && (n = -1), (e < 0 || e > this.bitmap.height) && (n = -1), p(i) ? i.call(this, null, n) : n;
            }, m.prototype.getPixelColor = m.prototype.getPixelColour = function (t, e, i) {
              if ("number" != typeof t || "number" != typeof e) return d.call(this, "x and y must be numbers", i);t = Math.round(t), e = Math.round(e);var n = this.getPixelIndex(t, e),
                  r = this.bitmap.data.readUInt32BE(n);return p(i) ? i.call(this, null, r) : r;
            }, m.prototype.setPixelColor = m.prototype.setPixelColour = function (t, e, i, n) {
              if ("number" != typeof t || "number" != typeof e || "number" != typeof i) return d.call(this, "hex, x and y must be numbers", n);e = Math.round(e), i = Math.round(i);var r = this.getPixelIndex(e, i);return this.bitmap.data.writeUInt32BE(t, r, !0), p(n) ? n.call(this, null, this) : this;
            };for (var V = [], J = 0; J < 65; J++) {
              var $ = J > 1 ? new G(Array(65).join("1"), 2).toString(J) : NaN;V.push($.length);
            }m.prototype.hash = function (t, e) {
              if (t = t || 64, "function" == typeof t && (e = t, t = 64), "number" != typeof t) return d.call(this, "base must be a number", e);if (t < 2 || t > 64) return d.call(this, "base must be a number between 2 and 64", e);var i = new H().getHash(this);for (i = new G(i, 2).toString(t); i.length < V[t];) {
                i = "0" + i;
              }return p(e) ? e.call(this, null, i) : i;
            }, m.prototype.crop = function (t, e, i, r, a) {
              if ("number" != typeof t || "number" != typeof e) return d.call(this, "x and y must be numbers", a);if ("number" != typeof i || "number" != typeof r) return d.call(this, "w and h must be numbers", a);t = Math.round(t), e = Math.round(e), i = Math.round(i), r = Math.round(r);var o = new n(this.bitmap.data.length),
                  s = 0;return this.scan(t, e, i, r, function (t, e, i) {
                var n = this.bitmap.data.readUInt32BE(i, !0);o.writeUInt32BE(n, s, !0), s += 4;
              }), this.bitmap.data = new n(o), this.bitmap.width = i, this.bitmap.height = r, p(a) ? a.call(this, null, this) : this;
            }, m.prototype.autocrop = function () {
              for (var t, e = this.bitmap.width, i = this.bitmap.height, n = 2e-4, r = !0, a = 0, o = arguments.length; a < o; a++) {
                "number" == typeof arguments[a] && (n = arguments[a]), "boolean" == typeof arguments[a] && (r = arguments[a]), "function" == typeof arguments[a] && (t = arguments[a]);
              }var s = this.getPixelColor(0, 0),
                  l = 0,
                  h = 0,
                  f = 0,
                  c = 0,
                  u = m.intToRGBA(s);t: for (var d = 0; d < i - 1; d++) {
                for (var g = 0; g < e; g++) {
                  var b = this.getPixelColor(g, d),
                      v = m.intToRGBA(b),
                      w = Math.abs(Math.max(u.r - v.r ^ 2, u.r - v.r - u.a + v.a ^ 2) + Math.max(u.g - v.g ^ 2, u.g - v.g - u.a + v.a ^ 2) + Math.max(u.b - v.b ^ 2, u.b - v.b - u.a + v.a ^ 2)) / 196608;if (w > n) break t;
                }l++;
              }t: for (var g = 0; g < e - 1; g++) {
                for (var d = 0 + l; d < i; d++) {
                  var b = this.getPixelColor(g, d),
                      v = m.intToRGBA(b),
                      w = Math.abs(Math.max(u.r - v.r ^ 2, u.r - v.r - u.a + v.a ^ 2) + Math.max(u.g - v.g ^ 2, u.g - v.g - u.a + v.a ^ 2) + Math.max(u.b - v.b ^ 2, u.b - v.b - u.a + v.a ^ 2)) / 196608;if (w > n) break t;
                }h++;
              }s = this.getPixelColor(e - 1, i - 1);t: for (var d = i - 1; d >= 0 + l + 1; d--) {
                for (var g = e - h - 1; g >= 0; g--) {
                  var b = this.getPixelColor(g, d),
                      v = m.intToRGBA(b),
                      w = Math.abs(Math.max(u.r - v.r ^ 2, u.r - v.r - u.a + v.a ^ 2) + Math.max(u.g - v.g ^ 2, u.g - v.g - u.a + v.a ^ 2) + Math.max(u.b - v.b ^ 2, u.b - v.b - u.a + v.a ^ 2)) / 196608;if (w > n) break t;
                }f++;
              }t: for (var g = e - 1; g >= 0 + h + 1; g--) {
                for (var d = i - 1; d >= 0 + l; d--) {
                  var b = this.getPixelColor(g, d),
                      v = m.intToRGBA(b),
                      w = Math.abs(Math.max(u.r - v.r ^ 2, u.r - v.r - u.a + v.a ^ 2) + Math.max(u.g - v.g ^ 2, u.g - v.g - u.a + v.a ^ 2) + Math.max(u.b - v.b ^ 2, u.b - v.b - u.a + v.a ^ 2)) / 196608;if (w > n) break t;
                }c++;
              }var _ = e - (c + h),
                  y = i - (f + l),
                  x = !1;return x = r ? 0 !== h && 0 !== l && 0 !== c && 0 !== f : 0 !== h || 0 !== l || 0 !== c || 0 !== f, x && this.crop(h, l, _, y), p(t) ? t.call(this, null, this) : this;
            }, m.prototype.blit = function (t, e, i, n, r, a, o, s) {
              if ("object" != (void 0 === t ? "undefined" : _typeof(t)) || t.constructor != m) return d.call(this, "The source must be a Jimp image", s);if ("number" != typeof e || "number" != typeof i) return d.call(this, "x and y must be numbers", s);if ("function" == typeof n) s = n, n = 0, r = 0, a = t.bitmap.width, o = t.bitmap.height;else {
                if ((void 0 === n ? "undefined" : _typeof(n)) != (void 0 === r ? "undefined" : _typeof(r)) || (void 0 === r ? "undefined" : _typeof(r)) != (void 0 === a ? "undefined" : _typeof(a)) || (void 0 === a ? "undefined" : _typeof(a)) != (void 0 === o ? "undefined" : _typeof(o))) return d.call(this, "srcx, srcy, srcw, srch must be numbers", s);n = n || 0, r = r || 0, a = a || t.bitmap.width, o = o || t.bitmap.height;
              }e = Math.round(e), i = Math.round(i), n = Math.round(n), r = Math.round(r), a = Math.round(a), o = Math.round(o);var l = this;return t.scan(n, r, a, o, function (t, a, o) {
                var s = l.getPixelIndex(e + t - n, i + a - r);l.bitmap.data[s] = this.bitmap.data[o], l.bitmap.data[s + 1] = this.bitmap.data[o + 1], l.bitmap.data[s + 2] = this.bitmap.data[o + 2], l.bitmap.data[s + 3] = this.bitmap.data[o + 3];
              }), p(s) ? s.call(this, null, this) : this;
            }, m.prototype.mask = function (t, e, i, n) {
              if ("object" != (void 0 === t ? "undefined" : _typeof(t)) || t.constructor != m) return d.call(this, "The source must be a Jimp image", n);if ("number" != typeof e || "number" != typeof i) return d.call(this, "x and y must be numbers", n);e = Math.round(e), i = Math.round(i);var r = this;return t.scan(0, 0, t.bitmap.width, t.bitmap.height, function (t, n, a) {
                var o = r.getPixelIndex(e + t, i + n),
                    s = (this.bitmap.data[a + 0] + this.bitmap.data[a + 1] + this.bitmap.data[a + 2]) / 3;r.bitmap.data[o + 3] *= s / 255;
              }), p(n) ? n.call(this, null, this) : this;
            }, m.prototype.composite = function (t, e, i, n) {
              if ("object" != (void 0 === t ? "undefined" : _typeof(t)) || t.constructor != m) return d.call(this, "The source must be a Jimp image", n);if ("number" != typeof e || "number" != typeof i) return d.call(this, "x and y must be numbers", n);e = Math.round(e), i = Math.round(i);var r = this;return t.scan(0, 0, t.bitmap.width, t.bitmap.height, function (t, n, a) {
                var o = r.getPixelIndex(e + t, i + n),
                    s = { r: this.bitmap.data[a + 0] / 255, g: this.bitmap.data[a + 1] / 255, b: this.bitmap.data[a + 2] / 255, a: this.bitmap.data[a + 3] / 255 },
                    l = { r: r.bitmap.data[o + 0] / 255, g: r.bitmap.data[o + 1] / 255, b: r.bitmap.data[o + 2] / 255, a: r.bitmap.data[o + 3] / 255 },
                    h = l.a + s.a - l.a * s.a,
                    f = (s.r * s.a + l.r * l.a * (1 - s.a)) / h,
                    c = (s.g * s.a + l.g * l.a * (1 - s.a)) / h,
                    u = (s.b * s.a + l.b * l.a * (1 - s.a)) / h;r.bitmap.data[o + 0] = m.limit255(255 * f), r.bitmap.data[o + 1] = m.limit255(255 * c), r.bitmap.data[o + 2] = m.limit255(255 * u), r.bitmap.data[o + 3] = m.limit255(255 * h);
              }), p(n) ? n.call(this, null, this) : this;
            }, m.prototype.brightness = function (t, e) {
              return "number" != typeof t ? d.call(this, "val must be numbers", e) : t < -1 || t > 1 ? d.call(this, "val must be a number between -1 and +1", e) : (this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (e, i, n) {
                t < 0 ? (this.bitmap.data[n] = this.bitmap.data[n] * (1 + t), this.bitmap.data[n + 1] = this.bitmap.data[n + 1] * (1 + t), this.bitmap.data[n + 2] = this.bitmap.data[n + 2] * (1 + t)) : (this.bitmap.data[n] = this.bitmap.data[n] + (255 - this.bitmap.data[n]) * t, this.bitmap.data[n + 1] = this.bitmap.data[n + 1] + (255 - this.bitmap.data[n + 1]) * t, this.bitmap.data[n + 2] = this.bitmap.data[n + 2] + (255 - this.bitmap.data[n + 2]) * t);
              }), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.contrast = function (t, e) {
              function i(e) {
                if (t < 0) {
                  var i = e > 127 ? 1 - e / 255 : e / 255;return i < 0 && (i = 0), i = .5 * Math.pow(2 * i, 1 + t), e > 127 ? 255 * (1 - i) : 255 * i;
                }var i = e > 127 ? 1 - e / 255 : e / 255;return i < 0 && (i = 0), i = .5 * Math.pow(2 * i, 1 == t ? 127 : 1 / (1 - t)), e > 127 ? 255 * (1 - i) : 255 * i;
              }return "number" != typeof t ? d.call(this, "val must be numbers", e) : t < -1 || t > 1 ? d.call(this, "val must be a number between -1 and +1", e) : (this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, e, n) {
                this.bitmap.data[n] = i(this.bitmap.data[n]), this.bitmap.data[n + 1] = i(this.bitmap.data[n + 1]), this.bitmap.data[n + 2] = i(this.bitmap.data[n + 2]);
              }), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.posterize = function (t, e) {
              return "number" != typeof t ? d.call(this, "n must be numbers", e) : (t < 2 && (t = 2), this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (e, i, n) {
                this.bitmap.data[n] = Math.floor(this.bitmap.data[n] / 255 * (t - 1)) / (t - 1) * 255, this.bitmap.data[n + 1] = Math.floor(this.bitmap.data[n + 1] / 255 * (t - 1)) / (t - 1) * 255, this.bitmap.data[n + 2] = Math.floor(this.bitmap.data[n + 2] / 255 * (t - 1)) / (t - 1) * 255;
              }), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.normalize = function (t) {
              var e = _.call(this),
                  i = function i(t, e, _i) {
                return 255 * (t - e) / (_i - e);
              },
                  n = function n(t) {
                return [t.findIndex(function (t) {
                  return t > 0;
                }), 255 - t.slice().reverse().findIndex(function (t) {
                  return t > 0;
                })];
              },
                  r = { r: n(e.r), g: n(e.g), b: n(e.b) };return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, e, n) {
                var a = this.bitmap.data[n + 0],
                    o = this.bitmap.data[n + 1],
                    s = this.bitmap.data[n + 2];this.bitmap.data[n + 0] = i(a, r.r[0], r.r[1]), this.bitmap.data[n + 1] = i(o, r.g[0], r.g[1]), this.bitmap.data[n + 2] = i(s, r.b[0], r.b[1]);
              }), p(t) ? t.call(this, null, this) : this;
            }, m.prototype.invert = function (t) {
              return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, e, i) {
                this.bitmap.data[i] = 255 - this.bitmap.data[i], this.bitmap.data[i + 1] = 255 - this.bitmap.data[i + 1], this.bitmap.data[i + 2] = 255 - this.bitmap.data[i + 2];
              }), p(t) ? t.call(this, null, this) : this;
            }, m.prototype.mirror = m.prototype.flip = function (t, e, i) {
              if ("boolean" != typeof t || "boolean" != typeof e) return d.call(this, "horizontal and vertical must be Booleans", i);var r = new n(this.bitmap.data.length);return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (i, n, a) {
                var o = t ? this.bitmap.width - 1 - i : i,
                    s = e ? this.bitmap.height - 1 - n : n,
                    l = this.bitmap.width * s + o << 2,
                    h = this.bitmap.data.readUInt32BE(a, !0);r.writeUInt32BE(h, l, !0);
              }), this.bitmap.data = new n(r), p(i) ? i.call(this, null, this) : this;
            }, m.prototype.gaussian = function (t, e) {
              if ("number" != typeof t) return d.call(this, "r must be a number", e);if (t < 1) return d.call(this, "r must be greater than 0", e);for (var i = Math.ceil(2.57 * t), n = 0; n < this.bitmap.height; n++) {
                h("Gaussian: " + Math.round(n / this.bitmap.height * 100) + "%");for (var r = 0; r < this.bitmap.width; r++) {
                  for (var a = 0, o = 0, s = 0, l = 0, c = 0, u = n - i; u < n + i + 1; u++) {
                    for (var m = r - i; m < r + i + 1; m++) {
                      var g = Math.min(this.bitmap.width - 1, Math.max(0, m)),
                          b = Math.min(this.bitmap.height - 1, Math.max(0, u)),
                          v = (m - r) * (m - r) + (u - n) * (u - n),
                          w = Math.exp(-v / (2 * t * t)) / (2 * Math.PI * t * t),
                          _ = b * this.bitmap.width + g << 2;a += this.bitmap.data[_] * w, o += this.bitmap.data[_ + 1] * w, s += this.bitmap.data[_ + 2] * w, l += this.bitmap.data[_ + 3] * w, c += w;
                    }var _ = n * this.bitmap.width + r << 2;this.bitmap.data[_] = Math.round(a / c), this.bitmap.data[_ + 1] = Math.round(o / c), this.bitmap.data[_ + 2] = Math.round(s / c), this.bitmap.data[_ + 3] = Math.round(l / c);
                  }
                }
              }return f(), p(e) ? e.call(this, null, this) : this;
            };var K = [1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39, 137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81, 151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153, 73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177, 171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231, 224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79, 155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115, 113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175, 43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67, 33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213, 105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43, 85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145, 143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61, 121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179, 178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5, 79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137, 17, 135, 134, 133, 66, 131, 65, 129, 1],
                Q = [0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17, 17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20, 20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22, 21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22, 21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23, 21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24, 24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24, 20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24, 24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25, 25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18];m.prototype.blur = function (t, e) {
              if ("number" != typeof t) return d.call(this, "r must be a number", e);if (t < 1) return d.call(this, "r must be greater than 0", e);for (var i, n, r, a, o, s, l, h, f, c, u, m, g, b, v = this.bitmap.width - 1, w = this.bitmap.height - 1, _ = (this.bitmap.width, this.bitmap.height, t + 1), y = K[t], x = Q[t], k = [], E = [], S = [], I = [], M = [], A = [], T = 2; T-- > 0;) {
                for (g = m = 0, s = 0; s < this.bitmap.height; s++) {
                  for (i = this.bitmap.data[g] * _, n = this.bitmap.data[g + 1] * _, r = this.bitmap.data[g + 2] * _, a = this.bitmap.data[g + 3] * _, l = 1; l <= t; l++) {
                    h = g + ((l > v ? v : l) << 2), i += this.bitmap.data[h++], n += this.bitmap.data[h++], r += this.bitmap.data[h++], a += this.bitmap.data[h];
                  }for (o = 0; o < this.bitmap.width; o++) {
                    k[m] = i, E[m] = n, S[m] = r, I[m] = a, 0 == s && (M[o] = ((h = o + _) < v ? h : v) << 2, A[o] = (h = o - t) > 0 ? h << 2 : 0), f = g + M[o], c = g + A[o], i += this.bitmap.data[f++] - this.bitmap.data[c++], n += this.bitmap.data[f++] - this.bitmap.data[c++], r += this.bitmap.data[f++] - this.bitmap.data[c++], a += this.bitmap.data[f] - this.bitmap.data[c], m++;
                  }g += this.bitmap.width << 2;
                }for (o = 0; o < this.bitmap.width; o++) {
                  for (u = o, i = k[u] * _, n = E[u] * _, r = S[u] * _, a = I[u] * _, l = 1; l <= t; l++) {
                    u += l > w ? 0 : this.bitmap.width, i += k[u], n += E[u], r += S[u], a += I[u];
                  }for (m = o << 2, s = 0; s < this.bitmap.height; s++) {
                    this.bitmap.data[m + 3] = b = a * y >>> x, b > 255 && (this.bitmap.data[m + 3] = 255), b > 0 ? (b = 255 / b, this.bitmap.data[m] = (i * y >>> x) * b, this.bitmap.data[m + 1] = (n * y >>> x) * b, this.bitmap.data[m + 2] = (r * y >>> x) * b) : this.bitmap.data[m] = this.bitmap.data[m + 1] = this.bitmap.data[m + 2] = 0, 0 == o && (M[s] = ((h = s + _) < w ? h : w) * this.bitmap.width, A[s] = (h = s - t) > 0 ? h * this.bitmap.width : 0), f = o + M[s], c = o + A[s], i += k[f] - k[c], n += E[f] - E[c], r += S[f] - S[c], a += I[f] - I[c], m += this.bitmap.width << 2;
                  }
                }
              }return p(e) ? e.call(this, null, this) : this;
            }, m.prototype.greyscale = function (t) {
              return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, e, i) {
                var n = parseInt(.2126 * this.bitmap.data[i] + .7152 * this.bitmap.data[i + 1] + .0722 * this.bitmap.data[i + 2], 10);this.bitmap.data[i] = n, this.bitmap.data[i + 1] = n, this.bitmap.data[i + 2] = n;
              }), p(t) ? t.call(this, null, this) : this;
            }, m.prototype.grayscale = m.prototype.greyscale, m.prototype.sepia = function (t) {
              return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, e, i) {
                var n = this.bitmap.data[i],
                    r = this.bitmap.data[i + 1],
                    a = this.bitmap.data[i + 2];n = .393 * n + .769 * r + .189 * a, r = .349 * n + .686 * r + .168 * a, a = .272 * n + .534 * r + .131 * a, this.bitmap.data[i] = n < 255 ? n : 255, this.bitmap.data[i + 1] = r < 255 ? r : 255, this.bitmap.data[i + 2] = a < 255 ? a : 255;
              }), p(t) ? t.call(this, null, this) : this;
            }, m.prototype.opacity = function (t, e) {
              return "number" != typeof t ? d.call(this, "f must be a number", e) : t < 0 || t > 1 ? d.call(this, "f must be a number from 0 to 1", e) : (this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (e, i, n) {
                var r = this.bitmap.data[n + 3] * t;this.bitmap.data[n + 3] = r;
              }), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.fade = function (t, e) {
              return "number" != typeof t ? d.call(this, "f must be a number", e) : t < 0 || t > 1 ? d.call(this, "f must be a number from 0 to 1", e) : (this.opacity(1 - t), p(e) ? e.call(this, null, this) : this);
            }, m.prototype.opaque = function (t) {
              return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, e, i) {
                this.bitmap.data[i + 3] = 255;
              }), p(t) ? t.call(this, null, this) : this;
            }, m.prototype.resize = function (t, e, i, r) {
              if ("number" != typeof t || "number" != typeof e) return d.call(this, "w and h must be numbers", r);if ("function" == typeof i && void 0 === r && (r = i, i = null), t == m.AUTO && e == m.AUTO) return d.call(this, "w and h cannot both the set to auto", r);if (t == m.AUTO && (t = this.bitmap.width * (e / this.bitmap.height)), e == m.AUTO && (e = this.bitmap.height * (t / this.bitmap.width)), t = Math.round(t), e = Math.round(e), "function" == typeof O[i]) {
                var a = { data: new n(t * e * 4), width: t, height: e };O[i](this.bitmap, a), this.bitmap = a;
              } else {
                var o = this;new z(this.bitmap.width, this.bitmap.height, t, e, !0, !0, function (i) {
                  o.bitmap.data = new n(i), o.bitmap.width = t, o.bitmap.height = e;
                }).resize(this.bitmap.data);
              }return p(r) ? r.call(this, null, this) : this;
            }, m.prototype.cover = function (t, e, i, n, r) {
              if ("number" != typeof t || "number" != typeof e) return d.call(this, "w and h must be numbers", r);i && "function" == typeof i && void 0 === r ? (r = i, i = null, n = null) : "function" == typeof n && void 0 === r && (r = n, n = null), i = i || m.HORIZONTAL_ALIGN_CENTER | m.VERTICAL_ALIGN_MIDDLE;var a = 7 & i,
                  o = i >> 3;if ((0 == a || a & a - 1) && (0 == o || o & o - 1)) return d.call(this, "only use one flag per alignment direction", r);var s = a >> 1,
                  l = o >> 1,
                  h = t / e > this.bitmap.width / this.bitmap.height ? t / this.bitmap.width : e / this.bitmap.height;return this.scale(h, n), this.crop((this.bitmap.width - t) / 2 * s, (this.bitmap.height - e) / 2 * l, t, e), p(r) ? r.call(this, null, this) : this;
            }, m.prototype.contain = function (t, e, i, n, r) {
              if ("number" != typeof t || "number" != typeof e) return d.call(this, "w and h must be numbers", r);switch (void 0 === i ? "undefined" : _typeof(i)) {case "string":
                  "function" == typeof n && void 0 === r && (r = n), n = i, i = null;case "function":
                  void 0 === r && (r = i), n = null, i = null;default:
                  "function" == typeof n && void 0 === r && (r = n, n = null);}i = i || m.HORIZONTAL_ALIGN_CENTER | m.VERTICAL_ALIGN_MIDDLE;var a = 7 & i,
                  o = i >> 3;if ((0 == a || a & a - 1) && (0 == o || o & o - 1)) return d.call(this, "only use one flag per alignment direction", r);var s = a >> 1,
                  l = o >> 1,
                  h = t / e > this.bitmap.width / this.bitmap.height ? e / this.bitmap.height : t / this.bitmap.width,
                  f = this.clone().scale(h, n);return this.resize(t, e, n), this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, e, i) {
                this.bitmap.data.writeUInt32BE(this._background, i);
              }), this.blit(f, (this.bitmap.width - f.bitmap.width) / 2 * s, (this.bitmap.height - f.bitmap.height) / 2 * l), p(r) ? r.call(this, null, this) : this;
            }, m.prototype.scale = function (t, e, i) {
              if ("number" != typeof t) return d.call(this, "f must be a number", i);if (t < 0) return d.call(this, "f must be a positive number", i);"function" == typeof e && void 0 === i && (i = e, e = null);var n = this.bitmap.width * t,
                  r = this.bitmap.height * t;return this.resize(n, r, e), p(i) ? i.call(this, null, this) : this;
            }, m.prototype.scaleToFit = function (t, e, i, n) {
              if ("number" != typeof t || "number" != typeof e) return d.call(this, "w and h must be numbers", n);"function" == typeof i && void 0 === n && (n = i, i = null);var r = t / e > this.bitmap.width / this.bitmap.height ? e / this.bitmap.height : t / this.bitmap.width;return this.scale(r, i), p(n) ? n.call(this, null, this) : this;
            }, m.prototype.rotate = function (t, e, i) {
              return void 0 !== e && null !== e || (e = !0), "function" == typeof e && void 0 === i && (i = e, e = !0), "number" != typeof t ? d.call(this, "deg must be a number", i) : "boolean" != typeof e && "string" != typeof e ? d.call(this, "mode must be a boolean or a string", i) : (t % 90 == 0 && e !== !1 ? y.call(this, t, i) : x.call(this, t, e, i), p(i) ? i.call(this, null, this) : this);
            }, m.prototype.getBuffer = function (t, e) {
              if (t == m.AUTO && (t = this.getMIME()), "string" != typeof t) return d.call(this, "mime must be a string", e);if ("function" != typeof e) return d.call(this, "cb must be a function", e);switch (t.toLowerCase()) {case m.MIME_PNG:
                  var i = this,
                      r = new R({ width: this.bitmap.width, height: this.bitmap.height, bitDepth: 8, deflateLevel: this._deflateLevel, deflateStrategy: this._deflateStrategy, filterType: this._filterType, colorType: this._rgba ? 6 : 2, inputHasAlpha: !0 });this._rgba ? r.data = new n(this.bitmap.data) : r.data = k(this).data, D(r.pack(), function (t, n) {
                    return e.call(i, null, n);
                  });break;case m.MIME_JPEG:
                  var a = L.encode(k(this), this._quality);return e.call(this, null, a.data);case m.MIME_BMP:
                  var o = P.encode(k(this));return e.call(this, null, o.data);default:
                  return e.call(this, "Unsupported MIME type: " + t);}return this;
            }, m.prototype.getBase64 = function (t, e) {
              return t == m.AUTO && (t = this.getMIME()), "string" != typeof t ? d.call(this, "mime must be a string", e) : "function" != typeof e ? d.call(this, "cb must be a function", e) : (this.getBuffer(t, function (i, n) {
                var r = "data:" + t + ";base64," + n.toString("base64");return e.call(this, null, r);
              }), this);
            }, m.prototype.dither565 = function (t) {
              var e = [1, 9, 3, 11, 13, 5, 15, 7, 4, 12, 2, 10, 16, 8, 14, 6];return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (t, i, n) {
                var r = ((3 & i) << 2) + t % 4,
                    a = e[r];this.bitmap.data[n] = Math.min(this.bitmap.data[n] + a, 255), this.bitmap.data[n + 1] = Math.min(this.bitmap.data[n + 1] + a, 255), this.bitmap.data[n + 2] = Math.min(this.bitmap.data[n + 2] + a, 255);
              }), p(t) ? t.call(this, null, this) : this;
            }, m.prototype.dither16 = m.prototype.dither565, m.prototype.color = m.prototype.colour = function (t, e) {
              if (!t || !Array.isArray(t)) return d.call(this, "actions must be an array", e);var i = this;return this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (n, r, a) {
                var o = B({ r: this.bitmap.data[a], g: this.bitmap.data[a + 1], b: this.bitmap.data[a + 2] }),
                    s = function s(t, e) {
                  return c = o.toRgb(), c[t] = Math.max(0, Math.min(c[t] + e, 255)), B(c);
                };t.forEach(function (t) {
                  if ("mix" === t.apply) o = B.mix(o, t.params[0], t.params[1]);else if ("tint" === t.apply) o = B.mix(o, "white", t.params[0]);else if ("shade" === t.apply) o = B.mix(o, "black", t.params[0]);else if ("xor" === t.apply) {
                    var n = B(t.params[0]).toRgb();o = o.toRgb(), o = B({ r: o.r ^ n.r, g: o.g ^ n.g, b: o.b ^ n.b });
                  } else if ("red" === t.apply) o = s("r", t.params[0]);else if ("green" === t.apply) o = s("g", t.params[0]);else if ("blue" === t.apply) o = s("b", t.params[0]);else {
                    "hue" === t.apply && (t.apply = "spin");var r = o[t.apply];if (!r) return d.call(i, "action " + t.apply + " not supported", e);o = r.apply(o, t.params);
                  }
                }), o = o.toRgb(), this.bitmap.data[a] = o.r, this.bitmap.data[a + 1] = o.g, this.bitmap.data[a + 2] = o.b;
              }), p(e) ? e.call(this, null, this) : this;
            }, m.loadFont = function (t, e) {
              if ("string" != typeof t) return d.call(this, "file must be a string", e);var i = this;return new Y(function (n, r) {
                e = e || function (t, e) {
                  t ? r(t) : n(e);
                }, q(t, function (n, r) {
                  var a = {},
                      o = {};if (n) return d.call(i, n, e);for (var s = 0; s < r.chars.length; s++) {
                    a[String.fromCharCode(r.chars[s].id)] = r.chars[s];
                  }for (var s = 0; s < r.kernings.length; s++) {
                    var l = String.fromCharCode(r.kernings[s].first);o[l] = o[l] || {}, o[l][String.fromCharCode(r.kernings[s].second)] = r.kernings[s].amount;
                  }E(Z.dirname(t), r.pages).then(function (t) {
                    e(null, { chars: a, kernings: o, pages: t, common: r.common, info: r.info });
                  });
                });
              });
            }, m.prototype.print = function (t, e, i, n, r, a) {
              if ("function" == typeof r && void 0 === a && (a = r, r = 1 / 0), void 0 === r && (r = 1 / 0), "object" != (void 0 === t ? "undefined" : _typeof(t))) return d.call(this, "font must be a Jimp loadFont", a);if ("number" != typeof e || "number" != typeof i || "number" != typeof r) return d.call(this, "x, y and maxWidth must be numbers", a);if ("string" != typeof n) return d.call(this, "text must be a string", a);if ("number" != typeof r) return d.call(this, "maxWidth must be a number", a);for (var o = this, s = n.split(" "), l = "", h = 0; h < s.length; h++) {
                var f = l + s[h] + " ";M(t, f) > r && h > 0 ? (o = o.print(t, e, i, l), l = s[h] + " ", i += t.common.lineHeight) : l = f;
              }return S.call(this, t, e, i, l), p(a) ? a.call(this, null, o) : o;
            }, m.prototype.write = function (t, e) {
              if ("string" != typeof t) return d.call(this, "path must be a string", e);if (void 0 === e && (e = function e() {}), "function" != typeof e) return d.call(this, "cb must be a function", e);var i = this,
                  n = C.lookup(t);return this.getBuffer(n, function (n, r) {
                if (n) return d.call(i, n, e);var a = A.createWriteStream(t);a.on("open", function (t) {
                  a.write(r), a.end();
                }).on("error", function (t) {
                  return d.call(i, t, e);
                }), a.on("finish", function (t) {
                  return e.call(i, null, i);
                });
              }), this;
            };var tt;"object" == (void 0 === window ? "undefined" : _typeof(window)) && (tt = window), "object" == ("undefined" == typeof self ? "undefined" : _typeof(self)) && (tt = self), tt.Jimp = m, tt.Buffer = n;
          }).call(this, t("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : void 0 !== window ? window : {}, t("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/..");
        }, { "./phash.js": 107, "./resize.js": 108, "./resize2.js": 109, _process: 12, "bignumber.js": 4, "bmp-js": 5, buffer: 14, "es6-promise": 16, "exif-parser": 18, "file-type": 27, "jpeg-js": 36, "load-bmfont": 39, mime: 41, path: 59, pixelmatch: 60, pngjs: 80, "read-chunk": 83, "stream-to-buffer": 95, tinycolor2: 98, "url-regex": 100 }], 2: [function (t, e, i) {
          function n(t, e) {
            return p.isUndefined(e) ? "" + e : p.isNumber(e) && !isFinite(e) ? e.toString() : p.isFunction(e) || p.isRegExp(e) ? e.toString() : e;
          }function r(t, e) {
            return p.isString(t) ? t.length < e ? t : t.slice(0, e) : t;
          }function a(t) {
            return r(JSON.stringify(t.actual, n), 128) + " " + t.operator + " " + r(JSON.stringify(t.expected, n), 128);
          }function o(t, e, i, n, r) {
            throw new g.AssertionError({ message: i, actual: t, expected: e, operator: n, stackStartFunction: r });
          }function s(t, e) {
            t || o(t, !0, e, "==", g.ok);
          }function l(t, e) {
            if (t === e) return !0;if (p.isBuffer(t) && p.isBuffer(e)) {
              if (t.length != e.length) return !1;for (var i = 0; i < t.length; i++) {
                if (t[i] !== e[i]) return !1;
              }return !0;
            }return p.isDate(t) && p.isDate(e) ? t.getTime() === e.getTime() : p.isRegExp(t) && p.isRegExp(e) ? t.source === e.source && t.global === e.global && t.multiline === e.multiline && t.lastIndex === e.lastIndex && t.ignoreCase === e.ignoreCase : p.isObject(t) || p.isObject(e) ? f(t, e) : t == e;
          }function h(t) {
            return "[object Arguments]" == Object.prototype.toString.call(t);
          }function f(t, e) {
            if (p.isNullOrUndefined(t) || p.isNullOrUndefined(e)) return !1;if (t.prototype !== e.prototype) return !1;if (p.isPrimitive(t) || p.isPrimitive(e)) return t === e;var i = h(t),
                n = h(e);if (i && !n || !i && n) return !1;if (i) return t = d.call(t), e = d.call(e), l(t, e);var r,
                a,
                o = b(t),
                s = b(e);if (o.length != s.length) return !1;for (o.sort(), s.sort(), a = o.length - 1; a >= 0; a--) {
              if (o[a] != s[a]) return !1;
            }for (a = o.length - 1; a >= 0; a--) {
              if (r = o[a], !l(t[r], e[r])) return !1;
            }return !0;
          }function c(t, e) {
            return !(!t || !e) && ("[object RegExp]" == Object.prototype.toString.call(e) ? e.test(t) : t instanceof e || e.call({}, t) === !0);
          }function u(t, e, i, n) {
            var r;p.isString(i) && (n = i, i = null);try {
              e();
            } catch (t) {
              r = t;
            }if (n = (i && i.name ? " (" + i.name + ")." : ".") + (n ? " " + n : "."), t && !r && o(r, i, "Missing expected exception" + n), !t && c(r, i) && o(r, i, "Got unwanted exception" + n), t && r && i && !c(r, i) || !t && r) throw r;
          }var p = t("util/"),
              d = Array.prototype.slice,
              m = Object.prototype.hasOwnProperty,
              g = e.exports = s;g.AssertionError = function (t) {
            this.name = "AssertionError", this.actual = t.actual, this.expected = t.expected, this.operator = t.operator, t.message ? (this.message = t.message, this.generatedMessage = !1) : (this.message = a(this), this.generatedMessage = !0);var e = t.stackStartFunction || o;if (Error.captureStackTrace) Error.captureStackTrace(this, e);else {
              var i = new Error();if (i.stack) {
                var n = i.stack,
                    r = e.name,
                    s = n.indexOf("\n" + r);if (s >= 0) {
                  var l = n.indexOf("\n", s + 1);n = n.substring(l + 1);
                }this.stack = n;
              }
            }
          }, p.inherits(g.AssertionError, Error), g.fail = o, g.ok = s, g.equal = function (t, e, i) {
            t != e && o(t, e, i, "==", g.equal);
          }, g.notEqual = function (t, e, i) {
            t == e && o(t, e, i, "!=", g.notEqual);
          }, g.deepEqual = function (t, e, i) {
            l(t, e) || o(t, e, i, "deepEqual", g.deepEqual);
          }, g.notDeepEqual = function (t, e, i) {
            l(t, e) && o(t, e, i, "notDeepEqual", g.notDeepEqual);
          }, g.strictEqual = function (t, e, i) {
            t !== e && o(t, e, i, "===", g.strictEqual);
          }, g.notStrictEqual = function (t, e, i) {
            t === e && o(t, e, i, "!==", g.notStrictEqual);
          }, g.throws = function (t, e, i) {
            u.apply(this, [!0].concat(d.call(arguments)));
          }, g.doesNotThrow = function (t, e) {
            u.apply(this, [!1].concat(d.call(arguments)));
          }, g.ifError = function (t) {
            if (t) throw t;
          };var b = Object.keys || function (t) {
            var e = [];for (var i in t) {
              m.call(t, i) && e.push(i);
            }return e;
          };
        }, { "util/": 103 }], 3: [function (t, e, i) {
          "use strict";
          function n(t) {
            var e,
                i,
                n,
                r,
                a,
                o,
                s = t.length;if (s % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");a = "=" === t[s - 2] ? 2 : "=" === t[s - 1] ? 1 : 0, o = new h(3 * s / 4 - a), n = a > 0 ? s - 4 : s;var f = 0;for (e = 0, i = 0; e < n; e += 4, i += 3) {
              r = l[t.charCodeAt(e)] << 18 | l[t.charCodeAt(e + 1)] << 12 | l[t.charCodeAt(e + 2)] << 6 | l[t.charCodeAt(e + 3)], o[f++] = r >> 16 & 255, o[f++] = r >> 8 & 255, o[f++] = 255 & r;
            }return 2 === a ? (r = l[t.charCodeAt(e)] << 2 | l[t.charCodeAt(e + 1)] >> 4, o[f++] = 255 & r) : 1 === a && (r = l[t.charCodeAt(e)] << 10 | l[t.charCodeAt(e + 1)] << 4 | l[t.charCodeAt(e + 2)] >> 2, o[f++] = r >> 8 & 255, o[f++] = 255 & r), o;
          }function r(t) {
            return s[t >> 18 & 63] + s[t >> 12 & 63] + s[t >> 6 & 63] + s[63 & t];
          }function a(t, e, i) {
            for (var n, a = [], o = e; o < i; o += 3) {
              n = (t[o] << 16) + (t[o + 1] << 8) + t[o + 2], a.push(r(n));
            }return a.join("");
          }function o(t) {
            for (var e, i = t.length, n = i % 3, r = "", o = [], l = 0, h = i - n; l < h; l += 16383) {
              o.push(a(t, l, l + 16383 > h ? h : l + 16383));
            }return 1 === n ? (e = t[i - 1], r += s[e >> 2], r += s[e << 4 & 63], r += "==") : 2 === n && (e = (t[i - 2] << 8) + t[i - 1], r += s[e >> 10], r += s[e >> 4 & 63], r += s[e << 2 & 63], r += "="), o.push(r), o.join("");
          }i.toByteArray = n, i.fromByteArray = o;var s = [],
              l = [],
              h = "undefined" != typeof Uint8Array ? Uint8Array : Array;!function () {
            for (var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", e = 0, i = t.length; e < i; ++e) {
              s[e] = t[e], l[t.charCodeAt(e)] = e;
            }l["-".charCodeAt(0)] = 62, l["_".charCodeAt(0)] = 63;
          }();
        }, {}], 4: [function (t, e, i) {
          !function (i) {
            "use strict";
            function n(t) {
              function e(t, n) {
                var r,
                    a,
                    o,
                    s,
                    l,
                    h,
                    f = this;if (!(f instanceof e)) return W && P(26, "constructor call without new", t), new e(t, n);if (null != n && q(n, 2, 64, z, "base")) {
                  if (n |= 0, h = t + "", 10 == n) return f = new e(t instanceof e ? t : h), C(f, U + f.e + 1, N);if ((s = "number" == typeof t) && 0 * t != 0 || !new RegExp("^-?" + (r = "[" + x.slice(0, n) + "]+") + "(?:\\." + r + ")?$", n < 37 ? "i" : "").test(h)) return m(f, h, s, n);s ? (f.s = 1 / t < 0 ? (h = h.slice(1), -1) : 1, W && h.replace(/^0\.0*|\./, "").length > 15 && P(z, y, t), s = !1) : f.s = 45 === h.charCodeAt(0) ? (h = h.slice(1), -1) : 1, h = i(h, 10, n, f.s);
                } else {
                  if (t instanceof e) return f.s = t.s, f.e = t.e, f.c = (t = t.c) ? t.slice() : t, void (z = 0);if ((s = "number" == typeof t) && 0 * t == 0) {
                    if (f.s = 1 / t < 0 ? (t = -t, -1) : 1, t === ~~t) {
                      for (a = 0, o = t; o >= 10; o /= 10, a++) {}return f.e = a, f.c = [t], void (z = 0);
                    }h = t + "";
                  } else {
                    if (!g.test(h = t + "")) return m(f, h, s);f.s = 45 === h.charCodeAt(0) ? (h = h.slice(1), -1) : 1;
                  }
                }for ((a = h.indexOf(".")) > -1 && (h = h.replace(".", "")), (o = h.search(/e/i)) > 0 ? (a < 0 && (a = o), a += +h.slice(o + 1), h = h.substring(0, o)) : a < 0 && (a = h.length), o = 0; 48 === h.charCodeAt(o); o++) {}for (l = h.length; 48 === h.charCodeAt(--l);) {}if (h = h.slice(o, l + 1)) {
                  if (l = h.length, s && W && l > 15 && (t > S || t !== v(t)) && P(z, y, f.s * t), (a = a - o - 1) > G) f.c = f.e = null;else if (a < H) f.c = [f.e = 0];else {
                    if (f.e = a, f.c = [], o = (a + 1) % E, a < 0 && (o += E), o < l) {
                      for (o && f.c.push(+h.slice(0, o)), l -= E; o < l;) {
                        f.c.push(+h.slice(o, o += E));
                      }h = h.slice(o), o = E - h.length;
                    } else o -= l;for (; o--; h += "0") {}f.c.push(+h);
                  }
                } else f.c = [f.e = 0];z = 0;
              }function i(t, i, n, r) {
                var o,
                    s,
                    l,
                    f,
                    u,
                    p,
                    d,
                    m = t.indexOf("."),
                    g = U,
                    b = N;for (n < 37 && (t = t.toLowerCase()), m >= 0 && (l = X, X = 0, t = t.replace(".", ""), d = new e(n), u = d.pow(t.length - m), X = l, d.c = h(c(a(u.c), u.e), 10, i), d.e = d.c.length), p = h(t, n, i), s = l = p.length; 0 == p[--l]; p.pop()) {}if (!p[0]) return "0";if (m < 0 ? --s : (u.c = p, u.e = s, u.s = r, u = B(u, d, g, b, i), p = u.c, f = u.r, s = u.e), o = s + g + 1, m = p[o], l = i / 2, f = f || o < 0 || null != p[o + 1], f = b < 4 ? (null != m || f) && (0 == b || b == (u.s < 0 ? 3 : 2)) : m > l || m == l && (4 == b || f || 6 == b && 1 & p[o - 1] || b == (u.s < 0 ? 8 : 7)), o < 1 || !p[0]) t = f ? c("1", -g) : "0";else {
                  if (p.length = o, f) for (--i; ++p[--o] > i;) {
                    p[o] = 0, o || (++s, p.unshift(1));
                  }for (l = p.length; !p[--l];) {}for (m = 0, t = ""; m <= l; t += x.charAt(p[m++])) {}t = c(t, s);
                }return t;
              }function p(t, i, n, r) {
                var o, s, l, h, u;if (n = null != n && q(n, 0, 8, r, _) ? 0 | n : N, !t.c) return t.toString();if (o = t.c[0], l = t.e, null == i) u = a(t.c), u = 19 == r || 24 == r && l <= F ? f(u, l) : c(u, l);else if (t = C(new e(t), i, n), s = t.e, u = a(t.c), h = u.length, 19 == r || 24 == r && (i <= s || s <= F)) {
                  for (; h < i; u += "0", h++) {}u = f(u, s);
                } else if (i -= l, u = c(u, s), s + 1 > h) {
                  if (--i > 0) for (u += "."; i--; u += "0") {}
                } else if ((i += s - h) > 0) for (s + 1 == h && (u += "."); i--; u += "0") {}return t.s < 0 && o ? "-" + u : u;
              }function T(t, i) {
                var n,
                    r,
                    a = 0;for (l(t[0]) && (t = t[0]), n = new e(t[0]); ++a < t.length;) {
                  if (r = new e(t[a]), !r.s) {
                    n = r;break;
                  }i.call(n, r) && (n = r);
                }return n;
              }function R(t, e, i, n, r) {
                return (t < e || t > i || t != u(t)) && P(n, (r || "decimal places") + (t < e || t > i ? " out of range" : " not an integer"), t), !0;
              }function L(t, e, i) {
                for (var n = 1, r = e.length; !e[--r]; e.pop()) {}for (r = e[0]; r >= 10; r /= 10, n++) {}return (i = n + i * E - 1) > G ? t.c = t.e = null : i < H ? t.c = [t.e = 0] : (t.e = i, t.c = e), t;
              }function P(t, e, i) {
                var n = new Error(["new BigNumber", "cmp", "config", "div", "divToInt", "eq", "gt", "gte", "lt", "lte", "minus", "mod", "plus", "precision", "random", "round", "shift", "times", "toDigits", "toExponential", "toFixed", "toFormat", "toFraction", "pow", "toPrecision", "toString", "BigNumber"][t] + "() " + e + ": " + i);throw n.name = "BigNumber Error", z = 0, n;
              }function C(t, e, i, n) {
                var r,
                    a,
                    o,
                    s,
                    l,
                    h,
                    f,
                    c = t.c,
                    u = I;if (c) {
                  t: {
                    for (r = 1, s = c[0]; s >= 10; s /= 10, r++) {}if ((a = e - r) < 0) a += E, o = e, l = c[h = 0], f = l / u[r - o - 1] % 10 | 0;else if ((h = b((a + 1) / E)) >= c.length) {
                      if (!n) break t;for (; c.length <= h; c.push(0)) {}l = f = 0, r = 1, a %= E, o = a - E + 1;
                    } else {
                      for (l = s = c[h], r = 1; s >= 10; s /= 10, r++) {}a %= E, o = a - E + r, f = o < 0 ? 0 : l / u[r - o - 1] % 10 | 0;
                    }if (n = n || e < 0 || null != c[h + 1] || (o < 0 ? l : l % u[r - o - 1]), n = i < 4 ? (f || n) && (0 == i || i == (t.s < 0 ? 3 : 2)) : f > 5 || 5 == f && (4 == i || n || 6 == i && (a > 0 ? o > 0 ? l / u[r - o] : 0 : c[h - 1]) % 10 & 1 || i == (t.s < 0 ? 8 : 7)), e < 1 || !c[0]) return c.length = 0, n ? (e -= t.e + 1, c[0] = u[(E - e % E) % E], t.e = -e || 0) : c[0] = t.e = 0, t;if (0 == a ? (c.length = h, s = 1, h--) : (c.length = h + 1, s = u[E - a], c[h] = o > 0 ? v(l / u[r - o] % u[o]) * s : 0), n) for (;;) {
                      if (0 == h) {
                        for (a = 1, o = c[0]; o >= 10; o /= 10, a++) {}for (o = c[0] += s, s = 1; o >= 10; o /= 10, s++) {}a != s && (t.e++, c[0] == k && (c[0] = 1));break;
                      }if (c[h] += s, c[h] != k) break;c[h--] = 0, s = 1;
                    }for (a = c.length; 0 === c[--a]; c.pop()) {}
                  }t.e > G ? t.c = t.e = null : t.e < H && (t.c = [t.e = 0]);
                }return t;
              }var B,
                  z = 0,
                  O = e.prototype,
                  D = new e(1),
                  U = 20,
                  N = 4,
                  F = -7,
                  j = 21,
                  H = -1e7,
                  G = 1e7,
                  W = !0,
                  q = R,
                  Z = !1,
                  Y = 1,
                  X = 100,
                  V = { decimalSeparator: ".", groupSeparator: ",", groupSize: 3, secondaryGroupSize: 0, fractionGroupSeparator: " ", fractionGroupSize: 0 };return e.another = n, e.ROUND_UP = 0, e.ROUND_DOWN = 1, e.ROUND_CEIL = 2, e.ROUND_FLOOR = 3, e.ROUND_HALF_UP = 4, e.ROUND_HALF_DOWN = 5, e.ROUND_HALF_EVEN = 6, e.ROUND_HALF_CEIL = 7, e.ROUND_HALF_FLOOR = 8, e.EUCLID = 9, e.config = function () {
                var t,
                    e,
                    i = 0,
                    n = {},
                    r = arguments,
                    a = r[0],
                    o = a && "object" == (void 0 === a ? "undefined" : _typeof(a)) ? function () {
                  if (a.hasOwnProperty(e)) return null != (t = a[e]);
                } : function () {
                  if (r.length > i) return null != (t = r[i++]);
                };return o(e = "DECIMAL_PLACES") && q(t, 0, A, 2, e) && (U = 0 | t), n[e] = U, o(e = "ROUNDING_MODE") && q(t, 0, 8, 2, e) && (N = 0 | t), n[e] = N, o(e = "EXPONENTIAL_AT") && (l(t) ? q(t[0], -A, 0, 2, e) && q(t[1], 0, A, 2, e) && (F = 0 | t[0], j = 0 | t[1]) : q(t, -A, A, 2, e) && (F = -(j = 0 | (t < 0 ? -t : t)))), n[e] = [F, j], o(e = "RANGE") && (l(t) ? q(t[0], -A, -1, 2, e) && q(t[1], 1, A, 2, e) && (H = 0 | t[0], G = 0 | t[1]) : q(t, -A, A, 2, e) && (0 | t ? H = -(G = 0 | (t < 0 ? -t : t)) : W && P(2, e + " cannot be zero", t))), n[e] = [H, G], o(e = "ERRORS") && (t === !!t || 1 === t || 0 === t ? (z = 0, q = (W = !!t) ? R : s) : W && P(2, e + w, t)), n[e] = W, o(e = "CRYPTO") && (t === !!t || 1 === t || 0 === t ? (Z = !(!t || !d), t && !Z && W && P(2, "crypto unavailable", d)) : W && P(2, e + w, t)), n[e] = Z, o(e = "MODULO_MODE") && q(t, 0, 9, 2, e) && (Y = 0 | t), n[e] = Y, o(e = "POW_PRECISION") && q(t, 0, A, 2, e) && (X = 0 | t), n[e] = X, o(e = "FORMAT") && ("object" == (void 0 === t ? "undefined" : _typeof(t)) ? V = t : W && P(2, e + " not an object", t)), n[e] = V, n;
              }, e.max = function () {
                return T(arguments, O.lt);
              }, e.min = function () {
                return T(arguments, O.gt);
              }, e.random = function () {
                var t = 9007199254740992 * Math.random() & 2097151 ? function () {
                  return v(9007199254740992 * Math.random());
                } : function () {
                  return 8388608 * (1073741824 * Math.random() | 0) + (8388608 * Math.random() | 0);
                };return function (i) {
                  var n,
                      r,
                      a,
                      o,
                      s,
                      l = 0,
                      h = [],
                      f = new e(D);if (i = null != i && q(i, 0, A, 14) ? 0 | i : U, o = b(i / E), Z) if (d && d.getRandomValues) {
                    for (n = d.getRandomValues(new Uint32Array(o *= 2)); l < o;) {
                      s = 131072 * n[l] + (n[l + 1] >>> 11), s >= 9e15 ? (r = d.getRandomValues(new Uint32Array(2)), n[l] = r[0], n[l + 1] = r[1]) : (h.push(s % 1e14), l += 2);
                    }l = o / 2;
                  } else if (d && d.randomBytes) {
                    for (n = d.randomBytes(o *= 7); l < o;) {
                      s = 281474976710656 * (31 & n[l]) + 1099511627776 * n[l + 1] + 4294967296 * n[l + 2] + 16777216 * n[l + 3] + (n[l + 4] << 16) + (n[l + 5] << 8) + n[l + 6], s >= 9e15 ? d.randomBytes(7).copy(n, l) : (h.push(s % 1e14), l += 7);
                    }l = o / 7;
                  } else W && P(14, "crypto unavailable", d);if (!l) for (; l < o;) {
                    (s = t()) < 9e15 && (h[l++] = s % 1e14);
                  }for (o = h[--l], i %= E, o && i && (s = I[E - i], h[l] = v(o / s) * s); 0 === h[l]; h.pop(), l--) {}if (l < 0) h = [a = 0];else {
                    for (a = -1; 0 === h[0]; h.shift(), a -= E) {}for (l = 1, s = h[0]; s >= 10; s /= 10, l++) {}l < E && (a -= E - l);
                  }return f.e = a, f.c = h, f;
                };
              }(), B = function () {
                function t(t, e, i) {
                  var n,
                      r,
                      a,
                      o,
                      s = 0,
                      l = t.length,
                      h = e % M,
                      f = e / M | 0;for (t = t.slice(); l--;) {
                    a = t[l] % M, o = t[l] / M | 0, n = f * a + o * h, r = h * a + n % M * M + s, s = (r / i | 0) + (n / M | 0) + f * o, t[l] = r % i;
                  }return s && t.unshift(s), t;
                }function i(t, e, i, n) {
                  var r, a;if (i != n) a = i > n ? 1 : -1;else for (r = a = 0; r < i; r++) {
                    if (t[r] != e[r]) {
                      a = t[r] > e[r] ? 1 : -1;break;
                    }
                  }return a;
                }function n(t, e, i, n) {
                  for (var r = 0; i--;) {
                    t[i] -= r, r = t[i] < e[i] ? 1 : 0, t[i] = r * n + t[i] - e[i];
                  }for (; !t[0] && t.length > 1; t.shift()) {}
                }return function (a, o, s, l, h) {
                  var f,
                      c,
                      u,
                      p,
                      d,
                      m,
                      g,
                      b,
                      w,
                      _,
                      y,
                      x,
                      S,
                      I,
                      M,
                      A,
                      T,
                      R = a.s == o.s ? 1 : -1,
                      L = a.c,
                      P = o.c;if (!(L && L[0] && P && P[0])) return new e(a.s && o.s && (L ? !P || L[0] != P[0] : P) ? L && 0 == L[0] || !P ? 0 * R : R / 0 : NaN);for (b = new e(R), w = b.c = [], c = a.e - o.e, R = s + c + 1, h || (h = k, c = r(a.e / E) - r(o.e / E), R = R / E | 0), u = 0; P[u] == (L[u] || 0); u++) {}if (P[u] > (L[u] || 0) && c--, R < 0) w.push(1), p = !0;else {
                    for (I = L.length, A = P.length, u = 0, R += 2, d = v(h / (P[0] + 1)), d > 1 && (P = t(P, d, h), L = t(L, d, h), A = P.length, I = L.length), S = A, _ = L.slice(0, A), y = _.length; y < A; _[y++] = 0) {}T = P.slice(), T.unshift(0), M = P[0], P[1] >= h / 2 && M++;do {
                      if (d = 0, (f = i(P, _, A, y)) < 0) {
                        if (x = _[0], A != y && (x = x * h + (_[1] || 0)), (d = v(x / M)) > 1) for (d >= h && (d = h - 1), m = t(P, d, h), g = m.length, y = _.length; 1 == i(m, _, g, y);) {
                          d--, n(m, A < g ? T : P, g, h), g = m.length, f = 1;
                        } else 0 == d && (f = d = 1), m = P.slice(), g = m.length;if (g < y && m.unshift(0), n(_, m, y, h), y = _.length, f == -1) for (; i(P, _, A, y) < 1;) {
                          d++, n(_, A < y ? T : P, y, h), y = _.length;
                        }
                      } else 0 === f && (d++, _ = [0]);w[u++] = d, _[0] ? _[y++] = L[S] || 0 : (_ = [L[S]], y = 1);
                    } while ((S++ < I || null != _[0]) && R--);p = null != _[0], w[0] || w.shift();
                  }if (h == k) {
                    for (u = 1, R = w[0]; R >= 10; R /= 10, u++) {}C(b, s + (b.e = u + c * E - 1) + 1, l, p);
                  } else b.e = c, b.r = +p;return b;
                };
              }(), m = function () {
                var t = /^-?(Infinity|NaN)$/;return function (i, n, r, a) {
                  var o,
                      s = r ? n : n.replace(/^\s*\+(?=[\w.])|^\s+|\s+$/g, "");if (t.test(s)) i.s = isNaN(s) ? null : s < 0 ? -1 : 1;else {
                    if (!r && (s = s.replace(/^(-?)0([xbo])(?=\w[\w.]*$)/i, function (t, e, i) {
                      return o = "x" == (i = i.toLowerCase()) ? 16 : "b" == i ? 2 : 8, a && a != o ? t : e;
                    }), a && (o = a, s = s.replace(/^([^.]+)\.$/, "$1").replace(/^\.([^.]+)$/, "0.$1")), n != s)) return new e(s, o);W && P(z, "not a" + (a ? " base " + a : "") + " number", n), i.s = null;
                  }i.c = i.e = null, z = 0;
                };
              }(), O.absoluteValue = O.abs = function () {
                var t = new e(this);return t.s < 0 && (t.s = 1), t;
              }, O.ceil = function () {
                return C(new e(this), this.e + 1, 2);
              }, O.comparedTo = O.cmp = function (t, i) {
                return z = 1, o(this, new e(t, i));
              }, O.decimalPlaces = O.dp = function () {
                var t,
                    e,
                    i = this.c;if (!i) return null;if (t = ((e = i.length - 1) - r(this.e / E)) * E, e = i[e]) for (; e % 10 == 0; e /= 10, t--) {}return t < 0 && (t = 0), t;
              }, O.dividedBy = O.div = function (t, i) {
                return z = 3, B(this, new e(t, i), U, N);
              }, O.dividedToIntegerBy = O.divToInt = function (t, i) {
                return z = 4, B(this, new e(t, i), 0, 1);
              }, O.equals = O.eq = function (t, i) {
                return z = 5, 0 === o(this, new e(t, i));
              }, O.floor = function () {
                return C(new e(this), this.e + 1, 3);
              }, O.greaterThan = O.gt = function (t, i) {
                return z = 6, o(this, new e(t, i)) > 0;
              }, O.greaterThanOrEqualTo = O.gte = function (t, i) {
                return z = 7, 1 === (i = o(this, new e(t, i))) || 0 === i;
              }, O.isFinite = function () {
                return !!this.c;
              }, O.isInteger = O.isInt = function () {
                return !!this.c && r(this.e / E) > this.c.length - 2;
              }, O.isNaN = function () {
                return !this.s;
              }, O.isNegative = O.isNeg = function () {
                return this.s < 0;
              }, O.isZero = function () {
                return !!this.c && 0 == this.c[0];
              }, O.lessThan = O.lt = function (t, i) {
                return z = 8, o(this, new e(t, i)) < 0;
              }, O.lessThanOrEqualTo = O.lte = function (t, i) {
                return z = 9, (i = o(this, new e(t, i))) === -1 || 0 === i;
              }, O.minus = O.sub = function (t, i) {
                var n,
                    a,
                    o,
                    s,
                    l = this,
                    h = l.s;if (z = 10, t = new e(t, i), i = t.s, !h || !i) return new e(NaN);if (h != i) return t.s = -i, l.plus(t);var f = l.e / E,
                    c = t.e / E,
                    u = l.c,
                    p = t.c;if (!f || !c) {
                  if (!u || !p) return u ? (t.s = -i, t) : new e(p ? l : NaN);if (!u[0] || !p[0]) return p[0] ? (t.s = -i, t) : new e(u[0] ? l : 3 == N ? -0 : 0);
                }if (f = r(f), c = r(c), u = u.slice(), h = f - c) {
                  for ((s = h < 0) ? (h = -h, o = u) : (c = f, o = p), o.reverse(), i = h; i--; o.push(0)) {}o.reverse();
                } else for (a = (s = (h = u.length) < (i = p.length)) ? h : i, h = i = 0; i < a; i++) {
                  if (u[i] != p[i]) {
                    s = u[i] < p[i];break;
                  }
                }if (s && (o = u, u = p, p = o, t.s = -t.s), (i = (a = p.length) - (n = u.length)) > 0) for (; i--; u[n++] = 0) {}for (i = k - 1; a > h;) {
                  if (u[--a] < p[a]) {
                    for (n = a; n && !u[--n]; u[n] = i) {}--u[n], u[a] += k;
                  }u[a] -= p[a];
                }for (; 0 == u[0]; u.shift(), --c) {}return u[0] ? L(t, u, c) : (t.s = 3 == N ? -1 : 1, t.c = [t.e = 0], t);
              }, O.modulo = O.mod = function (t, i) {
                var n,
                    r,
                    a = this;return z = 11, t = new e(t, i), !a.c || !t.s || t.c && !t.c[0] ? new e(NaN) : !t.c || a.c && !a.c[0] ? new e(a) : (9 == Y ? (r = t.s, t.s = 1, n = B(a, t, 0, 3), t.s = r, n.s *= r) : n = B(a, t, 0, Y), a.minus(n.times(t)));
              }, O.negated = O.neg = function () {
                var t = new e(this);return t.s = -t.s || null, t;
              }, O.plus = O.add = function (t, i) {
                var n,
                    a = this,
                    o = a.s;if (z = 12, t = new e(t, i), i = t.s, !o || !i) return new e(NaN);if (o != i) return t.s = -i, a.minus(t);var s = a.e / E,
                    l = t.e / E,
                    h = a.c,
                    f = t.c;if (!s || !l) {
                  if (!h || !f) return new e(o / 0);if (!h[0] || !f[0]) return f[0] ? t : new e(h[0] ? a : 0 * o);
                }if (s = r(s), l = r(l), h = h.slice(), o = s - l) {
                  for (o > 0 ? (l = s, n = f) : (o = -o, n = h), n.reverse(); o--; n.push(0)) {}n.reverse();
                }for (o = h.length, i = f.length, o - i < 0 && (n = f, f = h, h = n, i = o), o = 0; i;) {
                  o = (h[--i] = h[i] + f[i] + o) / k | 0, h[i] %= k;
                }return o && (h.unshift(o), ++l), L(t, h, l);
              }, O.precision = O.sd = function (t) {
                var e,
                    i,
                    n = this,
                    r = n.c;if (null != t && t !== !!t && 1 !== t && 0 !== t && (W && P(13, "argument" + w, t), t != !!t && (t = null)), !r) return null;if (i = r.length - 1, e = i * E + 1, i = r[i]) {
                  for (; i % 10 == 0; i /= 10, e--) {}for (i = r[0]; i >= 10; i /= 10, e++) {}
                }return t && n.e + 1 > e && (e = n.e + 1), e;
              }, O.round = function (t, i) {
                var n = new e(this);return (null == t || q(t, 0, A, 15)) && C(n, ~~t + this.e + 1, null != i && q(i, 0, 8, 15, _) ? 0 | i : N), n;
              }, O.shift = function (t) {
                var i = this;return q(t, -S, S, 16, "argument") ? i.times("1e" + u(t)) : new e(i.c && i.c[0] && (t < -S || t > S) ? i.s * (t < 0 ? 0 : 1 / 0) : i);
              }, O.squareRoot = O.sqrt = function () {
                var t,
                    i,
                    n,
                    o,
                    s,
                    l = this,
                    h = l.c,
                    f = l.s,
                    c = l.e,
                    u = U + 4,
                    p = new e("0.5");if (1 !== f || !h || !h[0]) return new e(!f || f < 0 && (!h || h[0]) ? NaN : h ? l : 1 / 0);if (f = Math.sqrt(+l), 0 == f || f == 1 / 0 ? (i = a(h), (i.length + c) % 2 == 0 && (i += "0"), f = Math.sqrt(i), c = r((c + 1) / 2) - (c < 0 || c % 2), f == 1 / 0 ? i = "1e" + c : (i = f.toExponential(), i = i.slice(0, i.indexOf("e") + 1) + c), n = new e(i)) : n = new e(f + ""), n.c[0]) for (c = n.e, f = c + u, f < 3 && (f = 0);;) {
                  if (s = n, n = p.times(s.plus(B(l, s, u, 1))), a(s.c).slice(0, f) === (i = a(n.c)).slice(0, f)) {
                    if (n.e < c && --f, "9999" != (i = i.slice(f - 3, f + 1)) && (o || "4999" != i)) {
                      +i && (+i.slice(1) || "5" != i.charAt(0)) || (C(n, n.e + U + 2, 1), t = !n.times(n).eq(l));break;
                    }if (!o && (C(s, s.e + U + 2, 0), s.times(s).eq(l))) {
                      n = s;break;
                    }u += 4, f += 4, o = 1;
                  }
                }return C(n, n.e + U + 1, N, t);
              }, O.times = O.mul = function (t, i) {
                var n,
                    a,
                    o,
                    s,
                    l,
                    h,
                    f,
                    c,
                    u,
                    p,
                    d,
                    m,
                    g,
                    b,
                    v,
                    w = this,
                    _ = w.c,
                    y = (z = 17, t = new e(t, i)).c;if (!(_ && y && _[0] && y[0])) return !w.s || !t.s || _ && !_[0] && !y || y && !y[0] && !_ ? t.c = t.e = t.s = null : (t.s *= w.s, _ && y ? (t.c = [0], t.e = 0) : t.c = t.e = null), t;for (a = r(w.e / E) + r(t.e / E), t.s *= w.s, f = _.length, p = y.length, f < p && (g = _, _ = y, y = g, o = f, f = p, p = o), o = f + p, g = []; o--; g.push(0)) {}for (b = k, v = M, o = p; --o >= 0;) {
                  for (n = 0, d = y[o] % v, m = y[o] / v | 0, l = f, s = o + l; s > o;) {
                    c = _[--l] % v, u = _[l] / v | 0, h = m * c + u * d, c = d * c + h % v * v + g[s] + n, n = (c / b | 0) + (h / v | 0) + m * u, g[s--] = c % b;
                  }g[s] = n;
                }return n ? ++a : g.shift(), L(t, g, a);
              }, O.toDigits = function (t, i) {
                var n = new e(this);return t = null != t && q(t, 1, A, 18, "precision") ? 0 | t : null, i = null != i && q(i, 0, 8, 18, _) ? 0 | i : N, t ? C(n, t, i) : n;
              }, O.toExponential = function (t, e) {
                return p(this, null != t && q(t, 0, A, 19) ? 1 + ~~t : null, e, 19);
              }, O.toFixed = function (t, e) {
                return p(this, null != t && q(t, 0, A, 20) ? ~~t + this.e + 1 : null, e, 20);
              }, O.toFormat = function (t, e) {
                var i = p(this, null != t && q(t, 0, A, 21) ? ~~t + this.e + 1 : null, e, 21);if (this.c) {
                  var n,
                      r = i.split("."),
                      a = +V.groupSize,
                      o = +V.secondaryGroupSize,
                      s = V.groupSeparator,
                      l = r[0],
                      h = r[1],
                      f = this.s < 0,
                      c = f ? l.slice(1) : l,
                      u = c.length;if (o && (n = a, a = o, o = n, u -= n), a > 0 && u > 0) {
                    for (n = u % a || a, l = c.substr(0, n); n < u; n += a) {
                      l += s + c.substr(n, a);
                    }o > 0 && (l += s + c.slice(n)), f && (l = "-" + l);
                  }i = h ? l + V.decimalSeparator + ((o = +V.fractionGroupSize) ? h.replace(new RegExp("\\d{" + o + "}\\B", "g"), "$&" + V.fractionGroupSeparator) : h) : l;
                }return i;
              }, O.toFraction = function (t) {
                var i,
                    n,
                    r,
                    o,
                    s,
                    l,
                    h,
                    f,
                    c,
                    u = W,
                    p = this,
                    d = p.c,
                    m = new e(D),
                    g = n = new e(D),
                    b = h = new e(D);if (null != t && (W = !1, l = new e(t), W = u, (u = l.isInt()) && !l.lt(D) || (W && P(22, "max denominator " + (u ? "out of range" : "not an integer"), t), t = !u && l.c && C(l, l.e + 1, 1).gte(D) ? l : null)), !d) return p.toString();for (c = a(d), o = m.e = c.length - p.e - 1, m.c[0] = I[(s = o % E) < 0 ? E + s : s], t = !t || l.cmp(m) > 0 ? o > 0 ? m : g : l, s = G, G = 1 / 0, l = new e(c), h.c[0] = 0; f = B(l, m, 0, 1), r = n.plus(f.times(b)), 1 != r.cmp(t);) {
                  n = b, b = r, g = h.plus(f.times(r = g)), h = r, m = l.minus(f.times(r = m)), l = r;
                }return r = B(t.minus(n), b, 0, 1), h = h.plus(r.times(g)), n = n.plus(r.times(b)), h.s = g.s = p.s, o *= 2, i = B(g, b, o, N).minus(p).abs().cmp(B(h, n, o, N).minus(p).abs()) < 1 ? [g.toString(), b.toString()] : [h.toString(), n.toString()], G = s, i;
              }, O.toNumber = function () {
                return +this;
              }, O.toPower = O.pow = function (t, i) {
                var n,
                    r,
                    a,
                    o = v(t < 0 ? -t : +t),
                    s = this;if (null != i && (z = 23, i = new e(i)), !q(t, -S, S, 23, "exponent") && (!isFinite(t) || o > S && (t /= 0) || parseFloat(t) != t && !(t = NaN)) || 0 == t) return n = Math.pow(+s, t), new e(i ? n % i : n);for (i ? t > 1 && s.gt(D) && s.isInt() && i.gt(D) && i.isInt() ? s = s.mod(i) : (a = i, i = null) : X && (n = b(X / E + 2)), r = new e(D);;) {
                  if (o % 2) {
                    if (r = r.times(s), !r.c) break;n ? r.c.length > n && (r.c.length = n) : i && (r = r.mod(i));
                  }if (!(o = v(o / 2))) break;s = s.times(s), n ? s.c && s.c.length > n && (s.c.length = n) : i && (s = s.mod(i));
                }return i ? r : (t < 0 && (r = D.div(r)), a ? r.mod(a) : n ? C(r, X, N) : r);
              }, O.toPrecision = function (t, e) {
                return p(this, null != t && q(t, 1, A, 24, "precision") ? 0 | t : null, e, 24);
              }, O.toString = function (t) {
                var e,
                    n = this,
                    r = n.s,
                    o = n.e;return null === o ? r ? (e = "Infinity", r < 0 && (e = "-" + e)) : e = "NaN" : (e = a(n.c), e = null != t && q(t, 2, 64, 25, "base") ? i(c(e, o), 0 | t, 10, r) : o <= F || o >= j ? f(e, o) : c(e, o), r < 0 && n.c[0] && (e = "-" + e)), e;
              }, O.truncated = O.trunc = function () {
                return C(new e(this), this.e + 1, 1);
              }, O.valueOf = O.toJSON = function () {
                var t,
                    e = this,
                    i = e.e;return null === i ? e.toString() : (t = a(e.c), t = i <= F || i >= j ? f(t, i) : c(t, i), e.s < 0 ? "-" + t : t);
              }, null != t && e.config(t), e;
            }function r(t) {
              var e = 0 | t;return t > 0 || t === e ? e : e - 1;
            }function a(t) {
              for (var e, i, n = 1, r = t.length, a = t[0] + ""; n < r;) {
                for (e = t[n++] + "", i = E - e.length; i--; e = "0" + e) {}a += e;
              }for (r = a.length; 48 === a.charCodeAt(--r);) {}return a.slice(0, r + 1 || 1);
            }function o(t, e) {
              var i,
                  n,
                  r = t.c,
                  a = e.c,
                  o = t.s,
                  s = e.s,
                  l = t.e,
                  h = e.e;if (!o || !s) return null;if (i = r && !r[0], n = a && !a[0], i || n) return i ? n ? 0 : -s : o;if (o != s) return o;if (i = o < 0, n = l == h, !r || !a) return n ? 0 : !r ^ i ? 1 : -1;if (!n) return l > h ^ i ? 1 : -1;for (s = (l = r.length) < (h = a.length) ? l : h, o = 0; o < s; o++) {
                if (r[o] != a[o]) return r[o] > a[o] ^ i ? 1 : -1;
              }return l == h ? 0 : l > h ^ i ? 1 : -1;
            }function s(t, e, i) {
              return (t = u(t)) >= e && t <= i;
            }function l(t) {
              return "[object Array]" == Object.prototype.toString.call(t);
            }function h(t, e, i) {
              for (var n, r, a = [0], o = 0, s = t.length; o < s;) {
                for (r = a.length; r--; a[r] *= e) {}for (a[n = 0] += x.indexOf(t.charAt(o++)); n < a.length; n++) {
                  a[n] > i - 1 && (null == a[n + 1] && (a[n + 1] = 0), a[n + 1] += a[n] / i | 0, a[n] %= i);
                }
              }return a.reverse();
            }function f(t, e) {
              return (t.length > 1 ? t.charAt(0) + "." + t.slice(1) : t) + (e < 0 ? "e" : "e+") + e;
            }function c(t, e) {
              var i, n;if (e < 0) {
                for (n = "0."; ++e; n += "0") {}t = n + t;
              } else if (i = t.length, ++e > i) {
                for (n = "0", e -= i; --e; n += "0") {}t += n;
              } else e < i && (t = t.slice(0, e) + "." + t.slice(e));return t;
            }function u(t) {
              return t = parseFloat(t), t < 0 ? b(t) : v(t);
            }var p,
                d,
                m,
                g = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
                b = Math.ceil,
                v = Math.floor,
                w = " not a boolean or binary digit",
                _ = "rounding mode",
                y = "number type has more than 15 significant digits",
                x = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_",
                k = 1e14,
                E = 14,
                S = 9007199254740991,
                I = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
                M = 1e7,
                A = 1e9;if ("undefined" != typeof crypto && (d = crypto), p = n(), p.default = p.BigNumber = p, "function" == typeof define && define.amd) define(function () {
              return p;
            });else if (void 0 !== e && e.exports) {
              if (e.exports = p, !d) try {
                d = t("crypto");
              } catch (t) {}
            } else i || (i = "undefined" != typeof self ? self : Function("return this")()), i.BigNumber = p;
          }(this);
        }, {}], 5: [function (t, e, i) {
          var n = t("./lib/encoder"),
              r = t("./lib/decoder");e.exports = { encode: n, decode: r };
        }, { "./lib/decoder": 6, "./lib/encoder": 7 }], 6: [function (t, e, i) {
          (function (t) {
            function i(t) {
              if (this.pos = 0, this.buffer = t, this.flag = this.buffer.toString("utf-8", 0, this.pos += 2), "BM" != this.flag) throw new Error("Invalid BMP File");this.parseHeader(), this.parseBGR();
            }i.prototype.parseHeader = function () {
              if (this.fileSize = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.reserved = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.offset = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.headerSize = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.width = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.height = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.planes = this.buffer.readUInt16LE(this.pos), this.pos += 2, this.bitPP = this.buffer.readUInt16LE(this.pos), this.pos += 2, this.compress = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.rawSize = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.hr = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.vr = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.colors = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.importantColors = this.buffer.readUInt32LE(this.pos), this.pos += 4, this.bitPP < 24) {
                var t = 1 << this.bitPP;this.palette = new Array(t);for (var e = 0; e < t; e++) {
                  var i = this.buffer.readUInt8(this.pos++),
                      n = this.buffer.readUInt8(this.pos++),
                      r = this.buffer.readUInt8(this.pos++),
                      a = this.buffer.readUInt8(this.pos++);this.palette[e] = { red: r, green: n, blue: i, quad: a };
                }
              }
            }, i.prototype.parseBGR = function () {
              this.pos = this.offset;try {
                var e = "bit" + this.bitPP,
                    i = this.width * this.height * 4;this.data = new t(i), this[e]();
              } catch (t) {
                console.log("bit decode error:" + t);
              }
            }, i.prototype.bit1 = function () {
              for (var t = Math.ceil(this.width / 8), e = t % 4, i = this.height - 1; i >= 0; i--) {
                for (var n = 0; n < t; n++) {
                  for (var r = this.buffer.readUInt8(this.pos++), a = i * this.width * 4 + 8 * n * 4, o = 0; o < 8 && 8 * n + o < this.width; o++) {
                    var s = this.palette[r >> 7 - o & 1];this.data[a + 4 * o] = s.blue, this.data[a + 4 * o + 1] = s.green, this.data[a + 4 * o + 2] = s.red, this.data[a + 4 * o + 3] = 255;
                  }
                }0 != e && (this.pos += 4 - e);
              }
            }, i.prototype.bit4 = function () {
              for (var t = Math.ceil(this.width / 2), e = t % 4, i = this.height - 1; i >= 0; i--) {
                for (var n = 0; n < t; n++) {
                  var r = this.buffer.readUInt8(this.pos++),
                      a = i * this.width * 4 + 2 * n * 4,
                      o = r >> 4,
                      s = 15 & r,
                      l = this.palette[o];if (this.data[a] = l.blue, this.data[a + 1] = l.green, this.data[a + 2] = l.red, this.data[a + 3] = 255, 2 * n + 1 >= this.width) break;l = this.palette[s], this.data[a + 4] = l.blue, this.data[a + 4 + 1] = l.green, this.data[a + 4 + 2] = l.red, this.data[a + 4 + 3] = 255;
                }0 != e && (this.pos += 4 - e);
              }
            }, i.prototype.bit8 = function () {
              for (var t = this.width % 4, e = this.height - 1; e >= 0; e--) {
                for (var i = 0; i < this.width; i++) {
                  var n = this.buffer.readUInt8(this.pos++),
                      r = e * this.width * 4 + 4 * i,
                      a = this.palette[n];this.data[r] = a.blue, this.data[r + 1] = a.green, this.data[r + 2] = a.red, this.data[r + 3] = 255;
                }0 != t && (this.pos += 4 - t);
              }
            }, i.prototype.bit24 = function () {
              for (var t = this.height - 1; t >= 0; t--) {
                for (var e = 0; e < this.width; e++) {
                  var i = this.buffer.readUInt8(this.pos++),
                      n = this.buffer.readUInt8(this.pos++),
                      r = this.buffer.readUInt8(this.pos++),
                      a = t * this.width * 4 + 4 * e;this.data[a] = r, this.data[a + 1] = n, this.data[a + 2] = i, this.data[a + 3] = 255;
                }this.pos += this.width % 4;
              }
            }, i.prototype.getData = function () {
              return this.data;
            }, e.exports = decode = function decode(t) {
              var e = new i(t);return { data: e.getData(), width: e.width, height: e.height };
            };
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14 }], 7: [function (t, e, i) {
          (function (t) {
            function i(t) {
              this.buffer = t.data, this.width = t.width, this.height = t.height, this.extraBytes = this.width % 4, this.rgbSize = this.height * (3 * this.width + this.extraBytes), this.headerInfoSize = 40, this.data = [], this.flag = "BM", this.reserved = 0, this.offset = 54, this.fileSize = this.rgbSize + this.offset, this.planes = 1, this.bitPP = 24, this.compress = 0, this.hr = 0, this.vr = 0, this.colors = 0, this.importantColors = 0;
            }i.prototype.encode = function () {
              var e = new t(this.offset + this.rgbSize);this.pos = 0, e.write(this.flag, this.pos, 2), this.pos += 2, e.writeUInt32LE(this.fileSize, this.pos), this.pos += 4, e.writeUInt32LE(this.reserved, this.pos), this.pos += 4, e.writeUInt32LE(this.offset, this.pos), this.pos += 4, e.writeUInt32LE(this.headerInfoSize, this.pos), this.pos += 4, e.writeUInt32LE(this.width, this.pos), this.pos += 4, e.writeUInt32LE(this.height, this.pos), this.pos += 4, e.writeUInt16LE(this.planes, this.pos), this.pos += 2, e.writeUInt16LE(this.bitPP, this.pos), this.pos += 2, e.writeUInt32LE(this.compress, this.pos), this.pos += 4, e.writeUInt32LE(this.rgbSize, this.pos), this.pos += 4, e.writeUInt32LE(this.hr, this.pos), this.pos += 4, e.writeUInt32LE(this.vr, this.pos), this.pos += 4, e.writeUInt32LE(this.colors, this.pos), this.pos += 4, e.writeUInt32LE(this.importantColors, this.pos), this.pos += 4;for (var i = 0, n = 3 * this.width + this.extraBytes, r = this.height - 1; r >= 0; r--) {
                for (var a = 0; a < this.width; a++) {
                  var o = this.pos + r * n + 3 * a;e[o + 2] = this.buffer[i++], e[o + 1] = this.buffer[i++], e[o] = this.buffer[i++], i++;
                }if (this.extraBytes > 0) {
                  var s = this.pos + r * n + 3 * this.width;e.fill(0, s, s + this.extraBytes);
                }
              }return e;
            }, e.exports = encode = function encode(t, e) {
              return void 0 === e && (e = 100), { data: new i(t).encode(), width: t.width, height: t.height };
            };
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14 }], 8: [function (t, e, i) {}, {}], 9: [function (t, e, i) {
          (function (e, n) {
            function r(t) {
              if (t < i.DEFLATE || t > i.UNZIP) throw new TypeError("Bad argument");this.mode = t, this.init_done = !1, this.write_in_progress = !1, this.pending_close = !1, this.windowBits = 0, this.level = 0, this.memLevel = 0, this.strategy = 0, this.dictionary = null;
            }function a(t, e) {
              for (var i = 0; i < t.length; i++) {
                this[e + i] = t[i];
              }
            }var o = t("pako/lib/zlib/messages"),
                s = t("pako/lib/zlib/zstream"),
                l = t("pako/lib/zlib/deflate.js"),
                h = t("pako/lib/zlib/inflate.js"),
                f = t("pako/lib/zlib/constants");for (var c in f) {
              i[c] = f[c];
            }i.NONE = 0, i.DEFLATE = 1, i.INFLATE = 2, i.GZIP = 3, i.GUNZIP = 4, i.DEFLATERAW = 5, i.INFLATERAW = 6, i.UNZIP = 7, r.prototype.init = function (t, e, n, r, a) {
              switch (this.windowBits = t, this.level = e, this.memLevel = n, this.strategy = r, this.mode !== i.GZIP && this.mode !== i.GUNZIP || (this.windowBits += 16), this.mode === i.UNZIP && (this.windowBits += 32), this.mode !== i.DEFLATERAW && this.mode !== i.INFLATERAW || (this.windowBits = -this.windowBits), this.strm = new s(), this.mode) {case i.DEFLATE:case i.GZIP:case i.DEFLATERAW:
                  var o = l.deflateInit2(this.strm, this.level, i.Z_DEFLATED, this.windowBits, this.memLevel, this.strategy);break;case i.INFLATE:case i.GUNZIP:
                case i.INFLATERAW:case i.UNZIP:
                  var o = h.inflateInit2(this.strm, this.windowBits);break;default:
                  throw new Error("Unknown mode " + this.mode);}if (o !== i.Z_OK) return void this._error(o);this.write_in_progress = !1, this.init_done = !0;
            }, r.prototype.params = function () {
              throw new Error("deflateParams Not supported");
            }, r.prototype._writeCheck = function () {
              if (!this.init_done) throw new Error("write before init");if (this.mode === i.NONE) throw new Error("already finalized");if (this.write_in_progress) throw new Error("write already in progress");if (this.pending_close) throw new Error("close is pending");
            }, r.prototype.write = function (t, i, n, r, a, o, s) {
              this._writeCheck(), this.write_in_progress = !0;var l = this;return e.nextTick(function () {
                l.write_in_progress = !1;var e = l._write(t, i, n, r, a, o, s);l.callback(e[0], e[1]), l.pending_close && l.close();
              }), this;
            }, r.prototype.writeSync = function (t, e, i, n, r, a, o) {
              return this._writeCheck(), this._write(t, e, i, n, r, a, o);
            }, r.prototype._write = function (t, e, r, o, s, f, c) {
              if (this.write_in_progress = !0, t !== i.Z_NO_FLUSH && t !== i.Z_PARTIAL_FLUSH && t !== i.Z_SYNC_FLUSH && t !== i.Z_FULL_FLUSH && t !== i.Z_FINISH && t !== i.Z_BLOCK) throw new Error("Invalid flush value");null == e && (e = new n(0), o = 0, r = 0), s._set ? s.set = s._set : s.set = a;var u = this.strm;switch (u.avail_in = o, u.input = e, u.next_in = r, u.avail_out = c, u.output = s, u.next_out = f, this.mode) {case i.DEFLATE:case i.GZIP:case i.DEFLATERAW:
                  var p = l.deflate(u, t);break;case i.UNZIP:case i.INFLATE:case i.GUNZIP:case i.INFLATERAW:
                  var p = h.inflate(u, t);break;default:
                  throw new Error("Unknown mode " + this.mode);}return p !== i.Z_STREAM_END && p !== i.Z_OK && this._error(p), this.write_in_progress = !1, [u.avail_in, u.avail_out];
            }, r.prototype.close = function () {
              if (this.write_in_progress) return void (this.pending_close = !0);this.pending_close = !1, this.mode === i.DEFLATE || this.mode === i.GZIP || this.mode === i.DEFLATERAW ? l.deflateEnd(this.strm) : h.inflateEnd(this.strm), this.mode = i.NONE;
            }, r.prototype.reset = function () {
              switch (this.mode) {case i.DEFLATE:case i.DEFLATERAW:
                  var t = l.deflateReset(this.strm);break;case i.INFLATE:case i.INFLATERAW:
                  var t = h.inflateReset(this.strm);}t !== i.Z_OK && this._error(t);
            }, r.prototype._error = function (t) {
              this.onerror(o[t] + ": " + this.strm.msg, t), this.write_in_progress = !1, this.pending_close && this.close();
            }, i.Zlib = r;
          }).call(this, t("_process"), t("buffer").Buffer);
        }, { _process: 12, buffer: 14, "pako/lib/zlib/constants": 45, "pako/lib/zlib/deflate.js": 47, "pako/lib/zlib/inflate.js": 49, "pako/lib/zlib/messages": 51, "pako/lib/zlib/zstream": 53 }], 10: [function (t, e, i) {
          (function (e, n) {
            function r(t, e, i) {
              function r() {
                for (var e; null !== (e = t.read());) {
                  s.push(e), l += e.length;
                }t.once("readable", r);
              }function a(e) {
                t.removeListener("end", o), t.removeListener("readable", r), i(e);
              }function o() {
                var e = n.concat(s, l);s = [], i(null, e), t.close();
              }var s = [],
                  l = 0;t.on("error", a), t.on("end", o), t.end(e), r();
            }function a(t, e) {
              if ("string" == typeof e && (e = new n(e)), !n.isBuffer(e)) throw new TypeError("Not a string or buffer");var i = m.Z_FINISH;return t._processChunk(e, i);
            }function o(t) {
              if (!(this instanceof o)) return new o(t);p.call(this, t, m.DEFLATE);
            }function s(t) {
              if (!(this instanceof s)) return new s(t);p.call(this, t, m.INFLATE);
            }function l(t) {
              if (!(this instanceof l)) return new l(t);p.call(this, t, m.GZIP);
            }function h(t) {
              if (!(this instanceof h)) return new h(t);p.call(this, t, m.GUNZIP);
            }function f(t) {
              if (!(this instanceof f)) return new f(t);p.call(this, t, m.DEFLATERAW);
            }function c(t) {
              if (!(this instanceof c)) return new c(t);p.call(this, t, m.INFLATERAW);
            }function u(t) {
              if (!(this instanceof u)) return new u(t);p.call(this, t, m.UNZIP);
            }function p(t, e) {
              if (this._opts = t = t || {}, this._chunkSize = t.chunkSize || i.Z_DEFAULT_CHUNK, d.call(this, t), t.flush && t.flush !== m.Z_NO_FLUSH && t.flush !== m.Z_PARTIAL_FLUSH && t.flush !== m.Z_SYNC_FLUSH && t.flush !== m.Z_FULL_FLUSH && t.flush !== m.Z_FINISH && t.flush !== m.Z_BLOCK) throw new Error("Invalid flush flag: " + t.flush);if (this._flushFlag = t.flush || m.Z_NO_FLUSH, t.chunkSize && (t.chunkSize < i.Z_MIN_CHUNK || t.chunkSize > i.Z_MAX_CHUNK)) throw new Error("Invalid chunk size: " + t.chunkSize);if (t.windowBits && (t.windowBits < i.Z_MIN_WINDOWBITS || t.windowBits > i.Z_MAX_WINDOWBITS)) throw new Error("Invalid windowBits: " + t.windowBits);if (t.level && (t.level < i.Z_MIN_LEVEL || t.level > i.Z_MAX_LEVEL)) throw new Error("Invalid compression level: " + t.level);if (t.memLevel && (t.memLevel < i.Z_MIN_MEMLEVEL || t.memLevel > i.Z_MAX_MEMLEVEL)) throw new Error("Invalid memLevel: " + t.memLevel);if (t.strategy && t.strategy != i.Z_FILTERED && t.strategy != i.Z_HUFFMAN_ONLY && t.strategy != i.Z_RLE && t.strategy != i.Z_FIXED && t.strategy != i.Z_DEFAULT_STRATEGY) throw new Error("Invalid strategy: " + t.strategy);if (t.dictionary && !n.isBuffer(t.dictionary)) throw new Error("Invalid dictionary: it should be a Buffer instance");this._binding = new m.Zlib(e);var r = this;this._hadError = !1, this._binding.onerror = function (t, e) {
                r._binding = null, r._hadError = !0;var n = new Error(t);n.errno = e, n.code = i.codes[e], r.emit("error", n);
              };var a = i.Z_DEFAULT_COMPRESSION;"number" == typeof t.level && (a = t.level);var o = i.Z_DEFAULT_STRATEGY;"number" == typeof t.strategy && (o = t.strategy), this._binding.init(t.windowBits || i.Z_DEFAULT_WINDOWBITS, a, t.memLevel || i.Z_DEFAULT_MEMLEVEL, o, t.dictionary), this._buffer = new n(this._chunkSize), this._offset = 0, this._closed = !1, this._level = a, this._strategy = o, this.once("end", this.close);
            }var d = t("_stream_transform"),
                m = t("./binding"),
                g = t("util"),
                b = t("assert").ok;m.Z_MIN_WINDOWBITS = 8, m.Z_MAX_WINDOWBITS = 15, m.Z_DEFAULT_WINDOWBITS = 15, m.Z_MIN_CHUNK = 64, m.Z_MAX_CHUNK = 1 / 0, m.Z_DEFAULT_CHUNK = 16384, m.Z_MIN_MEMLEVEL = 1, m.Z_MAX_MEMLEVEL = 9, m.Z_DEFAULT_MEMLEVEL = 8, m.Z_MIN_LEVEL = -1, m.Z_MAX_LEVEL = 9, m.Z_DEFAULT_LEVEL = m.Z_DEFAULT_COMPRESSION, Object.keys(m).forEach(function (t) {
              t.match(/^Z/) && (i[t] = m[t]);
            }), i.codes = { Z_OK: m.Z_OK, Z_STREAM_END: m.Z_STREAM_END, Z_NEED_DICT: m.Z_NEED_DICT, Z_ERRNO: m.Z_ERRNO, Z_STREAM_ERROR: m.Z_STREAM_ERROR, Z_DATA_ERROR: m.Z_DATA_ERROR, Z_MEM_ERROR: m.Z_MEM_ERROR, Z_BUF_ERROR: m.Z_BUF_ERROR, Z_VERSION_ERROR: m.Z_VERSION_ERROR }, Object.keys(i.codes).forEach(function (t) {
              i.codes[i.codes[t]] = t;
            }), i.Deflate = o, i.Inflate = s, i.Gzip = l, i.Gunzip = h, i.DeflateRaw = f, i.InflateRaw = c, i.Unzip = u, i.createDeflate = function (t) {
              return new o(t);
            }, i.createInflate = function (t) {
              return new s(t);
            }, i.createDeflateRaw = function (t) {
              return new f(t);
            }, i.createInflateRaw = function (t) {
              return new c(t);
            }, i.createGzip = function (t) {
              return new l(t);
            }, i.createGunzip = function (t) {
              return new h(t);
            }, i.createUnzip = function (t) {
              return new u(t);
            }, i.deflate = function (t, e, i) {
              return "function" == typeof e && (i = e, e = {}), r(new o(e), t, i);
            }, i.deflateSync = function (t, e) {
              return a(new o(e), t);
            }, i.gzip = function (t, e, i) {
              return "function" == typeof e && (i = e, e = {}), r(new l(e), t, i);
            }, i.gzipSync = function (t, e) {
              return a(new l(e), t);
            }, i.deflateRaw = function (t, e, i) {
              return "function" == typeof e && (i = e, e = {}), r(new f(e), t, i);
            }, i.deflateRawSync = function (t, e) {
              return a(new f(e), t);
            }, i.unzip = function (t, e, i) {
              return "function" == typeof e && (i = e, e = {}), r(new u(e), t, i);
            }, i.unzipSync = function (t, e) {
              return a(new u(e), t);
            }, i.inflate = function (t, e, i) {
              return "function" == typeof e && (i = e, e = {}), r(new s(e), t, i);
            }, i.inflateSync = function (t, e) {
              return a(new s(e), t);
            }, i.gunzip = function (t, e, i) {
              return "function" == typeof e && (i = e, e = {}), r(new h(e), t, i);
            }, i.gunzipSync = function (t, e) {
              return a(new h(e), t);
            }, i.inflateRaw = function (t, e, i) {
              return "function" == typeof e && (i = e, e = {}), r(new c(e), t, i);
            }, i.inflateRawSync = function (t, e) {
              return a(new c(e), t);
            }, g.inherits(p, d), p.prototype.params = function (t, n, r) {
              if (t < i.Z_MIN_LEVEL || t > i.Z_MAX_LEVEL) throw new RangeError("Invalid compression level: " + t);if (n != i.Z_FILTERED && n != i.Z_HUFFMAN_ONLY && n != i.Z_RLE && n != i.Z_FIXED && n != i.Z_DEFAULT_STRATEGY) throw new TypeError("Invalid strategy: " + n);if (this._level !== t || this._strategy !== n) {
                var a = this;this.flush(m.Z_SYNC_FLUSH, function () {
                  a._binding.params(t, n), a._hadError || (a._level = t, a._strategy = n, r && r());
                });
              } else e.nextTick(r);
            }, p.prototype.reset = function () {
              return this._binding.reset();
            }, p.prototype._flush = function (t) {
              this._transform(new n(0), "", t);
            }, p.prototype.flush = function (t, i) {
              var r = this._writableState;if (("function" == typeof t || void 0 === t && !i) && (i = t, t = m.Z_FULL_FLUSH), r.ended) i && e.nextTick(i);else if (r.ending) i && this.once("end", i);else if (r.needDrain) {
                var a = this;this.once("drain", function () {
                  a.flush(i);
                });
              } else this._flushFlag = t, this.write(new n(0), "", i);
            }, p.prototype.close = function (t) {
              if (t && e.nextTick(t), !this._closed) {
                this._closed = !0, this._binding.close();var i = this;e.nextTick(function () {
                  i.emit("close");
                });
              }
            }, p.prototype._transform = function (t, e, i) {
              var r,
                  a = this._writableState,
                  o = a.ending || a.ended,
                  s = o && (!t || a.length === t.length);if (null === !t && !n.isBuffer(t)) return i(new Error("invalid input"));s ? r = m.Z_FINISH : (r = this._flushFlag, t.length >= a.length && (this._flushFlag = this._opts.flush || m.Z_NO_FLUSH));this._processChunk(t, r, i);
            }, p.prototype._processChunk = function (t, e, i) {
              function r(f, p) {
                if (!l._hadError) {
                  var d = o - p;if (b(d >= 0, "have should not go down"), d > 0) {
                    var m = l._buffer.slice(l._offset, l._offset + d);l._offset += d, h ? l.push(m) : (c.push(m), u += m.length);
                  }if ((0 === p || l._offset >= l._chunkSize) && (o = l._chunkSize, l._offset = 0, l._buffer = new n(l._chunkSize)), 0 === p) {
                    if (s += a - f, a = f, !h) return !0;var g = l._binding.write(e, t, s, a, l._buffer, l._offset, l._chunkSize);return g.callback = r, void (g.buffer = t);
                  }if (!h) return !1;i();
                }
              }var a = t && t.length,
                  o = this._chunkSize - this._offset,
                  s = 0,
                  l = this,
                  h = "function" == typeof i;if (!h) {
                var f,
                    c = [],
                    u = 0;this.on("error", function (t) {
                  f = t;
                });do {
                  var p = this._binding.writeSync(e, t, s, a, this._buffer, this._offset, o);
                } while (!this._hadError && r(p[0], p[1]));if (this._hadError) throw f;var d = n.concat(c, u);return this.close(), d;
              }var m = this._binding.write(e, t, s, a, this._buffer, this._offset, o);m.buffer = t, m.callback = r;
            }, g.inherits(o, p), g.inherits(s, p), g.inherits(l, p), g.inherits(h, p), g.inherits(f, p), g.inherits(c, p), g.inherits(u, p);
          }).call(this, t("_process"), t("buffer").Buffer);
        }, { "./binding": 9, _process: 12, _stream_transform: 92, assert: 2, buffer: 14, util: 103 }], 11: [function (t, e, i) {
          arguments[4][8][0].apply(i, arguments);
        }, { dup: 8 }], 12: [function (t, e, i) {
          function n(t) {
            if (h === setTimeout) return setTimeout(t, 0);try {
              return h(t, 0);
            } catch (e) {
              try {
                return h.call(null, t, 0);
              } catch (e) {
                return h.call(this, t, 0);
              }
            }
          }function r(t) {
            if (f === clearTimeout) return clearTimeout(t);try {
              return f(t);
            } catch (e) {
              try {
                return f.call(null, t);
              } catch (e) {
                return f.call(this, t);
              }
            }
          }function a() {
            d && u && (d = !1, u.length ? p = u.concat(p) : m = -1, p.length && o());
          }function o() {
            if (!d) {
              var t = n(a);d = !0;for (var e = p.length; e;) {
                for (u = p, p = []; ++m < e;) {
                  u && u[m].run();
                }m = -1, e = p.length;
              }u = null, d = !1, r(t);
            }
          }function s(t, e) {
            this.fun = t, this.array = e;
          }function l() {}var h,
              f,
              c = e.exports = {};!function () {
            try {
              h = setTimeout;
            } catch (t) {
              h = function h() {
                throw new Error("setTimeout is not defined");
              };
            }try {
              f = clearTimeout;
            } catch (t) {
              f = function f() {
                throw new Error("clearTimeout is not defined");
              };
            }
          }();var u,
              p = [],
              d = !1,
              m = -1;c.nextTick = function (t) {
            var e = new Array(arguments.length - 1);if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) {
              e[i - 1] = arguments[i];
            }p.push(new s(t, e)), 1 !== p.length || d || n(o);
          }, s.prototype.run = function () {
            this.fun.apply(null, this.array);
          }, c.title = "browser", c.browser = !0, c.env = {}, c.argv = [], c.version = "", c.versions = {}, c.on = l, c.addListener = l, c.once = l, c.off = l, c.removeListener = l, c.removeAllListeners = l, c.emit = l, c.binding = function (t) {
            throw new Error("process.binding is not supported");
          }, c.cwd = function () {
            return "/";
          }, c.chdir = function (t) {
            throw new Error("process.chdir is not supported");
          }, c.umask = function () {
            return 0;
          };
        }, {}], 13: [function (t, e, i) {
          var n = t("buffer").Buffer;e.exports = function (t, e) {
            if (n.isBuffer(t) && n.isBuffer(e)) {
              if ("function" == typeof t.equals) return t.equals(e);if (t.length !== e.length) return !1;for (var i = 0; i < t.length; i++) {
                if (t[i] !== e[i]) return !1;
              }return !0;
            }
          };
        }, { buffer: 14 }], 14: [function (t, e, i) {
          (function (e) {
            "use strict";
            function n() {
              return a.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
            }function r(t, e) {
              if (n() < e) throw new RangeError("Invalid typed array length");return a.TYPED_ARRAY_SUPPORT ? (t = new Uint8Array(e), t.__proto__ = a.prototype) : (null === t && (t = new a(e)), t.length = e), t;
            }function a(t, e, i) {
              if (!(a.TYPED_ARRAY_SUPPORT || this instanceof a)) return new a(t, e, i);if ("number" == typeof t) {
                if ("string" == typeof e) throw new Error("If encoding is specified then the first argument must be a string");return h(this, t);
              }return o(this, t, e, i);
            }function o(t, e, i, n) {
              if ("number" == typeof e) throw new TypeError('"value" argument must not be a number');return "undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer ? u(t, e, i, n) : "string" == typeof e ? f(t, e, i) : p(t, e);
            }function s(t) {
              if ("number" != typeof t) throw new TypeError('"size" argument must be a number');
            }function l(t, e, i, n) {
              return s(e), e <= 0 ? r(t, e) : void 0 !== i ? "string" == typeof n ? r(t, e).fill(i, n) : r(t, e).fill(i) : r(t, e);
            }function h(t, e) {
              if (s(e), t = r(t, e < 0 ? 0 : 0 | d(e)), !a.TYPED_ARRAY_SUPPORT) for (var i = 0; i < e; ++i) {
                t[i] = 0;
              }return t;
            }function f(t, e, i) {
              if ("string" == typeof i && "" !== i || (i = "utf8"), !a.isEncoding(i)) throw new TypeError('"encoding" must be a valid string encoding');var n = 0 | g(e, i);t = r(t, n);var o = t.write(e, i);return o !== n && (t = t.slice(0, o)), t;
            }function c(t, e) {
              var i = 0 | d(e.length);t = r(t, i);for (var n = 0; n < i; n += 1) {
                t[n] = 255 & e[n];
              }return t;
            }function u(t, e, i, n) {
              if (e.byteLength, i < 0 || e.byteLength < i) throw new RangeError("'offset' is out of bounds");if (e.byteLength < i + (n || 0)) throw new RangeError("'length' is out of bounds");return e = void 0 === i && void 0 === n ? new Uint8Array(e) : void 0 === n ? new Uint8Array(e, i) : new Uint8Array(e, i, n), a.TYPED_ARRAY_SUPPORT ? (t = e, t.__proto__ = a.prototype) : t = c(t, e), t;
            }function p(t, e) {
              if (a.isBuffer(e)) {
                var i = 0 | d(e.length);return t = r(t, i), 0 === t.length ? t : (e.copy(t, 0, 0, i), t);
              }if (e) {
                if ("undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer || "length" in e) return "number" != typeof e.length || V(e.length) ? r(t, 0) : c(t, e);if ("Buffer" === e.type && K(e.data)) return c(t, e.data);
              }throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
            }function d(t) {
              if (t >= n()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + n().toString(16) + " bytes");return 0 | t;
            }function m(t) {
              return +t != t && (t = 0), a.alloc(+t);
            }function g(t, e) {
              if (a.isBuffer(t)) return t.length;if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)) return t.byteLength;"string" != typeof t && (t = "" + t);var i = t.length;if (0 === i) return 0;for (var n = !1;;) {
                switch (e) {case "ascii":case "latin1":case "binary":
                    return i;case "utf8":case "utf-8":case void 0:
                    return W(t).length;case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
                    return 2 * i;case "hex":
                    return i >>> 1;case "base64":
                    return Y(t).length;default:
                    if (n) return W(t).length;e = ("" + e).toLowerCase(), n = !0;}
              }
            }function b(t, e, i) {
              var n = !1;if ((void 0 === e || e < 0) && (e = 0), e > this.length) return "";if ((void 0 === i || i > this.length) && (i = this.length), i <= 0) return "";if (i >>>= 0, e >>>= 0, i <= e) return "";for (t || (t = "utf8");;) {
                switch (t) {case "hex":
                    return P(this, e, i);case "utf8":case "utf-8":
                    return A(this, e, i);case "ascii":
                    return R(this, e, i);case "latin1":case "binary":
                    return L(this, e, i);case "base64":
                    return M(this, e, i);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
                    return C(this, e, i);default:
                    if (n) throw new TypeError("Unknown encoding: " + t);t = (t + "").toLowerCase(), n = !0;}
              }
            }function v(t, e, i) {
              var n = t[e];t[e] = t[i], t[i] = n;
            }function w(t, e, i, n, r) {
              if (0 === t.length) return -1;if ("string" == typeof i ? (n = i, i = 0) : i > 2147483647 ? i = 2147483647 : i < -2147483648 && (i = -2147483648), i = +i, isNaN(i) && (i = r ? 0 : t.length - 1), i < 0 && (i = t.length + i), i >= t.length) {
                if (r) return -1;i = t.length - 1;
              } else if (i < 0) {
                if (!r) return -1;i = 0;
              }if ("string" == typeof e && (e = a.from(e, n)), a.isBuffer(e)) return 0 === e.length ? -1 : _(t, e, i, n, r);if ("number" == typeof e) return e &= 255, a.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? r ? Uint8Array.prototype.indexOf.call(t, e, i) : Uint8Array.prototype.lastIndexOf.call(t, e, i) : _(t, [e], i, n, r);throw new TypeError("val must be string, number or Buffer");
            }function _(t, e, i, n, r) {
              function a(t, e) {
                return 1 === o ? t[e] : t.readUInt16BE(e * o);
              }var o = 1,
                  s = t.length,
                  l = e.length;if (void 0 !== n && ("ucs2" === (n = String(n).toLowerCase()) || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
                if (t.length < 2 || e.length < 2) return -1;o = 2, s /= 2, l /= 2, i /= 2;
              }var h;if (r) {
                var f = -1;for (h = i; h < s; h++) {
                  if (a(t, h) === a(e, f === -1 ? 0 : h - f)) {
                    if (f === -1 && (f = h), h - f + 1 === l) return f * o;
                  } else f !== -1 && (h -= h - f), f = -1;
                }
              } else for (i + l > s && (i = s - l), h = i; h >= 0; h--) {
                for (var c = !0, u = 0; u < l; u++) {
                  if (a(t, h + u) !== a(e, u)) {
                    c = !1;break;
                  }
                }if (c) return h;
              }return -1;
            }function y(t, e, i, n) {
              i = Number(i) || 0;var r = t.length - i;n ? (n = Number(n)) > r && (n = r) : n = r;var a = e.length;if (a % 2 != 0) throw new TypeError("Invalid hex string");n > a / 2 && (n = a / 2);for (var o = 0; o < n; ++o) {
                var s = parseInt(e.substr(2 * o, 2), 16);if (isNaN(s)) return o;t[i + o] = s;
              }return o;
            }function x(t, e, i, n) {
              return X(W(e, t.length - i), t, i, n);
            }function k(t, e, i, n) {
              return X(q(e), t, i, n);
            }function E(t, e, i, n) {
              return k(t, e, i, n);
            }function S(t, e, i, n) {
              return X(Y(e), t, i, n);
            }function I(t, e, i, n) {
              return X(Z(e, t.length - i), t, i, n);
            }function M(t, e, i) {
              return 0 === e && i === t.length ? J.fromByteArray(t) : J.fromByteArray(t.slice(e, i));
            }function A(t, e, i) {
              i = Math.min(t.length, i);for (var n = [], r = e; r < i;) {
                var a = t[r],
                    o = null,
                    s = a > 239 ? 4 : a > 223 ? 3 : a > 191 ? 2 : 1;if (r + s <= i) {
                  var l, h, f, c;switch (s) {case 1:
                      a < 128 && (o = a);break;case 2:
                      l = t[r + 1], 128 == (192 & l) && (c = (31 & a) << 6 | 63 & l) > 127 && (o = c);break;case 3:
                      l = t[r + 1], h = t[r + 2], 128 == (192 & l) && 128 == (192 & h) && (c = (15 & a) << 12 | (63 & l) << 6 | 63 & h) > 2047 && (c < 55296 || c > 57343) && (o = c);break;case 4:
                      l = t[r + 1], h = t[r + 2], f = t[r + 3], 128 == (192 & l) && 128 == (192 & h) && 128 == (192 & f) && (c = (15 & a) << 18 | (63 & l) << 12 | (63 & h) << 6 | 63 & f) > 65535 && c < 1114112 && (o = c);}
                }null === o ? (o = 65533, s = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | 1023 & o), n.push(o), r += s;
              }return T(n);
            }function T(t) {
              var e = t.length;if (e <= Q) return String.fromCharCode.apply(String, t);for (var i = "", n = 0; n < e;) {
                i += String.fromCharCode.apply(String, t.slice(n, n += Q));
              }return i;
            }function R(t, e, i) {
              var n = "";i = Math.min(t.length, i);for (var r = e; r < i; ++r) {
                n += String.fromCharCode(127 & t[r]);
              }return n;
            }function L(t, e, i) {
              var n = "";i = Math.min(t.length, i);for (var r = e; r < i; ++r) {
                n += String.fromCharCode(t[r]);
              }return n;
            }function P(t, e, i) {
              var n = t.length;(!e || e < 0) && (e = 0), (!i || i < 0 || i > n) && (i = n);for (var r = "", a = e; a < i; ++a) {
                r += G(t[a]);
              }return r;
            }function C(t, e, i) {
              for (var n = t.slice(e, i), r = "", a = 0; a < n.length; a += 2) {
                r += String.fromCharCode(n[a] + 256 * n[a + 1]);
              }return r;
            }function B(t, e, i) {
              if (t % 1 != 0 || t < 0) throw new RangeError("offset is not uint");if (t + e > i) throw new RangeError("Trying to access beyond buffer length");
            }function z(t, e, i, n, r, o) {
              if (!a.isBuffer(t)) throw new TypeError('"buffer" argument must be a Buffer instance');if (e > r || e < o) throw new RangeError('"value" argument is out of bounds');if (i + n > t.length) throw new RangeError("Index out of range");
            }function O(t, e, i, n) {
              e < 0 && (e = 65535 + e + 1);for (var r = 0, a = Math.min(t.length - i, 2); r < a; ++r) {
                t[i + r] = (e & 255 << 8 * (n ? r : 1 - r)) >>> 8 * (n ? r : 1 - r);
              }
            }function D(t, e, i, n) {
              e < 0 && (e = 4294967295 + e + 1);for (var r = 0, a = Math.min(t.length - i, 4); r < a; ++r) {
                t[i + r] = e >>> 8 * (n ? r : 3 - r) & 255;
              }
            }function U(t, e, i, n, r, a) {
              if (i + n > t.length) throw new RangeError("Index out of range");if (i < 0) throw new RangeError("Index out of range");
            }function N(t, e, i, n, r) {
              return r || U(t, e, i, 4, 3.4028234663852886e38, -3.4028234663852886e38), $.write(t, e, i, n, 23, 4), i + 4;
            }function F(t, e, i, n, r) {
              return r || U(t, e, i, 8, 1.7976931348623157e308, -1.7976931348623157e308), $.write(t, e, i, n, 52, 8), i + 8;
            }function j(t) {
              if (t = H(t).replace(tt, ""), t.length < 2) return "";for (; t.length % 4 != 0;) {
                t += "=";
              }return t;
            }function H(t) {
              return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "");
            }function G(t) {
              return t < 16 ? "0" + t.toString(16) : t.toString(16);
            }function W(t, e) {
              e = e || 1 / 0;for (var i, n = t.length, r = null, a = [], o = 0; o < n; ++o) {
                if ((i = t.charCodeAt(o)) > 55295 && i < 57344) {
                  if (!r) {
                    if (i > 56319) {
                      (e -= 3) > -1 && a.push(239, 191, 189);continue;
                    }if (o + 1 === n) {
                      (e -= 3) > -1 && a.push(239, 191, 189);continue;
                    }r = i;continue;
                  }if (i < 56320) {
                    (e -= 3) > -1 && a.push(239, 191, 189), r = i;continue;
                  }i = 65536 + (r - 55296 << 10 | i - 56320);
                } else r && (e -= 3) > -1 && a.push(239, 191, 189);if (r = null, i < 128) {
                  if ((e -= 1) < 0) break;a.push(i);
                } else if (i < 2048) {
                  if ((e -= 2) < 0) break;a.push(i >> 6 | 192, 63 & i | 128);
                } else if (i < 65536) {
                  if ((e -= 3) < 0) break;a.push(i >> 12 | 224, i >> 6 & 63 | 128, 63 & i | 128);
                } else {
                  if (!(i < 1114112)) throw new Error("Invalid code point");if ((e -= 4) < 0) break;a.push(i >> 18 | 240, i >> 12 & 63 | 128, i >> 6 & 63 | 128, 63 & i | 128);
                }
              }return a;
            }function q(t) {
              for (var e = [], i = 0; i < t.length; ++i) {
                e.push(255 & t.charCodeAt(i));
              }return e;
            }function Z(t, e) {
              for (var i, n, r, a = [], o = 0; o < t.length && !((e -= 2) < 0); ++o) {
                i = t.charCodeAt(o), n = i >> 8, r = i % 256, a.push(r), a.push(n);
              }return a;
            }function Y(t) {
              return J.toByteArray(j(t));
            }function X(t, e, i, n) {
              for (var r = 0; r < n && !(r + i >= e.length || r >= t.length); ++r) {
                e[r + i] = t[r];
              }return r;
            }function V(t) {
              return t !== t;
            }var J = t("base64-js"),
                $ = t("ieee754"),
                K = t("isarray");i.Buffer = a, i.SlowBuffer = m, i.INSPECT_MAX_BYTES = 50, a.TYPED_ARRAY_SUPPORT = void 0 !== e.TYPED_ARRAY_SUPPORT ? e.TYPED_ARRAY_SUPPORT : function () {
              try {
                var t = new Uint8Array(1);return t.__proto__ = { __proto__: Uint8Array.prototype, foo: function foo() {
                    return 42;
                  } }, 42 === t.foo() && "function" == typeof t.subarray && 0 === t.subarray(1, 1).byteLength;
              } catch (t) {
                return !1;
              }
            }(), i.kMaxLength = n(), a.poolSize = 8192, a._augment = function (t) {
              return t.__proto__ = a.prototype, t;
            }, a.from = function (t, e, i) {
              return o(null, t, e, i);
            }, a.TYPED_ARRAY_SUPPORT && (a.prototype.__proto__ = Uint8Array.prototype, a.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && a[Symbol.species] === a && Object.defineProperty(a, Symbol.species, { value: null, configurable: !0 })), a.alloc = function (t, e, i) {
              return l(null, t, e, i);
            }, a.allocUnsafe = function (t) {
              return h(null, t);
            }, a.allocUnsafeSlow = function (t) {
              return h(null, t);
            }, a.isBuffer = function (t) {
              return !(null == t || !t._isBuffer);
            }, a.compare = function (t, e) {
              if (!a.isBuffer(t) || !a.isBuffer(e)) throw new TypeError("Arguments must be Buffers");if (t === e) return 0;for (var i = t.length, n = e.length, r = 0, o = Math.min(i, n); r < o; ++r) {
                if (t[r] !== e[r]) {
                  i = t[r], n = e[r];break;
                }
              }return i < n ? -1 : n < i ? 1 : 0;
            }, a.isEncoding = function (t) {
              switch (String(t).toLowerCase()) {case "hex":case "utf8":case "utf-8":case "ascii":case "latin1":case "binary":case "base64":case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
                  return !0;default:
                  return !1;}
            }, a.concat = function (t, e) {
              if (!K(t)) throw new TypeError('"list" argument must be an Array of Buffers');if (0 === t.length) return a.alloc(0);var i;if (void 0 === e) for (e = 0, i = 0; i < t.length; ++i) {
                e += t[i].length;
              }var n = a.allocUnsafe(e),
                  r = 0;for (i = 0; i < t.length; ++i) {
                var o = t[i];if (!a.isBuffer(o)) throw new TypeError('"list" argument must be an Array of Buffers');o.copy(n, r), r += o.length;
              }return n;
            }, a.byteLength = g, a.prototype._isBuffer = !0, a.prototype.swap16 = function () {
              var t = this.length;if (t % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");for (var e = 0; e < t; e += 2) {
                v(this, e, e + 1);
              }return this;
            }, a.prototype.swap32 = function () {
              var t = this.length;if (t % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");for (var e = 0; e < t; e += 4) {
                v(this, e, e + 3), v(this, e + 1, e + 2);
              }return this;
            }, a.prototype.swap64 = function () {
              var t = this.length;if (t % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");for (var e = 0; e < t; e += 8) {
                v(this, e, e + 7), v(this, e + 1, e + 6), v(this, e + 2, e + 5), v(this, e + 3, e + 4);
              }return this;
            }, a.prototype.toString = function () {
              var t = 0 | this.length;return 0 === t ? "" : 0 === arguments.length ? A(this, 0, t) : b.apply(this, arguments);
            }, a.prototype.equals = function (t) {
              if (!a.isBuffer(t)) throw new TypeError("Argument must be a Buffer");return this === t || 0 === a.compare(this, t);
            }, a.prototype.inspect = function () {
              var t = "",
                  e = i.INSPECT_MAX_BYTES;return this.length > 0 && (t = this.toString("hex", 0, e).match(/.{2}/g).join(" "), this.length > e && (t += " ... ")), "<Buffer " + t + ">";
            }, a.prototype.compare = function (t, e, i, n, r) {
              if (!a.isBuffer(t)) throw new TypeError("Argument must be a Buffer");if (void 0 === e && (e = 0), void 0 === i && (i = t ? t.length : 0), void 0 === n && (n = 0), void 0 === r && (r = this.length), e < 0 || i > t.length || n < 0 || r > this.length) throw new RangeError("out of range index");if (n >= r && e >= i) return 0;if (n >= r) return -1;if (e >= i) return 1;if (e >>>= 0, i >>>= 0, n >>>= 0, r >>>= 0, this === t) return 0;for (var o = r - n, s = i - e, l = Math.min(o, s), h = this.slice(n, r), f = t.slice(e, i), c = 0; c < l; ++c) {
                if (h[c] !== f[c]) {
                  o = h[c], s = f[c];break;
                }
              }return o < s ? -1 : s < o ? 1 : 0;
            }, a.prototype.includes = function (t, e, i) {
              return this.indexOf(t, e, i) !== -1;
            }, a.prototype.indexOf = function (t, e, i) {
              return w(this, t, e, i, !0);
            }, a.prototype.lastIndexOf = function (t, e, i) {
              return w(this, t, e, i, !1);
            }, a.prototype.write = function (t, e, i, n) {
              if (void 0 === e) n = "utf8", i = this.length, e = 0;else if (void 0 === i && "string" == typeof e) n = e, i = this.length, e = 0;else {
                if (!isFinite(e)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e |= 0, isFinite(i) ? (i |= 0, void 0 === n && (n = "utf8")) : (n = i, i = void 0);
              }var r = this.length - e;if ((void 0 === i || i > r) && (i = r), t.length > 0 && (i < 0 || e < 0) || e > this.length) throw new RangeError("Attempt to write outside buffer bounds");n || (n = "utf8");for (var a = !1;;) {
                switch (n) {case "hex":
                    return y(this, t, e, i);case "utf8":case "utf-8":
                    return x(this, t, e, i);case "ascii":
                    return k(this, t, e, i);case "latin1":case "binary":
                    return E(this, t, e, i);case "base64":
                    return S(this, t, e, i);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
                    return I(this, t, e, i);default:
                    if (a) throw new TypeError("Unknown encoding: " + n);n = ("" + n).toLowerCase(), a = !0;}
              }
            }, a.prototype.toJSON = function () {
              return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
            };var Q = 4096;a.prototype.slice = function (t, e) {
              var i = this.length;t = ~~t, e = void 0 === e ? i : ~~e, t < 0 ? (t += i) < 0 && (t = 0) : t > i && (t = i), e < 0 ? (e += i) < 0 && (e = 0) : e > i && (e = i), e < t && (e = t);var n;if (a.TYPED_ARRAY_SUPPORT) n = this.subarray(t, e), n.__proto__ = a.prototype;else {
                var r = e - t;n = new a(r, void 0);for (var o = 0; o < r; ++o) {
                  n[o] = this[o + t];
                }
              }return n;
            }, a.prototype.readUIntLE = function (t, e, i) {
              t |= 0, e |= 0, i || B(t, e, this.length);for (var n = this[t], r = 1, a = 0; ++a < e && (r *= 256);) {
                n += this[t + a] * r;
              }return n;
            }, a.prototype.readUIntBE = function (t, e, i) {
              t |= 0, e |= 0, i || B(t, e, this.length);for (var n = this[t + --e], r = 1; e > 0 && (r *= 256);) {
                n += this[t + --e] * r;
              }return n;
            }, a.prototype.readUInt8 = function (t, e) {
              return e || B(t, 1, this.length), this[t];
            }, a.prototype.readUInt16LE = function (t, e) {
              return e || B(t, 2, this.length), this[t] | this[t + 1] << 8;
            }, a.prototype.readUInt16BE = function (t, e) {
              return e || B(t, 2, this.length), this[t] << 8 | this[t + 1];
            }, a.prototype.readUInt32LE = function (t, e) {
              return e || B(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3];
            }, a.prototype.readUInt32BE = function (t, e) {
              return e || B(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
            }, a.prototype.readIntLE = function (t, e, i) {
              t |= 0, e |= 0, i || B(t, e, this.length);for (var n = this[t], r = 1, a = 0; ++a < e && (r *= 256);) {
                n += this[t + a] * r;
              }return r *= 128, n >= r && (n -= Math.pow(2, 8 * e)), n;
            }, a.prototype.readIntBE = function (t, e, i) {
              t |= 0, e |= 0, i || B(t, e, this.length);for (var n = e, r = 1, a = this[t + --n]; n > 0 && (r *= 256);) {
                a += this[t + --n] * r;
              }return r *= 128, a >= r && (a -= Math.pow(2, 8 * e)), a;
            }, a.prototype.readInt8 = function (t, e) {
              return e || B(t, 1, this.length), 128 & this[t] ? (255 - this[t] + 1) * -1 : this[t];
            }, a.prototype.readInt16LE = function (t, e) {
              e || B(t, 2, this.length);var i = this[t] | this[t + 1] << 8;return 32768 & i ? 4294901760 | i : i;
            }, a.prototype.readInt16BE = function (t, e) {
              e || B(t, 2, this.length);var i = this[t + 1] | this[t] << 8;return 32768 & i ? 4294901760 | i : i;
            }, a.prototype.readInt32LE = function (t, e) {
              return e || B(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
            }, a.prototype.readInt32BE = function (t, e) {
              return e || B(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
            }, a.prototype.readFloatLE = function (t, e) {
              return e || B(t, 4, this.length), $.read(this, t, !0, 23, 4);
            }, a.prototype.readFloatBE = function (t, e) {
              return e || B(t, 4, this.length), $.read(this, t, !1, 23, 4);
            }, a.prototype.readDoubleLE = function (t, e) {
              return e || B(t, 8, this.length), $.read(this, t, !0, 52, 8);
            }, a.prototype.readDoubleBE = function (t, e) {
              return e || B(t, 8, this.length), $.read(this, t, !1, 52, 8);
            }, a.prototype.writeUIntLE = function (t, e, i, n) {
              if (t = +t, e |= 0, i |= 0, !n) {
                z(this, t, e, i, Math.pow(2, 8 * i) - 1, 0);
              }var r = 1,
                  a = 0;for (this[e] = 255 & t; ++a < i && (r *= 256);) {
                this[e + a] = t / r & 255;
              }return e + i;
            }, a.prototype.writeUIntBE = function (t, e, i, n) {
              if (t = +t, e |= 0, i |= 0, !n) {
                z(this, t, e, i, Math.pow(2, 8 * i) - 1, 0);
              }var r = i - 1,
                  a = 1;for (this[e + r] = 255 & t; --r >= 0 && (a *= 256);) {
                this[e + r] = t / a & 255;
              }return e + i;
            }, a.prototype.writeUInt8 = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 1, 255, 0), a.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[e] = 255 & t, e + 1;
            }, a.prototype.writeUInt16LE = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 2, 65535, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : O(this, t, e, !0), e + 2;
            }, a.prototype.writeUInt16BE = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 2, 65535, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : O(this, t, e, !1), e + 2;
            }, a.prototype.writeUInt32LE = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 4, 4294967295, 0), a.TYPED_ARRAY_SUPPORT ? (this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = 255 & t) : D(this, t, e, !0), e + 4;
            }, a.prototype.writeUInt32BE = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 4, 4294967295, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : D(this, t, e, !1), e + 4;
            }, a.prototype.writeIntLE = function (t, e, i, n) {
              if (t = +t, e |= 0, !n) {
                var r = Math.pow(2, 8 * i - 1);z(this, t, e, i, r - 1, -r);
              }var a = 0,
                  o = 1,
                  s = 0;for (this[e] = 255 & t; ++a < i && (o *= 256);) {
                t < 0 && 0 === s && 0 !== this[e + a - 1] && (s = 1), this[e + a] = (t / o >> 0) - s & 255;
              }return e + i;
            }, a.prototype.writeIntBE = function (t, e, i, n) {
              if (t = +t, e |= 0, !n) {
                var r = Math.pow(2, 8 * i - 1);z(this, t, e, i, r - 1, -r);
              }var a = i - 1,
                  o = 1,
                  s = 0;for (this[e + a] = 255 & t; --a >= 0 && (o *= 256);) {
                t < 0 && 0 === s && 0 !== this[e + a + 1] && (s = 1), this[e + a] = (t / o >> 0) - s & 255;
              }return e + i;
            }, a.prototype.writeInt8 = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 1, 127, -128), a.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), t < 0 && (t = 255 + t + 1), this[e] = 255 & t, e + 1;
            }, a.prototype.writeInt16LE = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 2, 32767, -32768), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : O(this, t, e, !0), e + 2;
            }, a.prototype.writeInt16BE = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 2, 32767, -32768), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : O(this, t, e, !1), e + 2;
            }, a.prototype.writeInt32LE = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 4, 2147483647, -2147483648), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24) : D(this, t, e, !0), e + 4;
            }, a.prototype.writeInt32BE = function (t, e, i) {
              return t = +t, e |= 0, i || z(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : D(this, t, e, !1), e + 4;
            }, a.prototype.writeFloatLE = function (t, e, i) {
              return N(this, t, e, !0, i);
            }, a.prototype.writeFloatBE = function (t, e, i) {
              return N(this, t, e, !1, i);
            }, a.prototype.writeDoubleLE = function (t, e, i) {
              return F(this, t, e, !0, i);
            }, a.prototype.writeDoubleBE = function (t, e, i) {
              return F(this, t, e, !1, i);
            }, a.prototype.copy = function (t, e, i, n) {
              if (i || (i = 0), n || 0 === n || (n = this.length), e >= t.length && (e = t.length), e || (e = 0), n > 0 && n < i && (n = i), n === i) return 0;if (0 === t.length || 0 === this.length) return 0;if (e < 0) throw new RangeError("targetStart out of bounds");if (i < 0 || i >= this.length) throw new RangeError("sourceStart out of bounds");if (n < 0) throw new RangeError("sourceEnd out of bounds");n > this.length && (n = this.length), t.length - e < n - i && (n = t.length - e + i);var r,
                  o = n - i;if (this === t && i < e && e < n) for (r = o - 1; r >= 0; --r) {
                t[r + e] = this[r + i];
              } else if (o < 1e3 || !a.TYPED_ARRAY_SUPPORT) for (r = 0; r < o; ++r) {
                t[r + e] = this[r + i];
              } else Uint8Array.prototype.set.call(t, this.subarray(i, i + o), e);return o;
            }, a.prototype.fill = function (t, e, i, n) {
              if ("string" == typeof t) {
                if ("string" == typeof e ? (n = e, e = 0, i = this.length) : "string" == typeof i && (n = i, i = this.length), 1 === t.length) {
                  var r = t.charCodeAt(0);r < 256 && (t = r);
                }if (void 0 !== n && "string" != typeof n) throw new TypeError("encoding must be a string");if ("string" == typeof n && !a.isEncoding(n)) throw new TypeError("Unknown encoding: " + n);
              } else "number" == typeof t && (t &= 255);if (e < 0 || this.length < e || this.length < i) throw new RangeError("Out of range index");if (i <= e) return this;e >>>= 0, i = void 0 === i ? this.length : i >>> 0, t || (t = 0);var o;if ("number" == typeof t) for (o = e; o < i; ++o) {
                this[o] = t;
              } else {
                var s = a.isBuffer(t) ? t : W(new a(t, n).toString()),
                    l = s.length;for (o = 0; o < i - e; ++o) {
                  this[o + e] = s[o % l];
                }
              }return this;
            };var tt = /[^+\/0-9A-Za-z-_]/g;
          }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : void 0 !== window ? window : {});
        }, { "base64-js": 3, ieee754: 30, isarray: 35 }], 15: [function (t, e, i) {
          (function (t) {
            function e(t) {
              return Array.isArray ? Array.isArray(t) : "[object Array]" === g(t);
            }function n(t) {
              return "boolean" == typeof t;
            }function r(t) {
              return null === t;
            }function a(t) {
              return null == t;
            }function o(t) {
              return "number" == typeof t;
            }function s(t) {
              return "string" == typeof t;
            }function l(t) {
              return "symbol" === (void 0 === t ? "undefined" : _typeof(t));
            }function h(t) {
              return void 0 === t;
            }function f(t) {
              return "[object RegExp]" === g(t);
            }function c(t) {
              return "object" === (void 0 === t ? "undefined" : _typeof(t)) && null !== t;
            }function u(t) {
              return "[object Date]" === g(t);
            }function p(t) {
              return "[object Error]" === g(t) || t instanceof Error;
            }function d(t) {
              return "function" == typeof t;
            }function m(t) {
              return null === t || "boolean" == typeof t || "number" == typeof t || "string" == typeof t || "symbol" === (void 0 === t ? "undefined" : _typeof(t)) || void 0 === t;
            }function g(t) {
              return Object.prototype.toString.call(t);
            }i.isArray = e, i.isBoolean = n, i.isNull = r, i.isNullOrUndefined = a, i.isNumber = o, i.isString = s, i.isSymbol = l, i.isUndefined = h, i.isRegExp = f, i.isObject = c, i.isDate = u, i.isError = p, i.isFunction = d, i.isPrimitive = m, i.isBuffer = t.isBuffer;
          }).call(this, { isBuffer: t("../../is-buffer/index.js") });
        }, { "../../is-buffer/index.js": 33 }], 16: [function (t, e, i) {
          (function (i, n) {
            (function () {
              "use strict";
              function r(t) {
                return "function" == typeof t || "object" === (void 0 === t ? "undefined" : _typeof(t)) && null !== t;
              }function a(t) {
                return "function" == typeof t;
              }function o(t) {
                W = t;
              }function s(t) {
                X = t;
              }function l() {
                return function () {
                  G(f);
                };
              }function h() {
                return function () {
                  setTimeout(f, 1);
                };
              }function f() {
                for (var t = 0; t < Y; t += 2) {
                  (0, tt[t])(tt[t + 1]), tt[t] = void 0, tt[t + 1] = void 0;
                }Y = 0;
              }function c(t, e) {
                var i = this,
                    n = new this.constructor(p);void 0 === n[nt] && P(n);var r = i._state;if (r) {
                  var a = arguments[r - 1];X(function () {
                    T(r, n, a, i._result);
                  });
                } else S(i, n, t, e);return n;
              }function u(t) {
                var e = this;if (t && "object" === (void 0 === t ? "undefined" : _typeof(t)) && t.constructor === e) return t;var i = new e(p);return y(i, t), i;
              }function p() {}function d() {
                return new TypeError("You cannot resolve a promise with itself");
              }function m() {
                return new TypeError("A promises callback cannot return that same promise.");
              }function g(t) {
                try {
                  return t.then;
                } catch (t) {
                  return st.error = t, st;
                }
              }function b(t, e, i, n) {
                try {
                  t.call(e, i, n);
                } catch (t) {
                  return t;
                }
              }function v(t, e, i) {
                X(function (t) {
                  var n = !1,
                      r = b(i, e, function (i) {
                    n || (n = !0, e !== i ? y(t, i) : k(t, i));
                  }, function (e) {
                    n || (n = !0, E(t, e));
                  }, "Settle: " + (t._label || " unknown promise"));!n && r && (n = !0, E(t, r));
                }, t);
              }function w(t, e) {
                e._state === at ? k(t, e._result) : e._state === ot ? E(t, e._result) : S(e, void 0, function (e) {
                  y(t, e);
                }, function (e) {
                  E(t, e);
                });
              }function _(t, e, i) {
                e.constructor === t.constructor && i === et && constructor.resolve === it ? w(t, e) : i === st ? E(t, st.error) : void 0 === i ? k(t, e) : a(i) ? v(t, e, i) : k(t, e);
              }function y(t, e) {
                t === e ? E(t, d()) : r(e) ? _(t, e, g(e)) : k(t, e);
              }function x(t) {
                t._onerror && t._onerror(t._result), I(t);
              }function k(t, e) {
                t._state === rt && (t._result = e, t._state = at, 0 !== t._subscribers.length && X(I, t));
              }function E(t, e) {
                t._state === rt && (t._state = ot, t._result = e, X(x, t));
              }function S(t, e, i, n) {
                var r = t._subscribers,
                    a = r.length;t._onerror = null, r[a] = e, r[a + at] = i, r[a + ot] = n, 0 === a && t._state && X(I, t);
              }function I(t) {
                var e = t._subscribers,
                    i = t._state;if (0 !== e.length) {
                  for (var n, r, a = t._result, o = 0; o < e.length; o += 3) {
                    n = e[o], r = e[o + i], n ? T(i, n, r, a) : r(a);
                  }t._subscribers.length = 0;
                }
              }function M() {
                this.error = null;
              }function A(t, e) {
                try {
                  return t(e);
                } catch (t) {
                  return lt.error = t, lt;
                }
              }function T(t, e, i, n) {
                var r,
                    o,
                    s,
                    l,
                    h = a(i);if (h) {
                  if (r = A(i, n), r === lt ? (l = !0, o = r.error, r = null) : s = !0, e === r) return void E(e, m());
                } else r = n, s = !0;e._state !== rt || (h && s ? y(e, r) : l ? E(e, o) : t === at ? k(e, r) : t === ot && E(e, r));
              }function R(t, e) {
                try {
                  e(function (e) {
                    y(t, e);
                  }, function (e) {
                    E(t, e);
                  });
                } catch (e) {
                  E(t, e);
                }
              }function L() {
                return ht++;
              }function P(t) {
                t[nt] = ht++, t._state = void 0, t._result = void 0, t._subscribers = [];
              }function C(t) {
                return new dt(this, t).promise;
              }function B(t) {
                var e = this;return new e(Z(t) ? function (i, n) {
                  for (var r = t.length, a = 0; a < r; a++) {
                    e.resolve(t[a]).then(i, n);
                  }
                } : function (t, e) {
                  e(new TypeError("You must pass an array to race."));
                });
              }function z(t) {
                var e = this,
                    i = new e(p);return E(i, t), i;
              }function O() {
                throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
              }function D() {
                throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
              }function U(t) {
                this[nt] = L(), this._result = this._state = void 0, this._subscribers = [], p !== t && ("function" != typeof t && O(), this instanceof U ? R(this, t) : D());
              }function N(t, e) {
                this._instanceConstructor = t, this.promise = new t(p), this.promise[nt] || P(this.promise), Z(e) ? (this._input = e, this.length = e.length, this._remaining = e.length, this._result = new Array(this.length), 0 === this.length ? k(this.promise, this._result) : (this.length = this.length || 0, this._enumerate(), 0 === this._remaining && k(this.promise, this._result))) : E(this.promise, F());
              }function F() {
                return new Error("Array Methods must be provided an Array");
              }function j() {
                var t;if (void 0 !== n) t = n;else if ("undefined" != typeof self) t = self;else try {
                  t = Function("return this")();
                } catch (t) {
                  throw new Error("polyfill failed because global object is unavailable in this environment");
                }var e = t.Promise;e && "[object Promise]" === Object.prototype.toString.call(e.resolve()) && !e.cast || (t.Promise = pt);
              }var H;H = Array.isArray ? Array.isArray : function (t) {
                return "[object Array]" === Object.prototype.toString.call(t);
              };var G,
                  W,
                  q,
                  Z = H,
                  Y = 0,
                  X = function X(t, e) {
                tt[Y] = t, tt[Y + 1] = e, 2 === (Y += 2) && (W ? W(f) : q());
              },
                  V = void 0 !== window ? window : void 0,
                  J = V || {},
                  $ = J.MutationObserver || J.WebKitMutationObserver,
                  K = "undefined" == typeof self && void 0 !== i && "[object process]" === {}.toString.call(i),
                  Q = "undefined" != typeof Uint8ClampedArray && "undefined" != typeof importScripts && "undefined" != typeof MessageChannel,
                  tt = new Array(1e3);q = K ? function () {
                return function () {
                  i.nextTick(f);
                };
              }() : $ ? function () {
                var t = 0,
                    e = new $(f),
                    i = document.createTextNode("");return e.observe(i, { characterData: !0 }), function () {
                  i.data = t = ++t % 2;
                };
              }() : Q ? function () {
                var t = new MessageChannel();return t.port1.onmessage = f, function () {
                  t.port2.postMessage(0);
                };
              }() : void 0 === V && "function" == typeof t ? function () {
                try {
                  var e = t,
                      i = e("vertx");return G = i.runOnLoop || i.runOnContext, l();
                } catch (t) {
                  return h();
                }
              }() : h();var et = c,
                  it = u,
                  nt = Math.random().toString(36).substring(16),
                  rt = void 0,
                  at = 1,
                  ot = 2,
                  st = new M(),
                  lt = new M(),
                  ht = 0,
                  ft = C,
                  ct = B,
                  ut = z,
                  pt = U;U.all = ft, U.race = ct, U.resolve = it, U.reject = ut, U._setScheduler = o, U._setAsap = s, U._asap = X, U.prototype = { constructor: U, then: et, catch: function _catch(t) {
                  return this.then(null, t);
                } };var dt = N;N.prototype._enumerate = function () {
                for (var t = this.length, e = this._input, i = 0; this._state === rt && i < t; i++) {
                  this._eachEntry(e[i], i);
                }
              }, N.prototype._eachEntry = function (t, e) {
                var i = this._instanceConstructor,
                    n = i.resolve;if (n === it) {
                  var r = g(t);if (r === et && t._state !== rt) this._settledAt(t._state, e, t._result);else if ("function" != typeof r) this._remaining--, this._result[e] = t;else if (i === pt) {
                    var a = new i(p);_(a, t, r), this._willSettleAt(a, e);
                  } else this._willSettleAt(new i(function (e) {
                    e(t);
                  }), e);
                } else this._willSettleAt(n(t), e);
              }, N.prototype._settledAt = function (t, e, i) {
                var n = this.promise;n._state === rt && (this._remaining--, t === ot ? E(n, i) : this._result[e] = i), 0 === this._remaining && k(n, this._result);
              }, N.prototype._willSettleAt = function (t, e) {
                var i = this;S(t, void 0, function (t) {
                  i._settledAt(at, e, t);
                }, function (t) {
                  i._settledAt(ot, e, t);
                });
              };var mt = j,
                  gt = { Promise: pt, polyfill: mt };"function" == typeof define && define.amd ? define(function () {
                return gt;
              }) : void 0 !== e && e.exports ? e.exports = gt : void 0 !== this && (this.ES6Promise = gt), mt();
            }).call(this);
          }).call(this, t("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : void 0 !== window ? window : {});
        }, { _process: 12 }], 17: [function (t, e, i) {
          function n() {
            this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0;
          }function r(t) {
            return "function" == typeof t;
          }function a(t) {
            return "number" == typeof t;
          }function o(t) {
            return "object" === (void 0 === t ? "undefined" : _typeof(t)) && null !== t;
          }function s(t) {
            return void 0 === t;
          }e.exports = n, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._maxListeners = void 0, n.defaultMaxListeners = 10, n.prototype.setMaxListeners = function (t) {
            if (!a(t) || t < 0 || isNaN(t)) throw TypeError("n must be a positive number");return this._maxListeners = t, this;
          }, n.prototype.emit = function (t) {
            var e, i, n, a, l, h;if (this._events || (this._events = {}), "error" === t && (!this._events.error || o(this._events.error) && !this._events.error.length)) {
              if ((e = arguments[1]) instanceof Error) throw e;var f = new Error('Uncaught, unspecified "error" event. (' + e + ")");throw f.context = e, f;
            }if (i = this._events[t], s(i)) return !1;if (r(i)) switch (arguments.length) {case 1:
                i.call(this);break;case 2:
                i.call(this, arguments[1]);break;case 3:
                i.call(this, arguments[1], arguments[2]);break;default:
                a = Array.prototype.slice.call(arguments, 1), i.apply(this, a);} else if (o(i)) for (a = Array.prototype.slice.call(arguments, 1), h = i.slice(), n = h.length, l = 0; l < n; l++) {
              h[l].apply(this, a);
            }return !0;
          }, n.prototype.addListener = function (t, e) {
            var i;if (!r(e)) throw TypeError("listener must be a function");return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", t, r(e.listener) ? e.listener : e), this._events[t] ? o(this._events[t]) ? this._events[t].push(e) : this._events[t] = [this._events[t], e] : this._events[t] = e, o(this._events[t]) && !this._events[t].warned && (i = s(this._maxListeners) ? n.defaultMaxListeners : this._maxListeners) && i > 0 && this._events[t].length > i && (this._events[t].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[t].length), "function" == typeof console.trace && console.trace()), this;
          }, n.prototype.on = n.prototype.addListener, n.prototype.once = function (t, e) {
            function i() {
              this.removeListener(t, i), n || (n = !0, e.apply(this, arguments));
            }if (!r(e)) throw TypeError("listener must be a function");var n = !1;return i.listener = e, this.on(t, i), this;
          }, n.prototype.removeListener = function (t, e) {
            var i, n, a, s;if (!r(e)) throw TypeError("listener must be a function");if (!this._events || !this._events[t]) return this;if (i = this._events[t], a = i.length, n = -1, i === e || r(i.listener) && i.listener === e) delete this._events[t], this._events.removeListener && this.emit("removeListener", t, e);else if (o(i)) {
              for (s = a; s-- > 0;) {
                if (i[s] === e || i[s].listener && i[s].listener === e) {
                  n = s;break;
                }
              }if (n < 0) return this;1 === i.length ? (i.length = 0, delete this._events[t]) : i.splice(n, 1), this._events.removeListener && this.emit("removeListener", t, e);
            }return this;
          }, n.prototype.removeAllListeners = function (t) {
            var e, i;if (!this._events) return this;if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[t] && delete this._events[t], this;if (0 === arguments.length) {
              for (e in this._events) {
                "removeListener" !== e && this.removeAllListeners(e);
              }return this.removeAllListeners("removeListener"), this._events = {}, this;
            }if (i = this._events[t], r(i)) this.removeListener(t, i);else if (i) for (; i.length;) {
              this.removeListener(t, i[i.length - 1]);
            }return delete this._events[t], this;
          }, n.prototype.listeners = function (t) {
            return this._events && this._events[t] ? r(this._events[t]) ? [this._events[t]] : this._events[t].slice() : [];
          }, n.prototype.listenerCount = function (t) {
            if (this._events) {
              var e = this._events[t];if (r(e)) return 1;if (e) return e.length;
            }return 0;
          }, n.listenerCount = function (t, e) {
            return t.listenerCount(e);
          };
        }, {}], 18: [function (t, e, i) {
          function n() {
            return this;
          }var r = t("./lib/parser");e.exports = { create: function create(e, i) {
              if (i = i || n(), e instanceof i.ArrayBuffer) {
                return new r(new (t("./lib/dom-bufferstream"))(e, 0, e.byteLength, !0, i));
              }return new r(new (t("./lib/bufferstream"))(e, 0, e.length, !0));
            } };
        }, { "./lib/bufferstream": 19, "./lib/dom-bufferstream": 21, "./lib/parser": 25 }], 19: [function (t, e, i) {
          function n(t, e, i, n) {
            this.buffer = t, this.offset = e || 0, i = "number" == typeof i ? i : t.length, this.endPosition = this.offset + i, this.setBigEndian(n);
          }n.prototype = { setBigEndian: function setBigEndian(t) {
              this.bigEndian = !!t;
            }, nextUInt8: function nextUInt8() {
              var t = this.buffer.readUInt8(this.offset);return this.offset += 1, t;
            }, nextInt8: function nextInt8() {
              var t = this.buffer.readInt8(this.offset);return this.offset += 1, t;
            }, nextUInt16: function nextUInt16() {
              var t = this.bigEndian ? this.buffer.readUInt16BE(this.offset) : this.buffer.readUInt16LE(this.offset);return this.offset += 2, t;
            }, nextUInt32: function nextUInt32() {
              var t = this.bigEndian ? this.buffer.readUInt32BE(this.offset) : this.buffer.readUInt32LE(this.offset);return this.offset += 4, t;
            }, nextInt16: function nextInt16() {
              var t = this.bigEndian ? this.buffer.readInt16BE(this.offset) : this.buffer.readInt16LE(this.offset);return this.offset += 2, t;
            }, nextInt32: function nextInt32() {
              var t = this.bigEndian ? this.buffer.readInt32BE(this.offset) : this.buffer.readInt32LE(this.offset);return this.offset += 4, t;
            }, nextFloat: function nextFloat() {
              var t = this.bigEndian ? this.buffer.readFloatBE(this.offset) : this.buffer.readFloatLE(this.offset);return this.offset += 4, t;
            }, nextDouble: function nextDouble() {
              var t = this.bigEndian ? this.buffer.readDoubleBE(this.offset) : this.buffer.readDoubleLE(this.offset);return this.offset += 8, t;
            }, nextBuffer: function nextBuffer(t) {
              var e = this.buffer.slice(this.offset, this.offset + t);return this.offset += t, e;
            }, remainingLength: function remainingLength() {
              return this.endPosition - this.offset;
            }, nextString: function nextString(t) {
              var e = this.buffer.toString("ascii", this.offset, this.offset + t);return this.offset += t, e;
            }, mark: function mark() {
              var t = this;return { openWithOffset: function openWithOffset(e) {
                  return e = (e || 0) + this.offset, new n(t.buffer, e, t.endPosition - e, t.bigEndian);
                }, offset: this.offset };
            }, offsetFrom: function offsetFrom(t) {
              return this.offset - t.offset;
            }, skip: function skip(t) {
              this.offset += t;
            }, branch: function branch(t, e) {
              return e = "number" == typeof e ? e : this.endPosition - (this.offset + t), new n(this.buffer, this.offset + t, e, this.bigEndian);
            } }, e.exports = n;
        }, {}], 20: [function (t, e, i) {
          function n(t) {
            return parseInt(t, 10);
          }function r(t, e) {
            t = t.map(n), e = e.map(n);var i = new Date();return i.setUTCFullYear(t[0]), i.setUTCMonth(t[1] - 1), i.setUTCDate(t[2]), i.setUTCHours(e[0]), i.setUTCMinutes(e[1]), i.setUTCSeconds(e[2]), i.setUTCMilliseconds(0), i.getTime() / 1e3;
          }function a(t) {
            var e = t.substr(0, 10).split("-"),
                i = t.substr(11, 8).split(":"),
                a = t.substr(19, 6),
                o = a.split(":").map(n),
                s = o[0] * l + o[1] * h,
                f = r(e, i);if ("number" == typeof (f -= s) && !isNaN(f)) return f;
          }function o(t) {
            var e = t.split(" "),
                i = e[0].split(":"),
                n = e[1].split(":"),
                a = r(i, n);if ("number" == typeof a && !isNaN(a)) return a;
          }function s(t) {
            var e = 19 === t.length && ":" === t.charAt(4),
                i = 25 === t.length && "T" === t.charAt(10);return i ? a(t) : e ? o(t) : void 0;
          }var l = 3600,
              h = 60;e.exports = { parseDateWithSpecFormat: o, parseDateWithTimezoneFormat: a, parseExifDate: s };
        }, {}], 21: [function (t, e, i) {
          function n(t, e, i, n, r, a) {
            this.global = r, e = e || 0, i = i || t.byteLength - e, this.arrayBuffer = t.slice(e, e + i), this.view = new r.DataView(this.arrayBuffer, 0, this.arrayBuffer.byteLength), this.setBigEndian(n), this.offset = 0, this.parentOffset = (a || 0) + e;
          }n.prototype = { setBigEndian: function setBigEndian(t) {
              this.littleEndian = !t;
            }, nextUInt8: function nextUInt8() {
              var t = this.view.getUint8(this.offset);return this.offset += 1, t;
            }, nextInt8: function nextInt8() {
              var t = this.view.getInt8(this.offset);return this.offset += 1, t;
            }, nextUInt16: function nextUInt16() {
              var t = this.view.getUint16(this.offset, this.littleEndian);return this.offset += 2, t;
            }, nextUInt32: function nextUInt32() {
              var t = this.view.getUint32(this.offset, this.littleEndian);return this.offset += 4, t;
            }, nextInt16: function nextInt16() {
              var t = this.view.getInt16(this.offset, this.littleEndian);return this.offset += 2, t;
            }, nextInt32: function nextInt32() {
              var t = this.view.getInt32(this.offset, this.littleEndian);return this.offset += 4, t;
            }, nextFloat: function nextFloat() {
              var t = this.view.getFloat32(this.offset, this.littleEndian);return this.offset += 4, t;
            }, nextDouble: function nextDouble() {
              var t = this.view.getFloat64(this.offset, this.littleEndian);return this.offset += 8, t;
            }, nextBuffer: function nextBuffer(t) {
              var e = this.arrayBuffer.slice(this.offset, this.offset + t);return this.offset += t, e;
            }, remainingLength: function remainingLength() {
              return this.arrayBuffer.byteLength - this.offset;
            }, nextString: function nextString(t) {
              var e = this.arrayBuffer.slice(this.offset, this.offset + t);return e = String.fromCharCode.apply(null, new this.global.Uint8Array(e)), this.offset += t, e;
            }, mark: function mark() {
              var t = this;return { openWithOffset: function openWithOffset(e) {
                  return e = (e || 0) + this.offset, new n(t.arrayBuffer, e, t.arrayBuffer.byteLength - e, !t.littleEndian, t.global, t.parentOffset);
                }, offset: this.offset, getParentOffset: function getParentOffset() {
                  return t.parentOffset;
                } };
            }, offsetFrom: function offsetFrom(t) {
              return this.parentOffset + this.offset - (t.offset + t.getParentOffset());
            }, skip: function skip(t) {
              this.offset += t;
            }, branch: function branch(t, e) {
              return e = "number" == typeof e ? e : this.arrayBuffer.byteLength - (this.offset + t), new n(this.arrayBuffer, this.offset + t, e, !this.littleEndian, this.global, this.parentOffset);
            } }, e.exports = n;
        }, {}], 22: [function (t, e, i) {
          e.exports = { exif: { 1: "InteropIndex", 2: "InteropVersion", 11: "ProcessingSoftware", 254: "SubfileType", 255: "OldSubfileType", 256: "ImageWidth", 257: "ImageHeight", 258: "BitsPerSample", 259: "Compression", 262: "PhotometricInterpretation", 263: "Thresholding", 264: "CellWidth", 265: "CellLength", 266: "FillOrder", 269: "DocumentName", 270: "ImageDescription", 271: "Make", 272: "Model", 273: "StripOffsets", 274: "Orientation", 277: "SamplesPerPixel", 278: "RowsPerStrip", 279: "StripByteCounts", 280: "MinSampleValue", 281: "MaxSampleValue", 282: "XResolution", 283: "YResolution", 284: "PlanarConfiguration", 285: "PageName", 286: "XPosition", 287: "YPosition", 288: "FreeOffsets", 289: "FreeByteCounts", 290: "GrayResponseUnit", 291: "GrayResponseCurve", 292: "T4Options", 293: "T6Options", 296: "ResolutionUnit", 297: "PageNumber", 300: "ColorResponseUnit", 301: "TransferFunction", 305: "Software", 306: "ModifyDate", 315: "Artist", 316: "HostComputer", 317: "Predictor", 318: "WhitePoint", 319: "PrimaryChromaticities", 320: "ColorMap", 321: "HalftoneHints", 322: "TileWidth", 323: "TileLength", 324: "TileOffsets", 325: "TileByteCounts", 326: "BadFaxLines", 327: "CleanFaxData", 328: "ConsecutiveBadFaxLines", 330: "SubIFD", 332: "InkSet", 333: "InkNames", 334: "NumberofInks", 336: "DotRange", 337: "TargetPrinter", 338: "ExtraSamples", 339: "SampleFormat", 340: "SMinSampleValue", 341: "SMaxSampleValue", 342: "TransferRange", 343: "ClipPath", 344: "XClipPathUnits", 345: "YClipPathUnits", 346: "Indexed", 347: "JPEGTables", 351: "OPIProxy", 400: "GlobalParametersIFD", 401: "ProfileType", 402: "FaxProfile", 403: "CodingMethods", 404: "VersionYear", 405: "ModeNumber", 433: "Decode", 434: "DefaultImageColor", 435: "T82Options", 437: "JPEGTables", 512: "JPEGProc", 513: "ThumbnailOffset", 514: "ThumbnailLength", 515: "JPEGRestartInterval", 517: "JPEGLosslessPredictors", 518: "JPEGPointTransforms", 519: "JPEGQTables", 520: "JPEGDCTables", 521: "JPEGACTables", 529: "YCbCrCoefficients", 530: "YCbCrSubSampling", 531: "YCbCrPositioning", 532: "ReferenceBlackWhite", 559: "StripRowCounts", 700: "ApplicationNotes", 999: "USPTOMiscellaneous", 4096: "RelatedImageFileFormat", 4097: "RelatedImageWidth", 4098: "RelatedImageHeight", 18246: "Rating", 18247: "XP_DIP_XML", 18248: "StitchInfo", 18249: "RatingPercent", 32781: "ImageID", 32931: "WangTag1", 32932: "WangAnnotation", 32933: "WangTag3", 32934: "WangTag4", 32995: "Matteing", 32996: "DataType", 32997: "ImageDepth", 32998: "TileDepth", 33405: "Model2", 33421: "CFARepeatPatternDim", 33422: "CFAPattern2", 33423: "BatteryLevel", 33424: "KodakIFD", 33432: "Copyright", 33434: "ExposureTime", 33437: "FNumber", 33445: "MDFileTag", 33446: "MDScalePixel", 33447: "MDColorTable", 33448: "MDLabName", 33449: "MDSampleInfo", 33450: "MDPrepDate", 33451: "MDPrepTime", 33452: "MDFileUnits", 33550: "PixelScale", 33589: "AdventScale", 33590: "AdventRevision", 33628: "UIC1Tag", 33629: "UIC2Tag", 33630: "UIC3Tag", 33631: "UIC4Tag", 33723: "IPTC-NAA", 33918: "IntergraphPacketData", 33919: "IntergraphFlagRegisters", 33920: "IntergraphMatrix", 33921: "INGRReserved", 33922: "ModelTiePoint", 34016: "Site", 34017: "ColorSequence", 34018: "IT8Header", 34019: "RasterPadding", 34020: "BitsPerRunLength", 34021: "BitsPerExtendedRunLength", 34022: "ColorTable", 34023: "ImageColorIndicator", 34024: "BackgroundColorIndicator", 34025: "ImageColorValue", 34026: "BackgroundColorValue", 34027: "PixelIntensityRange", 34028: "TransparencyIndicator", 34029: "ColorCharacterization", 34030: "HCUsage", 34031: "TrapIndicator", 34032: "CMYKEquivalent", 34118: "SEMInfo", 34152: "AFCP_IPTC", 34232: "PixelMagicJBIGOptions", 34264: "ModelTransform", 34306: "WB_GRGBLevels", 34310: "LeafData", 34377: "PhotoshopSettings", 34665: "ExifOffset", 34675: "ICC_Profile", 34687: "TIFF_FXExtensions", 34688: "MultiProfiles", 34689: "SharedData", 34690: "T88Options", 34732: "ImageLayer", 34735: "GeoTiffDirectory", 34736: "GeoTiffDoubleParams", 34737: "GeoTiffAsciiParams", 34850: "ExposureProgram", 34852: "SpectralSensitivity", 34853: "GPSInfo", 34855: "ISO", 34856: "Opto-ElectricConvFactor", 34857: "Interlace", 34858: "TimeZoneOffset", 34859: "SelfTimerMode", 34864: "SensitivityType", 34865: "StandardOutputSensitivity", 34866: "RecommendedExposureIndex", 34867: "ISOSpeed", 34868: "ISOSpeedLatitudeyyy", 34869: "ISOSpeedLatitudezzz", 34908: "FaxRecvParams", 34909: "FaxSubAddress", 34910: "FaxRecvTime", 34954: "LeafSubIFD", 36864: "ExifVersion", 36867: "DateTimeOriginal", 36868: "CreateDate", 37121: "ComponentsConfiguration", 37122: "CompressedBitsPerPixel", 37377: "ShutterSpeedValue", 37378: "ApertureValue", 37379: "BrightnessValue", 37380: "ExposureCompensation", 37381: "MaxApertureValue", 37382: "SubjectDistance", 37383: "MeteringMode", 37384: "LightSource", 37385: "Flash", 37386: "FocalLength", 37387: "FlashEnergy", 37388: "SpatialFrequencyResponse", 37389: "Noise", 37390: "FocalPlaneXResolution", 37391: "FocalPlaneYResolution", 37392: "FocalPlaneResolutionUnit", 37393: "ImageNumber", 37394: "SecurityClassification", 37395: "ImageHistory", 37396: "SubjectArea", 37397: "ExposureIndex", 37398: "TIFF-EPStandardID", 37399: "SensingMethod", 37434: "CIP3DataFile", 37435: "CIP3Sheet", 37436: "CIP3Side", 37439: "StoNits", 37500: "MakerNote", 37510: "UserComment", 37520: "SubSecTime", 37521: "SubSecTimeOriginal", 37522: "SubSecTimeDigitized", 37679: "MSDocumentText", 37680: "MSPropertySetStorage", 37681: "MSDocumentTextPosition", 37724: "ImageSourceData", 40091: "XPTitle", 40092: "XPComment", 40093: "XPAuthor", 40094: "XPKeywords", 40095: "XPSubject", 40960: "FlashpixVersion", 40961: "ColorSpace", 40962: "ExifImageWidth", 40963: "ExifImageHeight", 40964: "RelatedSoundFile", 40965: "InteropOffset", 41483: "FlashEnergy", 41484: "SpatialFrequencyResponse", 41485: "Noise", 41486: "FocalPlaneXResolution", 41487: "FocalPlaneYResolution", 41488: "FocalPlaneResolutionUnit", 41489: "ImageNumber", 41490: "SecurityClassification", 41491: "ImageHistory", 41492: "SubjectLocation", 41493: "ExposureIndex", 41494: "TIFF-EPStandardID", 41495: "SensingMethod", 41728: "FileSource", 41729: "SceneType", 41730: "CFAPattern", 41985: "CustomRendered", 41986: "ExposureMode", 41987: "WhiteBalance", 41988: "DigitalZoomRatio", 41989: "FocalLengthIn35mmFormat", 41990: "SceneCaptureType", 41991: "GainControl", 41992: "Contrast", 41993: "Saturation", 41994: "Sharpness", 41995: "DeviceSettingDescription", 41996: "SubjectDistanceRange", 42016: "ImageUniqueID", 42032: "OwnerName", 42033: "SerialNumber", 42034: "LensInfo", 42035: "LensMake", 42036: "LensModel", 42037: "LensSerialNumber", 42112: "GDALMetadata", 42113: "GDALNoData", 42240: "Gamma", 44992: "ExpandSoftware", 44993: "ExpandLens", 44994: "ExpandFilm", 44995: "ExpandFilterLens", 44996: "ExpandScanner", 44997: "ExpandFlashLamp", 48129: "PixelFormat", 48130: "Transformation", 48131: "Uncompressed", 48132: "ImageType", 48256: "ImageWidth", 48257: "ImageHeight", 48258: "WidthResolution", 48259: "HeightResolution", 48320: "ImageOffset", 48321: "ImageByteCount", 48322: "AlphaOffset", 48323: "AlphaByteCount", 48324: "ImageDataDiscard", 48325: "AlphaDataDiscard", 50215: "OceScanjobDesc", 50216: "OceApplicationSelector", 50217: "OceIDNumber", 50218: "OceImageLogic", 50255: "Annotations", 50341: "PrintIM", 50560: "USPTOOriginalContentType", 50706: "DNGVersion", 50707: "DNGBackwardVersion", 50708: "UniqueCameraModel", 50709: "LocalizedCameraModel", 50710: "CFAPlaneColor", 50711: "CFALayout", 50712: "LinearizationTable", 50713: "BlackLevelRepeatDim", 50714: "BlackLevel", 50715: "BlackLevelDeltaH", 50716: "BlackLevelDeltaV", 50717: "WhiteLevel", 50718: "DefaultScale", 50719: "DefaultCropOrigin", 50720: "DefaultCropSize", 50721: "ColorMatrix1", 50722: "ColorMatrix2", 50723: "CameraCalibration1", 50724: "CameraCalibration2", 50725: "ReductionMatrix1", 50726: "ReductionMatrix2", 50727: "AnalogBalance", 50728: "AsShotNeutral", 50729: "AsShotWhiteXY", 50730: "BaselineExposure", 50731: "BaselineNoise", 50732: "BaselineSharpness", 50733: "BayerGreenSplit", 50734: "LinearResponseLimit", 50735: "CameraSerialNumber", 50736: "DNGLensInfo", 50737: "ChromaBlurRadius", 50738: "AntiAliasStrength", 50739: "ShadowScale", 50740: "DNGPrivateData", 50741: "MakerNoteSafety", 50752: "RawImageSegmentation", 50778: "CalibrationIlluminant1", 50779: "CalibrationIlluminant2", 50780: "BestQualityScale", 50781: "RawDataUniqueID", 50784: "AliasLayerMetadata", 50827: "OriginalRawFileName", 50828: "OriginalRawFileData", 50829: "ActiveArea", 50830: "MaskedAreas", 50831: "AsShotICCProfile", 50832: "AsShotPreProfileMatrix", 50833: "CurrentICCProfile", 50834: "CurrentPreProfileMatrix", 50879: "ColorimetricReference", 50898: "PanasonicTitle", 50899: "PanasonicTitle2", 50931: "CameraCalibrationSig", 50932: "ProfileCalibrationSig", 50933: "ProfileIFD", 50934: "AsShotProfileName", 50935: "NoiseReductionApplied", 50936: "ProfileName", 50937: "ProfileHueSatMapDims", 50938: "ProfileHueSatMapData1", 50939: "ProfileHueSatMapData2", 50940: "ProfileToneCurve", 50941: "ProfileEmbedPolicy", 50942: "ProfileCopyright", 50964: "ForwardMatrix1", 50965: "ForwardMatrix2", 50966: "PreviewApplicationName", 50967: "PreviewApplicationVersion", 50968: "PreviewSettingsName", 50969: "PreviewSettingsDigest", 50970: "PreviewColorSpace", 50971: "PreviewDateTime", 50972: "RawImageDigest", 50973: "OriginalRawFileDigest", 50974: "SubTileBlockSize", 50975: "RowInterleaveFactor", 50981: "ProfileLookTableDims", 50982: "ProfileLookTableData", 51008: "OpcodeList1", 51009: "OpcodeList2", 51022: "OpcodeList3", 51041: "NoiseProfile", 51043: "TimeCodes", 51044: "FrameRate", 51058: "TStop", 51081: "ReelName", 51089: "OriginalDefaultFinalSize", 51090: "OriginalBestQualitySize", 51091: "OriginalDefaultCropSize", 51105: "CameraLabel", 51107: "ProfileHueSatMapEncoding", 51108: "ProfileLookTableEncoding", 51109: "BaselineExposureOffset", 51110: "DefaultBlackRender", 51111: "NewRawImageDigest", 51112: "RawToPreviewGain", 51125: "DefaultUserCrop", 59932: "Padding", 59933: "OffsetSchema", 65e3: "OwnerName", 65001: "SerialNumber", 65002: "Lens", 65024: "KDC_IFD", 65100: "RawFile", 65101: "Converter", 65102: "WhiteBalance", 65105: "Exposure", 65106: "Shadows", 65107: "Brightness", 65108: "Contrast", 65109: "Saturation", 65110: "Sharpness", 65111: "Smoothness", 65112: "MoireFilter" }, gps: { 0: "GPSVersionID", 1: "GPSLatitudeRef", 2: "GPSLatitude", 3: "GPSLongitudeRef", 4: "GPSLongitude", 5: "GPSAltitudeRef", 6: "GPSAltitude", 7: "GPSTimeStamp", 8: "GPSSatellites", 9: "GPSStatus", 10: "GPSMeasureMode", 11: "GPSDOP", 12: "GPSSpeedRef", 13: "GPSSpeed", 14: "GPSTrackRef", 15: "GPSTrack", 16: "GPSImgDirectionRef", 17: "GPSImgDirection", 18: "GPSMapDatum", 19: "GPSDestLatitudeRef", 20: "GPSDestLatitude", 21: "GPSDestLongitudeRef", 22: "GPSDestLongitude", 23: "GPSDestBearingRef", 24: "GPSDestBearing", 25: "GPSDestDistanceRef", 26: "GPSDestDistance", 27: "GPSProcessingMethod", 28: "GPSAreaInformation", 29: "GPSDateStamp", 30: "GPSDifferential", 31: "GPSHPositioningError" } };
        }, {}], 23: [function (t, e, i) {
          function n(t, e) {
            switch (t) {case 1:
                return e.nextUInt8();case 3:
                return e.nextUInt16();case 4:
                return e.nextUInt32();case 5:
                return [e.nextUInt32(), e.nextUInt32()];case 6:
                return e.nextInt8();case 8:
                return e.nextUInt16();case 9:
                return e.nextUInt32();case 10:
                return [e.nextInt32(), e.nextInt32()];case 11:
                return e.nextFloat();case 12:
                return e.nextDouble();default:
                throw new Error("Invalid format while decoding: " + t);}
          }function r(t) {
            switch (t) {case 1:case 2:case 6:case 7:
                return 1;case 3:case 8:
                return 2;case 4:case 9:case 11:
                return 4;case 5:case 10:case 12:
                return 8;default:
                throw new Error("Invalid format: " + t);}
          }function a(t, e) {
            var i,
                a,
                o = e.nextUInt16(),
                s = e.nextUInt16(),
                l = r(s),
                h = e.nextUInt32(),
                f = l * h;if (f > 4 && (e = t.openWithOffset(e.nextUInt32())), 2 === s) {
              i = e.nextString(h);var c = i.indexOf("\0");c !== -1 && (i = i.substr(0, c));
            } else if (7 === s) i = e.nextBuffer(h);else for (i = [], a = 0; a < h; ++a) {
              i.push(n(s, e));
            }return f < 4 && e.skip(4 - f), [o, i, s];
          }function o(t, e, i) {
            var n,
                r,
                o = e.nextUInt16();for (r = 0; r < o; ++r) {
              n = a(t, e), i(n[0], n[1], n[2]);
            }
          }function s(t) {
            if ("Exif\0\0" !== t.nextString(6)) throw new Error("Invalid EXIF header");var e = t.mark(),
                i = t.nextUInt16();if (18761 === i) t.setBigEndian(!1);else {
              if (19789 !== i) throw new Error("Invalid TIFF header");t.setBigEndian(!0);
            }if (42 !== t.nextUInt16()) throw new Error("Invalid TIFF data");return e;
          }e.exports = { IFD0: 1, IFD1: 2, GPSIFD: 3, SubIFD: 4, InteropIFD: 5, parseTags: function parseTags(t, e) {
              var i;try {
                i = s(t);
              } catch (t) {
                return !1;
              }var n,
                  r,
                  a,
                  l = i.openWithOffset(t.nextUInt32()),
                  h = this.IFD0;o(i, l, function (t, i, a) {
                switch (t) {case 34853:
                    r = i[0];break;case 34665:
                    n = i[0];break;default:
                    e(h, t, i, a);}
              });var f = l.nextUInt32();if (0 !== f) {
                o(i, i.openWithOffset(f), e.bind(null, this.IFD1));
              }if (r) {
                o(i, i.openWithOffset(r), e.bind(null, this.GPSIFD));
              }if (n) {
                var c = i.openWithOffset(n),
                    u = this.InteropIFD;o(i, c, function (t, i, n) {
                  40965 === t ? a = i[0] : e(u, t, i, n);
                });
              }if (a) {
                o(i, i.openWithOffset(a), e.bind(null, this.InteropIFD));
              }return !0;
            } };
        }, {}], 24: [function (t, e, i) {
          e.exports = { parseSections: function parseSections(t, e) {
              var i, n;for (t.setBigEndian(!0); t.remainingLength() > 0 && 218 !== n;) {
                if (255 !== t.nextUInt8()) throw new Error("Invalid JPEG section offset");n = t.nextUInt8(), i = n >= 208 && n <= 217 || 218 === n ? 0 : t.nextUInt16() - 2, e(n, t.branch(0, i)), t.skip(i);
              }
            }, getSizeFromSOFSection: function getSizeFromSOFSection(t) {
              return t.skip(1), { height: t.nextUInt16(), width: t.nextUInt16() };
            }, getSectionName: function getSectionName(t) {
              var e, i;switch (t) {case 216:
                  e = "SOI";break;case 196:
                  e = "DHT";break;case 219:
                  e = "DQT";break;case 221:
                  e = "DRI";break;case 218:
                  e = "SOS";break;case 254:
                  e = "COM";break;case 217:
                  e = "EOI";break;default:
                  t >= 224 && t <= 239 ? (e = "APP", i = t - 224) : t >= 192 && t <= 207 && 196 !== t && 200 !== t && 204 !== t ? (e = "SOF", i = t - 192) : t >= 208 && t <= 215 && (e = "RST", i = t - 208);}var n = { name: e };return "number" == typeof i && (n.index = i), n;
            } };
        }, {}], 25: [function (t, e, i) {
          function n(t, e, i, n, r, a, o) {
            this.startMarker = t, this.tags = e, this.imageSize = i, this.thumbnailOffset = n, this.thumbnailLength = r, this.thumbnailType = a, this.app1Offset = o;
          }function r(t) {
            this.stream = t, this.flags = { readBinaryTags: !1, resolveTagNames: !0, simplifyValues: !0, imageSize: !0, hidePointers: !0, returnTags: !0 };
          }var a = t("./jpeg"),
              o = t("./exif"),
              s = t("./simplify");n.prototype = { hasThumbnail: function hasThumbnail(t) {
              return !(!this.thumbnailOffset || !this.thumbnailLength) && ("string" != typeof t || ("image/jpeg" === t.toLowerCase().trim() ? 6 === this.thumbnailType : "image/tiff" === t.toLowerCase().trim() && 1 === this.thumbnailType));
            }, getThumbnailOffset: function getThumbnailOffset() {
              return this.app1Offset + 6 + this.thumbnailOffset;
            }, getThumbnailLength: function getThumbnailLength() {
              return this.thumbnailLength;
            }, getThumbnailBuffer: function getThumbnailBuffer() {
              return this._getThumbnailStream().nextBuffer(this.thumbnailLength);
            }, _getThumbnailStream: function _getThumbnailStream() {
              return this.startMarker.openWithOffset(this.getThumbnailOffset());
            }, getImageSize: function getImageSize() {
              return this.imageSize;
            }, getThumbnailSize: function getThumbnailSize() {
              var t,
                  e = this._getThumbnailStream();return a.parseSections(e, function (e, i) {
                "SOF" === a.getSectionName(e).name && (t = a.getSizeFromSOFSection(i));
              }), t;
            } }, r.prototype = { enableBinaryFields: function enableBinaryFields(t) {
              return this.flags.readBinaryTags = !!t, this;
            }, enablePointers: function enablePointers(t) {
              return this.flags.hidePointers = !t, this;
            }, enableTagNames: function enableTagNames(t) {
              return this.flags.resolveTagNames = !!t, this;
            }, enableImageSize: function enableImageSize(t) {
              return this.flags.imageSize = !!t, this;
            }, enableReturnTags: function enableReturnTags(t) {
              return this.flags.returnTags = !!t, this;
            }, enableSimpleValues: function enableSimpleValues(t) {
              return this.flags.simplifyValues = !!t, this;
            }, parse: function parse() {
              var e,
                  i,
                  r,
                  l,
                  h,
                  f,
                  c,
                  u,
                  p,
                  d = this.stream.mark(),
                  m = d.openWithOffset(0),
                  g = this.flags;return g.resolveTagNames && (c = t("./exif-tags")), g.resolveTagNames ? (e = {}, u = function u(t) {
                return e[t.name];
              }, p = function p(t, i) {
                e[t.name] = i;
              }) : (e = [], u = function u(t) {
                var i;for (i = 0; i < e.length; ++i) {
                  if (e[i].type === t.type && e[i].section === t.section) return e.value;
                }
              }, p = function p(t, i) {
                var n;for (n = 0; n < e.length; ++n) {
                  if (e[n].type === t.type && e[n].section === t.section) return void (e.value = i);
                }
              }), a.parseSections(m, function (t, n) {
                var u = n.offsetFrom(d);225 === t ? o.parseTags(n, function (t, i, n, a) {
                  if (g.readBinaryTags || 7 !== a) {
                    if (513 === i) {
                      if (r = n[0], g.hidePointers) return;
                    } else if (514 === i) {
                      if (l = n[0], g.hidePointers) return;
                    } else if (259 === i && (h = n[0], g.hidePointers)) return;if (g.returnTags) if (g.simplifyValues && (n = s.simplifyValue(n, a)), g.resolveTagNames) {
                      var f = t === o.GPSIFD ? c.gps : c.exif,
                          u = f[i];u || (u = c.exif[i]), e[u] = n;
                    } else e.push({ section: t, type: i, value: n });
                  }
                }) && (f = u) : g.imageSize && "SOF" === a.getSectionName(t).name && (i = a.getSizeFromSOFSection(n));
              }), g.simplifyValues && (s.castDegreeValues(u, p), s.castDateValues(u, p)), new n(d, e, i, r, l, h, f);
            } }, e.exports = r;
        }, { "./exif": 23, "./exif-tags": 22, "./jpeg": 24, "./simplify": 26 }], 26: [function (t, e, i) {
          var n = t("./exif"),
              r = t("./date"),
              a = [{ section: n.GPSIFD, type: 2, name: "GPSLatitude", refType: 1, refName: "GPSLatitudeRef", posVal: "N" }, { section: n.GPSIFD, type: 4, name: "GPSLongitude", refType: 3, refName: "GPSLongitudeRef", posVal: "E" }],
              o = [{ section: n.SubIFD, type: 36867, name: "DateTimeOriginal" }, { section: n.SubIFD, type: 36868, name: "CreateDate" }];e.exports = { castDegreeValues: function castDegreeValues(t, e) {
              a.forEach(function (i) {
                var n = t(i);if (n) {
                  var r = t({ section: i.section, type: i.refType, name: i.refName }),
                      a = r === i.posVal ? 1 : -1;e(i, (n[0] + n[1] / 60 + n[2] / 3600) * a);
                }
              });
            }, castDateValues: function castDateValues(t, e) {
              o.forEach(function (i) {
                var n = t(i);if (n) {
                  var a = r.parseExifDate(n);void 0 !== a && e(i, a);
                }
              });
            }, simplifyValue: function simplifyValue(t, e) {
              return Array.isArray(t) && (t = t.map(function (t) {
                return 10 === e || 5 === e ? t[0] / t[1] : t;
              }), 1 === t.length && (t = t[0])), t;
            } };
        }, { "./date": 20, "./exif": 23 }], 27: [function (t, e, i) {
          "use strict";
          e.exports = function (t) {
            return t && t.length > 1 ? 255 === t[0] && 216 === t[1] && 255 === t[2] ? { ext: "jpg", mime: "image/jpeg" } : 137 === t[0] && 80 === t[1] && 78 === t[2] && 71 === t[3] ? { ext: "png", mime: "image/png" } : 71 === t[0] && 73 === t[1] && 70 === t[2] ? { ext: "gif", mime: "image/gif" } : 87 === t[8] && 69 === t[9] && 66 === t[10] && 80 === t[11] ? { ext: "webp", mime: "image/webp" } : (73 === t[0] && 73 === t[1] && 42 === t[2] && 0 === t[3] || 77 === t[0] && 77 === t[1] && 0 === t[2] && 42 === t[3]) && 67 === t[8] && 82 === t[9] ? { ext: "cr2", mime: "image/x-canon-cr2" } : 73 === t[0] && 73 === t[1] && 42 === t[2] && 0 === t[3] || 77 === t[0] && 77 === t[1] && 0 === t[2] && 42 === t[3] ? { ext: "tif", mime: "image/tiff" } : 66 === t[0] && 77 === t[1] ? { ext: "bmp", mime: "image/bmp" } : 73 === t[0] && 73 === t[1] && 188 === t[2] ? { ext: "jxr", mime: "image/vnd.ms-photo" } : 56 === t[0] && 66 === t[1] && 80 === t[2] && 83 === t[3] ? { ext: "psd", mime: "image/vnd.adobe.photoshop" } : 80 === t[0] && 75 === t[1] && 3 === t[2] && 4 === t[3] && 109 === t[30] && 105 === t[31] && 109 === t[32] && 101 === t[33] && 116 === t[34] && 121 === t[35] && 112 === t[36] && 101 === t[37] && 97 === t[38] && 112 === t[39] && 112 === t[40] && 108 === t[41] && 105 === t[42] && 99 === t[43] && 97 === t[44] && 116 === t[45] && 105 === t[46] && 111 === t[47] && 110 === t[48] && 47 === t[49] && 101 === t[50] && 112 === t[51] && 117 === t[52] && 98 === t[53] && 43 === t[54] && 122 === t[55] && 105 === t[56] && 112 === t[57] ? { ext: "epub", mime: "application/epub+zip" } : 80 === t[0] && 75 === t[1] && 3 === t[2] && 4 === t[3] && 77 === t[30] && 69 === t[31] && 84 === t[32] && 65 === t[33] && 45 === t[34] && 73 === t[35] && 78 === t[36] && 70 === t[37] && 47 === t[38] && 109 === t[39] && 111 === t[40] && 122 === t[41] && 105 === t[42] && 108 === t[43] && 108 === t[44] && 97 === t[45] && 46 === t[46] && 114 === t[47] && 115 === t[48] && 97 === t[49] ? { ext: "xpi", mime: "application/x-xpinstall" } : 80 !== t[0] || 75 !== t[1] || 3 !== t[2] && 5 !== t[2] && 7 !== t[2] || 4 !== t[3] && 6 !== t[3] && 8 !== t[3] ? 117 === t[257] && 115 === t[258] && 116 === t[259] && 97 === t[260] && 114 === t[261] ? { ext: "tar", mime: "application/x-tar" } : 82 !== t[0] || 97 !== t[1] || 114 !== t[2] || 33 !== t[3] || 26 !== t[4] || 7 !== t[5] || 0 !== t[6] && 1 !== t[6] ? 31 === t[0] && 139 === t[1] && 8 === t[2] ? { ext: "gz", mime: "application/gzip" } : 66 === t[0] && 90 === t[1] && 104 === t[2] ? { ext: "bz2", mime: "application/x-bzip2" } : 55 === t[0] && 122 === t[1] && 188 === t[2] && 175 === t[3] && 39 === t[4] && 28 === t[5] ? { ext: "7z", mime: "application/x-7z-compressed" } : 120 === t[0] && 1 === t[1] ? { ext: "dmg", mime: "application/x-apple-diskimage" } : 0 === t[0] && 0 === t[1] && 0 === t[2] && (24 === t[3] || 32 === t[3]) && 102 === t[4] && 116 === t[5] && 121 === t[6] && 112 === t[7] || 51 === t[0] && 103 === t[1] && 112 === t[2] && 53 === t[3] || 0 === t[0] && 0 === t[1] && 0 === t[2] && 28 === t[3] && 102 === t[4] && 116 === t[5] && 121 === t[6] && 112 === t[7] && 109 === t[8] && 112 === t[9] && 52 === t[10] && 50 === t[11] && 109 === t[16] && 112 === t[17] && 52 === t[18] && 49 === t[19] && 109 === t[20] && 112 === t[21] && 52 === t[22] && 50 === t[23] && 105 === t[24] && 115 === t[25] && 111 === t[26] && 109 === t[27] || 0 === t[0] && 0 === t[1] && 0 === t[2] && 28 === t[3] && 102 === t[4] && 116 === t[5] && 121 === t[6] && 112 === t[7] && 105 === t[8] && 115 === t[9] && 111 === t[10] && 109 === t[11] || 0 === t[0] && 0 === t[1] && 0 === t[2] && 28 === t[3] && 102 === t[4] && 116 === t[5] && 121 === t[6] && 112 === t[7] && 109 === t[8] && 112 === t[9] && 52 === t[10] && 50 === t[11] && 0 === t[12] && 0 === t[13] && 0 === t[14] && 0 === t[15] ? { ext: "mp4", mime: "video/mp4" } : 0 === t[0] && 0 === t[1] && 0 === t[2] && 28 === t[3] && 102 === t[4] && 116 === t[5] && 121 === t[6] && 112 === t[7] && 77 === t[8] && 52 === t[9] && 86 === t[10] ? { ext: "m4v", mime: "video/x-m4v" } : 77 === t[0] && 84 === t[1] && 104 === t[2] && 100 === t[3] ? { ext: "mid", mime: "audio/midi" } : 109 === t[31] && 97 === t[32] && 116 === t[33] && 114 === t[34] && 111 === t[35] && 115 === t[36] && 107 === t[37] && 97 === t[38] ? { ext: "mkv", mime: "video/x-matroska" } : 26 === t[0] && 69 === t[1] && 223 === t[2] && 163 === t[3] ? { ext: "webm", mime: "video/webm" } : 0 === t[0] && 0 === t[1] && 0 === t[2] && 20 === t[3] && 102 === t[4] && 116 === t[5] && 121 === t[6] && 112 === t[7] ? { ext: "mov", mime: "video/quicktime" } : 82 === t[0] && 73 === t[1] && 70 === t[2] && 70 === t[3] && 65 === t[8] && 86 === t[9] && 73 === t[10] ? { ext: "avi", mime: "video/x-msvideo" } : 48 === t[0] && 38 === t[1] && 178 === t[2] && 117 === t[3] && 142 === t[4] && 102 === t[5] && 207 === t[6] && 17 === t[7] && 166 === t[8] && 217 === t[9] ? { ext: "wmv", mime: "video/x-ms-wmv" } : 0 === t[0] && 0 === t[1] && 1 === t[2] && "b" === t[3].toString(16)[0] ? { ext: "mpg", mime: "video/mpeg" } : 73 === t[0] && 68 === t[1] && 51 === t[2] || 255 === t[0] && 251 === t[1] ? { ext: "mp3", mime: "audio/mpeg" } : 102 === t[4] && 116 === t[5] && 121 === t[6] && 112 === t[7] && 77 === t[8] && 52 === t[9] && 65 === t[10] || 77 === t[0] && 52 === t[1] && 65 === t[2] && 32 === t[3] ? { ext: "m4a", mime: "audio/m4a" } : 79 === t[28] && 112 === t[29] && 117 === t[30] && 115 === t[31] && 72 === t[32] && 101 === t[33] && 97 === t[34] && 100 === t[35] ? { ext: "opus", mime: "audio/opus" } : 79 === t[0] && 103 === t[1] && 103 === t[2] && 83 === t[3] ? { ext: "ogg", mime: "audio/ogg" } : 102 === t[0] && 76 === t[1] && 97 === t[2] && 67 === t[3] ? { ext: "flac", mime: "audio/x-flac" } : 82 === t[0] && 73 === t[1] && 70 === t[2] && 70 === t[3] && 87 === t[8] && 65 === t[9] && 86 === t[10] && 69 === t[11] ? { ext: "wav", mime: "audio/x-wav" } : 35 === t[0] && 33 === t[1] && 65 === t[2] && 77 === t[3] && 82 === t[4] && 10 === t[5] ? { ext: "amr", mime: "audio/amr" } : 37 === t[0] && 80 === t[1] && 68 === t[2] && 70 === t[3] ? { ext: "pdf", mime: "application/pdf" } : 77 === t[0] && 90 === t[1] ? { ext: "exe", mime: "application/x-msdownload" } : 67 !== t[0] && 70 !== t[0] || 87 !== t[1] || 83 !== t[2] ? 123 === t[0] && 92 === t[1] && 114 === t[2] && 116 === t[3] && 102 === t[4] ? { ext: "rtf", mime: "application/rtf" } : 119 === t[0] && 79 === t[1] && 70 === t[2] && 70 === t[3] && (0 === t[4] && 1 === t[5] && 0 === t[6] && 0 === t[7] || 79 === t[4] && 84 === t[5] && 84 === t[6] && 79 === t[7]) ? { ext: "woff", mime: "application/font-woff" } : 119 === t[0] && 79 === t[1] && 70 === t[2] && 50 === t[3] && (0 === t[4] && 1 === t[5] && 0 === t[6] && 0 === t[7] || 79 === t[4] && 84 === t[5] && 84 === t[6] && 79 === t[7]) ? { ext: "woff2", mime: "application/font-woff" } : 76 === t[34] && 80 === t[35] && (0 === t[8] && 0 === t[9] && 1 === t[10] || 1 === t[8] && 0 === t[9] && 2 === t[10] || 2 === t[8] && 0 === t[9] && 2 === t[10]) ? { ext: "eot", mime: "application/octet-stream" } : 0 === t[0] && 1 === t[1] && 0 === t[2] && 0 === t[3] && 0 === t[4] ? { ext: "ttf", mime: "application/font-sfnt" } : 79 === t[0] && 84 === t[1] && 84 === t[2] && 79 === t[3] && 0 === t[4] ? { ext: "otf", mime: "application/font-sfnt" } : 0 === t[0] && 0 === t[1] && 1 === t[2] && 0 === t[3] ? { ext: "ico", mime: "image/x-icon" } : 70 === t[0] && 76 === t[1] && 86 === t[2] && 1 === t[3] ? { ext: "flv", mime: "video/x-flv" } : 37 === t[0] && 33 === t[1] ? { ext: "ps", mime: "application/postscript" } : 253 === t[0] && 55 === t[1] && 122 === t[2] && 88 === t[3] && 90 === t[4] && 0 === t[5] ? { ext: "xz", mime: "application/x-xz" } : 83 === t[0] && 81 === t[1] && 76 === t[2] && 105 === t[3] ? { ext: "sqlite", mime: "application/x-sqlite3" } : 78 === t[0] && 69 === t[1] && 83 === t[2] && 26 === t[3] ? { ext: "nes", mime: "application/x-nintendo-nes-rom" } : 67 === t[0] && 114 === t[1] && 50 === t[2] && 52 === t[3] ? { ext: "crx", mime: "application/x-google-chrome-extension" } : 77 === t[0] && 83 === t[1] && 67 === t[2] && 70 === t[3] || 73 === t[0] && 83 === t[1] && 99 === t[2] && 40 === t[3] ? { ext: "cab", mime: "application/vnd.ms-cab-compressed" } : 33 === t[0] && 60 === t[1] && 97 === t[2] && 114 === t[3] && 99 === t[4] && 104 === t[5] && 62 === t[6] && 10 === t[7] && 100 === t[8] && 101 === t[9] && 98 === t[10] && 105 === t[11] && 97 === t[12] && 110 === t[13] && 45 === t[14] && 98 === t[15] && 105 === t[16] && 110 === t[17] && 97 === t[18] && 114 === t[19] && 121 === t[20] ? { ext: "deb", mime: "application/x-deb" } : 33 === t[0] && 60 === t[1] && 97 === t[2] && 114 === t[3] && 99 === t[4] && 104 === t[5] && 62 === t[6] ? { ext: "ar", mime: "application/x-unix-archive" } : 237 === t[0] && 171 === t[1] && 238 === t[2] && 219 === t[3] ? { ext: "rpm", mime: "application/x-rpm" } : 31 === t[0] && 160 === t[1] || 31 === t[0] && 157 === t[1] ? { ext: "Z", mime: "application/x-compress" } : 76 === t[0] && 90 === t[1] && 73 === t[2] && 80 === t[3] ? { ext: "lz", mime: "application/x-lzip" } : 208 === t[0] && 207 === t[1] && 17 === t[2] && 224 === t[3] && 161 === t[4] && 177 === t[5] && 26 === t[6] && 225 === t[7] ? { ext: "msi", mime: "application/x-msi" } : null : { ext: "swf", mime: "application/x-shockwave-flash" } : { ext: "rar", mime: "application/x-rar-compressed" } : { ext: "zip", mime: "application/zip" } : null;
          };
        }, {}], 28: [function (t, e, i) {
          function n(t, e, i) {
            if (!s(e)) throw new TypeError("iterator must be a function");arguments.length < 3 && (i = this), "[object Array]" === l.call(t) ? r(t, e, i) : "string" == typeof t ? a(t, e, i) : o(t, e, i);
          }function r(t, e, i) {
            for (var n = 0, r = t.length; n < r; n++) {
              h.call(t, n) && e.call(i, t[n], n, t);
            }
          }function a(t, e, i) {
            for (var n = 0, r = t.length; n < r; n++) {
              e.call(i, t.charAt(n), n, t);
            }
          }function o(t, e, i) {
            for (var n in t) {
              h.call(t, n) && e.call(i, t[n], n, t);
            }
          }var s = t("is-function");e.exports = n;var l = Object.prototype.toString,
              h = Object.prototype.hasOwnProperty;
        }, { "is-function": 34 }], 29: [function (t, e, i) {
          (function (t) {
            void 0 !== window ? e.exports = window : void 0 !== t ? e.exports = t : "undefined" != typeof self ? e.exports = self : e.exports = {};
          }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : void 0 !== window ? window : {});
        }, {}], 30: [function (t, e, i) {
          i.read = function (t, e, i, n, r) {
            var a,
                o,
                s = 8 * r - n - 1,
                l = (1 << s) - 1,
                h = l >> 1,
                f = -7,
                c = i ? r - 1 : 0,
                u = i ? -1 : 1,
                p = t[e + c];for (c += u, a = p & (1 << -f) - 1, p >>= -f, f += s; f > 0; a = 256 * a + t[e + c], c += u, f -= 8) {}for (o = a & (1 << -f) - 1, a >>= -f, f += n; f > 0; o = 256 * o + t[e + c], c += u, f -= 8) {}if (0 === a) a = 1 - h;else {
              if (a === l) return o ? NaN : 1 / 0 * (p ? -1 : 1);o += Math.pow(2, n), a -= h;
            }return (p ? -1 : 1) * o * Math.pow(2, a - n);
          }, i.write = function (t, e, i, n, r, a) {
            var o,
                s,
                l,
                h = 8 * a - r - 1,
                f = (1 << h) - 1,
                c = f >> 1,
                u = 23 === r ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                p = n ? 0 : a - 1,
                d = n ? 1 : -1,
                m = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0;for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (s = isNaN(e) ? 1 : 0, o = f) : (o = Math.floor(Math.log(e) / Math.LN2), e * (l = Math.pow(2, -o)) < 1 && (o--, l *= 2), e += o + c >= 1 ? u / l : u * Math.pow(2, 1 - c), e * l >= 2 && (o++, l /= 2), o + c >= f ? (s = 0, o = f) : o + c >= 1 ? (s = (e * l - 1) * Math.pow(2, r), o += c) : (s = e * Math.pow(2, c - 1) * Math.pow(2, r), o = 0)); r >= 8; t[i + p] = 255 & s, p += d, s /= 256, r -= 8) {}for (o = o << r | s, h += r; h > 0; t[i + p] = 255 & o, p += d, o /= 256, h -= 8) {}t[i + p - d] |= 128 * m;
          };
        }, {}], 31: [function (t, e, i) {
          "function" == typeof Object.create ? e.exports = function (t, e) {
            t.super_ = e, t.prototype = Object.create(e.prototype, { constructor: { value: t, enumerable: !1, writable: !0, configurable: !0 } });
          } : e.exports = function (t, e) {
            t.super_ = e;var i = function i() {};i.prototype = e.prototype, t.prototype = new i(), t.prototype.constructor = t;
          };
        }, {}], 32: [function (t, e, i) {
          "use strict";
          var n = "(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}",
              r = "(?:(?:[0-9a-fA-F:]){1,4}(?:(?::(?:[0-9a-fA-F]){1,4}|:)){2,7})+",
              a = e.exports = function (t) {
            return t = t || {}, t.exact ? new RegExp("(?:^" + n + "$)|(?:^" + r + "$)") : new RegExp("(?:" + n + ")|(?:" + r + ")", "g");
          };a.v4 = function (t) {
            return t = t || {}, t.exact ? new RegExp("^" + n + "$") : new RegExp(n, "g");
          }, a.v6 = function (t) {
            return t = t || {}, t.exact ? new RegExp("^" + r + "$") : new RegExp(r, "g");
          };
        }, {}], 33: [function (t, e, i) {
          function n(t) {
            return !!t.constructor && "function" == typeof t.constructor.isBuffer && t.constructor.isBuffer(t);
          }function r(t) {
            return "function" == typeof t.readFloatLE && "function" == typeof t.slice && n(t.slice(0, 0));
          }e.exports = function (t) {
            return null != t && (n(t) || r(t) || !!t._isBuffer);
          };
        }, {}], 34: [function (t, e, i) {
          function n(t) {
            var e = r.call(t);return "[object Function]" === e || "function" == typeof t && "[object RegExp]" !== e || void 0 !== window && (t === window.setTimeout || t === window.alert || t === window.confirm || t === window.prompt);
          }e.exports = n;var r = Object.prototype.toString;
        }, {}], 35: [function (t, e, i) {
          var n = {}.toString;e.exports = Array.isArray || function (t) {
            return "[object Array]" == n.call(t);
          };
        }, {}], 36: [function (t, e, i) {
          var n = t("./lib/encoder"),
              r = t("./lib/decoder");e.exports = { encode: n, decode: r };
        }, { "./lib/decoder": 37, "./lib/encoder": 38 }], 37: [function (t, e, i) {
          (function (t) {
            function i(e, i) {
              var r = new Uint8Array(e),
                  a = new n();a.parse(r);var o = { width: a.width, height: a.height, data: i ? new Uint8Array(a.width * a.height * 4) : new t(a.width * a.height * 4) };return a.copyToImageData(o), o;
            }var n = function () {
              "use strict";
              function t() {}function e(t, e) {
                for (var i, n, r = 0, a = [], o = 16; o > 0 && !t[o - 1];) {
                  o--;
                }a.push({ children: [], index: 0 });var s,
                    l = a[0];for (i = 0; i < o; i++) {
                  for (n = 0; n < t[i]; n++) {
                    for (l = a.pop(), l.children[l.index] = e[r]; l.index > 0;) {
                      l = a.pop();
                    }for (l.index++, a.push(l); a.length <= i;) {
                      a.push(s = { children: [], index: 0 }), l.children[l.index] = s.children, l = s;
                    }r++;
                  }i + 1 < o && (a.push(s = { children: [], index: 0 }), l.children[l.index] = s.children, l = s);
                }return a[0].children;
              }function i(t, e, i, n, r, o, s, l, h) {
                function f() {
                  if (R > 0) return R--, T >> R & 1;if (255 == (T = t[e++])) {
                    var i = t[e++];if (i) throw "unexpected marker: " + (T << 8 | i).toString(16);
                  }return R = 7, T >>> 7;
                }function c(t) {
                  for (var e, i = t; null !== (e = f());) {
                    if ("number" == typeof (i = i[e])) return i;if ("object" !== (void 0 === i ? "undefined" : _typeof(i))) throw "invalid huffman sequence";
                  }return null;
                }function u(t) {
                  for (var e = 0; t > 0;) {
                    var i = f();if (null === i) return;e = e << 1 | i, t--;
                  }return e;
                }function p(t) {
                  var e = u(t);return e >= 1 << t - 1 ? e : e + (-1 << t) + 1;
                }function d(t, e) {
                  var i = c(t.huffmanTableDC),
                      n = 0 === i ? 0 : p(i);e[0] = t.pred += n;for (var r = 1; r < 64;) {
                    var o = c(t.huffmanTableAC),
                        s = 15 & o,
                        l = o >> 4;if (0 !== s) {
                      r += l;e[a[r]] = p(s), r++;
                    } else {
                      if (l < 15) break;r += 16;
                    }
                  }
                }function m(t, e) {
                  var i = c(t.huffmanTableDC),
                      n = 0 === i ? 0 : p(i) << h;e[0] = t.pred += n;
                }function g(t, e) {
                  e[0] |= f() << h;
                }function b(t, e) {
                  if (L > 0) return void L--;for (var i = o, n = s; i <= n;) {
                    var r = c(t.huffmanTableAC),
                        l = 15 & r,
                        f = r >> 4;if (0 !== l) {
                      i += f;e[a[i]] = p(l) * (1 << h), i++;
                    } else {
                      if (f < 15) {
                        L = u(f) + (1 << f) - 1;break;
                      }i += 16;
                    }
                  }
                }function v(t, e) {
                  for (var i = o, n = s, r = 0; i <= n;) {
                    var l = a[i];switch (P) {case 0:
                        var d = c(t.huffmanTableAC),
                            m = 15 & d,
                            r = d >> 4;if (0 === m) r < 15 ? (L = u(r) + (1 << r), P = 4) : (r = 16, P = 1);else {
                          if (1 !== m) throw "invalid ACn encoding";w = p(m), P = r ? 2 : 3;
                        }continue;case 1:case 2:
                        e[l] ? e[l] += f() << h : 0 === --r && (P = 2 == P ? 3 : 0);break;case 3:
                        e[l] ? e[l] += f() << h : (e[l] = w << h, P = 0);break;case 4:
                        e[l] && (e[l] += f() << h);}i++;
                  }4 === P && 0 === --L && (P = 0);
                }var w,
                    _,
                    y,
                    x,
                    k,
                    E,
                    S,
                    I = (i.precision, i.samplesPerLine, i.scanLines, i.mcusPerLine),
                    M = i.progressive,
                    A = (i.maxH, i.maxV, e),
                    T = 0,
                    R = 0,
                    L = 0,
                    P = 0,
                    C = n.length;S = M ? 0 === o ? 0 === l ? m : g : 0 === l ? b : v : d;var B,
                    z,
                    O = 0;z = 1 == C ? n[0].blocksPerLine * n[0].blocksPerColumn : I * i.mcusPerColumn, r || (r = z);for (var D, U; O < z;) {
                  for (y = 0; y < C; y++) {
                    n[y].pred = 0;
                  }if (L = 0, 1 == C) for (_ = n[0], E = 0; E < r; E++) {
                    !function (t, e, i) {
                      var n = i / t.blocksPerLine | 0,
                          r = i % t.blocksPerLine;e(t, t.blocks[n][r]);
                    }(_, S, O), O++;
                  } else for (E = 0; E < r; E++) {
                    for (y = 0; y < C; y++) {
                      for (_ = n[y], D = _.h, U = _.v, x = 0; x < U; x++) {
                        for (k = 0; k < D; k++) {
                          !function (t, e, i, n, r) {
                            var a = i / I | 0,
                                o = i % I,
                                s = a * t.v + n,
                                l = o * t.h + r;e(t, t.blocks[s][l]);
                          }(_, S, O, x, k);
                        }
                      }
                    }if (++O === z) break;
                  }if (R = 0, (B = t[e] << 8 | t[e + 1]) < 65280) throw "marker was not found";if (!(B >= 65488 && B <= 65495)) break;e += 2;
                }return e - A;
              }function n(t, e) {
                for (var i, n, r = [], a = e.blocksPerLine, d = e.blocksPerColumn, m = a << 3, g = new Int32Array(64), b = new Uint8Array(64), v = 0; v < d; v++) {
                  var w = v << 3;for (i = 0; i < 8; i++) {
                    r.push(new Uint8Array(m));
                  }for (var _ = 0; _ < a; _++) {
                    !function (t, i, n) {
                      var r,
                          a,
                          d,
                          m,
                          g,
                          b,
                          v,
                          w,
                          _,
                          y,
                          x = e.quantizationTable,
                          k = n;for (y = 0; y < 64; y++) {
                        k[y] = t[y] * x[y];
                      }for (y = 0; y < 8; ++y) {
                        var E = 8 * y;0 != k[1 + E] || 0 != k[2 + E] || 0 != k[3 + E] || 0 != k[4 + E] || 0 != k[5 + E] || 0 != k[6 + E] || 0 != k[7 + E] ? (r = u * k[0 + E] + 128 >> 8, a = u * k[4 + E] + 128 >> 8, d = k[2 + E], m = k[6 + E], g = p * (k[1 + E] - k[7 + E]) + 128 >> 8, w = p * (k[1 + E] + k[7 + E]) + 128 >> 8, b = k[3 + E] << 4, v = k[5 + E] << 4, _ = r - a + 1 >> 1, r = r + a + 1 >> 1, a = _, _ = d * c + m * f + 128 >> 8, d = d * f - m * c + 128 >> 8, m = _, _ = g - v + 1 >> 1, g = g + v + 1 >> 1, v = _, _ = w + b + 1 >> 1, b = w - b + 1 >> 1, w = _, _ = r - m + 1 >> 1, r = r + m + 1 >> 1, m = _, _ = a - d + 1 >> 1, a = a + d + 1 >> 1, d = _, _ = g * h + w * l + 2048 >> 12, g = g * l - w * h + 2048 >> 12, w = _, _ = b * s + v * o + 2048 >> 12, b = b * o - v * s + 2048 >> 12, v = _, k[0 + E] = r + w, k[7 + E] = r - w, k[1 + E] = a + v, k[6 + E] = a - v, k[2 + E] = d + b, k[5 + E] = d - b, k[3 + E] = m + g, k[4 + E] = m - g) : (_ = u * k[0 + E] + 512 >> 10, k[0 + E] = _, k[1 + E] = _, k[2 + E] = _, k[3 + E] = _, k[4 + E] = _, k[5 + E] = _, k[6 + E] = _, k[7 + E] = _);
                      }for (y = 0; y < 8; ++y) {
                        var S = y;0 != k[8 + S] || 0 != k[16 + S] || 0 != k[24 + S] || 0 != k[32 + S] || 0 != k[40 + S] || 0 != k[48 + S] || 0 != k[56 + S] ? (r = u * k[0 + S] + 2048 >> 12, a = u * k[32 + S] + 2048 >> 12, d = k[16 + S], m = k[48 + S], g = p * (k[8 + S] - k[56 + S]) + 2048 >> 12, w = p * (k[8 + S] + k[56 + S]) + 2048 >> 12, b = k[24 + S], v = k[40 + S], _ = r - a + 1 >> 1, r = r + a + 1 >> 1, a = _, _ = d * c + m * f + 2048 >> 12, d = d * f - m * c + 2048 >> 12, m = _, _ = g - v + 1 >> 1, g = g + v + 1 >> 1, v = _, _ = w + b + 1 >> 1, b = w - b + 1 >> 1, w = _, _ = r - m + 1 >> 1, r = r + m + 1 >> 1, m = _, _ = a - d + 1 >> 1, a = a + d + 1 >> 1, d = _, _ = g * h + w * l + 2048 >> 12, g = g * l - w * h + 2048 >> 12, w = _, _ = b * s + v * o + 2048 >> 12, b = b * o - v * s + 2048 >> 12, v = _, k[0 + S] = r + w, k[56 + S] = r - w, k[8 + S] = a + v, k[48 + S] = a - v, k[16 + S] = d + b, k[40 + S] = d - b, k[24 + S] = m + g, k[32 + S] = m - g) : (_ = u * n[y + 0] + 8192 >> 14, k[0 + S] = _, k[8 + S] = _, k[16 + S] = _, k[24 + S] = _, k[32 + S] = _, k[40 + S] = _, k[48 + S] = _, k[56 + S] = _);
                      }for (y = 0; y < 64; ++y) {
                        var I = 128 + (k[y] + 8 >> 4);i[y] = I < 0 ? 0 : I > 255 ? 255 : I;
                      }
                    }(e.blocks[v][_], b, g);var y = 0,
                        x = _ << 3;for (n = 0; n < 8; n++) {
                      var k = r[w + n];for (i = 0; i < 8; i++) {
                        k[x + i] = b[y++];
                      }
                    }
                  }
                }return r;
              }function r(t) {
                return t < 0 ? 0 : t > 255 ? 255 : t;
              }var a = new Int32Array([0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63]),
                  o = 4017,
                  s = 799,
                  l = 3406,
                  h = 2276,
                  f = 1567,
                  c = 3784,
                  u = 5793,
                  p = 2896;return t.prototype = { load: function load(t) {
                  var e = new XMLHttpRequest();e.open("GET", t, !0), e.responseType = "arraybuffer", e.onload = function () {
                    var t = new Uint8Array(e.response || e.mozResponseArrayBuffer);this.parse(t), this.onload && this.onload();
                  }.bind(this), e.send(null);
                }, parse: function parse(t) {
                  function r() {
                    var e = t[l] << 8 | t[l + 1];return l += 2, e;
                  }var o,
                      s,
                      l = 0,
                      h = (t.length, null),
                      f = null,
                      c = [],
                      u = [],
                      p = [],
                      d = [],
                      m = r();if (65496 != m) throw "SOI not found";for (m = r(); 65497 != m;) {
                    var g, b;switch (m) {case 65280:
                        break;case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:case 65534:
                        var v = function () {
                          var e = r(),
                              i = t.subarray(l, l + e - 2);return l += i.length, i;
                        }();65504 === m && 74 === v[0] && 70 === v[1] && 73 === v[2] && 70 === v[3] && 0 === v[4] && (h = { version: { major: v[5], minor: v[6] }, densityUnits: v[7], xDensity: v[8] << 8 | v[9], yDensity: v[10] << 8 | v[11], thumbWidth: v[12], thumbHeight: v[13], thumbData: v.subarray(14, 14 + 3 * v[12] * v[13]) }), 65518 === m && 65 === v[0] && 100 === v[1] && 111 === v[2] && 98 === v[3] && 101 === v[4] && 0 === v[5] && (f = { version: v[6], flags0: v[7] << 8 | v[8], flags1: v[9] << 8 | v[10], transformCode: v[11] });break;case 65499:
                        for (var w = r(), _ = w + l - 2; l < _;) {
                          var y = t[l++],
                              x = new Int32Array(64);if (y >> 4 == 0) for (b = 0; b < 64; b++) {
                            var k = a[b];x[k] = t[l++];
                          } else {
                            if (y >> 4 != 1) throw "DQT: invalid table spec";for (b = 0; b < 64; b++) {
                              var k = a[b];x[k] = r();
                            }
                          }c[15 & y] = x;
                        }break;case 65472:case 65473:case 65474:
                        r(), o = {}, o.extended = 65473 === m, o.progressive = 65474 === m, o.precision = t[l++], o.scanLines = r(), o.samplesPerLine = r(), o.components = {}, o.componentsOrder = [];var E,
                            S = t[l++];for (g = 0; g < S; g++) {
                          E = t[l];var I = t[l + 1] >> 4,
                              M = 15 & t[l + 1],
                              A = t[l + 2];o.componentsOrder.push(E), o.components[E] = { h: I, v: M, quantizationIdx: A }, l += 3;
                        }!function (t) {
                          var e,
                              i,
                              n = 0,
                              r = 0;for (i in t.components) {
                            t.components.hasOwnProperty(i) && (e = t.components[i], n < e.h && (n = e.h), r < e.v && (r = e.v));
                          }var a = Math.ceil(t.samplesPerLine / 8 / n),
                              o = Math.ceil(t.scanLines / 8 / r);for (i in t.components) {
                            if (t.components.hasOwnProperty(i)) {
                              e = t.components[i];for (var s = Math.ceil(Math.ceil(t.samplesPerLine / 8) * e.h / n), l = Math.ceil(Math.ceil(t.scanLines / 8) * e.v / r), h = a * e.h, f = o * e.v, c = [], u = 0; u < f; u++) {
                                for (var p = [], d = 0; d < h; d++) {
                                  p.push(new Int32Array(64));
                                }c.push(p);
                              }e.blocksPerLine = s, e.blocksPerColumn = l, e.blocks = c;
                            }
                          }t.maxH = n, t.maxV = r, t.mcusPerLine = a, t.mcusPerColumn = o;
                        }(o), u.push(o);break;case 65476:
                        var T = r();for (g = 2; g < T;) {
                          var R = t[l++],
                              L = new Uint8Array(16),
                              P = 0;for (b = 0; b < 16; b++, l++) {
                            P += L[b] = t[l];
                          }var C = new Uint8Array(P);for (b = 0; b < P; b++, l++) {
                            C[b] = t[l];
                          }g += 17 + P, (R >> 4 == 0 ? d : p)[15 & R] = e(L, C);
                        }break;case 65501:
                        r(), s = r();break;case 65498:
                        var B,
                            z = (r(), t[l++]),
                            O = [];for (g = 0; g < z; g++) {
                          B = o.components[t[l++]];var D = t[l++];B.huffmanTableDC = d[D >> 4], B.huffmanTableAC = p[15 & D], O.push(B);
                        }var U = t[l++],
                            N = t[l++],
                            F = t[l++];l += i(t, l, o, O, s, U, N, F >> 4, 15 & F);break;default:
                        if (255 == t[l - 3] && t[l - 2] >= 192 && t[l - 2] <= 254) {
                          l -= 3;break;
                        }throw "unknown JPEG marker " + m.toString(16);}m = r();
                  }if (1 != u.length) throw "only single frame JPEGs supported";for (var g = 0; g < u.length; g++) {
                    var j = u[g].components;for (var b in j) {
                      j[b].quantizationTable = c[j[b].quantizationIdx], delete j[b].quantizationIdx;
                    }
                  }this.width = o.samplesPerLine, this.height = o.scanLines, this.jfif = h, this.adobe = f, this.components = [];for (var g = 0; g < o.componentsOrder.length; g++) {
                    var B = o.components[o.componentsOrder[g]];this.components.push({ lines: n(o, B), scaleX: B.h / o.maxH, scaleY: B.v / o.maxV });
                  }
                }, getData: function getData(t, e) {
                  var i,
                      n,
                      a,
                      o,
                      s,
                      l,
                      h,
                      f,
                      c,
                      u,
                      p,
                      d,
                      m,
                      g,
                      b,
                      v,
                      w,
                      _,
                      y,
                      x,
                      k,
                      E = this.width / t,
                      S = this.height / e,
                      I = 0,
                      M = t * e * this.components.length,
                      A = new Uint8Array(M);switch (this.components.length) {case 1:
                      for (i = this.components[0], u = 0; u < e; u++) {
                        for (s = i.lines[0 | u * i.scaleY * S], c = 0; c < t; c++) {
                          p = s[0 | c * i.scaleX * E], A[I++] = p;
                        }
                      }break;case 2:
                      for (i = this.components[0], n = this.components[1], u = 0; u < e; u++) {
                        for (s = i.lines[0 | u * i.scaleY * S], l = n.lines[0 | u * n.scaleY * S], c = 0; c < t; c++) {
                          p = s[0 | c * i.scaleX * E], A[I++] = p, p = l[0 | c * n.scaleX * E], A[I++] = p;
                        }
                      }break;case 3:
                      for (k = !0, this.adobe && this.adobe.transformCode ? k = !0 : void 0 !== this.colorTransform && (k = !!this.colorTransform), i = this.components[0], n = this.components[1], a = this.components[2], u = 0; u < e; u++) {
                        for (s = i.lines[0 | u * i.scaleY * S], l = n.lines[0 | u * n.scaleY * S], h = a.lines[0 | u * a.scaleY * S], c = 0; c < t; c++) {
                          k ? (p = s[0 | c * i.scaleX * E], d = l[0 | c * n.scaleX * E], m = h[0 | c * a.scaleX * E], _ = r(p + 1.402 * (m - 128)), y = r(p - .3441363 * (d - 128) - .71413636 * (m - 128)), x = r(p + 1.772 * (d - 128))) : (_ = s[0 | c * i.scaleX * E], y = l[0 | c * n.scaleX * E], x = h[0 | c * a.scaleX * E]), A[I++] = _, A[I++] = y, A[I++] = x;
                        }
                      }break;case 4:
                      if (!this.adobe) throw "Unsupported color mode (4 components)";for (k = !1, this.adobe && this.adobe.transformCode ? k = !0 : void 0 !== this.colorTransform && (k = !!this.colorTransform), i = this.components[0], n = this.components[1], a = this.components[2], o = this.components[3], u = 0; u < e; u++) {
                        for (s = i.lines[0 | u * i.scaleY * S], l = n.lines[0 | u * n.scaleY * S], h = a.lines[0 | u * a.scaleY * S], f = o.lines[0 | u * o.scaleY * S], c = 0; c < t; c++) {
                          k ? (p = s[0 | c * i.scaleX * E], d = l[0 | c * n.scaleX * E], m = h[0 | c * a.scaleX * E], g = f[0 | c * o.scaleX * E], b = 255 - r(p + 1.402 * (m - 128)), v = 255 - r(p - .3441363 * (d - 128) - .71413636 * (m - 128)), w = 255 - r(p + 1.772 * (d - 128))) : (b = s[0 | c * i.scaleX * E], v = l[0 | c * n.scaleX * E], w = h[0 | c * a.scaleX * E], g = f[0 | c * o.scaleX * E]), A[I++] = 255 - b, A[I++] = 255 - v, A[I++] = 255 - w, A[I++] = 255 - g;
                        }
                      }break;default:
                      throw "Unsupported color mode";}return A;
                }, copyToImageData: function copyToImageData(t) {
                  var e,
                      i,
                      n,
                      a,
                      o,
                      s,
                      l,
                      h,
                      f,
                      c = t.width,
                      u = t.height,
                      p = t.data,
                      d = this.getData(c, u),
                      m = 0,
                      g = 0;switch (this.components.length) {case 1:
                      for (i = 0; i < u; i++) {
                        for (e = 0; e < c; e++) {
                          n = d[m++], p[g++] = n, p[g++] = n, p[g++] = n, p[g++] = 255;
                        }
                      }break;case 3:
                      for (i = 0; i < u; i++) {
                        for (e = 0; e < c; e++) {
                          l = d[m++], h = d[m++], f = d[m++], p[g++] = l, p[g++] = h, p[g++] = f, p[g++] = 255;
                        }
                      }break;case 4:
                      for (i = 0; i < u; i++) {
                        for (e = 0; e < c; e++) {
                          o = d[m++], s = d[m++], n = d[m++], a = d[m++], l = 255 - r(o * (1 - a / 255) + a), h = 255 - r(s * (1 - a / 255) + a), f = 255 - r(n * (1 - a / 255) + a), p[g++] = l, p[g++] = h, p[g++] = f, p[g++] = 255;
                        }
                      }break;default:
                      throw "Unsupported color mode";}
                } }, t;
            }();e.exports = i;
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14 }], 38: [function (t, e, i) {
          (function (t) {
            function i(e) {
              function i(t) {
                for (var e = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99], i = 0; i < 64; i++) {
                  var n = E((e[i] * t + 50) / 100);n < 1 ? n = 1 : n > 255 && (n = 255), S[j[i]] = n;
                }for (var r = [17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99], a = 0; a < 64; a++) {
                  var o = E((r[a] * t + 50) / 100);o < 1 ? o = 1 : o > 255 && (o = 255), I[j[a]] = o;
                }for (var s = [1, 1.387039845, 1.306562965, 1.175875602, 1, .785694958, .5411961, .275899379], l = 0, h = 0; h < 8; h++) {
                  for (var f = 0; f < 8; f++) {
                    M[l] = 1 / (S[j[l]] * s[h] * s[f] * 8), A[l] = 1 / (I[j[l]] * s[h] * s[f] * 8), l++;
                  }
                }
              }function n(t, e) {
                for (var i = 0, n = 0, r = new Array(), a = 1; a <= 16; a++) {
                  for (var o = 1; o <= t[a]; o++) {
                    r[e[n]] = [], r[e[n]][0] = i, r[e[n]][1] = a, n++, i++;
                  }i *= 2;
                }return r;
              }function r() {
                w = n(H, G), _ = n(Z, Y), y = n(W, q), x = n(X, V);
              }function a() {
                for (var t = 1, e = 2, i = 1; i <= 15; i++) {
                  for (var n = t; n < e; n++) {
                    R[32767 + n] = i, T[32767 + n] = [], T[32767 + n][1] = i, T[32767 + n][0] = n;
                  }for (var r = -(e - 1); r <= -t; r++) {
                    R[32767 + r] = i, T[32767 + r] = [], T[32767 + r][1] = i, T[32767 + r][0] = e - 1 + r;
                  }t <<= 1, e <<= 1;
                }
              }function o() {
                for (var t = 0; t < 256; t++) {
                  F[t] = 19595 * t, F[t + 256 >> 0] = 38470 * t, F[t + 512 >> 0] = 7471 * t + 32768, F[t + 768 >> 0] = -11059 * t, F[t + 1024 >> 0] = -21709 * t, F[t + 1280 >> 0] = 32768 * t + 8421375, F[t + 1536 >> 0] = -27439 * t, F[t + 1792 >> 0] = -5329 * t;
                }
              }function s(t) {
                for (var e = t[0], i = t[1] - 1; i >= 0;) {
                  e & 1 << i && (B |= 1 << z), i--, --z < 0 && (255 == B ? (l(255), l(0)) : l(B), z = 7, B = 0);
                }
              }function l(t) {
                C.push(t);
              }function h(t) {
                l(t >> 8 & 255), l(255 & t);
              }function f(t, e) {
                var i,
                    n,
                    r,
                    a,
                    o,
                    s,
                    l,
                    h,
                    f,
                    c = 0;for (f = 0; f < 8; ++f) {
                  i = t[c], n = t[c + 1], r = t[c + 2], a = t[c + 3], o = t[c + 4], s = t[c + 5], l = t[c + 6], h = t[c + 7];var u = i + h,
                      p = i - h,
                      d = n + l,
                      m = n - l,
                      g = r + s,
                      b = r - s,
                      v = a + o,
                      w = a - o,
                      _ = u + v,
                      y = u - v,
                      x = d + g,
                      k = d - g;t[c] = _ + x, t[c + 4] = _ - x;var E = .707106781 * (k + y);t[c + 2] = y + E, t[c + 6] = y - E, _ = w + b, x = b + m, k = m + p;var S = .382683433 * (_ - k),
                      I = .5411961 * _ + S,
                      M = 1.306562965 * k + S,
                      A = .707106781 * x,
                      T = p + A,
                      R = p - A;t[c + 5] = R + I, t[c + 3] = R - I, t[c + 1] = T + M, t[c + 7] = T - M, c += 8;
                }for (c = 0, f = 0; f < 8; ++f) {
                  i = t[c], n = t[c + 8], r = t[c + 16], a = t[c + 24], o = t[c + 32], s = t[c + 40], l = t[c + 48], h = t[c + 56];var P = i + h,
                      C = i - h,
                      B = n + l,
                      z = n - l,
                      O = r + s,
                      D = r - s,
                      U = a + o,
                      N = a - o,
                      F = P + U,
                      j = P - U,
                      H = B + O,
                      G = B - O;t[c] = F + H, t[c + 32] = F - H;var W = .707106781 * (G + j);t[c + 16] = j + W, t[c + 48] = j - W, F = N + D, H = D + z, G = z + C;var q = .382683433 * (F - G),
                      Z = .5411961 * F + q,
                      Y = 1.306562965 * G + q,
                      X = .707106781 * H,
                      V = C + X,
                      J = C - X;t[c + 40] = J + Z, t[c + 24] = J - Z, t[c + 8] = V + Y, t[c + 56] = V - Y, c++;
                }var $;for (f = 0; f < 64; ++f) {
                  $ = t[f] * e[f], L[f] = $ > 0 ? $ + .5 | 0 : $ - .5 | 0;
                }return L;
              }function c() {
                h(65504), h(16), l(74), l(70), l(73), l(70), l(0), l(1), l(1), l(0), h(1), h(1), l(0), l(0);
              }function u(t, e) {
                h(65472), h(17), l(8), h(e), h(t), l(3), l(1), l(17), l(0), l(2), l(17), l(1), l(3), l(17), l(1);
              }function p() {
                h(65499), h(132), l(0);for (var t = 0; t < 64; t++) {
                  l(S[t]);
                }l(1);for (var e = 0; e < 64; e++) {
                  l(I[e]);
                }
              }function d() {
                h(65476), h(418), l(0);for (var t = 0; t < 16; t++) {
                  l(H[t + 1]);
                }for (var e = 0; e <= 11; e++) {
                  l(G[e]);
                }l(16);for (var i = 0; i < 16; i++) {
                  l(W[i + 1]);
                }for (var n = 0; n <= 161; n++) {
                  l(q[n]);
                }l(1);for (var r = 0; r < 16; r++) {
                  l(Z[r + 1]);
                }for (var a = 0; a <= 11; a++) {
                  l(Y[a]);
                }l(17);for (var o = 0; o < 16; o++) {
                  l(X[o + 1]);
                }for (var s = 0; s <= 161; s++) {
                  l(V[s]);
                }
              }function m() {
                h(65498), h(12), l(3), l(1), l(0), l(2), l(17), l(3), l(17), l(0), l(63), l(0);
              }function g(t, e, i, n, r) {
                for (var a, o = r[0], l = r[240], h = f(t, e), c = 0; c < 64; ++c) {
                  P[j[c]] = h[c];
                }var u = P[0] - i;i = P[0], 0 == u ? s(n[0]) : (a = 32767 + u, s(n[R[a]]), s(T[a]));for (var p = 63; p > 0 && 0 == P[p]; p--) {}if (0 == p) return s(o), i;for (var d, m = 1; m <= p;) {
                  for (var g = m; 0 == P[m] && m <= p; ++m) {}var b = m - g;if (b >= 16) {
                    d = b >> 4;for (var v = 1; v <= d; ++v) {
                      s(l);
                    }b &= 15;
                  }a = 32767 + P[m], s(r[(b << 4) + R[a]]), s(T[a]), m++;
                }return 63 != p && s(o), i;
              }function b() {
                for (var t = String.fromCharCode, e = 0; e < 256; e++) {
                  N[e] = t(e);
                }
              }function v(t) {
                if (t <= 0 && (t = 1), t > 100 && (t = 100), k != t) {
                  var e = 0;e = t < 50 ? Math.floor(5e3 / t) : Math.floor(200 - 2 * t), i(e), k = t;
                }
              }var w,
                  _,
                  y,
                  x,
                  k,
                  E = (Math.round, Math.floor),
                  S = new Array(64),
                  I = new Array(64),
                  M = new Array(64),
                  A = new Array(64),
                  T = new Array(65535),
                  R = new Array(65535),
                  L = new Array(64),
                  P = new Array(64),
                  C = [],
                  B = 0,
                  z = 7,
                  O = new Array(64),
                  D = new Array(64),
                  U = new Array(64),
                  N = new Array(256),
                  F = new Array(2048),
                  j = [0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63],
                  H = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                  G = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                  W = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125],
                  q = [1, 2, 3, 0, 4, 17, 5, 18, 33, 49, 65, 6, 19, 81, 97, 7, 34, 113, 20, 50, 129, 145, 161, 8, 35, 66, 177, 193, 21, 82, 209, 240, 36, 51, 98, 114, 130, 9, 10, 22, 23, 24, 25, 26, 37, 38, 39, 40, 41, 42, 52, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250],
                  Z = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                  Y = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                  X = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119],
                  V = [0, 1, 2, 3, 17, 4, 5, 33, 49, 6, 18, 65, 81, 7, 97, 113, 19, 34, 50, 129, 8, 20, 66, 145, 161, 177, 193, 9, 35, 51, 82, 240, 21, 98, 114, 209, 10, 22, 36, 52, 225, 37, 241, 23, 24, 25, 26, 38, 39, 40, 41, 42, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 130, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 226, 227, 228, 229, 230, 231, 232, 233, 234, 242, 243, 244, 245, 246, 247, 248, 249, 250];this.encode = function (e, i) {
                new Date().getTime();i && v(i), C = new Array(), B = 0, z = 7, h(65496), c(), p(), u(e.width, e.height), d(), m();var n = 0,
                    r = 0,
                    a = 0;B = 0, z = 7, this.encode.displayName = "_encode_";for (var o, l, f, b, k, E, S, I, T, R = e.data, L = e.width, P = e.height, N = 4 * L, j = 0; j < P;) {
                  for (o = 0; o < N;) {
                    for (k = N * j + o, E = k, S = -1, I = 0, T = 0; T < 64; T++) {
                      I = T >> 3, S = 4 * (7 & T), E = k + I * N + S, j + I >= P && (E -= N * (j + 1 + I - P)), o + S >= N && (E -= o + S - N + 4), l = R[E++], f = R[E++], b = R[E++], O[T] = (F[l] + F[f + 256 >> 0] + F[b + 512 >> 0] >> 16) - 128, D[T] = (F[l + 768 >> 0] + F[f + 1024 >> 0] + F[b + 1280 >> 0] >> 16) - 128, U[T] = (F[l + 1280 >> 0] + F[f + 1536 >> 0] + F[b + 1792 >> 0] >> 16) - 128;
                    }n = g(O, M, n, w, y), r = g(D, A, r, _, x), a = g(U, A, a, _, x), o += 32;
                  }j += 8;
                }if (z >= 0) {
                  var H = [];H[1] = z + 1, H[0] = (1 << z + 1) - 1, s(H);
                }return h(65497), new t(C);
              }, function () {
                new Date().getTime();e || (e = 50), b(), r(), a(), o(), v(e), new Date().getTime();
              }();
            }function n(t, e) {
              return void 0 === e && (e = 50), { data: new i(e).encode(t, e), width: t.width, height: t.height };
            }e.exports = n;
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14 }], 39: [function (t, e, i) {
          (function (i) {
            function n(t) {
              return "[object ArrayBuffer]" === Object.prototype.toString.call(t);
            }function r(t) {
              if (u) return c(t, { responseType: "arraybuffer" });if (void 0 === window.XMLHttpRequest) throw new Error("your browser does not support XHR loading");var e = new window.XMLHttpRequest();return e.overrideMimeType("text/plain; charset=x-user-defined"), c({ xhr: e }, t);
            }var a = t("xhr"),
                o = function o() {},
                s = t("parse-bmfont-ascii"),
                l = t("parse-bmfont-xml"),
                h = t("parse-bmfont-binary"),
                f = t("./lib/is-binary"),
                c = t("xtend"),
                u = function () {
              return window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest();
            }();e.exports = function (t, e) {
              e = "function" == typeof e ? e : o, "string" == typeof t ? t = { uri: t } : t || (t = {}), t.binary && (t = r(t)), a(t, function (r, a, c) {
                if (r) return e(r);if (!/^2/.test(a.statusCode)) return e(new Error("http status code: " + a.statusCode));if (!c) return e(new Error("no body result"));var u = !1;n(c) && (c = new i(new Uint8Array(c), "binary")), f(c) && (u = !0, "string" == typeof c && (c = new i(c, "binary"))), u || (i.isBuffer(c) && (c = c.toString(t.encoding)), c = c.trim());var p;try {
                  var d = a.headers["content-type"];p = u ? h(c) : /json/.test(d) || "{" === c.charAt(0) ? JSON.parse(c) : /xml/.test(d) || "<" === c.charAt(0) ? l(c) : s(c);
                } catch (t) {
                  e(new Error("error parsing font " + t.message)), e = o;
                }e(null, p);
              });
            };
          }).call(this, t("buffer").Buffer);
        }, { "./lib/is-binary": 40, buffer: 14, "parse-bmfont-ascii": 54, "parse-bmfont-binary": 55, "parse-bmfont-xml": 56, xhr: 104, xtend: 106 }], 40: [function (t, e, i) {
          (function (i) {
            var n = t("buffer-equal"),
                r = new i([66, 77, 70, 3]);e.exports = function (t) {
              return "string" == typeof t ? "BMF" === t.substring(0, 3) : t.length > 4 && n(t.slice(0, 4), r);
            };
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14, "buffer-equal": 13 }], 41: [function (t, e, i) {
          (function (i) {
            function n() {
              this.types = Object.create(null), this.extensions = Object.create(null);
            }var r = (t("path"), t("fs"));n.prototype.define = function (t) {
              for (var e in t) {
                for (var n = t[e], r = 0; r < n.length; r++) {
                  i.env.DEBUG_MIME && this.types[n] && console.warn(this._loading.replace(/.*\//, ""), 'changes "' + n[r] + '" extension type from ' + this.types[n] + " to " + e), this.types[n[r]] = e;
                }this.extensions[e] || (this.extensions[e] = n[0]);
              }
            }, n.prototype.load = function (t) {
              this._loading = t;var e = {};r.readFileSync(t, "ascii").split(/[\r\n]+/).forEach(function (t) {
                var i = t.replace(/\s*#.*|^\s*|\s*$/g, "").split(/\s+/);e[i.shift()] = i;
              }), this.define(e), this._loading = null;
            }, n.prototype.lookup = function (t, e) {
              var i = t.replace(/.*[\.\/\\]/, "").toLowerCase();return this.types[i] || e || this.default_type;
            }, n.prototype.extension = function (t) {
              var e = t.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();return this.extensions[e];
            };var a = new n();a.define(t("./types.json")), a.default_type = a.lookup("bin"), a.Mime = n, a.charsets = { lookup: function lookup(t, e) {
                return (/^text\//.test(t) ? "UTF-8" : e
                );
              } }, e.exports = a;
          }).call(this, t("_process"));
        }, { "./types.json": 42, _process: 12, fs: 11, path: 59 }], 42: [function (t, e, i) {
          e.exports = { "application/andrew-inset": ["ez"], "application/applixware": ["aw"], "application/atom+xml": ["atom"], "application/atomcat+xml": ["atomcat"], "application/atomsvc+xml": ["atomsvc"], "application/ccxml+xml": ["ccxml"], "application/cdmi-capability": ["cdmia"], "application/cdmi-container": ["cdmic"], "application/cdmi-domain": ["cdmid"], "application/cdmi-object": ["cdmio"], "application/cdmi-queue": ["cdmiq"], "application/cu-seeme": ["cu"], "application/dash+xml": ["mdp"], "application/davmount+xml": ["davmount"], "application/docbook+xml": ["dbk"], "application/dssc+der": ["dssc"], "application/dssc+xml": ["xdssc"], "application/ecmascript": ["ecma"], "application/emma+xml": ["emma"], "application/epub+zip": ["epub"], "application/exi": ["exi"], "application/font-tdpfr": ["pfr"], "application/font-woff": ["woff"], "application/font-woff2": ["woff2"], "application/gml+xml": ["gml"], "application/gpx+xml": ["gpx"], "application/gxf": ["gxf"], "application/hyperstudio": ["stk"], "application/inkml+xml": ["ink", "inkml"], "application/ipfix": ["ipfix"], "application/java-archive": ["jar"], "application/java-serialized-object": ["ser"], "application/java-vm": ["class"], "application/javascript": ["js"], "application/json": ["json", "map"], "application/json5": ["json5"], "application/jsonml+json": ["jsonml"], "application/lost+xml": ["lostxml"], "application/mac-binhex40": ["hqx"], "application/mac-compactpro": ["cpt"], "application/mads+xml": ["mads"], "application/marc": ["mrc"], "application/marcxml+xml": ["mrcx"], "application/mathematica": ["ma", "nb", "mb"], "application/mathml+xml": ["mathml"],
            "application/mbox": ["mbox"], "application/mediaservercontrol+xml": ["mscml"], "application/metalink+xml": ["metalink"], "application/metalink4+xml": ["meta4"], "application/mets+xml": ["mets"], "application/mods+xml": ["mods"], "application/mp21": ["m21", "mp21"], "application/mp4": ["mp4s", "m4p"], "application/msword": ["doc", "dot"], "application/mxf": ["mxf"], "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "buffer"], "application/oda": ["oda"], "application/oebps-package+xml": ["opf"], "application/ogg": ["ogx"], "application/omdoc+xml": ["omdoc"], "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"], "application/oxps": ["oxps"], "application/patch-ops-error+xml": ["xer"], "application/pdf": ["pdf"], "application/pgp-encrypted": ["pgp"], "application/pgp-signature": ["asc", "sig"], "application/pics-rules": ["prf"], "application/pkcs10": ["p10"], "application/pkcs7-mime": ["p7m", "p7c"], "application/pkcs7-signature": ["p7s"], "application/pkcs8": ["p8"], "application/pkix-attr-cert": ["ac"], "application/pkix-cert": ["cer"], "application/pkix-crl": ["crl"], "application/pkix-pkipath": ["pkipath"], "application/pkixcmp": ["pki"], "application/pls+xml": ["pls"], "application/postscript": ["ai", "eps", "ps"], "application/prs.cww": ["cww"], "application/pskc+xml": ["pskcxml"], "application/rdf+xml": ["rdf"], "application/reginfo+xml": ["rif"], "application/relax-ng-compact-syntax": ["rnc"], "application/resource-lists+xml": ["rl"], "application/resource-lists-diff+xml": ["rld"], "application/rls-services+xml": ["rs"], "application/rpki-ghostbusters": ["gbr"], "application/rpki-manifest": ["mft"], "application/rpki-roa": ["roa"], "application/rsd+xml": ["rsd"], "application/rss+xml": ["rss"], "application/rtf": ["rtf"], "application/sbml+xml": ["sbml"], "application/scvp-cv-request": ["scq"], "application/scvp-cv-response": ["scs"], "application/scvp-vp-request": ["spq"], "application/scvp-vp-response": ["spp"], "application/sdp": ["sdp"], "application/set-payment-initiation": ["setpay"], "application/set-registration-initiation": ["setreg"], "application/shf+xml": ["shf"], "application/smil+xml": ["smi", "smil"], "application/sparql-query": ["rq"], "application/sparql-results+xml": ["srx"], "application/srgs": ["gram"], "application/srgs+xml": ["grxml"], "application/sru+xml": ["sru"], "application/ssdl+xml": ["ssdl"], "application/ssml+xml": ["ssml"], "application/tei+xml": ["tei", "teicorpus"], "application/thraud+xml": ["tfi"], "application/timestamped-data": ["tsd"], "application/vnd.3gpp.pic-bw-large": ["plb"], "application/vnd.3gpp.pic-bw-small": ["psb"], "application/vnd.3gpp.pic-bw-var": ["pvb"], "application/vnd.3gpp2.tcap": ["tcap"], "application/vnd.3m.post-it-notes": ["pwn"], "application/vnd.accpac.simply.aso": ["aso"], "application/vnd.accpac.simply.imp": ["imp"], "application/vnd.acucobol": ["acu"], "application/vnd.acucorp": ["atc", "acutc"], "application/vnd.adobe.air-application-installer-package+zip": ["air"], "application/vnd.adobe.formscentral.fcdt": ["fcdt"], "application/vnd.adobe.fxp": ["fxp", "fxpl"], "application/vnd.adobe.xdp+xml": ["xdp"], "application/vnd.adobe.xfdf": ["xfdf"], "application/vnd.ahead.space": ["ahead"], "application/vnd.airzip.filesecure.azf": ["azf"], "application/vnd.airzip.filesecure.azs": ["azs"], "application/vnd.amazon.ebook": ["azw"], "application/vnd.americandynamics.acc": ["acc"], "application/vnd.amiga.ami": ["ami"], "application/vnd.android.package-archive": ["apk"], "application/vnd.anser-web-certificate-issue-initiation": ["cii"], "application/vnd.anser-web-funds-transfer-initiation": ["fti"], "application/vnd.antix.game-component": ["atx"], "application/vnd.apple.installer+xml": ["mpkg"], "application/vnd.apple.mpegurl": ["m3u8"], "application/vnd.aristanetworks.swi": ["swi"], "application/vnd.astraea-software.iota": ["iota"], "application/vnd.audiograph": ["aep"], "application/vnd.blueice.multipass": ["mpm"], "application/vnd.bmi": ["bmi"], "application/vnd.businessobjects": ["rep"], "application/vnd.chemdraw+xml": ["cdxml"], "application/vnd.chipnuts.karaoke-mmd": ["mmd"], "application/vnd.cinderella": ["cdy"], "application/vnd.claymore": ["cla"], "application/vnd.cloanto.rp9": ["rp9"], "application/vnd.clonk.c4group": ["c4g", "c4d", "c4f", "c4p", "c4u"], "application/vnd.cluetrust.cartomobile-config": ["c11amc"], "application/vnd.cluetrust.cartomobile-config-pkg": ["c11amz"], "application/vnd.commonspace": ["csp"], "application/vnd.contact.cmsg": ["cdbcmsg"], "application/vnd.cosmocaller": ["cmc"], "application/vnd.crick.clicker": ["clkx"], "application/vnd.crick.clicker.keyboard": ["clkk"], "application/vnd.crick.clicker.palette": ["clkp"], "application/vnd.crick.clicker.template": ["clkt"], "application/vnd.crick.clicker.wordbank": ["clkw"], "application/vnd.criticaltools.wbs+xml": ["wbs"], "application/vnd.ctc-posml": ["pml"], "application/vnd.cups-ppd": ["ppd"], "application/vnd.curl.car": ["car"], "application/vnd.curl.pcurl": ["pcurl"], "application/vnd.dart": ["dart"], "application/vnd.data-vision.rdz": ["rdz"], "application/vnd.dece.data": ["uvf", "uvvf", "uvd", "uvvd"], "application/vnd.dece.ttml+xml": ["uvt", "uvvt"], "application/vnd.dece.unspecified": ["uvx", "uvvx"], "application/vnd.dece.zip": ["uvz", "uvvz"], "application/vnd.denovo.fcselayout-link": ["fe_launch"], "application/vnd.dna": ["dna"], "application/vnd.dolby.mlp": ["mlp"], "application/vnd.dpgraph": ["dpg"], "application/vnd.dreamfactory": ["dfac"], "application/vnd.ds-keypoint": ["kpxx"], "application/vnd.dvb.ait": ["ait"], "application/vnd.dvb.service": ["svc"], "application/vnd.dynageo": ["geo"], "application/vnd.ecowin.chart": ["mag"], "application/vnd.enliven": ["nml"], "application/vnd.epson.esf": ["esf"], "application/vnd.epson.msf": ["msf"], "application/vnd.epson.quickanime": ["qam"], "application/vnd.epson.salt": ["slt"], "application/vnd.epson.ssf": ["ssf"], "application/vnd.eszigno3+xml": ["es3", "et3"], "application/vnd.ezpix-album": ["ez2"], "application/vnd.ezpix-package": ["ez3"], "application/vnd.fdf": ["fdf"], "application/vnd.fdsn.mseed": ["mseed"], "application/vnd.fdsn.seed": ["seed", "dataless"], "application/vnd.flographit": ["gph"], "application/vnd.fluxtime.clip": ["ftc"], "application/vnd.framemaker": ["fm", "frame", "maker", "book"], "application/vnd.frogans.fnc": ["fnc"], "application/vnd.frogans.ltf": ["ltf"], "application/vnd.fsc.weblaunch": ["fsc"], "application/vnd.fujitsu.oasys": ["oas"], "application/vnd.fujitsu.oasys2": ["oa2"], "application/vnd.fujitsu.oasys3": ["oa3"], "application/vnd.fujitsu.oasysgp": ["fg5"], "application/vnd.fujitsu.oasysprs": ["bh2"], "application/vnd.fujixerox.ddd": ["ddd"], "application/vnd.fujixerox.docuworks": ["xdw"], "application/vnd.fujixerox.docuworks.binder": ["xbd"], "application/vnd.fuzzysheet": ["fzs"], "application/vnd.genomatix.tuxedo": ["txd"], "application/vnd.geogebra.file": ["ggb"], "application/vnd.geogebra.tool": ["ggt"], "application/vnd.geometry-explorer": ["gex", "gre"], "application/vnd.geonext": ["gxt"], "application/vnd.geoplan": ["g2w"], "application/vnd.geospace": ["g3w"], "application/vnd.gmx": ["gmx"], "application/vnd.google-earth.kml+xml": ["kml"], "application/vnd.google-earth.kmz": ["kmz"], "application/vnd.grafeq": ["gqf", "gqs"], "application/vnd.groove-account": ["gac"], "application/vnd.groove-help": ["ghf"], "application/vnd.groove-identity-message": ["gim"], "application/vnd.groove-injector": ["grv"], "application/vnd.groove-tool-message": ["gtm"], "application/vnd.groove-tool-template": ["tpl"], "application/vnd.groove-vcard": ["vcg"], "application/vnd.hal+xml": ["hal"], "application/vnd.handheld-entertainment+xml": ["zmm"], "application/vnd.hbci": ["hbci"], "application/vnd.hhe.lesson-player": ["les"], "application/vnd.hp-hpgl": ["hpgl"], "application/vnd.hp-hpid": ["hpid"], "application/vnd.hp-hps": ["hps"], "application/vnd.hp-jlyt": ["jlt"], "application/vnd.hp-pcl": ["pcl"], "application/vnd.hp-pclxl": ["pclxl"], "application/vnd.ibm.minipay": ["mpy"], "application/vnd.ibm.modcap": ["afp", "listafp", "list3820"], "application/vnd.ibm.rights-management": ["irm"], "application/vnd.ibm.secure-container": ["sc"], "application/vnd.iccprofile": ["icc", "icm"], "application/vnd.igloader": ["igl"], "application/vnd.immervision-ivp": ["ivp"], "application/vnd.immervision-ivu": ["ivu"], "application/vnd.insors.igm": ["igm"], "application/vnd.intercon.formnet": ["xpw", "xpx"], "application/vnd.intergeo": ["i2g"], "application/vnd.intu.qbo": ["qbo"], "application/vnd.intu.qfx": ["qfx"], "application/vnd.ipunplugged.rcprofile": ["rcprofile"], "application/vnd.irepository.package+xml": ["irp"], "application/vnd.is-xpr": ["xpr"], "application/vnd.isac.fcs": ["fcs"], "application/vnd.jam": ["jam"], "application/vnd.jcp.javame.midlet-rms": ["rms"], "application/vnd.jisp": ["jisp"], "application/vnd.joost.joda-archive": ["joda"], "application/vnd.kahootz": ["ktz", "ktr"], "application/vnd.kde.karbon": ["karbon"], "application/vnd.kde.kchart": ["chrt"], "application/vnd.kde.kformula": ["kfo"], "application/vnd.kde.kivio": ["flw"], "application/vnd.kde.kontour": ["kon"], "application/vnd.kde.kpresenter": ["kpr", "kpt"], "application/vnd.kde.kspread": ["ksp"], "application/vnd.kde.kword": ["kwd", "kwt"], "application/vnd.kenameaapp": ["htke"], "application/vnd.kidspiration": ["kia"], "application/vnd.kinar": ["kne", "knp"], "application/vnd.koan": ["skp", "skd", "skt", "skm"], "application/vnd.kodak-descriptor": ["sse"], "application/vnd.las.las+xml": ["lasxml"], "application/vnd.llamagraphics.life-balance.desktop": ["lbd"], "application/vnd.llamagraphics.life-balance.exchange+xml": ["lbe"], "application/vnd.lotus-1-2-3": ["123"], "application/vnd.lotus-approach": ["apr"], "application/vnd.lotus-freelance": ["pre"], "application/vnd.lotus-notes": ["nsf"], "application/vnd.lotus-organizer": ["org"], "application/vnd.lotus-screencam": ["scm"], "application/vnd.lotus-wordpro": ["lwp"], "application/vnd.macports.portpkg": ["portpkg"], "application/vnd.mcd": ["mcd"], "application/vnd.medcalcdata": ["mc1"], "application/vnd.mediastation.cdkey": ["cdkey"], "application/vnd.mfer": ["mwf"], "application/vnd.mfmp": ["mfm"], "application/vnd.micrografx.flo": ["flo"], "application/vnd.micrografx.igx": ["igx"], "application/vnd.mif": ["mif"], "application/vnd.mobius.daf": ["daf"], "application/vnd.mobius.dis": ["dis"], "application/vnd.mobius.mbk": ["mbk"], "application/vnd.mobius.mqy": ["mqy"], "application/vnd.mobius.msl": ["msl"], "application/vnd.mobius.plc": ["plc"], "application/vnd.mobius.txf": ["txf"], "application/vnd.mophun.application": ["mpn"], "application/vnd.mophun.certificate": ["mpc"], "application/vnd.mozilla.xul+xml": ["xul"], "application/vnd.ms-artgalry": ["cil"], "application/vnd.ms-cab-compressed": ["cab"], "application/vnd.ms-excel": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"], "application/vnd.ms-excel.addin.macroenabled.12": ["xlam"], "application/vnd.ms-excel.sheet.binary.macroenabled.12": ["xlsb"], "application/vnd.ms-excel.sheet.macroenabled.12": ["xlsm"], "application/vnd.ms-excel.template.macroenabled.12": ["xltm"], "application/vnd.ms-fontobject": ["eot"], "application/vnd.ms-htmlhelp": ["chm"], "application/vnd.ms-ims": ["ims"], "application/vnd.ms-lrm": ["lrm"], "application/vnd.ms-officetheme": ["thmx"], "application/vnd.ms-pki.seccat": ["cat"], "application/vnd.ms-pki.stl": ["stl"], "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"], "application/vnd.ms-powerpoint.addin.macroenabled.12": ["ppam"], "application/vnd.ms-powerpoint.presentation.macroenabled.12": ["pptm"], "application/vnd.ms-powerpoint.slide.macroenabled.12": ["sldm"], "application/vnd.ms-powerpoint.slideshow.macroenabled.12": ["ppsm"], "application/vnd.ms-powerpoint.template.macroenabled.12": ["potm"], "application/vnd.ms-project": ["mpp", "mpt"], "application/vnd.ms-word.document.macroenabled.12": ["docm"], "application/vnd.ms-word.template.macroenabled.12": ["dotm"], "application/vnd.ms-works": ["wps", "wks", "wcm", "wdb"], "application/vnd.ms-wpl": ["wpl"], "application/vnd.ms-xpsdocument": ["xps"], "application/vnd.mseq": ["mseq"], "application/vnd.musician": ["mus"], "application/vnd.muvee.style": ["msty"], "application/vnd.mynfc": ["taglet"], "application/vnd.neurolanguage.nlu": ["nlu"], "application/vnd.nitf": ["ntf", "nitf"], "application/vnd.noblenet-directory": ["nnd"], "application/vnd.noblenet-sealer": ["nns"], "application/vnd.noblenet-web": ["nnw"], "application/vnd.nokia.n-gage.data": ["ngdat"], "application/vnd.nokia.radio-preset": ["rpst"], "application/vnd.nokia.radio-presets": ["rpss"], "application/vnd.novadigm.edm": ["edm"], "application/vnd.novadigm.edx": ["edx"], "application/vnd.novadigm.ext": ["ext"], "application/vnd.oasis.opendocument.chart": ["odc"], "application/vnd.oasis.opendocument.chart-template": ["otc"], "application/vnd.oasis.opendocument.database": ["odb"], "application/vnd.oasis.opendocument.formula": ["odf"], "application/vnd.oasis.opendocument.formula-template": ["odft"], "application/vnd.oasis.opendocument.graphics": ["odg"], "application/vnd.oasis.opendocument.graphics-template": ["otg"], "application/vnd.oasis.opendocument.image": ["odi"], "application/vnd.oasis.opendocument.image-template": ["oti"], "application/vnd.oasis.opendocument.presentation": ["odp"], "application/vnd.oasis.opendocument.presentation-template": ["otp"], "application/vnd.oasis.opendocument.spreadsheet": ["ods"], "application/vnd.oasis.opendocument.spreadsheet-template": ["ots"], "application/vnd.oasis.opendocument.text": ["odt"], "application/vnd.oasis.opendocument.text-master": ["odm"], "application/vnd.oasis.opendocument.text-template": ["ott"], "application/vnd.oasis.opendocument.text-web": ["oth"], "application/vnd.olpc-sugar": ["xo"], "application/vnd.oma.dd2+xml": ["dd2"], "application/vnd.openofficeorg.extension": ["oxt"], "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"], "application/vnd.openxmlformats-officedocument.presentationml.slide": ["sldx"], "application/vnd.openxmlformats-officedocument.presentationml.slideshow": ["ppsx"], "application/vnd.openxmlformats-officedocument.presentationml.template": ["potx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.template": ["xltx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.template": ["dotx"], "application/vnd.osgeo.mapguide.package": ["mgp"], "application/vnd.osgi.dp": ["dp"], "application/vnd.osgi.subsystem": ["esa"], "application/vnd.palm": ["pdb", "pqa", "oprc"], "application/vnd.pawaafile": ["paw"], "application/vnd.pg.format": ["str"], "application/vnd.pg.osasli": ["ei6"], "application/vnd.picsel": ["efif"], "application/vnd.pmi.widget": ["wg"], "application/vnd.pocketlearn": ["plf"], "application/vnd.powerbuilder6": ["pbd"], "application/vnd.previewsystems.box": ["box"], "application/vnd.proteus.magazine": ["mgz"], "application/vnd.publishare-delta-tree": ["qps"], "application/vnd.pvi.ptid1": ["ptid"], "application/vnd.quark.quarkxpress": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"], "application/vnd.realvnc.bed": ["bed"], "application/vnd.recordare.musicxml": ["mxl"], "application/vnd.recordare.musicxml+xml": ["musicxml"], "application/vnd.rig.cryptonote": ["cryptonote"], "application/vnd.rim.cod": ["cod"], "application/vnd.rn-realmedia": ["rm"], "application/vnd.rn-realmedia-vbr": ["rmvb"], "application/vnd.route66.link66+xml": ["link66"], "application/vnd.sailingtracker.track": ["st"], "application/vnd.seemail": ["see"], "application/vnd.sema": ["sema"], "application/vnd.semd": ["semd"], "application/vnd.semf": ["semf"], "application/vnd.shana.informed.formdata": ["ifm"], "application/vnd.shana.informed.formtemplate": ["itp"], "application/vnd.shana.informed.interchange": ["iif"], "application/vnd.shana.informed.package": ["ipk"], "application/vnd.simtech-mindmapper": ["twd", "twds"], "application/vnd.smaf": ["mmf"], "application/vnd.smart.teacher": ["teacher"], "application/vnd.solent.sdkm+xml": ["sdkm", "sdkd"], "application/vnd.spotfire.dxp": ["dxp"], "application/vnd.spotfire.sfs": ["sfs"], "application/vnd.stardivision.calc": ["sdc"], "application/vnd.stardivision.draw": ["sda"], "application/vnd.stardivision.impress": ["sdd"], "application/vnd.stardivision.math": ["smf"], "application/vnd.stardivision.writer": ["sdw", "vor"], "application/vnd.stardivision.writer-global": ["sgl"], "application/vnd.stepmania.package": ["smzip"], "application/vnd.stepmania.stepchart": ["sm"], "application/vnd.sun.xml.calc": ["sxc"], "application/vnd.sun.xml.calc.template": ["stc"], "application/vnd.sun.xml.draw": ["sxd"], "application/vnd.sun.xml.draw.template": ["std"], "application/vnd.sun.xml.impress": ["sxi"], "application/vnd.sun.xml.impress.template": ["sti"], "application/vnd.sun.xml.math": ["sxm"], "application/vnd.sun.xml.writer": ["sxw"], "application/vnd.sun.xml.writer.global": ["sxg"], "application/vnd.sun.xml.writer.template": ["stw"], "application/vnd.sus-calendar": ["sus", "susp"], "application/vnd.svd": ["svd"], "application/vnd.symbian.install": ["sis", "sisx"], "application/vnd.syncml+xml": ["xsm"], "application/vnd.syncml.dm+wbxml": ["bdm"], "application/vnd.syncml.dm+xml": ["xdm"], "application/vnd.tao.intent-module-archive": ["tao"], "application/vnd.tcpdump.pcap": ["pcap", "cap", "dmp"], "application/vnd.tmobile-livetv": ["tmo"], "application/vnd.trid.tpt": ["tpt"], "application/vnd.triscape.mxs": ["mxs"], "application/vnd.trueapp": ["tra"], "application/vnd.ufdl": ["ufd", "ufdl"], "application/vnd.uiq.theme": ["utz"], "application/vnd.umajin": ["umj"], "application/vnd.unity": ["unityweb"], "application/vnd.uoml+xml": ["uoml"], "application/vnd.vcx": ["vcx"], "application/vnd.visio": ["vsd", "vst", "vss", "vsw"], "application/vnd.visionary": ["vis"], "application/vnd.vsf": ["vsf"], "application/vnd.wap.wbxml": ["wbxml"], "application/vnd.wap.wmlc": ["wmlc"], "application/vnd.wap.wmlscriptc": ["wmlsc"], "application/vnd.webturbo": ["wtb"], "application/vnd.wolfram.player": ["nbp"], "application/vnd.wordperfect": ["wpd"], "application/vnd.wqd": ["wqd"], "application/vnd.wt.stf": ["stf"], "application/vnd.xara": ["xar"], "application/vnd.xfdl": ["xfdl"], "application/vnd.yamaha.hv-dic": ["hvd"], "application/vnd.yamaha.hv-script": ["hvs"], "application/vnd.yamaha.hv-voice": ["hvp"], "application/vnd.yamaha.openscoreformat": ["osf"], "application/vnd.yamaha.openscoreformat.osfpvg+xml": ["osfpvg"], "application/vnd.yamaha.smaf-audio": ["saf"], "application/vnd.yamaha.smaf-phrase": ["spf"], "application/vnd.yellowriver-custom-menu": ["cmp"], "application/vnd.zul": ["zir", "zirz"], "application/vnd.zzazz.deck+xml": ["zaz"], "application/voicexml+xml": ["vxml"], "application/widget": ["wgt"], "application/winhlp": ["hlp"], "application/wsdl+xml": ["wsdl"], "application/wspolicy+xml": ["wspolicy"], "application/x-7z-compressed": ["7z"], "application/x-abiword": ["abw"], "application/x-ace-compressed": ["ace"], "application/x-apple-diskimage": ["dmg"], "application/x-authorware-bin": ["aab", "x32", "u32", "vox"], "application/x-authorware-map": ["aam"], "application/x-authorware-seg": ["aas"], "application/x-bcpio": ["bcpio"], "application/x-bittorrent": ["torrent"], "application/x-blorb": ["blb", "blorb"], "application/x-bzip": ["bz"], "application/x-bzip2": ["bz2", "boz"], "application/x-cbr": ["cbr", "cba", "cbt", "cbz", "cb7"], "application/x-cdlink": ["vcd"], "application/x-cfs-compressed": ["cfs"], "application/x-chat": ["chat"], "application/x-chess-pgn": ["pgn"], "application/x-chrome-extension": ["crx"], "application/x-conference": ["nsc"], "application/x-cpio": ["cpio"], "application/x-csh": ["csh"], "application/x-debian-package": ["deb", "udeb"], "application/x-dgc-compressed": ["dgc"], "application/x-director": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"], "application/x-doom": ["wad"], "application/x-dtbncx+xml": ["ncx"], "application/x-dtbook+xml": ["dtb"], "application/x-dtbresource+xml": ["res"], "application/x-dvi": ["dvi"], "application/x-envoy": ["evy"], "application/x-eva": ["eva"], "application/x-font-bdf": ["bdf"], "application/x-font-ghostscript": ["gsf"], "application/x-font-linux-psf": ["psf"], "application/x-font-otf": ["otf"], "application/x-font-pcf": ["pcf"], "application/x-font-snf": ["snf"], "application/x-font-ttf": ["ttf", "ttc"], "application/x-font-type1": ["pfa", "pfb", "pfm", "afm"], "application/x-freearc": ["arc"], "application/x-futuresplash": ["spl"], "application/x-gca-compressed": ["gca"], "application/x-glulx": ["ulx"], "application/x-gnumeric": ["gnumeric"], "application/x-gramps-xml": ["gramps"], "application/x-gtar": ["gtar"], "application/x-hdf": ["hdf"], "application/x-install-instructions": ["install"], "application/x-iso9660-image": ["iso"], "application/x-java-jnlp-file": ["jnlp"], "application/x-latex": ["latex"], "application/x-lua-bytecode": ["luac"], "application/x-lzh-compressed": ["lzh", "lha"], "application/x-mie": ["mie"], "application/x-mobipocket-ebook": ["prc", "mobi"], "application/x-ms-application": ["application"], "application/x-ms-shortcut": ["lnk"], "application/x-ms-wmd": ["wmd"], "application/x-ms-wmz": ["wmz"], "application/x-ms-xbap": ["xbap"], "application/x-msaccess": ["mdb"], "application/x-msbinder": ["obd"], "application/x-mscardfile": ["crd"], "application/x-msclip": ["clp"], "application/x-msdownload": ["exe", "dll", "com", "bat", "msi"], "application/x-msmediaview": ["mvb", "m13", "m14"], "application/x-msmetafile": ["wmf", "wmz", "emf", "emz"], "application/x-msmoney": ["mny"], "application/x-mspublisher": ["pub"], "application/x-msschedule": ["scd"], "application/x-msterminal": ["trm"], "application/x-mswrite": ["wri"], "application/x-netcdf": ["nc", "cdf"], "application/x-nzb": ["nzb"], "application/x-pkcs12": ["p12", "pfx"], "application/x-pkcs7-certificates": ["p7b", "spc"], "application/x-pkcs7-certreqresp": ["p7r"], "application/x-rar-compressed": ["rar"], "application/x-research-info-systems": ["ris"], "application/x-sh": ["sh"], "application/x-shar": ["shar"], "application/x-shockwave-flash": ["swf"], "application/x-silverlight-app": ["xap"], "application/x-sql": ["sql"], "application/x-stuffit": ["sit"], "application/x-stuffitx": ["sitx"], "application/x-subrip": ["srt"], "application/x-sv4cpio": ["sv4cpio"], "application/x-sv4crc": ["sv4crc"], "application/x-t3vm-image": ["t3"], "application/x-tads": ["gam"], "application/x-tar": ["tar"], "application/x-tcl": ["tcl"], "application/x-tex": ["tex"], "application/x-tex-tfm": ["tfm"], "application/x-texinfo": ["texinfo", "texi"], "application/x-tgif": ["obj"], "application/x-ustar": ["ustar"], "application/x-wais-source": ["src"], "application/x-web-app-manifest+json": ["webapp"], "application/x-x509-ca-cert": ["der", "crt"], "application/x-xfig": ["fig"], "application/x-xliff+xml": ["xlf"], "application/x-xpinstall": ["xpi"], "application/x-xz": ["xz"], "application/x-zmachine": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"], "application/xaml+xml": ["xaml"], "application/xcap-diff+xml": ["xdf"], "application/xenc+xml": ["xenc"], "application/xhtml+xml": ["xhtml", "xht"], "application/xml": ["xml", "xsl", "xsd"], "application/xml-dtd": ["dtd"], "application/xop+xml": ["xop"], "application/xproc+xml": ["xpl"], "application/xslt+xml": ["xslt"], "application/xspf+xml": ["xspf"], "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"], "application/yang": ["yang"], "application/yin+xml": ["yin"], "application/zip": ["zip"], "audio/adpcm": ["adp"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mp4": ["mp4a", "m4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/vnd.dece.audio": ["uva", "uvva"], "audio/vnd.digital-winds": ["eol"], "audio/vnd.dra": ["dra"], "audio/vnd.dts": ["dts"], "audio/vnd.dts.hd": ["dtshd"], "audio/vnd.lucent.voice": ["lvp"], "audio/vnd.ms-playready.media.pya": ["pya"], "audio/vnd.nuera.ecelp4800": ["ecelp4800"], "audio/vnd.nuera.ecelp7470": ["ecelp7470"], "audio/vnd.nuera.ecelp9600": ["ecelp9600"], "audio/vnd.rip": ["rip"], "audio/webm": ["weba"], "audio/x-aac": ["aac"], "audio/x-aiff": ["aif", "aiff", "aifc"], "audio/x-caf": ["caf"], "audio/x-flac": ["flac"], "audio/x-matroska": ["mka"], "audio/x-mpegurl": ["m3u"], "audio/x-ms-wax": ["wax"], "audio/x-ms-wma": ["wma"], "audio/x-pn-realaudio": ["ram", "ra"], "audio/x-pn-realaudio-plugin": ["rmp"], "audio/x-wav": ["wav"], "audio/xm": ["xm"], "chemical/x-cdx": ["cdx"], "chemical/x-cif": ["cif"], "chemical/x-cmdf": ["cmdf"], "chemical/x-cml": ["cml"], "chemical/x-csml": ["csml"], "chemical/x-xyz": ["xyz"], "font/opentype": ["otf"], "image/bmp": ["bmp"], "image/cgm": ["cgm"], "image/g3fax": ["g3"], "image/gif": ["gif"], "image/ief": ["ief"], "image/jpeg": ["jpeg", "jpg", "jpe"], "image/ktx": ["ktx"], "image/png": ["png"], "image/prs.btif": ["btif"], "image/sgi": ["sgi"], "image/svg+xml": ["svg", "svgz"], "image/tiff": ["tiff", "tif"], "image/vnd.adobe.photoshop": ["psd"], "image/vnd.dece.graphic": ["uvi", "uvvi", "uvg", "uvvg"], "image/vnd.djvu": ["djvu", "djv"], "image/vnd.dvb.subtitle": ["sub"], "image/vnd.dwg": ["dwg"], "image/vnd.dxf": ["dxf"], "image/vnd.fastbidsheet": ["fbs"], "image/vnd.fpx": ["fpx"], "image/vnd.fst": ["fst"], "image/vnd.fujixerox.edmics-mmr": ["mmr"], "image/vnd.fujixerox.edmics-rlc": ["rlc"], "image/vnd.ms-modi": ["mdi"], "image/vnd.ms-photo": ["wdp"], "image/vnd.net-fpx": ["npx"], "image/vnd.wap.wbmp": ["wbmp"], "image/vnd.xiff": ["xif"], "image/webp": ["webp"], "image/x-3ds": ["3ds"], "image/x-cmu-raster": ["ras"], "image/x-cmx": ["cmx"], "image/x-freehand": ["fh", "fhc", "fh4", "fh5", "fh7"], "image/x-icon": ["ico"], "image/x-mrsid-image": ["sid"], "image/x-pcx": ["pcx"], "image/x-pict": ["pic", "pct"], "image/x-portable-anymap": ["pnm"], "image/x-portable-bitmap": ["pbm"], "image/x-portable-graymap": ["pgm"], "image/x-portable-pixmap": ["ppm"], "image/x-rgb": ["rgb"], "image/x-tga": ["tga"], "image/x-xbitmap": ["xbm"], "image/x-xpixmap": ["xpm"], "image/x-xwindowdump": ["xwd"], "message/rfc822": ["eml", "mime"], "model/iges": ["igs", "iges"], "model/mesh": ["msh", "mesh", "silo"], "model/vnd.collada+xml": ["dae"], "model/vnd.dwf": ["dwf"], "model/vnd.gdl": ["gdl"], "model/vnd.gtw": ["gtw"], "model/vnd.mts": ["mts"], "model/vnd.vtu": ["vtu"], "model/vrml": ["wrl", "vrml"], "model/x3d+binary": ["x3db", "x3dbz"], "model/x3d+vrml": ["x3dv", "x3dvz"], "model/x3d+xml": ["x3d", "x3dz"], "text/cache-manifest": ["appcache", "manifest"], "text/calendar": ["ics", "ifb"], "text/coffeescript": ["coffee"], "text/css": ["css"], "text/csv": ["csv"], "text/hjson": ["hjson"], "text/html": ["html", "htm"], "text/jade": ["jade"], "text/jsx": ["jsx"], "text/less": ["less"], "text/n3": ["n3"], "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"], "text/prs.lines.tag": ["dsc"], "text/richtext": ["rtx"], "text/sgml": ["sgml", "sgm"], "text/stylus": ["stylus", "styl"], "text/tab-separated-values": ["tsv"], "text/troff": ["t", "tr", "roff", "man", "me", "ms"], "text/turtle": ["ttl"], "text/uri-list": ["uri", "uris", "urls"], "text/vcard": ["vcard"], "text/vnd.curl": ["curl"], "text/vnd.curl.dcurl": ["dcurl"], "text/vnd.curl.mcurl": ["mcurl"], "text/vnd.curl.scurl": ["scurl"], "text/vnd.dvb.subtitle": ["sub"], "text/vnd.fly": ["fly"], "text/vnd.fmi.flexstor": ["flx"], "text/vnd.graphviz": ["gv"], "text/vnd.in3d.3dml": ["3dml"], "text/vnd.in3d.spot": ["spot"], "text/vnd.sun.j2me.app-descriptor": ["jad"], "text/vnd.wap.wml": ["wml"], "text/vnd.wap.wmlscript": ["wmls"], "text/vtt": ["vtt"], "text/x-asm": ["s", "asm"], "text/x-c": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"], "text/x-component": ["htc"], "text/x-fortran": ["f", "for", "f77", "f90"], "text/x-handlebars-template": ["hbs"], "text/x-java-source": ["java"], "text/x-lua": ["lua"], "text/x-markdown": ["markdown", "md", "mkd"], "text/x-nfo": ["nfo"], "text/x-opml": ["opml"], "text/x-pascal": ["p", "pas"], "text/x-sass": ["sass"], "text/x-scss": ["scss"], "text/x-setext": ["etx"], "text/x-sfv": ["sfv"], "text/x-uuencode": ["uu"], "text/x-vcalendar": ["vcs"], "text/x-vcard": ["vcf"], "text/yaml": ["yaml", "yml"], "video/3gpp": ["3gp"], "video/3gpp2": ["3g2"], "video/h261": ["h261"], "video/h263": ["h263"], "video/h264": ["h264"], "video/jpeg": ["jpgv"], "video/jpm": ["jpm", "jpgm"], "video/mj2": ["mj2", "mjp2"], "video/mp2t": ["ts"], "video/mp4": ["mp4", "mp4v", "mpg4"], "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"], "video/ogg": ["ogv"], "video/quicktime": ["qt", "mov"], "video/vnd.dece.hd": ["uvh", "uvvh"], "video/vnd.dece.mobile": ["uvm", "uvvm"], "video/vnd.dece.pd": ["uvp", "uvvp"], "video/vnd.dece.sd": ["uvs", "uvvs"], "video/vnd.dece.video": ["uvv", "uvvv"], "video/vnd.dvb.file": ["dvb"], "video/vnd.fvt": ["fvt"], "video/vnd.mpegurl": ["mxu", "m4u"], "video/vnd.ms-playready.media.pyv": ["pyv"], "video/vnd.uvvu.mp4": ["uvu", "uvvu"], "video/vnd.vivo": ["viv"], "video/webm": ["webm"], "video/x-f4v": ["f4v"], "video/x-fli": ["fli"], "video/x-flv": ["flv"], "video/x-m4v": ["m4v"], "video/x-matroska": ["mkv", "mk3d", "mks"], "video/x-mng": ["mng"], "video/x-ms-asf": ["asf", "asx"], "video/x-ms-vob": ["vob"], "video/x-ms-wm": ["wm"], "video/x-ms-wmv": ["wmv"], "video/x-ms-wmx": ["wmx"], "video/x-ms-wvx": ["wvx"], "video/x-msvideo": ["avi"], "video/x-sgi-movie": ["movie"], "video/x-smv": ["smv"], "x-conference/x-cooltalk": ["ice"] };
        }, {}], 43: [function (t, e, i) {
          "use strict";
          var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;i.assign = function (t) {
            for (var e = Array.prototype.slice.call(arguments, 1); e.length;) {
              var i = e.shift();if (i) {
                if ("object" !== (void 0 === i ? "undefined" : _typeof(i))) throw new TypeError(i + "must be non-object");for (var n in i) {
                  i.hasOwnProperty(n) && (t[n] = i[n]);
                }
              }
            }return t;
          }, i.shrinkBuf = function (t, e) {
            return t.length === e ? t : t.subarray ? t.subarray(0, e) : (t.length = e, t);
          };var r = { arraySet: function arraySet(t, e, i, n, r) {
              if (e.subarray && t.subarray) return void t.set(e.subarray(i, i + n), r);for (var a = 0; a < n; a++) {
                t[r + a] = e[i + a];
              }
            }, flattenChunks: function flattenChunks(t) {
              var e, i, n, r, a, o;for (n = 0, e = 0, i = t.length; e < i; e++) {
                n += t[e].length;
              }for (o = new Uint8Array(n), r = 0, e = 0, i = t.length; e < i; e++) {
                a = t[e], o.set(a, r), r += a.length;
              }return o;
            } },
              a = { arraySet: function arraySet(t, e, i, n, r) {
              for (var a = 0; a < n; a++) {
                t[r + a] = e[i + a];
              }
            }, flattenChunks: function flattenChunks(t) {
              return [].concat.apply([], t);
            } };i.setTyped = function (t) {
            t ? (i.Buf8 = Uint8Array, i.Buf16 = Uint16Array, i.Buf32 = Int32Array, i.assign(i, r)) : (i.Buf8 = Array, i.Buf16 = Array, i.Buf32 = Array, i.assign(i, a));
          }, i.setTyped(n);
        }, {}], 44: [function (t, e, i) {
          "use strict";
          function n(t, e, i, n) {
            for (var r = 65535 & t | 0, a = t >>> 16 & 65535 | 0, o = 0; 0 !== i;) {
              o = i > 2e3 ? 2e3 : i, i -= o;do {
                r = r + e[n++] | 0, a = a + r | 0;
              } while (--o);r %= 65521, a %= 65521;
            }return r | a << 16 | 0;
          }e.exports = n;
        }, {}], 45: [function (t, e, i) {
          "use strict";
          e.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
        }, {}], 46: [function (t, e, i) {
          "use strict";
          function n(t, e, i, n) {
            var a = r,
                o = n + i;t ^= -1;for (var s = n; s < o; s++) {
              t = t >>> 8 ^ a[255 & (t ^ e[s])];
            }return t ^ -1;
          }var r = function () {
            for (var t, e = [], i = 0; i < 256; i++) {
              t = i;for (var n = 0; n < 8; n++) {
                t = 1 & t ? 3988292384 ^ t >>> 1 : t >>> 1;
              }e[i] = t;
            }return e;
          }();e.exports = n;
        }, {}], 47: [function (t, e, i) {
          "use strict";
          function n(t, e) {
            return t.msg = B[e], e;
          }function r(t) {
            return (t << 1) - (t > 4 ? 9 : 0);
          }function a(t) {
            for (var e = t.length; --e >= 0;) {
              t[e] = 0;
            }
          }function o(t) {
            var e = t.state,
                i = e.pending;i > t.avail_out && (i = t.avail_out), 0 !== i && (R.arraySet(t.output, e.pending_buf, e.pending_out, i, t.next_out), t.next_out += i, e.pending_out += i, t.total_out += i, t.avail_out -= i, e.pending -= i, 0 === e.pending && (e.pending_out = 0));
          }function s(t, e) {
            L._tr_flush_block(t, t.block_start >= 0 ? t.block_start : -1, t.strstart - t.block_start, e), t.block_start = t.strstart, o(t.strm);
          }function l(t, e) {
            t.pending_buf[t.pending++] = e;
          }function h(t, e) {
            t.pending_buf[t.pending++] = e >>> 8 & 255, t.pending_buf[t.pending++] = 255 & e;
          }function f(t, e, i, n) {
            var r = t.avail_in;return r > n && (r = n), 0 === r ? 0 : (t.avail_in -= r, R.arraySet(e, t.input, t.next_in, r, i), 1 === t.state.wrap ? t.adler = P(t.adler, e, r, i) : 2 === t.state.wrap && (t.adler = C(t.adler, e, r, i)), t.next_in += r, t.total_in += r, r);
          }function c(t, e) {
            var i,
                n,
                r = t.max_chain_length,
                a = t.strstart,
                o = t.prev_length,
                s = t.nice_match,
                l = t.strstart > t.w_size - ht ? t.strstart - (t.w_size - ht) : 0,
                h = t.window,
                f = t.w_mask,
                c = t.prev,
                u = t.strstart + lt,
                p = h[a + o - 1],
                d = h[a + o];t.prev_length >= t.good_match && (r >>= 2), s > t.lookahead && (s = t.lookahead);do {
              if (i = e, h[i + o] === d && h[i + o - 1] === p && h[i] === h[a] && h[++i] === h[a + 1]) {
                a += 2, i++;do {} while (h[++a] === h[++i] && h[++a] === h[++i] && h[++a] === h[++i] && h[++a] === h[++i] && h[++a] === h[++i] && h[++a] === h[++i] && h[++a] === h[++i] && h[++a] === h[++i] && a < u);if (n = lt - (u - a), a = u - lt, n > o) {
                  if (t.match_start = e, o = n, n >= s) break;p = h[a + o - 1], d = h[a + o];
                }
              }
            } while ((e = c[e & f]) > l && 0 != --r);return o <= t.lookahead ? o : t.lookahead;
          }function u(t) {
            var e,
                i,
                n,
                r,
                a,
                o = t.w_size;do {
              if (r = t.window_size - t.lookahead - t.strstart, t.strstart >= o + (o - ht)) {
                R.arraySet(t.window, t.window, o, o, 0), t.match_start -= o, t.strstart -= o, t.block_start -= o, i = t.hash_size, e = i;do {
                  n = t.head[--e], t.head[e] = n >= o ? n - o : 0;
                } while (--i);i = o, e = i;do {
                  n = t.prev[--e], t.prev[e] = n >= o ? n - o : 0;
                } while (--i);r += o;
              }if (0 === t.strm.avail_in) break;if (i = f(t.strm, t.window, t.strstart + t.lookahead, r), t.lookahead += i, t.lookahead + t.insert >= st) for (a = t.strstart - t.insert, t.ins_h = t.window[a], t.ins_h = (t.ins_h << t.hash_shift ^ t.window[a + 1]) & t.hash_mask; t.insert && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[a + st - 1]) & t.hash_mask, t.prev[a & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = a, a++, t.insert--, !(t.lookahead + t.insert < st));) {}
            } while (t.lookahead < ht && 0 !== t.strm.avail_in);
          }function p(t, e) {
            var i = 65535;for (i > t.pending_buf_size - 5 && (i = t.pending_buf_size - 5);;) {
              if (t.lookahead <= 1) {
                if (u(t), 0 === t.lookahead && e === z) return vt;if (0 === t.lookahead) break;
              }t.strstart += t.lookahead, t.lookahead = 0;var n = t.block_start + i;if ((0 === t.strstart || t.strstart >= n) && (t.lookahead = t.strstart - n, t.strstart = n, s(t, !1), 0 === t.strm.avail_out)) return vt;if (t.strstart - t.block_start >= t.w_size - ht && (s(t, !1), 0 === t.strm.avail_out)) return vt;
            }return t.insert = 0, e === U ? (s(t, !0), 0 === t.strm.avail_out ? _t : yt) : (t.strstart > t.block_start && (s(t, !1), t.strm.avail_out), vt);
          }function d(t, e) {
            for (var i, n;;) {
              if (t.lookahead < ht) {
                if (u(t), t.lookahead < ht && e === z) return vt;if (0 === t.lookahead) break;
              }if (i = 0, t.lookahead >= st && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + st - 1]) & t.hash_mask, i = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart), 0 !== i && t.strstart - i <= t.w_size - ht && (t.match_length = c(t, i)), t.match_length >= st) {
                if (n = L._tr_tally(t, t.strstart - t.match_start, t.match_length - st), t.lookahead -= t.match_length, t.match_length <= t.max_lazy_match && t.lookahead >= st) {
                  t.match_length--;do {
                    t.strstart++, t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + st - 1]) & t.hash_mask, i = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart;
                  } while (0 != --t.match_length);t.strstart++;
                } else t.strstart += t.match_length, t.match_length = 0, t.ins_h = t.window[t.strstart], t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + 1]) & t.hash_mask;
              } else n = L._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++;if (n && (s(t, !1), 0 === t.strm.avail_out)) return vt;
            }return t.insert = t.strstart < st - 1 ? t.strstart : st - 1, e === U ? (s(t, !0), 0 === t.strm.avail_out ? _t : yt) : t.last_lit && (s(t, !1), 0 === t.strm.avail_out) ? vt : wt;
          }function m(t, e) {
            for (var i, n, r;;) {
              if (t.lookahead < ht) {
                if (u(t), t.lookahead < ht && e === z) return vt;if (0 === t.lookahead) break;
              }if (i = 0, t.lookahead >= st && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + st - 1]) & t.hash_mask, i = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart), t.prev_length = t.match_length, t.prev_match = t.match_start, t.match_length = st - 1, 0 !== i && t.prev_length < t.max_lazy_match && t.strstart - i <= t.w_size - ht && (t.match_length = c(t, i), t.match_length <= 5 && (t.strategy === Z || t.match_length === st && t.strstart - t.match_start > 4096) && (t.match_length = st - 1)), t.prev_length >= st && t.match_length <= t.prev_length) {
                r = t.strstart + t.lookahead - st, n = L._tr_tally(t, t.strstart - 1 - t.prev_match, t.prev_length - st), t.lookahead -= t.prev_length - 1, t.prev_length -= 2;do {
                  ++t.strstart <= r && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + st - 1]) & t.hash_mask, i = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart);
                } while (0 != --t.prev_length);if (t.match_available = 0, t.match_length = st - 1, t.strstart++, n && (s(t, !1), 0 === t.strm.avail_out)) return vt;
              } else if (t.match_available) {
                if (n = L._tr_tally(t, 0, t.window[t.strstart - 1]), n && s(t, !1), t.strstart++, t.lookahead--, 0 === t.strm.avail_out) return vt;
              } else t.match_available = 1, t.strstart++, t.lookahead--;
            }return t.match_available && (n = L._tr_tally(t, 0, t.window[t.strstart - 1]), t.match_available = 0), t.insert = t.strstart < st - 1 ? t.strstart : st - 1, e === U ? (s(t, !0), 0 === t.strm.avail_out ? _t : yt) : t.last_lit && (s(t, !1), 0 === t.strm.avail_out) ? vt : wt;
          }function g(t, e) {
            for (var i, n, r, a, o = t.window;;) {
              if (t.lookahead <= lt) {
                if (u(t), t.lookahead <= lt && e === z) return vt;if (0 === t.lookahead) break;
              }if (t.match_length = 0, t.lookahead >= st && t.strstart > 0 && (r = t.strstart - 1, (n = o[r]) === o[++r] && n === o[++r] && n === o[++r])) {
                a = t.strstart + lt;do {} while (n === o[++r] && n === o[++r] && n === o[++r] && n === o[++r] && n === o[++r] && n === o[++r] && n === o[++r] && n === o[++r] && r < a);t.match_length = lt - (a - r), t.match_length > t.lookahead && (t.match_length = t.lookahead);
              }if (t.match_length >= st ? (i = L._tr_tally(t, 1, t.match_length - st), t.lookahead -= t.match_length, t.strstart += t.match_length, t.match_length = 0) : (i = L._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++), i && (s(t, !1), 0 === t.strm.avail_out)) return vt;
            }return t.insert = 0, e === U ? (s(t, !0), 0 === t.strm.avail_out ? _t : yt) : t.last_lit && (s(t, !1), 0 === t.strm.avail_out) ? vt : wt;
          }function b(t, e) {
            for (var i;;) {
              if (0 === t.lookahead && (u(t), 0 === t.lookahead)) {
                if (e === z) return vt;break;
              }if (t.match_length = 0, i = L._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++, i && (s(t, !1), 0 === t.strm.avail_out)) return vt;
            }return t.insert = 0, e === U ? (s(t, !0), 0 === t.strm.avail_out ? _t : yt) : t.last_lit && (s(t, !1), 0 === t.strm.avail_out) ? vt : wt;
          }function v(t, e, i, n, r) {
            this.good_length = t, this.max_lazy = e, this.nice_length = i, this.max_chain = n, this.func = r;
          }function w(t) {
            t.window_size = 2 * t.w_size, a(t.head), t.max_lazy_match = T[t.level].max_lazy, t.good_match = T[t.level].good_length, t.nice_match = T[t.level].nice_length, t.max_chain_length = T[t.level].max_chain, t.strstart = 0, t.block_start = 0, t.lookahead = 0, t.insert = 0, t.match_length = t.prev_length = st - 1, t.match_available = 0, t.ins_h = 0;
          }function _() {
            this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = K, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new R.Buf16(2 * at), this.dyn_dtree = new R.Buf16(2 * (2 * nt + 1)), this.bl_tree = new R.Buf16(2 * (2 * rt + 1)), a(this.dyn_ltree), a(this.dyn_dtree), a(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new R.Buf16(ot + 1), this.heap = new R.Buf16(2 * it + 1), a(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new R.Buf16(2 * it + 1), a(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
          }function y(t) {
            var e;return t && t.state ? (t.total_in = t.total_out = 0, t.data_type = $, e = t.state, e.pending = 0, e.pending_out = 0, e.wrap < 0 && (e.wrap = -e.wrap), e.status = e.wrap ? ct : gt, t.adler = 2 === e.wrap ? 0 : 1, e.last_flush = z, L._tr_init(e), F) : n(t, H);
          }function x(t) {
            var e = y(t);return e === F && w(t.state), e;
          }function k(t, e) {
            return t && t.state ? 2 !== t.state.wrap ? H : (t.state.gzhead = e, F) : H;
          }function E(t, e, i, r, a, o) {
            if (!t) return H;var s = 1;if (e === q && (e = 6), r < 0 ? (s = 0, r = -r) : r > 15 && (s = 2, r -= 16), a < 1 || a > Q || i !== K || r < 8 || r > 15 || e < 0 || e > 9 || o < 0 || o > V) return n(t, H);8 === r && (r = 9);var l = new _();return t.state = l, l.strm = t, l.wrap = s, l.gzhead = null, l.w_bits = r, l.w_size = 1 << l.w_bits, l.w_mask = l.w_size - 1, l.hash_bits = a + 7, l.hash_size = 1 << l.hash_bits, l.hash_mask = l.hash_size - 1, l.hash_shift = ~~((l.hash_bits + st - 1) / st), l.window = new R.Buf8(2 * l.w_size), l.head = new R.Buf16(l.hash_size), l.prev = new R.Buf16(l.w_size), l.lit_bufsize = 1 << a + 6, l.pending_buf_size = 4 * l.lit_bufsize, l.pending_buf = new R.Buf8(l.pending_buf_size), l.d_buf = 1 * l.lit_bufsize, l.l_buf = 3 * l.lit_bufsize, l.level = e, l.strategy = o, l.method = i, x(t);
          }function S(t, e) {
            return E(t, e, K, tt, et, J);
          }function I(t, e) {
            var i, s, f, c;if (!t || !t.state || e > N || e < 0) return t ? n(t, H) : H;if (s = t.state, !t.output || !t.input && 0 !== t.avail_in || s.status === bt && e !== U) return n(t, 0 === t.avail_out ? W : H);if (s.strm = t, i = s.last_flush, s.last_flush = e, s.status === ct) if (2 === s.wrap) t.adler = 0, l(s, 31), l(s, 139), l(s, 8), s.gzhead ? (l(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (s.gzhead.extra ? 4 : 0) + (s.gzhead.name ? 8 : 0) + (s.gzhead.comment ? 16 : 0)), l(s, 255 & s.gzhead.time), l(s, s.gzhead.time >> 8 & 255), l(s, s.gzhead.time >> 16 & 255), l(s, s.gzhead.time >> 24 & 255), l(s, 9 === s.level ? 2 : s.strategy >= Y || s.level < 2 ? 4 : 0), l(s, 255 & s.gzhead.os), s.gzhead.extra && s.gzhead.extra.length && (l(s, 255 & s.gzhead.extra.length), l(s, s.gzhead.extra.length >> 8 & 255)), s.gzhead.hcrc && (t.adler = C(t.adler, s.pending_buf, s.pending, 0)), s.gzindex = 0, s.status = ut) : (l(s, 0), l(s, 0), l(s, 0), l(s, 0), l(s, 0), l(s, 9 === s.level ? 2 : s.strategy >= Y || s.level < 2 ? 4 : 0), l(s, xt), s.status = gt);else {
              var u = K + (s.w_bits - 8 << 4) << 8,
                  p = -1;p = s.strategy >= Y || s.level < 2 ? 0 : s.level < 6 ? 1 : 6 === s.level ? 2 : 3, u |= p << 6, 0 !== s.strstart && (u |= ft), u += 31 - u % 31, s.status = gt, h(s, u), 0 !== s.strstart && (h(s, t.adler >>> 16), h(s, 65535 & t.adler)), t.adler = 1;
            }if (s.status === ut) if (s.gzhead.extra) {
              for (f = s.pending; s.gzindex < (65535 & s.gzhead.extra.length) && (s.pending !== s.pending_buf_size || (s.gzhead.hcrc && s.pending > f && (t.adler = C(t.adler, s.pending_buf, s.pending - f, f)), o(t), f = s.pending, s.pending !== s.pending_buf_size));) {
                l(s, 255 & s.gzhead.extra[s.gzindex]), s.gzindex++;
              }s.gzhead.hcrc && s.pending > f && (t.adler = C(t.adler, s.pending_buf, s.pending - f, f)), s.gzindex === s.gzhead.extra.length && (s.gzindex = 0, s.status = pt);
            } else s.status = pt;if (s.status === pt) if (s.gzhead.name) {
              f = s.pending;do {
                if (s.pending === s.pending_buf_size && (s.gzhead.hcrc && s.pending > f && (t.adler = C(t.adler, s.pending_buf, s.pending - f, f)), o(t), f = s.pending, s.pending === s.pending_buf_size)) {
                  c = 1;break;
                }c = s.gzindex < s.gzhead.name.length ? 255 & s.gzhead.name.charCodeAt(s.gzindex++) : 0, l(s, c);
              } while (0 !== c);s.gzhead.hcrc && s.pending > f && (t.adler = C(t.adler, s.pending_buf, s.pending - f, f)), 0 === c && (s.gzindex = 0, s.status = dt);
            } else s.status = dt;if (s.status === dt) if (s.gzhead.comment) {
              f = s.pending;do {
                if (s.pending === s.pending_buf_size && (s.gzhead.hcrc && s.pending > f && (t.adler = C(t.adler, s.pending_buf, s.pending - f, f)), o(t), f = s.pending, s.pending === s.pending_buf_size)) {
                  c = 1;break;
                }c = s.gzindex < s.gzhead.comment.length ? 255 & s.gzhead.comment.charCodeAt(s.gzindex++) : 0, l(s, c);
              } while (0 !== c);s.gzhead.hcrc && s.pending > f && (t.adler = C(t.adler, s.pending_buf, s.pending - f, f)), 0 === c && (s.status = mt);
            } else s.status = mt;if (s.status === mt && (s.gzhead.hcrc ? (s.pending + 2 > s.pending_buf_size && o(t), s.pending + 2 <= s.pending_buf_size && (l(s, 255 & t.adler), l(s, t.adler >> 8 & 255), t.adler = 0, s.status = gt)) : s.status = gt), 0 !== s.pending) {
              if (o(t), 0 === t.avail_out) return s.last_flush = -1, F;
            } else if (0 === t.avail_in && r(e) <= r(i) && e !== U) return n(t, W);if (s.status === bt && 0 !== t.avail_in) return n(t, W);if (0 !== t.avail_in || 0 !== s.lookahead || e !== z && s.status !== bt) {
              var d = s.strategy === Y ? b(s, e) : s.strategy === X ? g(s, e) : T[s.level].func(s, e);if (d !== _t && d !== yt || (s.status = bt), d === vt || d === _t) return 0 === t.avail_out && (s.last_flush = -1), F;if (d === wt && (e === O ? L._tr_align(s) : e !== N && (L._tr_stored_block(s, 0, 0, !1), e === D && (a(s.head), 0 === s.lookahead && (s.strstart = 0, s.block_start = 0, s.insert = 0))), o(t), 0 === t.avail_out)) return s.last_flush = -1, F;
            }return e !== U ? F : s.wrap <= 0 ? j : (2 === s.wrap ? (l(s, 255 & t.adler), l(s, t.adler >> 8 & 255), l(s, t.adler >> 16 & 255), l(s, t.adler >> 24 & 255), l(s, 255 & t.total_in), l(s, t.total_in >> 8 & 255), l(s, t.total_in >> 16 & 255), l(s, t.total_in >> 24 & 255)) : (h(s, t.adler >>> 16), h(s, 65535 & t.adler)), o(t), s.wrap > 0 && (s.wrap = -s.wrap), 0 !== s.pending ? F : j);
          }function M(t) {
            var e;return t && t.state ? (e = t.state.status) !== ct && e !== ut && e !== pt && e !== dt && e !== mt && e !== gt && e !== bt ? n(t, H) : (t.state = null, e === gt ? n(t, G) : F) : H;
          }function A(t, e) {
            var i,
                n,
                r,
                o,
                s,
                l,
                h,
                f,
                c = e.length;if (!t || !t.state) return H;if (i = t.state, 2 === (o = i.wrap) || 1 === o && i.status !== ct || i.lookahead) return H;for (1 === o && (t.adler = P(t.adler, e, c, 0)), i.wrap = 0, c >= i.w_size && (0 === o && (a(i.head), i.strstart = 0, i.block_start = 0, i.insert = 0), f = new R.Buf8(i.w_size), R.arraySet(f, e, c - i.w_size, i.w_size, 0), e = f, c = i.w_size), s = t.avail_in, l = t.next_in, h = t.input, t.avail_in = c, t.next_in = 0, t.input = e, u(i); i.lookahead >= st;) {
              n = i.strstart, r = i.lookahead - (st - 1);do {
                i.ins_h = (i.ins_h << i.hash_shift ^ i.window[n + st - 1]) & i.hash_mask, i.prev[n & i.w_mask] = i.head[i.ins_h], i.head[i.ins_h] = n, n++;
              } while (--r);i.strstart = n, i.lookahead = st - 1, u(i);
            }return i.strstart += i.lookahead, i.block_start = i.strstart, i.insert = i.lookahead, i.lookahead = 0, i.match_length = i.prev_length = st - 1, i.match_available = 0, t.next_in = l, t.input = h, t.avail_in = s, i.wrap = o, F;
          }var T,
              R = t("../utils/common"),
              L = t("./trees"),
              P = t("./adler32"),
              C = t("./crc32"),
              B = t("./messages"),
              z = 0,
              O = 1,
              D = 3,
              U = 4,
              N = 5,
              F = 0,
              j = 1,
              H = -2,
              G = -3,
              W = -5,
              q = -1,
              Z = 1,
              Y = 2,
              X = 3,
              V = 4,
              J = 0,
              $ = 2,
              K = 8,
              Q = 9,
              tt = 15,
              et = 8,
              it = 286,
              nt = 30,
              rt = 19,
              at = 2 * it + 1,
              ot = 15,
              st = 3,
              lt = 258,
              ht = lt + st + 1,
              ft = 32,
              ct = 42,
              ut = 69,
              pt = 73,
              dt = 91,
              mt = 103,
              gt = 113,
              bt = 666,
              vt = 1,
              wt = 2,
              _t = 3,
              yt = 4,
              xt = 3;T = [new v(0, 0, 0, 0, p), new v(4, 4, 8, 4, d), new v(4, 5, 16, 8, d), new v(4, 6, 32, 32, d), new v(4, 4, 16, 16, m), new v(8, 16, 32, 32, m), new v(8, 16, 128, 128, m), new v(8, 32, 128, 256, m), new v(32, 128, 258, 1024, m), new v(32, 258, 258, 4096, m)], i.deflateInit = S, i.deflateInit2 = E, i.deflateReset = x, i.deflateResetKeep = y, i.deflateSetHeader = k, i.deflate = I, i.deflateEnd = M, i.deflateSetDictionary = A, i.deflateInfo = "pako deflate (from Nodeca project)";
        }, { "../utils/common": 43, "./adler32": 44, "./crc32": 46, "./messages": 51, "./trees": 52 }], 48: [function (t, e, i) {
          "use strict";
          e.exports = function (t, e) {
            var i, n, r, a, o, s, l, h, f, c, u, p, d, m, g, b, v, w, _, y, x, k, E, S, I;i = t.state, n = t.next_in, S = t.input, r = n + (t.avail_in - 5), a = t.next_out, I = t.output, o = a - (e - t.avail_out), s = a + (t.avail_out - 257), l = i.dmax, h = i.wsize, f = i.whave, c = i.wnext, u = i.window, p = i.hold, d = i.bits, m = i.lencode, g = i.distcode, b = (1 << i.lenbits) - 1, v = (1 << i.distbits) - 1;t: do {
              d < 15 && (p += S[n++] << d, d += 8, p += S[n++] << d, d += 8), w = m[p & b];e: for (;;) {
                if (_ = w >>> 24, p >>>= _, d -= _, 0 === (_ = w >>> 16 & 255)) I[a++] = 65535 & w;else {
                  if (!(16 & _)) {
                    if (0 == (64 & _)) {
                      w = m[(65535 & w) + (p & (1 << _) - 1)];continue e;
                    }if (32 & _) {
                      i.mode = 12;break t;
                    }t.msg = "invalid literal/length code", i.mode = 30;break t;
                  }y = 65535 & w, _ &= 15, _ && (d < _ && (p += S[n++] << d, d += 8), y += p & (1 << _) - 1, p >>>= _, d -= _), d < 15 && (p += S[n++] << d, d += 8, p += S[n++] << d, d += 8), w = g[p & v];i: for (;;) {
                    if (_ = w >>> 24, p >>>= _, d -= _, !(16 & (_ = w >>> 16 & 255))) {
                      if (0 == (64 & _)) {
                        w = g[(65535 & w) + (p & (1 << _) - 1)];continue i;
                      }t.msg = "invalid distance code", i.mode = 30;break t;
                    }if (x = 65535 & w, _ &= 15, d < _ && (p += S[n++] << d, (d += 8) < _ && (p += S[n++] << d, d += 8)), (x += p & (1 << _) - 1) > l) {
                      t.msg = "invalid distance too far back", i.mode = 30;break t;
                    }if (p >>>= _, d -= _, _ = a - o, x > _) {
                      if ((_ = x - _) > f && i.sane) {
                        t.msg = "invalid distance too far back", i.mode = 30;break t;
                      }if (k = 0, E = u, 0 === c) {
                        if (k += h - _, _ < y) {
                          y -= _;do {
                            I[a++] = u[k++];
                          } while (--_);k = a - x, E = I;
                        }
                      } else if (c < _) {
                        if (k += h + c - _, (_ -= c) < y) {
                          y -= _;do {
                            I[a++] = u[k++];
                          } while (--_);if (k = 0, c < y) {
                            _ = c, y -= _;do {
                              I[a++] = u[k++];
                            } while (--_);k = a - x, E = I;
                          }
                        }
                      } else if (k += c - _, _ < y) {
                        y -= _;do {
                          I[a++] = u[k++];
                        } while (--_);k = a - x, E = I;
                      }for (; y > 2;) {
                        I[a++] = E[k++], I[a++] = E[k++], I[a++] = E[k++], y -= 3;
                      }y && (I[a++] = E[k++], y > 1 && (I[a++] = E[k++]));
                    } else {
                      k = a - x;do {
                        I[a++] = I[k++], I[a++] = I[k++], I[a++] = I[k++], y -= 3;
                      } while (y > 2);y && (I[a++] = I[k++], y > 1 && (I[a++] = I[k++]));
                    }break;
                  }
                }break;
              }
            } while (n < r && a < s);y = d >> 3, n -= y, d -= y << 3, p &= (1 << d) - 1, t.next_in = n, t.next_out = a, t.avail_in = n < r ? r - n + 5 : 5 - (n - r), t.avail_out = a < s ? s - a + 257 : 257 - (a - s), i.hold = p, i.bits = d;
          };
        }, {}], 49: [function (t, e, i) {
          "use strict";
          function n(t) {
            return (t >>> 24 & 255) + (t >>> 8 & 65280) + ((65280 & t) << 8) + ((255 & t) << 24);
          }function r() {
            this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new v.Buf16(320), this.work = new v.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
          }function a(t) {
            var e;return t && t.state ? (e = t.state, t.total_in = t.total_out = e.total = 0, t.msg = "", e.wrap && (t.adler = 1 & e.wrap), e.mode = O, e.last = 0, e.havedict = 0, e.dmax = 32768, e.head = null, e.hold = 0, e.bits = 0, e.lencode = e.lendyn = new v.Buf32(dt), e.distcode = e.distdyn = new v.Buf32(mt), e.sane = 1, e.back = -1, T) : P;
          }function o(t) {
            var e;return t && t.state ? (e = t.state, e.wsize = 0, e.whave = 0, e.wnext = 0, a(t)) : P;
          }function s(t, e) {
            var i, n;return t && t.state ? (n = t.state, e < 0 ? (i = 0, e = -e) : (i = 1 + (e >> 4), e < 48 && (e &= 15)), e && (e < 8 || e > 15) ? P : (null !== n.window && n.wbits !== e && (n.window = null), n.wrap = i, n.wbits = e, o(t))) : P;
          }function l(t, e) {
            var i, n;return t ? (n = new r(), t.state = n, n.window = null, i = s(t, e), i !== T && (t.state = null), i) : P;
          }function h(t) {
            return l(t, gt);
          }function f(t) {
            if (bt) {
              var e;for (g = new v.Buf32(512), b = new v.Buf32(32), e = 0; e < 144;) {
                t.lens[e++] = 8;
              }for (; e < 256;) {
                t.lens[e++] = 9;
              }for (; e < 280;) {
                t.lens[e++] = 7;
              }for (; e < 288;) {
                t.lens[e++] = 8;
              }for (x(E, t.lens, 0, 288, g, 0, t.work, { bits: 9 }), e = 0; e < 32;) {
                t.lens[e++] = 5;
              }x(S, t.lens, 0, 32, b, 0, t.work, { bits: 5 }), bt = !1;
            }t.lencode = g, t.lenbits = 9, t.distcode = b, t.distbits = 5;
          }function c(t, e, i, n) {
            var r,
                a = t.state;return null === a.window && (a.wsize = 1 << a.wbits, a.wnext = 0, a.whave = 0, a.window = new v.Buf8(a.wsize)), n >= a.wsize ? (v.arraySet(a.window, e, i - a.wsize, a.wsize, 0), a.wnext = 0, a.whave = a.wsize) : (r = a.wsize - a.wnext, r > n && (r = n), v.arraySet(a.window, e, i - n, r, a.wnext), n -= r, n ? (v.arraySet(a.window, e, i - n, n, 0), a.wnext = n, a.whave = a.wsize) : (a.wnext += r, a.wnext === a.wsize && (a.wnext = 0), a.whave < a.wsize && (a.whave += r))), 0;
          }function u(t, e) {
            var i,
                r,
                a,
                o,
                s,
                l,
                h,
                u,
                p,
                d,
                m,
                g,
                b,
                dt,
                mt,
                gt,
                bt,
                vt,
                wt,
                _t,
                yt,
                xt,
                kt,
                Et,
                St = 0,
                It = new v.Buf8(4),
                Mt = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];if (!t || !t.state || !t.output || !t.input && 0 !== t.avail_in) return P;i = t.state, i.mode === Y && (i.mode = X), s = t.next_out, a = t.output, h = t.avail_out, o = t.next_in, r = t.input, l = t.avail_in, u = i.hold, p = i.bits, d = l, m = h, xt = T;t: for (;;) {
              switch (i.mode) {case O:
                  if (0 === i.wrap) {
                    i.mode = X;break;
                  }for (; p < 16;) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }if (2 & i.wrap && 35615 === u) {
                    i.check = 0, It[0] = 255 & u, It[1] = u >>> 8 & 255, i.check = _(i.check, It, 2, 0), u = 0, p = 0, i.mode = D;break;
                  }if (i.flags = 0, i.head && (i.head.done = !1), !(1 & i.wrap) || (((255 & u) << 8) + (u >> 8)) % 31) {
                    t.msg = "incorrect header check", i.mode = ct;break;
                  }if ((15 & u) !== z) {
                    t.msg = "unknown compression method", i.mode = ct;break;
                  }if (u >>>= 4, p -= 4, yt = 8 + (15 & u), 0 === i.wbits) i.wbits = yt;else if (yt > i.wbits) {
                    t.msg = "invalid window size", i.mode = ct;break;
                  }i.dmax = 1 << yt, t.adler = i.check = 1, i.mode = 512 & u ? q : Y, u = 0, p = 0;break;case D:
                  for (; p < 16;) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }if (i.flags = u, (255 & i.flags) !== z) {
                    t.msg = "unknown compression method", i.mode = ct;break;
                  }if (57344 & i.flags) {
                    t.msg = "unknown header flags set", i.mode = ct;break;
                  }i.head && (i.head.text = u >> 8 & 1), 512 & i.flags && (It[0] = 255 & u, It[1] = u >>> 8 & 255, i.check = _(i.check, It, 2, 0)), u = 0, p = 0, i.mode = U;case U:
                  for (; p < 32;) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }i.head && (i.head.time = u), 512 & i.flags && (It[0] = 255 & u, It[1] = u >>> 8 & 255, It[2] = u >>> 16 & 255, It[3] = u >>> 24 & 255, i.check = _(i.check, It, 4, 0)), u = 0, p = 0, i.mode = N;case N:
                  for (; p < 16;) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }i.head && (i.head.xflags = 255 & u, i.head.os = u >> 8), 512 & i.flags && (It[0] = 255 & u, It[1] = u >>> 8 & 255, i.check = _(i.check, It, 2, 0)), u = 0, p = 0, i.mode = F;case F:
                  if (1024 & i.flags) {
                    for (; p < 16;) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }i.length = u, i.head && (i.head.extra_len = u), 512 & i.flags && (It[0] = 255 & u, It[1] = u >>> 8 & 255, i.check = _(i.check, It, 2, 0)), u = 0, p = 0;
                  } else i.head && (i.head.extra = null);i.mode = j;case j:
                  if (1024 & i.flags && (g = i.length, g > l && (g = l), g && (i.head && (yt = i.head.extra_len - i.length, i.head.extra || (i.head.extra = new Array(i.head.extra_len)), v.arraySet(i.head.extra, r, o, g, yt)), 512 & i.flags && (i.check = _(i.check, r, g, o)), l -= g, o += g, i.length -= g), i.length)) break t;i.length = 0, i.mode = H;case H:
                  if (2048 & i.flags) {
                    if (0 === l) break t;g = 0;do {
                      yt = r[o + g++], i.head && yt && i.length < 65536 && (i.head.name += String.fromCharCode(yt));
                    } while (yt && g < l);if (512 & i.flags && (i.check = _(i.check, r, g, o)), l -= g, o += g, yt) break t;
                  } else i.head && (i.head.name = null);i.length = 0, i.mode = G;case G:
                  if (4096 & i.flags) {
                    if (0 === l) break t;g = 0;do {
                      yt = r[o + g++], i.head && yt && i.length < 65536 && (i.head.comment += String.fromCharCode(yt));
                    } while (yt && g < l);if (512 & i.flags && (i.check = _(i.check, r, g, o)), l -= g, o += g, yt) break t;
                  } else i.head && (i.head.comment = null);i.mode = W;case W:
                  if (512 & i.flags) {
                    for (; p < 16;) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }if (u !== (65535 & i.check)) {
                      t.msg = "header crc mismatch", i.mode = ct;break;
                    }u = 0, p = 0;
                  }i.head && (i.head.hcrc = i.flags >> 9 & 1, i.head.done = !0), t.adler = i.check = 0, i.mode = Y;break;case q:
                  for (; p < 32;) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }t.adler = i.check = n(u), u = 0, p = 0, i.mode = Z;case Z:
                  if (0 === i.havedict) return t.next_out = s, t.avail_out = h, t.next_in = o, t.avail_in = l, i.hold = u, i.bits = p, L;t.adler = i.check = 1, i.mode = Y;case Y:
                  if (e === M || e === A) break t;case X:
                  if (i.last) {
                    u >>>= 7 & p, p -= 7 & p, i.mode = lt;break;
                  }for (; p < 3;) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }switch (i.last = 1 & u, u >>>= 1, p -= 1, 3 & u) {case 0:
                      i.mode = V;break;case 1:
                      if (f(i), i.mode = et, e === A) {
                        u >>>= 2, p -= 2;break t;
                      }break;case 2:
                      i.mode = K;break;case 3:
                      t.msg = "invalid block type", i.mode = ct;}u >>>= 2, p -= 2;break;case V:
                  for (u >>>= 7 & p, p -= 7 & p; p < 32;) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }if ((65535 & u) != (u >>> 16 ^ 65535)) {
                    t.msg = "invalid stored block lengths", i.mode = ct;break;
                  }if (i.length = 65535 & u, u = 0, p = 0, i.mode = J, e === A) break t;case J:
                  i.mode = $;case $:
                  if (g = i.length) {
                    if (g > l && (g = l), g > h && (g = h), 0 === g) break t;v.arraySet(a, r, o, g, s), l -= g, o += g, h -= g, s += g, i.length -= g;break;
                  }i.mode = Y;break;case K:
                  for (; p < 14;) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }if (i.nlen = 257 + (31 & u), u >>>= 5, p -= 5, i.ndist = 1 + (31 & u), u >>>= 5, p -= 5, i.ncode = 4 + (15 & u), u >>>= 4, p -= 4, i.nlen > 286 || i.ndist > 30) {
                    t.msg = "too many length or distance symbols", i.mode = ct;break;
                  }i.have = 0, i.mode = Q;case Q:
                  for (; i.have < i.ncode;) {
                    for (; p < 3;) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }i.lens[Mt[i.have++]] = 7 & u, u >>>= 3, p -= 3;
                  }for (; i.have < 19;) {
                    i.lens[Mt[i.have++]] = 0;
                  }if (i.lencode = i.lendyn, i.lenbits = 7, kt = { bits: i.lenbits }, xt = x(k, i.lens, 0, 19, i.lencode, 0, i.work, kt), i.lenbits = kt.bits, xt) {
                    t.msg = "invalid code lengths set", i.mode = ct;break;
                  }i.have = 0, i.mode = tt;case tt:
                  for (; i.have < i.nlen + i.ndist;) {
                    for (; St = i.lencode[u & (1 << i.lenbits) - 1], mt = St >>> 24, gt = St >>> 16 & 255, bt = 65535 & St, !(mt <= p);) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }if (bt < 16) u >>>= mt, p -= mt, i.lens[i.have++] = bt;else {
                      if (16 === bt) {
                        for (Et = mt + 2; p < Et;) {
                          if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                        }if (u >>>= mt, p -= mt, 0 === i.have) {
                          t.msg = "invalid bit length repeat", i.mode = ct;break;
                        }yt = i.lens[i.have - 1], g = 3 + (3 & u), u >>>= 2, p -= 2;
                      } else if (17 === bt) {
                        for (Et = mt + 3; p < Et;) {
                          if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                        }u >>>= mt, p -= mt, yt = 0, g = 3 + (7 & u), u >>>= 3, p -= 3;
                      } else {
                        for (Et = mt + 7; p < Et;) {
                          if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                        }u >>>= mt, p -= mt, yt = 0, g = 11 + (127 & u), u >>>= 7, p -= 7;
                      }if (i.have + g > i.nlen + i.ndist) {
                        t.msg = "invalid bit length repeat", i.mode = ct;break;
                      }for (; g--;) {
                        i.lens[i.have++] = yt;
                      }
                    }
                  }if (i.mode === ct) break;if (0 === i.lens[256]) {
                    t.msg = "invalid code -- missing end-of-block", i.mode = ct;break;
                  }if (i.lenbits = 9, kt = { bits: i.lenbits }, xt = x(E, i.lens, 0, i.nlen, i.lencode, 0, i.work, kt), i.lenbits = kt.bits, xt) {
                    t.msg = "invalid literal/lengths set", i.mode = ct;break;
                  }if (i.distbits = 6, i.distcode = i.distdyn, kt = { bits: i.distbits }, xt = x(S, i.lens, i.nlen, i.ndist, i.distcode, 0, i.work, kt), i.distbits = kt.bits, xt) {
                    t.msg = "invalid distances set", i.mode = ct;break;
                  }if (i.mode = et, e === A) break t;case et:
                  i.mode = it;case it:
                  if (l >= 6 && h >= 258) {
                    t.next_out = s, t.avail_out = h, t.next_in = o, t.avail_in = l, i.hold = u, i.bits = p, y(t, m), s = t.next_out, a = t.output, h = t.avail_out, o = t.next_in, r = t.input, l = t.avail_in, u = i.hold, p = i.bits, i.mode === Y && (i.back = -1);break;
                  }for (i.back = 0; St = i.lencode[u & (1 << i.lenbits) - 1], mt = St >>> 24, gt = St >>> 16 & 255, bt = 65535 & St, !(mt <= p);) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }if (gt && 0 == (240 & gt)) {
                    for (vt = mt, wt = gt, _t = bt; St = i.lencode[_t + ((u & (1 << vt + wt) - 1) >> vt)], mt = St >>> 24, gt = St >>> 16 & 255, bt = 65535 & St, !(vt + mt <= p);) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }u >>>= vt, p -= vt, i.back += vt;
                  }if (u >>>= mt, p -= mt, i.back += mt, i.length = bt, 0 === gt) {
                    i.mode = st;break;
                  }if (32 & gt) {
                    i.back = -1, i.mode = Y;break;
                  }if (64 & gt) {
                    t.msg = "invalid literal/length code", i.mode = ct;break;
                  }i.extra = 15 & gt, i.mode = nt;case nt:
                  if (i.extra) {
                    for (Et = i.extra; p < Et;) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }i.length += u & (1 << i.extra) - 1, u >>>= i.extra, p -= i.extra, i.back += i.extra;
                  }i.was = i.length, i.mode = rt;case rt:
                  for (; St = i.distcode[u & (1 << i.distbits) - 1], mt = St >>> 24, gt = St >>> 16 & 255, bt = 65535 & St, !(mt <= p);) {
                    if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                  }if (0 == (240 & gt)) {
                    for (vt = mt, wt = gt, _t = bt; St = i.distcode[_t + ((u & (1 << vt + wt) - 1) >> vt)], mt = St >>> 24, gt = St >>> 16 & 255, bt = 65535 & St, !(vt + mt <= p);) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }u >>>= vt, p -= vt, i.back += vt;
                  }if (u >>>= mt, p -= mt, i.back += mt, 64 & gt) {
                    t.msg = "invalid distance code", i.mode = ct;break;
                  }i.offset = bt, i.extra = 15 & gt, i.mode = at;case at:
                  if (i.extra) {
                    for (Et = i.extra; p < Et;) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }i.offset += u & (1 << i.extra) - 1, u >>>= i.extra, p -= i.extra, i.back += i.extra;
                  }if (i.offset > i.dmax) {
                    t.msg = "invalid distance too far back", i.mode = ct;break;
                  }i.mode = ot;case ot:
                  if (0 === h) break t;if (g = m - h, i.offset > g) {
                    if ((g = i.offset - g) > i.whave && i.sane) {
                      t.msg = "invalid distance too far back", i.mode = ct;break;
                    }g > i.wnext ? (g -= i.wnext, b = i.wsize - g) : b = i.wnext - g, g > i.length && (g = i.length), dt = i.window;
                  } else dt = a, b = s - i.offset, g = i.length;g > h && (g = h), h -= g, i.length -= g;do {
                    a[s++] = dt[b++];
                  } while (--g);0 === i.length && (i.mode = it);break;case st:
                  if (0 === h) break t;a[s++] = i.length, h--, i.mode = it;break;case lt:
                  if (i.wrap) {
                    for (; p < 32;) {
                      if (0 === l) break t;l--, u |= r[o++] << p, p += 8;
                    }if (m -= h, t.total_out += m, i.total += m, m && (t.adler = i.check = i.flags ? _(i.check, a, m, s - m) : w(i.check, a, m, s - m)), m = h, (i.flags ? u : n(u)) !== i.check) {
                      t.msg = "incorrect data check", i.mode = ct;break;
                    }u = 0, p = 0;
                  }i.mode = ht;case ht:
                  if (i.wrap && i.flags) {
                    for (; p < 32;) {
                      if (0 === l) break t;l--, u += r[o++] << p, p += 8;
                    }if (u !== (4294967295 & i.total)) {
                      t.msg = "incorrect length check", i.mode = ct;break;
                    }u = 0, p = 0;
                  }i.mode = ft;case ft:
                  xt = R;break t;case ct:
                  xt = C;break t;case ut:
                  return B;case pt:default:
                  return P;}
            }return t.next_out = s, t.avail_out = h, t.next_in = o, t.avail_in = l, i.hold = u, i.bits = p, (i.wsize || m !== t.avail_out && i.mode < ct && (i.mode < lt || e !== I)) && c(t, t.output, t.next_out, m - t.avail_out) ? (i.mode = ut, B) : (d -= t.avail_in, m -= t.avail_out, t.total_in += d, t.total_out += m, i.total += m, i.wrap && m && (t.adler = i.check = i.flags ? _(i.check, a, m, t.next_out - m) : w(i.check, a, m, t.next_out - m)), t.data_type = i.bits + (i.last ? 64 : 0) + (i.mode === Y ? 128 : 0) + (i.mode === et || i.mode === J ? 256 : 0), xt);
          }function p(t) {
            if (!t || !t.state) return P;var e = t.state;return e.window && (e.window = null), t.state = null, T;
          }function d(t, e) {
            var i;return t && t.state ? (i = t.state, 0 == (2 & i.wrap) ? P : (i.head = e, e.done = !1, T)) : P;
          }function m(t, e) {
            var i,
                n,
                r = e.length;return t && t.state ? (i = t.state, 0 !== i.wrap && i.mode !== Z ? P : i.mode === Z && (n = 1, (n = w(n, e, r, 0)) !== i.check) ? C : c(t, e, r, r) ? (i.mode = ut, B) : (i.havedict = 1, T)) : P;
          }var g,
              b,
              v = t("../utils/common"),
              w = t("./adler32"),
              _ = t("./crc32"),
              y = t("./inffast"),
              x = t("./inftrees"),
              k = 0,
              E = 1,
              S = 2,
              I = 4,
              M = 5,
              A = 6,
              T = 0,
              R = 1,
              L = 2,
              P = -2,
              C = -3,
              B = -4,
              z = 8,
              O = 1,
              D = 2,
              U = 3,
              N = 4,
              F = 5,
              j = 6,
              H = 7,
              G = 8,
              W = 9,
              q = 10,
              Z = 11,
              Y = 12,
              X = 13,
              V = 14,
              J = 15,
              $ = 16,
              K = 17,
              Q = 18,
              tt = 19,
              et = 20,
              it = 21,
              nt = 22,
              rt = 23,
              at = 24,
              ot = 25,
              st = 26,
              lt = 27,
              ht = 28,
              ft = 29,
              ct = 30,
              ut = 31,
              pt = 32,
              dt = 852,
              mt = 592,
              gt = 15,
              bt = !0;i.inflateReset = o, i.inflateReset2 = s, i.inflateResetKeep = a, i.inflateInit = h, i.inflateInit2 = l, i.inflate = u, i.inflateEnd = p, i.inflateGetHeader = d, i.inflateSetDictionary = m, i.inflateInfo = "pako inflate (from Nodeca project)";
        }, { "../utils/common": 43, "./adler32": 44, "./crc32": 46, "./inffast": 48, "./inftrees": 50 }], 50: [function (t, e, i) {
          "use strict";
          var n = t("../utils/common"),
              r = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0],
              a = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78],
              o = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0],
              s = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];e.exports = function (t, e, i, l, h, f, c, u) {
            var p,
                d,
                m,
                g,
                b,
                v,
                w,
                _,
                y,
                x = u.bits,
                k = 0,
                E = 0,
                S = 0,
                I = 0,
                M = 0,
                A = 0,
                T = 0,
                R = 0,
                L = 0,
                P = 0,
                C = null,
                B = 0,
                z = new n.Buf16(16),
                O = new n.Buf16(16),
                D = null,
                U = 0;for (k = 0; k <= 15; k++) {
              z[k] = 0;
            }for (E = 0; E < l; E++) {
              z[e[i + E]]++;
            }for (M = x, I = 15; I >= 1 && 0 === z[I]; I--) {}if (M > I && (M = I), 0 === I) return h[f++] = 20971520, h[f++] = 20971520, u.bits = 1, 0;for (S = 1; S < I && 0 === z[S]; S++) {}for (M < S && (M = S), R = 1, k = 1; k <= 15; k++) {
              if (R <<= 1, (R -= z[k]) < 0) return -1;
            }if (R > 0 && (0 === t || 1 !== I)) return -1;for (O[1] = 0, k = 1; k < 15; k++) {
              O[k + 1] = O[k] + z[k];
            }for (E = 0; E < l; E++) {
              0 !== e[i + E] && (c[O[e[i + E]]++] = E);
            }if (0 === t ? (C = D = c, v = 19) : 1 === t ? (C = r, B -= 257, D = a, U -= 257, v = 256) : (C = o, D = s, v = -1), P = 0, E = 0, k = S, b = f, A = M, T = 0, m = -1, L = 1 << M, g = L - 1, 1 === t && L > 852 || 2 === t && L > 592) return 1;for (var N = 0;;) {
              N++, w = k - T, c[E] < v ? (_ = 0, y = c[E]) : c[E] > v ? (_ = D[U + c[E]], y = C[B + c[E]]) : (_ = 96, y = 0), p = 1 << k - T, d = 1 << A, S = d;do {
                d -= p, h[b + (P >> T) + d] = w << 24 | _ << 16 | y | 0;
              } while (0 !== d);for (p = 1 << k - 1; P & p;) {
                p >>= 1;
              }if (0 !== p ? (P &= p - 1, P += p) : P = 0, E++, 0 == --z[k]) {
                if (k === I) break;k = e[i + c[E]];
              }if (k > M && (P & g) !== m) {
                for (0 === T && (T = M), b += S, A = k - T, R = 1 << A; A + T < I && !((R -= z[A + T]) <= 0);) {
                  A++, R <<= 1;
                }if (L += 1 << A, 1 === t && L > 852 || 2 === t && L > 592) return 1;m = P & g, h[m] = M << 24 | A << 16 | b - f | 0;
              }
            }return 0 !== P && (h[b + P] = k - T << 24 | 64 << 16 | 0), u.bits = M, 0;
          };
        }, { "../utils/common": 43 }], 51: [function (t, e, i) {
          "use strict";
          e.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
        }, {}], 52: [function (t, e, i) {
          "use strict";
          function n(t) {
            for (var e = t.length; --e >= 0;) {
              t[e] = 0;
            }
          }function r(t, e, i, n, r) {
            this.static_tree = t, this.extra_bits = e, this.extra_base = i, this.elems = n, this.max_length = r, this.has_stree = t && t.length;
          }function a(t, e) {
            this.dyn_tree = t, this.max_code = 0, this.stat_desc = e;
          }function o(t) {
            return t < 256 ? at[t] : at[256 + (t >>> 7)];
          }function s(t, e) {
            t.pending_buf[t.pending++] = 255 & e, t.pending_buf[t.pending++] = e >>> 8 & 255;
          }function l(t, e, i) {
            t.bi_valid > Y - i ? (t.bi_buf |= e << t.bi_valid & 65535, s(t, t.bi_buf), t.bi_buf = e >> Y - t.bi_valid, t.bi_valid += i - Y) : (t.bi_buf |= e << t.bi_valid & 65535, t.bi_valid += i);
          }function h(t, e, i) {
            l(t, i[2 * e], i[2 * e + 1]);
          }function f(t, e) {
            var i = 0;do {
              i |= 1 & t, t >>>= 1, i <<= 1;
            } while (--e > 0);return i >>> 1;
          }function c(t) {
            16 === t.bi_valid ? (s(t, t.bi_buf), t.bi_buf = 0, t.bi_valid = 0) : t.bi_valid >= 8 && (t.pending_buf[t.pending++] = 255 & t.bi_buf, t.bi_buf >>= 8, t.bi_valid -= 8);
          }function u(t, e) {
            var i,
                n,
                r,
                a,
                o,
                s,
                l = e.dyn_tree,
                h = e.max_code,
                f = e.stat_desc.static_tree,
                c = e.stat_desc.has_stree,
                u = e.stat_desc.extra_bits,
                p = e.stat_desc.extra_base,
                d = e.stat_desc.max_length,
                m = 0;for (a = 0; a <= Z; a++) {
              t.bl_count[a] = 0;
            }for (l[2 * t.heap[t.heap_max] + 1] = 0, i = t.heap_max + 1; i < q; i++) {
              n = t.heap[i], a = l[2 * l[2 * n + 1] + 1] + 1, a > d && (a = d, m++), l[2 * n + 1] = a, n > h || (t.bl_count[a]++, o = 0, n >= p && (o = u[n - p]), s = l[2 * n], t.opt_len += s * (a + o), c && (t.static_len += s * (f[2 * n + 1] + o)));
            }if (0 !== m) {
              do {
                for (a = d - 1; 0 === t.bl_count[a];) {
                  a--;
                }t.bl_count[a]--, t.bl_count[a + 1] += 2, t.bl_count[d]--, m -= 2;
              } while (m > 0);for (a = d; 0 !== a; a--) {
                for (n = t.bl_count[a]; 0 !== n;) {
                  (r = t.heap[--i]) > h || (l[2 * r + 1] !== a && (t.opt_len += (a - l[2 * r + 1]) * l[2 * r], l[2 * r + 1] = a), n--);
                }
              }
            }
          }function p(t, e, i) {
            var n,
                r,
                a = new Array(Z + 1),
                o = 0;for (n = 1; n <= Z; n++) {
              a[n] = o = o + i[n - 1] << 1;
            }for (r = 0; r <= e; r++) {
              var s = t[2 * r + 1];0 !== s && (t[2 * r] = f(a[s]++, s));
            }
          }function d() {
            var t,
                e,
                i,
                n,
                a,
                o = new Array(Z + 1);for (i = 0, n = 0; n < F - 1; n++) {
              for (st[n] = i, t = 0; t < 1 << Q[n]; t++) {
                ot[i++] = n;
              }
            }for (ot[i - 1] = n, a = 0, n = 0; n < 16; n++) {
              for (lt[n] = a, t = 0; t < 1 << tt[n]; t++) {
                at[a++] = n;
              }
            }for (a >>= 7; n < G; n++) {
              for (lt[n] = a << 7, t = 0; t < 1 << tt[n] - 7; t++) {
                at[256 + a++] = n;
              }
            }for (e = 0; e <= Z; e++) {
              o[e] = 0;
            }for (t = 0; t <= 143;) {
              nt[2 * t + 1] = 8, t++, o[8]++;
            }for (; t <= 255;) {
              nt[2 * t + 1] = 9, t++, o[9]++;
            }for (; t <= 279;) {
              nt[2 * t + 1] = 7, t++, o[7]++;
            }for (; t <= 287;) {
              nt[2 * t + 1] = 8, t++, o[8]++;
            }for (p(nt, H + 1, o), t = 0; t < G; t++) {
              rt[2 * t + 1] = 5, rt[2 * t] = f(t, 5);
            }ht = new r(nt, Q, j + 1, H, Z), ft = new r(rt, tt, 0, G, Z), ct = new r(new Array(0), et, 0, W, X);
          }function m(t) {
            var e;for (e = 0; e < H; e++) {
              t.dyn_ltree[2 * e] = 0;
            }for (e = 0; e < G; e++) {
              t.dyn_dtree[2 * e] = 0;
            }for (e = 0; e < W; e++) {
              t.bl_tree[2 * e] = 0;
            }t.dyn_ltree[2 * V] = 1, t.opt_len = t.static_len = 0, t.last_lit = t.matches = 0;
          }function g(t) {
            t.bi_valid > 8 ? s(t, t.bi_buf) : t.bi_valid > 0 && (t.pending_buf[t.pending++] = t.bi_buf), t.bi_buf = 0, t.bi_valid = 0;
          }function b(t, e, i, n) {
            g(t), n && (s(t, i), s(t, ~i)), P.arraySet(t.pending_buf, t.window, e, i, t.pending), t.pending += i;
          }function v(t, e, i, n) {
            var r = 2 * e,
                a = 2 * i;return t[r] < t[a] || t[r] === t[a] && n[e] <= n[i];
          }function w(t, e, i) {
            for (var n = t.heap[i], r = i << 1; r <= t.heap_len && (r < t.heap_len && v(e, t.heap[r + 1], t.heap[r], t.depth) && r++, !v(e, n, t.heap[r], t.depth));) {
              t.heap[i] = t.heap[r], i = r, r <<= 1;
            }t.heap[i] = n;
          }function _(t, e, i) {
            var n,
                r,
                a,
                s,
                f = 0;if (0 !== t.last_lit) do {
              n = t.pending_buf[t.d_buf + 2 * f] << 8 | t.pending_buf[t.d_buf + 2 * f + 1], r = t.pending_buf[t.l_buf + f], f++, 0 === n ? h(t, r, e) : (a = ot[r], h(t, a + j + 1, e), s = Q[a], 0 !== s && (r -= st[a], l(t, r, s)), n--, a = o(n), h(t, a, i), 0 !== (s = tt[a]) && (n -= lt[a], l(t, n, s)));
            } while (f < t.last_lit);h(t, V, e);
          }function y(t, e) {
            var i,
                n,
                r,
                a = e.dyn_tree,
                o = e.stat_desc.static_tree,
                s = e.stat_desc.has_stree,
                l = e.stat_desc.elems,
                h = -1;for (t.heap_len = 0, t.heap_max = q, i = 0; i < l; i++) {
              0 !== a[2 * i] ? (t.heap[++t.heap_len] = h = i, t.depth[i] = 0) : a[2 * i + 1] = 0;
            }for (; t.heap_len < 2;) {
              r = t.heap[++t.heap_len] = h < 2 ? ++h : 0, a[2 * r] = 1, t.depth[r] = 0, t.opt_len--, s && (t.static_len -= o[2 * r + 1]);
            }for (e.max_code = h, i = t.heap_len >> 1; i >= 1; i--) {
              w(t, a, i);
            }r = l;do {
              i = t.heap[1], t.heap[1] = t.heap[t.heap_len--], w(t, a, 1), n = t.heap[1], t.heap[--t.heap_max] = i, t.heap[--t.heap_max] = n, a[2 * r] = a[2 * i] + a[2 * n], t.depth[r] = (t.depth[i] >= t.depth[n] ? t.depth[i] : t.depth[n]) + 1, a[2 * i + 1] = a[2 * n + 1] = r, t.heap[1] = r++, w(t, a, 1);
            } while (t.heap_len >= 2);t.heap[--t.heap_max] = t.heap[1], u(t, e), p(a, h, t.bl_count);
          }function x(t, e, i) {
            var n,
                r,
                a = -1,
                o = e[1],
                s = 0,
                l = 7,
                h = 4;for (0 === o && (l = 138, h = 3), e[2 * (i + 1) + 1] = 65535, n = 0; n <= i; n++) {
              r = o, o = e[2 * (n + 1) + 1], ++s < l && r === o || (s < h ? t.bl_tree[2 * r] += s : 0 !== r ? (r !== a && t.bl_tree[2 * r]++, t.bl_tree[2 * J]++) : s <= 10 ? t.bl_tree[2 * $]++ : t.bl_tree[2 * K]++, s = 0, a = r, 0 === o ? (l = 138, h = 3) : r === o ? (l = 6, h = 3) : (l = 7, h = 4));
            }
          }function k(t, e, i) {
            var n,
                r,
                a = -1,
                o = e[1],
                s = 0,
                f = 7,
                c = 4;for (0 === o && (f = 138, c = 3), n = 0; n <= i; n++) {
              if (r = o, o = e[2 * (n + 1) + 1], !(++s < f && r === o)) {
                if (s < c) do {
                  h(t, r, t.bl_tree);
                } while (0 != --s);else 0 !== r ? (r !== a && (h(t, r, t.bl_tree), s--), h(t, J, t.bl_tree), l(t, s - 3, 2)) : s <= 10 ? (h(t, $, t.bl_tree), l(t, s - 3, 3)) : (h(t, K, t.bl_tree), l(t, s - 11, 7));s = 0, a = r, 0 === o ? (f = 138, c = 3) : r === o ? (f = 6, c = 3) : (f = 7, c = 4);
              }
            }
          }function E(t) {
            var e;for (x(t, t.dyn_ltree, t.l_desc.max_code), x(t, t.dyn_dtree, t.d_desc.max_code), y(t, t.bl_desc), e = W - 1; e >= 3 && 0 === t.bl_tree[2 * it[e] + 1]; e--) {}return t.opt_len += 3 * (e + 1) + 5 + 5 + 4, e;
          }function S(t, e, i, n) {
            var r;for (l(t, e - 257, 5), l(t, i - 1, 5), l(t, n - 4, 4), r = 0; r < n; r++) {
              l(t, t.bl_tree[2 * it[r] + 1], 3);
            }k(t, t.dyn_ltree, e - 1), k(t, t.dyn_dtree, i - 1);
          }function I(t) {
            var e,
                i = 4093624447;for (e = 0; e <= 31; e++, i >>>= 1) {
              if (1 & i && 0 !== t.dyn_ltree[2 * e]) return B;
            }if (0 !== t.dyn_ltree[18] || 0 !== t.dyn_ltree[20] || 0 !== t.dyn_ltree[26]) return z;for (e = 32; e < j; e++) {
              if (0 !== t.dyn_ltree[2 * e]) return z;
            }return B;
          }function M(t) {
            ut || (d(), ut = !0), t.l_desc = new a(t.dyn_ltree, ht), t.d_desc = new a(t.dyn_dtree, ft), t.bl_desc = new a(t.bl_tree, ct), t.bi_buf = 0, t.bi_valid = 0, m(t);
          }function A(t, e, i, n) {
            l(t, (D << 1) + (n ? 1 : 0), 3), b(t, e, i, !0);
          }function T(t) {
            l(t, U << 1, 3), h(t, V, nt), c(t);
          }function R(t, e, i, n) {
            var r,
                a,
                o = 0;t.level > 0 ? (t.strm.data_type === O && (t.strm.data_type = I(t)), y(t, t.l_desc), y(t, t.d_desc), o = E(t), r = t.opt_len + 3 + 7 >>> 3, (a = t.static_len + 3 + 7 >>> 3) <= r && (r = a)) : r = a = i + 5, i + 4 <= r && e !== -1 ? A(t, e, i, n) : t.strategy === C || a === r ? (l(t, (U << 1) + (n ? 1 : 0), 3), _(t, nt, rt)) : (l(t, (N << 1) + (n ? 1 : 0), 3), S(t, t.l_desc.max_code + 1, t.d_desc.max_code + 1, o + 1), _(t, t.dyn_ltree, t.dyn_dtree)), m(t), n && g(t);
          }function L(t, e, i) {
            return t.pending_buf[t.d_buf + 2 * t.last_lit] = e >>> 8 & 255, t.pending_buf[t.d_buf + 2 * t.last_lit + 1] = 255 & e, t.pending_buf[t.l_buf + t.last_lit] = 255 & i, t.last_lit++, 0 === e ? t.dyn_ltree[2 * i]++ : (t.matches++, e--, t.dyn_ltree[2 * (ot[i] + j + 1)]++, t.dyn_dtree[2 * o(e)]++), t.last_lit === t.lit_bufsize - 1;
          }var P = t("../utils/common"),
              C = 4,
              B = 0,
              z = 1,
              O = 2,
              D = 0,
              U = 1,
              N = 2,
              F = 29,
              j = 256,
              H = j + 1 + F,
              G = 30,
              W = 19,
              q = 2 * H + 1,
              Z = 15,
              Y = 16,
              X = 7,
              V = 256,
              J = 16,
              $ = 17,
              K = 18,
              Q = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0],
              tt = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
              et = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7],
              it = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
              nt = new Array(2 * (H + 2));n(nt);var rt = new Array(2 * G);n(rt);var at = new Array(512);n(at);var ot = new Array(256);n(ot);var st = new Array(F);n(st);var lt = new Array(G);n(lt);var ht,
              ft,
              ct,
              ut = !1;i._tr_init = M, i._tr_stored_block = A, i._tr_flush_block = R, i._tr_tally = L, i._tr_align = T;
        }, { "../utils/common": 43 }], 53: [function (t, e, i) {
          "use strict";
          function n() {
            this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
          }e.exports = n;
        }, {}], 54: [function (t, e, i) {
          function n(t, e) {
            if (!(t = t.replace(/\t+/g, " ").trim())) return null;var i = t.indexOf(" ");if (i === -1) throw new Error("no named row at line " + e);var n = t.substring(0, i);t = t.substring(i + 1), t = t.replace(/letter=[\'\"]\S+[\'\"]/gi, ""), t = t.split("="), t = t.map(function (t) {
              return t.trim().match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
            });for (var a = [], o = 0; o < t.length; o++) {
              var s = t[o];0 === o ? a.push({ key: s[0], data: "" }) : o === t.length - 1 ? a[a.length - 1].data = r(s[0]) : (a[a.length - 1].data = r(s[0]), a.push({ key: s[1], data: "" }));
            }var l = { key: n, data: {} };return a.forEach(function (t) {
              l.data[t.key] = t.data;
            }), l;
          }function r(t) {
            return t && 0 !== t.length ? 0 === t.indexOf('"') || 0 === t.indexOf("'") ? t.substring(1, t.length - 1) : t.indexOf(",") !== -1 ? a(t) : parseInt(t, 10) : "";
          }function a(t) {
            return t.split(",").map(function (t) {
              return parseInt(t, 10);
            });
          }e.exports = function (t) {
            if (!t) throw new Error("no data provided");t = t.toString().trim();var e = { pages: [], chars: [], kernings: [] },
                i = t.split(/\r\n?|\n/g);if (0 === i.length) throw new Error("no data in BMFont file");for (var r = 0; r < i.length; r++) {
              var a = n(i[r], r);if (a) if ("page" === a.key) {
                if ("number" != typeof a.data.id) throw new Error("malformed file at line " + r + " -- needs page id=N");if ("string" != typeof a.data.file) throw new Error("malformed file at line " + r + ' -- needs page file="path"');e.pages[a.data.id] = a.data.file;
              } else "chars" === a.key || "kernings" === a.key || ("char" === a.key ? e.chars.push(a.data) : "kerning" === a.key ? e.kernings.push(a.data) : e[a.key] = a.data);
            }return e;
          };
        }, {}], 55: [function (t, e, i) {
          function n(t, e, i) {
            if (i > e.length - 1) return 0;var n = e.readUInt8(i++),
                h = e.readInt32LE(i);switch (i += 4, n) {case 1:
                t.info = r(e, i);break;case 2:
                t.common = a(e, i);break;case 3:
                t.pages = o(e, i, h);break;case 4:
                t.chars = s(e, i, h);break;case 5:
                t.kernings = l(e, i, h);}return 5 + h;
          }function r(t, e) {
            var i = {};i.size = t.readInt16LE(e);var n = t.readUInt8(e + 2);return i.smooth = n >> 7 & 1, i.unicode = n >> 6 & 1, i.italic = n >> 5 & 1, i.bold = n >> 4 & 1, n >> 3 & 1 && (i.fixedHeight = 1), i.charset = t.readUInt8(e + 3) || "", i.stretchH = t.readUInt16LE(e + 4), i.aa = t.readUInt8(e + 6), i.padding = [t.readInt8(e + 7), t.readInt8(e + 8), t.readInt8(e + 9), t.readInt8(e + 10)], i.spacing = [t.readInt8(e + 11), t.readInt8(e + 12)], i.outline = t.readUInt8(e + 13), i.face = f(t, e + 14), i;
          }function a(t, e) {
            var i = {};i.lineHeight = t.readUInt16LE(e), i.base = t.readUInt16LE(e + 2), i.scaleW = t.readUInt16LE(e + 4), i.scaleH = t.readUInt16LE(e + 6), i.pages = t.readUInt16LE(e + 8);t.readUInt8(e + 10);return i.packed = 0, i.alphaChnl = t.readUInt8(e + 11), i.redChnl = t.readUInt8(e + 12), i.greenChnl = t.readUInt8(e + 13), i.blueChnl = t.readUInt8(e + 14), i;
          }function o(t, e, i) {
            for (var n = [], r = h(t, e), a = r.length + 1, o = i / a, s = 0; s < o; s++) {
              n[s] = t.slice(e, e + r.length).toString("utf8"), e += a;
            }return n;
          }function s(t, e, i) {
            for (var n = [], r = i / 20, a = 0; a < r; a++) {
              var o = {},
                  s = 20 * a;o.id = t.readUInt32LE(e + 0 + s), o.x = t.readUInt16LE(e + 4 + s), o.y = t.readUInt16LE(e + 6 + s), o.width = t.readUInt16LE(e + 8 + s), o.height = t.readUInt16LE(e + 10 + s), o.xoffset = t.readInt16LE(e + 12 + s), o.yoffset = t.readInt16LE(e + 14 + s), o.xadvance = t.readInt16LE(e + 16 + s), o.page = t.readUInt8(e + 18 + s), o.chnl = t.readUInt8(e + 19 + s), n[a] = o;
            }return n;
          }function l(t, e, i) {
            for (var n = [], r = i / 10, a = 0; a < r; a++) {
              var o = {},
                  s = 10 * a;o.first = t.readUInt32LE(e + 0 + s), o.second = t.readUInt32LE(e + 4 + s), o.amount = t.readInt16LE(e + 8 + s), n[a] = o;
            }return n;
          }function h(t, e) {
            for (var i = e; i < t.length && 0 !== t[i]; i++) {}return t.slice(e, i);
          }function f(t, e) {
            return h(t, e).toString("utf8");
          }var c = [66, 77, 70];e.exports = function (t) {
            if (t.length < 6) throw new Error("invalid buffer length for BMFont");if (!c.every(function (e, i) {
              return t.readUInt8(i) === e;
            })) throw new Error("BMFont missing BMF byte header");var e = 3;if (t.readUInt8(e++) > 3) throw new Error("Only supports BMFont Binary v3 (BMFont App v1.10)");for (var i = { kernings: [], chars: [] }, r = 0; r < 5; r++) {
              e += n(i, t, e);
            }return i;
          };
        }, {}], 56: [function (t, e, i) {
          function n(t) {
            return r(t).reduce(function (t, e) {
              return t[a(e.nodeName)] = e.nodeValue, t;
            }, {});
          }function r(t) {
            for (var e = [], i = 0; i < t.attributes.length; i++) {
              e.push(t.attributes[i]);
            }return e;
          }function a(t) {
            return l[t.toLowerCase()] || t;
          }var o = t("./parse-attribs"),
              s = t("xml-parse-from-string"),
              l = { scaleh: "scaleH", scalew: "scaleW", stretchh: "stretchH", lineheight: "lineHeight", alphachnl: "alphaChnl", redchnl: "redChnl", greenchnl: "greenChnl", bluechnl: "blueChnl" };e.exports = function (t) {
            t = t.toString();var e = s(t),
                i = { pages: [], chars: [], kernings: [] };["info", "common"].forEach(function (t) {
              var r = e.getElementsByTagName(t)[0];r && (i[t] = o(n(r)));
            });var r = e.getElementsByTagName("pages")[0];if (!r) throw new Error("malformed file -- no <pages> element");for (var a = r.getElementsByTagName("page"), l = 0; l < a.length; l++) {
              var h = a[l],
                  f = parseInt(h.getAttribute("id"), 10),
                  c = h.getAttribute("file");if (isNaN(f)) throw new Error('malformed file -- page "id" attribute is NaN');if (!c) throw new Error('malformed file -- needs page "file" attribute');i.pages[parseInt(f, 10)] = c;
            }return ["chars", "kernings"].forEach(function (t) {
              var r = e.getElementsByTagName(t)[0];if (r) for (var a = t.substring(0, t.length - 1), s = r.getElementsByTagName(a), l = 0; l < s.length; l++) {
                var h = s[l];i[t].push(o(n(h)));
              }
            }), i;
          };
        }, { "./parse-attribs": 57, "xml-parse-from-string": 105 }], 57: [function (t, e, i) {
          function n(t) {
            return t.split(",").map(function (t) {
              return parseInt(t, 10);
            });
          }e.exports = function (t) {
            "chasrset" in t && (t.charset = t.chasrset, delete t.chasrset);for (var e in t) {
              "face" !== e && "charset" !== e && (t[e] = "padding" === e || "spacing" === e ? n(t[e]) : parseInt(t[e], 10));
            }return t;
          };
        }, {}], 58: [function (t, e, i) {
          var n = t("trim"),
              r = t("for-each"),
              a = function a(t) {
            return "[object Array]" === Object.prototype.toString.call(t);
          };e.exports = function (t) {
            if (!t) return {};var e = {};return r(n(t).split("\n"), function (t) {
              var i = t.indexOf(":"),
                  r = n(t.slice(0, i)).toLowerCase(),
                  o = n(t.slice(i + 1));void 0 === e[r] ? e[r] = o : a(e[r]) ? e[r].push(o) : e[r] = [e[r], o];
            }), e;
          };
        }, { "for-each": 28, trim: 99 }], 59: [function (t, e, i) {
          (function (t) {
            function e(t, e) {
              for (var i = 0, n = t.length - 1; n >= 0; n--) {
                var r = t[n];"." === r ? t.splice(n, 1) : ".." === r ? (t.splice(n, 1), i++) : i && (t.splice(n, 1), i--);
              }if (e) for (; i--; i) {
                t.unshift("..");
              }return t;
            }function n(t, e) {
              if (t.filter) return t.filter(e);for (var i = [], n = 0; n < t.length; n++) {
                e(t[n], n, t) && i.push(t[n]);
              }return i;
            }var r = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,
                a = function a(t) {
              return r.exec(t).slice(1);
            };i.resolve = function () {
              for (var i = "", r = !1, a = arguments.length - 1; a >= -1 && !r; a--) {
                var o = a >= 0 ? arguments[a] : t.cwd();if ("string" != typeof o) throw new TypeError("Arguments to path.resolve must be strings");o && (i = o + "/" + i, r = "/" === o.charAt(0));
              }return i = e(n(i.split("/"), function (t) {
                return !!t;
              }), !r).join("/"), (r ? "/" : "") + i || ".";
            }, i.normalize = function (t) {
              var r = i.isAbsolute(t),
                  a = "/" === o(t, -1);return t = e(n(t.split("/"), function (t) {
                return !!t;
              }), !r).join("/"), t || r || (t = "."), t && a && (t += "/"), (r ? "/" : "") + t;
            }, i.isAbsolute = function (t) {
              return "/" === t.charAt(0);
            }, i.join = function () {
              var t = Array.prototype.slice.call(arguments, 0);return i.normalize(n(t, function (t, e) {
                if ("string" != typeof t) throw new TypeError("Arguments to path.join must be strings");return t;
              }).join("/"));
            }, i.relative = function (t, e) {
              function n(t) {
                for (var e = 0; e < t.length && "" === t[e]; e++) {}for (var i = t.length - 1; i >= 0 && "" === t[i]; i--) {}return e > i ? [] : t.slice(e, i - e + 1);
              }t = i.resolve(t).substr(1), e = i.resolve(e).substr(1);for (var r = n(t.split("/")), a = n(e.split("/")), o = Math.min(r.length, a.length), s = o, l = 0; l < o; l++) {
                if (r[l] !== a[l]) {
                  s = l;break;
                }
              }for (var h = [], l = s; l < r.length; l++) {
                h.push("..");
              }return h = h.concat(a.slice(s)), h.join("/");
            }, i.sep = "/", i.delimiter = ":", i.dirname = function (t) {
              var e = a(t),
                  i = e[0],
                  n = e[1];return i || n ? (n && (n = n.substr(0, n.length - 1)), i + n) : ".";
            }, i.basename = function (t, e) {
              var i = a(t)[2];return e && i.substr(-1 * e.length) === e && (i = i.substr(0, i.length - e.length)), i;
            }, i.extname = function (t) {
              return a(t)[3];
            };var o = "b" === "ab".substr(-1) ? function (t, e, i) {
              return t.substr(e, i);
            } : function (t, e, i) {
              return e < 0 && (e = t.length + e), t.substr(e, i);
            };
          }).call(this, t("_process"));
        }, { _process: 12 }], 60: [function (t, e, i) {
          "use strict";
          function n(t, e, i, n, o, s) {
            s || (s = {});for (var l = void 0 === s.threshold ? .1 : s.threshold, u = 35215 * l * l, p = 0, d = 0; d < o; d++) {
              for (var m = 0; m < n; m++) {
                var g = 4 * (d * n + m),
                    b = a(t, e, g, g);if (b > u) s.includeAA || !r(t, m, d, n, o, e) && !r(e, m, d, n, o, t) ? (i && f(i, g, 255, 0, 0), p++) : i && f(i, g, 255, 255, 0);else if (i) {
                  var v = h(c(t, g), .1);f(i, g, v, v, v);
                }
              }
            }return p;
          }function r(t, e, i, n, o, s) {
            for (var l, h, f, c, u = Math.max(e - 1, 0), p = Math.max(i - 1, 0), d = Math.min(e + 1, n - 1), m = Math.min(i + 1, o - 1), g = 4 * (i * n + e), b = 0, v = 0, w = 0, _ = 0, y = 0, x = u; x <= d; x++) {
              for (var k = p; k <= m; k++) {
                if (x !== e || k !== i) {
                  var E = a(t, t, g, 4 * (k * n + x), !0);if (0 === E ? b++ : E < 0 ? w++ : E > 0 && v++, b > 2) return !1;s && (E < _ && (_ = E, l = x, h = k), E > y && (y = E, f = x, c = k));
                }
              }
            }return !s || 0 !== w && 0 !== v && (!r(t, l, h, n, o) && !r(s, l, h, n, o) || !r(t, f, c, n, o) && !r(s, f, c, n, o));
          }function a(t, e, i, n, r) {
            var a = t[i + 3] / 255,
                f = e[n + 3] / 255,
                c = h(t[i + 0], a),
                u = h(t[i + 1], a),
                p = h(t[i + 2], a),
                d = h(e[n + 0], f),
                m = h(e[n + 1], f),
                g = h(e[n + 2], f),
                b = o(c, u, p) - o(d, m, g);if (r) return b;var v = s(c, u, p) - s(d, m, g),
                w = l(c, u, p) - l(d, m, g);return .5053 * b * b + .299 * v * v + .1957 * w * w;
          }function o(t, e, i) {
            return .29889531 * t + .58662247 * e + .11448223 * i;
          }function s(t, e, i) {
            return .59597799 * t - .2741761 * e - .32180189 * i;
          }function l(t, e, i) {
            return .21147017 * t - .52261711 * e + .31114694 * i;
          }function h(t, e) {
            return 255 + (t - 255) * e;
          }function f(t, e, i, n, r) {
            t[e + 0] = i, t[e + 1] = n, t[e + 2] = r, t[e + 3] = 255;
          }function c(t, e) {
            var i = t[e + 3] / 255;return o(h(t[e + 0], i), h(t[e + 1], i), h(t[e + 2], i));
          }e.exports = n;
        }, {}], 61: [function (t, e, i) {
          (function (e) {
            "use strict";
            function n(t, e) {
              function i() {
                if (r === t.length) throw new Error("Ran out of data");var i = t[r];r++;var a, o, s, l, h, f, c, u;switch (e) {default:
                    throw new Error("unrecognised depth");case 16:
                    c = t[r], r++, n.push((i << 8) + c);break;case 4:
                    c = 15 & i, u = i >> 4, n.push(u, c);break;case 2:
                    h = 3 & i, f = i >> 2 & 3, c = i >> 4 & 3, u = i >> 6 & 3, n.push(u, c, f, h);break;case 1:
                    a = 1 & i, o = i >> 1 & 1, s = i >> 2 & 1, l = i >> 3 & 1, h = i >> 4 & 1, f = i >> 5 & 1, c = i >> 6 & 1, u = i >> 7 & 1, n.push(u, c, f, h, l, s, o, a);}
              }var n = [],
                  r = 0;return { get: function get(t) {
                  for (; n.length < t;) {
                    i();
                  }var e = n.slice(0, t);return n = n.slice(t), e;
                }, resetAfterLine: function resetAfterLine() {
                  n.length = 0;
                }, end: function end() {
                  if (r !== t.length) throw new Error("extra data found");
                } };
            }function r(t, e, i, n, r, a) {
              for (var o = t.width, l = t.height, h = t.index, f = 0; f < l; f++) {
                for (var c = 0; c < o; c++) {
                  for (var u = i(c, f, h), p = 0; p < 4; p++) {
                    var d = s[n][p];if (p === r.length) throw new Error("Ran out of data");e[u + p] = 255 !== d ? r[d + a] : 255;
                  }a += n;
                }
              }return a;
            }function a(t, e, i, n, r, a) {
              for (var o = t.width, l = t.height, h = t.index, f = 0; f < l; f++) {
                for (var c = 0; c < o; c++) {
                  for (var u = r.get(n), p = i(c, f, h), d = 0; d < 4; d++) {
                    var m = s[n][d];e[p + d] = 255 !== m ? u[m] : a;
                  }
                }r.resetAfterLine();
              }
            }var o = t("./interlace"),
                s = { 1: { 0: 0, 1: 0, 2: 0, 3: 255 }, 2: { 0: 0, 1: 0, 2: 0, 3: 1 }, 3: { 0: 0, 1: 1, 2: 2, 3: 255 }, 4: { 0: 0, 1: 1, 2: 2, 3: 3 } };i.dataToBitMap = function (t, i) {
              var s = i.width,
                  l = i.height,
                  h = i.depth,
                  f = i.bpp,
                  c = i.interlace;if (8 !== h) var u = n(t, h);var p;p = h <= 8 ? new e(s * l * 4) : new Uint16Array(s * l * 4);var d,
                  m,
                  g = Math.pow(2, h) - 1,
                  b = 0;if (c) d = o.getImagePasses(s, l), m = o.getInterlaceIterator(s, l);else {
                var v = 0;m = function m() {
                  var t = v;return v += 4, t;
                }, d = [{ width: s, height: l }];
              }for (var w = 0; w < d.length; w++) {
                8 === h ? b = r(d[w], p, m, f, t, b) : a(d[w], p, m, f, u, g);
              }if (8 === h) {
                if (b !== t.length) throw new Error("extra data found");
              } else u.end();return p;
            };
          }).call(this, t("buffer").Buffer);
        }, { "./interlace": 71, buffer: 14 }], 62: [function (t, e, i) {
          (function (i) {
            "use strict";
            var n = t("./constants");e.exports = function (t, e, r, a) {
              var o = a.colorType === n.COLORTYPE_COLOR_ALPHA;if (a.inputHasAlpha && o) return t;if (!a.inputHasAlpha && !o) return t;var s = o ? 4 : 3,
                  l = new i(e * r * s),
                  h = a.inputHasAlpha ? 4 : 3,
                  f = 0,
                  c = 0,
                  u = a.bgColor || {};void 0 === u.red && (u.red = 255), void 0 === u.green && (u.green = 255), void 0 === u.blue && (u.blue = 255);for (var p = 0; p < r; p++) {
                for (var d = 0; d < e; d++) {
                  var m,
                      g = t[f],
                      b = t[f + 1],
                      v = t[f + 2];a.inputHasAlpha ? (m = t[f + 3], o || (m /= 255, g = Math.min(Math.max(Math.round((1 - m) * u.red + m * g), 0), 255), b = Math.min(Math.max(Math.round((1 - m) * u.green + m * b), 0), 255), v = Math.min(Math.max(Math.round((1 - m) * u.blue + m * v), 0), 255))) : m = 255, l[c] = g, l[c + 1] = b, l[c + 2] = v, o && (l[c + 3] = m), f += h, c += s;
                }
              }return l;
            };
          }).call(this, t("buffer").Buffer);
        }, { "./constants": 64, buffer: 14 }], 63: [function (t, e, i) {
          (function (i, n) {
            "use strict";
            var r = t("util"),
                a = t("stream"),
                o = e.exports = function () {
              a.call(this), this._buffers = [], this._buffered = 0, this._reads = [], this._paused = !1, this._encoding = "utf8", this.writable = !0;
            };r.inherits(o, a), o.prototype.read = function (t, e) {
              this._reads.push({ length: Math.abs(t), allowLess: t < 0, func: e }), i.nextTick(function () {
                this._process(), this._paused && this._reads.length > 0 && (this._paused = !1, this.emit("drain"));
              }.bind(this));
            }, o.prototype.write = function (t, e) {
              if (!this.writable) return this.emit("error", new Error("Stream not writable")), !1;var i;return i = n.isBuffer(t) ? t : new n(t, e || this._encoding), this._buffers.push(i), this._buffered += i.length, this._process(), this._reads && 0 === this._reads.length && (this._paused = !0), this.writable && !this._paused;
            }, o.prototype.end = function (t, e) {
              t && this.write(t, e), this.writable = !1, this._buffers && (0 === this._buffers.length ? this._end() : (this._buffers.push(null), this._process()));
            }, o.prototype.destroySoon = o.prototype.end, o.prototype._end = function () {
              this._reads.length > 0 && this.emit("error", new Error("There are some read requests waiting on finished stream")), this.destroy();
            }, o.prototype.destroy = function () {
              this._buffers && (this.writable = !1, this._reads = null, this._buffers = null, this.emit("close"));
            }, o.prototype._processReadAllowingLess = function (t) {
              this._reads.shift();var e = this._buffers[0];e.length > t.length ? (this._buffered -= t.length, this._buffers[0] = e.slice(t.length), t.func.call(this, e.slice(0, t.length))) : (this._buffered -= e.length, this._buffers.shift(), t.func.call(this, e));
            }, o.prototype._processRead = function (t) {
              this._reads.shift();for (var e = 0, i = 0, r = new n(t.length); e < t.length;) {
                var a = this._buffers[i++],
                    o = Math.min(a.length, t.length - e);a.copy(r, e, 0, o), e += o, o !== a.length && (this._buffers[--i] = a.slice(o));
              }i > 0 && this._buffers.splice(0, i), this._buffered -= t.length, t.func.call(this, r);
            }, o.prototype._process = function () {
              try {
                for (; this._buffered > 0 && this._reads && this._reads.length > 0;) {
                  var t = this._reads[0];if (t.allowLess) this._processReadAllowingLess(t);else {
                    if (!(this._buffered >= t.length)) break;this._processRead(t);
                  }
                }this._buffers && this._buffers.length > 0 && null === this._buffers[0] && this._end();
              } catch (t) {
                this.emit("error", t);
              }
            };
          }).call(this, t("_process"), t("buffer").Buffer);
        }, { _process: 12, buffer: 14, stream: 94, util: 103 }], 64: [function (t, e, i) {
          "use strict";
          e.exports = { PNG_SIGNATURE: [137, 80, 78, 71, 13, 10, 26, 10], TYPE_IHDR: 1229472850, TYPE_IEND: 1229278788, TYPE_IDAT: 1229209940, TYPE_PLTE: 1347179589, TYPE_tRNS: 1951551059, TYPE_gAMA: 1732332865, COLORTYPE_GRAYSCALE: 0, COLORTYPE_PALETTE: 1, COLORTYPE_COLOR: 2, COLORTYPE_ALPHA: 4, COLORTYPE_PALETTE_COLOR: 3, COLORTYPE_COLOR_ALPHA: 6, COLORTYPE_TO_BPP_MAP: { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }, GAMMA_DIVISION: 1e5 };
        }, {}], 65: [function (t, e, i) {
          "use strict";
          var n = [];!function () {
            for (var t = 0; t < 256; t++) {
              for (var e = t, i = 0; i < 8; i++) {
                1 & e ? e = 3988292384 ^ e >>> 1 : e >>>= 1;
              }n[t] = e;
            }
          }();var r = e.exports = function () {
            this._crc = -1;
          };r.prototype.write = function (t) {
            for (var e = 0; e < t.length; e++) {
              this._crc = n[255 & (this._crc ^ t[e])] ^ this._crc >>> 8;
            }return !0;
          }, r.prototype.crc32 = function () {
            return this._crc ^ -1;
          }, r.crc32 = function (t) {
            for (var e = -1, i = 0; i < t.length; i++) {
              e = n[255 & (e ^ t[i])] ^ e >>> 8;
            }return e ^ -1;
          };
        }, {}], 66: [function (t, e, i) {
          (function (i) {
            "use strict";
            function n(t, e, i, n, r) {
              t.copy(n, r, e, e + i);
            }function r(t, e, i) {
              for (var n = 0, r = e + i, a = e; a < r; a++) {
                n += Math.abs(t[a]);
              }return n;
            }function a(t, e, i, n, r, a) {
              for (var o = 0; o < i; o++) {
                var s = o >= a ? t[e + o - a] : 0,
                    l = t[e + o] - s;n[r + o] = l;
              }
            }function o(t, e, i, n) {
              for (var r = 0, a = 0; a < i; a++) {
                var o = a >= n ? t[e + a - n] : 0,
                    s = t[e + a] - o;r += Math.abs(s);
              }return r;
            }function s(t, e, i, n, r) {
              for (var a = 0; a < i; a++) {
                var o = e > 0 ? t[e + a - i] : 0,
                    s = t[e + a] - o;n[r + a] = s;
              }
            }function l(t, e, i) {
              for (var n = 0, r = e + i, a = e; a < r; a++) {
                var o = e > 0 ? t[a - i] : 0,
                    s = t[a] - o;n += Math.abs(s);
              }return n;
            }function h(t, e, i, n, r, a) {
              for (var o = 0; o < i; o++) {
                var s = o >= a ? t[e + o - a] : 0,
                    l = e > 0 ? t[e + o - i] : 0,
                    h = t[e + o] - (s + l >> 1);n[r + o] = h;
              }
            }function f(t, e, i, n) {
              for (var r = 0, a = 0; a < i; a++) {
                var o = a >= n ? t[e + a - n] : 0,
                    s = e > 0 ? t[e + a - i] : 0,
                    l = t[e + a] - (o + s >> 1);r += Math.abs(l);
              }return r;
            }function c(t, e, i, n, r, a) {
              for (var o = 0; o < i; o++) {
                var s = o >= a ? t[e + o - a] : 0,
                    l = e > 0 ? t[e + o - i] : 0,
                    h = e > 0 && o >= a ? t[e + o - (i + a)] : 0,
                    f = t[e + o] - p(s, l, h);n[r + o] = f;
              }
            }function u(t, e, i, n) {
              for (var r = 0, a = 0; a < i; a++) {
                var o = a >= n ? t[e + a - n] : 0,
                    s = e > 0 ? t[e + a - i] : 0,
                    l = e > 0 && a >= n ? t[e + a - (i + n)] : 0,
                    h = t[e + a] - p(o, s, l);r += Math.abs(h);
              }return r;
            }var p = t("./paeth-predictor"),
                d = { 0: n, 1: a, 2: s, 3: h, 4: c },
                m = { 0: r, 1: o, 2: l, 3: f, 4: u };e.exports = function (t, e, n, r, a) {
              var o;if ("filterType" in r && r.filterType !== -1) {
                if ("number" != typeof r.filterType) throw new Error("unrecognised filter types");o = [r.filterType];
              } else o = [0, 1, 2, 3, 4];for (var s = e * a, l = 0, h = 0, f = new i((s + 1) * n), c = o[0], u = 0; u < n; u++) {
                if (o.length > 1) for (var p = 1 / 0, g = 0; g < o.length; g++) {
                  var b = m[o[g]](t, h, s, a);b < p && (c = o[g], p = b);
                }f[l] = c, l++, d[c](t, h, s, f, l, a), l += s, h += s;
              }return f;
            };
          }).call(this, t("buffer").Buffer);
        }, { "./paeth-predictor": 75, buffer: 14 }], 67: [function (t, e, i) {
          (function (i) {
            "use strict";
            var n = t("util"),
                r = t("./chunkstream"),
                a = t("./filter-parse"),
                o = e.exports = function (t) {
              r.call(this);var e = [],
                  n = this;this._filter = new a(t, { read: this.read.bind(this), write: function write(t) {
                  e.push(t);
                }, complete: function complete() {
                  n.emit("complete", i.concat(e));
                } }), this._filter.start();
            };n.inherits(o, r);
          }).call(this, t("buffer").Buffer);
        }, { "./chunkstream": 63, "./filter-parse": 69, buffer: 14, util: 103 }], 68: [function (t, e, i) {
          (function (e) {
            "use strict";
            var n = t("./sync-reader"),
                r = t("./filter-parse");i.process = function (t, i) {
              var a = [],
                  o = new n(t);return new r(i, { read: o.read.bind(o), write: function write(t) {
                  a.push(t);
                }, complete: function complete() {} }).start(), o.process(), e.concat(a);
            };
          }).call(this, t("buffer").Buffer);
        }, { "./filter-parse": 69, "./sync-reader": 81, buffer: 14 }], 69: [function (t, e, i) {
          (function (i) {
            "use strict";
            function n(t, e, i) {
              var n = t * e;return 8 !== i && (n = Math.ceil(n / (8 / i))), n;
            }var r = t("./interlace"),
                a = t("./paeth-predictor"),
                o = e.exports = function (t, e) {
              var i = t.width,
                  a = t.height,
                  o = t.interlace,
                  s = t.bpp,
                  l = t.depth;if (this.read = e.read, this.write = e.write, this.complete = e.complete, this._imageIndex = 0, this._images = [], o) for (var h = r.getImagePasses(i, a), f = 0; f < h.length; f++) {
                this._images.push({ byteWidth: n(h[f].width, s, l), height: h[f].height, lineIndex: 0 });
              } else this._images.push({ byteWidth: n(i, s, l), height: a, lineIndex: 0 });this._xComparison = 8 === l ? s : 16 === l ? 2 * s : 1;
            };o.prototype.start = function () {
              this.read(this._images[this._imageIndex].byteWidth + 1, this._reverseFilterLine.bind(this));
            }, o.prototype._unFilterType1 = function (t, e, i) {
              for (var n = this._xComparison, r = n - 1, a = 0; a < i; a++) {
                var o = t[1 + a],
                    s = a > r ? e[a - n] : 0;e[a] = o + s;
              }
            }, o.prototype._unFilterType2 = function (t, e, i) {
              for (var n = this._lastLine, r = 0; r < i; r++) {
                var a = t[1 + r],
                    o = n ? n[r] : 0;e[r] = a + o;
              }
            }, o.prototype._unFilterType3 = function (t, e, i) {
              for (var n = this._xComparison, r = n - 1, a = this._lastLine, o = 0; o < i; o++) {
                var s = t[1 + o],
                    l = a ? a[o] : 0,
                    h = o > r ? e[o - n] : 0,
                    f = Math.floor((h + l) / 2);e[o] = s + f;
              }
            }, o.prototype._unFilterType4 = function (t, e, i) {
              for (var n = this._xComparison, r = n - 1, o = this._lastLine, s = 0; s < i; s++) {
                var l = t[1 + s],
                    h = o ? o[s] : 0,
                    f = s > r ? e[s - n] : 0,
                    c = s > r && o ? o[s - n] : 0,
                    u = a(f, h, c);e[s] = l + u;
              }
            }, o.prototype._reverseFilterLine = function (t) {
              var e,
                  n = t[0],
                  r = this._images[this._imageIndex],
                  a = r.byteWidth;if (0 === n) e = t.slice(1, a + 1);else switch (e = new i(a), n) {case 1:
                  this._unFilterType1(t, e, a);break;case 2:
                  this._unFilterType2(t, e, a);break;case 3:
                  this._unFilterType3(t, e, a);break;case 4:
                  this._unFilterType4(t, e, a);break;default:
                  throw new Error("Unrecognised filter type - " + n);}this.write(e), r.lineIndex++, r.lineIndex >= r.height ? (this._lastLine = null, this._imageIndex++, r = this._images[this._imageIndex]) : this._lastLine = e, r ? this.read(r.byteWidth + 1, this._reverseFilterLine.bind(this)) : (this._lastLine = null, this.complete());
            };
          }).call(this, t("buffer").Buffer);
        }, { "./interlace": 71, "./paeth-predictor": 75, buffer: 14 }], 70: [function (t, e, i) {
          (function (t) {
            "use strict";
            function i(t, e, i, n, r) {
              for (var a = 0, o = 0; o < n; o++) {
                for (var s = 0; s < i; s++) {
                  var l = r[t[a]];if (!l) throw new Error("index " + t[a] + " not in palette");for (var h = 0; h < 4; h++) {
                    e[a + h] = l[h];
                  }a += 4;
                }
              }
            }function n(t, e, i, n, r) {
              for (var a = 0, o = 0; o < n; o++) {
                for (var s = 0; s < i; s++) {
                  var l = !1;if (1 === r.length ? r[0] === t[a] && (l = !0) : r[0] === t[a] && r[1] === t[a + 1] && r[2] === t[a + 2] && (l = !0), l) for (var h = 0; h < 4; h++) {
                    e[a + h] = 0;
                  }a += 4;
                }
              }
            }function r(t, e, i, n, r) {
              for (var a = Math.pow(2, r) - 1, o = 0, s = 0; s < n; s++) {
                for (var l = 0; l < i; l++) {
                  for (var h = 0; h < 4; h++) {
                    e[o + h] = Math.floor(255 * t[o + h] / a + .5);
                  }o += 4;
                }
              }
            }e.exports = function (e, a) {
              var o = a.depth,
                  s = a.width,
                  l = a.height,
                  h = a.colorType,
                  f = a.transColor,
                  c = a.palette,
                  u = e;return 3 === h ? i(e, u, s, l, c) : (f && n(e, u, s, l, f), 8 !== o && (16 === o && (u = new t(s * l * 4)), r(e, u, s, l, o))), u;
            };
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14 }], 71: [function (t, e, i) {
          "use strict";
          var n = [{ x: [0], y: [0] }, { x: [4], y: [0] }, { x: [0, 4], y: [4] }, { x: [2, 6], y: [0, 4] }, { x: [0, 2, 4, 6], y: [2, 6] }, { x: [1, 3, 5, 7], y: [0, 2, 4, 6] }, { x: [0, 1, 2, 3, 4, 5, 6, 7], y: [1, 3, 5, 7] }];i.getImagePasses = function (t, e) {
            for (var i = [], r = t % 8, a = e % 8, o = (t - r) / 8, s = (e - a) / 8, l = 0; l < n.length; l++) {
              for (var h = n[l], f = o * h.x.length, c = s * h.y.length, u = 0; u < h.x.length && h.x[u] < r; u++) {
                f++;
              }for (u = 0; u < h.y.length && h.y[u] < a; u++) {
                c++;
              }f > 0 && c > 0 && i.push({ width: f, height: c, index: l });
            }return i;
          }, i.getInterlaceIterator = function (t) {
            return function (e, i, r) {
              var a = e % n[r].x.length,
                  o = (e - a) / n[r].x.length * 8 + n[r].x[a],
                  s = i % n[r].y.length;return 4 * o + ((i - s) / n[r].y.length * 8 + n[r].y[s]) * t * 4;
            };
          };
        }, {}], 72: [function (t, e, i) {
          (function (i) {
            "use strict";
            var n = t("util"),
                r = t("stream"),
                a = t("./constants"),
                o = t("./packer"),
                s = e.exports = function (t) {
              r.call(this);var e = t || {};this._packer = new o(e), this._deflate = this._packer.createDeflate(), this.readable = !0;
            };n.inherits(s, r), s.prototype.pack = function (t, e, n, r) {
              this.emit("data", new i(a.PNG_SIGNATURE)), this.emit("data", this._packer.packIHDR(e, n)), r && this.emit("data", this._packer.packGAMA(r));var o = this._packer.filterData(t, e, n);this._deflate.on("error", this.emit.bind(this, "error")), this._deflate.on("data", function (t) {
                this.emit("data", this._packer.packIDAT(t));
              }.bind(this)), this._deflate.on("end", function () {
                this.emit("data", this._packer.packIEND()), this.emit("end");
              }.bind(this)), this._deflate.end(o);
            };
          }).call(this, t("buffer").Buffer);
        }, { "./constants": 64, "./packer": 74, buffer: 14, stream: 94, util: 103 }], 73: [function (t, e, i) {
          (function (i) {
            "use strict";
            var n = t("zlib"),
                r = t("./constants"),
                a = t("./packer");e.exports = function (t, e) {
              var o = e || {},
                  s = new a(o),
                  l = [];l.push(new i(r.PNG_SIGNATURE)), l.push(s.packIHDR(t.width, t.height)), t.gamma && l.push(s.packGAMA(t.gamma));var h = s.filterData(t.data, t.width, t.height),
                  f = n.deflateSync(h, s.getDeflateOptions());if (h = null, !f || !f.length) throw new Error("bad png - invalid compressed data response");return l.push(s.packIDAT(f)), l.push(s.packIEND()), i.concat(l);
            };
          }).call(this, t("buffer").Buffer);
        }, { "./constants": 64, "./packer": 74, buffer: 14, zlib: 10 }], 74: [function (t, e, i) {
          (function (i) {
            "use strict";
            var n = t("./constants"),
                r = t("./crc"),
                a = t("./bitpacker"),
                o = t("./filter-pack"),
                s = t("zlib"),
                l = e.exports = function (t) {
              if (this._options = t, t.deflateChunkSize = t.deflateChunkSize || 32768, t.deflateLevel = null != t.deflateLevel ? t.deflateLevel : 9, t.deflateStrategy = null != t.deflateStrategy ? t.deflateStrategy : 3, t.inputHasAlpha = null == t.inputHasAlpha || t.inputHasAlpha, t.deflateFactory = t.deflateFactory || s.createDeflate, t.bitDepth = t.bitDepth || 8, t.colorType = "number" == typeof t.colorType ? t.colorType : n.COLORTYPE_COLOR_ALPHA, t.colorType !== n.COLORTYPE_COLOR && t.colorType !== n.COLORTYPE_COLOR_ALPHA) throw new Error("option color type:" + t.colorType + " is not supported at present");if (8 !== t.bitDepth) throw new Error("option bit depth:" + t.bitDepth + " is not supported at present");
            };l.prototype.getDeflateOptions = function () {
              return { chunkSize: this._options.deflateChunkSize, level: this._options.deflateLevel, strategy: this._options.deflateStrategy };
            }, l.prototype.createDeflate = function () {
              return this._options.deflateFactory(this.getDeflateOptions());
            }, l.prototype.filterData = function (t, e, i) {
              var r = a(t, e, i, this._options),
                  s = n.COLORTYPE_TO_BPP_MAP[this._options.colorType];return o(r, e, i, this._options, s);
            }, l.prototype._packChunk = function (t, e) {
              var n = e ? e.length : 0,
                  a = new i(n + 12);return a.writeUInt32BE(n, 0), a.writeUInt32BE(t, 4), e && e.copy(a, 8), a.writeInt32BE(r.crc32(a.slice(4, a.length - 4)), a.length - 4), a;
            }, l.prototype.packGAMA = function (t) {
              var e = new i(4);return e.writeUInt32BE(Math.floor(t * n.GAMMA_DIVISION), 0), this._packChunk(n.TYPE_gAMA, e);
            }, l.prototype.packIHDR = function (t, e) {
              var r = new i(13);return r.writeUInt32BE(t, 0), r.writeUInt32BE(e, 4), r[8] = this._options.bitDepth, r[9] = this._options.colorType, r[10] = 0, r[11] = 0, r[12] = 0, this._packChunk(n.TYPE_IHDR, r);
            }, l.prototype.packIDAT = function (t) {
              return this._packChunk(n.TYPE_IDAT, t);
            }, l.prototype.packIEND = function () {
              return this._packChunk(n.TYPE_IEND, null);
            };
          }).call(this, t("buffer").Buffer);
        }, { "./bitpacker": 62, "./constants": 64, "./crc": 65, "./filter-pack": 66, buffer: 14, zlib: 10 }], 75: [function (t, e, i) {
          "use strict";
          e.exports = function (t, e, i) {
            var n = t + e - i,
                r = Math.abs(n - t),
                a = Math.abs(n - e),
                o = Math.abs(n - i);return r <= a && r <= o ? t : a <= o ? e : i;
          };
        }, {}], 76: [function (t, e, i) {
          "use strict";
          var n = t("util"),
              r = t("zlib"),
              a = t("./chunkstream"),
              o = t("./filter-parse-async"),
              s = t("./parser"),
              l = t("./bitmapper"),
              h = t("./format-normaliser"),
              f = e.exports = function (t) {
            a.call(this), this._parser = new s(t, { read: this.read.bind(this), error: this._handleError.bind(this), metadata: this._handleMetaData.bind(this), gamma: this.emit.bind(this, "gamma"), palette: this._handlePalette.bind(this), transColor: this._handleTransColor.bind(this), finished: this._finished.bind(this), inflateData: this._inflateData.bind(this) }), this._options = t, this.writable = !0, this._parser.start();
          };n.inherits(f, a), f.prototype._handleError = function (t) {
            this.emit("error", t), this.writable = !1, this.destroy(), this._inflate && this._inflate.destroy && this._inflate.destroy(), this.errord = !0;
          }, f.prototype._inflateData = function (t) {
            this._inflate || (this._inflate = r.createInflate(), this._inflate.on("error", this.emit.bind(this, "error")), this._filter.on("complete", this._complete.bind(this)), this._inflate.pipe(this._filter)), this._inflate.write(t);
          }, f.prototype._handleMetaData = function (t) {
            this.emit("metadata", t), this._bitmapInfo = Object.create(t), this._filter = new o(this._bitmapInfo);
          }, f.prototype._handleTransColor = function (t) {
            this._bitmapInfo.transColor = t;
          }, f.prototype._handlePalette = function (t) {
            this._bitmapInfo.palette = t;
          }, f.prototype._finished = function () {
            this.errord || (this._inflate ? this._inflate.end() : this.emit("error", "No Inflate block"), this.destroySoon());
          }, f.prototype._complete = function (t) {
            if (!this.errord) {
              try {
                var e = l.dataToBitMap(t, this._bitmapInfo),
                    i = h(e, this._bitmapInfo);e = null;
              } catch (t) {
                return void this._handleError(t);
              }this.emit("parsed", i);
            }
          };
        }, { "./bitmapper": 61, "./chunkstream": 63, "./filter-parse-async": 67, "./format-normaliser": 70, "./parser": 78, util: 103, zlib: 10 }], 77: [function (t, e, i) {
          (function (i) {
            "use strict";
            var n = t("zlib"),
                r = t("./sync-reader"),
                a = t("./filter-parse-sync"),
                o = t("./parser"),
                s = t("./bitmapper"),
                l = t("./format-normaliser");e.exports = function (t, e) {
              function h(t) {
                m = t;
              }function f(t) {
                g = t;
              }function c(t) {
                g.transColor = t;
              }function u(t) {
                g.palette = t;
              }function p(t) {
                b = t;
              }function d(t) {
                v.push(t);
              }var m,
                  g,
                  b,
                  v = [],
                  w = new r(t);if (new o(e, { read: w.read.bind(w), error: h, metadata: f, gamma: p, palette: u, transColor: c, inflateData: d }).start(), w.process(), m) throw m;var _ = i.concat(v);v.length = 0;var y = n.inflateSync(_);if (_ = null, !y || !y.length) throw new Error("bad png - invalid inflate data response");var x = a.process(y, g);_ = null;var k = s.dataToBitMap(x, g);x = null;var E = l(k, g);return g.data = E, g.gamma = b || 0, g;
            };
          }).call(this, t("buffer").Buffer);
        }, { "./bitmapper": 61, "./filter-parse-sync": 68, "./format-normaliser": 70, "./parser": 78, "./sync-reader": 81, buffer: 14, zlib: 10 }], 78: [function (t, e, i) {
          (function (i) {
            "use strict";
            var n = t("./constants"),
                r = t("./crc"),
                a = e.exports = function (t, e) {
              this._options = t, t.checkCRC = t.checkCRC !== !1, this._hasIHDR = !1, this._hasIEND = !1, this._palette = [], this._colorType = 0, this._chunks = {}, this._chunks[n.TYPE_IHDR] = this._handleIHDR.bind(this), this._chunks[n.TYPE_IEND] = this._handleIEND.bind(this), this._chunks[n.TYPE_IDAT] = this._handleIDAT.bind(this), this._chunks[n.TYPE_PLTE] = this._handlePLTE.bind(this), this._chunks[n.TYPE_tRNS] = this._handleTRNS.bind(this), this._chunks[n.TYPE_gAMA] = this._handleGAMA.bind(this), this.read = e.read, this.error = e.error, this.metadata = e.metadata, this.gamma = e.gamma, this.transColor = e.transColor, this.palette = e.palette, this.parsed = e.parsed, this.inflateData = e.inflateData, this.inflateData = e.inflateData, this.finished = e.finished;
            };a.prototype.start = function () {
              this.read(n.PNG_SIGNATURE.length, this._parseSignature.bind(this));
            }, a.prototype._parseSignature = function (t) {
              for (var e = n.PNG_SIGNATURE, i = 0; i < e.length; i++) {
                if (t[i] !== e[i]) return void this.error(new Error("Invalid file signature"));
              }this.read(8, this._parseChunkBegin.bind(this));
            }, a.prototype._parseChunkBegin = function (t) {
              for (var e = t.readUInt32BE(0), a = t.readUInt32BE(4), o = "", s = 4; s < 8; s++) {
                o += String.fromCharCode(t[s]);
              }var l = Boolean(32 & t[4]);return this._hasIHDR || a === n.TYPE_IHDR ? (this._crc = new r(), this._crc.write(new i(o)), this._chunks[a] ? this._chunks[a](e) : l ? void this.read(e + 4, this._skipChunk.bind(this)) : void this.error(new Error("Unsupported critical chunk type " + o))) : void this.error(new Error("Expected IHDR on beggining"));
            }, a.prototype._skipChunk = function () {
              this.read(8, this._parseChunkBegin.bind(this));
            }, a.prototype._handleChunkEnd = function () {
              this.read(4, this._parseChunkEnd.bind(this));
            }, a.prototype._parseChunkEnd = function (t) {
              var e = t.readInt32BE(0),
                  i = this._crc.crc32();if (this._options.checkCRC && i !== e) return void this.error(new Error("Crc error - " + e + " - " + i));this._hasIEND || this.read(8, this._parseChunkBegin.bind(this));
            }, a.prototype._handleIHDR = function (t) {
              this.read(t, this._parseIHDR.bind(this));
            }, a.prototype._parseIHDR = function (t) {
              this._crc.write(t);var e = t.readUInt32BE(0),
                  i = t.readUInt32BE(4),
                  r = t[8],
                  a = t[9],
                  o = t[10],
                  s = t[11],
                  l = t[12];if (8 !== r && 4 !== r && 2 !== r && 1 !== r && 16 !== r) return void this.error(new Error("Unsupported bit depth " + r));if (!(a in n.COLORTYPE_TO_BPP_MAP)) return void this.error(new Error("Unsupported color type"));if (0 !== o) return void this.error(new Error("Unsupported compression method"));if (0 !== s) return void this.error(new Error("Unsupported filter method"));if (0 !== l && 1 !== l) return void this.error(new Error("Unsupported interlace method"));this._colorType = a;var h = n.COLORTYPE_TO_BPP_MAP[this._colorType];this._hasIHDR = !0, this.metadata({ width: e, height: i, depth: r, interlace: Boolean(l), palette: Boolean(a & n.COLORTYPE_PALETTE), color: Boolean(a & n.COLORTYPE_COLOR), alpha: Boolean(a & n.COLORTYPE_ALPHA), bpp: h, colorType: a }), this._handleChunkEnd();
            }, a.prototype._handlePLTE = function (t) {
              this.read(t, this._parsePLTE.bind(this));
            }, a.prototype._parsePLTE = function (t) {
              this._crc.write(t);for (var e = Math.floor(t.length / 3), i = 0; i < e; i++) {
                this._palette.push([t[3 * i], t[3 * i + 1], t[3 * i + 2], 255]);
              }this.palette(this._palette), this._handleChunkEnd();
            }, a.prototype._handleTRNS = function (t) {
              this.read(t, this._parseTRNS.bind(this));
            }, a.prototype._parseTRNS = function (t) {
              if (this._crc.write(t), this._colorType === n.COLORTYPE_PALETTE_COLOR) {
                if (0 === this._palette.length) return void this.error(new Error("Transparency chunk must be after palette"));if (t.length > this._palette.length) return void this.error(new Error("More transparent colors than palette size"));for (var e = 0; e < t.length; e++) {
                  this._palette[e][3] = t[e];
                }this.palette(this._palette);
              }this._colorType === n.COLORTYPE_GRAYSCALE && this.transColor([t.readUInt16BE(0)]), this._colorType === n.COLORTYPE_COLOR && this.transColor([t.readUInt16BE(0), t.readUInt16BE(2), t.readUInt16BE(4)]), this._handleChunkEnd();
            }, a.prototype._handleGAMA = function (t) {
              this.read(t, this._parseGAMA.bind(this));
            }, a.prototype._parseGAMA = function (t) {
              this._crc.write(t), this.gamma(t.readUInt32BE(0) / n.GAMMA_DIVISION), this._handleChunkEnd();
            }, a.prototype._handleIDAT = function (t) {
              this.read(-t, this._parseIDAT.bind(this, t));
            }, a.prototype._parseIDAT = function (t, e) {
              if (this._crc.write(e), this._colorType === n.COLORTYPE_PALETTE_COLOR && 0 === this._palette.length) throw new Error("Expected palette not found");this.inflateData(e);var i = t - e.length;i > 0 ? this._handleIDAT(i) : this._handleChunkEnd();
            }, a.prototype._handleIEND = function (t) {
              this.read(t, this._parseIEND.bind(this));
            }, a.prototype._parseIEND = function (t) {
              this._crc.write(t), this._hasIEND = !0, this._handleChunkEnd(), this.finished && this.finished();
            };
          }).call(this, t("buffer").Buffer);
        }, { "./constants": 64, "./crc": 65, buffer: 14 }], 79: [function (t, e, i) {
          "use strict";
          var n = t("./parser-sync"),
              r = t("./packer-sync");i.read = function (t, e) {
            return n(t, e || {});
          }, i.write = function (t) {
            return r(t);
          };
        }, { "./packer-sync": 73, "./parser-sync": 77 }], 80: [function (t, e, i) {
          (function (e, n) {
            "use strict";
            var r = t("util"),
                a = t("stream"),
                o = t("./parser-async"),
                s = t("./packer-async"),
                l = t("./png-sync"),
                h = i.PNG = function (t) {
              a.call(this), t = t || {}, this.width = t.width || 0, this.height = t.height || 0, this.data = this.width > 0 && this.height > 0 ? new n(4 * this.width * this.height) : null, t.fill && this.data && this.data.fill(0), this.gamma = 0, this.readable = this.writable = !0, this._parser = new o(t), this._parser.on("error", this.emit.bind(this, "error")), this._parser.on("close", this._handleClose.bind(this)), this._parser.on("metadata", this._metadata.bind(this)), this._parser.on("gamma", this._gamma.bind(this)), this._parser.on("parsed", function (t) {
                this.data = t, this.emit("parsed", t);
              }.bind(this)), this._packer = new s(t), this._packer.on("data", this.emit.bind(this, "data")), this._packer.on("end", this.emit.bind(this, "end")), this._parser.on("close", this._handleClose.bind(this)), this._packer.on("error", this.emit.bind(this, "error"));
            };r.inherits(h, a), h.sync = l, h.prototype.pack = function () {
              return this.data && this.data.length ? (e.nextTick(function () {
                this._packer.pack(this.data, this.width, this.height, this.gamma);
              }.bind(this)), this) : (this.emit("error", "No data provided"), this);
            }, h.prototype.parse = function (t, e) {
              if (e) {
                var i, n;i = function (t) {
                  this.removeListener("error", n), this.data = t, e(null, this);
                }.bind(this), n = function (t) {
                  this.removeListener("parsed", i), e(t, null);
                }.bind(this), this.once("parsed", i), this.once("error", n);
              }return this.end(t), this;
            }, h.prototype.write = function (t) {
              return this._parser.write(t), !0;
            }, h.prototype.end = function (t) {
              this._parser.end(t);
            }, h.prototype._metadata = function (t) {
              this.width = t.width, this.height = t.height, this.emit("metadata", t);
            }, h.prototype._gamma = function (t) {
              this.gamma = t;
            }, h.prototype._handleClose = function () {
              this._parser.writable || this._packer.readable || this.emit("close");
            }, h.bitblt = function (t, e, i, n, r, a, o, s) {
              if (i > t.width || n > t.height || i + r > t.width || n + a > t.height) throw new Error("bitblt reading outside image");if (o > e.width || s > e.height || o + r > e.width || s + a > e.height) throw new Error("bitblt writing outside image");for (var l = 0; l < a; l++) {
                t.data.copy(e.data, (s + l) * e.width + o << 2, (n + l) * t.width + i << 2, (n + l) * t.width + i + r << 2);
              }
            }, h.prototype.bitblt = function (t, e, i, n, r, a, o) {
              return h.bitblt(this, t, e, i, n, r, a, o), this;
            }, h.adjustGamma = function (t) {
              if (t.gamma) {
                for (var e = 0; e < t.height; e++) {
                  for (var i = 0; i < t.width; i++) {
                    for (var n = t.width * e + i << 2, r = 0; r < 3; r++) {
                      var a = t.data[n + r] / 255;a = Math.pow(a, 1 / 2.2 / t.gamma), t.data[n + r] = Math.round(255 * a);
                    }
                  }
                }t.gamma = 0;
              }
            }, h.prototype.adjustGamma = function () {
              h.adjustGamma(this);
            };
          }).call(this, t("_process"), t("buffer").Buffer);
        }, { "./packer-async": 72, "./parser-async": 76, "./png-sync": 79, _process: 12, buffer: 14, stream: 94, util: 103 }], 81: [function (t, e, i) {
          "use strict";
          var n = e.exports = function (t) {
            this._buffer = t, this._reads = [];
          };n.prototype.read = function (t, e) {
            this._reads.push({ length: Math.abs(t), allowLess: t < 0, func: e });
          }, n.prototype.process = function () {
            for (; this._reads.length > 0 && this._buffer.length;) {
              var t = this._reads[0];if (!this._buffer.length || !(this._buffer.length >= t.length || t.allowLess)) break;this._reads.shift();var e = this._buffer;this._buffer = e.slice(t.length), t.func.call(this, e.slice(0, t.length));
            }return this._reads.length > 0 ? new Error("There are some read requests waitng on finished stream") : this._buffer.length > 0 ? new Error("unrecognised content at end of stream") : void 0;
          };
        }, {}], 82: [function (t, e, i) {
          (function (t) {
            "use strict";
            function i(e, i, n, r) {
              if ("function" != typeof e) throw new TypeError('"callback" argument must be a function');var a,
                  o,
                  s = arguments.length;switch (s) {case 0:case 1:
                  return t.nextTick(e);case 2:
                  return t.nextTick(function () {
                    e.call(null, i);
                  });case 3:
                  return t.nextTick(function () {
                    e.call(null, i, n);
                  });case 4:
                  return t.nextTick(function () {
                    e.call(null, i, n, r);
                  });default:
                  for (a = new Array(s - 1), o = 0; o < a.length;) {
                    a[o++] = arguments[o];
                  }return t.nextTick(function () {
                    e.apply(null, a);
                  });}
            }!t.version || 0 === t.version.indexOf("v0.") || 0 === t.version.indexOf("v1.") && 0 !== t.version.indexOf("v1.8.") ? e.exports = i : e.exports = t.nextTick;
          }).call(this, t("_process"));
        }, { _process: 12 }], 83: [function (t, e, i) {
          (function (i) {
            "use strict";
            var n = t("fs");e.exports = function (t, e, r, a) {
              var o = new i(r);n.open(t, "r", function (t, i) {
                if (t) return a(t);n.read(i, o, 0, r, e, function (t, e, o) {
                  if (t) return a(t);n.close(i, function (t) {
                    if (t) return a(t);e < r && (o = o.slice(0, e)), a(null, o);
                  });
                });
              });
            }, e.exports.sync = function (t, e, r) {
              var a = new i(r),
                  o = n.openSync(t, "r"),
                  s = n.readSync(o, a, 0, r, e);return n.closeSync(o), s < r && (a = a.slice(0, s)), a;
            };
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14, fs: 11 }], 84: [function (t, e, i) {
          e.exports = t("./lib/_stream_duplex.js");
        }, { "./lib/_stream_duplex.js": 85 }], 85: [function (t, e, i) {
          "use strict";
          function n(t) {
            if (!(this instanceof n)) return new n(t);h.call(this, t), f.call(this, t), t && t.readable === !1 && (this.readable = !1), t && t.writable === !1 && (this.writable = !1), this.allowHalfOpen = !0, t && t.allowHalfOpen === !1 && (this.allowHalfOpen = !1), this.once("end", r);
          }function r() {
            this.allowHalfOpen || this._writableState.ended || s(a, this);
          }function a(t) {
            t.end();
          }var o = Object.keys || function (t) {
            var e = [];for (var i in t) {
              e.push(i);
            }return e;
          };e.exports = n;var s = t("process-nextick-args"),
              l = t("core-util-is");l.inherits = t("inherits");var h = t("./_stream_readable"),
              f = t("./_stream_writable");l.inherits(n, h);for (var c = o(f.prototype), u = 0; u < c.length; u++) {
            var p = c[u];n.prototype[p] || (n.prototype[p] = f.prototype[p]);
          }
        }, { "./_stream_readable": 87, "./_stream_writable": 89, "core-util-is": 15, inherits: 31, "process-nextick-args": 82 }], 86: [function (t, e, i) {
          "use strict";
          function n(t) {
            if (!(this instanceof n)) return new n(t);r.call(this, t);
          }e.exports = n;var r = t("./_stream_transform"),
              a = t("core-util-is");a.inherits = t("inherits"), a.inherits(n, r), n.prototype._transform = function (t, e, i) {
            i(null, t);
          };
        }, { "./_stream_transform": 88, "core-util-is": 15, inherits: 31 }], 87: [function (t, e, i) {
          (function (i) {
            "use strict";
            function n(e, i) {
              B = B || t("./_stream_duplex"), e = e || {}, this.objectMode = !!e.objectMode, i instanceof B && (this.objectMode = this.objectMode || !!e.readableObjectMode);var n = e.highWaterMark,
                  r = this.objectMode ? 16 : 16384;this.highWaterMark = n || 0 === n ? n : r, this.highWaterMark = ~~this.highWaterMark, this.buffer = [], this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.defaultEncoding = e.defaultEncoding || "utf8", this.ranOut = !1, this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, e.encoding && (C || (C = t("string_decoder/").StringDecoder), this.decoder = new C(e.encoding), this.encoding = e.encoding);
            }function r(e) {
              if (B = B || t("./_stream_duplex"), !(this instanceof r)) return new r(e);this._readableState = new n(e, this), this.readable = !0, e && "function" == typeof e.read && (this._read = e.read), A.call(this);
            }function a(t, e, i, n, r) {
              var a = h(e, i);if (a) t.emit("error", a);else if (null === i) e.reading = !1, f(t, e);else if (e.objectMode || i && i.length > 0) {
                if (e.ended && !r) {
                  var s = new Error("stream.push() after EOF");t.emit("error", s);
                } else if (e.endEmitted && r) {
                  var s = new Error("stream.unshift() after end event");t.emit("error", s);
                } else {
                  var l;!e.decoder || r || n || (i = e.decoder.write(i), l = !e.objectMode && 0 === i.length), r || (e.reading = !1), l || (e.flowing && 0 === e.length && !e.sync ? (t.emit("data", i), t.read(0)) : (e.length += e.objectMode ? 1 : i.length, r ? e.buffer.unshift(i) : e.buffer.push(i), e.needReadable && c(t))), p(t, e);
                }
              } else r || (e.reading = !1);return o(e);
            }function o(t) {
              return !t.ended && (t.needReadable || t.length < t.highWaterMark || 0 === t.length);
            }function s(t) {
              return t >= z ? t = z : (t--, t |= t >>> 1, t |= t >>> 2, t |= t >>> 4, t |= t >>> 8, t |= t >>> 16, t++), t;
            }function l(t, e) {
              return 0 === e.length && e.ended ? 0 : e.objectMode ? 0 === t ? 0 : 1 : null === t || isNaN(t) ? e.flowing && e.buffer.length ? e.buffer[0].length : e.length : t <= 0 ? 0 : (t > e.highWaterMark && (e.highWaterMark = s(t)), t > e.length ? e.ended ? e.length : (e.needReadable = !0, 0) : t);
            }function h(t, e) {
              var i = null;return M.isBuffer(e) || "string" == typeof e || null === e || void 0 === e || t.objectMode || (i = new TypeError("Invalid non-string/buffer chunk")), i;
            }function f(t, e) {
              if (!e.ended) {
                if (e.decoder) {
                  var i = e.decoder.end();i && i.length && (e.buffer.push(i), e.length += e.objectMode ? 1 : i.length);
                }e.ended = !0, c(t);
              }
            }function c(t) {
              var e = t._readableState;e.needReadable = !1, e.emittedReadable || (P("emitReadable", e.flowing), e.emittedReadable = !0, e.sync ? S(u, t) : u(t));
            }function u(t) {
              P("emit readable"), t.emit("readable"), w(t);
            }function p(t, e) {
              e.readingMore || (e.readingMore = !0, S(d, t, e));
            }function d(t, e) {
              for (var i = e.length; !e.reading && !e.flowing && !e.ended && e.length < e.highWaterMark && (P("maybeReadMore read 0"), t.read(0), i !== e.length);) {
                i = e.length;
              }e.readingMore = !1;
            }function m(t) {
              return function () {
                var e = t._readableState;P("pipeOnDrain", e.awaitDrain), e.awaitDrain && e.awaitDrain--, 0 === e.awaitDrain && T(t, "data") && (e.flowing = !0, w(t));
              };
            }function g(t) {
              P("readable nexttick read 0"), t.read(0);
            }function b(t, e) {
              e.resumeScheduled || (e.resumeScheduled = !0, S(v, t, e));
            }function v(t, e) {
              e.reading || (P("resume read 0"), t.read(0)), e.resumeScheduled = !1, t.emit("resume"), w(t), e.flowing && !e.reading && t.read(0);
            }function w(t) {
              var e = t._readableState;if (P("flow", e.flowing), e.flowing) do {
                var i = t.read();
              } while (null !== i && e.flowing);
            }function _(t, e) {
              var i,
                  n = e.buffer,
                  r = e.length,
                  a = !!e.decoder,
                  o = !!e.objectMode;if (0 === n.length) return null;if (0 === r) i = null;else if (o) i = n.shift();else if (!t || t >= r) i = a ? n.join("") : 1 === n.length ? n[0] : M.concat(n, r), n.length = 0;else if (t < n[0].length) {
                var s = n[0];i = s.slice(0, t), n[0] = s.slice(t);
              } else if (t === n[0].length) i = n.shift();else {
                i = a ? "" : new M(t);for (var l = 0, h = 0, f = n.length; h < f && l < t; h++) {
                  var s = n[0],
                      c = Math.min(t - l, s.length);a ? i += s.slice(0, c) : s.copy(i, l, 0, c), c < s.length ? n[0] = s.slice(c) : n.shift(), l += c;
                }
              }return i;
            }function y(t) {
              var e = t._readableState;if (e.length > 0) throw new Error("endReadable called on non-empty stream");e.endEmitted || (e.ended = !0, S(x, e, t));
            }function x(t, e) {
              t.endEmitted || 0 !== t.length || (t.endEmitted = !0, e.readable = !1, e.emit("end"));
            }function k(t, e) {
              for (var i = 0, n = t.length; i < n; i++) {
                e(t[i], i);
              }
            }function E(t, e) {
              for (var i = 0, n = t.length; i < n; i++) {
                if (t[i] === e) return i;
              }return -1;
            }e.exports = r;var S = t("process-nextick-args"),
                I = t("isarray"),
                M = t("buffer").Buffer;r.ReadableState = n;var A,
                T = (t("events"), function (t, e) {
              return t.listeners(e).length;
            });!function () {
              try {
                A = t("stream");
              } catch (t) {} finally {
                A || (A = t("events").EventEmitter);
              }
            }();var M = t("buffer").Buffer,
                R = t("core-util-is");R.inherits = t("inherits");var L = t("util"),
                P = void 0;P = L && L.debuglog ? L.debuglog("stream") : function () {};var C;R.inherits(r, A);var B, B;r.prototype.push = function (t, e) {
              var i = this._readableState;return i.objectMode || "string" != typeof t || (e = e || i.defaultEncoding) !== i.encoding && (t = new M(t, e), e = ""), a(this, i, t, e, !1);
            }, r.prototype.unshift = function (t) {
              return a(this, this._readableState, t, "", !0);
            }, r.prototype.isPaused = function () {
              return this._readableState.flowing === !1;
            }, r.prototype.setEncoding = function (e) {
              return C || (C = t("string_decoder/").StringDecoder), this._readableState.decoder = new C(e), this._readableState.encoding = e, this;
            };var z = 8388608;r.prototype.read = function (t) {
              P("read", t);var e = this._readableState,
                  i = t;if (("number" != typeof t || t > 0) && (e.emittedReadable = !1), 0 === t && e.needReadable && (e.length >= e.highWaterMark || e.ended)) return P("read: emitReadable", e.length, e.ended), 0 === e.length && e.ended ? y(this) : c(this), null;if (0 === (t = l(t, e)) && e.ended) return 0 === e.length && y(this), null;var n = e.needReadable;P("need readable", n), (0 === e.length || e.length - t < e.highWaterMark) && (n = !0, P("length less than watermark", n)), (e.ended || e.reading) && (n = !1, P("reading or ended", n)), n && (P("do read"), e.reading = !0, e.sync = !0, 0 === e.length && (e.needReadable = !0), this._read(e.highWaterMark), e.sync = !1), n && !e.reading && (t = l(i, e));var r;return r = t > 0 ? _(t, e) : null, null === r && (e.needReadable = !0, t = 0), e.length -= t, 0 !== e.length || e.ended || (e.needReadable = !0), i !== t && e.ended && 0 === e.length && y(this), null !== r && this.emit("data", r), r;
            }, r.prototype._read = function (t) {
              this.emit("error", new Error("not implemented"));
            }, r.prototype.pipe = function (t, e) {
              function n(t) {
                P("onunpipe"), t === c && a();
              }function r() {
                P("onend"), t.end();
              }function a() {
                P("cleanup"), t.removeListener("close", l), t.removeListener("finish", h), t.removeListener("drain", g), t.removeListener("error", s), t.removeListener("unpipe", n), c.removeListener("end", r), c.removeListener("end", a), c.removeListener("data", o), b = !0, !u.awaitDrain || t._writableState && !t._writableState.needDrain || g();
              }function o(e) {
                P("ondata"), !1 === t.write(e) && (1 !== u.pipesCount || u.pipes[0] !== t || 1 !== c.listenerCount("data") || b || (P("false write response, pause", c._readableState.awaitDrain), c._readableState.awaitDrain++), c.pause());
              }function s(e) {
                P("onerror", e), f(), t.removeListener("error", s), 0 === T(t, "error") && t.emit("error", e);
              }function l() {
                t.removeListener("finish", h), f();
              }function h() {
                P("onfinish"), t.removeListener("close", l), f();
              }function f() {
                P("unpipe"), c.unpipe(t);
              }var c = this,
                  u = this._readableState;switch (u.pipesCount) {case 0:
                  u.pipes = t;break;case 1:
                  u.pipes = [u.pipes, t];break;default:
                  u.pipes.push(t);}u.pipesCount += 1, P("pipe count=%d opts=%j", u.pipesCount, e);var p = (!e || e.end !== !1) && t !== i.stdout && t !== i.stderr,
                  d = p ? r : a;u.endEmitted ? S(d) : c.once("end", d), t.on("unpipe", n);var g = m(c);t.on("drain", g);var b = !1;return c.on("data", o), t._events && t._events.error ? I(t._events.error) ? t._events.error.unshift(s) : t._events.error = [s, t._events.error] : t.on("error", s), t.once("close", l), t.once("finish", h), t.emit("pipe", c), u.flowing || (P("pipe resume"), c.resume()), t;
            }, r.prototype.unpipe = function (t) {
              var e = this._readableState;if (0 === e.pipesCount) return this;if (1 === e.pipesCount) return t && t !== e.pipes ? this : (t || (t = e.pipes), e.pipes = null, e.pipesCount = 0, e.flowing = !1, t && t.emit("unpipe", this), this);if (!t) {
                var i = e.pipes,
                    n = e.pipesCount;e.pipes = null, e.pipesCount = 0, e.flowing = !1;for (var r = 0; r < n; r++) {
                  i[r].emit("unpipe", this);
                }return this;
              }var a = E(e.pipes, t);return a === -1 ? this : (e.pipes.splice(a, 1), e.pipesCount -= 1, 1 === e.pipesCount && (e.pipes = e.pipes[0]), t.emit("unpipe", this), this);
            }, r.prototype.on = function (t, e) {
              var i = A.prototype.on.call(this, t, e);if ("data" === t && !1 !== this._readableState.flowing && this.resume(), "readable" === t && !this._readableState.endEmitted) {
                var n = this._readableState;n.readableListening || (n.readableListening = !0, n.emittedReadable = !1, n.needReadable = !0, n.reading ? n.length && c(this) : S(g, this));
              }return i;
            }, r.prototype.addListener = r.prototype.on, r.prototype.resume = function () {
              var t = this._readableState;return t.flowing || (P("resume"), t.flowing = !0, b(this, t)), this;
            }, r.prototype.pause = function () {
              return P("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (P("pause"), this._readableState.flowing = !1, this.emit("pause")), this;
            }, r.prototype.wrap = function (t) {
              var e = this._readableState,
                  i = !1,
                  n = this;t.on("end", function () {
                if (P("wrapped end"), e.decoder && !e.ended) {
                  var t = e.decoder.end();t && t.length && n.push(t);
                }n.push(null);
              }), t.on("data", function (r) {
                if (P("wrapped data"), e.decoder && (r = e.decoder.write(r)), (!e.objectMode || null !== r && void 0 !== r) && (e.objectMode || r && r.length)) {
                  n.push(r) || (i = !0, t.pause());
                }
              });for (var r in t) {
                void 0 === this[r] && "function" == typeof t[r] && (this[r] = function (e) {
                  return function () {
                    return t[e].apply(t, arguments);
                  };
                }(r));
              }return k(["error", "close", "destroy", "pause", "resume"], function (e) {
                t.on(e, n.emit.bind(n, e));
              }), n._read = function (e) {
                P("wrapped _read", e), i && (i = !1, t.resume());
              }, n;
            }, r._fromList = _;
          }).call(this, t("_process"));
        }, { "./_stream_duplex": 85, _process: 12, buffer: 14, "core-util-is": 15, events: 17, inherits: 31, isarray: 35, "process-nextick-args": 82, "string_decoder/": 97, util: 8 }], 88: [function (t, e, i) {
          "use strict";
          function n(t) {
            this.afterTransform = function (e, i) {
              return r(t, e, i);
            }, this.needTransform = !1, this.transforming = !1, this.writecb = null, this.writechunk = null, this.writeencoding = null;
          }function r(t, e, i) {
            var n = t._transformState;n.transforming = !1;var r = n.writecb;if (!r) return t.emit("error", new Error("no writecb in Transform class"));n.writechunk = null, n.writecb = null, null !== i && void 0 !== i && t.push(i), r(e);var a = t._readableState;a.reading = !1, (a.needReadable || a.length < a.highWaterMark) && t._read(a.highWaterMark);
          }function a(t) {
            if (!(this instanceof a)) return new a(t);s.call(this, t), this._transformState = new n(this);var e = this;this._readableState.needReadable = !0, this._readableState.sync = !1, t && ("function" == typeof t.transform && (this._transform = t.transform), "function" == typeof t.flush && (this._flush = t.flush)), this.once("prefinish", function () {
              "function" == typeof this._flush ? this._flush(function (t) {
                o(e, t);
              }) : o(e);
            });
          }function o(t, e) {
            if (e) return t.emit("error", e);var i = t._writableState,
                n = t._transformState;if (i.length) throw new Error("calling transform done when ws.length != 0");if (n.transforming) throw new Error("calling transform done when still transforming");return t.push(null);
          }e.exports = a;var s = t("./_stream_duplex"),
              l = t("core-util-is");l.inherits = t("inherits"), l.inherits(a, s), a.prototype.push = function (t, e) {
            return this._transformState.needTransform = !1, s.prototype.push.call(this, t, e);
          }, a.prototype._transform = function (t, e, i) {
            throw new Error("not implemented");
          }, a.prototype._write = function (t, e, i) {
            var n = this._transformState;if (n.writecb = i, n.writechunk = t, n.writeencoding = e, !n.transforming) {
              var r = this._readableState;(n.needTransform || r.needReadable || r.length < r.highWaterMark) && this._read(r.highWaterMark);
            }
          }, a.prototype._read = function (t) {
            var e = this._transformState;null !== e.writechunk && e.writecb && !e.transforming ? (e.transforming = !0, this._transform(e.writechunk, e.writeencoding, e.afterTransform)) : e.needTransform = !0;
          };
        }, { "./_stream_duplex": 85, "core-util-is": 15, inherits: 31 }], 89: [function (t, e, i) {
          (function (i) {
            "use strict";
            function n() {}function r(t, e, i) {
              this.chunk = t, this.encoding = e, this.callback = i, this.next = null;
            }function a(e, i) {
              T = T || t("./_stream_duplex"), e = e || {}, this.objectMode = !!e.objectMode, i instanceof T && (this.objectMode = this.objectMode || !!e.writableObjectMode);var n = e.highWaterMark,
                  r = this.objectMode ? 16 : 16384;this.highWaterMark = n || 0 === n ? n : r, this.highWaterMark = ~~this.highWaterMark, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1;var a = e.decodeStrings === !1;this.decodeStrings = !a, this.defaultEncoding = e.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function (t) {
                d(i, t);
              }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new x(this), this.corkedRequestsFree.next = new x(this);
            }function o(e) {
              if (T = T || t("./_stream_duplex"), !(this instanceof o || this instanceof T)) return new o(e);this._writableState = new a(e, this), this.writable = !0, e && ("function" == typeof e.write && (this._write = e.write), "function" == typeof e.writev && (this._writev = e.writev)), M.call(this);
            }function s(t, e) {
              var i = new Error("write after end");t.emit("error", i), k(e, i);
            }function l(t, e, i, n) {
              var r = !0;if (!S.isBuffer(i) && "string" != typeof i && null !== i && void 0 !== i && !e.objectMode) {
                var a = new TypeError("Invalid non-string/buffer chunk");t.emit("error", a), k(n, a), r = !1;
              }return r;
            }function h(t, e, i) {
              return t.objectMode || t.decodeStrings === !1 || "string" != typeof e || (e = new S(e, i)), e;
            }function f(t, e, i, n, a) {
              i = h(e, i, n), S.isBuffer(i) && (n = "buffer");var o = e.objectMode ? 1 : i.length;e.length += o;var s = e.length < e.highWaterMark;if (s || (e.needDrain = !0), e.writing || e.corked) {
                var l = e.lastBufferedRequest;e.lastBufferedRequest = new r(i, n, a), l ? l.next = e.lastBufferedRequest : e.bufferedRequest = e.lastBufferedRequest, e.bufferedRequestCount += 1;
              } else c(t, e, !1, o, i, n, a);return s;
            }function c(t, e, i, n, r, a, o) {
              e.writelen = n, e.writecb = o, e.writing = !0, e.sync = !0, i ? t._writev(r, e.onwrite) : t._write(r, a, e.onwrite), e.sync = !1;
            }function u(t, e, i, n, r) {
              --e.pendingcb, i ? k(r, n) : r(n), t._writableState.errorEmitted = !0, t.emit("error", n);
            }function p(t) {
              t.writing = !1, t.writecb = null, t.length -= t.writelen, t.writelen = 0;
            }function d(t, e) {
              var i = t._writableState,
                  n = i.sync,
                  r = i.writecb;if (p(i), e) u(t, i, n, e, r);else {
                var a = v(i);a || i.corked || i.bufferProcessing || !i.bufferedRequest || b(t, i), n ? E(m, t, i, a, r) : m(t, i, a, r);
              }
            }function m(t, e, i, n) {
              i || g(t, e), e.pendingcb--, n(), _(t, e);
            }function g(t, e) {
              0 === e.length && e.needDrain && (e.needDrain = !1, t.emit("drain"));
            }function b(t, e) {
              e.bufferProcessing = !0;var i = e.bufferedRequest;if (t._writev && i && i.next) {
                var n = e.bufferedRequestCount,
                    r = new Array(n),
                    a = e.corkedRequestsFree;a.entry = i;for (var o = 0; i;) {
                  r[o] = i, i = i.next, o += 1;
                }c(t, e, !0, e.length, r, "", a.finish), e.pendingcb++, e.lastBufferedRequest = null, e.corkedRequestsFree = a.next, a.next = null;
              } else {
                for (; i;) {
                  var s = i.chunk,
                      l = i.encoding,
                      h = i.callback;if (c(t, e, !1, e.objectMode ? 1 : s.length, s, l, h), i = i.next, e.writing) break;
                }null === i && (e.lastBufferedRequest = null);
              }e.bufferedRequestCount = 0, e.bufferedRequest = i, e.bufferProcessing = !1;
            }function v(t) {
              return t.ending && 0 === t.length && null === t.bufferedRequest && !t.finished && !t.writing;
            }function w(t, e) {
              e.prefinished || (e.prefinished = !0, t.emit("prefinish"));
            }function _(t, e) {
              var i = v(e);return i && (0 === e.pendingcb ? (w(t, e), e.finished = !0, t.emit("finish")) : w(t, e)), i;
            }function y(t, e, i) {
              e.ending = !0, _(t, e), i && (e.finished ? k(i) : t.once("finish", i)), e.ended = !0, t.writable = !1;
            }function x(t) {
              var e = this;this.next = null, this.entry = null, this.finish = function (i) {
                var n = e.entry;for (e.entry = null; n;) {
                  var r = n.callback;t.pendingcb--, r(i), n = n.next;
                }t.corkedRequestsFree ? t.corkedRequestsFree.next = e : t.corkedRequestsFree = e;
              };
            }e.exports = o;var k = t("process-nextick-args"),
                E = !i.browser && ["v0.10", "v0.9."].indexOf(i.version.slice(0, 5)) > -1 ? setImmediate : k,
                S = t("buffer").Buffer;o.WritableState = a;var I = t("core-util-is");I.inherits = t("inherits");var M,
                A = { deprecate: t("util-deprecate") };!function () {
              try {
                M = t("stream");
              } catch (t) {} finally {
                M || (M = t("events").EventEmitter);
              }
            }();var S = t("buffer").Buffer;I.inherits(o, M);var T;a.prototype.getBuffer = function () {
              for (var t = this.bufferedRequest, e = []; t;) {
                e.push(t), t = t.next;
              }return e;
            }, function () {
              try {
                Object.defineProperty(a.prototype, "buffer", { get: A.deprecate(function () {
                    return this.getBuffer();
                  }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.") });
              } catch (t) {}
            }();var T;o.prototype.pipe = function () {
              this.emit("error", new Error("Cannot pipe. Not readable."));
            }, o.prototype.write = function (t, e, i) {
              var r = this._writableState,
                  a = !1;return "function" == typeof e && (i = e, e = null), S.isBuffer(t) ? e = "buffer" : e || (e = r.defaultEncoding), "function" != typeof i && (i = n), r.ended ? s(this, i) : l(this, r, t, i) && (r.pendingcb++, a = f(this, r, t, e, i)), a;
            }, o.prototype.cork = function () {
              this._writableState.corked++;
            }, o.prototype.uncork = function () {
              var t = this._writableState;t.corked && (t.corked--, t.writing || t.corked || t.finished || t.bufferProcessing || !t.bufferedRequest || b(this, t));
            }, o.prototype.setDefaultEncoding = function (t) {
              if ("string" == typeof t && (t = t.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((t + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + t);this._writableState.defaultEncoding = t;
            }, o.prototype._write = function (t, e, i) {
              i(new Error("not implemented"));
            }, o.prototype._writev = null, o.prototype.end = function (t, e, i) {
              var n = this._writableState;"function" == typeof t ? (i = t, t = null, e = null) : "function" == typeof e && (i = e, e = null), null !== t && void 0 !== t && this.write(t, e), n.corked && (n.corked = 1, this.uncork()), n.ending || n.finished || y(this, n, i);
            };
          }).call(this, t("_process"));
        }, { "./_stream_duplex": 85, _process: 12, buffer: 14, "core-util-is": 15, events: 17, inherits: 31, "process-nextick-args": 82, "util-deprecate": 101 }], 90: [function (t, e, i) {
          e.exports = t("./lib/_stream_passthrough.js");
        }, { "./lib/_stream_passthrough.js": 86 }], 91: [function (t, e, i) {
          var n = function () {
            try {
              return t("stream");
            } catch (t) {}
          }();i = e.exports = t("./lib/_stream_readable.js"), i.Stream = n || i, i.Readable = i, i.Writable = t("./lib/_stream_writable.js"), i.Duplex = t("./lib/_stream_duplex.js"), i.Transform = t("./lib/_stream_transform.js"), i.PassThrough = t("./lib/_stream_passthrough.js");
        }, { "./lib/_stream_duplex.js": 85, "./lib/_stream_passthrough.js": 86, "./lib/_stream_readable.js": 87, "./lib/_stream_transform.js": 88, "./lib/_stream_writable.js": 89 }], 92: [function (t, e, i) {
          e.exports = t("./lib/_stream_transform.js");
        }, { "./lib/_stream_transform.js": 88 }], 93: [function (t, e, i) {
          e.exports = t("./lib/_stream_writable.js");
        }, { "./lib/_stream_writable.js": 89 }], 94: [function (t, e, i) {
          function n() {
            r.call(this);
          }e.exports = n;var r = t("events").EventEmitter;t("inherits")(n, r), n.Readable = t("readable-stream/readable.js"), n.Writable = t("readable-stream/writable.js"), n.Duplex = t("readable-stream/duplex.js"), n.Transform = t("readable-stream/transform.js"), n.PassThrough = t("readable-stream/passthrough.js"), n.Stream = n, n.prototype.pipe = function (t, e) {
            function i(e) {
              t.writable && !1 === t.write(e) && h.pause && h.pause();
            }function n() {
              h.readable && h.resume && h.resume();
            }function a() {
              f || (f = !0, t.end());
            }function o() {
              f || (f = !0, "function" == typeof t.destroy && t.destroy());
            }function s(t) {
              if (l(), 0 === r.listenerCount(this, "error")) throw t;
            }function l() {
              h.removeListener("data", i), t.removeListener("drain", n), h.removeListener("end", a), h.removeListener("close", o), h.removeListener("error", s), t.removeListener("error", s), h.removeListener("end", l), h.removeListener("close", l), t.removeListener("close", l);
            }var h = this;h.on("data", i), t.on("drain", n), t._isStdio || e && e.end === !1 || (h.on("end", a), h.on("close", o));var f = !1;return h.on("error", s), t.on("error", s), h.on("end", l), h.on("close", l), t.on("close", l), t.emit("pipe", h), t;
          };
        }, { events: 17, inherits: 31, "readable-stream/duplex.js": 84, "readable-stream/passthrough.js": 90, "readable-stream/readable.js": 91, "readable-stream/transform.js": 92, "readable-stream/writable.js": 93 }], 95: [function (t, e, i) {
          e.exports = t("stream-to").buffer;
        }, { "stream-to": 96 }], 96: [function (t, e, i) {
          (function (t) {
            function e(t, e) {
              function i(t) {
                a.push(t);
              }function n() {
                e(null, a), r();
              }function r() {
                a = null, t.removeListener("data", i), t.removeListener("end", n), t.removeListener("error", e), t.removeListener("error", r), t.removeListener("close", r);
              }var a = [];return t.on("data", i), t.once("end", n), t.once("error", e), t.once("error", r), t.once("close", r), t;
            }function n(i, n) {
              return e(i, function (e, i) {
                e || !i ? n(e) : n(null, t.concat(i));
              }), i;
            }i.array = e, i.buffer = n;
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14 }], 97: [function (t, e, i) {
          function n(t) {
            if (t && !l(t)) throw new Error("Unknown encoding: " + t);
          }function r(t) {
            return t.toString(this.encoding);
          }function a(t) {
            this.charReceived = t.length % 2, this.charLength = this.charReceived ? 2 : 0;
          }function o(t) {
            this.charReceived = t.length % 3, this.charLength = this.charReceived ? 3 : 0;
          }var s = t("buffer").Buffer,
              l = s.isEncoding || function (t) {
            switch (t && t.toLowerCase()) {case "hex":case "utf8":case "utf-8":case "ascii":case "binary":case "base64":case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":case "raw":
                return !0;default:
                return !1;}
          },
              h = i.StringDecoder = function (t) {
            switch (this.encoding = (t || "utf8").toLowerCase().replace(/[-_]/, ""), n(t), this.encoding) {case "utf8":
                this.surrogateSize = 3;break;case "ucs2":case "utf16le":
                this.surrogateSize = 2, this.detectIncompleteChar = a;break;case "base64":
                this.surrogateSize = 3, this.detectIncompleteChar = o;break;default:
                return void (this.write = r);}this.charBuffer = new s(6), this.charReceived = 0, this.charLength = 0;
          };h.prototype.write = function (t) {
            for (var e = ""; this.charLength;) {
              var i = t.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : t.length;if (t.copy(this.charBuffer, this.charReceived, 0, i), this.charReceived += i, this.charReceived < this.charLength) return "";t = t.slice(i, t.length), e = this.charBuffer.slice(0, this.charLength).toString(this.encoding);var n = e.charCodeAt(e.length - 1);if (!(n >= 55296 && n <= 56319)) {
                if (this.charReceived = this.charLength = 0, 0 === t.length) return e;break;
              }this.charLength += this.surrogateSize, e = "";
            }this.detectIncompleteChar(t);var r = t.length;this.charLength && (t.copy(this.charBuffer, 0, t.length - this.charReceived, r), r -= this.charReceived), e += t.toString(this.encoding, 0, r);var r = e.length - 1,
                n = e.charCodeAt(r);if (n >= 55296 && n <= 56319) {
              var a = this.surrogateSize;return this.charLength += a, this.charReceived += a, this.charBuffer.copy(this.charBuffer, a, 0, a), t.copy(this.charBuffer, 0, 0, a), e.substring(0, r);
            }return e;
          }, h.prototype.detectIncompleteChar = function (t) {
            for (var e = t.length >= 3 ? 3 : t.length; e > 0; e--) {
              var i = t[t.length - e];if (1 == e && i >> 5 == 6) {
                this.charLength = 2;break;
              }if (e <= 2 && i >> 4 == 14) {
                this.charLength = 3;break;
              }if (e <= 3 && i >> 3 == 30) {
                this.charLength = 4;break;
              }
            }this.charReceived = e;
          }, h.prototype.end = function (t) {
            var e = "";if (t && t.length && (e = this.write(t)), this.charReceived) {
              var i = this.charReceived,
                  n = this.charBuffer,
                  r = this.encoding;e += n.slice(0, i).toString(r);
            }return e;
          };
        }, { buffer: 14 }], 98: [function (t, e, i) {
          !function (t) {
            function i(t, e) {
              if (t = t ? t : "", e = e || {}, t instanceof i) return t;if (!(this instanceof i)) return new i(t, e);var r = n(t);this._originalInput = t, this._r = r.r, this._g = r.g, this._b = r.b, this._a = r.a, this._roundA = j(100 * this._a) / 100, this._format = e.format || r.format, this._gradientType = e.gradientType, this._r < 1 && (this._r = j(this._r)), this._g < 1 && (this._g = j(this._g)), this._b < 1 && (this._b = j(this._b)), this._ok = r.ok, this._tc_id = F++;
            }function n(t) {
              var e = { r: 0, g: 0, b: 0 },
                  i = 1,
                  n = null,
                  a = null,
                  s = null,
                  h = !1,
                  f = !1;return "string" == typeof t && (t = O(t)), "object" == (void 0 === t ? "undefined" : _typeof(t)) && (z(t.r) && z(t.g) && z(t.b) ? (e = r(t.r, t.g, t.b), h = !0, f = "%" === String(t.r).substr(-1) ? "prgb" : "rgb") : z(t.h) && z(t.s) && z(t.v) ? (n = P(t.s), a = P(t.v), e = l(t.h, n, a), h = !0, f = "hsv") : z(t.h) && z(t.s) && z(t.l) && (n = P(t.s), s = P(t.l), e = o(t.h, n, s), h = !0, f = "hsl"), t.hasOwnProperty("a") && (i = t.a)), i = S(i), { ok: h, format: t.format || f, r: H(255, G(e.r, 0)), g: H(255, G(e.g, 0)), b: H(255, G(e.b, 0)), a: i };
            }function r(t, e, i) {
              return { r: 255 * I(t, 255), g: 255 * I(e, 255), b: 255 * I(i, 255) };
            }function a(t, e, i) {
              t = I(t, 255), e = I(e, 255), i = I(i, 255);var n,
                  r,
                  a = G(t, e, i),
                  o = H(t, e, i),
                  s = (a + o) / 2;if (a == o) n = r = 0;else {
                var l = a - o;switch (r = s > .5 ? l / (2 - a - o) : l / (a + o), a) {case t:
                    n = (e - i) / l + (e < i ? 6 : 0);break;case e:
                    n = (i - t) / l + 2;break;case i:
                    n = (t - e) / l + 4;}n /= 6;
              }return { h: n, s: r, l: s };
            }function o(t, e, i) {
              function n(t, e, i) {
                return i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? t + 6 * (e - t) * i : i < .5 ? e : i < 2 / 3 ? t + (e - t) * (2 / 3 - i) * 6 : t;
              }var r, a, o;if (t = I(t, 360), e = I(e, 100), i = I(i, 100), 0 === e) r = a = o = i;else {
                var s = i < .5 ? i * (1 + e) : i + e - i * e,
                    l = 2 * i - s;r = n(l, s, t + 1 / 3), a = n(l, s, t), o = n(l, s, t - 1 / 3);
              }return { r: 255 * r, g: 255 * a, b: 255 * o };
            }function s(t, e, i) {
              t = I(t, 255), e = I(e, 255), i = I(i, 255);var n,
                  r,
                  a = G(t, e, i),
                  o = H(t, e, i),
                  s = a,
                  l = a - o;if (r = 0 === a ? 0 : l / a, a == o) n = 0;else {
                switch (a) {case t:
                    n = (e - i) / l + (e < i ? 6 : 0);break;case e:
                    n = (i - t) / l + 2;break;case i:
                    n = (t - e) / l + 4;}n /= 6;
              }return { h: n, s: r, v: s };
            }function l(e, i, n) {
              e = 6 * I(e, 360), i = I(i, 100), n = I(n, 100);var r = t.floor(e),
                  a = e - r,
                  o = n * (1 - i),
                  s = n * (1 - a * i),
                  l = n * (1 - (1 - a) * i),
                  h = r % 6;return { r: 255 * [n, s, o, o, l, n][h], g: 255 * [l, n, n, s, o, o][h], b: 255 * [o, o, l, n, n, s][h] };
            }function h(t, e, i, n) {
              var r = [L(j(t).toString(16)), L(j(e).toString(16)), L(j(i).toString(16))];return n && r[0].charAt(0) == r[0].charAt(1) && r[1].charAt(0) == r[1].charAt(1) && r[2].charAt(0) == r[2].charAt(1) ? r[0].charAt(0) + r[1].charAt(0) + r[2].charAt(0) : r.join("");
            }function f(t, e, i, n, r) {
              var a = [L(j(t).toString(16)), L(j(e).toString(16)), L(j(i).toString(16)), L(C(n))];return r && a[0].charAt(0) == a[0].charAt(1) && a[1].charAt(0) == a[1].charAt(1) && a[2].charAt(0) == a[2].charAt(1) && a[3].charAt(0) == a[3].charAt(1) ? a[0].charAt(0) + a[1].charAt(0) + a[2].charAt(0) + a[3].charAt(0) : a.join("");
            }function c(t, e, i, n) {
              return [L(C(n)), L(j(t).toString(16)), L(j(e).toString(16)), L(j(i).toString(16))].join("");
            }function u(t, e) {
              e = 0 === e ? 0 : e || 10;var n = i(t).toHsl();return n.s -= e / 100, n.s = M(n.s), i(n);
            }function p(t, e) {
              e = 0 === e ? 0 : e || 10;var n = i(t).toHsl();return n.s += e / 100, n.s = M(n.s), i(n);
            }function d(t) {
              return i(t).desaturate(100);
            }function m(t, e) {
              e = 0 === e ? 0 : e || 10;var n = i(t).toHsl();return n.l += e / 100, n.l = M(n.l), i(n);
            }function g(t, e) {
              e = 0 === e ? 0 : e || 10;var n = i(t).toRgb();return n.r = G(0, H(255, n.r - j(255 * -(e / 100)))), n.g = G(0, H(255, n.g - j(255 * -(e / 100)))), n.b = G(0, H(255, n.b - j(255 * -(e / 100)))), i(n);
            }function b(t, e) {
              e = 0 === e ? 0 : e || 10;var n = i(t).toHsl();return n.l -= e / 100, n.l = M(n.l), i(n);
            }function v(t, e) {
              var n = i(t).toHsl(),
                  r = (n.h + e) % 360;return n.h = r < 0 ? 360 + r : r, i(n);
            }function w(t) {
              var e = i(t).toHsl();return e.h = (e.h + 180) % 360, i(e);
            }function _(t) {
              var e = i(t).toHsl(),
                  n = e.h;return [i(t), i({ h: (n + 120) % 360, s: e.s, l: e.l }), i({ h: (n + 240) % 360, s: e.s, l: e.l })];
            }function y(t) {
              var e = i(t).toHsl(),
                  n = e.h;return [i(t), i({ h: (n + 90) % 360, s: e.s, l: e.l }), i({ h: (n + 180) % 360, s: e.s, l: e.l }), i({ h: (n + 270) % 360, s: e.s, l: e.l })];
            }function x(t) {
              var e = i(t).toHsl(),
                  n = e.h;return [i(t), i({ h: (n + 72) % 360, s: e.s, l: e.l }), i({ h: (n + 216) % 360, s: e.s, l: e.l })];
            }function k(t, e, n) {
              e = e || 6, n = n || 30;var r = i(t).toHsl(),
                  a = 360 / n,
                  o = [i(t)];for (r.h = (r.h - (a * e >> 1) + 720) % 360; --e;) {
                r.h = (r.h + a) % 360, o.push(i(r));
              }return o;
            }function E(t, e) {
              e = e || 6;for (var n = i(t).toHsv(), r = n.h, a = n.s, o = n.v, s = [], l = 1 / e; e--;) {
                s.push(i({ h: r, s: a, v: o })), o = (o + l) % 1;
              }return s;
            }function S(t) {
              return t = parseFloat(t), (isNaN(t) || t < 0 || t > 1) && (t = 1), t;
            }function I(e, i) {
              T(e) && (e = "100%");var n = R(e);return e = H(i, G(0, parseFloat(e))), n && (e = parseInt(e * i, 10) / 100), t.abs(e - i) < 1e-6 ? 1 : e % i / parseFloat(i);
            }function M(t) {
              return H(1, G(0, t));
            }function A(t) {
              return parseInt(t, 16);
            }function T(t) {
              return "string" == typeof t && t.indexOf(".") != -1 && 1 === parseFloat(t);
            }function R(t) {
              return "string" == typeof t && t.indexOf("%") != -1;
            }function L(t) {
              return 1 == t.length ? "0" + t : "" + t;
            }function P(t) {
              return t <= 1 && (t = 100 * t + "%"), t;
            }function C(e) {
              return t.round(255 * parseFloat(e)).toString(16);
            }function B(t) {
              return A(t) / 255;
            }function z(t) {
              return !!Y.CSS_UNIT.exec(t);
            }function O(t) {
              t = t.replace(U, "").replace(N, "").toLowerCase();var e = !1;if (q[t]) t = q[t], e = !0;else if ("transparent" == t) return { r: 0, g: 0, b: 0, a: 0, format: "name" };var i;return (i = Y.rgb.exec(t)) ? { r: i[1], g: i[2], b: i[3] } : (i = Y.rgba.exec(t)) ? { r: i[1], g: i[2], b: i[3], a: i[4] } : (i = Y.hsl.exec(t)) ? { h: i[1], s: i[2], l: i[3] } : (i = Y.hsla.exec(t)) ? { h: i[1], s: i[2], l: i[3], a: i[4] } : (i = Y.hsv.exec(t)) ? { h: i[1], s: i[2], v: i[3] } : (i = Y.hsva.exec(t)) ? { h: i[1], s: i[2], v: i[3], a: i[4] } : (i = Y.hex8.exec(t)) ? { r: A(i[1]), g: A(i[2]), b: A(i[3]), a: B(i[4]), format: e ? "name" : "hex8" } : (i = Y.hex6.exec(t)) ? { r: A(i[1]), g: A(i[2]), b: A(i[3]), format: e ? "name" : "hex" } : (i = Y.hex4.exec(t)) ? { r: A(i[1] + "" + i[1]), g: A(i[2] + "" + i[2]), b: A(i[3] + "" + i[3]), a: B(i[4] + "" + i[4]), format: e ? "name" : "hex8" } : !!(i = Y.hex3.exec(t)) && { r: A(i[1] + "" + i[1]), g: A(i[2] + "" + i[2]), b: A(i[3] + "" + i[3]), format: e ? "name" : "hex" };
            }function D(t) {
              var e, i;return t = t || { level: "AA", size: "small" }, e = (t.level || "AA").toUpperCase(), i = (t.size || "small").toLowerCase(), "AA" !== e && "AAA" !== e && (e = "AA"), "small" !== i && "large" !== i && (i = "small"), { level: e, size: i };
            }var U = /^\s+/,
                N = /\s+$/,
                F = 0,
                j = t.round,
                H = t.min,
                G = t.max,
                W = t.random;i.prototype = { isDark: function isDark() {
                return this.getBrightness() < 128;
              }, isLight: function isLight() {
                return !this.isDark();
              }, isValid: function isValid() {
                return this._ok;
              }, getOriginalInput: function getOriginalInput() {
                return this._originalInput;
              }, getFormat: function getFormat() {
                return this._format;
              }, getAlpha: function getAlpha() {
                return this._a;
              }, getBrightness: function getBrightness() {
                var t = this.toRgb();return (299 * t.r + 587 * t.g + 114 * t.b) / 1e3;
              }, getLuminance: function getLuminance() {
                var e,
                    i,
                    n,
                    r,
                    a,
                    o,
                    s = this.toRgb();return e = s.r / 255, i = s.g / 255, n = s.b / 255, r = e <= .03928 ? e / 12.92 : t.pow((e + .055) / 1.055, 2.4), a = i <= .03928 ? i / 12.92 : t.pow((i + .055) / 1.055, 2.4), o = n <= .03928 ? n / 12.92 : t.pow((n + .055) / 1.055, 2.4), .2126 * r + .7152 * a + .0722 * o;
              }, setAlpha: function setAlpha(t) {
                return this._a = S(t), this._roundA = j(100 * this._a) / 100, this;
              }, toHsv: function toHsv() {
                var t = s(this._r, this._g, this._b);return { h: 360 * t.h, s: t.s, v: t.v, a: this._a };
              }, toHsvString: function toHsvString() {
                var t = s(this._r, this._g, this._b),
                    e = j(360 * t.h),
                    i = j(100 * t.s),
                    n = j(100 * t.v);return 1 == this._a ? "hsv(" + e + ", " + i + "%, " + n + "%)" : "hsva(" + e + ", " + i + "%, " + n + "%, " + this._roundA + ")";
              }, toHsl: function toHsl() {
                var t = a(this._r, this._g, this._b);return { h: 360 * t.h, s: t.s, l: t.l, a: this._a };
              }, toHslString: function toHslString() {
                var t = a(this._r, this._g, this._b),
                    e = j(360 * t.h),
                    i = j(100 * t.s),
                    n = j(100 * t.l);return 1 == this._a ? "hsl(" + e + ", " + i + "%, " + n + "%)" : "hsla(" + e + ", " + i + "%, " + n + "%, " + this._roundA + ")";
              }, toHex: function toHex(t) {
                return h(this._r, this._g, this._b, t);
              }, toHexString: function toHexString(t) {
                return "#" + this.toHex(t);
              }, toHex8: function toHex8(t) {
                return f(this._r, this._g, this._b, this._a, t);
              }, toHex8String: function toHex8String(t) {
                return "#" + this.toHex8(t);
              }, toRgb: function toRgb() {
                return { r: j(this._r), g: j(this._g), b: j(this._b), a: this._a };
              }, toRgbString: function toRgbString() {
                return 1 == this._a ? "rgb(" + j(this._r) + ", " + j(this._g) + ", " + j(this._b) + ")" : "rgba(" + j(this._r) + ", " + j(this._g) + ", " + j(this._b) + ", " + this._roundA + ")";
              }, toPercentageRgb: function toPercentageRgb() {
                return { r: j(100 * I(this._r, 255)) + "%", g: j(100 * I(this._g, 255)) + "%", b: j(100 * I(this._b, 255)) + "%", a: this._a };
              }, toPercentageRgbString: function toPercentageRgbString() {
                return 1 == this._a ? "rgb(" + j(100 * I(this._r, 255)) + "%, " + j(100 * I(this._g, 255)) + "%, " + j(100 * I(this._b, 255)) + "%)" : "rgba(" + j(100 * I(this._r, 255)) + "%, " + j(100 * I(this._g, 255)) + "%, " + j(100 * I(this._b, 255)) + "%, " + this._roundA + ")";
              }, toName: function toName() {
                return 0 === this._a ? "transparent" : !(this._a < 1) && (Z[h(this._r, this._g, this._b, !0)] || !1);
              }, toFilter: function toFilter(t) {
                var e = "#" + c(this._r, this._g, this._b, this._a),
                    n = e,
                    r = this._gradientType ? "GradientType = 1, " : "";if (t) {
                  var a = i(t);n = "#" + c(a._r, a._g, a._b, a._a);
                }return "progid:DXImageTransform.Microsoft.gradient(" + r + "startColorstr=" + e + ",endColorstr=" + n + ")";
              }, toString: function toString(t) {
                var e = !!t;t = t || this._format;var i = !1,
                    n = this._a < 1 && this._a >= 0;return e || !n || "hex" !== t && "hex6" !== t && "hex3" !== t && "hex4" !== t && "hex8" !== t && "name" !== t ? ("rgb" === t && (i = this.toRgbString()), "prgb" === t && (i = this.toPercentageRgbString()), "hex" !== t && "hex6" !== t || (i = this.toHexString()), "hex3" === t && (i = this.toHexString(!0)), "hex4" === t && (i = this.toHex8String(!0)), "hex8" === t && (i = this.toHex8String()), "name" === t && (i = this.toName()), "hsl" === t && (i = this.toHslString()), "hsv" === t && (i = this.toHsvString()), i || this.toHexString()) : "name" === t && 0 === this._a ? this.toName() : this.toRgbString();
              }, clone: function clone() {
                return i(this.toString());
              }, _applyModification: function _applyModification(t, e) {
                var i = t.apply(null, [this].concat([].slice.call(e)));return this._r = i._r, this._g = i._g, this._b = i._b, this.setAlpha(i._a), this;
              }, lighten: function lighten() {
                return this._applyModification(m, arguments);
              }, brighten: function brighten() {
                return this._applyModification(g, arguments);
              }, darken: function darken() {
                return this._applyModification(b, arguments);
              }, desaturate: function desaturate() {
                return this._applyModification(u, arguments);
              }, saturate: function saturate() {
                return this._applyModification(p, arguments);
              }, greyscale: function greyscale() {
                return this._applyModification(d, arguments);
              }, spin: function spin() {
                return this._applyModification(v, arguments);
              }, _applyCombination: function _applyCombination(t, e) {
                return t.apply(null, [this].concat([].slice.call(e)));
              }, analogous: function analogous() {
                return this._applyCombination(k, arguments);
              }, complement: function complement() {
                return this._applyCombination(w, arguments);
              }, monochromatic: function monochromatic() {
                return this._applyCombination(E, arguments);
              }, splitcomplement: function splitcomplement() {
                return this._applyCombination(x, arguments);
              }, triad: function triad() {
                return this._applyCombination(_, arguments);
              }, tetrad: function tetrad() {
                return this._applyCombination(y, arguments);
              } }, i.fromRatio = function (t, e) {
              if ("object" == (void 0 === t ? "undefined" : _typeof(t))) {
                var n = {};for (var r in t) {
                  t.hasOwnProperty(r) && (n[r] = "a" === r ? t[r] : P(t[r]));
                }t = n;
              }return i(t, e);
            }, i.equals = function (t, e) {
              return !(!t || !e) && i(t).toRgbString() == i(e).toRgbString();
            }, i.random = function () {
              return i.fromRatio({ r: W(), g: W(), b: W() });
            }, i.mix = function (t, e, n) {
              n = 0 === n ? 0 : n || 50;var r = i(t).toRgb(),
                  a = i(e).toRgb(),
                  o = n / 100;return i({ r: (a.r - r.r) * o + r.r, g: (a.g - r.g) * o + r.g, b: (a.b - r.b) * o + r.b, a: (a.a - r.a) * o + r.a });
            }, i.readability = function (e, n) {
              var r = i(e),
                  a = i(n);return (t.max(r.getLuminance(), a.getLuminance()) + .05) / (t.min(r.getLuminance(), a.getLuminance()) + .05);
            }, i.isReadable = function (t, e, n) {
              var r,
                  a,
                  o = i.readability(t, e);switch (a = !1, r = D(n), r.level + r.size) {case "AAsmall":case "AAAlarge":
                  a = o >= 4.5;break;case "AAlarge":
                  a = o >= 3;break;case "AAAsmall":
                  a = o >= 7;}return a;
            }, i.mostReadable = function (t, e, n) {
              var r,
                  a,
                  o,
                  s,
                  l = null,
                  h = 0;n = n || {}, a = n.includeFallbackColors, o = n.level, s = n.size;for (var f = 0; f < e.length; f++) {
                (r = i.readability(t, e[f])) > h && (h = r, l = i(e[f]));
              }return i.isReadable(t, l, { level: o, size: s }) || !a ? l : (n.includeFallbackColors = !1, i.mostReadable(t, ["#fff", "#000"], n));
            };var q = i.names = { aliceblue: "f0f8ff", antiquewhite: "faebd7", aqua: "0ff", aquamarine: "7fffd4", azure: "f0ffff", beige: "f5f5dc", bisque: "ffe4c4", black: "000", blanchedalmond: "ffebcd", blue: "00f", blueviolet: "8a2be2", brown: "a52a2a", burlywood: "deb887", burntsienna: "ea7e5d", cadetblue: "5f9ea0", chartreuse: "7fff00", chocolate: "d2691e", coral: "ff7f50", cornflowerblue: "6495ed", cornsilk: "fff8dc", crimson: "dc143c", cyan: "0ff", darkblue: "00008b", darkcyan: "008b8b", darkgoldenrod: "b8860b", darkgray: "a9a9a9", darkgreen: "006400", darkgrey: "a9a9a9", darkkhaki: "bdb76b", darkmagenta: "8b008b", darkolivegreen: "556b2f", darkorange: "ff8c00", darkorchid: "9932cc", darkred: "8b0000", darksalmon: "e9967a", darkseagreen: "8fbc8f", darkslateblue: "483d8b", darkslategray: "2f4f4f", darkslategrey: "2f4f4f", darkturquoise: "00ced1", darkviolet: "9400d3", deeppink: "ff1493", deepskyblue: "00bfff", dimgray: "696969", dimgrey: "696969", dodgerblue: "1e90ff", firebrick: "b22222", floralwhite: "fffaf0", forestgreen: "228b22", fuchsia: "f0f", gainsboro: "dcdcdc", ghostwhite: "f8f8ff", gold: "ffd700", goldenrod: "daa520", gray: "808080", green: "008000", greenyellow: "adff2f", grey: "808080", honeydew: "f0fff0", hotpink: "ff69b4", indianred: "cd5c5c", indigo: "4b0082", ivory: "fffff0", khaki: "f0e68c", lavender: "e6e6fa", lavenderblush: "fff0f5", lawngreen: "7cfc00", lemonchiffon: "fffacd", lightblue: "add8e6", lightcoral: "f08080", lightcyan: "e0ffff", lightgoldenrodyellow: "fafad2", lightgray: "d3d3d3", lightgreen: "90ee90", lightgrey: "d3d3d3", lightpink: "ffb6c1", lightsalmon: "ffa07a", lightseagreen: "20b2aa", lightskyblue: "87cefa", lightslategray: "789", lightslategrey: "789", lightsteelblue: "b0c4de", lightyellow: "ffffe0", lime: "0f0", limegreen: "32cd32", linen: "faf0e6", magenta: "f0f", maroon: "800000", mediumaquamarine: "66cdaa", mediumblue: "0000cd", mediumorchid: "ba55d3", mediumpurple: "9370db", mediumseagreen: "3cb371", mediumslateblue: "7b68ee", mediumspringgreen: "00fa9a", mediumturquoise: "48d1cc", mediumvioletred: "c71585", midnightblue: "191970", mintcream: "f5fffa", mistyrose: "ffe4e1", moccasin: "ffe4b5", navajowhite: "ffdead", navy: "000080", oldlace: "fdf5e6", olive: "808000", olivedrab: "6b8e23", orange: "ffa500", orangered: "ff4500", orchid: "da70d6", palegoldenrod: "eee8aa", palegreen: "98fb98", paleturquoise: "afeeee", palevioletred: "db7093", papayawhip: "ffefd5", peachpuff: "ffdab9", peru: "cd853f", pink: "ffc0cb", plum: "dda0dd", powderblue: "b0e0e6", purple: "800080", rebeccapurple: "663399", red: "f00", rosybrown: "bc8f8f", royalblue: "4169e1", saddlebrown: "8b4513", salmon: "fa8072", sandybrown: "f4a460", seagreen: "2e8b57", seashell: "fff5ee", sienna: "a0522d", silver: "c0c0c0", skyblue: "87ceeb", slateblue: "6a5acd", slategray: "708090", slategrey: "708090", snow: "fffafa", springgreen: "00ff7f", steelblue: "4682b4", tan: "d2b48c", teal: "008080", thistle: "d8bfd8", tomato: "ff6347", turquoise: "40e0d0", violet: "ee82ee", wheat: "f5deb3", white: "fff", whitesmoke: "f5f5f5", yellow: "ff0", yellowgreen: "9acd32" },
                Z = i.hexNames = function (t) {
              var e = {};for (var i in t) {
                t.hasOwnProperty(i) && (e[t[i]] = i);
              }return e;
            }(q),
                Y = function () {
              var t = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)",
                  e = "[\\s|\\(]+(" + t + ")[,|\\s]+(" + t + ")[,|\\s]+(" + t + ")\\s*\\)?",
                  i = "[\\s|\\(]+(" + t + ")[,|\\s]+(" + t + ")[,|\\s]+(" + t + ")[,|\\s]+(" + t + ")\\s*\\)?";return { CSS_UNIT: new RegExp(t), rgb: new RegExp("rgb" + e), rgba: new RegExp("rgba" + i), hsl: new RegExp("hsl" + e), hsla: new RegExp("hsla" + i), hsv: new RegExp("hsv" + e), hsva: new RegExp("hsva" + i), hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/, hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/, hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/, hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/ };
            }();void 0 !== e && e.exports ? e.exports = i : "function" == typeof define && define.amd ? define(function () {
              return i;
            }) : window.tinycolor = i;
          }(Math);
        }, {}], 99: [function (t, e, i) {
          function n(t) {
            return t.replace(/^\s*|\s*$/g, "");
          }i = e.exports = n, i.left = function (t) {
            return t.replace(/^\s*/, "");
          }, i.right = function (t) {
            return t.replace(/\s*$/, "");
          };
        }, {}], 100: [function (t, e, i) {
          "use strict";
          var n = t("ip-regex");e.exports = function (t) {
            t = t || {};var e = n.v4().source,
                i = ["(?:(?:(?:[a-z]+:)?//)|www\\.)(?:\\S+(?::\\S*)?@)?", "(?:localhost|" + e + "|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))", "(?::\\d{2,5})?", '(?:[/?#][^\\s"]*)?'].join("");return t.exact ? new RegExp("(?:^" + i + "$)", "i") : new RegExp(i, "ig");
          };
        }, { "ip-regex": 32 }], 101: [function (t, e, i) {
          (function (t) {
            function i(t, e) {
              function i() {
                if (!r) {
                  if (n("throwDeprecation")) throw new Error(e);n("traceDeprecation") ? console.trace(e) : console.warn(e), r = !0;
                }return t.apply(this, arguments);
              }if (n("noDeprecation")) return t;var r = !1;return i;
            }function n(e) {
              try {
                if (!t.localStorage) return !1;
              } catch (t) {
                return !1;
              }var i = t.localStorage[e];return null != i && "true" === String(i).toLowerCase();
            }e.exports = i;
          }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : void 0 !== window ? window : {});
        }, {}], 102: [function (t, e, i) {
          e.exports = function (t) {
            return t && "object" === (void 0 === t ? "undefined" : _typeof(t)) && "function" == typeof t.copy && "function" == typeof t.fill && "function" == typeof t.readUInt8;
          };
        }, {}], 103: [function (t, e, i) {
          (function (e, n) {
            function r(t, e) {
              var n = { seen: [], stylize: o };return arguments.length >= 3 && (n.depth = arguments[2]), arguments.length >= 4 && (n.colors = arguments[3]), m(e) ? n.showHidden = e : e && i._extend(n, e), y(n.showHidden) && (n.showHidden = !1), y(n.depth) && (n.depth = 2), y(n.colors) && (n.colors = !1), y(n.customInspect) && (n.customInspect = !0), n.colors && (n.stylize = a), l(n, t, n.depth);
            }function a(t, e) {
              var i = r.styles[e];return i ? "[" + r.colors[i][0] + "m" + t + "[" + r.colors[i][1] + "m" : t;
            }function o(t, e) {
              return t;
            }function s(t) {
              var e = {};return t.forEach(function (t, i) {
                e[t] = !0;
              }), e;
            }function l(t, e, n) {
              if (t.customInspect && e && I(e.inspect) && e.inspect !== i.inspect && (!e.constructor || e.constructor.prototype !== e)) {
                var r = e.inspect(n, t);return w(r) || (r = l(t, r, n)), r;
              }var a = h(t, e);if (a) return a;var o = Object.keys(e),
                  m = s(o);if (t.showHidden && (o = Object.getOwnPropertyNames(e)), S(e) && (o.indexOf("message") >= 0 || o.indexOf("description") >= 0)) return f(e);if (0 === o.length) {
                if (I(e)) {
                  var g = e.name ? ": " + e.name : "";return t.stylize("[Function" + g + "]", "special");
                }if (x(e)) return t.stylize(RegExp.prototype.toString.call(e), "regexp");if (E(e)) return t.stylize(Date.prototype.toString.call(e), "date");if (S(e)) return f(e);
              }var b = "",
                  v = !1,
                  _ = ["{", "}"];if (d(e) && (v = !0, _ = ["[", "]"]), I(e)) {
                b = " [Function" + (e.name ? ": " + e.name : "") + "]";
              }if (x(e) && (b = " " + RegExp.prototype.toString.call(e)), E(e) && (b = " " + Date.prototype.toUTCString.call(e)), S(e) && (b = " " + f(e)), 0 === o.length && (!v || 0 == e.length)) return _[0] + b + _[1];if (n < 0) return x(e) ? t.stylize(RegExp.prototype.toString.call(e), "regexp") : t.stylize("[Object]", "special");t.seen.push(e);var y;return y = v ? c(t, e, n, m, o) : o.map(function (i) {
                return u(t, e, n, m, i, v);
              }), t.seen.pop(), p(y, b, _);
            }function h(t, e) {
              if (y(e)) return t.stylize("undefined", "undefined");if (w(e)) {
                var i = "'" + JSON.stringify(e).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";return t.stylize(i, "string");
              }return v(e) ? t.stylize("" + e, "number") : m(e) ? t.stylize("" + e, "boolean") : g(e) ? t.stylize("null", "null") : void 0;
            }function f(t) {
              return "[" + Error.prototype.toString.call(t) + "]";
            }function c(t, e, i, n, r) {
              for (var a = [], o = 0, s = e.length; o < s; ++o) {
                L(e, String(o)) ? a.push(u(t, e, i, n, String(o), !0)) : a.push("");
              }return r.forEach(function (r) {
                r.match(/^\d+$/) || a.push(u(t, e, i, n, r, !0));
              }), a;
            }function u(t, e, i, n, r, a) {
              var o, s, h;if (h = Object.getOwnPropertyDescriptor(e, r) || { value: e[r] }, h.get ? s = h.set ? t.stylize("[Getter/Setter]", "special") : t.stylize("[Getter]", "special") : h.set && (s = t.stylize("[Setter]", "special")), L(n, r) || (o = "[" + r + "]"), s || (t.seen.indexOf(h.value) < 0 ? (s = g(i) ? l(t, h.value, null) : l(t, h.value, i - 1), s.indexOf("\n") > -1 && (s = a ? s.split("\n").map(function (t) {
                return "  " + t;
              }).join("\n").substr(2) : "\n" + s.split("\n").map(function (t) {
                return "   " + t;
              }).join("\n"))) : s = t.stylize("[Circular]", "special")), y(o)) {
                if (a && r.match(/^\d+$/)) return s;o = JSON.stringify("" + r), o.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (o = o.substr(1, o.length - 2), o = t.stylize(o, "name")) : (o = o.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), o = t.stylize(o, "string"));
              }return o + ": " + s;
            }function p(t, e, i) {
              var n = 0;return t.reduce(function (t, e) {
                return n++, e.indexOf("\n") >= 0 && n++, t + e.replace(/\u001b\[\d\d?m/g, "").length + 1;
              }, 0) > 60 ? i[0] + ("" === e ? "" : e + "\n ") + " " + t.join(",\n  ") + " " + i[1] : i[0] + e + " " + t.join(", ") + " " + i[1];
            }function d(t) {
              return Array.isArray(t);
            }function m(t) {
              return "boolean" == typeof t;
            }function g(t) {
              return null === t;
            }function b(t) {
              return null == t;
            }function v(t) {
              return "number" == typeof t;
            }function w(t) {
              return "string" == typeof t;
            }function _(t) {
              return "symbol" === (void 0 === t ? "undefined" : _typeof(t));
            }function y(t) {
              return void 0 === t;
            }function x(t) {
              return k(t) && "[object RegExp]" === A(t);
            }function k(t) {
              return "object" === (void 0 === t ? "undefined" : _typeof(t)) && null !== t;
            }function E(t) {
              return k(t) && "[object Date]" === A(t);
            }function S(t) {
              return k(t) && ("[object Error]" === A(t) || t instanceof Error);
            }function I(t) {
              return "function" == typeof t;
            }function M(t) {
              return null === t || "boolean" == typeof t || "number" == typeof t || "string" == typeof t || "symbol" === (void 0 === t ? "undefined" : _typeof(t)) || void 0 === t;
            }function A(t) {
              return Object.prototype.toString.call(t);
            }function T(t) {
              return t < 10 ? "0" + t.toString(10) : t.toString(10);
            }function R() {
              var t = new Date(),
                  e = [T(t.getHours()), T(t.getMinutes()), T(t.getSeconds())].join(":");return [t.getDate(), B[t.getMonth()], e].join(" ");
            }function L(t, e) {
              return Object.prototype.hasOwnProperty.call(t, e);
            }i.format = function (t) {
              if (!w(t)) {
                for (var e = [], i = 0; i < arguments.length; i++) {
                  e.push(r(arguments[i]));
                }return e.join(" ");
              }for (var i = 1, n = arguments, a = n.length, o = String(t).replace(/%[sdj%]/g, function (t) {
                if ("%%" === t) return "%";if (i >= a) return t;switch (t) {case "%s":
                    return String(n[i++]);case "%d":
                    return Number(n[i++]);case "%j":
                    try {
                      return JSON.stringify(n[i++]);
                    } catch (t) {
                      return "[Circular]";
                    }default:
                    return t;}
              }), s = n[i]; i < a; s = n[++i]) {
                o += g(s) || !k(s) ? " " + s : " " + r(s);
              }return o;
            }, i.deprecate = function (t, r) {
              function a() {
                if (!o) {
                  if (e.throwDeprecation) throw new Error(r);e.traceDeprecation ? console.trace(r) : console.error(r), o = !0;
                }return t.apply(this, arguments);
              }if (y(n.process)) return function () {
                return i.deprecate(t, r).apply(this, arguments);
              };if (e.noDeprecation === !0) return t;var o = !1;return a;
            };var P,
                C = {};i.debuglog = function (t) {
              if (y(P) && (P = e.env.NODE_DEBUG || ""), t = t.toUpperCase(), !C[t]) if (new RegExp("\\b" + t + "\\b", "i").test(P)) {
                var n = e.pid;C[t] = function () {
                  var e = i.format.apply(i, arguments);console.error("%s %d: %s", t, n, e);
                };
              } else C[t] = function () {};return C[t];
            }, i.inspect = r, r.colors = { bold: [1, 22], italic: [3, 23], underline: [4, 24], inverse: [7, 27], white: [37, 39], grey: [90, 39], black: [30, 39], blue: [34, 39], cyan: [36, 39], green: [32, 39], magenta: [35, 39], red: [31, 39], yellow: [33, 39] }, r.styles = { special: "cyan", number: "yellow", boolean: "yellow", undefined: "grey", null: "bold", string: "green", date: "magenta", regexp: "red" }, i.isArray = d, i.isBoolean = m, i.isNull = g, i.isNullOrUndefined = b, i.isNumber = v, i.isString = w, i.isSymbol = _, i.isUndefined = y, i.isRegExp = x, i.isObject = k, i.isDate = E, i.isError = S, i.isFunction = I, i.isPrimitive = M, i.isBuffer = t("./support/isBuffer");var B = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];i.log = function () {
              console.log("%s - %s", R(), i.format.apply(i, arguments));
            }, i.inherits = t("inherits"), i._extend = function (t, e) {
              if (!e || !k(e)) return t;for (var i = Object.keys(e), n = i.length; n--;) {
                t[i[n]] = e[i[n]];
              }return t;
            };
          }).call(this, t("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : void 0 !== window ? window : {});
        }, { "./support/isBuffer": 102, _process: 12, inherits: 31 }], 104: [function (t, e, i) {
          "use strict";
          function n(t) {
            for (var e in t) {
              if (t.hasOwnProperty(e)) return !1;
            }return !0;
          }function r(t, e, i) {
            var n = t;return f(e) ? (i = e, "string" == typeof t && (n = { uri: t })) : n = u(e, { uri: t }), n.callback = i, n;
          }function a(t, e, i) {
            return e = r(t, e, i), o(e);
          }function o(t) {
            function e() {
              4 === u.readyState && o();
            }function i() {
              var t = void 0;if (t = u.response ? u.response : u.responseText || s(u), y) try {
                t = JSON.parse(t);
              } catch (t) {}return t;
            }function r(t) {
              return clearTimeout(m), t instanceof Error || (t = new Error("" + (t || "Unknown XMLHttpRequest Error"))), t.statusCode = 0, h(t, f);
            }function o() {
              if (!d) {
                var e;clearTimeout(m), e = t.useXDR && void 0 === u.status ? 200 : 1223 === u.status ? 204 : u.status;var n = f,
                    r = null;return 0 !== e ? (n = { body: i(), statusCode: e, method: b, headers: {}, url: g, rawRequest: u }, u.getAllResponseHeaders && (n.headers = c(u.getAllResponseHeaders()))) : r = new Error("Internal XMLHttpRequest Error"), h(r, n, n.body);
              }
            }if (void 0 === t.callback) throw new Error("callback argument missing");var l = !1,
                h = function h(e, i, n) {
              l || (l = !0, t.callback(e, i, n));
            },
                f = { body: void 0, headers: {}, statusCode: 0, method: b, url: g, rawRequest: u },
                u = t.xhr || null;u || (u = t.cors || t.useXDR ? new a.XDomainRequest() : new a.XMLHttpRequest());var p,
                d,
                m,
                g = u.url = t.uri || t.url,
                b = u.method = t.method || "GET",
                v = t.body || t.data || null,
                w = u.headers = t.headers || {},
                _ = !!t.sync,
                y = !1;if ("json" in t && (y = !0, w.accept || w.Accept || (w.Accept = "application/json"), "GET" !== b && "HEAD" !== b && (w["content-type"] || w["Content-Type"] || (w["Content-Type"] = "application/json"), v = JSON.stringify(t.json))), u.onreadystatechange = e, u.onload = o, u.onerror = r, u.onprogress = function () {}, u.ontimeout = r, u.open(b, g, !_, t.username, t.password), _ || (u.withCredentials = !!t.withCredentials), !_ && t.timeout > 0 && (m = setTimeout(function () {
              d = !0, u.abort("timeout");var t = new Error("XMLHttpRequest timeout");t.code = "ETIMEDOUT", r(t);
            }, t.timeout)), u.setRequestHeader) for (p in w) {
              w.hasOwnProperty(p) && u.setRequestHeader(p, w[p]);
            } else if (t.headers && !n(t.headers)) throw new Error("Headers cannot be set on an XDomainRequest object");return "responseType" in t && (u.responseType = t.responseType), "beforeSend" in t && "function" == typeof t.beforeSend && t.beforeSend(u), u.send(v), u;
          }function s(t) {
            if ("document" === t.responseType) return t.responseXML;var e = 204 === t.status && t.responseXML && "parsererror" === t.responseXML.documentElement.nodeName;return "" !== t.responseType || e ? null : t.responseXML;
          }function l() {}var h = t("global/window"),
              f = t("is-function"),
              c = t("parse-headers"),
              u = t("xtend");e.exports = a, a.XMLHttpRequest = h.XMLHttpRequest || l, a.XDomainRequest = "withCredentials" in new a.XMLHttpRequest() ? a.XMLHttpRequest : h.XDomainRequest, function (t, e) {
            for (var i = 0; i < t.length; i++) {
              e(t[i]);
            }
          }(["get", "put", "post", "patch", "head", "delete"], function (t) {
            a["delete" === t ? "del" : t] = function (e, i, n) {
              return i = r(e, i, n), i.method = t.toUpperCase(), o(i);
            };
          });
        }, { "global/window": 29, "is-function": 34, "parse-headers": 58, xtend: 106 }], 105: [function (t, e, i) {
          e.exports = function () {
            return void 0 !== window.DOMParser ? function (t) {
              return new window.DOMParser().parseFromString(t, "application/xml");
            } : void 0 !== window.ActiveXObject && new window.ActiveXObject("Microsoft.XMLDOM") ? function (t) {
              var e = new window.ActiveXObject("Microsoft.XMLDOM");return e.async = "false", e.loadXML(t), e;
            } : function (t) {
              var e = document.createElement("div");return e.innerHTML = t, e;
            };
          }();
        }, {}], 106: [function (t, e, i) {
          function n() {
            for (var t = {}, e = 0; e < arguments.length; e++) {
              var i = arguments[e];for (var n in i) {
                r.call(i, n) && (t[n] = i[n]);
              }
            }return t;
          }e.exports = n;var r = Object.prototype.hasOwnProperty;
        }, {}], 107: [function (t, e, i) {
          function n(t, e) {
            this.size = this.size || t, this.smallerSize = this.smallerSize || e, a(this.size);
          }function r(t) {
            var e = {};return e.r = Math.floor(t / Math.pow(256, 3)), e.g = Math.floor((t - e.r * Math.pow(256, 3)) / Math.pow(256, 2)), e.b = Math.floor((t - e.r * Math.pow(256, 3) - e.g * Math.pow(256, 2)) / Math.pow(256, 1)), e.a = Math.floor((t - e.r * Math.pow(256, 3) - e.g * Math.pow(256, 2) - e.b * Math.pow(256, 1)) / Math.pow(256, 0)), e;
          }function a(t) {
            for (var e = 1; e < t; e++) {
              s[e] = 1;
            }s[0] = 1 / Math.sqrt(2);
          }function o(t, e) {
            for (var i = e, n = [], r = 0; r < i; r++) {
              n[r] = [];for (var a = 0; a < i; a++) {
                for (var o = 0, l = 0; l < i; l++) {
                  for (var h = 0; h < i; h++) {
                    o += Math.cos((2 * l + 1) / (2 * i) * r * Math.PI) * Math.cos((2 * h + 1) / (2 * i) * a * Math.PI) * t[l][h];
                  }
                }o *= s[r] * s[a] / 4, n[r][a] = o;
              }
            }return n;
          }n.prototype.size = 32, n.prototype.smallerSize = 8, n.prototype.distance = function (t, e) {
            for (var i = 0, n = 0; n < t.length; n++) {
              t[n] != e[n] && i++;
            }return i / t.length;
          }, n.prototype.getHash = function (t) {
            t = t.clone().resize(this.size, this.size), t.grayscale();for (var e = [], i = 0; i < t.bitmap.width; i++) {
              e[i] = [];for (var n = 0; n < t.bitmap.height; n++) {
                e[i][n] = r(t.getPixelColor(i, n)).b;
              }
            }for (var a = o(e, this.size), s = 0, i = 0; i < this.smallerSize; i++) {
              for (var n = 0; n < this.smallerSize; n++) {
                s += a[i][n];
              }
            }for (var l = s / (this.smallerSize * this.smallerSize), h = "", i = 0; i < this.smallerSize; i++) {
              for (var n = 0; n < this.smallerSize; n++) {
                h += a[i][n] > l ? "1" : "0";
              }
            }return h;
          };var s = [];e.exports = n;
        }, {}], 108: [function (t, e, i) {
          function n(t, e, i, n, r, a, o) {
            this.widthOriginal = Math.abs(parseInt(t) || 0), this.heightOriginal = Math.abs(parseInt(e) || 0), this.targetWidth = Math.abs(parseInt(i) || 0), this.targetHeight = Math.abs(parseInt(n) || 0), this.colorChannels = r ? 4 : 3, this.interpolationPass = !!a, this.resizeCallback = "function" == typeof o ? o : function (t) {}, this.targetWidthMultipliedByChannels = this.targetWidth * this.colorChannels, this.originalWidthMultipliedByChannels = this.widthOriginal * this.colorChannels, this.originalHeightMultipliedByChannels = this.heightOriginal * this.colorChannels, this.widthPassResultSize = this.targetWidthMultipliedByChannels * this.heightOriginal, this.finalResultSize = this.targetWidthMultipliedByChannels * this.targetHeight, this.initialize();
          }n.prototype.initialize = function () {
            if (!(this.widthOriginal > 0 && this.heightOriginal > 0 && this.targetWidth > 0 && this.targetHeight > 0)) throw new Error("Invalid settings specified for the resizer.");this.configurePasses();
          }, n.prototype.configurePasses = function () {
            this.widthOriginal == this.targetWidth ? this.resizeWidth = this.bypassResizer : (this.ratioWeightWidthPass = this.widthOriginal / this.targetWidth, this.ratioWeightWidthPass < 1 && this.interpolationPass ? (this.initializeFirstPassBuffers(!0), this.resizeWidth = 4 == this.colorChannels ? this.resizeWidthInterpolatedRGBA : this.resizeWidthInterpolatedRGB) : (this.initializeFirstPassBuffers(!1), this.resizeWidth = 4 == this.colorChannels ? this.resizeWidthRGBA : this.resizeWidthRGB)), this.heightOriginal == this.targetHeight ? this.resizeHeight = this.bypassResizer : (this.ratioWeightHeightPass = this.heightOriginal / this.targetHeight, this.ratioWeightHeightPass < 1 && this.interpolationPass ? (this.initializeSecondPassBuffers(!0), this.resizeHeight = this.resizeHeightInterpolated) : (this.initializeSecondPassBuffers(!1), this.resizeHeight = 4 == this.colorChannels ? this.resizeHeightRGBA : this.resizeHeightRGB));
          }, n.prototype.resizeWidthRGB = function (t) {
            var e = this.ratioWeightWidthPass,
                i = 1 / e,
                n = 0,
                r = 0,
                a = 0,
                o = 0,
                s = 0,
                l = 0,
                h = 0,
                f = this.originalWidthMultipliedByChannels - 2,
                c = this.targetWidthMultipliedByChannels - 2,
                u = this.outputWidthWorkBench,
                p = this.widthBuffer;do {
              for (s = 0; s < this.originalHeightMultipliedByChannels;) {
                u[s++] = 0, u[s++] = 0, u[s++] = 0;
              }n = e;do {
                if (r = 1 + a - o, !(n >= r)) {
                  for (s = 0, l = a; s < this.originalHeightMultipliedByChannels; l += f) {
                    u[s++] += t[l++] * n, u[s++] += t[l++] * n, u[s++] += t[l] * n;
                  }o += n;break;
                }for (s = 0, l = a; s < this.originalHeightMultipliedByChannels; l += f) {
                  u[s++] += t[l++] * r, u[s++] += t[l++] * r, u[s++] += t[l] * r;
                }o = a += 3, n -= r;
              } while (n > 0 && a < this.originalWidthMultipliedByChannels);for (s = 0, l = h; s < this.originalHeightMultipliedByChannels; l += c) {
                p[l++] = u[s++] * i, p[l++] = u[s++] * i, p[l] = u[s++] * i;
              }h += 3;
            } while (h < this.targetWidthMultipliedByChannels);return p;
          }, n.prototype.resizeWidthInterpolatedRGB = function (t) {
            for (var e = this.ratioWeightWidthPass, i = 0, n = 0, r = 0, a = 0, o = 0, s = this.widthBuffer, l = 0; i < 1 / 3; l += 3, i += e) {
              for (n = l, r = 0; n < this.widthPassResultSize; r += this.originalWidthMultipliedByChannels, n += this.targetWidthMultipliedByChannels) {
                s[n] = t[r], s[n + 1] = t[r + 1], s[n + 2] = t[r + 2];
              }
            }i -= 1 / 3;for (var h = this.widthOriginal - 1; i < h; l += 3, i += e) {
              for (o = i % 1, a = 1 - o, n = l, r = 3 * Math.floor(i); n < this.widthPassResultSize; r += this.originalWidthMultipliedByChannels, n += this.targetWidthMultipliedByChannels) {
                s[n] = t[r] * a + t[r + 3] * o, s[n + 1] = t[r + 1] * a + t[r + 4] * o, s[n + 2] = t[r + 2] * a + t[r + 5] * o;
              }
            }for (h = this.originalWidthMultipliedByChannels - 3; l < this.targetWidthMultipliedByChannels; l += 3) {
              for (n = l, r = h; n < this.widthPassResultSize; r += this.originalWidthMultipliedByChannels, n += this.targetWidthMultipliedByChannels) {
                s[n] = t[r], s[n + 1] = t[r + 1], s[n + 2] = t[r + 2];
              }
            }return s;
          }, n.prototype.resizeWidthRGBA = function (t) {
            var e = this.ratioWeightWidthPass,
                i = 1 / e,
                n = 0,
                r = 0,
                a = 0,
                o = 0,
                s = 0,
                l = 0,
                h = 0,
                f = this.originalWidthMultipliedByChannels - 3,
                c = this.targetWidthMultipliedByChannels - 3,
                u = this.outputWidthWorkBench,
                p = this.widthBuffer;do {
              for (s = 0; s < this.originalHeightMultipliedByChannels;) {
                u[s++] = 0, u[s++] = 0, u[s++] = 0, u[s++] = 0;
              }n = e;do {
                if (r = 1 + a - o, !(n >= r)) {
                  for (s = 0, l = a; s < this.originalHeightMultipliedByChannels; l += f) {
                    u[s++] += t[l++] * n, u[s++] += t[l++] * n, u[s++] += t[l++] * n, u[s++] += t[l] * n;
                  }o += n;break;
                }for (s = 0, l = a; s < this.originalHeightMultipliedByChannels; l += f) {
                  u[s++] += t[l++] * r, u[s++] += t[l++] * r, u[s++] += t[l++] * r, u[s++] += t[l] * r;
                }o = a += 4, n -= r;
              } while (n > 0 && a < this.originalWidthMultipliedByChannels);for (s = 0, l = h; s < this.originalHeightMultipliedByChannels; l += c) {
                p[l++] = u[s++] * i, p[l++] = u[s++] * i, p[l++] = u[s++] * i, p[l] = u[s++] * i;
              }h += 4;
            } while (h < this.targetWidthMultipliedByChannels);return p;
          }, n.prototype.resizeWidthInterpolatedRGBA = function (t) {
            for (var e = this.ratioWeightWidthPass, i = 0, n = 0, r = 0, a = 0, o = 0, s = this.widthBuffer, l = 0; i < 1 / 3; l += 4, i += e) {
              for (n = l, r = 0; n < this.widthPassResultSize; r += this.originalWidthMultipliedByChannels, n += this.targetWidthMultipliedByChannels) {
                s[n] = t[r], s[n + 1] = t[r + 1], s[n + 2] = t[r + 2], s[n + 3] = t[r + 3];
              }
            }i -= 1 / 3;for (var h = this.widthOriginal - 1; i < h; l += 4, i += e) {
              for (o = i % 1, a = 1 - o, n = l, r = 4 * Math.floor(i); n < this.widthPassResultSize; r += this.originalWidthMultipliedByChannels, n += this.targetWidthMultipliedByChannels) {
                s[n] = t[r] * a + t[r + 4] * o, s[n + 1] = t[r + 1] * a + t[r + 5] * o, s[n + 2] = t[r + 2] * a + t[r + 6] * o, s[n + 3] = t[r + 3] * a + t[r + 7] * o;
              }
            }for (h = this.originalWidthMultipliedByChannels - 4; l < this.targetWidthMultipliedByChannels; l += 4) {
              for (n = l, r = h; n < this.widthPassResultSize; r += this.originalWidthMultipliedByChannels, n += this.targetWidthMultipliedByChannels) {
                s[n] = t[r], s[n + 1] = t[r + 1], s[n + 2] = t[r + 2], s[n + 3] = t[r + 3];
              }
            }return s;
          }, n.prototype.resizeHeightRGB = function (t) {
            var e = this.ratioWeightHeightPass,
                i = 1 / e,
                n = 0,
                r = 0,
                a = 0,
                o = 0,
                s = 0,
                l = 0,
                h = this.outputHeightWorkBench,
                f = this.heightBuffer;do {
              for (s = 0; s < this.targetWidthMultipliedByChannels;) {
                h[s++] = 0, h[s++] = 0, h[s++] = 0;
              }n = e;do {
                if (r = 1 + a - o, !(n >= r)) {
                  for (s = 0, r = a; s < this.targetWidthMultipliedByChannels;) {
                    h[s++] += t[r++] * n, h[s++] += t[r++] * n, h[s++] += t[r++] * n;
                  }o += n;break;
                }for (s = 0; s < this.targetWidthMultipliedByChannels;) {
                  h[s++] += t[a++] * r, h[s++] += t[a++] * r, h[s++] += t[a++] * r;
                }o = a, n -= r;
              } while (n > 0 && a < this.widthPassResultSize);for (s = 0; s < this.targetWidthMultipliedByChannels;) {
                f[l++] = Math.round(h[s++] * i), f[l++] = Math.round(h[s++] * i), f[l++] = Math.round(h[s++] * i);
              }
            } while (l < this.finalResultSize);return f;
          }, n.prototype.resizeHeightInterpolated = function (t) {
            for (var e = this.ratioWeightHeightPass, i = 0, n = 0, r = 0, a = 0, o = 0, s = 0, l = 0, h = this.heightBuffer; i < 1 / 3; i += e) {
              for (r = 0; r < this.targetWidthMultipliedByChannels;) {
                h[n++] = Math.round(t[r++]);
              }
            }i -= 1 / 3;for (var f = this.heightOriginal - 1; i < f; i += e) {
              for (l = i % 1, s = 1 - l, a = Math.floor(i) * this.targetWidthMultipliedByChannels, o = a + this.targetWidthMultipliedByChannels, r = 0; r < this.targetWidthMultipliedByChannels; ++r) {
                h[n++] = Math.round(t[a++] * s + t[o++] * l);
              }
            }for (; n < this.finalResultSize;) {
              for (r = 0, a = f * this.targetWidthMultipliedByChannels; r < this.targetWidthMultipliedByChannels; ++r) {
                h[n++] = Math.round(t[a++]);
              }
            }return h;
          }, n.prototype.resizeHeightRGBA = function (t) {
            var e = this.ratioWeightHeightPass,
                i = 1 / e,
                n = 0,
                r = 0,
                a = 0,
                o = 0,
                s = 0,
                l = 0,
                h = this.outputHeightWorkBench,
                f = this.heightBuffer;do {
              for (s = 0; s < this.targetWidthMultipliedByChannels;) {
                h[s++] = 0, h[s++] = 0, h[s++] = 0, h[s++] = 0;
              }n = e;do {
                if (r = 1 + a - o, !(n >= r)) {
                  for (s = 0, r = a; s < this.targetWidthMultipliedByChannels;) {
                    h[s++] += t[r++] * n, h[s++] += t[r++] * n, h[s++] += t[r++] * n, h[s++] += t[r++] * n;
                  }o += n;break;
                }for (s = 0; s < this.targetWidthMultipliedByChannels;) {
                  h[s++] += t[a++] * r, h[s++] += t[a++] * r, h[s++] += t[a++] * r, h[s++] += t[a++] * r;
                }o = a, n -= r;
              } while (n > 0 && a < this.widthPassResultSize);for (s = 0; s < this.targetWidthMultipliedByChannels;) {
                f[l++] = Math.round(h[s++] * i), f[l++] = Math.round(h[s++] * i), f[l++] = Math.round(h[s++] * i), f[l++] = Math.round(h[s++] * i);
              }
            } while (l < this.finalResultSize);return f;
          }, n.prototype.resize = function (t) {
            this.resizeCallback(this.resizeHeight(this.resizeWidth(t)));
          }, n.prototype.bypassResizer = function (t) {
            return t;
          }, n.prototype.initializeFirstPassBuffers = function (t) {
            this.widthBuffer = this.generateFloatBuffer(this.widthPassResultSize), t || (this.outputWidthWorkBench = this.generateFloatBuffer(this.originalHeightMultipliedByChannels));
          }, n.prototype.initializeSecondPassBuffers = function (t) {
            this.heightBuffer = this.generateUint8Buffer(this.finalResultSize), t || (this.outputHeightWorkBench = this.generateFloatBuffer(this.targetWidthMultipliedByChannels));
          }, n.prototype.generateFloatBuffer = function (t) {
            try {
              return new Float32Array(t);
            } catch (t) {
              return [];
            }
          }, n.prototype.generateUint8Buffer = function (t) {
            try {
              return new Uint8Array(t);
            } catch (t) {
              return [];
            }
          }, e.exports = n;
        }, {}], 109: [function (t, e, i) {
          (function (t) {
            "use strict";
            e.exports = { nearestNeighbor: function nearestNeighbor(t, e, i) {
                for (var n = t.width, r = t.height, a = e.width, o = e.height, s = t.data, l = e.data, h = 0; h < o; h++) {
                  for (var f = 0; f < a; f++) {
                    var c = 4 * (h * a + f),
                        u = Math.round(h * r / o),
                        p = Math.round(f * n / a),
                        d = 4 * (u * n + p);l[c++] = s[d++], l[c++] = s[d++], l[c++] = s[d++], l[c++] = s[d++];
                  }
                }
              }, bilinearInterpolation: function bilinearInterpolation(t, e, i) {
                for (var n = t.width, r = t.height, a = e.width, o = e.height, s = t.data, l = e.data, h = function h(t, e, i, n, r) {
                  return e === n ? i : Math.round((t - e) * r + (n - t) * i);
                }, f = function f(t, e, i, r, a, o, _f, c) {
                  var u = 4 * (_f * n + r) + e,
                      p = 4 * (_f * n + a) + e,
                      d = h(i, r, s[u], a, s[p]);if (c === _f) l[t + e] = d;else {
                    u = 4 * (c * n + r) + e, p = 4 * (c * n + a) + e;var m = h(i, r, s[u], a, s[p]);l[t + e] = h(o, _f, d, c, m);
                  }
                }, c = 0; c < o; c++) {
                  for (var u = 0; u < a; u++) {
                    var p = 4 * (c * a + u),
                        d = u * n / a,
                        m = Math.floor(d),
                        g = Math.min(Math.ceil(d), n - 1),
                        b = c * r / o,
                        v = Math.floor(b),
                        w = Math.min(Math.ceil(b), r - 1);f(p, 0, d, m, g, b, v, w), f(p, 1, d, m, g, b, v, w), f(p, 2, d, m, g, b, v, w), f(p, 3, d, m, g, b, v, w);
                  }
                }
              }, _interpolate2D: function _interpolate2D(e, i, n, r) {
                for (var a = e.data, o = i.data, s = e.width, l = e.height, h = i.width, f = i.height, c = Math.max(1, Math.floor(s / h)), u = h * c, p = Math.max(1, Math.floor(l / f)), d = f * p, m = new t(u * l * 4), g = 0; g < l; g++) {
                  for (var b = 0; b < u; b++) {
                    for (var v = b * (s - 1) / u, w = Math.floor(v), _ = v - w, y = 4 * (g * s + w), x = 4 * (g * u + b), k = 0; k < 4; k++) {
                      var E = y + k,
                          S = w > 0 ? a[E - 4] : 2 * a[E] - a[E + 4],
                          I = a[E],
                          M = a[E + 4],
                          A = w < s - 2 ? a[E + 8] : 2 * a[E + 4] - a[E];m[x + k] = r(S, I, M, A, _);
                    }
                  }
                }for (var T = new t(u * d * 4), g = 0; g < d; g++) {
                  for (var b = 0; b < u; b++) {
                    for (var R = g * (l - 1) / d, L = Math.floor(R), _ = R - L, x = 4 * (L * u + b), P = 4 * (g * u + b), k = 0; k < 4; k++) {
                      var E = x + k,
                          C = L > 0 ? m[E - 4 * u] : 2 * m[E] - m[E + 4 * u],
                          B = m[E],
                          z = m[E + 4 * u],
                          O = L < l - 2 ? m[E + 8 * u] : 2 * m[E + 4 * u] - m[E];T[P + k] = r(C, B, z, O, _);
                    }
                  }
                }var D = c * p;if (D > 1) for (var g = 0; g < f; g++) {
                  for (var b = 0; b < h; b++) {
                    for (var U = 0, N = 0, F = 0, j = 0, R = 0; R < p; R++) {
                      for (var L = g * p + R, v = 0; v < c; v++) {
                        var w = b * c + v,
                            H = 4 * (L * u + w);U += T[H], N += T[H + 1], F += T[H + 2], j += T[H + 3];
                      }
                    }var G = 4 * (g * h + b);o[G] = Math.round(U / D), o[G + 1] = Math.round(N / D), o[G + 2] = Math.round(F / D), o[G + 3] = Math.round(j / D);
                  }
                } else i.data = T;
              }, bicubicInterpolation: function bicubicInterpolation(t, e, i) {
                var n = function n(t, e, i, _n, r) {
                  var a = _n - i - t + e,
                      o = t - e - a,
                      s = i - t,
                      l = e;return Math.max(0, Math.min(255, a * (r * r * r) + o * (r * r) + s * r + l));
                };return this._interpolate2D(t, e, i, n);
              }, hermiteInterpolation: function hermiteInterpolation(t, e, i) {
                var n = function n(t, e, i, _n2, r) {
                  var a = e,
                      o = .5 * (i - t),
                      s = t - 2.5 * e + 2 * i - .5 * _n2,
                      l = .5 * (_n2 - t) + 1.5 * (e - i);return Math.max(0, Math.min(255, Math.round(((l * r + s) * r + o) * r + a)));
                };return this._interpolate2D(t, e, i, n);
              }, bezierInterpolation: function bezierInterpolation(t, e, i) {
                var n = function n(t, e, i, _n3, r) {
                  var a = e + (i - t) / 4,
                      o = i - (_n3 - e) / 4,
                      s = 1 - r,
                      l = e * s * s * s,
                      h = 3 * a * s * s * r,
                      f = 3 * o * s * r * r,
                      c = i * r * r * r;return Math.max(0, Math.min(255, Math.round(l + h + f + c)));
                };return this._interpolate2D(t, e, i, n);
              } };
          }).call(this, t("buffer").Buffer);
        }, { buffer: 14 }] }, {}, [1]), !self.Buffer && !window.Buffer) throw new Error("Node's Buffer() not available");if (!self.Jimp && !window.Jimp) throw new Error("Could not Jimp object");!function () {
        function t(t, e) {
          var i = new XMLHttpRequest();i.open("GET", t, !0), i.responseType = "arraybuffer", i.onload = function () {
            i.status < 400 ? e(this.response, null) : e(null, "HTTP Status " + i.status + " for url " + t);
          }, i.onerror = function (t) {
            e(null, t);
          }, i.send();
        }function e(t) {
          for (var e = new Buffer(t.byteLength), i = new Uint8Array(t), n = 0; n < e.length; ++n) {
            e[n] = i[n];
          }return e;
        }function i(t) {
          return Object.prototype.toString.call(t).toLowerCase().indexOf("arraybuffer") > -1;
        }delete Jimp.prototype.write, delete Jimp.read, Jimp.read = function (n, r) {
          return new Promise(function (a, o) {
            r = r || function (t, e) {
              t ? o(t) : a(e);
            }, "string" == typeof n ? t(n, function (t, a) {
              t ? i(t) ? new Jimp(e(t), r) : r(new Error("Unrecognized data received for " + n)) : a && r(a);
            }) : i(n) ? new Jimp(e(n), r) : r(new Error("Jimp expects a single ArrayBuffer or image URL"));
          });
        };
      }();
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer);
  }, { "buffer": 3 }], 2: [function (require, module, exports) {
    'use strict';

    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }

    revLookup['-'.charCodeAt(0)] = 62;
    revLookup['_'.charCodeAt(0)] = 63;

    function placeHoldersCount(b64) {
      var len = b64.length;
      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
    }

    function byteLength(b64) {
      // base64 is 4/3 + up to two characters of the original data
      return b64.length * 3 / 4 - placeHoldersCount(b64);
    }

    function toByteArray(b64) {
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;
      placeHolders = placeHoldersCount(b64);

      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = tmp >> 16 & 0xFF;
        arr[L++] = tmp >> 8 & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[L++] = tmp >> 8 & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr;
    }

    function tripletToBase64(num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
    }

    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
        output.push(tripletToBase64(tmp));
      }
      return output.join('');
    }

    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[tmp << 4 & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        output += lookup[tmp >> 10];
        output += lookup[tmp >> 4 & 0x3F];
        output += lookup[tmp << 2 & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('');
    }
  }, {}], 3: [function (require, module, exports) {
    (function (global) {
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
       * @license  MIT
       */
      /* eslint-disable no-proto */

      'use strict';

      var base64 = require('base64-js');
      var ieee754 = require('ieee754');
      var isArray = require('isarray');

      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;

      /**
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
       */
      Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();

      /*
       * Export kMaxLength after typed array support is determined.
       */
      exports.kMaxLength = kMaxLength();

      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function foo() {
              return 42;
            } };
          return arr.foo() === 42 && // typed array instances can be augmented
          typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
          arr.subarray(1, 1).byteLength === 0; // ie10 has broken `subarray`
        } catch (e) {
          return false;
        }
      }

      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
      }

      function createBuffer(that, length) {
        if (kMaxLength() < length) {
          throw new RangeError('Invalid typed array length');
        }
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          // Return an augmented `Uint8Array` instance, for best performance
          that = new Uint8Array(length);
          that.__proto__ = Buffer.prototype;
        } else {
          // Fallback: Return an object instance of the Buffer class
          if (that === null) {
            that = new Buffer(length);
          }
          that.length = length;
        }

        return that;
      }

      /**
       * The Buffer constructor returns instances of `Uint8Array` that have their
       * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
       * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
       * and the `Uint8Array` methods. Square bracket notation works as expected -- it
       * returns a single octet.
       *
       * The `Uint8Array` prototype remains unmodified.
       */

      function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
          return new Buffer(arg, encodingOrOffset, length);
        }

        // Common case.
        if (typeof arg === 'number') {
          if (typeof encodingOrOffset === 'string') {
            throw new Error('If encoding is specified then the first argument must be a string');
          }
          return allocUnsafe(this, arg);
        }
        return from(this, arg, encodingOrOffset, length);
      }

      Buffer.poolSize = 8192; // not used by this implementation

      // TODO: Legacy, not needed anymore. Remove in next major version.
      Buffer._augment = function (arr) {
        arr.__proto__ = Buffer.prototype;
        return arr;
      };

      function from(that, value, encodingOrOffset, length) {
        if (typeof value === 'number') {
          throw new TypeError('"value" argument must not be a number');
        }

        if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
          return fromArrayBuffer(that, value, encodingOrOffset, length);
        }

        if (typeof value === 'string') {
          return fromString(that, value, encodingOrOffset);
        }

        return fromObject(that, value);
      }

      /**
       * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
       * if value is a number.
       * Buffer.from(str[, encoding])
       * Buffer.from(array)
       * Buffer.from(buffer)
       * Buffer.from(arrayBuffer[, byteOffset[, length]])
       **/
      Buffer.from = function (value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        if (typeof Symbol !== 'undefined' && Symbol.species && Buffer[Symbol.species] === Buffer) {
          // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
          Object.defineProperty(Buffer, Symbol.species, {
            value: null,
            configurable: true
          });
        }
      }

      function assertSize(size) {
        if (typeof size !== 'number') {
          throw new TypeError('"size" argument must be a number');
        } else if (size < 0) {
          throw new RangeError('"size" argument must not be negative');
        }
      }

      function alloc(that, size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(that, size);
        }
        if (fill !== undefined) {
          // Only pay attention to encoding if it's a string. This
          // prevents accidentally sending in a number that would
          // be interpretted as a start offset.
          return typeof encoding === 'string' ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
        }
        return createBuffer(that, size);
      }

      /**
       * Creates a new filled Buffer instance.
       * alloc(size[, fill[, encoding]])
       **/
      Buffer.alloc = function (size, fill, encoding) {
        return alloc(null, size, fill, encoding);
      };

      function allocUnsafe(that, size) {
        assertSize(size);
        that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
        if (!Buffer.TYPED_ARRAY_SUPPORT) {
          for (var i = 0; i < size; ++i) {
            that[i] = 0;
          }
        }
        return that;
      }

      /**
       * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
       * */
      Buffer.allocUnsafe = function (size) {
        return allocUnsafe(null, size);
      };
      /**
       * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
       */
      Buffer.allocUnsafeSlow = function (size) {
        return allocUnsafe(null, size);
      };

      function fromString(that, string, encoding) {
        if (typeof encoding !== 'string' || encoding === '') {
          encoding = 'utf8';
        }

        if (!Buffer.isEncoding(encoding)) {
          throw new TypeError('"encoding" must be a valid string encoding');
        }

        var length = byteLength(string, encoding) | 0;
        that = createBuffer(that, length);

        var actual = that.write(string, encoding);

        if (actual !== length) {
          // Writing a hex string, for example, that contains invalid characters will
          // cause everything after the first invalid character to be ignored. (e.g.
          // 'abxxcd' will be treated as 'ab')
          that = that.slice(0, actual);
        }

        return that;
      }

      function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : checked(array.length) | 0;
        that = createBuffer(that, length);
        for (var i = 0; i < length; i += 1) {
          that[i] = array[i] & 255;
        }
        return that;
      }

      function fromArrayBuffer(that, array, byteOffset, length) {
        array.byteLength; // this throws if `array` is not a valid ArrayBuffer

        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('\'offset\' is out of bounds');
        }

        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('\'length\' is out of bounds');
        }

        if (byteOffset === undefined && length === undefined) {
          array = new Uint8Array(array);
        } else if (length === undefined) {
          array = new Uint8Array(array, byteOffset);
        } else {
          array = new Uint8Array(array, byteOffset, length);
        }

        if (Buffer.TYPED_ARRAY_SUPPORT) {
          // Return an augmented `Uint8Array` instance, for best performance
          that = array;
          that.__proto__ = Buffer.prototype;
        } else {
          // Fallback: Return an object instance of the Buffer class
          that = fromArrayLike(that, array);
        }
        return that;
      }

      function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
          var len = checked(obj.length) | 0;
          that = createBuffer(that, len);

          if (that.length === 0) {
            return that;
          }

          obj.copy(that, 0, 0, len);
          return that;
        }

        if (obj) {
          if (typeof ArrayBuffer !== 'undefined' && obj.buffer instanceof ArrayBuffer || 'length' in obj) {
            if (typeof obj.length !== 'number' || isnan(obj.length)) {
              return createBuffer(that, 0);
            }
            return fromArrayLike(that, obj);
          }

          if (obj.type === 'Buffer' && isArray(obj.data)) {
            return fromArrayLike(that, obj.data);
          }
        }

        throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
      }

      function checked(length) {
        // Note: cannot use `length < kMaxLength()` here because that fails when
        // length is NaN (which is otherwise coerced to zero.)
        if (length >= kMaxLength()) {
          throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
        }
        return length | 0;
      }

      function SlowBuffer(length) {
        if (+length != length) {
          // eslint-disable-line eqeqeq
          length = 0;
        }
        return Buffer.alloc(+length);
      }

      Buffer.isBuffer = function isBuffer(b) {
        return !!(b != null && b._isBuffer);
      };

      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError('Arguments must be Buffers');
        }

        if (a === b) return 0;

        var x = a.length;
        var y = b.length;

        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }

        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };

      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'latin1':
          case 'binary':
          case 'base64':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return true;
          default:
            return false;
        }
      };

      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }

        if (list.length === 0) {
          return Buffer.alloc(0);
        }

        var i;
        if (length === undefined) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }

        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };

      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) {
          return string.length;
        }
        if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== 'string') {
          string = '' + string;
        }

        var len = string.length;
        if (len === 0) return 0;

        // Use a for loop to avoid recursion
        var loweredCase = false;
        for (;;) {
          switch (encoding) {
            case 'ascii':
            case 'latin1':
            case 'binary':
              return len;
            case 'utf8':
            case 'utf-8':
            case undefined:
              return utf8ToBytes(string).length;
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return len * 2;
            case 'hex':
              return len >>> 1;
            case 'base64':
              return base64ToBytes(string).length;
            default:
              if (loweredCase) return utf8ToBytes(string).length; // assume utf8
              encoding = ('' + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer.byteLength = byteLength;

      function slowToString(encoding, start, end) {
        var loweredCase = false;

        // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
        // property of a typed array.

        // This behaves neither like String nor Uint8Array in that we set start/end
        // to their upper/lower bounds if the value passed is out of range.
        // undefined is handled specially as per ECMA-262 6th Edition,
        // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
        if (start === undefined || start < 0) {
          start = 0;
        }
        // Return early if start > this.length. Done here to prevent potential uint32
        // coercion fail below.
        if (start > this.length) {
          return '';
        }

        if (end === undefined || end > this.length) {
          end = this.length;
        }

        if (end <= 0) {
          return '';
        }

        // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
        end >>>= 0;
        start >>>= 0;

        if (end <= start) {
          return '';
        }

        if (!encoding) encoding = 'utf8';

        while (true) {
          switch (encoding) {
            case 'hex':
              return hexSlice(this, start, end);

            case 'utf8':
            case 'utf-8':
              return utf8Slice(this, start, end);

            case 'ascii':
              return asciiSlice(this, start, end);

            case 'latin1':
            case 'binary':
              return latin1Slice(this, start, end);

            case 'base64':
              return base64Slice(this, start, end);

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return utf16leSlice(this, start, end);

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
              encoding = (encoding + '').toLowerCase();
              loweredCase = true;
          }
        }
      }

      // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
      // Buffer instances.
      Buffer.prototype._isBuffer = true;

      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }

      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 16-bits');
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };

      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 32-bits');
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };

      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 64-bits');
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };

      Buffer.prototype.toString = function toString() {
        var length = this.length | 0;
        if (length === 0) return '';
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };

      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
        if (this === b) return true;
        return Buffer.compare(this, b) === 0;
      };

      Buffer.prototype.inspect = function inspect() {
        var str = '';
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
          if (this.length > max) str += ' ... ';
        }
        return '<Buffer ' + str + '>';
      };

      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) {
          throw new TypeError('Argument must be a Buffer');
        }

        if (start === undefined) {
          start = 0;
        }
        if (end === undefined) {
          end = target ? target.length : 0;
        }
        if (thisStart === undefined) {
          thisStart = 0;
        }
        if (thisEnd === undefined) {
          thisEnd = this.length;
        }

        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError('out of range index');
        }

        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }

        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;

        if (this === target) return 0;

        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);

        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);

        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }

        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };

      // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
      // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
      //
      // Arguments:
      // - buffer - a Buffer to search
      // - val - a string, Buffer, or number
      // - byteOffset - an index into `buffer`; will be clamped to an int32
      // - encoding - an optional encoding, relevant is val is a string
      // - dir - true for indexOf, false for lastIndexOf
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        // Empty buffer means no match
        if (buffer.length === 0) return -1;

        // Normalize byteOffset
        if (typeof byteOffset === 'string') {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 0x7fffffff) {
          byteOffset = 0x7fffffff;
        } else if (byteOffset < -0x80000000) {
          byteOffset = -0x80000000;
        }
        byteOffset = +byteOffset; // Coerce to Number.
        if (isNaN(byteOffset)) {
          // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
          byteOffset = dir ? 0 : buffer.length - 1;
        }

        // Normalize byteOffset: negative offsets start from the end of the buffer
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;else return -1;
        }

        // Normalize val
        if (typeof val === 'string') {
          val = Buffer.from(val, encoding);
        }

        // Finally, search either indexOf (if dir is true) or lastIndexOf
        if (Buffer.isBuffer(val)) {
          // Special case: looking for empty string/buffer always fails
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === 'number') {
          val = val & 0xFF; // Search for a byte value [0-255]
          if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === 'function') {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }

        throw new TypeError('val must be string, number or Buffer');
      }

      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;

        if (encoding !== undefined) {
          encoding = String(encoding).toLowerCase();
          if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }

        function read(buf, i) {
          if (indexSize === 1) {
            return buf[i];
          } else {
            return buf.readUInt16BE(i * indexSize);
          }
        }

        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }

        return -1;
      }

      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };

      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };

      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };

      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }

        // must be an even number of digits
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

        if (length > strLen / 2) {
          length = strLen / 2;
        }
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(i * 2, 2), 16);
          if (isNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }

      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }

      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }

      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }

      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }

      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }

      Buffer.prototype.write = function write(string, offset, length, encoding) {
        // Buffer#write(string)
        if (offset === undefined) {
          encoding = 'utf8';
          length = this.length;
          offset = 0;
          // Buffer#write(string, encoding)
        } else if (length === undefined && typeof offset === 'string') {
          encoding = offset;
          length = this.length;
          offset = 0;
          // Buffer#write(string, offset[, length][, encoding])
        } else if (isFinite(offset)) {
          offset = offset | 0;
          if (isFinite(length)) {
            length = length | 0;
            if (encoding === undefined) encoding = 'utf8';
          } else {
            encoding = length;
            length = undefined;
          }
          // legacy write(string, encoding, offset, length) - remove in v0.13
        } else {
          throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
        }

        var remaining = this.length - offset;
        if (length === undefined || length > remaining) length = remaining;

        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError('Attempt to write outside buffer bounds');
        }

        if (!encoding) encoding = 'utf8';

        var loweredCase = false;
        for (;;) {
          switch (encoding) {
            case 'hex':
              return hexWrite(this, string, offset, length);

            case 'utf8':
            case 'utf-8':
              return utf8Write(this, string, offset, length);

            case 'ascii':
              return asciiWrite(this, string, offset, length);

            case 'latin1':
            case 'binary':
              return latin1Write(this, string, offset, length);

            case 'base64':
              // Warning: maxLength not taken into account in base64Write
              return base64Write(this, string, offset, length);

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return ucs2Write(this, string, offset, length);

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
              encoding = ('' + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };

      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: 'Buffer',
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };

      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }

      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];

        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;

            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 0x80) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                  if (tempCodePoint > 0x7F) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                  if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                  if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }

          if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
          } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000;
            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
            codePoint = 0xDC00 | codePoint & 0x3FF;
          }

          res.push(codePoint);
          i += bytesPerSequence;
        }

        return decodeCodePointsArray(res);
      }

      // Based on http://stackoverflow.com/a/22747272/680742, the browser with
      // the lowest limit is Chrome, with 0x10000 args.
      // We go 1 magnitude less, for safety
      var MAX_ARGUMENTS_LENGTH = 0x1000;

      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
        }

        // Decode in chunks to avoid "call stack size exceeded".
        var res = '';
        var i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        }
        return res;
      }

      function asciiSlice(buf, start, end) {
        var ret = '';
        end = Math.min(buf.length, end);

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 0x7F);
        }
        return ret;
      }

      function latin1Slice(buf, start, end) {
        var ret = '';
        end = Math.min(buf.length, end);

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }

      function hexSlice(buf, start, end) {
        var len = buf.length;

        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;

        var out = '';
        for (var i = start; i < end; ++i) {
          out += toHex(buf[i]);
        }
        return out;
      }

      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = '';
        for (var i = 0; i < bytes.length; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }

      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = end === undefined ? len : ~~end;

        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }

        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }

        if (end < start) end = start;

        var newBuf;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer(sliceLen, undefined);
          for (var i = 0; i < sliceLen; ++i) {
            newBuf[i] = this[i + start];
          }
        }

        return newBuf;
      };

      /*
       * Need to make sure that buffer isn't trying to write out of bounds.
       */
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
        if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
      }

      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul;
        }

        return val;
      };

      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) {
          checkOffset(offset, byteLength, this.length);
        }

        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 0x100)) {
          val += this[offset + --byteLength] * mul;
        }

        return val;
      };

      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };

      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };

      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };

      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);

        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
      };

      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };

      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul;
        }
        mul *= 0x80;

        if (val >= mul) val -= Math.pow(2, 8 * byteLength);

        return val;
      };

      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 0x100)) {
          val += this[offset + --i] * mul;
        }
        mul *= 0x80;

        if (val >= mul) val -= Math.pow(2, 8 * byteLength);

        return val;
      };

      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 0x80)) return this[offset];
        return (0xff - this[offset] + 1) * -1;
      };

      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 0x8000 ? val | 0xFFFF0000 : val;
      };

      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 0x8000 ? val | 0xFFFF0000 : val;
      };

      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };

      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };

      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };

      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };

      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };

      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };

      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError('Index out of range');
      }

      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }

        var mul = 1;
        var i = 0;
        this[offset] = value & 0xFF;
        while (++i < byteLength && (mul *= 0x100)) {
          this[offset + i] = value / mul & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength = byteLength | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }

        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = value & 0xFF;
        while (--i >= 0 && (mul *= 0x100)) {
          this[offset + i] = value / mul & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
        this[offset] = value & 0xff;
        return offset + 1;
      };

      function objectWriteUInt16(buf, value, offset, littleEndian) {
        if (value < 0) value = 0xffff + value + 1;
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
          buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
        }
      }

      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 0xff;
          this[offset + 1] = value >>> 8;
        } else {
          objectWriteUInt16(this, value, offset, true);
        }
        return offset + 2;
      };

      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 0xff;
        } else {
          objectWriteUInt16(this, value, offset, false);
        }
        return offset + 2;
      };

      function objectWriteUInt32(buf, value, offset, littleEndian) {
        if (value < 0) value = 0xffffffff + value + 1;
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
          buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
        }
      }

      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = value & 0xff;
        } else {
          objectWriteUInt32(this, value, offset, true);
        }
        return offset + 4;
      };

      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 0xff;
        } else {
          objectWriteUInt32(this, value, offset, false);
        }
        return offset + 4;
      };

      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);

          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }

        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value & 0xFF;
        while (++i < byteLength && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);

          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }

        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value & 0xFF;
        while (--i >= 0 && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
        if (value < 0) value = 0xff + value + 1;
        this[offset] = value & 0xff;
        return offset + 1;
      };

      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 0xff;
          this[offset + 1] = value >>> 8;
        } else {
          objectWriteUInt16(this, value, offset, true);
        }
        return offset + 2;
      };

      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 0xff;
        } else {
          objectWriteUInt16(this, value, offset, false);
        }
        return offset + 2;
      };

      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 0xff;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else {
          objectWriteUInt32(this, value, offset, true);
        }
        return offset + 4;
      };

      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
        if (value < 0) value = 0xffffffff + value + 1;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 0xff;
        } else {
          objectWriteUInt32(this, value, offset, false);
        }
        return offset + 4;
      };

      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError('Index out of range');
        if (offset < 0) throw new RangeError('Index out of range');
      }

      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }

      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };

      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }

      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };

      // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;

        // Copy 0 bytes; we're done
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;

        // Fatal error conditions
        if (targetStart < 0) {
          throw new RangeError('targetStart out of bounds');
        }
        if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
        if (end < 0) throw new RangeError('sourceEnd out of bounds');

        // Are we oob?
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }

        var len = end - start;
        var i;

        if (this === target && start < targetStart && targetStart < end) {
          // descending copy from end
          for (i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start];
          }
        } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
          // ascending copy from start
          for (i = 0; i < len; ++i) {
            target[i + targetStart] = this[i + start];
          }
        } else {
          Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
        }

        return len;
      };

      // Usage:
      //    buffer.fill(number[, offset[, end]])
      //    buffer.fill(buffer[, offset[, end]])
      //    buffer.fill(string[, offset[, end]][, encoding])
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        // Handle string cases:
        if (typeof val === 'string') {
          if (typeof start === 'string') {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === 'string') {
            encoding = end;
            end = this.length;
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
              val = code;
            }
          }
          if (encoding !== undefined && typeof encoding !== 'string') {
            throw new TypeError('encoding must be a string');
          }
          if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding);
          }
        } else if (typeof val === 'number') {
          val = val & 255;
        }

        // Invalid ranges are not set to a default, so can range check early.
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError('Out of range index');
        }

        if (end <= start) {
          return this;
        }

        start = start >>> 0;
        end = end === undefined ? this.length : end >>> 0;

        if (!val) val = 0;

        var i;
        if (typeof val === 'number') {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }

        return this;
      };

      // HELPER FUNCTIONS
      // ================

      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

      function base64clean(str) {
        // Node strips out invalid characters like \n and \t from the string, base64-js does not
        str = stringtrim(str).replace(INVALID_BASE64_RE, '');
        // Node converts strings with length < 2 to ''
        if (str.length < 2) return '';
        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
        while (str.length % 4 !== 0) {
          str = str + '=';
        }
        return str;
      }

      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, '');
      }

      function toHex(n) {
        if (n < 16) return '0' + n.toString(16);
        return n.toString(16);
      }

      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];

        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);

          // is surrogate component
          if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
              // no lead yet
              if (codePoint > 0xDBFF) {
                // unexpected trail
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                continue;
              } else if (i + 1 === length) {
                // unpaired lead
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                continue;
              }

              // valid lead
              leadSurrogate = codePoint;

              continue;
            }

            // 2 leads in a row
            if (codePoint < 0xDC00) {
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              leadSurrogate = codePoint;
              continue;
            }

            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
          } else if (leadSurrogate) {
            // valid bmp char, but last char was a lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          }

          leadSurrogate = null;

          // encode utf8
          if (codePoint < 0x80) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
          } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
          } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
          } else {
            throw new Error('Invalid code point');
          }
        }

        return bytes;
      }

      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          // Node's code seems to be doing this and not & 0x7F..
          byteArray.push(str.charCodeAt(i) & 0xFF);
        }
        return byteArray;
      }

      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;

          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }

        return byteArray;
      }

      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }

      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }

      function isnan(val) {
        return val !== val; // eslint-disable-line no-self-compare
      }
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
  }, { "base64-js": 2, "ieee754": 4, "isarray": 5 }], 4: [function (require, module, exports) {
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };

    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    };
  }, {}], 5: [function (require, module, exports) {
    var toString = {}.toString;

    module.exports = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };
  }, {}] }, {}, [1]);
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
    throw new Error("Node's Buffer() not available");
} else if (!self.Jimp && !window.Jimp) {
    throw new Error("Could not Jimp object");
}

(function(){
    
    function fetchImageDataFromUrl(url, cb) {
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
    };
    
    function bufferFromArrayBuffer(arrayBuffer) {
        // Prepare a Buffer object from the arrayBuffer. Necessary in the browser > node conversion,
        // But this function is not useful when running in node directly
        var buffer = new Buffer(arrayBuffer.byteLength);
        var view = new Uint8Array(arrayBuffer);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }

        return buffer;
    }
    
    function isArrayBuffer(test) {
        return Object.prototype.toString.call(test).toLowerCase().indexOf("arraybuffer") > -1;
    }

    // delete the write method
    delete Jimp.prototype.write;
    
    // Override the nodejs implementation of Jimp.read()
    delete Jimp.read;
    Jimp.read = function(src, cb) {
        return new Promise(function(resolve, reject) {
                cb = cb || function(err, image) {
                    if (err) reject(err);
                    else resolve(image);
                };

                if ("string" == typeof src) {
                    // Download via xhr
                    fetchImageDataFromUrl(src,function(arrayBuffer,error){
                        if (arrayBuffer) {
                            if (!isArrayBuffer(arrayBuffer)) {
                                cb(new Error("Unrecognized data received for " + src));
                            } else {
                                new Jimp(bufferFromArrayBuffer(arrayBuffer),cb);
                            }
                        } else if (error) {
                            cb(error);
                        }
                    });
                } else if (isArrayBuffer(src)) {
                    // src is an ArrayBuffer already
                    new Jimp(bufferFromArrayBuffer(src), cb);
                } else {
                    // src is not a string or ArrayBuffer
                    cb(new Error("Jimp expects a single ArrayBuffer or image URL"));
                }
        });
    }
    
})();