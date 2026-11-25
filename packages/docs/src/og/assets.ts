/**
 * What the Open Graph images are drawn with: the fonts, the wallpaper and
 * Jimpy. Loaded once per build and shared by every image.
 */
import { Jimp, type JimpInstance } from "jimp";
import { loadTTF, type VectorFont } from "jimp/load-ttf";
import { fillPath, strokePath } from "@jimp/plugin-draw";
import path from "node:path";

import { drawJimpy } from "./jimpy";
import { HEIGHT, WIDTH } from "./size";

export { HEIGHT, WIDTH };

export interface OgAssets {
  medium: VectorFont;
  bold: VectorFont;
  mono: VectorFont;
  /** the site's yellow wall, dots and doodles, the size of the image */
  wall: JimpInstance;
  /** the JIMP wordmark, from the hand-drawn share banner */
  logo: JimpInstance;
  /** Jimpy on a paint splash, in the middle of a square */
  jimpy: JimpInstance;
}

// Astro bundles this file, so find files from the package, not from here
const file = (...parts: string[]) => path.join(process.cwd(), ...parts);

/**
 * The doodles from `--jp-wall-doodles` in src/styles/tokens.css, a 260px tile
 * of SVG paths stroked 6px wide with round ends
 */
const DOODLES: {
  d: string;
  color: string;
  fill?: boolean;
  transform?: number[];
}[] = [
  { d: "M20 40q15-20 30 0t30 0 30 0", color: "#ff4b4b" },
  { d: "M150 30l20 35h-40z", color: "#3a7bff" },
  { d: "M199 60a16 16 0 1 0 32 0a16 16 0 1 0 -32 0z", color: "#22c76b" },
  { d: "M30 150l12 12 12-12 12 12 12-12 12 12", color: "#ff8f1f" },
  {
    d: "M180 140l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z",
    color: "#8b46ff",
  },
  { d: "M120 120q10 25-10 40", color: "#ff5fb0" },
  {
    // rect x=60 y=205 26x26 rx=4, rotate(18 73 218)
    d: "M64 205h18a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4h-18a4 4 0 0 1-4-4v-18a4 4 0 0 1 4-4z",
    color: "#5cc8ff",
    transform: rotateAbout(18, 73, 218),
  },
  { d: "M160 215q20-25 40 0", color: "#22c76b" },
  {
    d: "M230 235a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z",
    color: "#ff4b4b",
    fill: true,
  },
  {
    d: "M105 95a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z",
    color: "#3a7bff",
    fill: true,
  },
];

/** SVG's rotate(angle cx cy), as a matrix [a, b, c, d, e, f] */
function rotateAbout(degrees: number, cx: number, cy: number) {
  const a = (degrees * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);

  return [
    cos,
    sin,
    -sin,
    cos,
    cx - cos * cx + sin * cy,
    cy - sin * cx - cos * cy,
  ];
}

/** The page background: `--jp-wall`, a 40px grid of dots and the doodles */
function drawWall() {
  const wall = new Jimp({ width: WIDTH, height: HEIGHT, color: "#ffe14f" });

  for (let y = 10; y < HEIGHT; y += 40) {
    for (let x = 10; x < WIDTH; x += 40) {
      wall.drawEllipse({ cx: x, cy: y, rx: 6.5, ry: 6.5, fill: "#ffd23a" });
    }
  }

  for (let ty = 0; ty < HEIGHT; ty += 260) {
    for (let tx = 0; tx < WIDTH; tx += 260) {
      for (const {
        d,
        color,
        fill,
        transform = [1, 0, 0, 1, 0, 0],
      } of DOODLES) {
        const [a, b, c, dd, e, f] = transform as [
          number,
          number,
          number,
          number,
          number,
          number,
        ];
        const placed = [a, b, c, dd, e + tx, f + ty] as [
          number,
          number,
          number,
          number,
          number,
          number,
        ];

        if (fill) {
          fillPath(wall, d, color, { transform: placed });
        } else {
          strokePath(wall, d, color, {
            width: 6,
            cap: "round",
            join: "round",
            transform: placed,
          });
        }
      }
    }
  }

  return wall;
}

/** The size Jimpy is drawn at, on the images */
export const JIMPY_SIZE = 330;

let assets: Promise<OgAssets> | undefined;

export function loadAssets() {
  assets ??= (async () => {
    const [medium, bold, mono, banner] = await Promise.all([
      loadTTF(file("src/og/fonts/Fredoka-Medium.ttf")),
      loadTTF(file("src/og/fonts/Fredoka-Bold.ttf")),
      loadTTF(file("src/og/fonts/JetBrainsMono-Bold.ttf")),
      Jimp.read(file("public/share-banner.png")),
    ]);

    return {
      medium,
      bold,
      mono,
      wall: drawWall(),
      // Found by trimming the white around it on the banner's card
      logo: banner.clone().crop({ x: 150, y: 122, w: 361, h: 130 }),
      jimpy: drawJimpy(JIMPY_SIZE),
    };
  })();

  return assets;
}
