declare module "@mediapipe/face_mesh/face_mesh" {
  export type Landmark = { x: number; y: number; z: number };
  export type Results = { multiFaceLandmarks?: Landmark[][] };

  export class FaceMesh {
    constructor(config: { locateFile: (file: string) => string });
    setOptions(options: {
      maxNumFaces?: number;
      refineLandmarks?: boolean;
      minDetectionConfidence?: number;
      minTrackingConfidence?: number;
    }): void;
    onResults(callback: (results: Results) => void): void;
    send(input: { image: HTMLVideoElement }): Promise<void>;
    close(): void;
  }
}
