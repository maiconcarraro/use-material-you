import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettier,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        HTMLImageElement: "readonly",
        HTMLVideoElement: "readonly",
        ImageBitmap: "readonly",
        HTMLCanvasElement: "readonly",
        OffscreenCanvas: "readonly",
        fetch: "readonly",
        URL: "readonly",
        Blob: "readonly",
        Response: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "prettier/prettier": "error",
    },
  }
);
