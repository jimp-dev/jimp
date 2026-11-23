export const existsSync = () => false;
export const hasFileSystem = false;

export const readFile = async () => {
  throw new Error("Not supported");
};

export const writeFile = async () => {
  throw new Error(
    "Jimp.write cannot write directly to a local path in the browser. Use getBuffer to retrieve the encoded image bytes."
  );
};
