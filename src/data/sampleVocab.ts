import type { VocabEntry } from "../types/vocab";

const VOCAB_DICTIONARY: Record<string, Omit<VocabEntry, "term">> = {
  persevere: {
    definition: "To continue doing something despite difficulty or delay.",
    synonyms: ["persist", "endure", "continue"],
    pronunciation: "pur-suh-veer",
    examples: [
      "She chose to persevere through the challenging chapter.",
      "Reading every day helped him persevere in his studies."
    ]
  },
  meticulous: {
    definition: "Showing great attention to detail; very careful and precise.",
    synonyms: ["careful", "precise", "thorough"],
    pronunciation: "muh-tik-yuh-lus",
    examples: [
      "The student was meticulous when taking reading notes.",
      "Her meticulous approach improved comprehension."
    ]
  },
  comprehend: {
    definition: "To understand the meaning of something.",
    synonyms: ["understand", "grasp", "interpret"],
    pronunciation: "kom-pri-hend",
    examples: [
      "The story was easier to comprehend after rereading.",
      "He paused to comprehend the difficult paragraph."
    ]
  }
};

const buildFallbackEntry = (term: string): VocabEntry => ({
  term,
  definition: "No definition available yet.",
  synonyms: [],
  pronunciation: "",
  examples: []
});

export const getLocalVocabEntries = (terms: string[]): VocabEntry[] =>
  terms.map((term) => {
    const normalized = term.trim().toLowerCase();
    const entry = VOCAB_DICTIONARY[normalized];
    return entry ? { term, ...entry } : buildFallbackEntry(term);
  });
