import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Logo({ size = 'md', className }: LogoProps) {
  const sizeClasses = {
    sm: { container: 'p-1', icon: 'h-4 w-4' },
    md: { container: 'p-2', icon: 'h-6 w-6' },
    lg: { container: 'p-4', icon: 'h-32 w-32' },
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(selectedSize.container, 'bg-primary rounded-lg')}>
        <BrainCircuit className={cn(selectedSize.icon, 'text-primary-foreground')} />
      </div>
    </div>
  );
}
