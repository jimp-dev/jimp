import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { categories, categoryIds } from "../../data/categories";
import { methods, methodsByName } from "../../data/methods";
import { resolveIcon, svg, uiIcon } from "../icons";
import { highlight } from "./code";
import { Controls } from "./Controls";
import {
  PREVIEW_WIDTH,
  errorMessage,
  fitWidth,
  loadFile,
  loadImage,
  opContext,
  toDataUrl,
} from "./images";
import { defaultOptions, getOp, ops as allOps } from "./registry";
import type { AnyOp, JimpInstance, OptionValue, Options, Point, Rect, Step } from "./types";
import "./playground.css";

export interface PlaygroundProps {
  /** Op ids to show as tool buttons (multi-tool mode). Defaults to every op. */
  tools?: string[];
  /** Show a single op's options only (single-method mode), e.g. `method="blur"`. */
  method?: string;
  /** Steps to apply when the image loads, e.g. `[{ op: "resize", options: { w: 200 } }]`. */
  steps?: Step[];
  /** Image in `public/` to start with. Defaults to "dice.png". */
  src?: string;
  /** Minimum height of the image area in pixels. */
  height?: number;
  /** Which code flavour to show first. */
  flavor?: "node" | "browser";
  /** Title in the playground's top bar. */
  title?: string;
  /** Sort the tool buttons into labelled rows by category. */
  grouped?: boolean;
}

interface Source {
  image: JimpInstance;
  dataUrl: string;
  name: string;
  uploaded: boolean;
  resized: boolean;
}

interface Entry {
  op: AnyOp;
  opts: Options;
  image: JimpInstance;
  dataUrl: string;
}

interface Frame {
  image: JimpInstance;
  dataUrl: string;
}

interface PlaygroundError {
  message: string;
  call?: string;
}

interface CodeLine {
  text: string;
  color?: string;
  fresh?: boolean;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const cssVars = (vars: Record<string, string>) => vars as CSSProperties;
const isRect = (value: Point | Rect): value is Rect => "w" in value;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const safeFileName = (name: string) => name.replace(/[^\w.-]/g, "_").slice(0, 40) || "upload.png";
const groupColor = (op: AnyOp) => categories[op.group]?.color ?? "#fff";

/** Every op, in the same order as the method reference. */
const referenceOrder = new Map(methods.map((entry, i) => [entry.method, i]));
const opsInReferenceOrder = [...allOps].sort(
  (a, b) =>
    (referenceOrder.get(a.method ?? a.id) ?? Infinity) -
    (referenceOrder.get(b.method ?? b.id) ?? Infinity),
);

/** The line of an op's code that calls the method, for multi-line snippets. */
const callLine = (code: string) => {
  const lines = code.trim().split("\n");
  return (lines.find((line) => /\bimage\.\w+\(/.test(line)) ?? lines[lines.length - 1]).trim();
};

export default function Playground({
  tools,
  method,
  steps,
  src = "dice.png",
  height = 260,
  flavor: initialFlavor = "node",
  title,
  grouped = false,
}: PlaygroundProps) {
  const single = Boolean(method);
  const toolOps = useMemo(() => {
    const ids = method ? [method] : (tools ?? opsInReferenceOrder.map((op) => op.id));
    return ids.flatMap((id) => {
      const op = getOp(id);
      if (!op) console.warn(`[playground] Unknown op "${id}"`);
      return op ? [op] : [];
    });
  }, [method, tools]);

  const [source, setSource] = useState<Source | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [optsById, setOptsById] = useState<Record<string, Options>>({});
  const [selected, setSelected] = useState(
    () => method ?? steps?.[steps.length - 1]?.op ?? toolOps[0]?.id ?? "",
  );
  const [flavor, setFlavor] = useState(initialFlavor);
  const [error, setError] = useState<PlaygroundError | null>(null);
  const [busy, setBusy] = useState(0);
  const [comparing, setComparing] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);
  const [preview, setPreview] = useState<Point | Rect | null>(null);
  const [fresh, setFresh] = useState(-1);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

  // Async work reads the latest state through refs.
  const sourceRef = useRef<Source | null>(null);
  const historyRef = useRef<Entry[]>([]);
  const optsRef = useRef<Record<string, Options>>({});
  const queue = useRef<Promise<void>>(Promise.resolve());
  const generation = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>();
  const dragStart = useRef<Point | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const commitHistory = (next: Entry[]) => {
    historyRef.current = next;
    setHistory(next);
  };
  const commitOpts = (id: string, opts: Options | null) => {
    const next = { ...optsRef.current };
    if (opts) next[id] = opts;
    else delete next[id];
    optsRef.current = next;
    setOptsById(next);
  };

  /** The image a step of `opId` starts from: before the last step if it's being replaced. */
  const inputFrame = useCallback((opId: string, replace: boolean): Frame | null => {
    const src = sourceRef.current;
    if (!src) return null;
    const hist = historyRef.current;
    const replacing = replace && hist[hist.length - 1]?.op.id === opId;
    return (replacing ? hist[hist.length - 2] : hist[hist.length - 1]) ?? src;
  }, []);

  const optionsFor = useCallback(
    (op: AnyOp) => {
      const frame = inputFrame(op.id, true);
      const size = frame?.image.bitmap ?? { width: PREVIEW_WIDTH, height: PREVIEW_WIDTH * 0.75 };
      return optsRef.current[op.id] ?? defaultOptions(op, size);
    },
    [inputFrame],
  );

  const enqueue = useCallback((task: () => Promise<void>) => {
    queue.current = queue.current.then(task).catch((e) => console.error(e));
    return queue.current;
  }, []);

  /** Apply an op as a new step, or re-run it in place when `replace` and it's the last step. */
  const run = useCallback(
    (opId: string, { replace = false, opts }: { replace?: boolean; opts?: Options } = {}) => {
      const gen = generation.current;
      return enqueue(async () => {
        const op = getOp(opId);
        const hist = historyRef.current;
        const replacing = replace && hist[hist.length - 1]?.op.id === opId;
        const base = inputFrame(opId, replace);
        if (!op || !base || gen !== generation.current) return;

        const options = opts ?? optsRef.current[opId] ?? defaultOptions(op, base.image.bitmap);
        commitOpts(opId, options);
        setBusy((n) => n + 1);
        try {
          const image = base.image.clone();
          await op.apply(image, options, opContext);
          const dataUrl = await toDataUrl(image);
          if (gen !== generation.current) return;
          const entry: Entry = { op, opts: options, image, dataUrl };
          const next = replacing ? [...hist.slice(0, -1), entry] : [...hist, entry];
          commitHistory(next);
          setFresh(next.length - 1);
          setError(null);
        } catch (e) {
          setError({ message: errorMessage(e), call: op.code(options) });
        } finally {
          setBusy((n) => n - 1);
        }
      });
    },
    [enqueue, inputFrame],
  );

  /** Start over with a new source image and replay the initial steps. */
  const applySource = useCallback(
    async (image: JimpInstance, name: string, uploaded: boolean) => {
      generation.current += 1;
      const resized = fitWidth(image, PREVIEW_WIDTH);
      const next: Source = { image, dataUrl: await toDataUrl(image), name, uploaded, resized };
      sourceRef.current = next;
      setSource(next);
      commitHistory([]);
      optsRef.current = {};
      setOptsById({});
      setError(null);
      setPicking(null);

      const initial: Step[] = method ? [{ op: method }] : (steps ?? []);
      for (const step of initial) {
        const op = getOp(step.op);
        if (!op) continue;
        const base = historyRef.current[historyRef.current.length - 1]?.image ?? image;
        await run(step.op, { opts: { ...defaultOptions(op, base.bitmap), ...step.options } });
      }
    },
    [method, steps, run],
  );

  useEffect(() => {
    let cancelled = false;
    loadImage(src)
      .then((image) => {
        if (!cancelled) return applySource(image, src.split("/").pop() ?? src, false);
      })
      .catch((e) => setError({ message: `Couldn't load ${src}: ${errorMessage(e)}` }));
    return () => {
      cancelled = true;
    };
    // Load once per image; applySource is stable for a given set of props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => () => clearTimeout(debounce.current), []);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy((n) => n + 1);
    try {
      await applySource(await loadFile(file), safeFileName(file.name), true);
    } catch (e) {
      setError({
        message: `Couldn't read that file (${errorMessage(e)}). Try a PNG, JPEG, GIF, BMP or TIFF.`,
      });
    } finally {
      setBusy((n) => n - 1);
    }
  }

  const op = getOp(selected) ?? toolOps[0];
  const values = op ? (optsById[op.id] ?? optionsFor(op)) : {};

  function changeOption(key: string, value: OptionValue, live = false) {
    if (!op) return;
    const next = { ...optionsFor(op), [key]: value };
    commitOpts(op.id, next);
    clearTimeout(debounce.current);
    const go = () => run(op.id, { replace: true, opts: next });
    if (live) debounce.current = setTimeout(go, 120);
    else go();
  }

  function selectTool(id: string) {
    setSelected(id);
    setPicking(null);
    run(id);
  }

  function undo() {
    commitHistory(historyRef.current.slice(0, -1));
    setError(null);
  }

  function reset() {
    commitHistory([]);
    optsRef.current = {};
    setOptsById({});
    setError(null);
  }

  /* ---------- Picking points and regions on the image ---------- */

  const pickControl = op?.controls.find((c) => c.key === picking);
  const pickFrame = picking && op ? inputFrame(op.id, true) : null;

  function toImagePoint(e: ReactPointerEvent): Point | null {
    const img = imgRef.current;
    if (!img || !pickFrame) return null;
    const box = img.getBoundingClientRect();
    const { width, height } = pickFrame.image.bitmap;
    return {
      x: Math.round(clamp(((e.clientX - box.left) / box.width) * width, 0, width)),
      y: Math.round(clamp(((e.clientY - box.top) / box.height) * height, 0, height)),
    };
  }

  function pickDown(e: ReactPointerEvent) {
    const point = toImagePoint(e);
    if (!point || !pickControl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = point;
    setPreview(pickControl.type === "rect" ? { ...point, w: 0, h: 0 } : point);
  }

  function pickMove(e: ReactPointerEvent) {
    const start = dragStart.current;
    const point = toImagePoint(e);
    if (!start || !point || !pickControl) return;
    setPreview(
      pickControl.type === "rect"
        ? {
            x: Math.min(start.x, point.x),
            y: Math.min(start.y, point.y),
            w: Math.abs(point.x - start.x),
            h: Math.abs(point.y - start.y),
          }
        : point,
    );
  }

  function pickUp() {
    const value = preview;
    dragStart.current = null;
    setPreview(null);
    if (!value || !picking) return;
    if (isRect(value) && (value.w < 2 || value.h < 2)) return;
    setPicking(null);
    changeOption(picking, value);
  }

  useEffect(() => {
    if (!picking) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPicking(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [picking]);

  /* ---------- Code panel ---------- */

  const codeLines = useMemo((): CodeLine[] => {
    const imports = new Map<string, Set<string>>([["jimp", new Set(["Jimp"])]]);
    for (const entry of history) {
      for (const [module, names] of Object.entries(entry.op.imports?.(entry.opts) ?? {})) {
        const set = imports.get(module) ?? new Set<string>();
        names?.forEach((name) => set.add(name));
        imports.set(module, set);
      }
    }

    const lines: CodeLine[] = [...imports].map(([module, names]) => ({
      text: `import { ${[...names].join(", ")} } from "${module}";`,
    }));
    lines.push({ text: "" });

    const name = source?.name ?? src;
    if (flavor === "browser" && source?.uploaded) {
      lines.push({ text: '// `file` comes from an <input type="file">' });
      lines.push({ text: "const image = await Jimp.fromBuffer(await file.arrayBuffer());" });
    } else {
      lines.push({ text: `const image = await Jimp.read("${name}");` });
    }
    if (source?.resized) {
      lines.push({ text: `image.resize({ w: ${PREVIEW_WIDTH} }); // preview size` });
    }
    lines.push({ text: "" });

    if (!history.length) {
      lines.push({
        text: single ? "// Change an option to run it" : "// Click a method above to add it here",
      });
    }
    history.forEach((entry, i) => {
      for (const text of entry.op.code(entry.opts).split("\n")) {
        lines.push({ text, color: groupColor(entry.op), fresh: i === fresh });
      }
    });

    lines.push({ text: "" });
    lines.push({
      text:
        flavor === "node"
          ? 'await image.write("output.png");'
          : 'document.querySelector("img").src = await image.getBase64("image/png");',
    });
    return lines;
  }, [history, source, flavor, fresh, single, src]);

  function copyCode() {
    navigator.clipboard
      ?.writeText(codeLines.map((line) => line.text).join("\n"))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1300);
      })
      .catch(() => {});
  }

  /* ---------- Render ---------- */

  const last = history[history.length - 1];
  const current: Frame | null = last ?? source;
  const shown = comparing ? source : (pickFrame ?? current);
  const lastCall = op ? callLine(op.code(values)).replace(/;$/, "") : undefined;
  const docsEntry = op ? methodsByName.get(op.method ?? op.id) : undefined;
  const isLastStep = Boolean(op && last?.op.id === op.id);

  const toolGroups = categoryIds.flatMap((group) => {
    const inGroup = toolOps.filter((tool) => tool.group === group);
    return inGroup.length ? [[group, inGroup] as const] : [];
  });

  const renderTool = (tool: AnyOp) => (
    <button
      key={tool.id}
      type="button"
      className="pg-tool"
      aria-pressed={tool.id === op?.id}
      title={tool.description}
      onClick={() => selectTool(tool.id)}
    >
      <span
        className="pg-ic"
        style={cssVars({ "--c": groupColor(tool) })}
        dangerouslySetInnerHTML={{ __html: svg(resolveIcon(tool.icon)) }}
      />
      {tool.label}
    </button>
  );

  const overlayValue =
    picking && pickFrame ? (preview ?? (values[picking] as Point | Rect | undefined)) : null;
  const pct = (n: number, of: number) => `${(n / of) * 100}%`;

  if (!toolOps.length) {
    return <div className="pg pg-empty">No playground ops match “{method ?? tools?.join(", ")}”.</div>;
  }

  return (
    <div className={`pg not-content${single ? " pg-single" : ""}`} data-pagefind-ignore>
      <div className="pg-bar">
        <span
          className="pg-logo"
          dangerouslySetInnerHTML={{ __html: svg(resolveIcon("palette")) }}
        />
        <b className="pg-title">{single && op ? `Try ${op.label}()` : (title ?? "Playground")}</b>
        {/* Hold the label's space while the image loads so the bar doesn't
            rewrap when it appears. The previews are 3-digit sizes. */}
        <span className="pg-file" style={source ? undefined : { visibility: "hidden" }}>
          {source
            ? `${source.name} · ${source.image.bitmap.width}×${source.image.bitmap.height}`
            : `${src.split("/").pop()} · 000×000`}
        </span>
        <span className="pg-grow" />
        <div className="pg-seg" role="group" aria-label="Code for">
          {(["node", "browser"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={flavor === f} onClick={() => setFlavor(f)}>
              {f === "node" ? "Node" : "Browser"}
            </button>
          ))}
        </div>
        <label className="pg-upload">
          <span dangerouslySetInnerHTML={{ __html: uiIcon("upload") }} />
          Upload
          <input
            type="file"
            className="sr-only"
            accept="image/png,image/jpeg,image/gif,image/bmp,image/tiff"
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {!single && grouped && (
        <div className="pg-tool-groups">
          {toolGroups.map(([group, tools]) => (
            <div key={group} className="pg-tool-group">
              <span className="pg-group-label" style={cssVars({ "--c": categories[group].color })}>
                {categories[group].label}
              </span>
              <div className="pg-tools" role="toolbar" aria-label={categories[group].label}>
                {tools.map(renderTool)}
              </div>
            </div>
          ))}
        </div>
      )}

      {!single && !grouped && (
        <div className="pg-tools" role="toolbar" aria-label="Jimp methods">
          {toolOps.map(renderTool)}
        </div>
      )}

      <div className="pg-grid">
        {op && (
          <div className="pg-opts" style={cssVars({ "--c": groupColor(op) })}>
            <div className="pg-oh">
              <code className="pg-sig">{lastCall}</code>
              {!single && docsEntry && (
                <a className="pg-doc" href={`${BASE}/methods/${docsEntry.slug}/`}>
                  Docs →
                </a>
              )}
            </div>
            <p className="pg-desc">{op.description}</p>
            <Controls
              controls={op.controls}
              values={values}
              onChange={changeOption}
              onPick={(key) => setPicking((p) => (p === key ? null : key))}
              picking={picking}
            />
            <button type="button" className="pg-again" onClick={() => run(op.id)}>
              {isLastStep ? "Apply again" : "Apply"}
            </button>
          </div>
        )}

        <div className="pg-stage">
          <div
            className={`pg-easel${dragOver ? " is-drag" : ""}${picking ? " is-picking" : ""}`}
            style={{ minHeight: height }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              upload(e.dataTransfer.files[0]);
            }}
          >
            {shown ? (
              <div
                className="pg-frame"
                onPointerDown={picking ? pickDown : undefined}
                onPointerMove={picking ? pickMove : undefined}
                onPointerUp={picking ? pickUp : undefined}
              >
                <img
                  ref={imgRef}
                  src={shown.dataUrl}
                  alt={comparing ? "The original image" : "The image with the code applied"}
                  draggable={false}
                />
                {overlayValue && pickFrame && (
                  <div className="pg-overlay" aria-hidden="true">
                    {isRect(overlayValue) ? (
                      <span
                        className="pg-rect"
                        style={{
                          left: pct(overlayValue.x, pickFrame.image.bitmap.width),
                          top: pct(overlayValue.y, pickFrame.image.bitmap.height),
                          width: pct(overlayValue.w, pickFrame.image.bitmap.width),
                          height: pct(overlayValue.h, pickFrame.image.bitmap.height),
                        }}
                      />
                    ) : (
                      <span
                        className="pg-point"
                        style={{
                          left: pct(overlayValue.x, pickFrame.image.bitmap.width),
                          top: pct(overlayValue.y, pickFrame.image.bitmap.height),
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              !error && <span className="pg-loading">Loading Jimp…</span>
            )}
            {picking && (
              <span className="pg-hint">
                {pickControl?.type === "rect" ? "Drag to select a region" : "Click to pick a point"} ·
                Esc to cancel
              </span>
            )}
            {busy > 0 && (
              <span className="pg-busy">
                <i />
                Processing
              </span>
            )}
            {error && (
              <div className="pg-err" role="alert">
                <b>Error:</b> {error.message}
                {error.call && (
                  <>
                    {" "}
                    from <code>{callLine(error.call)}</code>
                  </>
                )}
                <button type="button" aria-label="Dismiss error" onClick={() => setError(null)}>
                  ×
                </button>
              </div>
            )}
            <span className="pg-drop">Drop an image to load it</span>
          </div>

          <div className="pg-act">
            <button
              type="button"
              className="pg-btn"
              style={cssVars({ "--bc": "var(--jp-yellow)" })}
              disabled={!history.length}
              onClick={undo}
              title="Undo the last step"
            >
              <span dangerouslySetInnerHTML={{ __html: uiIcon("undo") }} />
              Undo <span className="pg-n">{history.length}</span>
            </button>
            <button
              type="button"
              className="pg-btn"
              disabled={!history.length}
              onClick={reset}
              title="Back to the original image"
            >
              <span dangerouslySetInnerHTML={{ __html: uiIcon("reset") }} />
              Reset
            </button>
            <button
              type="button"
              className="pg-btn"
              title="Hold to show the original"
              aria-pressed={comparing}
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
              style={cssVars({ "--bc": "var(--jp-mint)" })}
              href={current?.dataUrl}
              download="output.png"
              aria-disabled={!current}
            >
              <span dangerouslySetInnerHTML={{ __html: uiIcon("download") }} />
              PNG
            </a>
            {current && (
              <span className="pg-meta">
                {current.image.bitmap.width} × {current.image.bitmap.height}
              </span>
            )}
          </div>
        </div>

        <div className="pg-code">
          <div className="pg-ch">
            <span>{flavor === "node" ? "index.js" : "main.js"}</span>
            <span className="pg-grow" />
            <button type="button" onClick={copyCode}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="pg-live">
            {codeLines.map((line, i) => (
              <span
                key={`${i}:${line.text}`}
                className={`pg-row${line.color ? " is-op" : ""}${line.fresh ? " is-fresh" : ""}`}
                style={line.color ? cssVars({ "--dot": line.color }) : undefined}
                dangerouslySetInnerHTML={{ __html: highlight(line.text) || " " }}
              />
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
