/**
 * Hand-drawn icons shared by the Astro components and the playground.
 *
 * Each value is the inner markup of an SVG with `viewBox="0 0 32 32"`
 * (UI icons use 24x24). Use `svg()` to wrap one.
 */
const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;

/** Icons for playground tools and method stickers, keyed by method name. */
export const toolIcons: Record<string, string> = {
  resize: `<rect x="10" y="10" width="12" height="12" rx="2" fill="#3fe0b5" ${S}/><path d="M3 3l6 6M29 3l-6 6M3 29l6-6M29 29l-6-6M9 4v5H4M23 4v5h5M9 28v-5H4M23 28v-5h5" fill="none" ${S}/>`,
  crop: `<circle cx="8" cy="24" r="4" fill="#ff4b4b" ${S}/><circle cx="20" cy="26" r="4" fill="#ff4b4b" ${S}/><path d="M11 21 26 4M17 23 10 6" ${S}/><circle cx="14" cy="17" r="1.3" fill="${INK}"/>`,
  rotate: `<path d="M26 16a10 10 0 11-4-8" fill="none" ${S} stroke-width="4"/><path d="M26 16a10 10 0 11-4-8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M17 4l6 4-5 5" fill="none" ${S} stroke-width="3.2"/>`,
  flip: `<path d="M16 3v26" ${S} stroke-dasharray="3 3"/><path d="M13 8 4 22h9z" fill="#ff5fb0" ${S}/><path d="M19 8l9 14h-9z" fill="#fff" ${S}/>`,
  fisheye: `<circle cx="16" cy="16" r="12" fill="#a9e4ff" ${S}/><path d="M6 16q10-9 20 0M6 16q10 9 20 0" fill="none" ${S} stroke-width="2"/><circle cx="16" cy="16" r="4.5" fill="#fff" ${S} stroke-width="2.2"/><circle cx="16" cy="16" r="1.8" fill="${INK}"/>`,
  circle: `<path d="M27 12a4 4 0 01-5-5 4 4 0 01-3-3A12.5 12.5 0 1027 12z" fill="#e0a560" ${S}/><circle cx="12" cy="13" r="1.8" fill="#3b2a1a"/><circle cx="18" cy="20" r="1.8" fill="#3b2a1a"/><circle cx="10" cy="21" r="1.5" fill="#3b2a1a"/>`,
  blur: `<circle cx="16" cy="16" r="13" fill="none" ${S} stroke-dasharray="1.5 3.2"/><circle cx="16" cy="16" r="8.5" fill="#c9a8ff" ${S}/><circle cx="13" cy="13" r="2.5" fill="#fff" opacity=".8"/>`,
  gaussian: `<circle cx="16" cy="16" r="14" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="1 3" stroke-linecap="round"/><circle cx="16" cy="16" r="10" fill="none" ${S} stroke-dasharray="1.5 3.2"/><circle cx="16" cy="16" r="6" fill="#ff9ccf" ${S}/>`,
  pixelate: `<g ${S}><rect x="4" y="4" width="8" height="8" fill="#ff4b4b"/><rect x="12" y="4" width="8" height="8" fill="#ffd83a"/><rect x="20" y="4" width="8" height="8" fill="#3a7bff"/><rect x="4" y="12" width="8" height="8" fill="#22c76b"/><rect x="12" y="12" width="8" height="8" fill="#fff"/><rect x="20" y="12" width="8" height="8" fill="#ff5fb0"/><rect x="4" y="20" width="8" height="8" fill="#8b46ff"/><rect x="12" y="20" width="8" height="8" fill="#ff8f1f"/><rect x="20" y="20" width="8" height="8" fill="#5cc8ff"/></g>`,
  dither: `<g fill="#3a7bff" ${S} stroke-width="2"><circle cx="7" cy="7" r="3.5"/><circle cx="16" cy="7" r="2.5"/><circle cx="25" cy="7" r="1.5"/><circle cx="7" cy="16" r="2.5"/><circle cx="16" cy="16" r="3.5"/><circle cx="25" cy="16" r="2.5"/><circle cx="7" cy="25" r="1.5"/><circle cx="16" cy="25" r="2.5"/><circle cx="25" cy="25" r="3.5"/></g>`,
  color: `<path d="M3 24a13 13 0 0126 0" fill="none" stroke="#ff4b4b" stroke-width="4"/><path d="M7 24a9 9 0 0118 0" fill="none" stroke="#ffd83a" stroke-width="4"/><path d="M11 24a5 5 0 0110 0" fill="none" stroke="#3a7bff" stroke-width="4"/><path d="M1 24a15 15 0 0130 0M13 24a3 3 0 016 0" fill="none" ${S}/>`,
  greyscale: `<rect x="4" y="6" width="8" height="20" fill="#e4e2ee"/><rect x="12" y="6" width="8" height="20" fill="#9c98b6"/><rect x="20" y="6" width="8" height="20" fill="#4b4766"/><rect x="4" y="6" width="24" height="20" rx="3" fill="none" ${S}/>`,
  invert: `<rect x="4" y="4" width="16" height="16" rx="3" fill="${INK}" ${S}/><rect x="12" y="12" width="16" height="16" rx="3" fill="#fff" ${S}/><path d="M12 12h8v8" fill="none" stroke="#fff" stroke-width="2.2"/>`,
  sepia: `<rect x="4" y="6" width="24" height="20" rx="3" fill="#f1d7ae" ${S}/><path d="M4 22l8-8 6 6 4-4 6 6v1a3 3 0 01-3 3H7a3 3 0 01-3-3z" fill="#a86b32" ${S}/><circle cx="22" cy="11.5" r="2.8" fill="#fff6e0" ${S} stroke-width="2"/>`,
  posterize: `<path d="M16 2l3.5 8.5L28 11l-6.5 6 2 9L16 21l-7.5 5 2-9L4 11l8.5-.5z" fill="#ff5fb0" ${S}/><path d="M16 9l1.6 4 4.4.3-3.3 2.8 1 4.4L16 18l-3.7 2.5 1-4.4L10 13.3l4.4-.3z" fill="#ffd83a"/>`,
  threshold: `<path d="M16 4c3 0 3 5 6 5s5-2 6 1-3 4-2 7 4 4 2 7-5 0-7 2-2 4-5 4-3-3-6-3-6 2-7-1 3-4 2-7-4-3-3-6 5-1 6-4 5-5 8-5z" fill="${INK}" ${S}/><circle cx="27" cy="27" r="2" fill="${INK}"/>`,
  brightness: `<circle cx="16" cy="16" r="6.5" fill="#ffd83a" ${S}/><path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l3 3M23 23l3 3M26 6l-3 3M9 23l-3 3" ${S}/>`,
  contrast: `<circle cx="16" cy="16" r="12" fill="#fff" ${S}/><path d="M16 4a12 12 0 010 24z" fill="${INK}"/>`,
  normalize: `<path d="M3 28h26" ${S}/><g ${S}><rect x="5" y="16" width="5" height="12" fill="#ff4b4b"/><rect x="11" y="8" width="5" height="20" fill="#ffd83a"/><rect x="17" y="12" width="5" height="16" fill="#22c76b"/><rect x="23" y="5" width="5" height="23" fill="#3a7bff"/></g>`,
  opacity: `<path d="M6 28V14a10 10 0 0120 0v14l-3.3-3-3.3 3-3.4-3-3.3 3-3.4-3z" fill="#fff" ${S}/><circle cx="12.5" cy="14" r="2" fill="${INK}"/><circle cx="19.5" cy="14" r="2" fill="${INK}"/>`,
  palette: `<path d="M16 3C8 3 3 9 3 15c0 7 6 10 10 9 3 0 3-3 5-3 3 0 4 4 8 2s5-6 5-9C31 8 25 3 16 3z" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="10" cy="12" r="2.6" fill="#ff4b4b"/><circle cx="16" cy="9" r="2.6" fill="#ffd83a"/><circle cx="22" cy="11" r="2.6" fill="#22c76b"/><circle cx="24" cy="17" r="2.6" fill="#8b46ff"/>`,
};

/** Fallback sticker icons for methods that can't be shown as a thumbnail. */
export const categoryIcons: Record<string, string> = {
  io: `<path d="M7 4h13l5 5v19H7z" fill="#fff" ${S}/><path d="M20 4v5h5" fill="none" ${S}/><path d="M16 12v10M12 18l4 4 4-4" fill="none" ${S}/>`,
  shape: toolIcons.resize!,
  effects: toolIcons.blur!,
  color: toolIcons.color!,
  compose: `<rect x="4" y="4" width="16" height="16" rx="3" fill="#ffb35c" ${S}/><rect x="12" y="12" width="16" height="16" rx="3" fill="#5cc8ff" ${S} opacity=".92"/>`,
  draw: `<path d="M4 25c4-6 8 2 12-4s6-3 9-1" fill="none" ${S}/><path d="M20 4l8 8-11 11-5 1 1-5z" fill="#b5e86b" ${S}/><path d="M17 7l8 8" ${S}/>`,
  text: `<path d="M6 7h20v5M6 7v5M16 7v19M12 26h8" fill="none" ${S} stroke-width="3"/><path d="M22 18l6 0" ${S}/>`,
  pixels: `<g ${S} stroke-width="2"><rect x="4" y="4" width="8" height="8" fill="#8ff0c8"/><rect x="12" y="4" width="8" height="8" fill="#fff"/><rect x="20" y="4" width="8" height="8" fill="#8ff0c8"/><rect x="4" y="12" width="8" height="8" fill="#fff"/><rect x="12" y="12" width="8" height="8" fill="#ff5fb0"/><rect x="20" y="12" width="8" height="8" fill="#fff"/><rect x="4" y="20" width="8" height="8" fill="#8ff0c8"/><rect x="12" y="20" width="8" height="8" fill="#fff"/><rect x="20" y="20" width="8" height="8" fill="#8ff0c8"/></g>`,
  compare: `<rect x="3" y="7" width="12" height="18" rx="2" fill="#ff8f8f" ${S}/><rect x="17" y="7" width="12" height="18" rx="2" fill="#fff" ${S}/><path d="M7 16h4M21 14h4M21 18h4" ${S}/>`,
  utils: `<path d="M20 4a7 7 0 00-6.5 9.5L4 23a3 3 0 004 4l9.5-9.5A7 7 0 0028 11l-4 4-5-1-1-5 4-4z" fill="#d9d6ea" ${S}/>`,
};

/** Icons for guides, concepts and home page feature cards. */
export const guideIcons: Record<string, string> = {
  start: `<path d="M7 4h14l5 5v19H7z" fill="#fff" ${S}/><path d="M11 13h10M11 18h10M11 23h6" ${S}/>`,
  browser: `<rect x="3" y="6" width="26" height="20" rx="3" fill="#fff" ${S}/><path d="M3 11h26" ${S}/><circle cx="7" cy="8.5" r="1" fill="${INK}"/><path d="M12 17l-3 2 3 2M20 17l3 2-3 2" ${S}/>`,
  large: `<rect x="3" y="3" width="26" height="26" rx="4" fill="#fff" ${S}/><path d="M9 15V9h6M23 17v6h-6M9 9l14 14" ${S}/>`,
  colorSpace: `<path d="M16 3 29 27H3z" fill="#fff" ${S}/><path d="M16 9l8 15H8z" fill="#ff5fb0" ${S} stroke-width="2"/><circle cx="16" cy="19" r="2.2" fill="${INK}"/>`,
  exif: `<rect x="4" y="9" width="24" height="17" rx="3" fill="#fff" ${S}/><path d="M11 9l2-4h6l2 4" ${S}/><circle cx="16" cy="17" r="5" fill="#5cc8ff" ${S}/>`,
  plugin: `<path d="M6 12h6V8a3 3 0 016 0v4h6v6h-3a3 3 0 000 6h3v4H6z" fill="#fff" ${S}/>`,
  custom: `<path d="M16 4l3 3h5v5l3 4-3 4v5h-5l-3 3-3-3H8v-5l-3-4 3-4V7h5z" fill="#fff" ${S}/><circle cx="16" cy="16" r="4" fill="#ffd83a" ${S}/>`,
  wasm: `<path d="M16 3l11 6v14l-11 6-11-6V9z" fill="#fff" ${S}/><path d="M10 13l2 7 2-5 2 5 2-7M20 13h3" ${S} stroke-width="2"/>`,
  server: `<rect x="4" y="4" width="24" height="10" rx="3" fill="#fff" ${S}/><rect x="4" y="18" width="24" height="10" rx="3" fill="#ff8f1f" ${S}/><circle cx="9" cy="9" r="1.6" fill="${INK}"/><circle cx="9" cy="23" r="1.6" fill="${INK}"/><path d="M15 9h8M15 23h8" ${S} stroke-width="2"/>`,
  migrate: `<path d="M5 22c0-7 5-12 12-12h7" fill="none" ${S}/><path d="M20 5l5 5-5 5" fill="none" ${S}/><circle cx="7" cy="25" r="3" fill="#ffd83a" ${S}/>`,
  api: `<path d="M16 3l3.6 8 8.4.8-6.4 5.6 2 8.6L16 21.6 8.4 26l2-8.6L4 11.8l8.4-.8z" fill="#fff" ${S}/>`,
  file: categoryIcons.io!,
  formats: `<rect x="4" y="6" width="24" height="20" rx="3" fill="#5cc8ff" ${S}/><path d="M4 22l8-8 6 6 4-4 6 6" fill="#22c76b" ${S}/><circle cx="22" cy="11" r="3" fill="#ffd83a" ${S}/>`,
  pixels: categoryIcons.pixels!,
  layers: categoryIcons.compose!,
  draw: categoryIcons.draw!,
  text: categoryIcons.text!,
  chain: `<rect x="3" y="11" width="14" height="10" rx="5" fill="none" ${S} stroke-width="3"/><rect x="15" y="11" width="14" height="10" rx="5" fill="none" ${S} stroke-width="3"/>`,
  alert: `<path d="M16 4 29 27H3z" fill="#ffd83a" ${S}/><path d="M16 12v7" ${S} stroke-width="3"/><circle cx="16" cy="23" r="1.6" fill="${INK}"/>`,
  list: `<path d="M12 9h15M12 16h15M12 23h15" ${S}/><circle cx="6" cy="9" r="2.2" fill="#ff4b4b" ${S} stroke-width="1.8"/><circle cx="6" cy="16" r="2.2" fill="#ffd83a" ${S} stroke-width="1.8"/><circle cx="6" cy="23" r="2.2" fill="#3a7bff" ${S} stroke-width="1.8"/>`,
  ts: `<rect x="4" y="4" width="24" height="24" rx="4" fill="#3a7bff" ${S}/><path d="M9 14h8M13 14v10M25 15c-1-1-2-1.5-3-1.5-1.6 0-2.6.9-2.6 2.1 0 3 5.6 1.8 5.6 5 0 1.3-1.1 2.4-3 2.4-1.3 0-2.4-.5-3.2-1.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  wand: `<path d="M6 26 22 10" ${S} stroke-width="5"/><path d="M6 26 22 10" stroke="#ff8f1f" stroke-width="2"/><path d="M24 2l1.5 4.5L30 8l-4.5 1.5L24 14l-1.5-4.5L18 8l4.5-1.5z" fill="#ffd83a" ${S}/>`,
};

/** Small UI icons (24x24). */
export const uiIcons: Record<string, string> = {
  undo: `<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>`,
  reset: `<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>`,
  eye: `<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="#fff"/><circle cx="12" cy="12" r="3" fill="#3a7bff"/>`,
  download: `<path d="M4 16v4h16v-4M12 4v12M7 11l5 5 5-5"/>`,
  upload: `<path d="M4 16v4h16v-4M12 4v12M7 9l5-5 5 5"/>`,
  arrow: `<path d="M5 12h13M13 6l6 6-6 6"/>`,
  target: `<circle cx="12" cy="12" r="8"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5"/>`,
  star: `<path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L3.3 9.2l6.1-.6z" fill="#ff5fb0"/>`,
  menu: `<path d="M4 7h16M4 12h16M4 17h16"/>`,
  search: `<circle cx="10.5" cy="10.5" r="6.5" fill="#ffd83a"/><path d="M15.5 15.5 21 21"/>`,
};

/** Wrap icon markup in an SVG element string. */
export function svg(
  inner: string,
  { viewBox = "0 0 32 32", className = "", stroke = "" } = {},
) {
  const strokeAttrs = stroke
    ? ` fill="none" stroke="${stroke}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"`
    : "";
  return `<svg viewBox="${viewBox}"${className ? ` class="${className}"` : ""} aria-hidden="true"${strokeAttrs}>${inner}</svg>`;
}

/** A 24x24 UI icon, drawn in ink (or white for `arrow` on colored buttons). */
export function uiIcon(name: keyof typeof uiIcons, color = INK) {
  return svg(uiIcons[name] ?? "", { viewBox: "0 0 24 24", stroke: color });
}

/** Resolve an icon name or raw SVG markup to inner SVG markup. */
export function resolveIcon(icon: string | undefined, fallback = "palette") {
  if (icon?.trimStart().startsWith("<")) return icon;
  return (
    (icon && (toolIcons[icon] ?? guideIcons[icon] ?? categoryIcons[icon])) ??
    toolIcons[fallback] ??
    ""
  );
}
