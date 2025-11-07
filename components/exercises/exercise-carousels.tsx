'use client';
/* eslint-disable @next/next/no-img-element */

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
  const lastInteractionRef = useRef<'programmatic' | 'gesture'>('programmatic');
  const activeIndexRef = useRef(0);

  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    const card = cardRefs.current[index];
    if (!scroller || !card) return;

    const offset = card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
  }, []);

  const navigateBy = useCallback(
    (delta: number, source: 'programmatic' | 'gesture' = 'programmatic') => {
      lastInteractionRef.current = source;
      setActiveIndex((current) => {
        const len = items.length;
        if (len === 0) return 0;
        const nextIndex = (current + delta + len) % len;
        window.requestAnimationFrame(() => scrollToIndex(nextIndex));
        return nextIndex;
      });
    },
    [items.length, scrollToIndex]
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let rafId = 0;
    let gestureEndTimeout: number | null = null;

    const updateActiveFromScroll = () => {
      if (lastInteractionRef.current !== 'gesture') return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        const { scrollLeft, clientWidth } = scroller;
        const center = scrollLeft + clientWidth / 2;
        let closestIndex = activeIndexRef.current;
        let minDistance = Number.POSITIVE_INFINITY;

        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(cardCenter - center);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        if (closestIndex !== activeIndexRef.current) {
          activeIndexRef.current = closestIndex;
          setActiveIndex(closestIndex);
        }
      });
    };

    const markGestureStart = () => {
      if (gestureEndTimeout !== null) {
        window.clearTimeout(gestureEndTimeout);
        gestureEndTimeout = null;
      }
      lastInteractionRef.current = 'gesture';
    };
    const markGestureEnd = () => {
      if (gestureEndTimeout !== null) {
        window.clearTimeout(gestureEndTimeout);
      }
      gestureEndTimeout = window.setTimeout(() => {
        lastInteractionRef.current = 'programmatic';
      }, 150);
    };

    scroller.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    scroller.addEventListener('pointerdown', markGestureStart, { passive: true });
    scroller.addEventListener('touchstart', markGestureStart, { passive: true });
    window.addEventListener('pointerup', markGestureEnd, { passive: true });
    window.addEventListener('pointercancel', markGestureEnd, { passive: true });
    window.addEventListener('touchend', markGestureEnd, { passive: true });
    window.addEventListener('touchcancel', markGestureEnd, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (gestureEndTimeout !== null) {
        window.clearTimeout(gestureEndTimeout);
      }
      scroller.removeEventListener('scroll', updateActiveFromScroll);
      scroller.removeEventListener('pointerdown', markGestureStart);
      scroller.removeEventListener('touchstart', markGestureStart);
      window.removeEventListener('pointerup', markGestureEnd);
      window.removeEventListener('pointercancel', markGestureEnd);
      window.removeEventListener('touchend', markGestureEnd);
      window.removeEventListener('touchcancel', markGestureEnd);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-full border border-muted px-0"
            onClick={() => navigateBy(-1)}
            disabled={items.length <= 1}
            aria-label="Forrige"
          >
            ‹
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-full border border-muted px-0"
            onClick={() => navigateBy(1)}
            disabled={items.length <= 1}
            aria-label="Næste"
          >
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
              className={cn('w-[85vw] max-w-[380px] snap-center shrink-0 sm:w-[360px]', 'scroll-mx-4')}
              onClick={() => {
                lastInteractionRef.current = 'programmatic';
                setActiveIndex(index);
                scrollToIndex(index);
              }}
            >
              <Card
                className={cn(
                  'flex h-full min-h-[300px] flex-col gap-4 p-4 transition-all duration-200 transform-gpu will-change-transform',
                  index === activeIndex
                    ? 'border-primary/70 shadow-lg shadow-primary/10 opacity-100 scale-100'
                    : 'border-muted/80 bg-background/80 opacity-60 sm:opacity-70 scale-[0.98]'
                )}
              >
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
  const [layout, setLayout] = useState<'carousel' | 'list'>('carousel');
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
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <span className="text-sm text-muted-foreground sm:text-right">Vælg hvordan øvelserne vises:</span>
        <div className="inline-flex items-center gap-1 rounded-full border border-muted bg-background p-1 text-xs">
          <Button
            type="button"
            size="sm"
            variant={layout === 'carousel' ? 'default' : 'ghost'}
            className={cn(
              'h-8 rounded-full px-3 font-medium transition-colors',
              layout === 'carousel' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
            onClick={() => setLayout('carousel')}
            aria-pressed={layout === 'carousel'}
          >
            Swipe
          </Button>
          <Button
            type="button"
            size="sm"
            variant={layout === 'list' ? 'default' : 'ghost'}
            className={cn(
              'h-8 rounded-full px-3 font-medium transition-colors',
              layout === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
            onClick={() => setLayout('list')}
            aria-pressed={layout === 'list'}
          >
            Liste
          </Button>
        </div>
      </div>
      {layout === 'carousel' ? (
        <div className="space-y-8">
          <ExerciseCarousel title="Ben" items={groups.legs} />
          <ExerciseCarousel title="Overkrop" items={groups.upper} />
        </div>
      ) : (
        <div className="space-y-8">
          <ExerciseListSection title="Ben" items={groups.legs} />
          <ExerciseListSection title="Overkrop" items={groups.upper} />
        </div>
      )}
    </div>
  );
}

function ExerciseListSection({ title, items }: { title: string; items: ExerciseLite[] }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((ex) => (
          <Card key={ex.id} className="border-muted/70 bg-background/80">
            <div className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-black">
                <img
                  src={getExerciseImageSrc(ex.name) ?? '/exercise-placeholder.svg'}
                  alt={`${ex.name} billede`}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold leading-tight">{ex.name}</p>
                <p className="text-xs text-muted-foreground">
                  {ex.primaryMuscle ?? ex.category}
                  {ex.equipment ? ` • ${ex.equipment}` : ''}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
