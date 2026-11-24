/* global console, performance, process */
// Decode and encode time and peak memory of @jimp/jpeg-js and jpeg-js.
//
//   node bench/speed.mjs photo.jpg [more.jpg ...]
//
// Each measurement runs in a fresh process. Memory is the peak resident set
// size minus that of a process that does nothing.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const self = fileURLToPath(import.meta.url);

async function measure(impl, op, file) {
  const ours = await import("../dist/esm/index.js");
  const lib = impl === "jpeg-js" ? (await import("jpeg-js")).default : ours;
  const data = readFileSync(file);
  const options = {
    useTArray: true,
    maxMemoryUsageInMB: 4096,
    maxResolutionInMP: 500,
  };
  const input = op === "decode" ? null : ours.decode(data, options);
  const quality = op === "encode100" ? 100 : 75;
  const runs = data.length > 1_000_000 ? 3 : 5;
  const times = [];
  let size = 0;

  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    const out =
      op === "decode" ? lib.decode(data, options) : lib.encode(input, quality);

    times.push(performance.now() - start);
    size = out.data.length;
  }

  times.sort((a, b) => a - b);
  console.log(
    JSON.stringify({
      ms: times[runs >> 1],
      size,
      maxRSS: process.resourceUsage().maxRSS * 1024,
    }),
  );
}

if (process.argv[2] === "--child") {
  await measure(...process.argv.slice(3));
} else {
  const baseline = Number(
    execFileSync(process.execPath, [
      "-e",
      "console.log(process.resourceUsage().maxRSS * 1024)",
    ]),
  );
  const mb = (bytes) => `${Math.round(bytes / 1048576)} MB`;

  for (const file of process.argv.slice(2)) {
    for (const op of ["decode", "encode", "encode100"]) {
      const row = [file.split("/").pop(), op];

      for (const impl of ["jpeg-js", "@jimp/jpeg-js"]) {
        const result = JSON.parse(
          execFileSync(process.execPath, [self, "--child", impl, op, file]),
        );

        row.push(
          `${impl}: ${result.ms.toFixed(1)} ms, ${mb(result.maxRSS - baseline)}` +
            (op === "decode" ? "" : `, ${(result.size / 1024).toFixed(0)} KB`),
        );
      }

      console.log(row.join(" | "));
    }
  }
}
