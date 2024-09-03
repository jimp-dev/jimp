import React, { useEffect, useState } from "react";

import { defaultFormats, defaultPlugins } from "jimp";
import webp from "@jimp/wasm-webp";
import { createJimp } from "@jimp/core";

const Jimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});

export function WebpExample() {
  const [selectedFile, setSelectedFile] = useState("");
  const [output, setOutput] = React.useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target?.result;

      if (!data || !(data instanceof ArrayBuffer)) {
        return;
      }

      // Manipulate images uploaded directly from the website.
      const image = await Jimp.fromBuffer(data);
      image.quantize({ colors: 16 }).blur(8).pixelate(8);
      setSelectedFile(URL.createObjectURL(file));
      setOutput(await image.getBase64("image/webp"));
    };

    reader.readAsArrayBuffer(file);
  }

  useEffect(() => {
    // Or load images hosted on the same domain.
    Jimp.read("/jimp/tree.webp").then(async (image) => {
      setSelectedFile(await image.getBase64("image/png"));
      image.quantize({ colors: 16 }).blur(8).pixelate(8);
      setOutput(await image.getBase64("image/png"));
    });
  }, []);

  return (
    <div>
      {/* A file input that takes a png/jpeg */}
      <input type="file" accept="image/webp" onChange={handleFile} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          width: "100%",
        }}
      >
        {selectedFile && (
          <img
            style={{ flex: 1, minWidth: 0, objectFit: "contain", margin: 0 }}
            src={selectedFile}
            alt="Input"
          />
        )}
        {output && (
          <img
            style={{ flex: 1, minWidth: 0, objectFit: "contain", margin: 0 }}
            src={output}
            alt="Output"
          />
        )}
      </div>
    </div>
  );
}
