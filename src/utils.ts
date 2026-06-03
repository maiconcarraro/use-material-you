import {
  argbFromRgb,
  QuantizerCelebi,
  Score,
} from "@material/material-color-utilities";
import type { ColorWorkerMessage, ColorWorkerResponse } from "./colorWorker";

let colorWorker: Worker | null = null;
let workerSupported: boolean | null = null;
let nextWorkerMessageId = 0;

function getColorWorker(): Worker | null {
  if (workerSupported === false) {
    return null;
  }

  if (colorWorker) {
    return colorWorker;
  }

  try {
    colorWorker = new Worker(new URL("./colorWorker.ts", import.meta.url), {
      type: "module",
    });
    workerSupported = true;
    return colorWorker;
  } catch {
    workerSupported = false;
    return null;
  }
}

export function findDominantColorsFromPixelData(
  pixelData: Uint8ClampedArray | Uint8Array,
  amount: number = 3,
): number[] {
  const pixels: number[] = [];
  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i]!;
    const g = pixelData[i + 1]!;
    const b = pixelData[i + 2]!;
    const a = pixelData[i + 3]!;
    if (a < 255) {
      continue;
    }
    const argb = argbFromRgb(r, g, b);
    pixels.push(argb);
  }

  const result = QuantizerCelebi.quantize(pixels, 128);
  const ranked = Score.score(result);
  return ranked.slice(0, amount);
}

export function findDominantColorsFromPixelDataAsync(
  pixelData: Uint8ClampedArray | Uint8Array,
  amount: number = 3,
  useWorker: boolean = true,
): Promise<number[]> {
  const worker = useWorker ? getColorWorker() : null;

  if (!worker) {
    // Fallback to sync processing if workers not supported or disabled
    return Promise.resolve(findDominantColorsFromPixelData(pixelData, amount));
  }

  return new Promise((resolve, reject) => {
    const messageId = nextWorkerMessageId++;
    const timeoutId = setTimeout(() => {
      reject(new Error("Worker timeout"));
    }, 5000);

    const handleMessage = (e: MessageEvent<ColorWorkerResponse>) => {
      if (e.data.id !== messageId) return;
      clearTimeout(timeoutId);
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      resolve(e.data.colors);
    };

    const handleError = (e: ErrorEvent) => {
      clearTimeout(timeoutId);
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      reject(e.error || new Error("Worker error"));
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);

    worker.postMessage({
      id: messageId,
      pixelData,
      amount,
    } satisfies ColorWorkerMessage);
  });
}

// Original function: https://github.com/material-foundation/material-color-utilities/blob/be615fc90286787bbe0c04ef58a6987e0e8fdc29/typescript/utils/image_utils.ts#L29
// Allow to specify an amount of dominant colors
export async function sourceColorFromImage(
  image: HTMLImageElement | ImageBitmap,
  amount: number = 3,
  grid?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>,
  useWorker: boolean = true,
) {
  const isPartialImage = grid && grid.length > 0 && grid.length < 9;

  // ImageBitmap is already decoded, so we can skip the onload/onerror dance
  // that is required for HTMLImageElement.
  if (image instanceof HTMLImageElement && !image.complete) {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image load failed"));
    });
  }

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
    // dataset is only available on HTMLImageElement
    if (image instanceof HTMLImageElement) {
      const area = image.dataset["area"];
      if (area && /^\d+(\s*,\s*\d+){3}$/.test(area)) {
        rect = area.split(/\s*,\s*/).map((s) => {
          // tslint:disable-next-line:ban
          return parseInt(s, 10);
        });
      }
    }
    const [sx, sy, sw, sh] = rect;
    resolve(context.getImageData(sx!, sy!, sw!, sh!).data);
  });

  return findDominantColorsFromPixelDataAsync(imageBytes, amount, useWorker);
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
