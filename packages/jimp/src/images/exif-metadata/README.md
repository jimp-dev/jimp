# EXIF metadata test image

`Canon_240dpi_6.jpg` is `../exif-orientation/Landscape_6.jpg` scaled to 150x200
with macOS `sips -Z 200`, with an EXIF block written by
[piexif](https://github.com/hMatoba/Piexif) 1.1.3:

- IFD0: Make `Canon`, Model `Canon EOS 5D Mark IV`, Orientation 6,
  X/YResolution 240, ResolutionUnit 2 (inches), Software
- Exif IFD: PixelXDimension 150, PixelYDimension 200, DateTimeOriginal
- GPS IFD: 51°30'N, 0°7'W
- IFD1: a 30x40 JPEG thumbnail
