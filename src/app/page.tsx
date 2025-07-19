'use client';

import { VocabularySetupForm } from '@/components/vocabulary-setup-form';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
      <div className="w-full max-w-2xl z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            VokabelMeister
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Master new vocabulary with AI-powered content generation and interactive games.
          </p>
        </div>

        <VocabularySetupForm />
      </div>
    </main>
  );
}
