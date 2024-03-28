import { JimpClass } from "@jimp/types";
import { composite } from "@jimp/core";
import { clone } from "@jimp/utils";
import { methods as resizeMethods } from "@jimp/plugin-resize";
import { methods as blurMethods } from "@jimp/plugin-blur";
import { methods as colorMethods } from "@jimp/plugin-color";

interface ShadowOptions {
  /** opacity of the shadow between 0 and 1 */
  opacity?: number;
  /** size of the shadow */
  size?: number;
  /** how blurry the shadow is */
  blur?: number;
  /** x position of shadow */
  x?: number;
  /** y position of shadow */
  y?: number;
}

export const methods = {
  /**
   *  Adds a shadow to the image
   */
  shadow<I extends JimpClass>(image: I, options: ShadowOptions = {}) {
    const {
      opacity: opacityAmount = 0.7,
      size = 1.1,
      x = -25,
      y = 25,
      blur: blurAmount = 5,
    } = options;

    // clone the image
    const orig = clone(image);
    let shadow = clone(image);
    // enlarge it. This creates a "shadow".
    shadow = resizeMethods.resize(
      shadow,
      image.bitmap.width * size,
      image.bitmap.height * size
    );
    shadow = blurMethods.blur(shadow, blurAmount);
    shadow = colorMethods.opacity(shadow, opacityAmount);

    const blankImage = new (image.constructor as any)({
      width: image.bitmap.width,
      height: image.bitmap.height,
      color: 0x00000000,
    });

    // Then blit the "shadow" onto the background and the image on top of that.
    let result = composite(blankImage, orig, 0, 0);
    result = composite(result, shadow, x, y);

    return result;
  },
};
