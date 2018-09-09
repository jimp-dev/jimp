interface IJimpConfig {
  types: Function[];
  plugins: Function[];
}

export default function custom(config: IJimpConfig, jimpInstance: any): any;
