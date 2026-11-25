/** Playground ops: BlurHash placeholders. See ops/shape.ts for how to add an op. */
import { decodeBlurhash } from "jimp";
import { hexToInt, intToHexLiteral, js, raw } from "../code";
import { defineOp } from "../types";

export default [
  defineOp({
    id: "blurhash",
    label: "blurhash",
    icon: "blur",
    group: "io",
    description:
      "Encode the image as a BlurHash string, then decode it at the image's size to see the placeholder it makes.",
    controls: [
      { type: "slider", key: "componentsX", label: "components x", min: 1, max: 9, step: 1 },
      { type: "slider", key: "componentsY", label: "components y", min: 1, max: 9, step: 1 },
      { type: "slider", key: "punch", min: 0, max: 3, step: 0.1 },
      { type: "color", key: "background" },
    ],
    defaults: { componentsX: 4, componentsY: 3, punch: 1, background: "#ffffff" },
    apply: (image, { componentsX, componentsY, punch, background }, { Jimp }) => {
      // BlurHash has no alpha: transparent pixels are drawn over the background
      image.background = hexToInt(background);

      const hash = image.blurhash({ componentsX, componentsY });
      const pixels = decodeBlurhash(hash, { w: image.width, h: image.height, punch });

      image.bitmap = Jimp.fromBitmap(pixels).bitmap;
    },
    code: ({ componentsX, componentsY, punch, background }) => {
      const options =
        componentsX === 4 && componentsY === 3 ? "" : js({ componentsX, componentsY });

      return [
        `image.background = ${intToHexLiteral(hexToInt(background))};`,
        `const hash = image.blurhash(${options});`,
        "// Decode the hash at the image's size to see the placeholder",
        `image.bitmap = Jimp.fromBitmap(decodeBlurhash(hash, ${js({
          w: raw("image.width"),
          h: raw("image.height"),
          punch: punch === 1 ? undefined : punch,
        })})).bitmap;`,
      ].join("\n");
    },
    imports: () => ({ jimp: ["decodeBlurhash"] }),
  }),
];
