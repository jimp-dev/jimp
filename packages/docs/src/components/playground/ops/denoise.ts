/** Playground ops: noise reduction. See ops/shape.ts for how to add an op. */
import { js } from "../code";
import { defineOp } from "../types";

const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`;

/** Three sorted bars with the middle one picked out. */
const medianIcon = `<path d="M3 28h26" ${S}/><g ${S}><rect x="5" y="20" width="6" height="8" fill="#fff"/><rect x="13" y="13" width="6" height="15" fill="#3fe0b5"/><rect x="21" y="5" width="6" height="23" fill="#fff"/></g><path d="M16 3v6" ${S}/>`;
/** Grain on one side of an edge, smoothed on the other. */
const bilateralIcon = `<rect x="4" y="6" width="24" height="20" rx="3" fill="#ffd83a" ${S}/><path d="M16 6h9a3 3 0 013 3v14a3 3 0 01-3 3h-9z" fill="${INK}"/><g fill="${INK}"><circle cx="8" cy="11" r="1.1"/><circle cx="12" cy="15" r="1.1"/><circle cx="8" cy="20" r="1.1"/><circle cx="12" cy="22" r="1.1"/></g><path d="M16 6v20" ${S}/>`;

const BILATERAL_DEFAULTS = { radius: 2, tolerance: 30 };

export default [
  defineOp({
    id: "median",
    label: "median",
    icon: medianIcon,
    group: "effects",
    description:
      "Replace each pixel with the median of the square around it. Removes specks and salt-and-pepper noise and keeps edges sharp.",
    controls: [{ type: "slider", key: "radius", min: 1, max: 10, step: 1, unit: "px" }],
    defaults: { radius: 1 },
    apply: (image, { radius }) => {
      image.median(radius);
    },
    code: ({ radius }) => `image.median(${js(radius)});`,
    thumbnail: false,
  }),

  defineOp({
    id: "bilateral",
    label: "bilateral",
    icon: bilateralIcon,
    group: "effects",
    description:
      "Smooth grain and JPEG noise but keep edges, by averaging only neighbors with a similar color.",
    controls: [
      { type: "slider", key: "radius", min: 0.5, max: 5, step: 0.5, unit: "px" },
      { type: "slider", key: "tolerance", min: 1, max: 120, step: 1 },
    ],
    defaults: BILATERAL_DEFAULTS,
    apply: (image, { radius, tolerance }) => {
      image.bilateral({ radius, tolerance });
    },
    code: ({ radius, tolerance }) => {
      const options = js({
        radius: radius === BILATERAL_DEFAULTS.radius ? undefined : radius,
        tolerance: tolerance === BILATERAL_DEFAULTS.tolerance ? undefined : tolerance,
      });
      return `image.bilateral(${options === "{}" ? "" : options});`;
    },
    thumbnail: false,
  }),
];
