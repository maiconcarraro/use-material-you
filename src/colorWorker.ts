import {
  argbFromRgb,
  QuantizerCelebi,
  Score,
} from "@materialx/material-color-utilities";

export interface ColorWorkerMessage {
  id: number;
  pixelData: Uint8ClampedArray | Uint8Array;
  amount: number;
}

export interface ColorWorkerResponse {
  id: number;
  colors: number[];
}

function findDominantColorsFromPixelData(
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

self.onmessage = (e: MessageEvent<ColorWorkerMessage>) => {
  const { id, pixelData, amount } = e.data;
  const colors = findDominantColorsFromPixelData(pixelData, amount);
  self.postMessage({ id, colors } satisfies ColorWorkerResponse);
};
