
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VocabularyWord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { BookCheck, Book, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { updateSRSData } from '@/lib/srs';

function VocabularyReviewCard({ word }: { word: VocabularyWord }) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <h2 className="text-4xl font-bold">{word.word}</h2>
                    <Badge variant="outline">Level: {word.difficulty}</Badge>
                </div>
                <p className="text-xl text-muted-foreground italic">{word.translation}</p>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-1 text-primary">Definition</h4>
                        <p className="text-muted-foreground">{word.simple_definition}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-primary">Mnemonic</h4>
                        <p className="text-muted-foreground">{word.mnemonic.story} <span className="text-lg">{word.mnemonic.emoji}</span></p>
                    </div>
                </div>
                 <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2 text-primary">Example Sentences</h4>
                        <ul className="space-y-2 text-muted-foreground">
                        {word.example_sentences && word.example_sentences.map((ex, i) => (
                            <li key={i}>
                                <p>{ex.de}</p>
                                <p className="italic text-sm">{ex.en}</p>
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>
                <div className="space-y-4">
                     {word.plural && (
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Plural</h4>
                            <Badge variant="secondary">{word.plural}</Badge>
                        </div>
                    )}
                    {word.breakdown && word.breakdown.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Word Breakdown</h4>
                            <div className="flex flex-wrap items-center gap-2">
                                {word.breakdown.map((part, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Badge>{part.part}</Badge>
                                        <span className="text-muted-foreground text-sm">({part.meaning})</span>
                                        {i < word.breakdown.length - 1 && <span className="text-muted-foreground text-xl mx-1">+</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {word.related_words && word.related_words.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Related Words</h4>
                             <div className="flex flex-wrap gap-2">
                                {word.related_words.map((related, i) => (
                                    <Badge key={i} variant="secondary">{related.word} ({related.meaning})</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


export default function ReviewPage() {
    const [newWords, setNewWords] = useState<VocabularyWord[]>([]);
    const [hydrated, setHydrated] = useState(false);
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedNewWords = sessionStorage.getItem('newlyGeneratedVocabulary');
            if (storedNewWords) {
                const parsedWords = JSON.parse(storedNewWords);
                setNewWords(parsedWords);
                setCount(parsedWords.length);
            } else {
                // If no new words, redirect to start
                router.push('/start');
            }
        } catch (error) {
            console.error("Could not parse new vocabulary from sessionStorage", error);
            router.push('/start');
        }
        setHydrated(true);
    }, [router]);

    useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);
    
    const handleStatusChange = (wordId: string, status: 'learning' | 'known') => {
        const wordToUpdate = newWords.find(w => w.id === wordId);
        if (!wordToUpdate) return;
        
        let updatedWord: VocabularyWord = { ...wordToUpdate, status };
        
        // If user says they know the word, we can give it an initial successful review
        if (status === 'known') {
            updatedWord = updateSRSData(updatedWord, 5); // 5 for perfect recall
        }

        try {
            const mainVocabulary: VocabularyWord[] = JSON.parse(sessionStorage.getItem('vocabulary') || '[]');
            const existingWordIndex = mainVocabulary.findIndex(w => w.word === updatedWord.word);

            if (existingWordIndex > -1) {
                // This word already exists, maybe from a previous session. Update it.
                mainVocabulary[existingWordIndex] = updatedWord;
            } else {
                mainVocabulary.push(updatedWord);
            }
            
            sessionStorage.setItem('vocabulary', JSON.stringify(mainVocabulary));
            
            // Go to next slide
            if (api?.canScrollNext()) {
                api.scrollNext();
            } else {
                // Last word, clear new words and go to learn page
                sessionStorage.removeItem('newlyGeneratedVocabulary');
                router.push('/learn');
            }

        } catch (error) {
            console.error("Failed to update main vocabulary list", error);
        }
    };
    
    if (!hydrated) {
        return <div className="flex items-center justify-center h-screen"><p>Loading new words...</p></div>;
    }

    if (newWords.length === 0) {
        return (
            <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="max-w-lg mx-auto text-center">
                    <CardHeader>
                        <CardTitle>All Done!</CardTitle>
                        <CardDescription>You've reviewed all your new words.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/learn">
                                <Book className="mr-2 h-4 w-4" />
                                Go to Your Word List
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const currentWord = newWords[current - 1];
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Review Your New Words</h1>
                <p className="text-muted-foreground mt-2">
                    Decide which words you want to learn and which you already know.
                </p>
            </div>
             <Carousel setApi={setApi} className="w-full max-w-4xl mx-auto">
                <CarouselContent>
                    {newWords.map((word) => (
                        <CarouselItem key={word.id}>
                            <div className="p-1">
                                <VocabularyReviewCard word={word} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            <div className="flex flex-col items-center justify-center gap-6 mt-8">
                {currentWord && (
                    <div className="flex gap-4">
                        <Button 
                            variant="secondary" 
                            size="lg"
                            onClick={() => handleStatusChange(currentWord.id, 'known')}
                        >
                            <BookCheck className="mr-2" />
                            I know this
                        </Button>
                        <Button 
                            variant="default" 
                            size="lg"
                            onClick={() => handleStatusChange(currentWord.id, 'learning')}
                        >
                            <Sparkles className="mr-2" />
                            Learn this word
                        </Button>
                    </div>
                )}
                 <div className="text-center text-sm text-muted-foreground">
                    Word {current} of {count}
                </div>
            </div>
             <div className="text-center mt-8">
                <Button asChild variant="link">
                    <Link href="/games">
                        Skip Review & Go Play Games <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
