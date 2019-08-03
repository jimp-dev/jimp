import Jimp = require('jimp');

export interface configureProp {
  types: Array<any>
  plugins: Array<any>
}

export default function configure(configuration: any, jimpInstance?: Jimp): Jimp;
