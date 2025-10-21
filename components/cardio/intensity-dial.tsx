'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function IntensityDial({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 10 }, (_, index) => index + 1).map((level) => (
        <Button
          key={level}
          type="button"
          variant="ghost"
          className={cn(
            'h-12 rounded-lg border border-muted text-base font-semibold',
            value === level ? 'border-primary bg-primary/10 text-primary' : 'text-foreground'
          )}
          onClick={() => onChange(level)}
        >
          {level}
        </Button>
      ))}
    </div>
  );
}
