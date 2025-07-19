import type { GenerateVocabularyContentOutput } from "@/ai/flows/generate-vocabulary-content";

export type VocabularyWord = GenerateVocabularyContentOutput & {
  id: string;
  status: 'new' | 'learning' | 'known';
};
