'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ExerciseCard } from './exercise-card';
import type { EditableSet, WorkoutProgramOption } from './types';
import { Button } from '@/components/ui/button';
import { RestTimer } from './rest-timer';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Kategori-billeder (male/female)
import upperMale from '@/components/ui/workoutCategori/maleUpperbodyCat.png';
import upperFemale from '@/components/ui/workoutCategori/upperBodyFemaleCat.png';
import legsMale from '@/components/ui/workoutCategori/maleLowerBodyCat.png';
import legsFemale from '@/components/ui/workoutCategori/legCat.png';
import cardioMale from '@/components/ui/workoutCategori/cardioMaleCat.png';
import cardioFemale from '@/components/ui/workoutCategori/cardioFemaleCat.png';
import yogaMale from '@/components/ui/workoutCategori/yogaMaleCat.png';
import yogaFemale from '@/components/ui/workoutCategori/femaleYogaCat.png';

type WorkoutTodayClientProps = {
  initialWorkoutId: string | null;
  initialPlanType: string | null;
  initialSets: EditableSet[];
  programs: WorkoutProgramOption[];
};

type StartWorkoutResponseSet = {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  targetReps: string;
  notes?: string;
  previousWeight?: number | null;
  previousReps?: string | null;
};

type StartWorkoutResponse = {
  workoutId: string;
  planType: string;
  note?: string | null;
  sets: StartWorkoutResponseSet[];
};

export function WorkoutTodayClient({
  initialWorkoutId,
  initialPlanType,
  initialSets,
  programs,
}: WorkoutTodayClientProps) {
  const [workoutId, setWorkoutId] = useState<string | null>(initialWorkoutId);
  const [planType, setPlanType] = useState<string | null>(initialPlanType);
  const [sets, setSets] = useState<EditableSet[]>(initialSets);
  const [isSaving, setIsSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => {
    const firstIncomplete = initialSets.findIndex((set) => !set.completed);
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  const [startingProgramId, setStartingProgramId] = useState<string | null>(null);
  const [mode, setMode] = useState<'select' | 'workout'>(initialSets.length ? 'workout' : 'select');
  const [gender, setGender] = useState<'male' | 'female'>(() => {
    if (typeof window === 'undefined') return 'female';
    const stored = window.localStorage.getItem('userGender');
    return stored === 'male' || stored === 'female' ? (stored as 'male' | 'female') : 'female';
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
      if (!workoutId || !planType) {
        if (!silent) {
          push({ title: 'Vælg program', description: 'Start et program før du kan logge sæt.' });
        }
        return;
      }
      try {
        if (!silent) setIsSaving(true);
        const response = await fetch('/api/sets/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutId,
            planType,
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
          const data = await response.json().catch(() => ({}));
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
    [planType, push, workoutId]
  );

  const handleSave = useCallback(() => {
    void persistSets(sets);
  }, [persistSets, sets]);

  useEffect(() => {
    if (mode !== 'workout') return;
    scrollToCard(activeIndex);
  }, [activeIndex, mode, scrollToCard]);

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
        const next = (current + delta + len) % len;
        return next;
      });
    },
    [sets.length]
  );

  useEffect(() => {
    if (mode !== 'workout') return;
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
  }, [mode, navigateBy]);

  const mapResponseSet = useCallback(
    (set: StartWorkoutResponseSet): EditableSet => ({
      id: set.id,
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      orderIndex: set.orderIndex,
      weight: set.weight ?? null,
      reps: set.reps ?? null,
      rpe: set.rpe ?? null,
      completed: set.completed ?? false,
      targetReps: set.targetReps,
      notes: set.notes ?? '',
      previousWeight: set.previousWeight ?? null,
      previousReps: set.previousReps ?? null,
    }),
    []
  );

  const handleStartProgram = useCallback(
    async (programId: string) => {
      setStartingProgramId(programId);
      try {
        const response = await fetch('/api/workout/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planType: programId }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message ?? 'Kunne ikke starte programmet');
        }
        const payload: StartWorkoutResponse = await response.json();
        const nextSets = payload.sets.map((set) => mapResponseSet(set));
        setSets(nextSets);
        setWorkoutId(payload.workoutId);
        setPlanType(payload.planType);
        setMode('workout');
        const firstIncomplete = nextSets.findIndex((set) => !set.completed);
        setActiveIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
        push({ title: 'Program klar', description: 'Dine øvelser er genereret.' });
      } catch (error) {
        push({
          title: 'Fejl',
          description: error instanceof Error ? error.message : 'Kunne ikke starte programmet.',
        });
      } finally {
        setStartingProgramId(null);
      }
    },
    [mapResponseSet, push]
  );

  if (mode === 'select') {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold sm:text-3xl">Hvad vil du træne i dag?</h2>
          <p className="text-sm text-muted-foreground">
            Vælg et fokusområde for at få 6-8 øvelser, der matcher dit mål.
          </p>
        </header>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">Billedvalg:</span>
          <div className="inline-flex rounded-md border p-0.5">
            <button
              type="button"
              className={cn(
                'px-2 py-1 text-xs rounded-sm',
                gender === 'female' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
              onClick={() => {
                setGender('female');
                if (typeof window !== 'undefined') window.localStorage.setItem('userGender', 'female');
              }}
            >
              Kvinde
            </button>
            <button
              type="button"
              className={cn(
                'px-2 py-1 text-xs rounded-sm',
                gender === 'male' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
              onClick={() => {
                setGender('male');
                if (typeof window !== 'undefined') window.localStorage.setItem('userGender', 'male');
              }}
            >
              Mand
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {false && programs.map((program) => (
            <Card key={program.id} className="flex h-full flex-col justify-between border-muted/70">
              <CardHeader>
                <CardTitle className="text-xl">{program.title}</CardTitle>
                <CardDescription>{program.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{program.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleStartProgram(program.id)}
                  disabled={Boolean(startingProgramId)}
                >
                  {startingProgramId === program.id ? 'Genererer…' : 'Start program'}
                </Button>
              </CardFooter>
            </Card>
          ))}
          {programs.map((program) => {
            const levelColor =
              program.level === 'Beginner'
                ? 'bg-emerald-600'
                : program.level === 'Advanced'
                ? 'bg-red-600'
                : 'bg-amber-500';
            return (
              <Card
                key={program.id}
                className="flex h-full flex-col justify-between border-muted/70 overflow-hidden shadow-md dark:bg-[#0f1f3a] dark:ring-1 dark:ring-white/10"
              >
                <div className="relative -mx-4 -mt-4 h-36 w-auto sm:h-40 bg-black">
                  {
                    (() => {
                      const id = program.id as 'upper' | 'legs' | 'cardio' | 'yoga' | string;
                      const maleMap: Record<string, any> = {
                        upper: upperMale,
                        legs: legsMale,
                        cardio: cardioMale,
                        yoga: yogaMale,
                      };
                      const femaleMap: Record<string, any> = {
                        upper: upperFemale,
                        legs: legsFemale,
                        cardio: cardioFemale,
                        yoga: yogaFemale,
                      };
                      const src = (gender === 'male' ? maleMap[id] : femaleMap[id]) ?? maleMap['upper'];
                      return (
                        <Image
                          src={src}
                          alt="Workout preview"
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      );
                    })()
                  }
                  {program.level && (
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-semibold text-white shadow ${levelColor}`}
                    >
                      {program.level}
                    </span>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                  <CardDescription>{program.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">⏱ {program.durationMin ?? 30} min</span>
                    <span className="inline-flex items-center gap-1">🔥 {program.calories ?? 200} kcal</span>
                    <span className="inline-flex items-center gap-1">🏋️ {program.exerciseCount ?? 8} øvelser</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleStartProgram(program.id)}
                    disabled={Boolean(startingProgramId)}
                  >
                    {startingProgramId === program.id ? 'Genererer…' : 'Start program'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">
            {planType ? `Dagens øvelser – ${planType}` : 'Dagens øvelser'}
          </h2>
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

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving || !workoutId} className="min-w-[160px] h-12 text-base sm:text-sm">
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
