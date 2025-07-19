'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { generateVocabularyContent } from '@/ai/flows/generate-vocabulary-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { VocabularyWord } from '@/lib/types';

const FormSchema = z.object({
  wordList: z.string().min(1, 'Please enter at least one word.').refine(
    (value) => {
      const words = value.split(',').map(word => word.trim()).filter(Boolean);
      return words.length > 0;
    },
    { message: 'Please enter a valid comma-separated list of words.' }
  ),
});

export function VocabularySetupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      wordList: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    const words = data.wordList.split(',').map(word => word.trim()).filter(Boolean);

    try {
      const generatedContentPromises = words.map(word => 
        generateVocabularyContent({ newWord: word })
      );
      
      const results = await Promise.all(generatedContentPromises);
      
      const vocabulary: VocabularyWord[] = results.map((content, index) => ({
        ...content,
        id: `${content.word}-${index}`,
        status: 'new',
      }));

      sessionStorage.setItem('vocabulary', JSON.stringify(vocabulary));
      router.push('/learn');
    } catch (error) {
      console.error('Failed to generate vocabulary content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate vocabulary. Please try again.',
      });
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle>Start Learning</CardTitle>
        <CardDescription>Enter a comma-separated list of words you want to learn.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="wordList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Words</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Apfel, Haus, Freundschaft, schnell..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
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
                'Generate & Learn'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
