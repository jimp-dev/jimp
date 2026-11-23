/** Playground ops: morphology (erode, dilate, open, close). See ops/shape.ts for how to add an op. */
import { js } from "../code";
import { defineOp } from "../types";

type Method = "erode" | "dilate" | "open" | "close";
type Shape = "square" | "disk";

const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
const DASH = `fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="2 3" stroke-linecap="round"`;

/** A shape shrunk inside its old outline. */
const erodeIcon = `<rect x="3" y="3" width="26" height="26" rx="7" ${DASH}/><rect x="9" y="9" width="14" height="14" rx="4" fill="#ffd83a" ${S}/>`;
/** A shape grown past its old outline. */
const dilateIcon = `<rect x="3" y="3" width="26" height="26" rx="7" fill="#ffd83a" ${S}/><rect x="10" y="10" width="12" height="12" rx="3" ${DASH}/>`;
/** A shape kept, with the specks around it removed. */
const openIcon = `<circle cx="13" cy="17" r="9" fill="#ffd83a" ${S}/><circle cx="26" cy="6" r="2.5" ${DASH}/><circle cx="27" cy="16" r="2" ${DASH}/><circle cx="24" cy="26" r="2.5" ${DASH}/>`;
/** A shape with a small hole filled in. */
const closeIcon = `<rect x="4" y="4" width="24" height="24" rx="7" fill="#ffd83a" ${S}/><circle cx="16" cy="16" r="4.5" ${DASH}/>`;

const descriptions: Record<Method, string> = {
  erode:
    "Set each pixel to the darkest value around it, per channel. Dark areas grow and bright details smaller than the radius disappear.",
  dilate:
    "Set each pixel to the brightest value around it, per channel. Bright areas grow and dark details smaller than the radius disappear.",
  open: "Erode, then dilate. Removes bright specks smaller than the radius and keeps the size of larger bright shapes.",
  close:
    "Dilate, then erode. Fills dark holes and gaps smaller than the radius and keeps the size of larger shapes.",
};

const icons: Record<Method, string> = {
  erode: erodeIcon,
  dilate: dilateIcon,
  open: openIcon,
  close: closeIcon,
};

/** Sticker options, tuned for the 180 px wide thumbnail of the dice. */
const thumbnails: Record<Method, { radius: number }> = {
  erode: { radius: 2 },
  dilate: { radius: 3 },
  open: { radius: 3 },
  close: { radius: 3 },
};

function morphOp(method: Method) {
  return defineOp({
    id: method,
    label: method,
    icon: icons[method],
    group: "effects",
    description: descriptions[method],
    controls: [
      { type: "slider", key: "radius", min: 1, max: 20, step: 1, unit: "px" },
      {
        type: "select",
        key: "shape",
        options: [{ value: "square", label: "square (default)" }, { value: "disk", label: "disk" }],
      },
    ],
    defaults: { radius: 4, shape: "disk" },
    apply: (image, { radius, shape }) => {
      image[method]({ radius, shape: shape as Shape });
    },
    code: ({ radius, shape }) =>
      `image.${method}(${js({ radius, shape: shape === "square" ? undefined : shape })});`,
    thumbnail: thumbnails[method],
  });
}

export default [morphOp("erode"), morphOp("dilate"), morphOp("open"), morphOp("close")];
