import { useState } from "react";
import { useMaterialYou } from "./index";
import { ContrastLevelType, VariantType } from "./schemes";

export function Playground() {
  const [color, setColor] = useState("#FFDE3F");
  const [variant, setVariant] = useState<VariantType>("tonal_spot");
  const [isDark, setDark] = useState(false);
  const [contrastLevel, setContrastLevel] =
    useState<ContrastLevelType>("default");

  const [scheme, state] = useMaterialYou(color, {
    variant,
    isDark,
    contrastLevel,
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
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

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
