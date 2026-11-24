/** Packages to keep on their current major version */
const sameMajor = [
  // Keep in sync with the minimum supported Node.js version (engines.node)
  "@types/node",
  // scripts/check-browser-bundle.mjs checks the bundle against Babel 7, which
  // many apps still use, and whose preset-env transforms the most syntax
  "@babel/core",
  "@babel/preset-env",
];

module.exports = {
  reject: [
    // These deps are esm only, and @jimp/core and @jimp/diff import them in
    // their CommonJS builds too
    "pixelmatch",
    "@types/pixelmatch",
    "mime",
    "@types/mime",
  ],
  target: (name) => (sameMajor.includes(name) ? "minor" : "latest"),
};
