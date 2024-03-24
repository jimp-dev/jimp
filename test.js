const anyBase = require("any-base");

const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";

// an array storing the maximum string length of hashes at various bases
// 0 and 1 do not exist as possible hash lengths
const maxHashLength = [NaN, NaN];

for (let i = 2; i < 65; i++) {
  const maxHash = anyBase(
    anyBase.BIN,
    alphabet.slice(0, i)
  )(new Array(64 + 1).join("1"));
  maxHashLength.push(maxHash.length);
}

console.log(maxHashLength);
// [
//   NaN, NaN, 64, 41, 32, 28, 25, 23, 22, 21, 20, 19,
//    18,  18, 17, 17, 16, 16, 16, 16, 15, 15, 15, 15,
//    14,  14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13,
//    13,  13, 13, 13, 13, 12, 12, 12, 12, 12, 12, 12,
//    12,  12, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11,
//    11,  11, 11, 11, 11
// ]

// refactor the above to not use any-base and still have the same result

const maxHashLength2 = [];

for (let i = 2; i < 65; i++) {
  maxHashLength2.push(Math.ceil(Math.log(i) / Math.log(2)));
}

console.log(maxHashLength2);
