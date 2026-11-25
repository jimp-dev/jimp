import { z } from "zod";

import { ImageHandlerError } from "./errors.js";
import type { ImageSource } from "./handler.js";

const FetchOptionsSchema = z.object({
  init: z.record(z.string(), z.unknown()).optional(),
  maxBytes: z.number().positive().optional(),
  timeout: z.number().positive().optional(),
  maxRedirects: z.number().int().min(0).optional(),
});

interface FetchOptions {
  /**
   * Options for `fetch`, e.g. `{ headers: { Authorization: "…" } }`.
   * `redirect` and `signal` are set by the source.
   */
  init?: RequestInit;
  /**
   * The largest image to download, in bytes. Larger responses are cancelled.
   * @default 20 MB
   */
  maxBytes?: number;
  /**
   * How long to wait for the origin, in milliseconds, before responding with
   * 504
   * @default 10000
   */
  timeout?: number;
  /**
   * How many redirects to follow. Each one must stay on an allowed URL.
   * @default 3
   */
  maxRedirects?: number;
}

export interface FetchSourceOptions extends FetchOptions {
  /**
   * The URL images are fetched from. The request's path is added to it, so
   * with `https://assets.example.com/images/`, `/cat.jpg` fetches
   * `https://assets.example.com/images/cat.jpg`. Images are only fetched
   * from under this URL.
   */
  baseUrl: string | URL;
}

export interface RemoteSourceOptions extends FetchOptions {
  /**
   * The hosts images can be fetched from, like `images.example.com`. Start
   * one with `*.` to allow its subdomains: `*.example.com` allows
   * `cdn.example.com`, but not `example.com`.
   */
  allowedHosts: string[];
}

const REDIRECTS = new Set([301, 302, 303, 307, 308]);

async function readLimited(response: Response, maxBytes: number) {
  const length = Number(response.headers.get("Content-Length"));

  if (length > maxBytes) {
    await response.body?.cancel();
    throw new ImageHandlerError(
      413,
      `The source image is ${length} bytes, the most is ${maxBytes}`,
    );
  }

  if (!response.body) {
    return new Uint8Array(await response.arrayBuffer());
  }

  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = response.body.getReader();

  for (;;) {
    const { done, value } = await reader.read();

    if (done) break;

    size += value.byteLength;

    if (size > maxBytes) {
      await reader.cancel();
      throw new ImageHandlerError(
        413,
        `The source image is over the most of ${maxBytes} bytes`,
      );
    }

    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return bytes;
}

/**
 * Fetch a URL, following redirects only to allowed URLs. Returns null for
 * 404 and 410.
 */
async function fetchImage(
  url: URL,
  isAllowed: (url: URL) => boolean,
  {
    init,
    maxBytes = 20 * 1024 * 1024,
    timeout = 10_000,
    maxRedirects = 3,
  }: FetchOptions,
) {
  const signal = AbortSignal.timeout(timeout);

  for (let redirects = 0; ; redirects++) {
    let response: Response;

    try {
      response = await fetch(url, { ...init, redirect: "manual", signal });
    } catch (error) {
      throw (error as Error)?.name === "TimeoutError"
        ? new ImageHandlerError(504, `Fetching ${url} timed out`, {
            cause: error,
          })
        : new ImageHandlerError(502, `Couldn't fetch ${url}`, {
            cause: error,
          });
    }

    if (REDIRECTS.has(response.status)) {
      await response.body?.cancel();

      const location = response.headers.get("Location");
      const next = location ? new URL(location, url) : undefined;

      if (!next || redirects >= maxRedirects || !isAllowed(next)) {
        throw new ImageHandlerError(
          502,
          `${url} redirected to ${next ?? "nowhere"}, which isn't allowed`,
        );
      }

      url = next;
      continue;
    }

    if (response.status === 404 || response.status === 410) {
      await response.body?.cancel();
      return null;
    }

    if (!response.ok) {
      await response.body?.cancel();
      throw new ImageHandlerError(
        502,
        `${url} responded with ${response.status}`,
      );
    }

    try {
      return await readLimited(response, maxBytes);
    } catch (error) {
      if ((error as Error)?.name === "TimeoutError") {
        throw new ImageHandlerError(504, `Fetching ${url} timed out`, {
          cause: error,
        });
      }

      throw error;
    }
  }
}

/** Encode each path segment, so the path can't change the URL's host */
function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

/**
 * A source that fetches images from under one base URL, like an S3 bucket,
 * an R2 bucket's public URL or your own site. The request's path is added to
 * the base URL, so images can only come from there.
 * @example
 * ```ts
 * import { createImageHandler, fetchSource } from "@jimp/server";
 *
 * const handler = createImageHandler({
 *   Jimp,
 *   // /images/cats/tom.jpg?w=200 fetches https://assets.example.com/cats/tom.jpg
 *   source: fetchSource({ baseUrl: "https://assets.example.com/" }),
 *   basePath: "/images",
 * });
 * ```
 */
export function fetchSource(options: FetchSourceOptions): ImageSource {
  const { baseUrl, ...fetchOptions } = options;
  const base = new URL(baseUrl);

  FetchOptionsSchema.parse(fetchOptions);

  if (base.protocol !== "https:" && base.protocol !== "http:") {
    throw new Error("baseUrl must be an http or https URL");
  }

  if (base.search || base.hash) {
    throw new Error("baseUrl can't have a query or a hash");
  }

  if (!base.pathname.endsWith("/")) {
    base.pathname += "/";
  }

  const isAllowed = (url: URL) =>
    url.origin === base.origin && url.pathname.startsWith(base.pathname);

  return async (path) => {
    const url = new URL(`${base.href}${encodePath(path)}`);

    if (!isAllowed(url)) {
      throw new ImageHandlerError(400, "The image path isn't valid");
    }

    return fetchImage(url, isAllowed, fetchOptions);
  };
}

/**
 * A source that fetches images from other sites, given as the first part of
 * the path: `/images/images.example.com/cat.jpg` fetches
 * `https://images.example.com/cat.jpg`. Only hosts in `allowedHosts` are
 * fetched, over https, so the handler can't be used to reach your internal
 * network or to proxy other sites.
 * @example
 * ```ts
 * import { createImageHandler, remoteSource } from "@jimp/server";
 *
 * const handler = createImageHandler({
 *   Jimp,
 *   source: remoteSource({ allowedHosts: ["images.example.com", "*.cdn.example.com"] }),
 *   basePath: "/images",
 * });
 * ```
 */
export function remoteSource(options: RemoteSourceOptions): ImageSource {
  const { allowedHosts, ...fetchOptions } = options;

  z.array(z.string().min(1))
    .min(1, "allowedHosts must list at least one host")
    .parse(allowedHosts);
  FetchOptionsSchema.parse(fetchOptions);

  const exact = new Set<string>();
  const suffixes: string[] = [];

  for (const host of allowedHosts) {
    const lower = host.toLowerCase();

    if (lower.startsWith("*.")) {
      suffixes.push(lower.slice(1));
    } else {
      exact.add(lower);
    }
  }

  const isAllowed = (url: URL) =>
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    (exact.has(url.host) ||
      (url.port === "" &&
        suffixes.some((suffix) => url.hostname.endsWith(suffix))));

  return async (path) => {
    const [host, ...rest] = path.split("/");
    let url: URL;

    try {
      url = new URL(`https://${host}/${encodePath(rest.join("/"))}`);
    } catch {
      return null;
    }

    // The host must be exactly the first segment, so nothing in it (like
    // "@" or a port) changes where the request goes
    if (url.host !== host?.toLowerCase() || !isAllowed(url)) {
      throw new ImageHandlerError(403, `Images from ${host} aren't allowed`);
    }

    return fetchImage(url, isAllowed, fetchOptions);
  };
}
