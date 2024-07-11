import * as React from "react";
import {
  hexFromArgb,
  argbFromHex,
  Hct,
} from "@material/material-color-utilities";
import {
  buildDynamicScheme,
  ContrastLevelType,
  ContrastLevelTypeMap,
  DYNAMIC_SCHEME_FIELDS,
  SimpleDynamicScheme,
  VariantType,
} from "./schemes";
import {
  isPreferColorSchemeDark,
  rgbaToHex,
  sourceColorFromImage,
} from "./utils";

const REGEX_URL =
  /(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g;
const REGEX_RGBA = /^rgba?/i;

export function useMaterialYou(
  source: string | number, // hex, rgba or http
  options: {
    variant?: VariantType;
    contrastLevel?: ContrastLevelType;
    isDark?: boolean;
    crossOrigin?: string; // only for image inputs
  },
) {
  const [state, setState] = React.useState<"" | "error" | "loading" | "done">(
    "",
  );
  const [scheme, setScheme] = React.useState<SimpleDynamicScheme | null>(null);
  const [argbSourceColor, setARGBSourceColor] = React.useState<
    number | undefined
  >(undefined);

  // Only for dominant colors based on image
  const [dominants, setDominants] = React.useState<number[]>([]);

  const variant: VariantType = React.useMemo(
    () => options.variant ?? "fidelity",
    [options.variant],
  );

  const contrastLevel: number = React.useMemo(
    () => ContrastLevelTypeMap[options.contrastLevel ?? "default"],
    [options.contrastLevel],
  );

  const isDark: boolean = React.useMemo(
    () => options.isDark ?? isPreferColorSchemeDark(),
    [options.isDark],
  );

  React.useLayoutEffect(() => {
    if (typeof source === "number") {
      setARGBSourceColor(source);
      return;
    }

    // source is URL
    if (REGEX_URL.test(source)) {
      setState("loading");
      const img = document.createElement("img");

      img.crossOrigin = options.crossOrigin ?? "anonymous";
      img.referrerPolicy = "no-referrer";
      img.src = source;

      sourceColorFromImage(img, 3)
        .then((scores) => {
          setARGBSourceColor(scores[0]);
          setDominants(scores);
        })
        .catch(() => {
          setState("error");
          setARGBSourceColor(undefined);
        });
    }

    let possibleHexColor = source;

    if (REGEX_RGBA.test(source)) {
      possibleHexColor = rgbaToHex(source);
    }

    // hex color
    if (possibleHexColor.startsWith("#")) {
      setARGBSourceColor(argbFromHex(possibleHexColor));
    }
  }, [source, options.crossOrigin]);

  React.useLayoutEffect(() => {
    if (argbSourceColor === undefined) {
      setState("");
      setScheme(null);
      return;
    }

    const hct = Hct.fromInt(argbSourceColor);

    const dynamicScheme = buildDynamicScheme(
      hct,
      variant,
      isDark,
      contrastLevel,
      dominants,
    );

    const newScheme = DYNAMIC_SCHEME_FIELDS.reduce((scheme, field) => {
      scheme[field as keyof SimpleDynamicScheme] = hexFromArgb(
        dynamicScheme[field as keyof SimpleDynamicScheme],
      );

      return scheme;
    }, {} as Partial<SimpleDynamicScheme>);

    setState("done");
    setScheme(newScheme as SimpleDynamicScheme);
  }, [argbSourceColor, variant, isDark, contrastLevel, dominants]);

  return [scheme, state] as const;
}
