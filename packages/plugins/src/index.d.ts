export interface Plugin<ClassT> {
  class?: ClassT;
  constants: {
    [key: string]: string
  }
}

export default function(jimpEvChange: any): Jimp;
