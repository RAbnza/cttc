import { useEffect, useRef, useState } from "react";

import type { GazePoint } from "../types/reading";

type WebGazerStatus = "idle" | "ready" | "tracking" | "error";

type WebGazerOptions = {
  enabled: boolean;
};

let webgazerScriptPromise: Promise<void> | null = null;

const ensureWebGazerScript = () => {
  if (window.webgazer) {
    return Promise.resolve();
  }

  if (webgazerScriptPromise) {
    return webgazerScriptPromise;
  }

  webgazerScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-webgazer-script="true"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load /webgazer.js")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "/webgazer.js";
    script.async = true;
    script.dataset.webgazerScript = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load /webgazer.js"));
    document.body.appendChild(script);
  });

  return webgazerScriptPromise;
};

export const useWebGazer = ({ enabled }: WebGazerOptions) => {
  const [status, setStatus] = useState<WebGazerStatus>("idle");
  const [gazePoint, setGazePoint] = useState<GazePoint | null>(null);
  const startedRef = useRef(false);
  const lastSampleRef = useRef<GazePoint | null>(null);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    const handleReady = () => {
      if (!window.webgazer) {
        setStatus("error");
        return;
      }

      if (bootstrappedRef.current) {
        return;
      }

      bootstrappedRef.current = true;

      setStatus("ready");

      const listener = (data: { x: number; y: number } | null) => {
        if (!data) return;

        const nextPoint = { x: data.x, y: data.y, timestamp: Date.now() };
        const previousPoint = lastSampleRef.current;

        if (
          previousPoint &&
          Math.abs(previousPoint.x - nextPoint.x) < 1 &&
          Math.abs(previousPoint.y - nextPoint.y) < 1 &&
          nextPoint.timestamp - previousPoint.timestamp < 32
        ) {
          return;
        }

        lastSampleRef.current = nextPoint;
        setGazePoint(nextPoint);
      };

      // Keep the camera feed visible and reuse WebGazer's own face overlay canvas.
      window.webgazer.showVideo?.(false);
      window.webgazer.showFaceOverlay?.(true);
      window.webgazer.showFaceFeedbackBox?.(false);

      // Resolve MediaPipe assets against the current app origin explicitly.
      window.webgazer.params.faceMeshSolutionPath = new URL(
        "/mediapipe/face_mesh",
        window.location.origin
      ).toString();
      window.webgazer.setTracker?.("TFFacemesh");
      window.webgazer.setRegression?.("ridge");

      window.webgazer.setGazeListener(listener);

      const originalAppendChild = document.body.appendChild;
      const rewriteMediaPipeScriptUrl = (value: string) =>
        value
          .replace("face_mesh_solution_simd_wasm_bin.js", "face_mesh_solution_wasm_bin.js")
          .replace("face_detection_solution_simd_wasm_bin.js", "face_detection_solution_wasm_bin.js");

      document.body.appendChild = function appendChildPatched<T extends Node>(node: T) {
        if (node instanceof HTMLScriptElement && typeof node.src === "string") {
          node.src = rewriteMediaPipeScriptUrl(node.src);
        }

        return originalAppendChild.call(document.body, node) as T;
      } as typeof document.body.appendChild;

      const restoreAppendChild = () => {
        document.body.appendChild = originalAppendChild;
      };

      const safeEndWebGazer = () => {
        if (!startedRef.current) return;

        try {
          window.webgazer?.end();
        } catch {
          // Ignore shutdown errors when the stream never fully initialized.
        } finally {
          startedRef.current = false;
        }
      };

      Promise.resolve(window.webgazer.begin())
        .then(() => {
          startedRef.current = true;
          setStatus("tracking");
        })
        .catch((error) => {
          console.error("WebGazer begin failed", error);
          // Retry once in case camera permission/device initialization was delayed.
          Promise.resolve()
            .then(() => {
              safeEndWebGazer();
            })
            .then(
              () =>
                new Promise<void>((resolve) => {
                  window.setTimeout(() => resolve(), 800);
                })
            )
            .then(() => Promise.resolve(window.webgazer?.begin?.()))
            .then(() => {
              startedRef.current = true;
              setStatus("tracking");
            })
            .catch((retryError: unknown) => {
              console.error("WebGazer retry failed", retryError);
              setStatus("error");
            });
        })
        .finally(restoreAppendChild);
    };

    ensureWebGazerScript()
      .then(handleReady)
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });

    return () => {
      lastSampleRef.current = null;
      bootstrappedRef.current = false;

        if (!startedRef.current) return;

        try {
          window.webgazer?.end();
        } catch {
          // Ignore shutdown errors when the stream never fully initialized.
        } finally {
          startedRef.current = false;
        }
    };
  }, [enabled]);

  return { status, gazePoint };
};
