# Security Policy

## Supported versions

Only the latest v1.x release gets security fixes. v0.x is no longer supported; see the [v1 migration guide](https://jimp-dev.github.io/jimp/guides/migrate-to-v1/) to upgrade.

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |
| 0.x     | ❌        |

## Reporting a vulnerability

Please don't report vulnerabilities in public issues, discussions or pull requests.

Report them privately through GitHub instead: go to the repository's [Security tab](https://github.com/jimp-dev/jimp/security) and click **Report a vulnerability**. If you don't see that button, private vulnerability reporting isn't enabled yet. In that case, email the maintainer at lisowski54@gmail.com.

Please include:

- the Jimp version (and the version of the specific `@jimp/*` package, if you know it)
- the image format involved (JPEG, PNG, BMP, GIF, TIFF, ...)
- a minimal file or snippet that reproduces the problem
- what happens: a crash, a hang, memory use, wrong output, and so on, and how that could affect an application using Jimp

## Scope

Jimp is often used to process images uploaded by untrusted users, so crafted images that make Jimp crash, hang or exhaust memory are in scope. That includes problems in the bundled decoders and their dependencies.

Recent hardening of this kind: the JPEG, BMP, GIF and TIFF decoders reject images larger than a `maxResolutionInMP` limit (100 megapixels by default) before allocating memory for them ([#1415](https://github.com/jimp-dev/jimp/issues/1415), [#1435](https://github.com/jimp-dev/jimp/pull/1435), [#1451](https://github.com/jimp-dev/jimp/pull/1451)). You can lower or raise it per format:

```js
const image = await Jimp.read(buffer, {
  "image/jpeg": { maxResolutionInMP: 50 },
});
```

A large image that stays within the limit and uses the memory you'd expect for its size is not a vulnerability. If your application handles untrusted input, set limits that suit it.

## What to expect

Jimp is maintained by volunteers, so there's no guaranteed response time. We'll try to acknowledge a report within a couple of weeks, keep you updated while we work on a fix, and credit you in the advisory unless you'd rather not be named.
