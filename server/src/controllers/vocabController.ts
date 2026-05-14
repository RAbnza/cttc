import type { Request, Response } from "express";
import { z } from "zod";

import { getVocabEntries } from "../utils/vocabData.js";

const termQuerySchema = z.object({
  term: z.string().min(1).max(64)
});

const batchSchema = z.object({
  terms: z.array(z.string().min(1).max(64)).min(1).max(25)
});

export const getVocabByTerm = (req: Request, res: Response) => {
  const parseResult = termQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid term" });
    return;
  }

  const [entry] = getVocabEntries([parseResult.data.term]);
  res.status(200).json(entry);
};

export const getVocabBatch = (req: Request, res: Response) => {
  const parseResult = batchSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid terms" });
    return;
  }

  const entries = getVocabEntries(parseResult.data.terms);
  res.status(200).json({ entries });
};
