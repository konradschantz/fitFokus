'use client';

import { cloneElement, forwardRef, isValidElement, ReactElement } from 'react';
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
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      type = 'button',
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      buttonVariants[variant] ?? buttonVariants.default,
      sizeVariants[size] ?? sizeVariants.default,
      className
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        ...props,
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
