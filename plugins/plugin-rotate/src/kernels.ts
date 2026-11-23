import { ResizeStrategy } from "@jimp/plugin-resize";

/**
 * A separable resampling kernel: the weight of a source pixel at a distance
 * from the sample point, and how many pixels it reaches on each side.
 */
export interface Kernel {
  support: number;
  weight: (x: number) => number;
}

function sinc(x: number) {
  if (x === 0) {
    return 1;
  }

  x *= Math.PI;
  return Math.sin(x) / x;
}

function lanczos(a: number): Kernel {
  return {
    support: a,
    weight: (x) => (x > -a && x < a ? sinc(x) * sinc(x / a) : 0),
  };
}

/** Keys' cubic convolution kernel */
function keys(a: number): Kernel {
  return {
    support: 2,
    weight(x) {
      x = Math.abs(x);

      if (x < 1) {
        return (a + 2) * x * x * x - (a + 3) * x * x + 1;
      }

      if (x < 2) {
        return a * x * x * x - 5 * a * x * x + 8 * a * x - 4 * a;
      }

      return 0;
    },
  };
}

/**
 * The kernel for each resize strategy, matching the interpolation that
 * plugin-resize uses when it enlarges an image
 */
export const kernels: Record<
  Exclude<ResizeStrategy, ResizeStrategy.NEAREST_NEIGHBOR>,
  Kernel
> = {
  [ResizeStrategy.BILINEAR]: {
    support: 1,
    weight: (x) => Math.max(0, 1 - Math.abs(x)),
  },
  [ResizeStrategy.BICUBIC]: keys(-1),
  // Catmull-Rom
  [ResizeStrategy.HERMITE]: keys(-0.5),
  [ResizeStrategy.BEZIER]: {
    // a cubic Bezier between each pair of pixels, with control points a
    // quarter of the slope from its neighbours away
    support: 2,
    weight(x) {
      x = Math.abs(x);

      if (x < 1) {
        const t = 1 - x;
        return t * t * t + 3 * t * t * x + 0.75 * t * x * x;
      }

      if (x < 2) {
        const t = x - 1;
        return -0.75 * t * (1 - t) * (1 - t);
      }

      return 0;
    },
  },
  [ResizeStrategy.LANCZOS]: lanczos(3),
  [ResizeStrategy.LANCZOS2]: lanczos(2),
  [ResizeStrategy.MITCHELL]: {
    // Mitchell–Netravali cubic with B = C = 1/3
    support: 2,
    weight(x) {
      const B = 1 / 3;
      const C = 1 / 3;
      x = Math.abs(x);

      if (x < 1) {
        return (
          ((12 - 9 * B - 6 * C) * x * x * x +
            (-18 + 12 * B + 6 * C) * x * x +
            (6 - 2 * B)) /
          6
        );
      }

      if (x < 2) {
        return (
          ((-B - 6 * C) * x * x * x +
            (6 * B + 30 * C) * x * x +
            (-12 * B - 48 * C) * x +
            (8 * B + 24 * C)) /
          6
        );
      }

      return 0;
    },
  },
};
