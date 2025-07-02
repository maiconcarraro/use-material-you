"use client";
import * as React from "react";
import { SimpleDynamicScheme } from "./schemes";
import { getMaterialYouScheme, Options } from "./generator";

export function useMaterialYou(
  source: string | number, // hex, rgba or http
  options: Options,
) {
  const [state, setState] = React.useState<"" | "error" | "loading" | "done">(
    "",
  );
  const [scheme, setScheme] = React.useState<SimpleDynamicScheme | null>(null);

  const optionsString = JSON.stringify(options);

  React.useEffect(() => {
    let isCancelled = false;
    setState("loading");

    getMaterialYouScheme({ source, ...options })
      .then((newScheme) => {
        if (!isCancelled) {
          setScheme(newScheme);
          setState(newScheme ? "done" : "");
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setState("error");
          setScheme(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [source, optionsString]);

  return [scheme, state] as const;
}
