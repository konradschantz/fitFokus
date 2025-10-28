'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getExerciseImageSrc } from '@/components/workout/exercise-images';

export type ExerciseLite = {
  id: string;
  name: string;
  category: string;
  equipment: string | null;
  primaryMuscle?: string | null;
};

type Props = {
  exercises: ExerciseLite[];
};

function ExerciseCarousel({ title, items }: { title: string; items: ExerciseLite[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const navigateBy = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        const len = items.length;
        if (len === 0) return 0;
        return (current + delta + len) % len;
      });
    },
    [items.length]
  );

  useEffect(() => {
    const node = cardRefs.current[activeIndex];
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIndex]);

  // Swipe support
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

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" className="h-9 w-9 rounded-full border border-muted px-0" onClick={() => navigateBy(-1)} disabled={items.length <= 1} aria-label="Forrige">
            ‹
          </Button>
          <Button type="button" variant="ghost" className="h-9 w-9 rounded-full border border-muted px-0" onClick={() => navigateBy(1)} disabled={items.length <= 1} aria-label="Næste">
            ›
          </Button>
        </div>
      </header>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
        <div
          ref={scrollerRef}
          className={cn(
            'flex items-stretch gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scroll-smooth',
            '-mx-4 px-4 sm:mx-0 sm:px-0',
            '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
          )}
        >
          {items.map((ex, index) => (
            <div
              key={ex.id}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className={cn(
                'w-[85vw] max-w-[380px] snap-center shrink-0 sm:w-[360px]',
                'scroll-mx-4 transition duration-200',
                index === activeIndex ? 'opacity-100 scale-100' : 'opacity-60 sm:opacity-70 scale-[0.98]'
              )}
              onClick={() => setActiveIndex(index)}
            >
              <Card className={cn('flex h-full min-h-[300px] flex-col gap-4 p-4 transition-all duration-200', index === activeIndex ? 'border-primary/70 shadow-lg shadow-primary/10' : 'border-muted/80 bg-background/80')}>
                <CardHeader className="gap-2 p-0">
                  <CardTitle className="text-xl">{ex.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{ex.primaryMuscle ?? ex.category}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-0">
                  <div className="overflow-hidden rounded-lg bg-black">
                    <div className="aspect-video w-full">
                      <img
                        src={getExerciseImageSrc(ex.name) ?? '/exercise-placeholder.svg'}
                        alt={`${ex.name} billede`}
                        className="h-full w-full object-contain object-center"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExerciseCarousels({ exercises }: Props) {
  const groups = useMemo(() => {
    const legsSet = new Set(['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abductors', 'Lower Body']);
    const upperSet = new Set(['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Core', 'Upper Body']);
    const legs: ExerciseLite[] = [];
    const upper: ExerciseLite[] = [];
    exercises.forEach((e) => {
      const muscle = (e as any).primaryMuscle as string | undefined;
      if (muscle && legsSet.has(muscle)) legs.push(e);
      else if (muscle && upperSet.has(muscle)) upper.push(e);
      else {
        // Fallback: put strength lower-body names in legs by heuristic
        const name = e.name.toLowerCase();
        if (name.includes('squat') || name.includes('leg') || name.includes('lunge')) legs.push(e);
        else upper.push(e);
      }
    });
    return { legs, upper };
  }, [exercises]);

  return (
    <div className="space-y-8">
      <ExerciseCarousel title="Ben" items={groups.legs} />
      <ExerciseCarousel title="Overkrop" items={groups.upper} />
    </div>
  );
}
