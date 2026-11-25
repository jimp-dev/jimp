<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/server</h1>
</div>

Resize, crop and convert images on request from URL params, like imgix or Next.js's `/_next/image`, with Jimp.
It takes a web `Request` and returns a `Response`, so it runs on Cloudflare Workers, Vercel Edge Functions, Deno, Bun and Node.js, without native binaries.

## Usage

```sh
npm install jimp @jimp/server
```

```ts
import { Jimp } from "jimp";
import { createImageHandler, fetchSource } from "@jimp/server";

const handler = createImageHandler({
  Jimp,
  source: fetchSource({ baseUrl: "https://assets.example.com/" }),
  basePath: "/images",
});

// /images/cats/tom.jpg?w=400&h=300&fm=auto
export default { fetch: handler };
```

In Node.js, wrap it with `toNodeHandler` from `@jimp/server/node`, which also has `directorySource` for serving a directory.

See the [Image Server guide](https://jimp-dev.github.io/jimp/guides/image-server/) for the URL params, deploying, signed URLs, limits and caching.
