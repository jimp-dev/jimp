/**
 * A WebP encoder demo for the WEBP / WASM guide. It builds a custom Jimp with
 * @jimp/wasm-webp, decodes `public/tree.webp` (or an uploaded image), and
 * re-encodes it as WebP with the chosen options. It reuses the playground's
 * styles and controls so it matches the other demos on the site.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createJimp } from "@jimp/core";
import { defaultFormats, defaultPlugins } from "jimp";
import webp from "@jimp/wasm-webp";

import { svg, resolveIcon, uiIcon } from "./icons";
import { Controls } from "./playground/Controls";
import { highlight, js } from "./playground/code";
import type { Control, OptionValue } from "./playground/types";
import "./playground/playground.css";

const Jimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});

type WebpJimp = Awaited<ReturnType<typeof Jimp.read>>;

interface Source {
  image: WebpJimp;
  name: string;
  /** Size of the file the image came from, in bytes */
  bytes: number;
  /** Object URL of the original file, shown while comparing */
  url: string;
  resized: boolean;
}

interface Output {
  url: string;
  bytes: number;
  ms: number;
}

type Settings = { quality: number; lossless: boolean };

/** The WebP encode options this demo sets */
type WebpEncodeOptions = { lossless: 0 | 1 } | { quality: number };

const MAX_WIDTH = 720;
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const controls: Control<Settings>[] = [
  { type: "toggle", key: "lossless" },
  { type: "slider", key: "quality", min: 0, max: 100, step: 1, when: (o) => !o.lossless },
];

const formatBytes = (n: number) =>
  n < 1024 ? `${n} B` : `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;

function errorText(error: unknown) {
  if (error && typeof error === "object" && "issues" in error) {
    const { issues } = error as { issues: { path?: PropertyKey[]; message: string }[] };
    return issues.map((i) => `${i.path?.map(String).join(".") ?? ""}: ${i.message}`).join("; ");
  }
  return error instanceof Error ? error.message : String(error);
}

async function loadSource(data: ArrayBuffer, name: string, type: string): Promise<Source> {
  const image = await Jimp.fromBuffer(data);
  let resized = false;

  // Keep encoding fast while the slider moves
  if (image.width > MAX_WIDTH) {
    image.resize({ w: MAX_WIDTH });
    resized = true;
  }

  const url = URL.createObjectURL(new Blob([data], { type }));
  return { image, name, bytes: data.byteLength, url, resized };
}

export function WebpExample() {
  const [source, setSource] = useState<Source | null>(null);
  const [settings, setSettings] = useState<Settings>({ quality: 75, lossless: false });
  const [output, setOutput] = useState<Output | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [comparing, setComparing] = useState(false);
  const generation = useRef(0);

  // Load the sample image once
  useEffect(() => {
    fetch(`${BASE}/tree.webp`)
      .then((res) => res.arrayBuffer())
      .then((data) => loadSource(data, "tree.webp", "image/webp"))
      .then(setSource)
      .catch((e) => setError(errorText(e)));
  }, []);

  // Encode whenever the image or the settings change
  useEffect(() => {
    if (!source) return;
    const run = ++generation.current;
    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        const start = performance.now();
        const options: WebpEncodeOptions = settings.lossless
          ? { lossless: 1 }
          : { quality: settings.quality };
        const buffer = await source.image.getBuffer("image/webp", options);
        if (run !== generation.current) return;
        const url = URL.createObjectURL(new Blob([buffer], { type: "image/webp" }));
        setOutput((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          return { url, bytes: buffer.length, ms: performance.now() - start };
        });
        setError(null);
      } catch (e) {
        if (run === generation.current) setError(errorText(e));
      } finally {
        if (run === generation.current) setBusy(false);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [source, settings]);

  async function upload(file: File | undefined) {
    if (!file) return;
    try {
      const next = await loadSource(await file.arrayBuffer(), file.name, file.type);
      setSource((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return next;
      });
    } catch (e) {
      setError(errorText(e));
    }
  }

  const code = useMemo(() => {
    const options = settings.lossless ? { lossless: 1 } : { quality: settings.quality };
    const name = source?.name ?? "tree.webp";
    return [
      'import { createJimp } from "@jimp/core";',
      'import { defaultFormats, defaultPlugins } from "jimp";',
      'import webp from "@jimp/wasm-webp";',
      "",
      "const Jimp = createJimp({",
      "  formats: [...defaultFormats, webp],",
      "  plugins: defaultPlugins,",
      "});",
      "",
      `const image = await Jimp.read(${js(name)});`,
      ...(source?.resized ? [`image.resize({ w: ${MAX_WIDTH} }); // preview size`] : []),
      "",
      `const webpBuffer = await image.getBuffer("image/webp", ${js(options)});`,
    ];
  }, [settings, source]);

  const saved =
    source && output ? Math.round((1 - output.bytes / source.bytes) * 100) : null;
  const shown = comparing ? source?.url : output?.url;

  return (
    <div className="pg not-content" data-pagefind-ignore>
      <div className="pg-bar">
        <span className="pg-logo" dangerouslySetInnerHTML={{ __html: svg(resolveIcon("wasm")) }} />
        <b className="pg-title">WebP encoder</b>
        {source && (
          <span className="pg-file">
            {source.name} · {source.image.width}×{source.image.height} · {formatBytes(source.bytes)}
          </span>
        )}
        <span className="pg-grow" />
        <label className="pg-upload">
          <span dangerouslySetInnerHTML={{ __html: uiIcon("upload") }} />
          Upload
          <input
            type="file"
            className="sr-only"
            accept="image/webp,image/png,image/jpeg,image/gif,image/bmp,image/tiff"
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="pg-grid">
        <div className="pg-opts" style={{ ["--c" as string]: "#22c76b" }}>
          <div className="pg-oh">
            <code className="pg-sig">getBuffer("image/webp")</code>
          </div>
          <p className="pg-desc">
            Encode the image as WebP. Upload any PNG, JPEG, GIF, BMP, TIFF or WebP file to convert it.
          </p>
          <Controls
            controls={controls as Control[]}
            values={settings}
            onChange={(key: string, value: OptionValue) =>
              setSettings((s) => ({ ...s, [key]: value }))
            }
            onPick={() => {}}
            picking={null}
          />
        </div>

        <div className="pg-stage">
          <div
            className="pg-easel"
            style={{ minHeight: 260 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              upload(e.dataTransfer.files[0]);
            }}
          >
            {shown ? (
              <div className="pg-frame">
                <img
                  src={shown}
                  alt={comparing ? "The original image" : "The image encoded as WebP"}
                  draggable={false}
                />
              </div>
            ) : (
              !error && <span className="pg-loading">Loading the WebP codec…</span>
            )}
            {busy && (
              <span className="pg-busy">
                <i />
                Encoding
              </span>
            )}
            {error && (
              <div className="pg-err" role="alert">
                <b>Error:</b> {error}
                <button type="button" aria-label="Dismiss error" onClick={() => setError(null)}>
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="pg-act">
            <button
              type="button"
              className="pg-btn"
              title="Hold to show the original"
              aria-pressed={comparing}
              disabled={!source}
              onPointerDown={() => setComparing(true)}
              onPointerUp={() => setComparing(false)}
              onPointerLeave={() => setComparing(false)}
              onPointerCancel={() => setComparing(false)}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setComparing(true)}
              onKeyUp={() => setComparing(false)}
            >
              <span dangerouslySetInnerHTML={{ __html: uiIcon("eye") }} />
              Compare
            </button>
            <a
              className="pg-btn"
              style={{ ["--bc" as string]: "var(--jp-mint)" }}
              href={output?.url}
              download="output.webp"
              aria-disabled={!output}
            >
              <span dangerouslySetInnerHTML={{ __html: uiIcon("download") }} />
              WebP
            </a>
            {source && output && (
              <span className="pg-meta">
                {formatBytes(output.bytes)}
                {saved !== null && ` · ${saved >= 0 ? `${saved}% smaller` : `${-saved}% larger`}`}
                {` · ${Math.round(output.ms)} ms`}
              </span>
            )}
          </div>
        </div>

        <div className="pg-code">
          <div className="pg-ch">
            <span>index.js</span>
          </div>
          <pre className="pg-live">
            {code.map((line, i) => (
              <span
                key={`${i}:${line}`}
                className="pg-row"
                dangerouslySetInnerHTML={{ __html: highlight(line) || " " }}
              />
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
