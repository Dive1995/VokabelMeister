import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Logo({ size = 'md', className }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="p-2 bg-primary rounded-lg">
        <BrainCircuit className={cn(sizeClasses[size], 'text-primary-foreground')} />
      </div>
    </div>
  );
}
