'use client'

import { GameCard, type Game } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { VocabularyWord } from "@/lib/types";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";


const games: Game[] = [
    {
        title: "Typing Race",
        description: "Type the words as fast as you can to beat the clock.",
        icon: "Keyboard",
        href: "/games/typing-race",
        disabled: false,
    },
    {
        title: "Memory Cards",
        description: "Match words with their meanings. Coming soon!",
        icon: "Copy",
        href: "#",
        disabled: true,
    },
    {
        title: "Quick-fire Quiz",
        description: "Answer multiple-choice questions quickly. Coming soon!",
        icon: "Sparkles",
        href: "#",
        disabled: true,
    },
    {
        title: "Word Puzzle",
        description: "Solve crosswords with your new vocabulary. Coming soon!",
        icon: "Puzzle",
        href: "#",
        disabled: true,
    },
];

export default function GamesPage() {
    const [wordsToLearnCount, setWordsToLearnCount] = useState(0);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const storedVocabulary: VocabularyWord[] = JSON.parse(sessionStorage.getItem('vocabulary') || '[]');
            const count = storedVocabulary.filter(w => w.status === 'learning').length;
            setWordsToLearnCount(count);
        } catch (error) {
            console.error("Could not parse vocabulary from sessionStorage", error);
        }
        setHydrated(true);
    }, []);

    if (!hydrated) {
        return <div className="flex items-center justify-center h-screen"><p>Loading games...</p></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Games</h1>
            <p className="text-muted-foreground mb-8">
                Solidify your knowledge with these fun and interactive games.
            </p>

            {wordsToLearnCount === 0 ? (
                <Card className="max-w-lg mx-auto text-center">
                    <CardHeader>
                        <CardTitle>No Words to Practice</CardTitle>
                        <CardDescription>You need to have at least one word set to "learning" to play games.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Go to the "Learn" tab and mark some words as "Learn This".</p>
                        <Button asChild>
                            <Link href="/learn">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Go to Learn Page
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {games.map((game) => (
                        <GameCard key={game.title} game={game} />
                    ))}
                </div>
            )}
             <Button asChild variant="outline" className="mt-8">
                <Link href="/learn">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Word List
                </Link>
            </Button>
        </div>
    );
}
