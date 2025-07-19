import Link from 'next/link';
import { Keyboard, Copy, Sparkles, Puzzle, type LucideProps } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

const icons = {
    Keyboard,
    Copy,
    Sparkles,
    Puzzle,
};

export type Game = {
    title: string;
    description: string;
    icon: keyof typeof icons;
    href: string;
    disabled?: boolean;
};

type GameCardProps = {
    game: Game;
};

export function GameCard({ game }: GameCardProps) {
    const Icon = icons[game.icon];

    const cardContent = (
        <Card className={cn("h-full flex flex-col transition-all hover:shadow-lg", game.disabled ? "bg-muted/50 text-muted-foreground" : "hover:border-primary")}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-primary/10 rounded-lg mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                     {game.disabled && <Badge variant="outline">Coming Soon</Badge>}
                </div>
                <CardTitle>{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
        </Card>
    );
    
    if (game.disabled) {
        return <div className="cursor-not-allowed">{cardContent}</div>;
    }

    return (
        <Link href={game.href} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
            {cardContent}
        </Link>
    );
}
