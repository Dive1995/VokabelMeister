
'use client';

import { MemoryGame } from '@/components/memory-game';
import type { VocabularyWord } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { getWordsForGame } from '@/lib/srs';

export default function MemoryCardsPage() {
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const storedVocabulary: VocabularyWord[] = JSON.parse(sessionStorage.getItem('vocabulary') || '[]');
            // Memory game needs pairs, so we'll take up to 10 words (for 20 cards)
            const gameWords = getWordsForGame(storedVocabulary, 10);
            setWords(gameWords);
        } catch (error) {
            console.error("Could not parse vocabulary from sessionStorage", error);
        }
        setHydrated(true);
    }, []);

    if (!hydrated) {
        return <div className="flex items-center justify-center h-screen"><p>Loading game...</p></div>;
    }

    if (words.length < 2) {
        return (
            <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="max-w-lg mx-auto text-center">
                    <CardHeader>
                        <CardTitle>Not Enough Words</CardTitle>
                        <CardDescription>You need at least two words in your "learning" list or due for review to play Memory Cards.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/learn">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Go to Your Word List
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 md:p-8">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Memory Cards</h1>
                <p className="text-muted-foreground mt-2">
                    Match the German words with their English meanings.
                </p>
            </div>
            <MemoryGame words={words} />
        </div>
    );
}
