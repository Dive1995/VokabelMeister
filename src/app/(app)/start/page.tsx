'use client';

import { VocabularySetupForm } from '@/components/vocabulary-setup-form';

export default function StartPage() {
  return (
    <main className="flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-2xl z-10">
        <div className="text-center mb-12">
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Create Your List
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate a new word list with AI or paste your own to get started.
          </p>
        </div>

        <VocabularySetupForm />
      </div>
    </main>
  );
}
