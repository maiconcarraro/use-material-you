import {
  DynamicScheme,
  Hct,
  Variant,
} from "@materialx/material-color-utilities";
import type { SpecVersion } from "@materialx/material-color-utilities";

export { Variant, SpecVersion } from "@materialx/material-color-utilities";

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

// ---------------------------------------------------------------------------
// Variant — supports both the new Variant enum (numeric) and the legacy
// string-based variant names for backward compatibility.
// ---------------------------------------------------------------------------

export type VariantString =
  | "monochrome"
  | "neutral"
  | "tonal_spot"
  | "vibrant"
  | "expressive"
  | "fidelity"
  | "content"
  | "rainbow"
  | "fruit_salad";

/** Accepted variant values: the Variant enum, legacy strings, or "image_fidelity". */
export type VariantType = Variant | VariantString | "image_fidelity";

/** Maps legacy string variants to their Variant enum equivalent. */
export const VARIANT_STRING_MAP: Record<VariantString, Variant> = {
  monochrome: Variant.MONOCHROME,
  neutral: Variant.NEUTRAL,
  tonal_spot: Variant.TONAL_SPOT,
  vibrant: Variant.VIBRANT,
  expressive: Variant.EXPRESSIVE,
  fidelity: Variant.FIDELITY,
  content: Variant.CONTENT,
  rainbow: Variant.RAINBOW,
  fruit_salad: Variant.FRUIT_SALAD,
};

/**
 * Resolves any VariantType input to a canonical form for internal use.
 * - Variant enum values pass through as-is.
 * - Legacy string values are mapped to the equivalent Variant enum.
 * - "image_fidelity" is returned as-is for special handling.
 */
export function resolveVariant(
  variant: VariantType,
): Variant | "image_fidelity" {
  if (variant === "image_fidelity") return "image_fidelity";
  if (typeof variant === "string") return VARIANT_STRING_MAP[variant];
  return variant;
}

// ---------------------------------------------------------------------------

export type ContrastLevelType = "default" | "medium" | "high" | "reduced";

// Note: reduced contrast (contrastLevel < 0) is only supported with SpecVersion.SPEC_2021.
// SpecVersion.SPEC_2025 does not allow negative contrast levels.
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
  specVersion?: SpecVersion,
): DynamicScheme {
  const resolved = resolveVariant(variant);

  if (resolved === "image_fidelity") {
    return DynamicScheme.from({
      sourceColorHct,
      variant: Variant.FIDELITY,
      isDark,
      contrastLevel,
      specVersion,
      primaryPaletteKeyColor: dominants[0]
        ? Hct.fromInt(dominants[0])
        : undefined,
      secondaryPaletteKeyColor: dominants[1]
        ? Hct.fromInt(dominants[1])
        : undefined,
      tertiaryPaletteKeyColor: dominants[2]
        ? Hct.fromInt(dominants[2])
        : undefined,
    });
  }

  return DynamicScheme.from({
    sourceColorHct,
    variant: resolved,
    isDark,
    contrastLevel,
    specVersion,
  });
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
