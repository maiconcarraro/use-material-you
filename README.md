<p align="center">
  <img src="https://github.com/user-attachments/assets/387eb4bf-8a0f-43f9-89c1-1d9398c261b1" />
</p>

# Explanation

Friendly react hook to create dynamic schemes and variants based on M3/material-color-utilities. Inspired by [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/).

The goal is to simplify the usage, already returning hex values to immediately usage and supporting hex, rgba and URL.

It supports all [main variants](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/scheme) from material-color-utilities. Plus a new variant named `image-fidelity` that is going to use the top 3 dominant colors from the image, dedicated to situations where you want to create beautiful gradients, inspired by [color-thief](https://github.com/lokesh/color-thief/).

## Install

```
npm install use-material-you
```

## Usage

```tsx
const [scheme] = useMaterialYou("#7C3AED", {
  variant: "fidelity",
  isDark: false,
  contrastLevel: "standard",
});

return (
  <Box style={{ background: scheme?.primary, color: scheme?.onPrimary }}>
    Primary
  </Box>
);
```

```tsx
const [scheme] = useMaterialYou("rgba(124, 58, 237, 0.5)", {
  variant: "tonal_spot",
  isDark: true,
  contrastLevel: "medium",
});

...
```

```tsx
const [scheme, state] = useMaterialYou(
  "https://uploads.sitepoint.com/wp-content/uploads/2021/04/1618197067vitejs.png",
  {
    variant: "image_fidelity", // new variant to use top 3 dominant colors from image
  },
);

...
```

## Examples

- [useMaterialYou + input color](https://codesandbox.io/p/sandbox/use-material-you-fqmnk3?file=%2Fsrc%2FApp.tsx)
- [useMaterialYou + input url](https://codepen.io/maiconcarraro/pen/oNrXvRv)

## Variants

| Name             | Description |
| ---------------- | ----------- |
| "tonal_spot"     | Default for Material theme colors. Builds pastel palettes with a low chroma. |
| "fidelity"       | The resulting color palettes match seed color, even if the seed color is very bright (high chroma). |
| "monochrome"     | All colors are grayscale, no chroma. |
| "neutral"        | Close to grayscale, a hint of chroma. |
| "vibrant"        | Pastel colors, high chroma palettes. The primary palette's chroma is at maximum. Use `fidelity` instead if tokens should alter their tone to match the palette vibrancy. |
| "expressive"     | Pastel colors, medium chroma palettes. The primary palette's hue is different from the seed color, for variety.
| "content"        | Almost identical to `fidelity`. Tokens and palettes match the seed color. `primaryContainer` is the seed color, adjusted to ensure contrast with surfaces. The tertiary palette is analogue of the seed color. |
| "rainbow"        | A playful theme - the seed color's hue does not appear in the theme. |
| "fruit_salad"    | A playful theme - the seed color's hue does not appear in the theme. |
| "image_fidelity" | Not an official variant, custom made. It extracts top 3 dominant colors and set as primary, secondary and tertiary palettes. |
