'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCallback, type InputHTMLAttributes } from 'react';

type NumberStepInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement> & { [key: string]: any };
};

export function NumberStepInput({ value, onChange, step = 1, min, max, placeholder, className, inputProps }: NumberStepInputProps) {
  const update = useCallback(
    (delta: number) => {
      const next = Number(value ?? 0) + delta;
      if (min != null && next < min) return onChange(min);
      if (max != null && next > max) return onChange(max);
      onChange(Number.isNaN(next) ? null : Math.round(next * 100) / 100);
    },
    [value, onChange, min, max]
  );

  return (
    <div className={cn('flex h-11 items-center gap-2', className)}>
      <Button
        variant="ghost"
        type="button"
        className="h-11 w-11 rounded-lg border border-muted text-lg"
        onClick={() => update(-step)}
        aria-label="minus"
      >
        -
      </Button>
      <Input
        value={value ?? ''}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === '') return onChange(null);
          const parsed = Number(raw);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        inputMode="decimal"
        placeholder={placeholder}
        className="h-11 text-center text-base"
        {...inputProps}
      />
      <Button
        variant="ghost"
        type="button"
        className="h-11 w-11 rounded-lg border border-muted text-lg"
        onClick={() => update(step)}
        aria-label="plus"
      >
        +
      </Button>
    </div>
  );
}
