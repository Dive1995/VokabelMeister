// src/ai/flows/analyze-vocabulary-list.ts
'use server';

/**
 * @fileOverview Analyzes a list of vocabulary words to determine the language or dialect.
 *
 * - analyzeVocabularyList - A function that takes a comma separated string of words and determines its language or dialect.
 * - AnalyzeVocabularyListInput - The input type for the analyzeVocabularyList function.
 * - AnalyzeVocabularyListOutput - The return type for the analyzeVocabularyList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVocabularyListInputSchema = z.object({
  vocabularyList: z
    .string()
    .describe('A comma separated list of vocabulary words.'),
});
export type AnalyzeVocabularyListInput = z.infer<
  typeof AnalyzeVocabularyListInputSchema
>;

const AnalyzeVocabularyListOutputSchema = z.object({
  language: z
    .string()
    .describe('The language of the vocabulary list, or null if not determinable.'),
  dialect: z
    .string()
    .nullable()
    .describe('The dialect of the vocabulary list, or null if not determinable.'),
});
export type AnalyzeVocabularyListOutput = z.infer<
  typeof AnalyzeVocabularyListOutputSchema
>;

export async function analyzeVocabularyList(
  input: AnalyzeVocabularyListInput
): Promise<AnalyzeVocabularyListOutput> {
  return analyzeVocabularyListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVocabularyListPrompt',
  input: {schema: AnalyzeVocabularyListInputSchema},
  output: {schema: AnalyzeVocabularyListOutputSchema},
  prompt: `You are an expert linguist.

  Determine the language and dialect, if any, of the following vocabulary list:

  {{vocabularyList}}

  If the dialect is not determinable, set the dialect field to null.
  Return a JSON object that is valid and can be parsed by Javascript's JSON.parse().  Include descriptions from the schema in the response.
  `,
});

const analyzeVocabularyListFlow = ai.defineFlow(
  {
    name: 'analyzeVocabularyListFlow',
    inputSchema: AnalyzeVocabularyListInputSchema,
    outputSchema: AnalyzeVocabularyListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
