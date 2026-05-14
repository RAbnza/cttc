export type VocabEntry = {
  term: string;
  definition: string;
  synonyms: string[];
  pronunciation: string;
  examples: string[];
};

export type VocabBatchResponse = {
  entries: VocabEntry[];
};
