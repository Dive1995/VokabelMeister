import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { VocabularyWord } from '@/lib/types';
import { Check, Sparkles, BookCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type WordCardProps = {
  word: VocabularyWord;
  onStatusChange: (status: 'learning' | 'known') => void;
};

export function WordCard({ word, onStatusChange }: WordCardProps) {
  const getStatusBadge = () => {
    switch (word.status) {
      case 'learning':
        return <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent">Learning</Badge>;
      case 'known':
        return <Badge variant="secondary" className="bg-primary/10 text-primary-foreground border-primary">Known</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  return (
    <Card className={cn("flex flex-col transition-all", {
        'border-accent shadow-accent/20': word.status === 'learning',
        'border-primary/50 shadow-primary/10': word.status === 'known',
    })}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold">{word.word}</CardTitle>
            {getStatusBadge()}
        </div>
        <CardDescription className="italic">{word.meaning}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="example">
            <AccordionTrigger>Example Sentence</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{word.exampleSentence}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="mnemonic">
            <AccordionTrigger>Mnemonic</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{word.mnemonic}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant={word.status === 'known' ? 'default' : 'outline'}
          className="w-full" onClick={() => onStatusChange('known')}>
          <Check className="mr-2 h-4 w-4" />
          I Know This
        </Button>
        <Button 
          variant={word.status === 'learning' ? 'default' : 'outline'}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onStatusChange('learning')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Learn This
        </Button>
      </CardFooter>
    </Card>
  );
}
