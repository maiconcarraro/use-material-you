# useMaterialYou

React hook to create dynamic schemes and variants based on M3/material-color-utilities.

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

const [scheme] = useMaterialYou("rgba(124, 58, 237, 0.5)", {
  variant: "tonal_spot",
  isDark: true,
  contrastLevel: "medium",
});

const [scheme] = useMaterialYou(
  "https://uploads.sitepoint.com/wp-content/uploads/2021/04/1618197067vitejs.png",
  {
    variant: "image_fidelity", // custom to keep dominant colors from image
  },
);
```
