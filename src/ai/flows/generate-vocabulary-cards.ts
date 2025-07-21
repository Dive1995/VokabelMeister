'use server';

/**
 * @fileOverview A vocabulary card generation AI agent.
 *
 * - generateVocabularyCards - A function that handles the vocabulary card generation process.
 * - GenerateVocabularyCardsInput - The input type for the generateVocabularyCards function.
 * - GenerateVocabularyCardsOutput - The return type for the generateVocabularyCards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VocabularyCardSchema = z.object({
    word: z.string().describe("The German word. For nouns, it MUST include the article (e.g., 'der Apfel', 'das Netzwerk')."),
    translation: z.string().describe('The English translation of the word.'),
    gender: z.string().nullable().describe("The gender of the noun ('der', 'die', or 'das'), or null if not a noun."),
    plural: z.string().nullable().describe('The plural form of the noun, including the article, or null if not applicable.'),
    breakdown: z.array(z.object({
        part: z.string(),
        meaning: z.string(),
    })).optional().describe("An optional breakdown of the word into its constituent parts (e.g., prefix, root, suffix) and their meanings."),
    simple_definition: z.string().describe('A simple definition of the word in English.'),
    mnemonic: z.object({
        story: z.string().describe('A memorable story or scenario to help remember the word.'),
        emoji: z.string().describe('Relevant emojis for the mnemonic.'),
    }).describe('A mnemonic to help remember the word.'),
    example_sentences: z.array(z.object({
        de: z.string().describe('The example sentence in German.'),
        en: z.string().describe('The English translation of the sentence.'),
    })).describe('At least two example sentences using the word.'),
    related_words: z.array(z.object({
        word: z.string().describe('A related German word.'),
        meaning: z.string().describe('The English meaning of the related word.'),
    })).optional().describe('An optional list of related words.'),
    difficulty: z.string().describe('The estimated CEFR level of the word (e.g., A1, B2).'),
    tags: z.array(z.string()).optional().describe('A list of relevant tags or categories for the word (e.g., "food", "travel", "verb").'),
});


export const GenerateVocabularyCardsInputSchema = z.object({
  count: z.number().optional().describe('The number of words to generate. Used if customWords is not provided.'),
  level: z.string().describe('The proficiency level (e.g., A1, B2) for which to generate content.'),
  category: z.string().optional().describe('The category of words to generate. Used if customWords is not provided.'),
  customWords: z.array(z.string()).optional().describe('A list of custom words provided by the user. If provided, count and category are ignored.'),
  knownWords: z.array(z.string()).optional().describe('List of already known words to avoid generating duplicates.'),
});
export type GenerateVocabularyCardsInput = z.infer<typeof GenerateVocabularyCardsInputSchema>;

const GenerateVocabularyCardsOutputSchema = z.object({
  cards: z.array(VocabularyCardSchema),
});
export type GenerateVocabularyCardsOutput = z.infer<typeof GenerateVocabularyCardsOutputSchema>;


export async function generateVocabularyCards(input: GenerateVocabularyCardsInput): Promise<GenerateVocabularyCardsOutput> {
  return generateVocabularyCardsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateVocabularyCardsPrompt',
  input: {schema: GenerateVocabularyCardsInputSchema},
  output: {schema: GenerateVocabularyCardsOutputSchema},
  prompt: `You are a friendly and engaging language tutor for a learner of German. Your tone should be casual and fun.

Your task is to generate a list of detailed vocabulary cards based on the user's request. Each card must contain rich, contextual information to help the user learn effectively.

**Request Details:**
- **Proficiency Level:** {{{level}}}
{{#if customWords}}
- **Words to Process:** Process the custom words provided.
{{else}}
- **Number of Words:** {{count}}
- **Category:** "{{category}}"
{{/if}}

{{#if knownWords}}
- **Avoid these known words:** {{#each knownWords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}


**Instructions for each card:**
1.  **word**: For nouns, you MUST include the definite article (der, die, or das). E.g., "das Netzwerk".
2.  **translation**: Clear English translation.
3.  **gender**: 'der', 'die', or 'das' for nouns. Otherwise, null.
4.  **plural**: Plural form with its article for nouns. E.g., "die Netzwerke". Otherwise, null.
5.  **breakdown**: If the word is compound, break it down into its parts.
6.  **simple_definition**: A simple definition in English suitable for the learner's level.
7.  **mnemonic**: A fun story/scenario and emojis to help remember the word.
8.  **example_sentences**: Create exactly two simple example sentences in German, with English translations, appropriate for the learner's level.
9.  **related_words**: One or two related German words with their English meanings.
10. **difficulty**: Set this to the requested proficiency level: {{{level}}}.
11. **tags**: Provide relevant tags like "technology", "food", "verb", "adjective". If a category was provided, it should be one of the tags.

{{#if customWords}}
Now, please generate a full vocabulary card for each of the following custom words:
{{#each customWords}}
- {{{this}}}
{{/each}}
{{else}}
Now, please generate {{count}} unique vocabulary words in the "{{category}}" category and create a full card for each.
{{/if}}

Return the final result as a single JSON object with a "cards" array, where each element in the array is a complete vocabulary card object adhering to the schema.
`,
});


const generateVocabularyCardsFlow = ai.defineFlow(
  {
    name: 'generateVocabularyCardsFlow',
    inputSchema: GenerateVocabularyCardsInputSchema,
    outputSchema: GenerateVocabularyCardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
