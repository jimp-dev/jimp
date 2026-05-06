import { cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(packageRoot, "fonts");
const destination = join(packageRoot, "dist", "fonts");

await cp(source, destination, {
  force: true,
  recursive: true,
});
