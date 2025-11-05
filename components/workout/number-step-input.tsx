'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, type KeyboardEvent } from 'react';

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
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      const inputs = Array.from(
        document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-set-input]')
      );
      const currentIndex = inputs.findIndex((input) => input === event.currentTarget);
      if (currentIndex >= 0) {
        const nextInput = inputs[currentIndex + 1];
        nextInput?.focus();
      }
    }

    inputProps?.onKeyDown?.(event);
  };

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
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
