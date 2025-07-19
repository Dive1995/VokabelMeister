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
        setInputValue(typedValue);

        if (typedValue.trim() === shuffledWords[currentWordIndex].word) {
            setScore(prev => prev + 1);
            setFeedback('correct');
            setTimeout(() => {
                setInputValue('');
                setCurrentWordIndex(prev => (prev + 1) % shuffledWords.length);
                setFeedback(null);
            }, 200);
        } else if (shuffledWords[currentWordIndex].word.startsWith(typedValue)) {
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
    };

    if (shuffledWords.length === 0) {
        return <p>Loading words...</p>;
    }

    if (gameState === 'waiting') {
        return (
            <Card className="max-w-xl mx-auto text-center">
                <CardHeader>
                    <CardTitle>Ready to Race?</CardTitle>
                    <CardDescription>You have {GAME_DURATION} seconds to type as many words as you can. Good luck!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={startGame} size="lg">Start Game</Button>
                </CardContent>
            </Card>
        );
    }
    
    if (gameState === 'finished') {
        const wpm = (score / (GAME_DURATION / 60)).toFixed(0);
        return (
            <Card className="max-w-xl mx-auto text-center">
                <CardHeader>
                    <CardTitle>Time's Up!</CardTitle>
                    <div className="flex justify-center my-4">
                        <Award className="h-16 w-16 text-primary" />
                    </div>
                    <CardDescription>You typed {score} words correctly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{wpm} <span className="text-lg font-normal text-muted-foreground">words per minute</span></p>
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
                <p className="text-muted-foreground italic text-lg mb-2">{currentWord.meaning}</p>
                <h2 className="text-5xl font-bold tracking-widest font-mono">{currentWord.word}</h2>
            </CardContent>
            <CardFooter>
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Type the word above..."
                    className={cn("text-2xl h-14 text-center", {
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
