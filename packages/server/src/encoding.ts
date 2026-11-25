const encoder = new TextEncoder();

export function utf8(text: string) {
  return encoder.encode(text);
}

export function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";

  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decode base64url (with or without padding) to bytes */
export function fromBase64Url(text: string) {
  if (!/^[A-Za-z0-9_-]*={0,2}$/.test(text)) {
    throw new Error("Not valid base64url");
  }

  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export async function sha256(data: Uint8Array | string) {
  return new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      (typeof data === "string" ? utf8(data) : data) as BufferSource,
    ),
  );
}
