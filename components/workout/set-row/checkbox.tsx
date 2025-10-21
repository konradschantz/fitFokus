'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-muted bg-white shadow-sm">
        <input
          ref={ref}
          type="checkbox"
          className={cn('peer sr-only', className)}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
          {...props}
        />
        <span className="pointer-events-none text-lg font-semibold text-muted-foreground peer-checked:text-primary">✓</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
