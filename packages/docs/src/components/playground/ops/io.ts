/** Playground ops: loading and saving. See ops/shape.ts for how to add an op. */
import { PNGColorType } from "jimp";
import { hexToInt, intToHexLiteral, js, raw } from "../code";
import { defineOp } from "../types";

const colorTypes = Object.keys(PNGColorType).filter((key) =>
  Number.isNaN(Number(key)),
) as (keyof typeof PNGColorType)[];

/** Formats without an alpha channel are drawn over `image.background` first. */
const usesBackground = (format: string) => format === "image/jpeg" || format === "image/bmp";

export default [
  defineOp({
    id: "encode",
    method: "getBuffer",
    label: "getBuffer",
    icon: "formats",
    group: "io",
    description:
      "Encode the image in a format and decode it again, to see what the format keeps: JPEG quality loss, GIF's 256 colors, lost transparency, ICO's 256 pixel limit.",
    controls: [
      {
        type: "select",
        key: "format",
        options: [
          { value: "image/jpeg", label: "JPEG" },
          { value: "image/png", label: "PNG" },
          { value: "image/gif", label: "GIF" },
          { value: "image/bmp", label: "BMP" },
          { value: "image/x-icon", label: "ICO" },
        ],
      },
      {
        type: "slider",
        key: "quality",
        min: 1,
        max: 100,
        step: 1,
        when: (o) => o.format === "image/jpeg",
      },
      {
        type: "select",
        key: "colorType",
        options: [
          { value: "", label: "default (smallest lossless)" },
          ...colorTypes.map((t) => ({ value: t, label: `PNGColorType.${t}` })),
        ],
        when: (o) => o.format === "image/png",
      },
      {
        type: "toggle",
        key: "setBackground",
        label: "set background",
        when: (o) => usesBackground(o.format),
      },
      {
        type: "color",
        key: "background",
        when: (o) => usesBackground(o.format) && o.setBackground,
      },
    ],
    defaults: {
      format: "image/jpeg",
      quality: 10,
      colorType: "",
      setBackground: false as boolean,
      background: "#ffffff",
    },
    apply: async (image, { format, quality, colorType, setBackground, background }, { Jimp }) => {
      if (usesBackground(format) && setBackground) {
        image.background = hexToInt(background);
      }

      let encoded: Buffer;

      if (format === "image/jpeg") {
        encoded = await image.getBuffer("image/jpeg", { quality });
      } else if (format === "image/png") {
        encoded = await image.getBuffer(
          "image/png",
          colorType ? { colorType: PNGColorType[colorType as keyof typeof PNGColorType] } : undefined,
        );
      } else if (format === "image/gif") {
        encoded = await image.getBuffer("image/gif");
      } else if (format === "image/x-icon") {
        // Images larger than 256 x 256 are scaled down to fit
        encoded = await image.getBuffer("image/x-icon");
      } else {
        encoded = await image.getBuffer("image/bmp");
      }

      image.bitmap = (await Jimp.fromBuffer(encoded)).bitmap;
    },
    code: ({ format, quality, colorType, setBackground, background }) => {
      const options =
        format === "image/jpeg"
          ? { quality }
          : format === "image/png" && colorType
            ? { colorType: raw(`PNGColorType.${colorType}`) }
            : undefined;
      const call = options
        ? `image.getBuffer(${js(format)}, ${js(options)})`
        : `image.getBuffer(${js(format)})`;

      return [
        ...(usesBackground(format) && setBackground
          ? [`image.background = ${intToHexLiteral(hexToInt(background))};`]
          : []),
        "// Encode, then decode the bytes again to see the result",
        `image.bitmap = (await Jimp.fromBuffer(await ${call})).bitmap;`,
      ].join("\n");
    },
    imports: ({ format, colorType }) =>
      format === "image/png" && colorType ? { jimp: ["PNGColorType"] } : {},
    thumbnail: { format: "image/jpeg", quality: 3, setBackground: true, background: "#ffffff" },
  }),
];
