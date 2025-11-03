'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  default:
    'inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-100 disabled:pointer-events-none',
  outline:
    'inline-flex h-11 items-center justify-center rounded-lg border border-primary px-4 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-100 disabled:pointer-events-none',
  ghost:
    'inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-100 disabled:pointer-events-none',
};

const sizeVariants = {
  default: '',
  sm: 'h-9 px-3',
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizeVariants;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'default', size = 'default', type = 'button', ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          buttonVariants[variant] ?? buttonVariants.default,
          sizeVariants[size] ?? sizeVariants.default,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
