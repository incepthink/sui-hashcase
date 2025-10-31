// src/utils/probabilityUtils.ts

import { Metadata } from "@/utils/modelTypes";

/**
 * Selects a random metadata item based on probability weights
 * If probabilities are null, treats all items equally
 */
export function selectRandomMetadata(metadata: Metadata[]): Metadata {
  // Check if any item has probability defined
  const hasProbabilities = metadata.some(
    (item) => item.probability !== null && item.probability !== undefined
  );

  if (!hasProbabilities) {
    // Equal probability for all items
    const randomIndex = Math.floor(Math.random() * metadata.length);
    return metadata[randomIndex];
  }

  // Calculate total probability
  const totalProbability = metadata.reduce((sum, item) => {
    const prob = parseFloat(item.probability || "0");
    return sum + prob;
  }, 0);

  // Generate random number between 0 and total probability
  const random = Math.random() * totalProbability;

  // Select item based on probability
  let cumulativeProbability = 0;
  for (const item of metadata) {
    const prob = parseFloat(item.probability || "0");
    cumulativeProbability += prob;

    if (random <= cumulativeProbability) {
      return item;
    }
  }

  // Fallback (should never reach here)
  return metadata[metadata.length - 1];
}

/**
 * Formats probability for display
 */
export function formatProbability(probability: string | null | undefined): string {
  if (!probability) return "Equal";
  const prob = parseFloat(probability);
  return `${prob.toFixed(1)}%`;
}

/**
 * Checks if metadata set has probability weights
 */
export function hasProbabilityWeights(metadata: Metadata[]): boolean {
  return metadata.some(
    (item) => item.probability !== null && item.probability !== undefined
  );
}