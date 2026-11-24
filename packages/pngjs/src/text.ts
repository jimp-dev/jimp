/**
 * Latin-1 text, as tEXt and zTXt store it. TextDecoder can't do this:
 * browsers map "latin1" to windows-1252, which differs in 0x80-0x9f.
 */
export function decodeLatin1(bytes: Uint8Array) {
  let result = "";

  for (let i = 0; i < bytes.length; i += 8192) {
    result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }

  return result;
}

/** Returns undefined if the text has characters Latin-1 can't store */
export function encodeLatin1(text: string) {
  const bytes = new Uint8Array(text.length);

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    if (code > 0xff) {
      return undefined;
    }

    bytes[i] = code;
  }

  return bytes;
}

const utf8Decoder = new TextDecoder();
const utf8Encoder = new TextEncoder();

export function decodeUtf8(bytes: Uint8Array) {
  return utf8Decoder.decode(bytes);
}

export function encodeUtf8(text: string) {
  return utf8Encoder.encode(text);
}
