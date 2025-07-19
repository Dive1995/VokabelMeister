'use client';

import { VocabularySetupForm } from '@/components/vocabulary-setup-form';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-grid-gray-200/40 dark:bg-grid-gray-700/40">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
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
