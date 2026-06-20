import type { VocabBatchResponse } from "../types/vocab";

const API_URL = import.meta.env.VITE_API_URL || "";

let vocabApiAvailable: boolean | null = null;
let vocabApiAvailabilityPromise: Promise<boolean> | null = null;

const checkVocabApiAvailability = async () => {
  if (vocabApiAvailable !== null) {
    return vocabApiAvailable;
  }

  if (!vocabApiAvailabilityPromise) {
    vocabApiAvailabilityPromise = fetch(`${API_URL}/api/health`)
      .then((response) => response.ok)
      .catch(() => false)
      .then((available) => {
        vocabApiAvailable = available;
        vocabApiAvailabilityPromise = null;
        return available;
      });
  }

  return vocabApiAvailabilityPromise;
};

export const resetVocabApiAvailability = () => {
  vocabApiAvailable = null;
  vocabApiAvailabilityPromise = null;
};

export const fetchVocabBatch = async (terms: string[]) => {
  const apiAvailable = await checkVocabApiAvailability();
  if (!apiAvailable) {
    throw new Error("Vocabulary API unavailable");
  }

  try {
    const response = await fetch(`${API_URL}/api/vocab/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terms })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vocabulary");
    }

    return (await response.json()) as VocabBatchResponse;
  } catch (error) {
    vocabApiAvailable = false;
    throw error;
  }
};
