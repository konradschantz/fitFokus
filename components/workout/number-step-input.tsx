'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type InputHTMLAttributes } from 'react';

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
  return (
    <div className={cn('flex h-11 w-full items-center', className)}>
      <Input
        value={value ?? ''}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === '') return onChange(null);
          const parsed = Number(raw);
          if (Number.isNaN(parsed)) return;
          // Respect min/max if provided
          if (min != null && parsed < min) return onChange(min);
          if (max != null && parsed > max) return onChange(max);
          onChange(parsed);
        }}
        inputMode="decimal"
        placeholder={placeholder}
        className="h-11 w-full min-w-0 text-base"
        {...inputProps}
      />
    </div>
  );
}
