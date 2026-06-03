"use client";
import * as React from "react";
import { SimpleDynamicScheme } from "./schemes";
import { getMaterialYouScheme, Options } from "./generator";

const DEFAULT_TIMEOUT_MS = 5_000;

export function useMaterialYou(
  source: string | number, // hex, rgba or http
  options: Options,
  timeoutMs: number = DEFAULT_TIMEOUT_MS, // pass `0` to disable the timeout entirely
) {
  const [state, setState] = React.useState<"" | "error" | "loading" | "done">(
    "",
  );
  const [scheme, setScheme] = React.useState<SimpleDynamicScheme | null>(null);

  const optionsString = JSON.stringify(options);

  React.useEffect(() => {
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    setState("loading");

    const schemePromise = getMaterialYouScheme({ source, ...options });

    const promise =
      timeoutMs > 0
        ? Promise.race([
            schemePromise,
            new Promise<never>((_, reject) => {
              timeoutId = setTimeout(
                () =>
                  reject(new Error("Material You scheme generation timed out")),
                timeoutMs,
              );
            }),
          ])
        : schemePromise;

    promise
      .then((newScheme) => {
        if (!isCancelled) {
          setScheme(newScheme);
          setState(newScheme ? "done" : "");
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setState("error");
          setScheme(null);
        }
      });

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [source, optionsString, timeoutMs]);

  return [scheme, state] as const;
}
