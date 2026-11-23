/**
 * Helpers for writing ops (`js`, `raw`, `num`, color conversion,
 * `centeredRect`) and for rendering the code panel.
 */
import type { Rect } from "./types";

const RAW = Symbol("raw");

interface RawCode {
  [RAW]: string;
}

/** Insert code as-is, e.g. `raw("ResizeStrategy.BICUBIC")` or `raw("font")`. */
export function raw(code: string): RawCode {
  return { [RAW]: code };
}

/** Round to at most two decimals so sliders don't print 0.30000000000000004. */
export function num(n: number) {
  return Number(n.toFixed(2));
}

/**
 * Format a value as JavaScript source.
 *
 *   js({ w: 180, mode: raw("ResizeStrategy.BICUBIC") })
 *   // → '{ w: 180, mode: ResizeStrategy.BICUBIC }'
 *
 * Keys whose value is `undefined` are left out.
 */
export function js(value: unknown): string {
  if (value && typeof value === "object" && RAW in value) {
    return (value as RawCode)[RAW];
  }
  if (typeof value === "number") return String(num(value));
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(js).join(", ")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (!entries.length) return "{}";
    return `{ ${entries.map(([k, v]) => `${k}: ${js(v)}`).join(", ")} }`;
  }
  return String(value);
}

/** A centered rectangle covering `fraction` of each side. */
export function centeredRect(width: number, height: number, fraction: number): Rect {
  const w = Math.max(1, Math.round(width * fraction));
  const h = Math.max(1, Math.round(height * fraction));
  return { x: Math.round((width - w) / 2), y: Math.round((height - h) / 2), w, h };
}

/** "#ff8800" → { r: 255, g: 136, b: 0 } */
export function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** "#ff8800" → 0xff8800ff, the RGBA integer Jimp uses for colors. */
export function hexToInt(hex: string, alpha = 255) {
  return ((parseInt(hex.replace("#", ""), 16) << 8) | alpha) >>> 0;
}

/** 0xff8800ff → "0xff8800ff" */
export function intToHexLiteral(n: number) {
  return `0x${n.toString(16).padStart(8, "0")}`;
}

/* ---------- Syntax highlighting for the live code panel ---------- */

const KEYWORDS =
  /^(import|from|const|let|await|async|new|true|false|return|export|default|of|as|if|for|throw|function|type|interface|extends|typeof|this|null|undefined)$/;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Highlight one line of JavaScript as HTML. Good enough for generated snippets. */
export function highlight(line: string): string {
  let code = line;
  let comment = "";
  const commentAt = line.search(/\/\/(?![^"]*"[^"]*$)/);
  if (commentAt >= 0) {
    code = line.slice(0, commentAt);
    comment = line.slice(commentAt);
  }

  const re =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(\b0x[0-9a-f]+\b|\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)(?=\s*[(<])|(\.[A-Za-z_$][\w$]*)|(\b[A-Za-z_$][\w$]*\b)|([{}()[\];,=<>|:?])/gi;

  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    out += escapeHtml(code.slice(last, m.index));
    const [token, str, number, fn, prop, word, punct] = m;
    if (str) out += `<span class="tk-s">${escapeHtml(str)}</span>`;
    else if (number) out += `<span class="tk-n">${number}</span>`;
    else if (fn) out += `<span class="${KEYWORDS.test(fn) ? "tk-k" : "tk-f"}">${fn}</span>`;
    else if (prop) out += `.<span class="tk-p">${escapeHtml(prop.slice(1))}</span>`;
    else if (word) out += KEYWORDS.test(word) ? `<span class="tk-k">${word}</span>` : escapeHtml(word);
    else if (punct) out += `<span class="tk-b">${escapeHtml(punct)}</span>`;
    else out += escapeHtml(token);
    last = m.index + token.length;
  }
  out += escapeHtml(code.slice(last));
  if (comment) out += `<span class="tk-c">${escapeHtml(comment)}</span>`;
  return out;
}
