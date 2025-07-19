'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WordCard } from '@/components/word-card';
import type { VocabularyWord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookCheck, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LearnPage() {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedVocabulary = sessionStorage.getItem('vocabulary');
      if (storedVocabulary) {
        setVocabulary(JSON.parse(storedVocabulary));
      }
    } catch (error) {
      console.error("Could not parse vocabulary from sessionStorage", error);
    }
    setHydrated(true);
  }, []);

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
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>No Vocabulary Found</CardTitle>
                    <CardDescription>You haven't generated any words to learn yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Go back to the homepage to start your learning journey.</p>
                    <Button onClick={() => router.push('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const wordsToLearn = vocabulary.filter(w => w.status === 'learning').length;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Words</h1>
          <p className="text-muted-foreground mt-2">
            Review the generated content and decide which words to focus on.
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vocabulary.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            onStatusChange={(status) => updateWordStatus(word.id, status)}
          />
        ))}
      </div>
    </div>
  );
}
