# ICC profile test images

The profiles are written by `make-profiles.mjs` (`node make-profiles.mjs`),
from the published Display P3 primaries, D65 white point and sRGB transfer
curve, adapted to D50 with Bradford. They are free to use.

- `display-p3.icc`: an ICC v4 Display P3 profile with parametric curves,
  596 bytes
- `display-p3-sampled.icc`: the same with each curve sampled at 12000 points,
  72572 bytes, so it doesn't fit one JPEG APP2 segment

The images were made with ImageMagick 7 from
`../exif-orientation/Landscape_1.jpg`, assigning the profile without
converting the pixels:

- `p3-two-segments.jpg`: 64x48 with `display-p3-sampled.icc` in two APP2
  segments

  ```sh
  magick ../exif-orientation/Landscape_1.jpg -strip -resize 64x48 \
    -profile display-p3-sampled.icc -quality 85 p3-two-segments.jpg
  ```

- `p3.png`: 64x48 with `display-p3.icc` in an iCCP chunk

  ```sh
  magick ../exif-orientation/Landscape_1.jpg -strip -resize 64x48 base.ppm
  magick base.ppm -profile display-p3.icc \
    -define png:exclude-chunks=date,time PNG24:p3.png
  ```

- `Canon_240dpi_6_p3.jpg`: `../exif-metadata/Canon_240dpi_6.jpg` with its
  EXIF and `display-p3.icc`

  ```sh
  magick ../exif-metadata/Canon_240dpi_6.jpg -profile display-p3.icc \
    -quality 90 Canon_240dpi_6_p3.jpg
  ```
