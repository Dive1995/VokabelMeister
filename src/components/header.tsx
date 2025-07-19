'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Gamepad2 } from 'lucide-react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const navItems = [
  { href: '/learn', icon: BookOpen, label: 'Learn' },
  { href: '/games', icon: Gamepad2, label: 'Games' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Logo />
            <span className="font-semibold text-lg hidden sm:inline-block">VokabelMeister</span>
          </Link>
          <div className="flex items-center gap-4">
             {navItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" size="sm" className={cn(
                'text-muted-foreground',
                { 'text-primary bg-primary/10': pathname.startsWith(item.href) }
              )}>
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span className="ml-2 hidden md:inline-block">{item.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
        {/* Placeholder for future elements like user profile */}
        <div></div>
      </nav>
    </header>
  );
}
