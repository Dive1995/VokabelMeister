'use server';

/**
 * @fileOverview A vocabulary content generation AI agent for German.
 *
 * - generateVocabularyContent - A function that handles the vocabulary content generation process.
 * - GenerateVocabularyContentInput - The input type for the generateVocabularyContent function.
 * - GenerateVocabularyContentOutput - The return type for the generateVocabularyContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVocabularyContentInputSchema = z.object({
  newWord: z.string().describe('The new German word to learn.'),
  knownWords: z.array(z.string()).optional().describe('List of already known words.'),
});
export type GenerateVocabularyContentInput = z.infer<typeof GenerateVocabularyContentInputSchema>;

const GenerateVocabularyContentOutputSchema = z.object({
  word: z.string().describe('The German word.'),
  meaning: z.string().describe('The English meaning of the word.'),
  exampleSentence: z.string().describe('An example German sentence using the word.'),
  mnemonic: z.string().describe('A mnemonic to help remember the word. The mnemonic should be in English but relate to the German word.'),
});
export type GenerateVocabularyContentOutput = z.infer<typeof GenerateVocabularyContentOutputSchema>;

export async function generateVocabularyContent(input: GenerateVocabularyContentInput): Promise<GenerateVocabularyContentOutput> {
  return generateVocabularyContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVocabularyContentPrompt',
  input: {schema: GenerateVocabularyContentInputSchema},
  output: {schema: GenerateVocabularyContentOutputSchema},
  prompt: `You are a helpful assistant that generates content for learning German vocabulary.

  For the given German word, you will generate:
  1. The English meaning of the word.
  2. An example sentence in German that uses the word in context.
  3. A creative and easy-to-remember mnemonic in English to help remember the word.

  Word: {{{newWord}}}

  {{#if knownWords}}
  Known words: {{#each knownWords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Avoid reusing known words when generating the example sentence.
  {{/if}}
  `,
});

const generateVocabularyContentFlow = ai.defineFlow(
  {
    name: 'generateVocabularyContentFlow',
    inputSchema: GenerateVocabularyContentInputSchema,
    outputSchema: GenerateVocabularyContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
