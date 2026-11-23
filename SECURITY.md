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

Crafted images that make Jimp crash, hang or exhaust memory are in scope, including in the bundled decoders and their dependencies.

The JPEG, BMP, GIF and TIFF decoders already reject images over the `maxResolutionInMP` decode limit (100 megapixels by default), so a large image within that limit isn't a vulnerability on its own.

## What to expect

Jimp is maintained by volunteers, so there's no guaranteed response time. We'll try to acknowledge a report within a couple of weeks, keep you updated while we work on a fix, and credit you in the advisory unless you'd rather not be named.
