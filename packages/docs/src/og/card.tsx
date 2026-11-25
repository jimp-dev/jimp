/** @jsxRuntime automatic */
/** @jsxImportSource @jimp/layout */
/**
 * The Open Graph image for a docs page, laid out with @jimp/layout: a white
 * sticker card on the site's wallpaper, with the page's section, title and
 * description, an install command and Jimpy.
 */
import { Jimp, measureText, measureTextHeight, type JimpInstance } from "jimp";
import { Box, Image, render, Text } from "@jimp/layout";

import { HEIGHT, loadAssets, WIDTH, type OgAssets } from "./assets";
import type { OgPage } from "./pages";

const INK = "#1b1840";
const INK_2 = "#4a4673";

// The card's spacing, also used to work out how wide the title can be
const MARGIN = 40;
const SHADOW = 14;
const BORDER = 6;
const PADDING = [44, 36, 44, 52] as const;
const GAP = 28;
/** The width of the column Jimpy is centered in */
const JIMPY_COLUMN = 320;
const TEXT_WIDTH =
  WIDTH -
  MARGIN * 2 -
  SHADOW -
  BORDER * 2 -
  PADDING[1] -
  PADDING[3] -
  JIMPY_COLUMN -
  GAP;

/** Dark text on light stickers, white on dark ones */
function textOn(color: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));

  return 0.299 * r! + 0.587 * g! + 0.114 * b! > 150 ? INK : "white";
}

/**
 * The biggest size the title fits on two lines at, with its longest word on
 * one line. A word wider than the column, like `measureTextHeight()`, would
 * otherwise be as wide as it is and push Jimpy aside.
 */
function titleSize(assets: OgAssets, page: OgPage) {
  const font = page.code ? assets.mono : assets.bold;
  const words = page.title.split(/\s+/);
  const fits = (size: number) => {
    const lineHeight = size * 1.15;
    const options = { size, lineHeight };
    const widest = Math.max(
      ...words.map((word) => measureText(font, word, options)),
    );

    return (
      widest <= TEXT_WIDTH &&
      measureTextHeight(font, page.title, TEXT_WIDTH, options) <=
        lineHeight * 2 + 1
    );
  };
  const size = [72, 64, 56, 48].find(fits);

  if (size !== undefined) {
    return size;
  }

  // Smaller still: as big as the longest word fits at
  const widest = Math.max(
    ...words.map((word) => measureText(font, word, { size: 48 })),
  );

  return Math.min(44, Math.floor((48 * TEXT_WIDTH) / widest));
}

function Sticker({ label, color }: { label: string; color: string }) {
  return (
    <Box
      padding={[6, 16]}
      radius={12}
      background={color}
      borderWidth={3}
      borderColor={INK}
      shadow={{ x: 4, y: 4, blur: 0, color: INK }}
    >
      <Text fontSize={22} color={textOn(color)}>
        {label.toUpperCase()}
      </Text>
    </Box>
  );
}

function Install({ assets, pkg }: { assets: OgAssets; pkg: string }) {
  return (
    <Box
      direction="row"
      gap={14}
      padding={[14, 24]}
      radius={14}
      background={INK}
      font={assets.mono}
      fontSize={24}
    >
      <Text color="#3fe0b5">$</Text>
      <Text color="white">npm install {pkg}</Text>
    </Box>
  );
}

export function OgCard({ assets, page }: { assets: OgAssets; page: OgPage }) {
  const size = titleSize(assets, page);

  return (
    <Box
      padding={[MARGIN, MARGIN + SHADOW, MARGIN + SHADOW, MARGIN]}
      font={assets.bold}
      color={INK}
    >
      <Image
        src={assets.wall}
        position="absolute"
        top={0}
        left={0}
        width={WIDTH}
        height={HEIGHT}
      />
      <Box
        grow={1}
        direction="row"
        align="center"
        gap={GAP}
        padding={[...PADDING]}
        radius={32}
        background="white"
        borderWidth={BORDER}
        borderColor={INK}
        shadow={{ x: SHADOW, y: SHADOW, blur: 0, color: INK }}
      >
        {/* minWidth={0}, so nothing in it can push Jimpy's column aside */}
        <Box
          grow={1}
          minWidth={0}
          alignSelf="stretch"
          justify="space-between"
          align="start"
        >
          <Box direction="row" align="center" gap={24}>
            <Image src={assets.logo} height={64} />
            <Sticker label={page.label} color={page.color} />
          </Box>
          <Box gap={12}>
            <Text
              font={page.code ? assets.mono : assets.bold}
              fontSize={size}
              lineHeight={size * 1.15}
              maxLines={2}
            >
              {page.title}
            </Text>
            {page.description && (
              <Text
                font={assets.medium}
                fontSize={28}
                lineHeight={38}
                color={INK_2}
                maxLines={2}
              >
                {page.description}
              </Text>
            )}
          </Box>
          <Install assets={assets} pkg={page.install} />
        </Box>
        {/* shrink={0}, or the column gives its width to the text */}
        <Box
          width={JIMPY_COLUMN}
          shrink={0}
          alignSelf="stretch"
          justify="center"
          align="center"
        >
          <Image src={assets.jimpy} />
        </Box>
      </Box>
    </Box>
  );
}

/** The PNG of a page's Open Graph image */
export async function renderOgImage(page: OgPage) {
  const assets = await loadAssets();
  const image: JimpInstance = await render(
    <OgCard assets={assets} page={page} />,
    {
      width: WIDTH,
      height: HEIGHT,
      Jimp,
    },
  );

  return image.getBuffer("image/png");
}
