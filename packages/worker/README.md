<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/worker</h1>
  <p>Run Jimp off the main thread, in web workers and Node.js worker threads.</p>
</div>

Jimp is written in JavaScript, so decoding, editing and encoding block the
thread they run on. `@jimp/worker` sends that work to a pool of workers as
plain data: an image, a list of edits in the format `image.apply` takes, and
what to send back.

```ts
// jimp.worker.ts
import { Jimp } from "jimp";
import { expose } from "@jimp/worker";

const exposed = expose(Jimp);

export type JimpWorkerApi = typeof exposed;
```

```ts
// main.ts
import { createJimpWorker } from "@jimp/worker";
import type { JimpWorkerApi } from "./jimp.worker";

const jimp = createJimpWorker<JimpWorkerApi>(
  () =>
    new Worker(new URL("./jimp.worker.ts", import.meta.url), {
      type: "module",
    }),
  { concurrency: 2 },
);

const thumbnail = await jimp.run({
  input: file,
  edits: [["cover", { w: 200, h: 200 }]],
  output: { mime: "image/jpeg", options: { quality: 80 } },
});
```

[Read the docs](https://jimp-dev.github.io/jimp/guides/workers/) for Vite,
webpack and Node.js setup, getting images back, transferring memory instead of
copying it, cancelling tasks and handling errors.
