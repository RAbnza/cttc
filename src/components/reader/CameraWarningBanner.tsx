import { AlertTriangle, Camera, CameraOff } from "lucide-react";

type CameraWarningBannerProps = {
  cameraEnabled: boolean;
  gazeStatus: string;
};

export const CameraWarningBanner = ({
  cameraEnabled,
  gazeStatus
}: CameraWarningBannerProps) => {
  if (!cameraEnabled) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <CameraOff size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Camera is off</p>
          <p className="mt-0.5 text-amber-800/90">
            Turn on the camera to calibrate or start a reading session. Gaze tracking
            requires an active webcam feed.
          </p>
        </div>
      </div>
    );
  }

  if (gazeStatus === "error") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Camera unavailable</p>
          <p className="mt-0.5 text-red-800/90">
            Check browser permissions and ensure no other app is using the webcam.
          </p>
        </div>
      </div>
    );
  }

  if (gazeStatus !== "tracking") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-700">
        <Camera size={18} className="mt-0.5 shrink-0 text-ink-500" />
        <div>
          <p className="font-semibold">Initializing camera</p>
          <p className="mt-0.5 text-ink-500">
            Waiting for WebGazer to connect. Calibration and reading unlock once the
            feed is live.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
