// Node.js: PNG is a classic Stream, like in pngjs, so `.pipe()` works with
// Node streams. Browsers use stream-base-browser.mts instead.
export { Stream as StreamBase } from "node:stream";
