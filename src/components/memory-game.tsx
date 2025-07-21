
'use client'

import type { VocabularyWord } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Award, Gamepad, Repeat, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updateSRSData } from "@/lib/srs";

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
    const [matchedPairs, setMatchedPairs] = useState(0);

    const createGame = useCallback(() => {
        const gameCards: MemoryCardType[] = words.flatMap((word) => [
            { id: `${word.id}-word`, pairId: word.id, type: 'word', content: word.word, isFlipped: false, isMatched: false },
            { id: `${word.id}-meaning`, pairId: word.id, type: 'meaning', content: word.translation, isFlipped: false, isMatched: false },
        ]);
        setCards(shuffleArray(gameCards));
        setFlippedCards([]);
        setMoves(0);
        setIsFinished(false);
        setMatchedPairs(0);
        setStartTime(new Date());
        setTimeTaken(0);
    }, [words]);

    useEffect(() => {
        createGame();
    }, [createGame]);
    
    const finishGame = useCallback(() => {
        setIsFinished(true);
        if (startTime) {
            const endTime = new Date();
            setTimeTaken(Math.round((endTime.getTime() - startTime.getTime()) / 1000));
        }

        try {
            const mainVocabulary: VocabularyWord[] = JSON.parse(sessionStorage.getItem('vocabulary') || '[]');
            // A simple metric: if moves are less than 2x the number of pairs, it's a good recall
            const quality = moves < words.length * 2 ? 5 : 3;
            
            words.forEach(word => {
                const wordIndex = mainVocabulary.findIndex(w => w.id === word.id);
                if (wordIndex > -1) {
                    mainVocabulary[wordIndex] = updateSRSData(mainVocabulary[wordIndex], quality);
                }
            });

            sessionStorage.setItem('vocabulary', JSON.stringify(mainVocabulary));
        } catch (error) {
             console.error("Failed to update vocabulary with SRS data.", error);
        }

    }, [startTime, moves, words]);

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
                setMatchedPairs(prev => prev + 1);
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
        if (words.length > 0 && matchedPairs === words.length) {
           finishGame();
        }
    }, [matchedPairs, words.length, finishGame]);

    const handleCardClick = (index: number) => {
        if (isFinished || flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
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
                <h3 className="text-lg font-semibold">Matched: <span className="text-primary font-bold">{matchedPairs} / {words.length}</span></h3>
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
                                "bg-primary/10 border-primary/50 hover:bg-primary/20 bg-[radial-gradient(hsl(var(--primary)_/_0.2)_1px,transparent_1px)] [background-size:16px_16px]": card.type === 'word',
                                "bg-accent/10 border-accent/50 hover:bg-accent/20 bg-[repeating-linear-gradient(45deg,hsl(var(--accent)_/_0.2),hsl(var(--accent)_/_0.2)_5px,transparent_5px,transparent_10px)]": card.type === 'meaning'
                           })}>
                               {/* Front of card (face down) */}
                           </div>
                           <div className="absolute w-full h-full backface-hidden [transform:rotateY(180deg)] flex items-center justify-center p-2 rounded-lg bg-card border-2"
                                style={card.isMatched ? { borderColor: 'hsl(var(--accent))' } : { borderColor: 'hsl(var(--border))' }}>
                                {/* Back of card (face up) */}
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
