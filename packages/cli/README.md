<div align="center">
  <a href="https://intuit.github.io/Ignite/">
    <img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  </a>
  <h1>@jimp/cli</h1>
  <p>jimp on the cli</p>
</div>

Jimp on the CLI.

## Usage

Run with `--help` to get help information. Further help by running `--help <command>`. The two main functions are `read` and `create`.

```sh
jimp <command>

Commands:
  jimp read [img]              Read and image into jimp. (PNG, JPEG, TIFF, BMP, or GIF)
  jimp create                  Create a new image
  jimp distance [img1] [img2]  Calculates the hamming distance of two images based on their
                               perceptual hash
  jimp diff [img1] [img2]      Diffs two images
  jimp rgbaToInt               A static helper method that converts RGBA values to a single
                               integer value. args: r, g, b, a (0 - 255)
  jimp intToRGBA               A static helper method that converts RGBA values to a single
                               integer value. args: num (eg 0xFF0000FF)
  jimp cssColorToHex           Converts a css color (Hex, 8-digit (RGBA) Hex, RGB, RGBA, HSL,
                               HSLA, HSV, HSVA, Named) to a hex number
  jimp limit255                Limits a number to between 0 or 255. args: num
  jimp compareHashes           Calculates the hamming distance of two images based on their
                               perceptual hash. args: hash1, hash2
  jimp colorDiff               Compute color difference. args: color1, color2 ({r:val, g:val,
                               b:val, a:val})
  jimp measureText             Measure how wide printing a string will be. args: text
  jimp measureTextHeight       Measure how tall printing a string will be. args: text, width

Jimp Configuration:
  --plugins, -p   Jimp plugins to load.                                                  [array]
  --types, -t     Jimp types to load.                                                    [array]
  --loadFont, -f  Path of font to load and be used in text operations                   [string]

Options:
  --help         Show help                                                             [boolean]
  --version      Show version number                                                   [boolean]
  --verbose, -v  enable more logging                                                   [boolean]

Examples:
  jimp read path/to/image.png --output output.jpg  Convert images from one type to another. See
                                                   more under jimp read --help
```
