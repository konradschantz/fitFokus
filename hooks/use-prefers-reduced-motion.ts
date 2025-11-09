import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      const listener = (event: MediaQueryListEvent) => handleChange(event);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    const legacyListener = (event: MediaQueryListEvent) => handleChange(event);
    mediaQuery.addListener(legacyListener);
    return () => mediaQuery.removeListener(legacyListener);
  }, []);

  return prefersReducedMotion;
}
