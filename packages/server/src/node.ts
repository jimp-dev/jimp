/**
 * Node.js helpers for `@jimp/server`: a source that reads a directory, and
 * an adapter for `node:http` and Express.
 * @module @jimp/server/node
 */

import { readFile, realpath, stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve, sep } from "node:path";

import { ImageHandlerError } from "./errors.js";
import type { ImageSource } from "./handler.js";

export interface DirectorySourceOptions {
  /**
   * The largest file to read, in bytes. Larger files get a 413 without being
   * read.
   * @default 20 MB
   */
  maxBytes?: number;
}

function isMissing(error: unknown) {
  const code = (error as NodeJS.ErrnoException)?.code;
  return code === "ENOENT" || code === "ENOTDIR" || code === "EISDIR";
}

/**
 * A source that reads images from a directory. Paths can't leave it: `..`
 * segments are rejected before the source is called, and files that are
 * symlinks to somewhere outside the directory are treated as missing.
 * @param root The directory to serve
 * @example
 * ```ts
 * import { createImageHandler } from "@jimp/server";
 * import { directorySource } from "@jimp/server/node";
 *
 * const handler = createImageHandler({
 *   Jimp,
 *   source: directorySource("./public/images"),
 *   basePath: "/images",
 * });
 * ```
 */
export function directorySource(
  root: string,
  { maxBytes = 20 * 1024 * 1024 }: DirectorySourceOptions = {},
): ImageSource {
  // Resolved on first use, so the directory can be created after the handler.
  // If it's missing, requests are a 500 until it exists.
  let realRoot: string | undefined;

  return async (path) => {
    realRoot ??= await realpath(resolve(root));

    const base = realRoot;
    // A filesystem root like "/" already ends with the separator
    const prefix = base.endsWith(sep) ? base : base + sep;
    const file = resolve(base, ...path.split("/"));

    if (!file.startsWith(prefix)) {
      return null;
    }

    let real: string;

    try {
      real = await realpath(file);
    } catch (error) {
      if (isMissing(error)) return null;
      throw error;
    }

    if (!real.startsWith(prefix)) {
      return null;
    }

    const stats = await stat(real);

    if (!stats.isFile()) {
      return null;
    }

    if (stats.size > maxBytes) {
      throw new ImageHandlerError(
        413,
        `The source image is ${stats.size} bytes, the most is ${maxBytes}`,
      );
    }

    return readFile(real);
  };
}

/** Express's request has the URL before mounting, other servers don't */
type NodeRequest = IncomingMessage & { originalUrl?: string };

/**
 * Wrap a handler from `createImageHandler` for `node:http`, Express,
 * Fastify's `onRequest` style middleware or anything else that passes
 * Node's request and response objects.
 *
 * The handler sees the request's full path (Express's `originalUrl` when
 * mounted with `app.use`), so set `basePath` to the path you mount it on.
 * @example
 * ```ts
 * import { createServer } from "node:http";
 * import { toNodeHandler } from "@jimp/server/node";
 *
 * createServer(toNodeHandler(handler)).listen(3000);
 *
 * // Express
 * app.use("/images", toNodeHandler(handler));
 * ```
 */
export function toNodeHandler(
  handler: (request: Request) => Promise<Response>,
) {
  return async function nodeHandler(
    req: NodeRequest,
    res: ServerResponse,
    next?: (error?: unknown) => void,
  ) {
    try {
      // new Request throws for methods like TRACE, so answer them here
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, {
          Allow: "GET, HEAD",
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
        });
        res.end("Only GET and HEAD are supported");
        return;
      }

      const path = req.originalUrl ?? req.url ?? "/";
      // Only the path and query are used, so don't trust the Host header
      const url = new URL(
        `http://localhost${path.startsWith("/") ? path : `/${path}`}`,
      );
      const headers = new Headers();

      for (const [key, value] of Object.entries(req.headers)) {
        // HTTP/2 pseudo-headers like :path aren't valid header names
        if (value === undefined || key.startsWith(":")) continue;

        for (const item of Array.isArray(value) ? value : [value]) {
          headers.append(key, item);
        }
      }

      const response = await handler(
        new Request(url, { method: req.method, headers }),
      );
      const body = new Uint8Array(await response.arrayBuffer());

      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(req.method === "HEAD" ? undefined : body);
    } catch (error) {
      if (next) {
        next(error);
        return;
      }

      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      }

      res.end("Internal Server Error");
    }
  };
}
