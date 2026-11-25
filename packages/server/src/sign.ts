import { fromBase64Url, toBase64Url, utf8 } from "./encoding.js";

/** The query param that holds the signature */
export const SIGNATURE_PARAM = "s";

const keys = new Map<string, Promise<CryptoKey>>();

function importKey(secret: string) {
  let key = keys.get(secret);

  if (!key) {
    key = crypto.subtle.importKey(
      "raw",
      utf8(secret) as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    keys.set(secret, key);
  }

  return key;
}

/**
 * The params in a stable order, without the signature. Signed URLs use this
 * order, so each signed transform has exactly one URL (and one cache key).
 */
export function canonicalQuery(params: URLSearchParams) {
  const entries = [...params].filter(([key]) => key !== SIGNATURE_PARAM);

  entries.sort(([a, av], [b, bv]) =>
    a === b ? (av < bv ? -1 : av > bv ? 1 : 0) : a < b ? -1 : 1,
  );

  return new URLSearchParams(entries).toString();
}

/** What a signature covers: the path and the params, except the signature */
function signedText(url: URL) {
  return `${url.pathname}?${canonicalQuery(url.searchParams)}`;
}

function toUrl(url: string | URL) {
  // Relative URLs, like "/images/cat.jpg?w=200", only need the path and query
  return new URL(url, "http://localhost");
}

/** The query string of a signed URL: the canonical params, then `s` */
function signedSearch(url: URL, signature: string) {
  const query = canonicalQuery(url.searchParams);

  return `?${query}${query ? "&" : ""}${SIGNATURE_PARAM}=${signature}`;
}

/**
 * Sign an image URL, so a handler created with the same `secret` accepts it.
 * The signature covers the URL's path and every query param, and is added as
 * the `s` param. The params are sorted, and the handler only accepts the URL
 * exactly as returned, so a signed transform can't be requested under other
 * URLs that would miss a CDN's cache. The host isn't signed, so a signed URL
 * works on any domain the handler runs on.
 *
 * Run this on your server, never in the browser: anyone with the secret can
 * sign any URL.
 * @param url An absolute URL, or a path and query like `/images/cat.jpg?w=200`
 * @param secret The secret the handler checks signatures with
 * @returns The URL with an `s` param, relative if `url` was relative
 * @example
 * ```ts
 * import { signUrl } from "@jimp/server";
 *
 * const src = await signUrl("/images/cat.jpg?w=400&fm=auto", env.IMAGE_SECRET);
 * // "/images/cat.jpg?fm=auto&w=400&s=…"
 * ```
 */
export async function signUrl(url: string | URL, secret: string) {
  const parsed = toUrl(url);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(secret),
    utf8(signedText(parsed)) as BufferSource,
  );

  parsed.search = signedSearch(parsed, toBase64Url(signature));

  const isRelative =
    typeof url === "string" && !/^[a-z][a-z\d+.-]*:/i.test(url);

  return isRelative ? `${parsed.pathname}${parsed.search}` : parsed.toString();
}

/**
 * Check a URL's `s` param against each secret. The query must be exactly as
 * `signUrl` wrote it. Uses `crypto.subtle.verify`, which compares in
 * constant time.
 */
export async function verifyUrl(url: URL, secrets: string[]) {
  const signatures = url.searchParams.getAll(SIGNATURE_PARAM);
  const signature = signatures[0];

  if (
    signatures.length !== 1 ||
    !signature ||
    url.search !== signedSearch(url, signature)
  ) {
    return false;
  }

  let bytes: Uint8Array;

  try {
    bytes = fromBase64Url(signature);
  } catch {
    return false;
  }

  const text = utf8(signedText(url));

  for (const secret of secrets) {
    if (
      await crypto.subtle.verify(
        "HMAC",
        await importKey(secret),
        bytes as BufferSource,
        text as BufferSource,
      )
    ) {
      return true;
    }
  }

  return false;
}
