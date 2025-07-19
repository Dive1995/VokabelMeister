'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VocabularyWord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
        <TableCell className="text-muted-foreground italic">{word.meaning}</TableCell>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2">Example Sentence</h4>
                            <p className="text-muted-foreground">{word.exampleSentence}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Mnemonic</h4>
                            <p className="text-muted-foreground">{word.mnemonic}</p>
                        </div>
                    </div>
                </div>
            </TableCell>
          </TableRow>
      </CollapsibleContent>
    </>
  )
}

export default function LearnPage() {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

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
  
  if (!hydrated) {
    return <div className="flex items-center justify-center h-screen"><p>Loading vocabulary...</p></div>;
  }

  if (vocabulary.length === 0) {
    return null; // Redirecting in useEffect
  }

  const wordsToLearn = vocabulary.filter(w => w.status === 'learning').length;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Words</h1>
          <p className="text-muted-foreground mt-2">
            Here is your vocabulary list. Toggle the switch to mark words as known.
          </p>
        </div>
        <div className="flex gap-2">
           <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Add More Words
            </Link>
          </Button>
          <Button asChild>
            <Link href="/games">
               <Gamepad2 className="mr-2 h-4 w-4" />
               Play Games ({wordsToLearn})
            </Link>
          </Button>
        </div>
      </div>
      
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
            {vocabulary.map((word) => (
              <Collapsible asChild key={word.id}>
                <VocabularyRow word={word} onStatusChange={updateWordStatus} />
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
