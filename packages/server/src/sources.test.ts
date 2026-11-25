import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Jimp } from "jimp";

import {
  createImageHandler,
  fetchSource,
  ImageHandlerError,
  remoteSource,
} from "./index.js";

const png = new Uint8Array(
  await new Jimp({ width: 8, height: 8, color: 0xff0000ff }).getBuffer(
    "image/png",
  ),
);
const request = new Request("https://example.com/");

type Route = (url: URL) => Response;

let routes: Record<string, Route>;
const fetchMock = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    const route = routes[url.href];

    expect(init?.redirect).toBe("manual");

    return route ? route(url) : new Response("Not found", { status: 404 });
  },
);

beforeEach(() => {
  routes = {};
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const image = () => new Response(png as BodyInit);
const redirect = (location: string) => () =>
  new Response(null, { status: 302, headers: { Location: location } });

async function rejection(promise: unknown) {
  try {
    await promise;
  } catch (error) {
    return error as ImageHandlerError;
  }

  throw new Error("Expected the promise to reject");
}

describe("fetchSource", () => {
  const source = fetchSource({ baseUrl: "https://assets.example.com/images" });

  test("fetches the path under baseUrl", async () => {
    routes["https://assets.example.com/images/cats/tom.png"] = image;

    const data = await source("cats/tom.png", request);

    expect(data).toEqual(png);
  });

  test("encodes each segment, so it can't change the host or the path", async () => {
    routes["https://assets.example.com/images/my%20cat%3F.png"] = image;
    routes["https://assets.example.com/images/http%3A/evil.com"] = image;

    expect(await source("my cat?.png", request)).toEqual(png);
    expect(await source("http:/evil.com", request)).toEqual(png);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("returns null for a 404", async () => {
    expect(await source("missing.png", request)).toBeNull();
  });

  test("other errors are a 502", async () => {
    routes["https://assets.example.com/images/broken.png"] = () =>
      new Response("oops", { status: 500 });

    const error = await rejection(source("broken.png", request));

    expect(error.status).toBe(502);
  });

  test("follows redirects under baseUrl", async () => {
    routes["https://assets.example.com/images/old.png"] =
      redirect("/images/new.png");
    routes["https://assets.example.com/images/new.png"] = image;

    expect(await source("old.png", request)).toEqual(png);
  });

  test("doesn't follow redirects elsewhere", async () => {
    routes["https://assets.example.com/images/a.png"] = redirect(
      "http://169.254.169.254/latest/meta-data",
    );
    routes["https://assets.example.com/images/b.png"] =
      redirect("/private/b.png");

    for (const path of ["a.png", "b.png"]) {
      const error = await rejection(source(path, request));

      expect(error.status).toBe(502);
      expect(error.message).toContain("which isn't allowed");
    }

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("stops after maxRedirects", async () => {
    routes["https://assets.example.com/images/loop.png"] =
      redirect("/images/loop.png");

    const error = await rejection(
      fetchSource({
        baseUrl: "https://assets.example.com/images/",
        maxRedirects: 2,
      })("loop.png", request),
    );

    expect(error.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test("responses over maxBytes are a 413", async () => {
    const small = fetchSource({
      baseUrl: "https://assets.example.com/",
      maxBytes: 10,
    });

    routes["https://assets.example.com/sized.png"] = image;
    routes["https://assets.example.com/streamed.png"] = () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(png.subarray(0, 8));
            controller.enqueue(png.subarray(8));
            controller.close();
          },
        }),
      );

    for (const path of ["sized.png", "streamed.png"]) {
      const error = await rejection(small(path, request));

      expect(error.status).toBe(413);
    }
  });

  test("a slow origin is a 504", async () => {
    fetchMock.mockImplementationOnce(
      (_, init) =>
        new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(init.signal!.reason),
          );
        }),
    );

    const error = await rejection(
      fetchSource({ baseUrl: "https://assets.example.com/", timeout: 10 })(
        "slow.png",
        request,
      ),
    );

    expect(error.status).toBe(504);
  });

  test("passes init to fetch", async () => {
    routes["https://assets.example.com/a.png"] = image;

    await fetchSource({
      baseUrl: "https://assets.example.com/",
      init: { headers: { Authorization: "Bearer token" } },
    })("a.png", request);

    expect(fetchMock.mock.calls[0]![1]?.headers).toEqual({
      Authorization: "Bearer token",
    });
  });

  test("checks baseUrl", () => {
    expect(() => fetchSource({ baseUrl: "file:///etc/" })).toThrow(
      "baseUrl must be an http or https URL",
    );
    expect(() => fetchSource({ baseUrl: "https://a.com/?token=1" })).toThrow(
      "baseUrl can't have a query or a hash",
    );
    expect(() => fetchSource({ baseUrl: "not a url" })).toThrow();
  });

  test("works with the handler", async () => {
    routes["https://assets.example.com/images/cats/tom.png"] = image;

    const handler = createImageHandler({
      Jimp,
      source: fetchSource({ baseUrl: "https://assets.example.com/images/" }),
      basePath: "/img",
    });
    const response = await handler(
      new Request("https://example.com/img/cats/tom.png?w=4"),
    );
    const missing = await handler(
      new Request("https://example.com/img/nope.png"),
    );

    expect(response.status).toBe(200);
    expect(missing.status).toBe(404);
  });
});

describe("remoteSource", () => {
  const source = remoteSource({
    allowedHosts: ["images.example.com", "*.cdn.example.com"],
  });

  test("fetches allowed hosts over https", async () => {
    routes["https://images.example.com/cat.png"] = image;
    routes["https://eu.cdn.example.com/a/b.png"] = image;

    expect(await source("images.example.com/cat.png", request)).toEqual(png);
    expect(await source("eu.cdn.example.com/a/b.png", request)).toEqual(png);
  });

  test.each([
    "evil.com/cat.png",
    "cdn.example.com/cat.png",
    "evilcdn.example.com/cat.png",
    "images.example.com.evil.com/cat.png",
    "images.example.com:8080/cat.png",
    "user@images.example.com/cat.png",
    "evil.com#@images.example.com/cat.png",
    "169.254.169.254/latest/meta-data",
    "localhost/admin",
  ])("rejects %s", async (path) => {
    const error = await rejection(source(path, request));

    expect(error.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("redirects must stay on allowed hosts", async () => {
    routes["https://images.example.com/a.png"] = redirect(
      "https://eu.cdn.example.com/a.png",
    );
    routes["https://eu.cdn.example.com/a.png"] = image;
    routes["https://images.example.com/b.png"] = redirect(
      "https://evil.com/b.png",
    );
    routes["https://images.example.com/c.png"] = redirect(
      "http://images.example.com/c.png",
    );

    expect(await source("images.example.com/a.png", request)).toEqual(png);
    expect(
      (await rejection(source("images.example.com/b.png", request))).status,
    ).toBe(502);
    expect(
      (await rejection(source("images.example.com/c.png", request))).status,
    ).toBe(502);
  });

  test("needs at least one host", () => {
    expect(() => remoteSource({ allowedHosts: [] })).toThrow(
      "allowedHosts must list at least one host",
    );
  });
});
