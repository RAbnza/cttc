import type { VocabBatchResponse } from "../types/vocab";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const fetchVocabBatch = async (terms: string[]) => {
  const response = await fetch(`${API_URL}/api/vocab/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ terms })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch vocabulary");
  }

  return (await response.json()) as VocabBatchResponse;
};
