import type { AnyOp, Options } from "./types";

/**
 * Every op, collected from `./ops/*.ts`. Each file default-exports an array
 * of ops, so new ops can be added without touching any shared file.
 */
const modules = import.meta.glob<{ default: AnyOp[] }>("./ops/*.ts", {
  eager: true,
});

export const ops: AnyOp[] = Object.values(modules).flatMap((mod) => mod.default ?? []);

const byId = new Map<string, AnyOp>();
for (const op of ops) {
  if (byId.has(op.id)) {
    console.warn(`[playground] Duplicate op id "${op.id}". The first one is used.`);
    continue;
  }
  byId.set(op.id, op);
}

export function getOp(id: string): AnyOp | undefined {
  return byId.get(id);
}

/** The op that demonstrates a method, e.g. `opForMethod("blur")`. */
export function opForMethod(method: string): AnyOp | undefined {
  return byId.get(method) ?? ops.find((op) => op.method === method);
}

/** An op's starting options for an image of the given size. */
export function defaultOptions(op: AnyOp, size: { width: number; height: number }): Options {
  return typeof op.defaults === "function"
    ? op.defaults({ width: size.width, height: size.height })
    : { ...op.defaults };
}
