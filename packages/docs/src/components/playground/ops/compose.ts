/**
 * Compositing ops: composite, blit, mask. See ops/shape.ts for how to add an
 * op.
 *
 * The second images live in public/: sticker.png (a 120×120 star with a
 * transparent background) and spotlight.png (a 720×540 white spot fading to
 * black, twice the playground's size so it covers the image wherever it's
 * centered).
 */
import { BlendMode } from "jimp";
import { centeredRect, js, num, raw } from "../code";
import { defineOp, type ImageSize } from "../types";

const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;

const compositeIcon = `<rect x="3" y="9" width="20" height="20" rx="3" fill="#5cc8ff" ${S}/><path d="M21 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="#ffb35c" ${S}/>`;
const blitIcon = `<rect x="3" y="3" width="12" height="12" rx="1.5" fill="#fff" ${S} stroke-dasharray="2.5 2.5"/><rect x="17" y="17" width="12" height="12" rx="1.5" fill="#ffb35c" ${S}/><path d="M12 12l8 8M20 14v6h-6" fill="none" ${S}/>`;
const maskIcon = `<defs><radialGradient id="jp-mask-spot"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="${INK}"/></radialGradient></defs><rect x="3" y="3" width="26" height="26" rx="3" fill="url(#jp-mask-spot)" ${S}/>`;

const STICKER = "sticker.png";
const STICKER_SIZE = 120;
const SPOTLIGHT = "spotlight.png";
const SPOTLIGHT_W = 720;
const SPOTLIGHT_H = 540;

type ModeName = keyof typeof BlendMode;
const modeNames = Object.keys(BlendMode) as ModeName[];

export default [
  defineOp({
    id: "composite",
    label: "composite",
    icon: compositeIcon,
    group: "compose",
    description:
      "Draw sticker.png on top with a blend mode and opacity. Click the image to move the sticker.",
    controls: [
      { type: "xy", key: "at", label: "sticker center" },
      {
        type: "select",
        key: "mode",
        options: modeNames.map((name) => ({
          value: name,
          label: `BlendMode.${name}${name === "SRC_OVER" ? " (default)" : ""}`,
        })),
      },
      { type: "slider", key: "opacitySource", min: 0, max: 1, step: 0.05 },
      { type: "slider", key: "opacityDest", min: 0, max: 1, step: 0.05 },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      at: { x: Math.round(width / 2), y: Math.round(height / 2) },
      mode: "SRC_OVER",
      opacitySource: 1,
      opacityDest: 1,
    }),
    apply: async (image, { at, mode, opacitySource, opacityDest }, ctx) => {
      const sticker = await ctx.loadImage(STICKER);
      image.composite(sticker, at.x - STICKER_SIZE / 2, at.y - STICKER_SIZE / 2, {
        mode: BlendMode[mode as ModeName],
        opacitySource,
        opacityDest,
      });
    },
    code: ({ at, mode, opacitySource, opacityDest }) => {
      const options = js({
        mode: mode === "SRC_OVER" ? undefined : raw(`BlendMode.${mode}`),
        opacitySource: opacitySource === 1 ? undefined : num(opacitySource),
        opacityDest: opacityDest === 1 ? undefined : num(opacityDest),
      });
      const args = [
        `await Jimp.read(${js(STICKER)})`,
        js(at.x - STICKER_SIZE / 2),
        js(at.y - STICKER_SIZE / 2),
        ...(options === "{}" ? [] : [options]),
      ];
      return `image.composite(${args.join(", ")});`;
    },
    imports: ({ mode }) => (mode === "SRC_OVER" ? {} : { jimp: ["BlendMode"] }),
  }),

  defineOp({
    id: "blit",
    label: "blit",
    icon: blitIcon,
    group: "compose",
    description:
      "Copy pixels onto the image at x, y. Copy a region of the image itself (drag to pick it, click to place it), or sticker.png.",
    controls: [
      {
        type: "select",
        key: "source",
        options: [
          { value: "self", label: "image.clone()" },
          { value: "sticker", label: "sticker.png" },
        ],
      },
      { type: "rect", key: "region", label: "source region", when: (o) => o.source === "self" },
      { type: "xy", key: "at", label: "x, y" },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      source: "self",
      region: centeredRect(width, height, 0.3),
      at: { x: Math.round(width * 0.04), y: Math.round(height * 0.05) },
    }),
    apply: async (image, { source, region, at }, ctx) => {
      if (source === "sticker") {
        image.blit({ src: await ctx.loadImage(STICKER), x: at.x, y: at.y });
      } else {
        image.blit({
          src: image.clone(),
          x: at.x,
          y: at.y,
          srcX: region.x,
          srcY: region.y,
          srcW: region.w,
          srcH: region.h,
        });
      }
    },
    code: ({ source, region, at }) =>
      source === "sticker"
        ? `image.blit({ src: await Jimp.read(${js(STICKER)}), x: ${js(at.x)}, y: ${js(at.y)} });`
        : `image.blit(${js({
            src: raw("image.clone()"),
            x: at.x,
            y: at.y,
            srcX: region.x,
            srcY: region.y,
            srcW: region.w,
            srcH: region.h,
          })});`,
  }),

  defineOp({
    id: "mask",
    label: "mask",
    icon: maskIcon,
    group: "compose",
    description:
      "Use spotlight.png's brightness as the image's alpha: white keeps a pixel, black hides it. Click to move the spot.",
    controls: [{ type: "xy", key: "at", label: "spot center" }],
    defaults: ({ width, height }: ImageSize) => ({
      at: { x: Math.round(width / 2), y: Math.round(height / 2) },
    }),
    apply: async (image, { at }, ctx) => {
      const spotlight = await ctx.loadImage(SPOTLIGHT);
      image.mask({ src: spotlight, x: at.x - SPOTLIGHT_W / 2, y: at.y - SPOTLIGHT_H / 2 });
    },
    code: ({ at }) =>
      `image.mask(${js({
        src: raw(`await Jimp.read(${js(SPOTLIGHT)})`),
        x: at.x - SPOTLIGHT_W / 2,
        y: at.y - SPOTLIGHT_H / 2,
      })});`,
  }),
];
