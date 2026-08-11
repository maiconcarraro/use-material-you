import { useState } from "react";
import { useMaterialYou } from "./index";
import {
  ContrastLevelType,
  Variant,
  VariantType,
  SpecVersion,
} from "./schemes";

const GRIDS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type InputMode = "color" | "url";

const VARIANT_OPTIONS: { label: string; value: VariantType }[] = [
  { label: "monochrome", value: Variant.MONOCHROME },
  { label: "neutral", value: Variant.NEUTRAL },
  { label: "tonal_spot", value: Variant.TONAL_SPOT },
  { label: "vibrant", value: Variant.VIBRANT },
  { label: "expressive", value: Variant.EXPRESSIVE },
  { label: "fidelity", value: Variant.FIDELITY },
  { label: "content", value: Variant.CONTENT },
  { label: "rainbow", value: Variant.RAINBOW },
  { label: "fruit_salad", value: Variant.FRUIT_SALAD },
  { label: "image_fidelity", value: "image_fidelity" },
];

const SPEC_OPTIONS: { label: string; value: string }[] = [
  { label: "default", value: "" },
  { label: "2021", value: SpecVersion.SPEC_2021 },
  { label: "2025", value: SpecVersion.SPEC_2025 },
];

export function Playground() {
  const [source, setSource] = useState("#FFDE3F");
  const [inputMode, setInputMode] = useState<InputMode>("color");
  const [variant, setVariant] = useState<VariantType>(Variant.TONAL_SPOT);
  const [isDark, setDark] = useState(false);
  const [contrastLevel, setContrastLevel] =
    useState<ContrastLevelType>("default");
  const [specVersion, setSpecVersion] = useState<SpecVersion | undefined>(
    undefined,
  );
  const [grid, setGrid] = useState<Array<(typeof GRIDS)[number]>>([]);

  const [scheme, state] = useMaterialYou(source, {
    variant,
    isDark,
    contrastLevel,
    specVersion,
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
          value={variant.toString()}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "image_fidelity") {
              setVariant("image_fidelity");
            } else {
              setVariant(Number(val) as Variant);
            }
          }}
        >
          {VARIANT_OPTIONS.map(({ label, value }) => (
            <option key={label} value={value.toString()}>
              {label}
            </option>
          ))}
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

        <select
          value={specVersion ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setSpecVersion(val ? (val as SpecVersion) : undefined);
          }}
        >
          {SPEC_OPTIONS.map(({ label, value }) => (
            <option key={label} value={value}>
              spec: {label}
            </option>
          ))}
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
