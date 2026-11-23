import { useEffect, useState, type CSSProperties } from "react";
import { categories, type CategoryId } from "../../data/categories";
import { categoryIcons, resolveIcon, svg, toolIcons } from "../icons";
import { fitWidth, loadImage, opContext, toDataUrl } from "./images";
import { defaultOptions, opForMethod } from "./registry";
import type { Options } from "./types";
import "./playground.css";

export interface StickerItem {
  /** API name, e.g. "blur". Used to find the op for the thumbnail. */
  method: string;
  label: string;
  href: string;
  summary: string;
  category: CategoryId;
}

export interface StickerSheetProps {
  items: StickerItem[];
  /** Show the category chip on each sticker (useful when mixing categories). */
  showCategory?: boolean;
  /** Image in `public/` to render thumbnails from. */
  src?: string;
}

const TILTS = [-2, 1.5, -1, 2, -1.5, 1];
const THUMB_WIDTH = 180;

/**
 * A grid of method stickers. Methods with a playground op get a thumbnail of
 * the op applied to the image, rendered by Jimp in the browser; the rest get
 * an icon.
 */
export default function StickerSheet({ items, showCategory = false, src = "dice.png" }: StickerSheetProps) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const base = await loadImage(src);
      fitWidth(base, THUMB_WIDTH);

      for (const item of items) {
        const op = opForMethod(item.method);
        if (cancelled) return;
        if (!op || op.thumbnail === false) continue;
        try {
          const image = base.clone();
          const opts = { ...defaultOptions(op, image.bitmap), ...op.thumbnail } as Options;
          await op.apply(image, opts, opContext);
          const url = await toDataUrl(image);
          if (!cancelled) setThumbs((t) => ({ ...t, [item.method]: url }));
        } catch (e) {
          console.warn(`[stickers] ${item.method}:`, e);
        }
        // Let the page breathe between thumbnails.
        await new Promise((resolve) => setTimeout(resolve));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, src]);

  return (
    <div className="stickers not-content" data-pagefind-ignore>
      {items.map((item, i) => {
        const category = categories[item.category];
        const op = opForMethod(item.method);
        const hasThumb = Boolean(op && op.thumbnail !== false);
        const icon = toolIcons[item.method] ?? (op ? resolveIcon(op.icon) : categoryIcons[item.category]);

        return (
          <a
            key={item.href}
            className="sticker"
            href={item.href}
            style={{ "--rot": `${TILTS[i % TILTS.length]}deg`, "--c": category.color } as CSSProperties}
          >
            {showCategory && <span className="sticker-cat">{category.label}</span>}
            <span className="sticker-th">
              {thumbs[item.method] ? (
                <img src={thumbs[item.method]} alt={`${item.label} applied to a photo of dice`} />
              ) : hasThumb ? (
                <span className="sticker-wait">Rendering…</span>
              ) : (
                <span className="sticker-icon" dangerouslySetInnerHTML={{ __html: svg(icon ?? "") }} />
              )}
            </span>
            <span className="sticker-nm">{item.label}</span>
            {item.summary && <p>{item.summary}</p>}
          </a>
        );
      })}
    </div>
  );
}
