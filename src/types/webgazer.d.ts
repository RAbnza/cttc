export {};

declare global {
  interface Window {
    FaceMesh?: new (config: {
      locateFile: (file: string) => string;
    }) => {
      setOptions: (opts: {
        maxNumFaces?: number;
        refineLandmarks?: boolean;
        minDetectionConfidence?: number;
        minTrackingConfidence?: number;
      }) => void;
      onResults: (cb: (results: { multiFaceLandmarks?: Array<Array<{ x: number; y: number }>> }) => void) => void;
      send: (input: { image: HTMLVideoElement }) => Promise<void>;
      close: () => void;
    };
    webgazer?: {
      begin: () => Promise<void> | void;
      end: () => void;
      params: {
        faceMeshSolutionPath?: string;
      };
      setTracker?: (name: string) => unknown;
      setRegression?: (name: string) => unknown;
      showVideo?: (enabled: boolean) => void;
      showFaceOverlay?: (enabled: boolean) => void;
      showFaceFeedbackBox?: (enabled: boolean) => void;
      setGazeListener: (
        listener: (data: { x: number; y: number } | null) => void
      ) => void;
    };
  }
}
