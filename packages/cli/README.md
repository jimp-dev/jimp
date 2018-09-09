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

```sh
jimp [command]

Commands:
  jimp distance [img1] [img2]  Calculates the hamming distance of two images
                               based on their perceptual hash
  jimp diff [img1] [img2]      Diffs two images
  jimp rgbaToInt               A static helper method that converts RGBA values
                               to a single integer value. args: r, g, b, a (0 -
                               255)
  jimp intToRGBA               A static helper method that converts RGBA values
                               to a single integer value. args: num (eg
                               0xFF0000FF)
  jimp cssColorToHex           Converts a css color (Hex, 8-digit (RGBA) Hex,
                               RGB, RGBA, HSL, HSLA, HSV, HSVA, Named) to a hex
                               number
  jimp limit255                Limits a number to between 0 or 255. args: num
  jimp compareHashes           Calculates the hamming distance of two images
                               based on their perceptual hash. args: hash1,
                               hash2
  jimp colorDiff               Compute color difference. args: color1, color2
                               ({r:val, g:val, b:val, a:val})
  jimp measureText             Measure how wide printing a string will be. args:
                               text
  jimp measureTextHeight       Measure how tall printing a string will be. args:
                               text, width

Options:
  --version           Show version number                              [boolean]
  --src, -s           src file to load into jimp. (PNG, JPEG, TIFF, BMP, or GIF)
  --dist, -d          dist file to output from jimp. (PNG, JPEG, TIFF, or BMP)
  --actions, -a       actions (image manipulation) to run on the input image
            [array] [choices: "_colorType", "_deflateLevel", "_deflateStrategy",
         "_filterType", "_quality", "autocrop", "background", "backgroundQuiet",
      "blit", "blur", "brightness", "clone", "cloneQuiet", "color", "colorType",
       "colour", "composite", "contain", "contrast", "convolute", "convolution",
    "cover", "crop", "cropQuiet", "deflateLevel", "deflateStrategy", "displace",
              "dither16", "dither565", "fade", "filterType", "flip", "gaussian",
   "grayscale", "greyscale", "invert", "mask", "mirror", "normalize", "opacity",
      "opaque", "pixelate", "posterize", "print", "quality", "resize", "rotate",
                            "scale", "scaleToFit", "scan", "scanQuiet", "sepia"]
  --plugins, -p       Jimp plugins to load.                              [array]
  --types, -t         Jimp types to load.                                [array]
  --verbose, -v       enable more logging                              [boolean]
  --font, --loadFont  Path of font to load and be used in text operations
                                                                        [string]
  -h, --help          Show help                                        [boolean]

Examples:
  jimp --src path/to/image.png --dest       Convert images from one type to
  output.jpg                                another
  jimp --src path/to/image.png -a           Apply image manipulations functions
  greyscale -a [resize,150,-1] --dest
  output.jpg
  jimp --loadFont FONT_SANS_8_WHITE --src   Use fonts
  path/to/image.png -a [print,0,0,Some
  text] --dest output.jpg
  jimp --src path/to/image.png --plugins    Use plugins
  @jimp/plugin-circle -a circle --dest
  output.jpg
```
