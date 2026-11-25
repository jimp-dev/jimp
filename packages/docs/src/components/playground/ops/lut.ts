/**
 * Playground op: colorGrade, with the Hald CLUT looks in public/lut/ (made by
 * scripts/lut-images.mjs). See ops/shape.ts for how to add an op.
 */
import { js, num } from "../code";
import { defineOp } from "../types";

const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;

/** A cube of colors, for a 3D lookup table. */
const icon = `<path d="M16 3 28 9.5v13L16 29 4 22.5v-13z" fill="#ffb35c" ${S}/><path d="M16 3 28 9.5 16 16 4 9.5z" fill="#5cc8ff" ${S}/><path d="M16 16v13L4 22.5v-13z" fill="#ff5fb0" ${S}/>`;

const looks = ["teal-orange", "faded-film", "bleach-bypass"] as const;

export default [
  defineOp({
    id: "colorGrade",
    label: "colorGrade",
    icon,
    group: "color",
    description:
      "Color grade with a 3D LUT, here a Hald CLUT image. strength blends with the original.",
    controls: [
      {
        type: "select",
        key: "look",
        options: looks.map((look) => ({ value: look, label: `lut/${look}.png` })),
      },
      { type: "slider", key: "strength", min: 0, max: 1, step: 0.05 },
    ],
    defaults: { look: "teal-orange", strength: 1 },
    apply: async (image, { look, strength }, ctx) => {
      image.colorGrade(await ctx.loadImage(`lut/${look}.png`), { strength });
    },
    code: ({ look, strength }) => {
      const hald = `await Jimp.read(${js(`lut/${look}.png`)})`;

      return num(strength) === 1
        ? `image.colorGrade(${hald});`
        : `image.colorGrade(${hald}, ${js({ strength })});`;
    },
  }),
];
