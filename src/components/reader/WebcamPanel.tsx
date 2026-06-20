import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

import { cn } from "../../utils/cn";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";

type WebcamPanelProps = {
  active: boolean;
  cameraEnabled: boolean;
  gazeStatus: string;
  onCameraEnabledChange: (enabled: boolean) => void;
};

export const WebcamPanel = ({
  active,
  cameraEnabled,
  gazeStatus,
  onCameraEnabledChange
}: WebcamPanelProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<
    "off" | "idle" | "waiting" | "ready" | "denied" | "error"
  >("off");

  useEffect(() => {
    if (!cameraEnabled) {
      setStatus("off");
      return;
    }

    if (!active) {
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
  }, [active, cameraEnabled]);

  useEffect(() => {
    if (!active || !cameraEnabled || status !== "ready") return;

    const canvas = overlayRef.current;
    if (!canvas) return;

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
  }, [active, cameraEnabled, status]);

  const showLiveFeed = cameraEnabled && status === "ready";

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="border-b border-ink-100 px-5 py-4">
        <div>
          <CardTitle className="text-base">Webcam</CardTitle>
          <CardDescription>Live feed for gaze tracking</CardDescription>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={cameraEnabled}
          aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
          onClick={() => onCameraEnabledChange(!cameraEnabled)}
          className={cn(
            "relative inline-flex h-9 w-[4.5rem] shrink-0 items-center rounded-full border transition",
            cameraEnabled
              ? "border-mint-700/30 bg-mint-100"
              : "border-ink-200 bg-ink-100"
          )}
        >
          <span
            className={cn(
              "absolute flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
              cameraEnabled ? "translate-x-8 text-mint-700" : "translate-x-1 text-ink-400"
            )}
          >
            {cameraEnabled ? <Camera size={14} /> : <CameraOff size={14} />}
          </span>
        </button>
      </CardHeader>
      <CardContent className="mt-0 p-0">
        <div className="relative aspect-[4/3] bg-ink-900">
          <video
            ref={videoRef}
            className={cn(
              "h-full w-full object-cover",
              !showLiveFeed && "opacity-0"
            )}
            playsInline
            muted
          />
          <canvas
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 border-y border-white/5" />

          {!cameraEnabled && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900 px-6 text-center">
              <CameraOff size={28} className="text-white/40" />
              <div>
                <p className="text-sm font-semibold text-white">Camera is off</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  Enable the camera to calibrate or start reading. Gaze tracking
                  requires an active feed.
                </p>
              </div>
            </div>
          )}

          {cameraEnabled && status === "waiting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/90 px-6 text-center text-sm text-white/75">
              Connecting to camera…
            </div>
          )}

          {cameraEnabled && status === "denied" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/90 px-6 text-center text-sm text-red-200">
              Camera permission denied. Allow access in your browser settings.
            </div>
          )}

          {cameraEnabled && status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/90 px-6 text-center text-sm text-red-200">
              Unable to access the camera.
            </div>
          )}

          {showLiveFeed && (
            <>
              <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                Live
              </div>
              <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white/70">
                {gazeStatus}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
