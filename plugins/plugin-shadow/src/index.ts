import { JimpClass } from "@jimp/types";
import { composite } from "@jimp/core";
import { clone } from "@jimp/utils";
import { methods as resizeMethods } from "@jimp/plugin-resize";
import { methods as blurMethods } from "@jimp/plugin-blur";
import { methods as colorMethods } from "@jimp/plugin-color";
import { z } from "zod";

const ShadowOptionsSchema = z.object({
  /** opacity of the shadow between 0 and 1 */
  opacity: z.number().min(0).max(1).optional(),
  /** size of the shadow */
  size: z.number().optional(),
  /** how blurry the shadow is */
  blur: z.number().optional(),
  /** x position of shadow */
  x: z.number().optional(),
  /** y position of shadow */
  y: z.number().optional(),
});

export type ShadowOptions = z.infer<typeof ShadowOptionsSchema>;

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
    } = ShadowOptionsSchema.parse(options);

    // clone the image
    const orig = clone(image);
    let shadow = clone(image);
    // enlarge it. This creates a "shadow".
    shadow = resizeMethods.resize(shadow, {
      w: image.bitmap.width * size,
      h: image.bitmap.height * size,
    });
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
