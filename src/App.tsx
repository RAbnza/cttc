import { motion } from "framer-motion";

import { AnalyticsPanel } from "./components/analytics/AnalyticsPanel";
import { GazeStream } from "./components/analytics/GazeStream";
import { ReadingRhythm } from "./components/analytics/ReadingRhythm";
import { SessionStats } from "./components/analytics/SessionStats";
import { AppShell } from "./components/layout/AppShell";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { ConfusionList } from "./components/reader/ConfusionList";
import { CalibrationOverlay } from "./components/reader/CalibrationOverlay";
import { ReaderPanel } from "./components/reader/ReaderPanel";
import { ReadingStatusCard } from "./components/reader/ReadingStatusCard";
import { WebcamPanel } from "./components/reader/WebcamPanel";
import { VocabPanel } from "./components/vocab/VocabPanel";
import { ReadingProvider, useReadingContext } from "./store/readingStore";

const Dashboard = () => {
  const { session, gazeStatus, storyLines, vocabEntries, actions, setWordRects } =
    useReadingContext();
  const rhythm = session.wordMetrics.slice(-8).map((metric) =>
    Math.min(100, Math.round(metric.fixationMs / 8))
  );

  return (
    <AppShell>
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <div className="flex flex-col gap-6">
          <Topbar
            sessionStatus={session.status}
            gazeStatus={gazeStatus}
            calibrationQuality={session.calibration.qualityScore}
          />
          <motion.div
            className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col gap-6">
              <ReaderPanel
                session={session}
                lines={storyLines}
                onWordLayout={setWordRects}
                onStart={actions.startSession}
                onRestartCalibration={actions.restartCalibration}
                onPause={actions.pauseSession}
                onResume={actions.resumeSession}
              />
              <VocabPanel entries={vocabEntries} />
            </div>
            <div className="flex flex-col gap-6">
              <AnalyticsPanel
                analytics={session.analytics}
                progressPercent={session.progressPercent}
              />
              <WebcamPanel
                enabled={session.status === "tracking" || session.status === "calibrating"}
              />
              <SessionStats session={session} />
              <ReadingStatusCard status={session.status} />
              <ConfusionList words={session.difficultWords} />
            </div>
          </motion.div>
          <motion.div
            className="grid gap-6 lg:grid-cols-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <GazeStream points={session.gazePoints} />
            <div className="lg:col-span-2">
              <ReadingRhythm values={rhythm.length ? rhythm : [20, 40, 55, 30, 60]} />
            </div>
          </motion.div>
        </div>
      </div>
      {session.status === "calibrating" && (
        <CalibrationOverlay
          calibration={session.calibration}
          gazeStatus={gazeStatus}
          onCapture={actions.captureCalibrationSample}
        />
      )}
    </AppShell>
  );
};

function App() {
  return (
    <ReadingProvider>
      <Dashboard />
    </ReadingProvider>
  );
}

export default App;
