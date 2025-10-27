'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExerciseCard } from './exercise-card';
import type { EditableSet } from './types';
import { Button } from '@/components/ui/button';
import { RestTimer } from './rest-timer';
import { useToast } from '@/components/ui/toast';
// Notes UI removed
import { cn } from '@/lib/utils';

type WorkoutTodayClientProps = {
  workoutId: string;
  planType: string;
  initialSets: EditableSet[];
  initialNote?: string | null;
};

export function WorkoutTodayClient({ workoutId, planType, initialSets, initialNote }: WorkoutTodayClientProps) {
  const [sets, setSets] = useState<EditableSet[]>(initialSets);
  const [note] = useState(initialNote ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => {
    const firstIncomplete = initialSets.findIndex((set) => !set.completed);
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  const { push } = useToast();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const nextIncompleteIndex = useMemo(() => sets.findIndex((set) => !set.completed), [sets]);
  const completedCount = useMemo(() => sets.filter((set) => set.completed).length, [sets]);

  const scrollToCard = useCallback(
    (index: number) => {
      if (index < 0) return;
      const node = cardRefs.current[index];
      node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    },
    [cardRefs]
  );

  const persistSets = useCallback(
    async (payloadSets: EditableSet[], options?: { silent?: boolean }) => {
      const { silent = false } = options ?? {};
      try {
        if (!silent) setIsSaving(true);
        const response = await fetch('/api/sets/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutId,
            planType,
            note,
            sets: payloadSets.map((set) => ({
              exerciseId: set.exerciseId,
              orderIndex: set.orderIndex,
              weightKg: set.weight,
              reps: set.reps,
              rpe: set.rpe,
              completed: set.completed,
              notes: set.notes,
            })),
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message ?? 'Ukendt fejl');
        }
        if (!silent) {
          push({ title: 'Gemt', description: 'Dine sæt er gemt.' });
        }
      } catch (error) {
        push({ title: 'Fejl', description: error instanceof Error ? error.message : 'Kunne ikke gemme.' });
      } finally {
        if (!silent) setIsSaving(false);
      }
    },
    [note, planType, push, workoutId]
  );

  const handleSave = useCallback(() => {
    void persistSets(sets);
  }, [persistSets, sets]);

  useEffect(() => {
    // Only scroll the active card into view; avoid auto-focusing inputs
    scrollToCard(activeIndex);
  }, [activeIndex, scrollToCard]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !(event.target as HTMLElement)?.closest('textarea')) {
        event.preventDefault();
        const inputs = Array.from(
          document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-set-input]')
        );
        const currentIndex = inputs.findIndex((input) => input === event.target);
        if (currentIndex >= 0) {
          const nextInput = inputs[currentIndex + 1];
          nextInput?.focus();
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const updateSet = useCallback((index: number, next: EditableSet) => {
    setSets((prev) => prev.map((set, idx) => (idx === index ? next : set)));
  }, []);

  const handleToggleComplete = useCallback(
    (index: number) => {
      setSets((prev) => {
        const updated = prev.map((set, idx) => (idx === index ? { ...set, completed: !set.completed } : set));
        const justCompleted = updated[index]?.completed ?? false;
        // If user marked this as completed, move to the next card in a loop
        if (justCompleted) {
          const next = (index + 1) % updated.length;
          setActiveIndex(next);
        } else {
          setActiveIndex(index);
        }
        void persistSets(updated, { silent: true });
        return updated;
      });
    },
    [persistSets]
  );

  const markNextSet = useCallback(() => {
    if (nextIncompleteIndex < 0) return;
    handleToggleComplete(nextIncompleteIndex);
  }, [handleToggleComplete, nextIncompleteIndex]);

  const handleSelectCard = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const navigateBy = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        const len = sets.length;
        if (len === 0) return 0;
        // Wrap like a carousel
        const next = (current + delta + len) % len;
        return next;
      });
    },
    [sets.length]
  );

  // Basic swipe left/right support for touch devices
  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startTime = Date.now();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = Date.now() - startTime;
      if (dt < 500 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        navigateBy(dx < 0 ? 1 : -1);
      }
    };

    node.addEventListener('touchstart', onTouchStart, { passive: true });
    node.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      node.removeEventListener('touchstart', onTouchStart as any);
      node.removeEventListener('touchend', onTouchEnd as any);
    };
  }, [navigateBy]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">Dagens øvelser</h2>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {completedCount}/{sets.length} logget
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Swipe mellem kortene for at starte med den øvelse, du har mest lyst til.
        </p>
      </header>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
        <div
          className={cn(
            'flex items-stretch gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth',
            '-mx-4 px-4 sm:mx-0 sm:px-0',
            '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
          )}
          ref={scrollerRef}
        >
          {sets.map((set, index) => (
            <div
              key={`${set.exerciseId}-${index}`}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className={cn(
                'w-[85vw] max-w-[380px] snap-center shrink-0 sm:w-[360px]',
                'scroll-mx-4 transition duration-200',
                index === activeIndex ? 'opacity-100 scale-100' : 'opacity-50 sm:opacity-70 scale-[0.98]'
              )}
              onFocus={() => handleSelectCard(index)}
              onClick={() => handleSelectCard(index)}
            >
              <ExerciseCard
                value={set}
                onChange={(next) => updateSet(index, next)}
                onToggleComplete={() => handleToggleComplete(index)}
                onFocus={() => handleSelectCard(index)}
                isActive={index === activeIndex}
                displayIndex={index + 1}
              />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
        <div className="absolute inset-y-0 left-0 flex items-center pl-1">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-10 rounded-full border border-muted bg-background/80 px-0 text-lg shadow-sm"
            onClick={() => navigateBy(-1)}
            aria-label="Forrige øvelse"
            disabled={sets.length <= 1}
          >
            ‹
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-10 rounded-full border border-muted bg-background/80 px-0 text-lg shadow-sm"
            onClick={() => navigateBy(1)}
            aria-label="Næste øvelse"
            disabled={sets.length <= 1}
          >
            ›
          </Button>
        </div>
      </div>

      {/** Notes section hidden per request */}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="min-w-[160px] h-12 text-base sm:text-sm">
          {isSaving ? 'Gemmer…' : 'Log hele træningen'}
        </Button>
        <Button
          variant="outline"
          onClick={markNextSet}
          className="min-w-[160px] h-12 text-base sm:text-sm"
          disabled={nextIncompleteIndex < 0}
        >
          Markér næste øvelse som udført
        </Button>
        <RestTimer />
      </div>
    </div>
  );
}


