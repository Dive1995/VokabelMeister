
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { generateVocabularyList } from '@/ai/flows/generate-vocabulary-list';
import { generateVocabularyContent } from '@/ai/flows/generate-vocabulary-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { VocabularyWord } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { initializeSRSFields } from '@/lib/srs';


const PasteWordsSchema = z.object({
  wordList: z.string().min(1, 'Please enter at least one word.').refine(
    (value) => {
      const words = value.split(',').map(word => word.trim()).filter(Boolean);
      return words.length > 0;
    },
    { message: 'Please enter a valid comma-separated list of words.' }
  ),
});

const GenerateWordsSchema = z.object({
    count: z.number().min(1).max(50),
    level: z.string().min(1, 'Please select a level.'),
    category: z.string().min(1, 'Please enter a category.'),
});

type FormSchema = z.infer<typeof PasteWordsSchema> | z.infer<typeof GenerateWordsSchema>;

export function VocabularySetupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const router = useRouter();
  const { toast } = useToast();

  const pasteWordsForm = useForm<z.infer<typeof PasteWordsSchema>>({
    resolver: zodResolver(PasteWordsSchema),
    defaultValues: { wordList: '' },
  });

  const generateWordsForm = useForm<z.infer<typeof GenerateWordsSchema>>({
    resolver: zodResolver(GenerateWordsSchema),
    defaultValues: { count: 10, level: 'A1', category: '' },
  });


  async function handleFinalGeneration(words: string[], level: string = 'A1') { // Default level for pasted words
    setIsLoading(true);
    try {
      // Get existing known words to provide context to the AI
      const storedVocabulary: VocabularyWord[] = JSON.parse(sessionStorage.getItem('vocabulary') || '[]');
      const knownWords = storedVocabulary.filter(w => w.status === 'known').map(w => w.word);

      const generatedContentPromises = words.map(word =>
        generateVocabularyContent({ newWord: word, level, knownWords })
      );

      const results = await Promise.all(generatedContentPromises);
      
      const existingWords = new Set(storedVocabulary.map(w => w.word));

      const newVocabulary: VocabularyWord[] = results
        .filter(content => !existingWords.has(content.word)) // Filter out words that already exist in the main list
        .map((content, index) => {
          const partialWord = {
            ...content,
            id: `${content.word}-${Date.now()}-${index}`,
            status: 'new' as const,
          };
          return initializeSRSFields(partialWord);
        });

      if (newVocabulary.length === 0) {
        toast({
            title: 'No New Words Generated',
            description: 'All generated words are already in your list. Try a different category or level.',
        });
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('newlyGeneratedVocabulary', JSON.stringify(newVocabulary));
      router.push('/review');

    } catch (error) {
      console.error('Failed to generate vocabulary content:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Word Details',
        description: 'Failed to generate meanings and examples. Please try again.',
      });
    } finally {
        setIsLoading(false);
    }
  }


  async function onPasteWordsSubmit(data: z.infer<typeof PasteWordsSchema>) {
    
    const words = data.wordList.split(',').map(word => word.trim()).filter(Boolean);
    // For pasted words, we can't be sure of the level, so we'll let the AI estimate with a default.
    // A more advanced implementation might run another flow to determine the average level first.
    await handleFinalGeneration(words, 'A2'); 
  }

  async function onGenerateWordsSubmit(data: z.infer<typeof GenerateWordsSchema>) {
    
    try {
        const storedVocabulary: VocabularyWord[] = JSON.parse(sessionStorage.getItem('vocabulary') || '[]');
        const knownWords = storedVocabulary.map(w => w.word);
        
        const response = await generateVocabularyList({
            count: data.count,
            level: data.level,
            category: data.category,
            knownWords,
        });
        if (response.words && response.words.length > 0) {
            await handleFinalGeneration(response.words, data.level);
        } else {
            toast({
                variant: 'destructive',
                title: 'No words generated',
                description: 'The AI could not generate words for the given criteria. Please try different options.',
            });
            
        }
    } catch(error) {
        console.error('Failed to generate vocabulary list:', error);
        toast({
            variant: 'destructive',
            title: 'Error Generating Words',
            description: 'Failed to generate a new word list. Please try again.',
        });
        
    }
  }


  return (
    <Card className="w-full shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle>Start Learning</CardTitle>
        <CardDescription>Choose how you want to create your vocabulary list.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate with AI</TabsTrigger>
            <TabsTrigger value="paste">Paste Words</TabsTrigger>
          </TabsList>
          
          <TabsContent value="paste" className="pt-4">
             <Form {...pasteWordsForm}>
                <form onSubmit={pasteWordsForm.handleSubmit(onPasteWordsSubmit)} className="space-y-6">
                    <FormField
                    control={pasteWordsForm.control}
                    name="wordList"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Words</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="e.g., der Apfel, das Haus, die Freundschaft, schnell..."
                            className="min-h-[120px] resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                        </>
                    ) : (
                        'Generate & Learn'
                    )}
                    </Button>
                </form>
            </Form>
          </TabsContent>

          <TabsContent value="generate" className="pt-4">
            <Form {...generateWordsForm}>
              <form onSubmit={generateWordsForm.handleSubmit(onGenerateWordsSubmit)} className="space-y-6">
                 <FormField
                  control={generateWordsForm.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Number of Words</FormLabel>
                        <span className="text-sm font-medium text-primary">{field.value}</span>
                      </div>
                      <FormControl>
                        <Slider
                            min={1}
                            max={50}
                            step={1}
                            value={[field.value]}
                            onValueValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={generateWordsForm.control}
                    name="level"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Proficiency Level</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a proficiency level" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="A1">A1 (Beginner)</SelectItem>
                                    <SelectItem value="A2">A2 (Elementary)</SelectItem>
                                    <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                                    <SelectItem value="B2">B2 (Upper Intermediate)</SelectItem>
                                    <SelectItem value="C1">C1 (Advanced)</SelectItem>
                                    <SelectItem value="C2">C2 (Proficient)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                  control={generateWordsForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Food, Travel, Technology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate with AI'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
