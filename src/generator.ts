import {
  hexFromArgb,
  argbFromHex,
  Hct,
} from "@materialx/material-color-utilities";
import type { SpecVersion } from "@materialx/material-color-utilities";
import {
  buildDynamicScheme,
  ContrastLevelType,
  ContrastLevelTypeMap,
  DYNAMIC_SCHEME_FIELDS,
  SimpleDynamicScheme,
  Variant,
  VariantType,
} from "./schemes";
import {
  isPreferColorSchemeDark,
  rgbaToHex,
  sourceColorFromImage,
} from "./utils";

export interface Options {
  variant?: VariantType;
  contrastLevel?: ContrastLevelType;
  isDark?: boolean;
  /**
   * Material Color Utilities spec version.
   * - SpecVersion.SPEC_2021: original 2021 spec (supports reduced contrast)
   * - SpecVersion.SPEC_2025: latest 2025 spec with refined colors and surface variants
   * Defaults to the library's default (currently SPEC_2021).
   */
  specVersion?: SpecVersion;
  imageFetcher?: (src: string) => Promise<number[]>;
  grid?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>;
  /**
   * Whether to use Web Workers for color extraction (default: true).
   * Set to false for environments with limited Worker support (e.g., WKWebView on iOS).
   */
  useWorker?: boolean;
}

export interface GetMaterialYouSchemeProps extends Options {
  source: string | number;
}

const REGEX_URL =
  /(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/;
const REGEX_RGBA = /^rgba?/i;

export async function getMaterialYouScheme({
  source,
  ...options
}: GetMaterialYouSchemeProps) {
  const variant: VariantType = options.variant ?? Variant.FIDELITY;
  const contrastLevel: number =
    ContrastLevelTypeMap[options.contrastLevel ?? "default"];
  const isDark: boolean = options.isDark ?? isPreferColorSchemeDark();
  const specVersion: SpecVersion | undefined = options.specVersion;

  let argbSourceColor: number | undefined;
  let dominants: number[] = [];

  if (typeof source === "number") {
    argbSourceColor = source;
  } else if (REGEX_URL.test(source)) {
    const imageFetcher =
      options.imageFetcher ??
      (() => {
        if (typeof window === "undefined" || typeof document === "undefined") {
          throw new Error(
            "Image URLs can only be processed on the client-side unless a custom `imageFetcher` is provided.",
          );
        }
        return async (src: string) => {
          const response = await fetch(src);
          const blob = await response.blob();
          // createImageBitmap avoids the URL.createObjectURL + Image
          // onload race condition that can hang on restricted environments.
          const bitmap = await createImageBitmap(blob);
          try {
            return await sourceColorFromImage(
              bitmap,
              3,
              options.grid,
              options.useWorker,
            );
          } finally {
            bitmap.close();
          }
        };
      })();
    const scores = await imageFetcher(source);
    argbSourceColor = scores[0];
    dominants = scores;
  } else {
    let possibleHexColor = source;
    if (REGEX_RGBA.test(source)) {
      possibleHexColor = rgbaToHex(source);
    }
    if (possibleHexColor.startsWith("#")) {
      argbSourceColor = argbFromHex(possibleHexColor);
    }
  }

  if (argbSourceColor === undefined) {
    return null;
  }

  const hct = Hct.fromInt(argbSourceColor);
  const dynamicScheme = buildDynamicScheme(
    hct,
    variant,
    isDark,
    contrastLevel,
    dominants,
    specVersion,
  );

  const newScheme = DYNAMIC_SCHEME_FIELDS.reduce((scheme, field) => {
    scheme[field as keyof SimpleDynamicScheme] = hexFromArgb(
      dynamicScheme[field as keyof SimpleDynamicScheme],
    );
    return scheme;
  }, {} as Partial<SimpleDynamicScheme>);

  return newScheme as SimpleDynamicScheme;
}
