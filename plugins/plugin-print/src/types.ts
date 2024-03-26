import { JimpClass } from "@jimp/types";

export interface BmCharacter {
  id: number;
  xadvance: number;
}

export interface BmKerning {
  [secondString: string]: number;
  first: number;
  second: number;
  amount: number;
}

export interface BmCommonProps {
  lineHeight: number;
}

export interface BmFont<T extends JimpClass = JimpClass> {
  chars: Record<string, BmCharacter>;
  kernings: Record<string, BmKerning>;
  common: BmCommonProps;
  info: {};
  pages: T[];
}
