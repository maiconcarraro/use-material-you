import {
  argbFromRgb,
  QuantizerCelebi,
  Score,
} from "@material/material-color-utilities";

// Original function: https://github.com/material-foundation/material-color-utilities/blob/be615fc90286787bbe0c04ef58a6987e0e8fdc29/typescript/utils/image_utils.ts#L29
// Allow to specify an amount of dominant colors
export async function sourceColorFromImage(
  image: HTMLImageElement,
  amount: number = 3,
) {
  // Convert Image data to Pixel Array
  const imageBytes = await new Promise<Uint8ClampedArray>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Could not get canvas context"));
      return;
    }
    const loadCallback = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      let rect = [0, 0, image.width, image.height];
      const area = image.dataset["area"];
      if (area && /^\d+(\s*,\s*\d+){3}$/.test(area)) {
        rect = area.split(/\s*,\s*/).map((s) => {
          // tslint:disable-next-line:ban
          return parseInt(s, 10);
        });
      }
      const [sx, sy, sw, sh] = rect;
      resolve(context.getImageData(sx!, sy!, sw!, sh!).data);
    };
    const errorCallback = () => {
      reject(new Error("Image load failed"));
    };
    if (image.complete) {
      loadCallback();
    } else {
      image.onload = loadCallback;
      image.onerror = errorCallback;
    }
  });

  // Convert Image data to Pixel Array
  const pixels: number[] = [];
  for (let i = 0; i < imageBytes.length; i += 4) {
    const r = imageBytes[i]!;
    const g = imageBytes[i + 1]!;
    const b = imageBytes[i + 2]!;
    const a = imageBytes[i + 3]!;
    if (a < 255) {
      continue;
    }
    const argb = argbFromRgb(r, g, b);
    pixels.push(argb);
  }

  // Convert Pixels to Material Colors
  const result = QuantizerCelebi.quantize(pixels, 128);
  const ranked = Score.score(result);
  return ranked.slice(0, amount);
}

export function isPreferColorSchemeDark() {
  if (typeof window !== "object") {
    return false;
  }

  return (
    !!window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function rgbaToHex(rgba: string) {
  return (
    "#" +
    rgba
      .replace(/^rgba?\(|\s+|\)$/g, "")
      .split(",")
      .map((string) => parseFloat(string))
      .map((number, index) => (index === 3 ? Math.round(number * 255) : number))
      .map((number) => number.toString(16))
      .map((string) => (string.length === 1 ? "0" + string : string))
      .join("")
  );
}
