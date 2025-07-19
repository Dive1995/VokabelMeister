import type { GenerateVocabularyContentOutput } from "@/ai/flows/generate-vocabulary-content";

export type VocabularyWord = GenerateVocabularyContentOutput & {
  id: string;
  status: 'new' | 'learning' | 'known';
  // SRS Fields
  lastReviewed: string | null; // ISO 8601 date string
  nextReview: string | null;   // ISO 8601 date string
  interval: number;            // in days
  easiness: number;            // SM-2 easiness factor
  repetitions: number;         // Number of times reviewed correctly in a row
  tags: string[];
};
