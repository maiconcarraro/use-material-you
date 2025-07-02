import { argbFromRgb } from "@material/material-color-utilities";
import quantize from "@lokesh.dhakar/quantize";

export function findDominantColorsFromPixelData(
  pixelData: Uint8ClampedArray | Uint8Array,
  amount: number = 3,
): number[] {
  const pixels: number[][] = [];
  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i]!;
    const g = pixelData[i + 1]!;
    const b = pixelData[i + 2]!;
    const a = pixelData[i + 3]!;
    if (a < 255) {
      continue;
    }
    pixels.push([r, g, b]);
  }

  // Replace Material quantize because of inconsistency: https://github.com/material-foundation/material-color-utilities/issues/132
  // const result = QuantizerCelebi.quantize(pixels, 128);
  // const ranked = Score.score(result);

  try {
    const cmap = quantize(pixels, amount);

    if (!cmap) {
      return [];
    }

    const palette = cmap.palette();
    return palette.map(([r, g, b]) => argbFromRgb(r, g, b)).slice(0, amount);
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Original function: https://github.com/material-foundation/material-color-utilities/blob/be615fc90286787bbe0c04ef58a6987e0e8fdc29/typescript/utils/image_utils.ts#L29
// Allow to specify an amount of dominant colors
export async function sourceColorFromImage(
  image: HTMLImageElement,
  amount: number = 3,
  grid?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>,
) {
  const isPartialImage = grid && grid.length > 0 && grid.length < 9;

  // Convert Image data to Pixel Array
  const imageBytes = await new Promise<Uint8ClampedArray>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {
      willReadFrequently: isPartialImage,
    });
    if (!context) {
      reject(new Error("Could not get canvas context"));
      return;
    }
    const loadCallback = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);

      if (isPartialImage) {
        const cellWidth = image.width / 3;
        const cellHeight = image.height / 3;

        const selectedPixels: number[] = [];

        for (const cell of grid) {
          const row = Math.floor((cell - 1) / 3);
          const col = (cell - 1) % 3;
          const sx = col * cellWidth;
          const sy = row * cellHeight;

          const data = context.getImageData(sx, sy, cellWidth, cellHeight).data;
          for (let i = 0; i < data.length; i++) {
            selectedPixels.push(data[i]!);
          }
        }

        resolve(new Uint8ClampedArray(selectedPixels));
        return;
      }

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

  return findDominantColorsFromPixelData(imageBytes, amount);
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
