import React, { useEffect, useState } from "react";
import { Jimp } from "jimp";

export function GrayscaleExample() {
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

      const image = await Jimp.fromBuffer(data);

      image.greyscale();

      setSelectedFile(URL.createObjectURL(file));
      setOutput(await image.getBase64("image/png"));
    };

    reader.readAsArrayBuffer(file);
  }

  useEffect(() => {
    Jimp.read("/dice.png").then(async (image) => {
      setSelectedFile(await image.getBase64("image/png"));
      image.greyscale();
      setOutput(await image.getBase64("image/png"));
    });
  }, []);

  return (
    <div>
      {/* A file input that takes a png/jpeg */}
      <input type="file" accept="image/*" onChange={handleFile} />

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
