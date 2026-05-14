import { motion } from "framer-motion";

import type { CalibrationState } from "../../types/reading";
import { Button } from "../ui/Button";

type CalibrationOverlayProps = {
  calibration: CalibrationState;
  gazeStatus: string;
  onCapture: () => void;
};

export const CalibrationOverlay = ({
  calibration,
  gazeStatus,
  onCapture
}: CalibrationOverlayProps) => (
  <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm">
    <div className="absolute left-6 top-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
        Calibration
      </p>
      <p className="mt-1 text-sm">
        Point {Math.min(calibration.currentIndex + 1, calibration.totalTargets)} of {calibration.totalTargets}
      </p>
      <p className="mt-1 text-xs text-white/70">WebGazer: {gazeStatus}</p>
      <p className="mt-3 text-xs text-white/80">
        Look directly at the dot and click Capture.
      </p>
      <Button className="mt-3" variant="ghost" onClick={onCapture}>
        Capture
      </Button>
    </div>

    <motion.button
      type="button"
      className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-mint-500 shadow-soft"
      style={{
        left: `${calibration.target.x * 100}%`,
        top: `${calibration.target.y * 100}%`
      }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 1.4 }}
      onClick={onCapture}
      aria-label="Capture calibration point"
    />
  </div>
);
