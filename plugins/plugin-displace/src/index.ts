import { JimpClass, JimpClassSchema } from "@jimp/types";
import { clone } from "@jimp/utils";
import { z } from "zod";

const DisplaceOptionsSchema = z.object({
  /** the displacement map, stretched to the size of the image */
  map: JimpClassSchema,
  /**
   * The maximum displacement, in pixels. A number moves pixels along x only,
   * by the map's red channel. `{ x, y }` moves them along x by the red channel
   * and along y by the green channel, like SVG's `feDisplacementMap` with
   * `xChannelSelector="R"` and `yChannelSelector="G"`. A missing axis isn't
   * displaced.
   */
  offset: z.union([
    z.number(),
    z.object({ x: z.number().optional(), y: z.number().optional() }),
  ]),
});

export type DisplaceOptions = z.infer<typeof DisplaceOptionsSchema>;

export const methods = {
  /**
   * Displaces the image based on the provided displacement map. Each pixel,
   * including its alpha, moves right by up to `offset` pixels, depending on
   * the red channel of the map at the same position (0 doesn't move it, 255
   * moves it the most). The map is stretched to the size of the image, so it
   * doesn't have to be the same size.
   *
   * Pass `offset: { x, y }` to move pixels down too: by up to `y` pixels,
   * depending on the green channel of the map. Negative offsets move pixels
   * left or up.
   * @param options the displacement map and offset
   * @param options.map the displacement map
   * @param options.offset the maximum displacement, in pixels: a number for x only, or `{ x, y }`
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   * const map = await Jimp.read("test/map.png");
   *
   * image.displace({ map, offset: 10 });
   *
   * // move pixels right by the red channel and down by the green channel
   * image.displace({ map, offset: { x: 10, y: 10 } });
   * ```
   */
  displace<I extends JimpClass>(image: I, options: DisplaceOptions) {
    const { map, offset } = DisplaceOptionsSchema.parse(options);
    const { x: offsetX = 0, y: offsetY = 0 } =
      typeof offset === "number" ? { x: offset } : offset;
    const source = clone(image);
    const { width, height } = image.bitmap;

    image.scan((x, y, idx) => {
      // The map is stretched to the size of the image
      const mapX = Math.floor((x * map.bitmap.width) / width);
      const mapY = Math.floor((y * map.bitmap.height) / height);
      const mapIdx = (mapY * map.bitmap.width + mapX) << 2;
      const dx = Math.round((map.bitmap.data[mapIdx]! / 256) * offsetX);
      const dy = Math.round((map.bitmap.data[mapIdx + 1]! / 256) * offsetY);

      const ids = image.getPixelIndex(x + dx, y + dy);
      image.bitmap.data[ids] = source.bitmap.data[idx]!;
      image.bitmap.data[ids + 1] = source.bitmap.data[idx + 1]!;
      image.bitmap.data[ids + 2] = source.bitmap.data[idx + 2]!;
      image.bitmap.data[ids + 3] = source.bitmap.data[idx + 3]!;
    });

    return image;
  },
};
