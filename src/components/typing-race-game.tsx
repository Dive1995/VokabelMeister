'use client'

import type { VocabularyWord } from "@/lib/types";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Award, Gamepad, Repeat } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GameState = 'waiting' | 'playing' | 'finished';
const GAME_DURATION = 60; // 60 seconds

export function TypingRaceGame({ words }: { words: VocabularyWord[] }) {
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [shuffledWords, setShuffledWords] = useState<VocabularyWord[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const shuffleWords = useCallback(() => {
        setShuffledWords([...words].sort(() => Math.random() - 0.5));
    }, [words]);

    useEffect(() => {
        shuffleWords();
    }, [shuffleWords]);


    useEffect(() => {
        if (gameState === 'playing') {
            inputRef.current?.focus();
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setGameState('finished');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [gameState]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const typedValue = e.target.value;
        // Use the first example sentence for the race
        const currentSentence = shuffledWords[currentWordIndex].example_sentences[0].de;

        if (typedValue.startsWith(' ')) {
            return;
        }

        setInputValue(typedValue);

        if (typedValue.trim() === currentSentence) {
            setScore(prev => prev + 1);
            setFeedback('correct');
            setTimeout(() => {
                setInputValue('');
                setCurrentWordIndex(prev => (prev + 1) % shuffledWords.length);
                setFeedback(null);
            }, 200);
        } else if (currentSentence.startsWith(typedValue)) {
            setFeedback(null);
        } else {
            if(typedValue.length > 0) setFeedback('incorrect');
        }
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setCurrentWordIndex(0);
        setInputValue('');
        shuffleWords();
    };

    const restartGame = () => {
        setGameState('waiting');
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setCurrentWordIndex(0);
        setInputValue('');
        setFeedback(null);
    };

    if (shuffledWords.length === 0) {
        return <p>Loading words...</p>;
    }

    if (gameState === 'waiting') {
        return (
            <Card className="max-w-xl mx-auto text-center">
                <CardHeader>
                    <CardTitle>Ready to Race?</CardTitle>
                    <CardDescription>You have {GAME_DURATION} seconds to type as many full sentences as you can. Good luck!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={startGame} size="lg">Start Game</Button>
                </CardContent>
            </Card>
        );
    }
    
    if (gameState === 'finished') {
        const sentencesPerMin = (score / (GAME_DURATION / 60)).toFixed(0);
        return (
            <Card className="max-w-xl mx-auto text-center">
                <CardHeader>
                    <CardTitle>Time's Up!</CardTitle>
                    <div className="flex justify-center my-4">
                        <Award className="h-16 w-16 text-primary" />
                    </div>
                    <CardDescription>You typed {score} sentences correctly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{sentencesPerMin} <span className="text-lg font-normal text-muted-foreground">sentences per minute</span></p>
                </CardContent>
                <CardFooter className="flex-col sm:flex-row gap-2">
                    <Button onClick={restartGame} className="w-full">
                        <Repeat className="mr-2" />
                        Play Again
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/games">
                            <Gamepad className="mr-2" />
                            Other Games
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const currentWord = shuffledWords[currentWordIndex];
    const currentSentence = currentWord.example_sentences[0].de;
    
    const renderSentence = () => {
        const chars = currentSentence.split('');
        const inputChars = inputValue.split('');
        return chars.map((char, index) => {
            let className = "";
            if (index < inputValue.length) {
                if (char === inputChars[index]) {
                    className = "text-green-400";
                } else {
                    className = "text-red-500";
                }
            }
            return <span key={index} className={cn('transition-colors', className)}>{char}</span>
        });
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center text-lg font-mono">
                    <div>Score: <span className="font-bold text-primary">{score}</span></div>
                    <div>Time: <span className="font-bold text-primary">{timeLeft}s</span></div>
                </div>
                <Progress value={(timeLeft / GAME_DURATION) * 100} className="mt-2" />
            </CardHeader>
            <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-2">
                    Type the sentence for: <strong className="text-primary font-semibold">{currentWord.word}</strong> ({currentWord.translation})
                </p>
                <h2 className="text-3xl font-bold tracking-wide font-mono select-none p-4 bg-muted/50 rounded-lg">
                    {renderSentence()}
                </h2>
            </CardContent>
            <CardFooter>
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Type the sentence above..."
                    className={cn("text-xl h-14 text-center", {
                        'border-green-500 focus-visible:ring-green-500': feedback === 'correct',
                        'border-red-500 focus-visible:ring-red-500': feedback === 'incorrect'
                    })}
                    value={inputValue}
                    onChange={handleInputChange}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                />
            </CardFooter>
        </Card>
    );
}
