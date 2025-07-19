'use client';

import { TypingRaceGame } from '@/components/typing-race-game';
import type { VocabularyWord } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function TypingRacePage() {
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const storedVocabulary: VocabularyWord[] = JSON.parse(sessionStorage.getItem('vocabulary') || '[]');
            const wordsToLearn = storedVocabulary.filter(w => w.status === 'learning');
            setWords(wordsToLearn);
        } catch (error) {
            console.error("Could not parse vocabulary from sessionStorage", error);
        }
        setHydrated(true);
    }, []);

    if (!hydrated) {
        return <div className="flex items-center justify-center h-screen"><p>Loading game...</p></div>;
    }

    if (words.length === 0) {
        return (
            <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="max-w-lg mx-auto text-center">
                    <CardHeader>
                        <CardTitle>Not Enough Words</CardTitle>
                        <CardDescription>You need at least one word in your "learning" list to play Typing Race.</CardDescription>
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
                <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>
                <p className="text-muted-foreground mt-2">
                    Type the German words as fast as you can!
                </p>
            </div>
            <TypingRaceGame words={words} />
        </div>
    );
}
