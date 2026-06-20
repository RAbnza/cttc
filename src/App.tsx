import { CameraWarningBanner } from "./components/reader/CameraWarningBanner";
import { FixationMetric } from "./components/reader/FixationMetric";
import { LatestSessionRereadList } from "./components/reader/LatestSessionRereadList";
import { LatestSessionWordList } from "./components/reader/LatestSessionWordList";
import { ReaderPanel } from "./components/reader/ReaderPanel";
import { WebcamPanel } from "./components/reader/WebcamPanel";
import { VocabPanel } from "./components/vocab/VocabPanel";
import { AppShell } from "./components/layout/AppShell";
import { Topbar } from "./components/layout/Topbar";
import { CalibrationOverlay } from "./components/reader/CalibrationOverlay";
import { TrackingOverlay } from "./components/reader/TrackingOverlay";
import { ReadingProvider, useReadingContext } from "./store/readingStore";

const Dashboard = () => {
  const {
    session,
    latestSession,
    gazeStatus,
    cameraEnabled,
    cameraReady,
    vocabEntries,
    setCameraEnabled,
    actions
  } = useReadingContext();

  const webcamActive =
    cameraEnabled &&
    (session.status === "idle" ||
      session.status === "complete" ||
      session.status === "paused");

  const fixationSource = session.status !== "idle" ? session : latestSession;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-6">
        <Topbar
          sessionStatus={session.status}
          gazeStatus={gazeStatus}
          calibrationQuality={session.calibration.qualityScore}
          cameraEnabled={cameraEnabled}
          isCalibrated={session.calibration.completed}
        />

        <div className="mt-5 space-y-5">
          <CameraWarningBanner
            cameraEnabled={cameraEnabled}
            gazeStatus={gazeStatus}
          />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_288px]">
            <div className="flex flex-col gap-5">
              <ReaderPanel
                session={session}
                cameraEnabled={cameraEnabled}
                cameraReady={cameraReady}
                onStartCalibration={actions.startCalibration}
                onStartReading={actions.startReadingSession}
                onRestartCalibration={actions.restartCalibration}
                onPause={actions.pauseSession}
                onResume={actions.resumeSession}
              />
              <div className="grid gap-5 2xl:grid-cols-2">
                <LatestSessionWordList session={fixationSource} />
                <LatestSessionRereadList session={fixationSource} />
              </div>
              <VocabPanel entries={vocabEntries} />
            </div>

            <div className="flex flex-col gap-5">
              <WebcamPanel
                active={webcamActive}
                cameraEnabled={cameraEnabled}
                gazeStatus={gazeStatus}
                onCameraEnabledChange={setCameraEnabled}
              />
              <FixationMetric
                averageFixationMs={fixationSource?.analytics.averageFixationMs ?? 0}
                wordsRead={fixationSource?.analytics.wordsRead ?? 0}
                totalWords={fixationSource?.analytics.totalWords ?? 0}
                totalTimeMs={fixationSource?.analytics.totalTimeMs ?? 0}
                difficultCount={fixationSource?.analytics.difficultCount ?? 0}
                rereadCount={fixationSource?.analytics.rereadCount ?? 0}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

function App() {
  const { session, gazeStatus, gazePoint, actions, storyLines, setWordRects } =
    useReadingContext();

  if (session.status === "calibrating") {
    return (
      <CalibrationOverlay
        calibration={session.calibration}
        gazeStatus={gazeStatus}
        onCapture={actions.captureCalibrationSample}
      />
    );
  }

  if (session.status === "tracking") {
    return (
      <TrackingOverlay
        session={session}
        lines={storyLines}
        gazePoint={gazePoint}
        onWordLayout={setWordRects}
        onHighlightWord={actions.trackHighlightedWord}
        onPause={actions.pauseSession}
        onFinish={actions.stopSession}
      />
    );
  }

  return <Dashboard />;
}

export default function AppWrapper() {
  return (
    <ReadingProvider>
      <App />
    </ReadingProvider>
  );
}
