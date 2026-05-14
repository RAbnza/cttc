import { useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

type WebcamPanelProps = {
  enabled: boolean;
};

export const WebcamPanel = ({ enabled }: WebcamPanelProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<
    "idle" | "waiting" | "ready" | "denied" | "error"
  >("idle");

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    setStatus("waiting");

    let cancelled = false;
    const intervalId = window.setInterval(async () => {
      if (cancelled) return;

      const feed = document.getElementById(
        "webgazerVideoFeed"
      ) as HTMLVideoElement | null;
      const stream = feed?.srcObject as MediaStream | null;

      if (!feed || !stream || !videoRef.current) return;

      try {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("ready");
        window.clearInterval(intervalId);
      } catch (error) {
        setStatus(error instanceof DOMException ? "denied" : "error");
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || status !== "ready") return;

    const canvas = overlayRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    let cancelled = false;
    let rafId = 0;

    const drawOverlay = () => {
      if (cancelled) return;

      const source = document.getElementById(
        "webgazerFaceOverlay"
      ) as HTMLCanvasElement | null;

      if (source && source.width > 0 && source.height > 0) {
        if (canvas.width !== source.width) canvas.width = source.width;
        if (canvas.height !== source.height) canvas.height = source.height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        }
      }

      rafId = window.requestAnimationFrame(drawOverlay);
    };

    rafId = window.requestAnimationFrame(drawOverlay);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [enabled, status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webcam Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-ink-900">
          <video
            width={640}
            height={360}
            ref={videoRef}
            className="h-56 w-full object-cover"
            playsInline
            muted
          />
          <canvas
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 border-2 border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
          <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70">
            Live camera feed
          </div>
          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/80 text-sm text-white/80">
              {status === "idle" && "Start a session to enable the camera."}
              {status === "waiting" && "Waiting for WebGazer camera feed..."}
              {status === "denied" && "Camera permission denied."}
              {status === "error" && "Unable to access the camera."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
