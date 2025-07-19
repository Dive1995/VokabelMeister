'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { VocabularyWord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad2, ChevronDown, ListFilter, List, BookCheck, Book } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

function VocabularyRow({ word, onStatusChange }: { word: VocabularyWord, onStatusChange: (id: string, status: 'learning' | 'known') => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TableRow className={cn(word.status === 'learning' && 'bg-accent/10')}>
        <TableCell className="w-12">
           <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell className="font-medium text-lg">{word.word}</TableCell>
        <TableCell className="text-muted-foreground italic">{word.translation}</TableCell>
        <TableCell className="text-right w-[200px]">
          <div className="flex items-center justify-end gap-3">
             <span className={cn("text-sm", word.status === 'learning' ? 'text-accent font-semibold' : 'text-muted-foreground')}>
              Learning
            </span>
            <Switch
              checked={word.status === 'known'}
              onCheckedChange={(checked) => onStatusChange(word.id, checked ? 'known' : 'learning')}
              aria-label="Toggle learning status"
            />
             <span className={cn("text-sm", word.status === 'known' ? 'text-primary font-semibold' : 'text-muted-foreground')}>
              Known
            </span>
          </div>
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
          <TableRow>
            <TableCell colSpan={4} className="p-0">
                <div className="p-6 bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-1">Definition</h4>
                                <p className="text-muted-foreground">{word.simple_definition}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Mnemonic</h4>
                                <p className="text-muted-foreground">{word.mnemonic.story} <span className="text-lg">{word.mnemonic.emoji}</span></p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Example Sentences</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                {word.example_sentences.map((ex, i) => (
                                    <li key={i}>
                                        <p>{ex.de}</p>
                                        <p className="italic text-sm">{ex.en}</p>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        </div>
                         <div className="space-y-4">
                             <div>
                                <h4 className="font-semibold mb-2">Details</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">Level: {word.difficulty}</Badge>
                                    {word.plural && <Badge variant="outline">Plural: {word.plural}</Badge>}
                                </div>
                            </div>
                            {word.breakdown && word.breakdown.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Word Breakdown</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {word.breakdown.map((part, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Badge>{part.part}</Badge>
                                                <span className="text-muted-foreground text-sm">({part.meaning})</span>
                                                {i < word.breakdown!.length - 1 && <span className="text-muted-foreground">+</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {word.related_words && word.related_words.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Related Words</h4>
                                     <div className="flex flex-wrap gap-2">
                                        {word.related_words.map((related, i) => (
                                            <Badge key={i} variant="secondary">{related.word} ({related.meaning})</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>
          </TableRow>
      </CollapsibleContent>
    </>
  )
}

function FilterSidebar({ filterStatus, onFilterChange }: { filterStatus: string, onFilterChange: (status: string) => void }) {
    const filters = [
        { id: 'all', label: 'All', icon: List },
        { id: 'learning', label: 'Learning', icon: Book },
        { id: 'known', label: 'Known', icon: BookCheck },
    ];
    
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 px-2">Status</h3>
                <div className="space-y-1">
                    {filters.map(filter => (
                        <Button
                            key={filter.id}
                            variant={filterStatus === filter.id ? 'default' : 'ghost'}
                            className="w-full justify-start text-base"
                            onClick={() => onFilterChange(filter.id)}
                        >
                            <filter.icon className="mr-2 h-5 w-5" />
                            {filter.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}


export default function LearnPage() {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'learning', 'known'
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  useEffect(() => {
    try {
      const storedVocabulary = sessionStorage.getItem('vocabulary');
      if (storedVocabulary) {
        setVocabulary(JSON.parse(storedVocabulary));
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error("Could not parse vocabulary from sessionStorage", error);
    }
    setHydrated(true);
  }, [router]);

  useEffect(() => {
    if (hydrated && vocabulary.length === 0) {
      router.push('/');
    }
  }, [hydrated, vocabulary, router]);

  const updateWordStatus = (id: string, status: 'learning' | 'known') => {
    const updatedVocabulary = vocabulary.map((word) =>
      word.id === id ? { ...word, status } : word
    );
    setVocabulary(updatedVocabulary);
    sessionStorage.setItem('vocabulary', JSON.stringify(updatedVocabulary));
  };
  
  const filteredVocabulary = useMemo(() => {
    if (filterStatus === 'all') return vocabulary;
    return vocabulary.filter(word => word.status === filterStatus);
  }, [vocabulary, filterStatus]);

  if (!hydrated) {
    return <div className="flex items-center justify-center h-screen"><p>Loading vocabulary...</p></div>;
  }

  if (vocabulary.length === 0) {
    return null; // Redirecting in useEffect
  }

  const wordsToLearn = vocabulary.filter(w => w.status === 'learning').length;

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    if(isMobile) setIsSheetOpen(false);
  }

  const sidebar = <FilterSidebar filterStatus={filterStatus} onFilterChange={handleFilterChange} />;

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Your Words</h1>
                <p className="text-muted-foreground mt-2">
                    Here is your vocabulary list. Toggle the switch to mark words as known.
                </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <Button asChild variant="outline" className="flex-1 md:flex-initial">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Add More
                </Link>
              </Button>
              <Button asChild className="flex-1 md:flex-initial">
                <Link href="/games">
                   <Gamepad2 className="mr-2 h-4 w-4" />
                   Play Games ({wordsToLearn})
                </Link>
              </Button>
               {isMobile && (
                 <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <ListFilter className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                            <SheetDescription>Filter your word list.</SheetDescription>
                        </SheetHeader>
                         <div className="py-4">
                            {sidebar}
                        </div>
                    </SheetContent>
                </Sheet>
               )}
            </div>
        </div>
      
        <div className="flex flex-col md:flex-row gap-8">
            {!isMobile && (
                <aside className="w-full md:w-1/4 lg:w-1/5">
                   {sidebar}
                </aside>
            )}

            <main className="flex-1">
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>German Word</TableHead>
                                <TableHead>Meaning</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVocabulary.length > 0 ? (
                                filteredVocabulary.map((word) => (
                                    <Collapsible asChild key={word.id}>
                                        <VocabularyRow word={word} onStatusChange={updateWordStatus} />
                                    </Collapsible>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No words match the current filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </div>
    </div>
  );
}
