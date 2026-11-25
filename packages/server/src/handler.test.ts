import { describe, expect, test, vi } from "vitest";
import { createJimp } from "@jimp/core";
import webp from "@jimp/wasm-webp";
import avif from "@jimp/wasm-avif";
import { Jimp, defaultFormats, defaultPlugins, intToRGBA } from "jimp";

import {
  createImageHandler,
  encodeEdits,
  ImageHandlerError,
  signUrl,
  type ImageHandlerOptions,
  type ImageSource,
} from "./index.js";

const WasmJimp = createJimp({
  formats: [...defaultFormats, webp, avif],
  plugins: defaultPlugins,
});

/** 200x100, red on the left half and blue on the right */
const halves = new Jimp({ width: 200, height: 100, color: 0xff0000ff });
halves.scan(100, 0, 100, 100, (_, __, idx) => {
  halves.bitmap.data.writeUInt32BE(0x0000ffff, idx);
});

const files: Record<string, Uint8Array> = {
  "halves.png": await halves.getBuffer("image/png"),
  "photo.jpg": await halves.getBuffer("image/jpeg"),
  "transparent.png": await new Jimp({
    width: 10,
    height: 10,
    color: 0x00000000,
  }).getBuffer("image/png"),
  "photo.webp": await new WasmJimp({
    width: 20,
    height: 10,
    color: 0x00ff00ff,
  }).getBuffer("image/webp"),
  "nested/dir/cat.png": await halves.getBuffer("image/png"),
  "notes.txt": new TextEncoder().encode("not an image"),
  "corrupt.png": (await halves.getBuffer("image/png")).subarray(0, 60),
};

const memorySource: ImageSource = (path) => files[path] ?? null;

function createHandler(options: Partial<ImageHandlerOptions> = {}) {
  return createImageHandler({
    Jimp,
    source: memorySource,
    basePath: "/images",
    ...options,
  });
}

function get(
  handler: (request: Request) => Promise<Response>,
  path: string,
  headers: Record<string, string> = {},
) {
  return handler(new Request(`https://example.com${path}`, { headers }));
}

async function readImage(response: Response) {
  expect(response.status, await response.clone().text()).toBe(200);
  return WasmJimp.fromBuffer(await response.arrayBuffer());
}

function editsParam(edits: unknown) {
  return Buffer.from(JSON.stringify(edits)).toString("base64url");
}

test("encodeEdits encodes edits as base64url JSON", () => {
  const edits: [string, ...unknown[]][] = [
    ["resize", { w: 100 }],
    ["print", "ü?"],
  ];

  expect(encodeEdits(edits)).toBe(editsParam(edits));
});

describe("params", () => {
  const handler = createHandler();

  test("serves the source image without params", async () => {
    const response = await get(handler, "/images/halves.png");
    const image = await readImage(response);

    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(image.bitmap.width).toBe(200);
    expect(image.bitmap.height).toBe(100);
  });

  test("w keeps the aspect ratio", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?w=50"),
    );

    expect([image.bitmap.width, image.bitmap.height]).toEqual([50, 25]);
  });

  test("h keeps the aspect ratio", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?h=50"),
    );

    expect([image.bitmap.width, image.bitmap.height]).toEqual([100, 50]);
  });

  test("w and h cover by default", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?w=50&h=50"),
    );

    expect([image.bitmap.width, image.bitmap.height]).toEqual([50, 50]);
    // The middle of the image, where the halves meet
    expect(image.getPixelColor(10, 25)).toBe(0xff0000ff);
    expect(image.getPixelColor(40, 25)).toBe(0x0000ffff);
  });

  test("pos picks the part cover keeps", async () => {
    const left = await readImage(
      await get(handler, "/images/halves.png?w=50&h=50&pos=left"),
    );
    const right = await readImage(
      await get(handler, "/images/halves.png?w=50&h=50&pos=1,0.5"),
    );

    expect(left.getPixelColor(40, 25)).toBe(0xff0000ff);
    expect(right.getPixelColor(10, 25)).toBe(0x0000ffff);
  });

  test("fit=contain letterboxes with bg", async () => {
    const image = await readImage(
      await get(
        handler,
        "/images/halves.png?w=100&h=100&fit=contain&bg=00ff00",
      ),
    );

    expect([image.bitmap.width, image.bitmap.height]).toEqual([100, 100]);
    expect(image.getPixelColor(50, 5)).toBe(0x00ff00ff);
    expect(image.getPixelColor(10, 50)).toBe(0xff0000ff);
  });

  test("fit=contain letterboxes with transparency by default", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?w=100&h=100&fit=contain"),
    );

    expect(image.getPixelColor(50, 5)).toBe(0x00000000);
  });

  test("fit=scale-to-fit keeps the aspect ratio", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?w=100&h=100&fit=scale-to-fit"),
    );

    expect([image.bitmap.width, image.bitmap.height]).toEqual([100, 50]);
  });

  test("fit=fill stretches", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?w=30&h=90&fit=fill"),
    );

    expect([image.bitmap.width, image.bitmap.height]).toEqual([30, 90]);
  });

  test("dpr multiplies w and h", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?w=40&h=20&dpr=1.5"),
    );

    expect([image.bitmap.width, image.bitmap.height]).toEqual([60, 30]);
  });

  test("rot turns the image clockwise, before resizing", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?rot=90&w=50"),
    );

    expect([image.bitmap.width, image.bitmap.height]).toEqual([50, 100]);
    // The left half is now at the top
    expect(image.getPixelColor(25, 10)).toBe(0xff0000ff);
    expect(image.getPixelColor(25, 90)).toBe(0x0000ffff);
  });

  test("flip mirrors the image", async () => {
    const image = await readImage(
      await get(handler, "/images/halves.png?flip=h"),
    );

    expect(image.getPixelColor(10, 50)).toBe(0x0000ffff);
    expect(image.getPixelColor(190, 50)).toBe(0xff0000ff);
  });

  test("greyscale, blur and sharpen", async () => {
    const grey = await readImage(
      await get(handler, "/images/halves.png?greyscale"),
    );
    const { r, g, b } = intToRGBA(grey.getPixelColor(10, 50));

    expect(r).toBe(g);
    expect(g).toBe(b);

    const blurred = await readImage(
      await get(handler, "/images/halves.png?blur=10"),
    );
    // Red and blue mix where the halves meet
    const [red, , blue] = blurred.bitmap.data.subarray(
      (50 * 200 + 100) * 4,
      (50 * 200 + 100) * 4 + 3,
    );

    expect(red).toBeGreaterThan(0);
    expect(blue).toBeGreaterThan(0);

    await readImage(await get(handler, "/images/photo.jpg?sharpen=1.5"));
  });

  test("q sets the JPEG quality", async () => {
    const low = await get(handler, "/images/photo.jpg?q=5");
    const high = await get(handler, "/images/photo.jpg?q=100");

    expect(Number(low.headers.get("Content-Length"))).toBeLessThan(
      Number(high.headers.get("Content-Length")),
    );
  });

  test("encodeOptions can set the quality, which q overrides", async () => {
    const lowDefault = createHandler({
      encodeOptions: { "image/jpeg": { quality: 5 } },
    });
    const size = async (h: typeof handler, path: string) =>
      Number((await get(h, path)).headers.get("Content-Length"));

    expect(await size(lowDefault, "/images/photo.jpg")).toBe(
      await size(handler, "/images/photo.jpg?q=5"),
    );
    expect(await size(lowDefault, "/images/photo.jpg?q=100")).toBe(
      await size(handler, "/images/photo.jpg?q=100"),
    );
  });

  test("bg fills transparency when encoding to JPEG, white by default", async () => {
    const white = await readImage(
      await get(handler, "/images/transparent.png?fm=jpeg"),
    );
    const red = await readImage(
      await get(handler, "/images/transparent.png?fm=jpeg&bg=red"),
    );

    expect(white.bitmap.data[0]).toBeGreaterThan(250);
    expect(red.bitmap.data[0]).toBeGreaterThan(250);
    expect(red.bitmap.data[1]).toBeLessThan(5);
  });

  test.each([
    ["w=abc", "w must be a whole number"],
    ["w=0", "w must be at least 1"],
    ["w=1.5", "w must be a whole number"],
    ["q=101", "q must be at most 100"],
    ["fit=crop", "fit must be one of cover, contain, scale-to-fit, fill"],
    ["fm=svg", "fm must be one of"],
    ["pos=middle", "pos must be one of"],
    ["pos=2,0", "pos must be one of"],
    ["rot=45", "rot must be one of 0, 90, 180, 270"],
    ["flip=x", "flip must be one of h, v, hv"],
    [
      "bg=notacolor",
      'bg must be a hex color like ff0000 or a CSS color, not "notacolor"',
    ],
    ["blur=1000", "blur must be at most 100"],
    ["dpr=5", "dpr must be at most 4"],
    ["greyscale=yes", "greyscale must be 1, true, 0 or false"],
    ["width=100", "Unknown param: width"],
    ["w=100&w=200", "w is given more than once"],
    ["__proto__=1", "Unknown param: __proto__"],
    ["toString=1", "Unknown param: toString"],
  ])("?%s is a 400", async (query, message) => {
    const response = await get(handler, `/images/halves.png?${query}`);

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toContain(message);
  });
});

describe("format", () => {
  const handler = createHandler({ Jimp: WasmJimp });

  test("keeps the source format by default", async () => {
    const response = await get(handler, "/images/photo.webp", {
      Accept: "image/avif",
    });

    expect(response.headers.get("Content-Type")).toBe("image/webp");
    expect(response.headers.get("Vary")).toBeNull();
  });

  test("fm picks the format", async () => {
    const response = await get(handler, "/images/halves.png?fm=jpg");

    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
  });

  test("fm=auto prefers AVIF, then WebP", async () => {
    const avifResponse = await get(handler, "/images/halves.png?fm=auto", {
      Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
    });
    const webpResponse = await get(handler, "/images/halves.png?fm=auto", {
      Accept: "image/webp,*/*",
    });

    expect(avifResponse.headers.get("Content-Type")).toBe("image/avif");
    expect(avifResponse.headers.get("Vary")).toBe("Accept");
    expect((await readImage(avifResponse)).bitmap.width).toBe(200);
    expect(webpResponse.headers.get("Content-Type")).toBe("image/webp");
  });

  test("fm=auto ignores formats with q=0 and wildcards", async () => {
    const response = await get(handler, "/images/halves.png?fm=auto", {
      Accept: "image/avif;q=0,image/*,*/*",
    });

    expect(response.headers.get("Content-Type")).toBe("image/png");
  });

  test("fm=auto falls back to the source's format, or PNG or JPEG", async () => {
    const jpeg = await get(handler, "/images/photo.jpg?fm=auto");
    const webpSource = await get(handler, "/images/photo.webp?fm=auto");
    const transparentWebp = await get(
      createHandler({
        Jimp: WasmJimp,
        source: async () =>
          new WasmJimp({ width: 4, height: 4, color: 0xff000080 }).getBuffer(
            "image/webp",
          ),
      }),
      "/images/transparent.webp?fm=auto",
    );

    expect(jpeg.headers.get("Content-Type")).toBe("image/jpeg");
    // Browsers that don't accept WebP get JPEG for opaque images, and PNG
    // for ones with transparency
    expect(webpSource.headers.get("Content-Type")).toBe("image/jpeg");
    expect(transparentWebp.headers.get("Content-Type")).toBe("image/png");
  });

  test("fm=auto only picks formats the Jimp class can encode", async () => {
    const response = await get(createHandler(), "/images/halves.png?fm=auto", {
      Accept: "image/avif,image/webp",
    });

    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Vary")).toBe("Accept");
  });

  test("defaultFormat: auto negotiates without fm", async () => {
    const response = await get(
      createHandler({ Jimp: WasmJimp, defaultFormat: "auto" }),
      "/images/halves.png",
      { Accept: "image/webp" },
    );

    expect(response.headers.get("Content-Type")).toBe("image/webp");
  });

  test("a format the Jimp class can't encode is a 415", async () => {
    const response = await get(createHandler(), "/images/halves.png?fm=webp");

    expect(response.status).toBe(415);
    expect(await response.text()).toBe(
      "The Jimp class can't encode image/webp",
    );
  });

  test("a source format the Jimp class can't decode is a 415", async () => {
    const response = await get(createHandler(), "/images/photo.webp");

    expect(response.status).toBe(415);
  });

  test("encodeOptions are passed to getBuffer", async () => {
    const small = await get(
      createHandler({ encodeOptions: { "image/png": { deflateLevel: 9 } } }),
      "/images/halves.png",
    );
    const large = await get(
      createHandler({ encodeOptions: { "image/png": { deflateLevel: 0 } } }),
      "/images/halves.png",
    );

    expect(Number(small.headers.get("Content-Length"))).toBeLessThan(
      Number(large.headers.get("Content-Length")),
    );
  });
});

describe("signing", () => {
  const secret = "correct horse battery staple";
  const handler = createHandler({ secret });

  test("needs a signature when there's a secret", async () => {
    const response = await get(handler, "/images/halves.png?w=50");

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("The URL needs a signature");
  });

  test("accepts URLs from signUrl", async () => {
    const url = await signUrl("/images/halves.png?w=50", secret);

    expect(url).toMatch(/^\/images\/halves\.png\?w=50&s=[\w-]{43}$/);
    expect((await readImage(await get(handler, url))).bitmap.width).toBe(50);
  });

  test("signs absolute URLs", async () => {
    const url = await signUrl(
      "https://example.com/images/halves.png?w=50",
      secret,
    );

    expect((await handler(new Request(url))).status).toBe(200);
  });

  test("signUrl sorts the params, so each transform has one URL", async () => {
    const a = await signUrl("/images/halves.png?w=50&h=20", secret);
    const b = await signUrl("/images/halves.png?h=20&w=50", secret);

    expect(a).toBe(b);
    expect(a).toMatch(/^\/images\/halves\.png\?h=20&w=50&s=[\w-]{43}$/);
    expect((await get(handler, a)).status).toBe(200);
  });

  test("only the URL signUrl returns is accepted", async () => {
    const url = await signUrl("/images/halves.png?w=50&h=20", secret);
    const s = new URL(url, "https://example.com").searchParams.get("s");
    const variants = [
      `/images/halves.png?w=50&h=20&s=${s}`,
      `/images/halves.png?s=${s}&h=20&w=50`,
      `${url}&s=${s}`,
      `${url}&s=other`,
      `${url}&`,
      url.replace("?", "?&&"),
      url.replace("h=20", "%68=%32%30"),
    ];

    for (const variant of variants) {
      expect((await get(handler, variant)).status, variant).toBe(403);
    }
  });

  test.each([
    ["a changed param", (url: string) => url.replace("w=50", "w=500")],
    ["an added param", (url: string) => `${url}&blur=5`],
    ["a changed path", (url: string) => url.replace("halves", "photo")],
    ["a bad signature", (url: string) => url.replace(/s=.*/, "s=nope")],
    ["another secret", () => signUrl("/images/halves.png?w=50", "other")],
  ])("rejects %s", async (_, change) => {
    const url = await change(await signUrl("/images/halves.png?w=50", secret));
    const response = await get(handler, url);

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("The signature isn't valid");
  });

  test("accepts any of several secrets", async () => {
    const rotating = createHandler({ secret: ["new", secret] });

    for (const key of ["new", secret]) {
      const url = await signUrl("/images/halves.png?w=50", key);
      expect((await get(rotating, url)).status).toBe(200);
    }
  });

  test("edits runs signed edits", async () => {
    const edits = editsParam([
      ["crop", { x: 100, y: 0, w: 100, h: 100 }],
      ["circle"],
    ]);
    const url = await signUrl(`/images/halves.png?edits=${edits}&w=20`, secret);
    const image = await readImage(await get(handler, url));

    expect([image.bitmap.width, image.bitmap.height]).toEqual([20, 20]);
    expect(image.getPixelColor(10, 10)).toBe(0x0000ffff);
    expect(image.getPixelColor(0, 0) & 0xff).toBe(0);
  });

  test("edits needs a signature", async () => {
    const edits = editsParam([["invert"]]);
    const optional = createHandler({ secret, requireSignature: false });
    const unsigned = createHandler();

    expect((await get(optional, "/images/halves.png?w=50")).status).toBe(200);

    const optionalResponse = await get(
      optional,
      `/images/halves.png?edits=${edits}`,
    );
    expect(optionalResponse.status).toBe(403);
    expect(await optionalResponse.text()).toBe(
      "The edits param needs a signature",
    );

    const unsignedResponse = await get(
      unsigned,
      `/images/halves.png?edits=${edits}`,
    );
    expect(unsignedResponse.status).toBe(400);
    expect(await unsignedResponse.text()).toBe(
      "The edits param is only accepted on signed URLs",
    );
  });

  test.each([
    ["not base64url JSON", "!!!", "edits must be base64url-encoded JSON"],
    [
      "not a list of edits",
      editsParam({ resize: 1 }),
      "edits must be an array of edits",
    ],
    [
      "a method that isn't allowed",
      editsParam([["print", {}]]),
      "The print edit isn't allowed",
    ],
    [
      "a core method",
      editsParam([["write", "/etc/passwd"]]),
      "The write edit isn't allowed",
    ],
    [
      "a method that returns a value",
      editsParam([["dominantColor"]]),
      "The dominantColor edit isn't allowed",
    ],
    [
      "bad arguments",
      editsParam([["resize", { width: 1 }]]),
      "Edit 0 (resize) failed",
    ],
  ])("edits with %s is a 400", async (_, edits, message) => {
    const url = await signUrl(`/images/halves.png?edits=${edits}`, secret);
    const response = await get(handler, url);

    expect(response.status).toBe(400);
    expect(await response.text()).toContain(message);
  });
});

describe("limits", () => {
  test("w and h over maxSize are a 422", async () => {
    const handler = createHandler({ maxSize: 100 });

    expect((await get(handler, "/images/halves.png?w=100")).status).toBe(200);

    const response = await get(handler, "/images/halves.png?w=60&dpr=2");
    expect(response.status).toBe(422);
    expect(await response.text()).toBe("w is 120, the most is 100");
  });

  test("edits can't make the image larger than maxSize", async () => {
    const handler = createHandler({ maxSize: 300, secret: "s" });
    const grow = await signUrl(
      `/images/halves.png?edits=${editsParam([["scale", 2]])}`,
      "s",
    );
    const shrink = await signUrl(
      `/images/halves.png?edits=${editsParam([["scale", 0.5]])}`,
      "s",
    );

    expect((await get(handler, shrink)).status).toBe(200);

    const response = await get(handler, grow);
    expect(response.status).toBe(422);
    expect(await response.text()).toContain("larger than the most of 300");
  });

  test("w or h alone can't make the other side larger than maxSize", async () => {
    const tall = await new Jimp({ width: 10, height: 1000 }).getBuffer(
      "image/png",
    );
    const handler = createHandler({ maxSize: 200, source: () => tall });

    const wide = await get(handler, "/images/tall.png?w=200");
    expect(wide.status).toBe(422);
    expect(await wide.text()).toBe(
      "The edits make the image 200x20000, larger than the most of 200",
    );

    // A side as long as the source's is allowed, after a quarter turn too
    expect((await get(handler, "/images/tall.png?h=200")).status).toBe(200);
    expect((await get(handler, "/images/tall.png?rot=90&h=200")).status).toBe(
      422,
    );
    expect((await get(handler, "/images/tall.png?rot=90&h=10")).status).toBe(
      200,
    );
  });

  test("a source larger than maxSize is still served", async () => {
    const response = await get(
      createHandler({ maxSize: 50 }),
      "/images/halves.png?greyscale",
    );

    expect(response.status).toBe(200);
  });

  test("more edits than maxEdits are a 422", async () => {
    const handler = createHandler({ maxEdits: 2 });

    expect((await get(handler, "/images/halves.png?w=50&blur=2")).status).toBe(
      200,
    );

    const response = await get(
      handler,
      "/images/halves.png?w=50&blur=2&greyscale",
    );
    expect(response.status).toBe(422);
    expect(await response.text()).toBe("Too many edits: 3, the most is 2");
  });

  test("allowedEdits limits the params too", async () => {
    const handler = createHandler({ allowedEdits: ["resize"] });

    expect((await get(handler, "/images/halves.png?w=50")).status).toBe(200);

    const response = await get(handler, "/images/halves.png?w=50&blur=2");
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("The blur edit isn't allowed");
  });

  test("methods that return a value are a 400 even if allowed", async () => {
    const handler = createHandler({
      allowedEdits: ["palette"],
      secret: "s",
    });
    const edits = editsParam([["palette", 5]]);
    const response = await get(
      handler,
      await signUrl(`/images/halves.png?edits=${edits}`, "s"),
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toContain(
      '"palette" returns a value instead of changing the image',
    );
  });

  test("edits the Jimp class doesn't have are a 400", async () => {
    const OnlyResize = createJimp({
      formats: defaultFormats,
      plugins: [defaultPlugins.find((methods) => "resize" in methods)!],
    });
    const response = await get(
      createHandler({ Jimp: OnlyResize }),
      "/images/halves.png?blur=2",
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toContain(
      "the Jimp class has no blur method",
    );
  });

  test("a source over maxSourceBytes is a 413", async () => {
    const response = await get(
      createHandler({ maxSourceBytes: 100 }),
      "/images/halves.png",
    );

    expect(response.status).toBe(413);
    expect(await response.text()).toMatch(
      /The source image is \d+ bytes, the most is 100/,
    );
  });

  test("a source over maxSourceResolutionInMP is a 413", async () => {
    for (const path of ["halves.png", "photo.jpg"]) {
      const response = await get(
        createHandler({ maxSourceResolutionInMP: 0.01 }),
        `/images/${path}`,
      );

      expect(response.status).toBe(413);
      expect(await response.text()).toContain("The source image is too large");
    }

    const webpResponse = await get(
      createHandler({ Jimp: WasmJimp, maxSourceResolutionInMP: 0.0001 }),
      "/images/photo.webp",
    );
    expect(webpResponse.status).toBe(413);
  });

  test("ICO sources are limited too", async () => {
    const icon = await new Jimp({ width: 200, height: 100 }).getBuffer(
      "image/x-icon",
    );
    const response = await get(
      createHandler({ source: () => icon, maxSourceResolutionInMP: 0.01 }),
      "/images/favicon.ico",
    );

    expect(response.status).toBe(413);
  });

  test("readOptions are merged over the limits", async () => {
    const response = await get(
      createHandler({
        maxSourceResolutionInMP: 0.01,
        readOptions: { "image/png": { maxResolutionInMP: 1 } },
      }),
      "/images/halves.png",
    );

    expect(response.status).toBe(200);
  });
});

describe("caching", () => {
  const handler = createHandler({ Jimp: WasmJimp });

  test("sends Cache-Control and a strong ETag", async () => {
    const response = await get(handler, "/images/halves.png?w=50");

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=86400, stale-while-revalidate=604800",
    );
    expect(response.headers.get("ETag")).toMatch(/^"[\w-]{43}"$/);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  test("cacheControl sets Cache-Control", async () => {
    const response = await get(
      createHandler({ cacheControl: "public, max-age=60" }),
      "/images/halves.png",
    );

    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60");
  });

  test("the ETag depends on the source, the params and the format", async () => {
    const etag = async (path: string, accept = "") =>
      (await get(handler, path, { Accept: accept })).headers.get("ETag");
    const base = await etag("/images/halves.png?w=50&h=20");

    expect(await etag("/images/halves.png?h=20&w=50")).toBe(base);
    expect(await etag("/images/halves.png?w=51&h=20")).not.toBe(base);
    expect(await etag("/images/photo.jpg?w=50&h=20")).not.toBe(base);
    expect(await etag("/images/nested/dir/cat.png?w=50&h=20")).toBe(base);
    expect(await etag("/images/halves.png?fm=auto", "image/webp")).not.toBe(
      await etag("/images/halves.png?fm=auto", "image/avif"),
    );
    expect(await etag("/images/halves.png?fm=auto", "image/webp")).toBe(
      await etag("/images/halves.png?fm=auto", "image/webp,image/jxl"),
    );
  });

  test("If-None-Match responds with 304", async () => {
    const response = await get(handler, "/images/halves.png?fm=auto", {
      Accept: "image/webp",
    });
    const etag = response.headers.get("ETag")!;

    for (const ifNoneMatch of [etag, `W/${etag}`, `"other", ${etag}`]) {
      const notModified = await get(handler, "/images/halves.png?fm=auto", {
        Accept: "image/webp",
        "If-None-Match": ifNoneMatch,
      });

      expect(notModified.status).toBe(304);
      expect(notModified.body).toBeNull();
      expect(notModified.headers.get("ETag")).toBe(etag);
      expect(notModified.headers.get("Vary")).toBe("Accept");
    }

    for (const ifNoneMatch of ['"other"', "*"]) {
      const changed = await get(handler, "/images/halves.png?fm=auto", {
        Accept: "image/webp",
        "If-None-Match": ifNoneMatch,
      });
      expect(changed.status).toBe(200);
    }
  });

  test("304s don't decode the image", async () => {
    const fromBuffer = vi.spyOn(WasmJimp, "fromBuffer");
    const response = await get(handler, "/images/halves.png");

    expect(fromBuffer).toHaveBeenCalledTimes(1);

    await get(handler, "/images/halves.png", {
      "If-None-Match": response.headers.get("ETag")!,
    });

    expect(fromBuffer).toHaveBeenCalledTimes(1);
    fromBuffer.mockRestore();
  });
});

describe("errors", () => {
  test("a missing source is a 404", async () => {
    const response = await get(createHandler(), "/images/missing.png");

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not found");
  });

  test("paths outside basePath are a 404", async () => {
    const handler = createHandler();

    expect((await get(handler, "/halves.png")).status).toBe(404);
    expect((await get(handler, "/imageshalves.png")).status).toBe(404);
    expect((await get(handler, "/images")).status).toBe(400);
    expect((await get(handler, "/images/")).status).toBe(400);
  });

  test("basePath / serves every path", async () => {
    const handler = createHandler({ basePath: "/" });

    expect((await get(handler, "/halves.png")).status).toBe(200);
    expect((await get(handler, "/nested/dir/cat.png")).status).toBe(200);
  });

  test("data that isn't an image is a 415", async () => {
    const response = await get(createHandler(), "/images/notes.txt");

    expect(response.status).toBe(415);
    expect(await response.text()).toBe(
      "The source image's format isn't supported",
    );
  });

  test("an image that can't be decoded is a 422", async () => {
    const response = await get(createHandler(), "/images/corrupt.png");

    expect(response.status).toBe(422);
    expect(await response.text()).toContain(
      "The source image couldn't be decoded",
    );
  });

  test("errors from the source are a 500, without details", async () => {
    const onError = vi.fn();
    const response = await get(
      createHandler({
        source: () => {
          throw new Error("EACCES: /var/secret/images");
        },
        onError,
      }),
      "/images/halves.png",
    );

    expect(response.status).toBe(500);
    expect(await response.text()).toBe("Internal Server Error");
    expect(onError).toHaveBeenCalledOnce();

    const [error, request] = onError.mock.calls[0]!;
    expect(error).toBeInstanceOf(ImageHandlerError);
    expect(error.status).toBe(500);
    expect(error.cause.message).toBe("EACCES: /var/secret/images");
    expect(request).toBeInstanceOf(Request);
  });

  test("sources can throw an ImageHandlerError to pick the status", async () => {
    const response = await get(
      createHandler({
        source: async () => {
          throw new ImageHandlerError(451, "Unavailable here");
        },
      }),
      "/images/halves.png",
    );

    expect(response.status).toBe(451);
    expect(await response.text()).toBe("Unavailable here");
  });

  test("sources can return a Blob or an ArrayBuffer", async () => {
    const png = files["halves.png"]!;

    for (const data of [
      new Blob([png as BlobPart]),
      png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength),
    ]) {
      const response = await get(
        createHandler({ source: () => data as ArrayBuffer }),
        "/images/x.png",
      );
      expect(response.status).toBe(200);
    }
  });

  test("methods other than GET and HEAD are a 405", async () => {
    const response = await createHandler()(
      new Request("https://example.com/images/halves.png", { method: "POST" }),
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, HEAD");
  });

  test("HEAD sends the headers without a body", async () => {
    const response = await createHandler()(
      new Request("https://example.com/images/halves.png?w=50", {
        method: "HEAD",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
    expect(Number(response.headers.get("Content-Length"))).toBeGreaterThan(0);
  });

  test("invalid options throw", () => {
    expect(() =>
      createImageHandler({ Jimp: {} as never, source: memorySource }),
    ).toThrow("Jimp must be a Jimp class");
    expect(() =>
      createImageHandler({ Jimp, source: "photos" as never }),
    ).toThrow("source must be a function");
    expect(() =>
      createImageHandler({ Jimp, source: memorySource, basePath: "images" }),
    ).toThrow("basePath must start with /");
  });
});

describe("paths", () => {
  const source = vi.fn<ImageSource>(memorySource);
  const handler = createHandler({ source });

  test("the source gets the decoded path and the request", async () => {
    source.mockClear();
    await get(handler, "/images/nested/dir/cat.png");
    await get(handler, "/images/my%20cat.png");

    expect(source.mock.calls[0]![0]).toBe("nested/dir/cat.png");
    expect(source.mock.calls[0]![1]).toBeInstanceOf(Request);
    expect(source.mock.calls[1]![0]).toBe("my cat.png");
  });

  test.each([
    "/images/..%2Fsecret.png",
    "/images/%2e%2e%2fsecret.png",
    "/images/nested%2F..%2F..%2Fsecret.png",
    "/images/..%5Csecret.png",
    "/images/a%5C..%5C..%5Csecret.png",
    "/images/cat.png%00.jpg",
    "/images//etc/passwd",
    "/images/nested//cat.png",
    "/images/%E0%A4%A",
  ])("rejects %s", async (path) => {
    source.mockClear();
    const response = await get(handler, path);

    expect(response.status).toBe(400);
    expect(await response.text()).toMatch(
      /The image path isn't valid|needs an image path/,
    );
    expect(source).not.toHaveBeenCalled();
  });

  test.each([
    "/images/../secret.png",
    "/images/%2e%2e/secret.png",
    "/images/nested/../../secret.png",
  ])("%s can't leave basePath", async (path) => {
    source.mockClear();
    const response = await get(handler, path);

    // URLs resolve dot segments, so these end up outside basePath
    expect(response.status).toBe(404);
    expect(source).not.toHaveBeenCalled();
  });
});
