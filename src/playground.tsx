import { useState } from "react";
import { useMaterialYou } from "./index";
import { ContrastLevelType, VariantType } from "./schemes";

const GRIDS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type InputMode = "color" | "url";

export function Playground() {
  const [source, setSource] = useState("#FFDE3F");
  const [inputMode, setInputMode] = useState<InputMode>("color");
  const [variant, setVariant] = useState<VariantType>("tonal_spot");
  const [isDark, setDark] = useState(false);
  const [contrastLevel, setContrastLevel] =
    useState<ContrastLevelType>("default");
  const [grid, setGrid] = useState<Array<(typeof GRIDS)[number]>>([]);

  const [scheme, state] = useMaterialYou(source, {
    variant,
    isDark,
    contrastLevel,
    grid,
  });

  return (
    <div>
      <div>{state}</div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div>
          <label>
            <input
              type="radio"
              name="inputMode"
              value="color"
              checked={inputMode === "color"}
              onChange={() => {
                setInputMode("color");
                setSource("#FFDE3F");
              }}
            />
            Color
          </label>
          <label>
            <input
              type="radio"
              name="inputMode"
              value="url"
              checked={inputMode === "url"}
              onChange={() => {
                setInputMode("url");
                setSource("");
              }}
            />
            Image URL
          </label>
        </div>

        {inputMode === "color" ? (
          <input
            type="color"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        ) : (
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="https://thumbs.dreamstime.com/b/colorful-3x3-puzzle-6954601.jpg"
            style={{ width: 200 }}
          />
        )}

        <select
          value={isDark ? "dark" : "light"}
          onChange={(e) => setDark(e.target.value === "dark")}
        >
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>

        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value as VariantType)}
        >
          <option value="neutral">neutral</option>
          <option value="monochrome">monochrome</option>
          <option value="tonal_spot">tonal_spot</option>
          <option value="vibrant">vibrant</option>
          <option value="expressive">expressive</option>
          <option value="fidelity">fidelity</option>
          <option value="content">content</option>
          <option value="rainbow">rainbow</option>
          <option value="fruit_salad">fruit_salad</option>
          <option value="image_fidelity">image_fidelity</option>
        </select>

        <select
          value={contrastLevel}
          onChange={(e) =>
            setContrastLevel(e.target.value as ContrastLevelType)
          }
        >
          <option value="default">default</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="reduced">reduced</option>
        </select>
      </div>

      <div>{inputMode === "url" ? <img src={source} width={100} /> : null}</div>

      <div>
        <p>Grid (only for images)</p>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 50px)" }}
        >
          {GRIDS.map((i) => (
            <label key={i} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={grid.includes(i)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setGrid([...grid, i]);
                  } else {
                    setGrid(grid.filter((g) => g !== i));
                  }
                }}
              />
              {i}
            </label>
          ))}
        </div>
      </div>

      {scheme
        ? Object.entries(scheme).map(([key, value]) => (
            <div key={key} style={{ display: "flex", gap: 10, marginTop: 5 }}>
              <span>{key}:</span>
              <span
                style={{
                  display: "block",
                  border: `1px solid #000`,
                  width: 100,
                  height: 20,
                  background: value,
                }}
              />
              <span>{value}</span>
            </div>
          ))
        : null}
    </div>
  );
}
