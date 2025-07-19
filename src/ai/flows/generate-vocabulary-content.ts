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

export type GenerateVocabularyContentOutput = z.infer<typeof GenerateVocabularyContentOutputSchema>;

export async function generateVocabularyContent(input: GenerateVocabularyContentInput): Promise<GenerateVocabularyContentOutput> {
  return generateVocabularyContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVocabularyContentPrompt',
  input: {schema: GenerateVocabularyContentInputSchema},
  output: {schema: GenerateVocabularyContentOutputSchema},
  prompt: `You are a friendly and engaging language tutor for a beginner learning German. Your tone should be casual and fun, like talking to a friend. Use emojis or light humor if it helps make the explanation more memorable.

Your task is to provide a detailed explanation for the German word: {{{newWord}}}

Here's how to structure your response:
1.  **Word with Article**: For the 'word' field, you MUST include the definite article (der, die, or das) if it's a noun. For example, for "Netzwerk", you'd use "das Netzwerk".
2.  **Translation**: Give the clear English translation.
3.  **Gender**: If a noun, provide the gender ('der', 'die', or 'das'). Otherwise, null.
4.  **Plural**: If a noun, provide the plural form with its article (e.g., "die Netzwerke"). Otherwise, null.
5.  **Breakdown**: If the word can be broken down into parts (prefix, root, suffix), provide them and their meanings.
6.  **Simple Definition**: Explain the meaning of the German word in a simple way in English.
7.  **Mnemonic**: Provide a fun and memorable story/scenario and some emojis to help the learner remember the word.
8.  **Example Sentences**: Create exactly two simple example sentences in German, each with its English translation.
9.  **Related Words**: List one or two related German words with their English meanings.
10. **Difficulty**: Estimate the CEFR level (A1, A2, B1, B2, C1, C2) for the word.
11. **Tags**: Provide a few relevant tags or categories for the word, like "technology", "food", "verb", "adjective".

Here is an example for 'das Netzwerk':
- word: "das Netzwerk"
- translation: "the network"
- gender: "das"
- plural: "die Netzwerke"
- breakdown: [{ "part": "Netz", "meaning": "net" }, { "part": "Werk", "meaning": "work / creation" }]
- simple_definition": "A group of connected devices or people, like a computer network or a social network."
- mnemonic: { "story": "Imagine a spider typing on a glowing web, saying: 'This is my Netzwerk – I built it!'", "emoji": "🕷️💻🕸️" }
- example_sentences": [{ "de": "Ich habe viele Kontakte in meinem Netzwerk.", "en": "I have many contacts in my network." }, { "de": "Unser Büro braucht ein schnelleres Netzwerk.", "en": "Our office needs a faster network." }]
- related_words: [{ "word": "das Internet", "meaning": "the internet" }, { "word": "verbinden", "meaning": "to connect" }]
- difficulty: "A2"
- tags: ["technology", "nouns", "work"]


{{#if knownWords}}
Known words: {{#each knownWords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Try to use different words for the example sentence if possible.
{{/if}}

Now, please generate the content for the following word following the schema precisely.
Word: {{{newWord}}}
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
