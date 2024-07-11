import {
  DynamicScheme,
  Hct,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  TonalPalette,
} from "@material/material-color-utilities";

export interface SimpleDynamicScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}

export type VariantType =
  | "monochrome"
  | "neutral"
  | "tonal_spot"
  | "vibrant"
  | "expressive"
  | "fidelity"
  | "content"
  | "rainbow"
  | "fruit_salad"
  | "image_fidelity"; // image_fidelity is custom, to try to keep the top 3 colors from image as primary, secondary and tertiary

export type ContrastLevelType = "default" | "medium" | "high" | "reduced";

// Reference: https://github.com/material-foundation/material-color-utilities/blob/be615fc90286787bbe0c04ef58a6987e0e8fdc29/make_schemes.md?plain=1#L23
export const ContrastLevelTypeMap: Record<ContrastLevelType, number> = {
  default: 0.0,
  medium: 0.5,
  high: 1.0,
  reduced: -1.0,
};

export function buildDynamicScheme(
  sourceColorHct: Hct,
  variant: VariantType,
  isDark: boolean,
  contrastLevel: number,
  dominants: number[],
): DynamicScheme {
  switch (variant) {
    case "monochrome":
      return new SchemeMonochrome(sourceColorHct, isDark, contrastLevel);
    case "neutral":
      return new SchemeNeutral(sourceColorHct, isDark, contrastLevel);
    case "tonal_spot":
      return new SchemeTonalSpot(sourceColorHct, isDark, contrastLevel);
    case "vibrant":
      return new SchemeVibrant(sourceColorHct, isDark, contrastLevel);
    case "expressive":
      return new SchemeExpressive(sourceColorHct, isDark, contrastLevel);
    case "fidelity":
      return new SchemeFidelity(sourceColorHct, isDark, contrastLevel);
    case "content":
      return new SchemeContent(sourceColorHct, isDark, contrastLevel);
    case "rainbow":
      return new SchemeRainbow(sourceColorHct, isDark, contrastLevel);
    case "fruit_salad":
      return new SchemeFruitSalad(sourceColorHct, isDark, contrastLevel);
    case "image_fidelity":
      const baseFidelity = new SchemeFidelity(
        sourceColorHct,
        isDark,
        contrastLevel,
      );

      return new DynamicScheme({
        sourceColorArgb: baseFidelity.sourceColorArgb,
        variant: baseFidelity.variant,
        isDark: baseFidelity.isDark,
        contrastLevel: baseFidelity.contrastLevel,
        primaryPalette: TonalPalette.fromInt(
          dominants[0] ?? baseFidelity.primaryPaletteKeyColor,
        ),
        secondaryPalette: TonalPalette.fromInt(
          dominants[1] ?? baseFidelity.secondaryPaletteKeyColor,
        ),
        tertiaryPalette: TonalPalette.fromInt(
          dominants[2] ?? baseFidelity.tertiaryPaletteKeyColor,
        ),
        neutralPalette: baseFidelity.neutralPalette,
        neutralVariantPalette: baseFidelity.neutralVariantPalette,
      });
  }
}

// Avoid to specify a different attribute that is not part of the expected scheme
type OnlyDynamicColors = keyof DynamicScheme & keyof SimpleDynamicScheme;

export const DYNAMIC_SCHEME_FIELDS: string[] = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "background",
  "onBackground",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "outline",
  "outlineVariant",
  "shadow",
  "scrim",
  "inverseSurface",
  "inverseOnSurface",
  "inversePrimary",
] satisfies OnlyDynamicColors[];
