
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Bot, Gamepad2, BrainCircuit } from 'lucide-react';
import { Logo } from "@/components/logo";

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-primary/10 transition-shadow">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const QuoteCard = ({ quote, author }: { quote: string, author: string }) => (
    <blockquote className="bg-card p-6 rounded-lg shadow-sm w-full">
        <p className="italic text-lg">"{quote}"</p>
        <cite className="block text-right mt-4 not-italic text-muted-foreground">- {author}</cite>
    </blockquote>
);

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                        <span className="font-bold text-lg">VokabelMeister</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Button asChild variant="ghost">
                           <Link href="/learn">My Words</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/start">
                                Get Started <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="container grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                            Master German Vocabulary <br/> the <span className="bg-gradient-to-r from-primary to-accent/80 bg-clip-text text-transparent">Smart</span> Way.
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl">
                            Stop memorizing, start learning. VokabelMeister uses AI and spaced repetition to create personalized lessons and fun games, making your journey to fluency faster and more effective.
                        </p>
                        <div className="flex gap-4">
                            <Button asChild size="lg">
                                <Link href="/start">Start Learning for Free</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="#features">Learn More</Link>
                            </Button>
                        </div>
                    </div>
                     <div className="flex items-center justify-center">
                        <div className="relative">
                             <div className="absolute inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50"></div>
                             <div className="relative p-8 bg-primary rounded-full w-64 h-64 flex items-center justify-center">
                                <Logo size="lg" />
                             </div>
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section id="features" className="py-20 md:py-28 bg-muted/50">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Learn German Words</h2>
                            <p className="text-lg text-muted-foreground mt-4">
                                VokabelMeister combines cutting-edge AI with proven learning techniques.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={Bot}
                                title="AI-Powered Content"
                                description="Generate rich, contextual vocabulary cards with mnemonics, example sentences, and breakdowns, all tailored to your learning level."
                            />
                            <FeatureCard 
                                icon={BrainCircuit}
                                title="Spaced Repetition"
                                description="Our smart algorithm knows when you're about to forget a word and brings it back for review at the perfect time."
                            />
                            <FeatureCard 
                                icon={Gamepad2}
                                title="Interactive Games"
                                description="Solidify your knowledge with fun games like Typing Race and Memory Cards that adapt to your learning progress."
                            />
                        </div>
                    </div>
                </section>

                {/* Quote Section */}
                 <section className="py-20 md:py-28">
                    <div className="container">
                         <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold">Stay Motivated on Your Journey</h2>
                            <p className="text-lg text-muted-foreground mt-4">
                                A little inspiration goes a long way. 🚀
                            </p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-8">
                             <QuoteCard 
                                quote="The limits of my language mean the limits of my world."
                                author="Ludwig Wittgenstein"
                            />
                            <QuoteCard 
                                quote="Learning another language is not only learning different words for the same things, but learning another way to think about things."
                                author="Flora Lewis"
                            />
                        </div>
                    </div>
                </section>

            </main>

            <footer className="bg-muted/50 border-t">
                <div className="container flex items-center justify-between py-6">
                    <div className="flex items-center gap-2">
                        <Logo size="sm" />
                        <span className="text-muted-foreground">VokabelMeister</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Built with ❤️ for language learners.
                    </p>
                </div>
            </footer>
        </div>
    );
}
