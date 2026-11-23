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
  shadow<I extends JimpClass>(image: I, options: ShadowOptions = {}): I {
    const {
      opacity: opacityAmount = 0.7,
      size = 1.1,
      x = -25,
      y = 25,
      blur: blurAmount = 5,
    } = ShadowOptionsSchema.parse(options);

    // clone the image
    let shadow = clone(image);
    // turn all its pixels black, keeping their alpha, so the shadow is the
    // image's silhouette rather than a copy of its colors
    shadow.scan((_, __, idx) => {
      shadow.bitmap.data[idx + 0] = 0x00;
      shadow.bitmap.data[idx + 1] = 0x00;
      shadow.bitmap.data[idx + 2] = 0x00;
    });
    // enlarge it. This creates a "shadow".
    shadow = resizeMethods.resize(shadow, {
      w: image.bitmap.width * size,
      h: image.bitmap.height * size,
    });
    shadow = blurMethods.blur(shadow, blurAmount);
    shadow = colorMethods.opacity(shadow, opacityAmount);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blankImage: I = new (image.constructor as any)({
      width: image.bitmap.width,
      height: image.bitmap.height,
      color: 0x00000000,
    });
    // So the image is drawn onto it without converting its colours
    blankImage.iccProfile = image.iccProfile;

    // Then blit the "shadow" onto the background and the image on top of that.
    let result = composite(blankImage, shadow, x, y);
    result = composite(result, image, 0, 0);

    return result;
  },
};
