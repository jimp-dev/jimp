import { createJimp } from "@jimp/core";
import webp from "@jimp/wasm-webp";
import { expose } from "@jimp/worker";
import { defaultFormats, defaultPlugins } from "jimp";

expose(
  createJimp({ formats: [...defaultFormats, webp], plugins: defaultPlugins }),
);
