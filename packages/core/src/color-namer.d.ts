declare module "color-namer" {
  interface ColorMatch {
    name: string;
    hex: string;
    distance: number;
  }

  interface NamerResult {
    roygbiv: ColorMatch[];
    basic: ColorMatch[];
    html: ColorMatch[];
    x11: ColorMatch[];
    pantone: ColorMatch[];
    ntc: ColorMatch[];
  }

  interface NamerOptions {
    pick?: Array<keyof NamerResult>;
    omit?: Array<keyof NamerResult>;
  }

  function namer(color: string, options?: NamerOptions): NamerResult;
  export default namer;
}
