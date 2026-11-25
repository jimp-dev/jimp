import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { createServer, request as request_, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { Jimp } from "jimp";

import { createImageHandler, signUrl } from "./index.js";
import { directorySource, toNodeHandler } from "./node.js";

const png = await new Jimp({
  width: 8,
  height: 8,
  color: 0xff0000ff,
}).getBuffer("image/png");
const request = new Request("https://example.com/");

let dir: string;
let root: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "jimp-server-"));
  root = join(dir, "public");

  await mkdir(join(root, "cats"), { recursive: true });
  await writeFile(join(root, "cats", "tom.png"), png);
  await writeFile(join(dir, "secret.png"), png);
  await symlink(join(dir, "secret.png"), join(root, "escape.png"));
  await symlink(join(root, "cats", "tom.png"), join(root, "inside.png"));
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("directorySource", () => {
  test("reads files in the directory", async () => {
    const source = directorySource(root);

    expect(
      new Uint8Array((await source("cats/tom.png", request)) as Buffer),
    ).toEqual(new Uint8Array(png));
    expect(await source("inside.png", request)).not.toBeNull();
  });

  test("returns null for missing files and directories", async () => {
    const source = directorySource(root);

    expect(await source("missing.png", request)).toBeNull();
    expect(await source("cats", request)).toBeNull();
    expect(await source("cats/tom.png/x", request)).toBeNull();
  });

  test("doesn't read outside the directory", async () => {
    const source = directorySource(root);

    // The handler rejects these first; the source checks again
    expect(await source("../secret.png", request)).toBeNull();
    expect(await source("cats/../../secret.png", request)).toBeNull();
    expect(await source(join(dir, "secret.png").slice(1), request)).toBeNull();
    // A symlink to a file outside
    expect(await source("escape.png", request)).toBeNull();
  });

  test("a missing directory is an error, not a 404", async () => {
    await expect(
      directorySource(join(dir, "nope"))("a.png", request),
    ).rejects.toThrow("ENOENT");
  });

  test("serves a filesystem root", async () => {
    const data = await directorySource("/")(
      join(root, "cats", "tom.png").slice(1),
      request,
    );

    expect(data).not.toBeNull();
  });

  test("files over maxBytes are a 413", async () => {
    await expect(
      directorySource(root, { maxBytes: 10 })("cats/tom.png", request),
    ).rejects.toMatchObject({ status: 413 });
  });
});

describe("toNodeHandler", () => {
  let server: Server;
  let origin: string;
  const secret = "node secret";

  beforeAll(async () => {
    const handler = createImageHandler({
      Jimp,
      source: directorySource(root),
      basePath: "/images",
      secret,
      requireSignature: false,
    });

    server = createServer(toNodeHandler(handler));
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test("serves images", async () => {
    const response = await fetch(`${origin}/images/cats/tom.png?w=4&fm=jpeg`);
    const image = await Jimp.fromBuffer(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(response.headers.get("ETag")).toMatch(/^"/);
    expect(image.bitmap.width).toBe(4);
  });

  test("passes the request headers", async () => {
    const response = await fetch(`${origin}/images/cats/tom.png`);
    const notModified = await fetch(`${origin}/images/cats/tom.png`, {
      headers: { "If-None-Match": response.headers.get("ETag")! },
    });

    expect(notModified.status).toBe(304);
  });

  test("checks signatures on the path and query", async () => {
    const signed = await signUrl("/images/cats/tom.png?w=2", secret);

    expect((await fetch(`${origin}${signed}`)).status).toBe(200);
    expect(
      (await fetch(`${origin}${signed.replace("w=2", "w=3")}`)).status,
    ).toBe(403);
  });

  test("sends errors", async () => {
    const missing = await fetch(`${origin}/images/missing.png`);
    const traversal = await fetch(`${origin}/images/..%2Fsecret.png`);

    expect(missing.status).toBe(404);
    expect(traversal.status).toBe(400);
  });

  test("HEAD sends no body", async () => {
    const response = await fetch(`${origin}/images/cats/tom.png`, {
      method: "HEAD",
    });

    expect(response.status).toBe(200);
    expect(Number(response.headers.get("Content-Length"))).toBeGreaterThan(0);
    expect((await response.arrayBuffer()).byteLength).toBe(0);
  });

  test("other methods are a 405, including ones Request can't make", async () => {
    for (const method of ["POST", "TRACE"]) {
      const status = await new Promise<number>((resolve, reject) => {
        request_(`${origin}/images/cats/tom.png`, { method }, (res) => {
          res.resume();
          resolve(res.statusCode!);
        })
          .on("error", reject)
          .end();
      });

      expect(status, method).toBe(405);
    }
  });

  test("skips HTTP/2 pseudo-headers", async () => {
    const handler = vi.fn(async (request: Request) => {
      expect(request.headers.get("accept")).toBe("image/webp");
      return new Response("ok");
    });
    const res = { writeHead: vi.fn(), end: vi.fn() };

    await toNodeHandler(handler)(
      {
        method: "GET",
        url: "/images/cats/tom.png",
        headers: {
          ":path": "/images/cats/tom.png",
          ":method": "GET",
          accept: "image/webp",
        },
      } as never,
      res as never,
    );

    expect(handler).toHaveBeenCalledOnce();
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
  });

  test("uses Express's originalUrl and next", async () => {
    const handler = createImageHandler({
      Jimp,
      source: directorySource(root),
      basePath: "/images",
    });
    const errors: unknown[] = [];
    const mounted = createServer((req, res) => {
      // What Express does when the handler is mounted with app.use("/images")
      const express = Object.assign(req, {
        originalUrl: req.url,
        url: req.url!.replace(/^\/images/, ""),
      });

      toNodeHandler(handler)(express, res, (error) => errors.push(error));
    });

    await new Promise<void>((resolve) =>
      mounted.listen(0, "127.0.0.1", resolve),
    );

    const port = (mounted.address() as AddressInfo).port;
    const response = await fetch(
      `http://127.0.0.1:${port}/images/cats/tom.png`,
    );

    expect(response.status).toBe(200);
    expect(errors).toEqual([]);
    await new Promise((resolve) => mounted.close(resolve));
  });
});
