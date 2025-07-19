import type { VocabularyWord } from './types';
import { add, formatISO, isBefore, startOfToday } from 'date-fns';

const INITIAL_EASINESS = 2.5;

/**
 * Updates the spaced repetition data for a word based on performance.
 * @param word The vocabulary word to update.
 * @param quality The quality of the recall (0-5 scale). 5 is perfect recall.
 * @returns The word with updated SRS properties.
 */
export function updateSRSData(word: VocabularyWord, quality: number): VocabularyWord {
  if (quality < 3) {
    // Incorrect recall, reset repetitions and interval
    word.repetitions = 0;
    word.interval = 1;
  } else {
    // Correct recall
    word.repetitions = (word.repetitions || 0) + 1;

    // Update easiness factor
    word.easiness = Math.max(1.3, (word.easiness || INITIAL_EASINESS) + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Calculate next interval
    if (word.repetitions <= 1) {
      word.interval = 1;
    } else if (word.repetitions === 2) {
      word.interval = 6;
    } else {
      word.interval = Math.ceil(word.interval * word.easiness);
    }
  }

  const today = startOfToday();
  word.lastReviewed = formatISO(today);
  word.nextReview = formatISO(add(today, { days: word.interval }));

  return word;
}


/**
 * Gets a list of words to be practiced, based on SRS.
 * @param allWords The complete list of vocabulary words.
 * @param maxWords The maximum number of words to return.
 * @returns A prioritized list of words for a game session.
 */
export function getWordsForGame(allWords: VocabularyWord[], maxWords: number = 20): VocabularyWord[] {
    const today = startOfToday();

    const wordsToLearn = allWords.filter(w => w.status === 'learning');
    
    const wordsToReview = allWords
        .filter(w => w.status === 'known' && w.nextReview && isBefore(new Date(w.nextReview), today))
        .sort((a, b) => new Date(a.nextReview!).getTime() - new Date(b.nextReview!).getTime());

    // Prioritize new learning words, then fill with due review words
    let practiceList = [...wordsToLearn, ...wordsToReview];

    // Remove duplicates (in case a 'learning' word was also somehow 'due')
    const uniqueWordIds = new Set();
    practiceList = practiceList.filter(word => {
        if (uniqueWordIds.has(word.id)) {
            return false;
        }
        uniqueWordIds.add(word.id);
        return true;
    });

    return practiceList.slice(0, maxWords);
}

/**
 * Initializes SRS properties for a new word.
 * @param word The word to initialize.
 * @returns The word with default SRS properties.
 */
export function initializeSRSFields(word: Omit<VocabularyWord, 'lastReviewed' | 'nextReview' | 'interval' | 'easiness' | 'repetitions'>): VocabularyWord {
    return {
        ...word,
        lastReviewed: null,
        nextReview: null,
        interval: 1,
        easiness: INITIAL_EASINESS,
        repetitions: 0,
    };
}
