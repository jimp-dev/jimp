import type { Lut } from "./lut.js";

/** The largest LUT_3D_SIZE the .cube spec allows */
export const MAX_CUBE_SIZE = 256;

/** A decimal number, like 0.5, -1, .25 or 1e-3 */
const NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

function cubeError(line: number, message: string) {
  return new Error(`Invalid .cube LUT, line ${line}: ${message}`);
}

/** Parse the numbers after a keyword, or of a data line */
function parseNumbers(
  values: string[],
  count: number,
  line: number,
  what: string,
) {
  if (values.length !== count) {
    throw cubeError(
      line,
      `${what} needs ${count} number${count === 1 ? "" : "s"}, got ${values.length}`,
    );
  }

  return values.map((value) => {
    if (!NUMBER.test(value)) {
      throw cubeError(line, `"${value}" isn't a number`);
    }

    return Number(value);
  });
}

/**
 * Parses a 3D LUT in the `.cube` format from Adobe and DaVinci Resolve, for
 * `image.lut`.
 *
 * - Reads `LUT_3D_SIZE`, `TITLE`, `DOMAIN_MIN` and `DOMAIN_MAX`, and
 *   Resolve's `LUT_3D_INPUT_RANGE`. Other keywords, such as
 *   `LUT_IN_VIDEO_RANGE`, are ignored.
 * - Lines starting with `#` are comments, and blank lines are skipped.
 * - The data is `LUT_3D_SIZE`³ lines of red, green and blue outputs, with
 *   red changing fastest. Outputs outside 0 to 1 are allowed, and clamped
 *   when the LUT is applied.
 *
 * Throws an error that names the line for 1D LUTs (`LUT_1D_SIZE`), a missing
 * or out-of-range `LUT_3D_SIZE`, lines that aren't numbers, and the wrong
 * number of data lines.
 * @param text the contents of a `.cube` file
 * @returns a LUT for `image.lut`. It's plain data, so it can be sent to a
 * worker or kept and reused for many images.
 * @example
 * ```ts
 * import { readFile } from "node:fs/promises";
 * import { Jimp, parseCubeLut } from "jimp";
 *
 * const lut = parseCubeLut(await readFile("film.cube", "utf8"));
 * const image = await Jimp.read("test/image.jpg");
 *
 * image.lut(lut);
 * ```
 */
export function parseCubeLut(text: string): Lut {
  if (typeof text !== "string") {
    throw new Error("parseCubeLut needs the text of a .cube file");
  }

  const lines = text.replace(/^\uFEFF/, "").split(/\r\n|\r|\n/);
  let title: string | undefined;
  let size: number | undefined;
  let domainMin: [number, number, number] = [0, 0, 0];
  let domainMax: [number, number, number] = [1, 1, 1];
  let data: Float32Array | undefined;
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i]!.trim();

    if (line === "" || line.startsWith("#")) {
      continue;
    }

    if (/^[A-Za-z]/.test(line)) {
      if (data) {
        throw cubeError(
          lineNumber,
          "keywords must come before the LUT data, found more after it",
        );
      }

      const [keyword, ...values] = line.split(/\s+/);

      switch (keyword) {
        case "TITLE": {
          const match = /^TITLE\s+"(.*)"\s*$/.exec(line);

          if (!match) {
            throw cubeError(
              lineNumber,
              'TITLE must be in quotes, like TITLE "Film"',
            );
          }

          title = match[1];
          break;
        }

        case "LUT_1D_SIZE":
        case "LUT_1D_INPUT_RANGE":
          throw cubeError(
            lineNumber,
            `${keyword} is for 1D LUTs, which aren't supported. Only 3D LUTs (LUT_3D_SIZE) can be applied.`,
          );

        case "LUT_3D_SIZE": {
          if (size !== undefined) {
            throw cubeError(lineNumber, "LUT_3D_SIZE is given more than once");
          }

          const [value] = parseNumbers(values, 1, lineNumber, keyword);

          if (
            !Number.isInteger(value) ||
            value! < 2 ||
            value! > MAX_CUBE_SIZE
          ) {
            throw cubeError(
              lineNumber,
              `LUT_3D_SIZE must be a whole number from 2 to ${MAX_CUBE_SIZE}, got ${values[0]}`,
            );
          }

          size = value!;
          break;
        }

        case "DOMAIN_MIN":
          domainMin = parseNumbers(values, 3, lineNumber, keyword) as [
            number,
            number,
            number,
          ];
          break;

        case "DOMAIN_MAX":
          domainMax = parseNumbers(values, 3, lineNumber, keyword) as [
            number,
            number,
            number,
          ];
          break;

        case "LUT_3D_INPUT_RANGE": {
          const [min, max] = parseNumbers(values, 2, lineNumber, keyword);

          domainMin = [min!, min!, min!];
          domainMax = [max!, max!, max!];
          break;
        }

        default:
          // Unknown keywords are skipped, like other .cube readers do
          break;
      }

      continue;
    }

    if (size === undefined) {
      throw cubeError(lineNumber, "LUT_3D_SIZE must come before the LUT data");
    }

    data ??= new Float32Array(size ** 3 * 3);

    if (count === size ** 3) {
      throw cubeError(
        lineNumber,
        `too many data lines: LUT_3D_SIZE ${size} needs ${size ** 3}`,
      );
    }

    const rgb = parseNumbers(line.split(/\s+/), 3, lineNumber, "A data line");

    data[count * 3] = rgb[0]!;
    data[count * 3 + 1] = rgb[1]!;
    data[count * 3 + 2] = rgb[2]!;
    count++;
  }

  if (size === undefined) {
    throw new Error("Invalid .cube LUT: it has no LUT_3D_SIZE");
  }

  if (count !== size ** 3) {
    throw new Error(
      `Invalid .cube LUT: LUT_3D_SIZE ${size} needs ${size ** 3} data lines, found ${count}`,
    );
  }

  for (let c = 0; c < 3; c++) {
    if (!(domainMin[c]! < domainMax[c]!)) {
      throw new Error(
        `Invalid .cube LUT: DOMAIN_MIN must be less than DOMAIN_MAX in each channel, got ${domainMin.join(" ")} and ${domainMax.join(" ")}`,
      );
    }
  }

  return {
    ...(title === undefined ? {} : { title }),
    size,
    domainMin,
    domainMax,
    data: data!,
  };
}
