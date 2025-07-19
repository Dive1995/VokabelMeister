'use server';

/**
 * @fileOverview A vocabulary list generation AI agent.
 *
 * - generateVocabularyList - A function that handles the vocabulary list generation process.
 * - GenerateVocabularyListInput - The input type for the generateVocabularyList function.
 * - GenerateVocabularyListOutput - The return type for the generateVocabularyList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVocabularyListInputSchema = z.object({
  count: z.number().describe('The number of words to generate.'),
  level: z.string().describe('The proficiency level (e.g., A1, B2, C1).'),
  category: z.string().describe('The category of words to generate.'),
  knownWords: z.array(z.string()).optional().describe('List of already known words to avoid generating duplicates.'),
});
export type GenerateVocabularyListInput = z.infer<typeof GenerateVocabularyListInputSchema>;

const GenerateVocabularyListOutputSchema = z.object({
  words: z.array(z.string()).describe('The generated list of words.'),
});
export type GenerateVocabularyListOutput = z.infer<typeof GenerateVocabularyListOutputSchema>;

export async function generateVocabularyList(input: GenerateVocabularyListInput): Promise<GenerateVocabularyListOutput> {
  return generateVocabularyListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVocabularyListPrompt',
  input: {schema: GenerateVocabularyListInputSchema},
  output: {schema: GenerateVocabularyListOutputSchema},
  prompt: `You are a helpful assistant that generates a list of vocabulary words for a language learner.

  Generate {{count}} unique vocabulary words for a learner at the {{level}} proficiency level in the category of "{{category}}".

  {{#if knownWords}}
  Avoid generating the following words, as the user already knows them:
  {{#each knownWords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{/if}}

  Return the result as a JSON object with a "words" array.
  `,
});

const generateVocabularyListFlow = ai.defineFlow(
  {
    name: 'generateVocabularyListFlow',
    inputSchema: GenerateVocabularyListInputSchema,
    outputSchema: GenerateVocabularyListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
