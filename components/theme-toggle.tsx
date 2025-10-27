'use client';

import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: Theme) => {
      if (t === 'dark') {
        root.classList.add('dark');
        // Hint browsers for native controls
        (root as HTMLElement).style.colorScheme = 'dark';
        document.body.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        (root as HTMLElement).style.colorScheme = 'light';
        document.body.style.colorScheme = 'light';
      }
    };
    apply(theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label="Skift tema"
      title={isDark ? 'Skift til lys' : 'Skift til mørk'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-muted bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <span className="mr-2 select-none">{isDark ? 'Mørk' : 'Lys'}</span>
      <span aria-hidden>{isDark ? '🌙' : '🌞'}</span>
    </button>
  );
}

export default ThemeToggle;
