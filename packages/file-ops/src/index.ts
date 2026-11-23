import { promises as fs } from "fs";

export { existsSync } from "fs";
export const readFile = fs.readFile;
export const writeFile = fs.writeFile;
/** Whether paths that aren't URLs can be read from the file system */
export const hasFileSystem = true;
