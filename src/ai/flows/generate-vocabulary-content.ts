'use server';

/**
 * @fileOverview A vocabulary content generation AI agent.
 *
 * - generateVocabularyContent - A function that handles the vocabulary content generation process.
 * - GenerateVocabularyContentInput - The input type for the generateVocabularyContent function.
 * - GenerateVocabularyContentOutput - The return type for the generateVocabularyContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVocabularyContentInputSchema = z.object({
  newWord: z.string().describe('The new word to learn.'),
  knownWords: z.array(z.string()).optional().describe('List of already known words.'),
});
export type GenerateVocabularyContentInput = z.infer<typeof GenerateVocabularyContentInputSchema>;

const GenerateVocabularyContentOutputSchema = z.object({
  word: z.string().describe('The word.'),
  meaning: z.string().describe('The meaning of the word.'),
  exampleSentence: z.string().describe('An example sentence using the word.'),
  mnemonic: z.string().describe('A mnemonic to help remember the word.'),
});
export type GenerateVocabularyContentOutput = z.infer<typeof GenerateVocabularyContentOutputSchema>;

export async function generateVocabularyContent(input: GenerateVocabularyContentInput): Promise<GenerateVocabularyContentOutput> {
  return generateVocabularyContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVocabularyContentPrompt',
  input: {schema: GenerateVocabularyContentInputSchema},
  output: {schema: GenerateVocabularyContentOutputSchema},
  prompt: `You are a helpful assistant that generates content for vocabulary learning.

  You will generate the meaning, an example sentence, and a mnemonic for the given word.
  Make sure the example sentence uses the word in context.
  The mnemonic should be creative and easy to remember.

  Word: {{{newWord}}}

  {{#if knownWords}}
  Known words: {{#each knownWords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Avoid reusing known words when generating example sentence.
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
