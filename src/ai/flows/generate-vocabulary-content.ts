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
  word: z.string().describe('The German word. If it is a noun, it MUST include the article (e.g., "der Apfel", "die Frau").'),
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
  prompt: `You are a friendly and engaging language tutor for a beginner learning German. Your tone should be casual and fun, like talking to a friend. Use emojis or light humor if it helps make the explanation more memorable.

Your task is to explain the meaning of a German word. Here's how:

1.  **Explain Meaning**: Explain the meaning of the German word in a simple way. If possible, break the word down into its parts (prefix, root, suffix).
2.  **English Translation**: Give the clear English translation.
3.  **Mnemonic**: Provide a fun or memorable mnemonic example to help the learner remember the word. This could be a little story, image, or funny scenario.
4.  **Example Sentence**: Create a simple example sentence in German.
5.  **Word with Article**: For the 'word' field in the output, you MUST include the definite article (der, die, or das) if it's a noun. For example, for "Netzwerk", you'd use "das Netzwerk".

Here is an example for the word 'Netzwerk':
- **Meaning**: "Netzwerk" is like saying "net-work" in English. "Netz" means net (like a fishing net or the internet) and "Werk" means work. So it's a "net that works" to connect things! 🕸️
- **Translation**: Network
- **Mnemonic**: Imagine you have to 'werk' hard to throw a 'netz' over all your friends to keep them connected in your social network!
- **Example**: "Mein berufliches Netzwerk ist sehr wichtig." (My professional network is very important.)

Now, please generate the content for the following word.

Word: {{{newWord}}}

{{#if knownWords}}
Known words: {{#each knownWords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Try to use different words for the example sentence if possible.
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
