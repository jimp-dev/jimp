// Only jpeg-js's decoder is used, so import it on its own to leave its
// encoder out of bundles.
declare module "jpeg-js/lib/decoder.js" {
  import { decode } from "jpeg-js";

  export default decode;
}
