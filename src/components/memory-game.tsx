'use client'

import type { VocabularyWord } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Award, Gamepad, Repeat, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MemoryCardType = {
  id: string;
  pairId: string;
  type: 'word' | 'meaning';
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export function MemoryGame({ words }: { words: VocabularyWord[] }) {
    const [cards, setCards] = useState<MemoryCardType[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [timeTaken, setTimeTaken] = useState(0);

    const createGame = useCallback(() => {
        const gameCards: MemoryCardType[] = words.flatMap((word, index) => [
            { id: `${word.id}-word`, pairId: word.id, type: 'word', content: word.word, isFlipped: false, isMatched: false },
            { id: `${word.id}-meaning`, pairId: word.id, type: 'meaning', content: word.translation, isFlipped: false, isMatched: false },
        ]);
        setCards(shuffleArray(gameCards));
        setFlippedCards([]);
        setMoves(0);
        setIsFinished(false);
        setStartTime(new Date());
        setTimeTaken(0);
    }, [words]);

    useEffect(() => {
        createGame();
    }, [createGame]);

    useEffect(() => {
        if (flippedCards.length === 2) {
            const [firstIndex, secondIndex] = flippedCards;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.pairId === secondCard.pairId) {
                // Match
                setCards(prevCards =>
                    prevCards.map(card =>
                        card.pairId === firstCard.pairId ? { ...card, isMatched: true } : card
                    )
                );
                setFlippedCards([]);
            } else {
                // No match
                setTimeout(() => {
                    setCards(prevCards =>
                        prevCards.map((card, index) =>
                            index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card
                        )
                    );
                    setFlippedCards([]);
                }, 1000);
            }
            setMoves(prev => prev + 1);
        }
    }, [flippedCards, cards]);

    useEffect(() => {
        const allMatched = cards.length > 0 && cards.every(card => card.isMatched);
        if (allMatched) {
            setIsFinished(true);
            if (startTime) {
                const endTime = new Date();
                setTimeTaken(Math.round((endTime.getTime() - startTime.getTime()) / 1000));
            }
        }
    }, [cards, startTime]);

    const handleCardClick = (index: number) => {
        if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
            return;
        }

        setCards(prevCards =>
            prevCards.map((card, i) => (i === index ? { ...card, isFlipped: true } : card))
        );
        setFlippedCards(prev => [...prev, index]);
    };

    if (isFinished) {
        return (
            <Card className="max-w-xl mx-auto text-center">
                <CardHeader>
                    <CardTitle>Congratulations!</CardTitle>
                     <div className="flex justify-center my-4">
                        <Award className="h-16 w-16 text-primary" />
                    </div>
                    <CardDescription>You matched all the cards!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-xl">You finished in <span className="font-bold text-primary">{timeTaken}</span> seconds.</p>
                     <p className="text-xl">It took you <span className="font-bold text-primary">{moves}</span> moves.</p>
                </CardContent>
                <CardFooter className="flex-col sm:flex-row gap-2">
                    <Button onClick={createGame} className="w-full">
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

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-lg font-semibold">Moves: <span className="text-primary font-bold">{moves}</span></h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {cards.map((card, index) => (
                    <div key={card.id} 
                         className="relative aspect-square w-full" 
                         style={{ perspective: '1000px' }}
                         onClick={() => handleCardClick(index)}
                    >
                        <div className={cn("relative w-full h-full text-center transition-transform duration-500", {
                            '[transform:rotateY(180deg)]': card.isFlipped || card.isMatched
                        })} style={{ transformStyle: 'preserve-3d' }}>
                           <div className={cn("absolute w-full h-full backface-hidden flex items-center justify-center p-2 rounded-lg cursor-pointer border-2", {
                                "bg-primary/10 border-primary/50 hover:bg-primary/20 bg-[radial-gradient(hsl(var(--primary-foreground))_1px,transparent_1px)] [background-size:16px_16px]": card.type === 'word',
                                "bg-accent/10 border-accent/50 hover:bg-accent/20 bg-[linear-gradient(45deg,transparent_48%,hsl(var(--accent-foreground))_50%,transparent_52%),linear-gradient(-45deg,transparent_48%,hsl(var(--accent-foreground))_50%,transparent_52%)] [background-size:16px_16px]": card.type === 'meaning'
                           })}>
                               {/* Front of card */}
                           </div>
                           <div className="absolute w-full h-full backface-hidden [transform:rotateY(180deg)] flex items-center justify-center p-2 rounded-lg bg-card border-2"
                                style={card.isMatched ? { borderColor: 'hsl(var(--accent))' } : { borderColor: 'hsl(var(--border))' }}>
                                {/* Back of card */}
                                <p className={cn("text-sm md:text-base font-medium", {
                                    "italic text-muted-foreground": card.type === 'meaning'
                                })}>{card.content}</p>
                                {card.isMatched && <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-accent"/>}
                           </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Utility CSS class in a component is not ideal but necessary for this 3D effect
const MemoryGameStyles = () => (
  <style jsx global>{`
    .backface-hidden {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
  `}</style>
);

MemoryGame.Styles = MemoryGameStyles;
