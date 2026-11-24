import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import ts from "typescript";

// types.test-d.ts checks the source. Users get the emitted .d.ts, where tsc
// repeats the Jimp class type in several places, so this emits it and
// type checks a strict consumer against it.

const packageDir = path.join(__dirname, "..");

const consumer = `
import { Jimp, JimpInstance } from "./index.js";

type IsAny<T> = 0 extends 1 & T ? true : false;
type ReadResult = Awaited<ReturnType<typeof Jimp.read>>;

declare const buffer: Parameters<typeof Jimp.fromBuffer>[0];

export async function check() {
  let constructed: JimpInstance = new Jimp({ width: 1, height: 1 });
  let read = await Jimp.read("image.png");
  let fromBuffer = await Jimp.fromBuffer(buffer);
  let fromBitmap = Jimp.fromBitmap({ width: 1, height: 1, data: [0] });
  let cropped = read.crop({ x: 0, y: 0, w: 1, h: 1 });
  let cloned = read.clone();
  let chained = read
    .scan(() => {})
    .resize({ w: 1 })
    .setPixelColor(0, 0, 0)
    .composite(read)
    .greyscale();

  constructed = read;
  constructed = fromBuffer;
  constructed = fromBitmap;
  constructed = cropped;
  constructed = cloned;
  constructed = chained;
  read = constructed;
  fromBuffer = constructed;
  fromBitmap = constructed;
  cropped = constructed;
  cloned = constructed;
  chained = constructed;

  const imageData = new ImageData(1, 1);
  constructed = Jimp.fromBitmap(imageData);
  constructed = new Jimp(imageData);
  constructed = new Jimp({ width: 1, height: 1, data: new Uint8ClampedArray(4) });
  const pixels: Buffer = constructed.bitmap.data;
  void pixels;

  const takesRead = (image: ReadResult) => image;
  takesRead(new Jimp({ width: 1, height: 1 }));
  takesRead(chained);

  const notAny: [
    false, false, false, false, false, false, false, false
  ] = [
    false as IsAny<typeof read>,
    false as IsAny<typeof fromBuffer>,
    false as IsAny<typeof fromBitmap>,
    false as IsAny<typeof cropped>,
    false as IsAny<typeof cloned>,
    false as IsAny<typeof chained>,
    false as IsAny<ReturnType<JimpInstance["scan"]>>,
    false as IsAny<ReturnType<JimpInstance["setPixelColor"]>>,
  ];

  for (const pixel of read.scanIterator()) {
    const image: JimpInstance = pixel.image;
    const pixelNotAny: false = false as IsAny<typeof pixel.image>;
    void image;
    void pixelNotAny;
  }

  // @ts-expect-error unknown methods are rejected
  fromBitmap.notAMethod();
  // @ts-expect-error unknown methods are rejected after chaining
  read.scan(() => {}).notAMethod();
  // @ts-expect-error png has no quality option
  await read.write("out.png", { quality: 50 });
  // @ts-expect-error unsupported mime type
  await read.getBuffer("image/webp");

  await read.write("out.jpeg", { quality: 50 });

  const { frames, loop } = await Jimp.readFrames("animation.gif", { maxFrames: 2 });
  const frame: JimpInstance = frames[0]!.image;
  const frameNotAny: false = false as IsAny<typeof frame>;
  void frameNotAny;
  constructed = frame;
  await Jimp.writeFrames("out.gif", [frame, { image: read, delay: 100 }], { loop });
  // @ts-expect-error TIFF frames have no options
  await Jimp.encodeFrames("image/tiff", frames, { loop: 0 });

  return notAny;
}
`;

let outDir: string;

beforeAll(() => {
  outDir = mkdtempSync(path.join(packageDir, ".declaration-test-"));
});

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});

function format(diagnostics: readonly ts.Diagnostic[]) {
  return ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => packageDir,
    getNewLine: () => "\n",
  });
}

describe("emitted declarations", () => {
  test(
    "images from every API are interchangeable for consumers",
    { timeout: 120_000 },
    () => {
      const configFile = ts.readConfigFile(
        path.join(packageDir, "tsconfig.json"),
        ts.sys.readFile,
      );
      const { options } = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        packageDir,
      );

      const emit = ts
        .createProgram([path.join(packageDir, "src/index.ts")], {
          ...options,
          rootDir: path.join(packageDir, "src"),
          outDir,
          declaration: true,
          emitDeclarationOnly: true,
          declarationMap: false,
          sourceMap: false,
          noEmit: false,
        })
        .emit();

      expect(format(emit.diagnostics)).toBe("");

      const declarations = readFileSync(
        path.join(outDir, "index.d.ts"),
        "utf8",
      );
      expect(declarations).not.toContain("InstanceType<any>");

      const consumerPath = path.join(outDir, "consumer.ts");
      writeFileSync(consumerPath, consumer);

      const program = ts.createProgram([consumerPath], {
        strict: true,
        exactOptionalPropertyTypes: true,
        noUncheckedIndexedAccess: true,
        skipLibCheck: false,
        noEmit: true,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        target: ts.ScriptTarget.ES2022,
      });

      expect(format(ts.getPreEmitDiagnostics(program))).toBe("");
    },
  );
});
