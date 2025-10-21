'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = value ?? internalValue;
  const ctx = useMemo<TabsContextValue>(
    () => ({
      value: currentValue,
      onValueChange: (next) => {
        setInternalValue(next);
        onValueChange?.(next);
      },
    }),
    [currentValue, onValueChange]
  );
  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex gap-2 rounded-lg bg-muted p-1', className)} {...props} />;
}

export function TabsTrigger({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used inside Tabs');
  const isActive = ctx.value === value;
  return (
    <button
      type="button"
      onClick={(event) => {
        props.onClick?.(event);
        ctx.onValueChange?.(value);
      }}
      className={cn(
        'flex h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-medium transition',
        isActive ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground',
        className
      )}
      aria-pressed={isActive}
      {...props}
    />
  );
}

export function TabsContent({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used inside Tabs');
  if (ctx.value !== value) return null;
  return <div className={cn('mt-4', className)} {...props} />;
}
