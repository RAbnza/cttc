import type { VocabEntry } from "../types/vocab";

const normalizeTerm = (term: string) =>
  term
    .trim()
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, "");

const VOCAB_DICTIONARY: Record<string, Omit<VocabEntry, "term">> = {
  aurora: {
    definition: "The glow that appears in the sky near the polar regions; also a given name.",
    synonyms: ["dawn glow", "northern lights"],
    pronunciation: "uh-ror-uh",
    examples: [
      "Aurora adjusted her glasses before continuing the story."
    ]
  },
  hummed: {
    definition: "Made a low, steady, continuous sound.",
    synonyms: ["buzzed", "murmured", "droned"],
    pronunciation: "huhmd",
    examples: [
      "The library hummed quietly in the background."
    ]
  },
  discovery: {
    definition: "The act of finding or learning something new.",
    synonyms: ["finding", "breakthrough", "revelation"],
    pronunciation: "dih-skuhv-uh-ree",
    examples: [
      "Each page carried a new discovery for the reader."
    ]
  },
  lingered: {
    definition: "Stayed longer than expected; remained in place or in the mind.",
    synonyms: ["remained", "stayed", "persisted"],
    pronunciation: "ling-gerd",
    examples: [
      "Certain words lingered in her thoughts after she read them."
    ]
  },
  constellations: {
    definition: "Groups of stars that form recognizable patterns in the sky.",
    synonyms: ["star groups", "star patterns"],
    pronunciation: "kon-stuh-lay-shuhnz",
    examples: [
      "The words felt distant, like constellations across the page."
    ]
  },
  tracing: {
    definition: "Following the shape or path of something carefully.",
    synonyms: ["following", "tracking", "outlining"],
    pronunciation: "tray-sing",
    examples: [
      "She was tracing the sentence with a careful gaze."
    ]
  },
  thoughtful: {
    definition: "Showing careful thinking or quiet reflection.",
    synonyms: ["reflective", "careful", "attentive"],
    pronunciation: "thawt-fuhl",
    examples: [
      "She paused with a thoughtful expression while reading."
    ]
  },
  gaze: {
    definition: "A long, steady look.",
    synonyms: ["look", "stare", "glance"],
    pronunciation: "gayz",
    examples: [
      "Her gaze returned to the difficult line."
    ]
  },
  dense: {
    definition: "Closely packed or difficult to process because there is a lot of information.",
    synonyms: ["compact", "complex", "packed"],
    pronunciation: "dens",
    examples: [
      "Dense lines often require slower reading."
    ]
  },
  patience: {
    definition: "The ability to stay calm and continue despite difficulty or delay.",
    synonyms: ["calmness", "tolerance", "perseverance"],
    pronunciation: "pay-shuhns",
    examples: [
      "With patience, the reader worked through the story."
    ]
  },
  unfolded: {
    definition: "Gradually became clear or developed over time.",
    synonyms: ["developed", "emerged", "revealed"],
    pronunciation: "uhn-fohld-id",
    examples: [
      "The meaning unfolded as she kept reading."
    ]
  },
  unfamiliar: {
    definition: "Not known or recognized well.",
    synonyms: ["unknown", "new", "strange"],
    pronunciation: "uhn-fuh-mil-yer",
    examples: [
      "Unfamiliar terms slowed her reading pace."
    ]
  },
  terms: {
    definition: "Words or expressions used to describe something.",
    synonyms: ["words", "expressions", "phrases"],
    pronunciation: "turmz",
    examples: [
      "Several terms in the passage needed clarification."
    ]
  },
  paragraph: {
    definition: "A section of writing made up of several sentences about one main idea.",
    synonyms: ["passage", "section", "block of text"],
    pronunciation: "par-uh-graf",
    examples: [
      "The final paragraph tied the story together."
    ]
  },
  comprehension: {
    definition: "The ability to understand what is being read or heard.",
    synonyms: ["understanding", "grasp", "interpretation"],
    pronunciation: "kom-pri-hen-shuhn",
    examples: [
      "Better comprehension came after rereading the line."
    ]
  },
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
  definition:
    "A vocabulary item from the passage that may need extra context or dictionary support.",
  synonyms: [],
  pronunciation: "",
  examples: []
});

export const getLocalVocabEntries = (terms: string[]): VocabEntry[] =>
  terms.map((term) => {
    const normalized = normalizeTerm(term);
    const entry = VOCAB_DICTIONARY[normalized];
    return entry ? { term, ...entry } : buildFallbackEntry(term);
  });
