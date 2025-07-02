declare module "@lokesh.dhakar/quantize" {
  function quantize(
    pixels: number[][],
    maxColors: number,
  ): { palette: () => [[number, number, number]] } | null;
  export = quantize;
}
