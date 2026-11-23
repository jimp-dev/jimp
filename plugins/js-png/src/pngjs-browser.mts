// pngjs's main entry imports Node's stream, zlib and util. Its browser build
// bundles those, so browser builds don't need Node polyfills for them.
export { PNG } from "pngjs/browser.js";
