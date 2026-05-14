import mongoose, { Schema } from "mongoose";

export type FixationMetrics = {
  durationMs: number;
  rereads: number;
  gazeJitter: number;
};

export type WordFocus = {
  term: string;
  lineIndex: number;
  wordIndex: number;
  metrics: FixationMetrics;
};

export type ReadingSessionDocument = mongoose.Document & {
  sessionId: string;
  startedAt: Date;
  endedAt?: Date;
  wordFocus: WordFocus[];
};

const FixationMetricsSchema = new Schema<FixationMetrics>(
  {
    durationMs: { type: Number, required: true },
    rereads: { type: Number, required: true },
    gazeJitter: { type: Number, required: true }
  },
  { _id: false }
);

const WordFocusSchema = new Schema<WordFocus>(
  {
    term: { type: String, required: true },
    lineIndex: { type: Number, required: true },
    wordIndex: { type: Number, required: true },
    metrics: { type: FixationMetricsSchema, required: true }
  },
  { _id: false }
);

const ReadingSessionSchema = new Schema<ReadingSessionDocument>({
  sessionId: { type: String, required: true, unique: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  wordFocus: { type: [WordFocusSchema], required: true }
});

export const ReadingSession = mongoose.model<ReadingSessionDocument>(
  "ReadingSession",
  ReadingSessionSchema
);
