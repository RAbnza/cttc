import { Router } from "express";

import { getVocabBatch, getVocabByTerm } from "../controllers/vocabController.js";

export const vocabRouter = Router();

vocabRouter.get("/", getVocabByTerm);
vocabRouter.post("/batch", getVocabBatch);
