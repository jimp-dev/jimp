export { existsSync } from "node:fs";
import { promises as fs } from "node:fs";

export const readFile = fs.readFile;
