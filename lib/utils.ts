import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('da-DK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function assertEnv(key: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Miljøvariabel ${key} mangler. Sæt ${key} i .env før du starter appen.`);
  }
  return value;
}

export type AwaitedReturn<T> = T extends (...args: any[]) => Promise<infer U> ? U : never;
