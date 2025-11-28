'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExerciseCard } from './exercise-card';
import { CompletionCelebration, COMPLETION_CELEBRATION_EVENT } from '@/components/common/completion-celebration';
import type { EditableSet, WorkoutProgramOption } from './types';
import { Button } from '@/components/ui/button';
import { RestTimer } from './rest-timer';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogCloseButton, DialogFooter, DialogHeader } from '@/components/ui/dialog';

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
  primaryMuscle?: string | null;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  targetReps: string;
  notes?: string;
  previousWeight?: number | null;
  previousReps?: string | null;
};

type ExerciseCatalogItem = {
  id: string;
  name: string;
  primaryMuscle: string | null;
  category: string;
  metric: string;
};

type StartWorkoutResponse = {
  workoutId: string;
  planType: string;
  note?: string | null;
  sets: StartWorkoutResponseSet[];
};

function formatReps(value: number | null): string | null {
  if (value == null) return null;
  return value === 1 ? '1 rep' : `${value} reps`;
}

export function WorkoutTodayClient({
  initialWorkoutId,
  initialPlanType,
  initialSets,
  programs,
}: WorkoutTodayClientProps) {
  const [workoutId, setWorkoutId] = useState<string | null>(initialWorkoutId);
  const [planType, setPlanType] = useState<string | null>(initialPlanType);
  const [sets, setSets] = useState<EditableSet[]>(initialSets);
  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(() => {
    const firstIncomplete = initialSets.findIndex((set) => !set.completed);
    return firstIncomplete >= 0 ? firstIncomplete : null;
  });
  const [startingProgramId, setStartingProgramId] = useState<string | null>(null);
  const [mode, setMode] = useState<'select' | 'workout'>(initialSets.length ? 'workout' : 'select');
  const [gender, setGender] = useState<'male' | 'female'>(() => {
    if (typeof window === 'undefined') return 'female';
    const stored = window.localStorage.getItem('userGender');
    return stored === 'male' || stored === 'female' ? (stored as 'male' | 'female') : 'female';
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'add' | 'replace'>('add');
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);
  const [celebrationIconRunId, setCelebrationIconRunId] = useState<number | null>(null);
  const [showGeneratingLabel, setShowGeneratingLabel] = useState(false);
  const generatingLabelTimeoutRef = useRef<number | null>(null);
  const { push } = useToast();

  const stopGeneratingLabel = useCallback(() => {
    if (generatingLabelTimeoutRef.current) {
      window.clearTimeout(generatingLabelTimeoutRef.current);
      generatingLabelTimeoutRef.current = null;
    }
    setShowGeneratingLabel(false);
  }, []);

  const startGeneratingLabel = useCallback(() => {
    stopGeneratingLabel();
    setShowGeneratingLabel(true);
    generatingLabelTimeoutRef.current = window.setTimeout(() => {
      setShowGeneratingLabel(false);
      generatingLabelTimeoutRef.current = null;
    }, 5000);
  }, [stopGeneratingLabel]);

  useEffect(() => {
    return () => {
      stopGeneratingLabel();
    };
  }, [stopGeneratingLabel]);

  useEffect(() => {
    let cancelled = false;
    const fetchExercises = async () => {
      try {
        setCatalogLoading(true);
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Kunne ikke hente øvelser');
        }
        const data: ExerciseCatalogItem[] = await response.json();
        if (!cancelled) {
          setExerciseCatalog(data);
          setCatalogError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setCatalogError(error instanceof Error ? error.message : 'Ukendt fejl ved hentning af øvelser');
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    };
    fetchExercises();
    return () => {
      cancelled = true;
    };
  }, []);

  const exerciseCatalogMap = useMemo(() => {
    return new Map(exerciseCatalog.map((item) => [item.id, item]));
  }, [exerciseCatalog]);

  useEffect(() => {
    if (!exerciseCatalog.length) return;
    setSets((prev) => {
      let changed = false;
      const next = prev.map((set) => {
        if (set.primaryMuscle) return set;
        const exercise = exerciseCatalogMap.get(set.exerciseId);
        if (exercise?.primaryMuscle) {
          changed = true;
          return { ...set, primaryMuscle: exercise.primaryMuscle };
        }
        return set;
      });
      return changed ? next : prev;
    });
  }, [exerciseCatalog, exerciseCatalogMap]);

  const completedCount = useMemo(() => sets.filter((set) => set.completed).length, [sets]);
  const exerciseCount = useMemo(() => new Set(sets.map((s) => s.exerciseId)).size, [sets]);
  const allLogged = useMemo(() => sets.length > 0 && sets.every((set) => set.completed), [sets]);
  const availableMuscleFilters = useMemo(() => {
    const muscles = new Set<string>();
    for (const exercise of exerciseCatalog) {
      if (exercise.primaryMuscle) {
        muscles.add(exercise.primaryMuscle);
      }
    }
    return Array.from(muscles).sort((a, b) => a.localeCompare(b));
  }, [exerciseCatalog]);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return exerciseCatalog.filter((exercise) => {
      let matchesMuscle = true;
      if (selectedMuscleFilter) {
        matchesMuscle = exercise.primaryMuscle === selectedMuscleFilter;
      }
      if (pickerMode === 'replace' && selectedMuscleFilter == null) {
        matchesMuscle = true;
      }
      if (!matchesMuscle) return false;
      if (!normalizedSearch) return true;
      return exercise.name.toLowerCase().includes(normalizedSearch);
    });
  }, [exerciseCatalog, pickerMode, searchTerm, selectedMuscleFilter]);

  const persistSets = useCallback(
    async (payloadSets: EditableSet[], options?: { silent?: boolean }) => {
      const { silent = false } = options ?? {};
      if (!workoutId || !planType) {
        if (!silent) {
          push({ title: 'Vælg program', description: 'Start et program før du kan logge sæt.' });
        }
        return false;
      }
      try {
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
        return true;
      } catch (error) {
        push({ title: 'Fejl', description: error instanceof Error ? error.message : 'Kunne ikke gemme.' });
        return false;
      }
    },
    [planType, push, workoutId]
  );

  const ensureActiveWorkout = useCallback(() => {
    if (!workoutId || !planType) {
      push({
        title: 'Start program',
        description: 'Start eller vælg et program før du justerer øvelser.',
      });
      return false;
    }
    return true;
  }, [planType, push, workoutId]);

  const reindexSets = useCallback((list: EditableSet[]) => {
    return list.map((set, index) => ({ ...set, orderIndex: index }));
  }, []);

  const createSetFromExercise = useCallback((exercise: ExerciseCatalogItem, orderIndex: number): EditableSet => {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      orderIndex,
      primaryMuscle: exercise.primaryMuscle,
      weight: null,
      reps: null,
      rpe: null,
      sets: null,
      completed: false,
      targetReps: '8-12',
      notes: '',
      previousWeight: null,
      previousReps: null,
    };
  }, []);

  const syncSets = useCallback(
    (nextSets: EditableSet[], options?: { message?: string }) => {
      const previousSets = sets;
      setSets(nextSets);
      void (async () => {
        const success = await persistSets(nextSets, { silent: true });
        if (!success) {
          setSets(previousSets);
        } else if (options?.message) {
          push({ title: options.message });
        }
      })();
    },
    [persistSets, push, sets]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      if (event.defaultPrevented) return;
      if ((event.target as HTMLElement | null)?.closest('textarea')) return;

      event.preventDefault();
      const inputs = Array.from(
        document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-set-input]')
      );
      const currentIndex = inputs.findIndex((input) => input === event.target);
      if (currentIndex >= 0) {
        const nextInput = inputs[currentIndex + 1];
        nextInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateSet = useCallback((index: number, next: EditableSet) => {
    setSets((prev) => prev.map((set, idx) => (idx === index ? next : set)));
  }, []);

  useEffect(() => {
    if (!allLogged) {
      setShowCompletionOverlay(false);
      setHasShownCompletion(false);
    }
  }, [allLogged]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleCelebration = (event: WindowEventMap[typeof COMPLETION_CELEBRATION_EVENT]) => {
      setCelebrationIconRunId(event.detail.runId);
    };

    window.addEventListener(COMPLETION_CELEBRATION_EVENT, handleCelebration);
    return () => window.removeEventListener(COMPLETION_CELEBRATION_EVENT, handleCelebration);
  }, []);

  useEffect(() => {
    if (celebrationIconRunId == null) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setCelebrationIconRunId(null);
    }, 1600);
    return () => window.clearTimeout(timeout);
  }, [celebrationIconRunId]);

  useEffect(() => {
    if (mode !== 'workout') {
      setShowCompletionOverlay(false);
      setHasShownCompletion(false);
      setCelebrationIconRunId(null);
    }
  }, [mode]);

  useEffect(() => {
    if (!isPickerOpen) {
      setPickerIndex(null);
      setSearchTerm('');
    }
  }, [isPickerOpen]);

  const handleCelebrationDone = useCallback(() => {
    if (!allLogged) {
      setHasShownCompletion(false);
      return;
    }
    setHasShownCompletion(true);
    if (mode === 'workout') {
      setShowCompletionOverlay(true);
    }
  }, [allLogged, mode]);

  const handleDismissOverlay = useCallback(() => {
    setShowCompletionOverlay(false);
  }, []);

  const handleToggleComplete = useCallback(
    (index: number) => {
      const currentSet = sets[index];
      if (!currentSet) return;
      const isCompleting = !currentSet.completed;
      const isYogaPlan = planType === 'yoga';
      if (isCompleting && !isYogaPlan && (currentSet.weight == null || currentSet.reps == null)) {
        push({
          title: 'Tilføj vægt og reps',
          description: 'Indtast både vægt og gentagelser før du markerer sættet som udført.',
        });
        return;
      }

      const previousWeightBefore = currentSet.previousWeight ?? null;
      const previousRepsBefore = currentSet.previousReps ?? null;
      const updatedSet: EditableSet = {
        ...currentSet,
        completed: !currentSet.completed,
        previousWeight: isCompleting
          ? currentSet.weight ?? currentSet.previousWeight ?? null
          : previousWeightBefore,
        previousReps: isCompleting
          ? formatReps(currentSet.reps) ?? currentSet.previousReps ?? null
          : previousRepsBefore,
      };

      setSets((prev) => prev.map((set, idx) => (idx === index ? updatedSet : set)));
      setActiveIndex(isCompleting ? null : index);

      void (async () => {
        const success = await persistSets([updatedSet], { silent: true });
        if (!success) {
          setSets((prev) =>
            prev.map((set, idx) => (idx === index ? { ...currentSet, previousWeight: previousWeightBefore, previousReps: previousRepsBefore } : set))
          );
          setActiveIndex(index);
        }
      })();
    },
    [persistSets, planType, push, sets]
  );

  const handleSelectCard = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Legacy navigation handler (disabled with accordion UI)
  const navigateBy = useCallback((_delta: number) => {
    // no-op: carousel removed
  }, []);

  const handleRemoveExercise = useCallback(
    (index: number) => {
      if (!ensureActiveWorkout()) return;
      if (sets.length <= 1) {
        push({
          title: 'Mindst én øvelse',
          description: 'Tilføj en ny øvelse før du fjerner den sidste.',
        });
        return;
      }
      const nextSets = reindexSets(sets.filter((_, idx) => idx !== index));
      syncSets(nextSets, { message: 'Øvelse fjernet' });
      setActiveIndex((current) => {
        if (current == null) return current;
        if (nextSets.length === 0) return null;
        if (current > index) return current - 1;
        if (current === index) return Math.min(index, nextSets.length - 1);
        return current;
      });
    },
    [ensureActiveWorkout, push, reindexSets, sets, syncSets]
  );

  const handleOpenAddDialog = useCallback(() => {
    if (!ensureActiveWorkout()) return;
    setPickerMode('add');
    setPickerIndex(null);
    setSelectedMuscleFilter(null);
    setIsPickerOpen(true);
  }, [ensureActiveWorkout]);

  const handleOpenReplaceDialog = useCallback(
    (index: number) => {
      if (!ensureActiveWorkout()) return;
      setPickerMode('replace');
      setPickerIndex(index);
      setSelectedMuscleFilter(sets[index]?.primaryMuscle ?? null);
      setIsPickerOpen(true);
    },
    [ensureActiveWorkout, sets]
  );

  const handleExerciseSelected = useCallback(
    (exercise: ExerciseCatalogItem) => {
      if (!ensureActiveWorkout()) return;
      if (pickerMode === 'replace' && pickerIndex != null) {
        const nextSets = reindexSets(
          sets.map((set, idx) => (idx === pickerIndex ? createSetFromExercise(exercise, set.orderIndex) : set))
        );
        syncSets(nextSets, { message: 'Øvelse erstattet' });
        setActiveIndex(pickerIndex);
      } else {
        const nextSet = createSetFromExercise(exercise, sets.length);
        const nextSets = reindexSets([...sets, nextSet]);
        syncSets(nextSets, { message: 'Øvelse tilføjet' });
        setActiveIndex(nextSets.length - 1);
      }
      setIsPickerOpen(false);
    },
    [
      createSetFromExercise,
      ensureActiveWorkout,
      pickerIndex,
      pickerMode,
      reindexSets,
      sets,
      syncSets,
    ]
  );

  const celebrationStartIndex = Math.max(sets.length - 4, 0);


  const mapResponseSet = useCallback(
    (set: StartWorkoutResponseSet): EditableSet => ({
      id: set.id,
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      orderIndex: set.orderIndex,
      primaryMuscle: set.primaryMuscle ?? null,
      weight: set.weight ?? null,
      reps: set.reps ?? null,
      rpe: set.rpe ?? null,
      sets: null,
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
        setShowCompletionOverlay(false);
        setHasShownCompletion(false);
        const firstIncomplete = nextSets.findIndex((set) => !set.completed);
        setActiveIndex(firstIncomplete >= 0 ? firstIncomplete : null);
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
            Vælg et fokusområde for at få 6-12 øvelser, der matcher dit mål.
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
                        full_body: upperMale,
                      };
                      const femaleMap: Record<string, any> = {
                        upper: upperFemale,
                        legs: legsFemale,
                        cardio: cardioFemale,
                        yoga: yogaFemale,
                        full_body: upperFemale,
                      };
                      const src =
                        gender === 'male'
                          ? maleMap[id] ?? maleMap['upper']
                          : femaleMap[id] ?? femaleMap['upper'];
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
                  {/* Difficulty label removed */}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                  <CardDescription>{program.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground hidden">
                    
                 
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
      <CompletionCelebration
        isComplete={allLogged && !hasShownCompletion}
        onDone={handleCelebrationDone}
      />
      {showCompletionOverlay ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          role="presentation"
          onClick={handleDismissOverlay}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-background/95 p-6 text-center shadow-2xl ring-1 ring-primary/20 animate-overlay-pop"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl">💪</div>
            <h2 className="mt-4 text-2xl font-semibold">Godt klaret!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Alle dagens øvelser er logget. Vil du have, at vi designer et måltid til dig?
            </p>
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
              <Button className="flex-1" asChild>
                <Link href="/meals/overview" onClick={() => setShowCompletionOverlay(false)}>
                  Design et måltid
                </Link>
              </Button>
              <Button variant="ghost" className="flex-1" onClick={handleDismissOverlay}>
                Ikke nu
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Måltidsoversigten er under opbygning.</p>
          </div>
        </div>
      ) : null}
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!planType) return;
                startGeneratingLabel();
                void handleStartProgram(planType).finally(() => {
                  stopGeneratingLabel();
                });
              }}
              disabled={Boolean(startingProgramId) || !planType}
            >
              {showGeneratingLabel ? 'Generer' : 'New Workout'}
            </Button>
            <Button type="button" size="sm" onClick={handleOpenAddDialog} disabled={!workoutId}>
              Tilføj øvelse
            </Button>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {completedCount}/{sets.length} logget
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
Overblik over dine øvelser for i dag. Udfyld vægt og gentagelser. God træning! 
        </p>
      </header>

      <div className="relative">
        {false && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
        )}
        {false && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
        )}
        <div className="space-y-3">
          {sets.map((set, index) => (
            <div key={`${set.exerciseId}-${index}`} className="border rounded-md overflow-hidden">
              <button
                type="button"
                className={cn(
                  'w-full flex items-center justify-between gap-3 p-4 text-left',
                  index === activeIndex ? 'bg-muted/50' : 'bg-background'
                )}
                aria-expanded={index === activeIndex}
                onClick={() => handleSelectCard(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{set.exerciseName}</span>
                    <span className="text-xs text-muted-foreground">Mål: {set.targetReps} reps</span>
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex min-w-[80px] items-center justify-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
                    set.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {set.completed ? (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className={cn(
                          'h-3.5 w-3.5 text-emerald-600',
                          celebrationIconRunId != null && index >= celebrationStartIndex
                            ? 'celebration-check-icon'
                            : undefined
                        )}
                        style={
                          celebrationIconRunId != null && index >= celebrationStartIndex
                            ? { animationDelay: `${(index - celebrationStartIndex) * 120}ms` }
                            : undefined
                        }
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 13.5 9.5 18 19 7" />
                      </svg>
                      Udført
                    </span>
                  ) : (
                    'Klar'
                  )}
                </span>
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-out',
                  index === activeIndex ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                )}
                aria-hidden={index !== activeIndex}
              >
                <div className="p-3">
                  <ExerciseCard
                    value={set}
                    onChange={(next) => updateSet(index, next)}
                    onToggleComplete={() => handleToggleComplete(index)}
                    onFocus={() => handleSelectCard(index)}
                    onReplace={() => handleOpenReplaceDialog(index)}
                    onRemove={() => handleRemoveExercise(index)}
                    disableRemove={sets.length <= 1}
                    isActive={index === activeIndex}
                    displayIndex={index + 1}
                    planType={planType}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {false && (<div className="absolute inset-y-0 left-0 hidden items-center pl-1 sm:flex">
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
        </div>)}
        {false && (<div className="absolute inset-y-0 right-0 hidden items-center pr-1 sm:flex">
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
        </div>)}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <RestTimer />
      </div>
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogHeader
          title={pickerMode === 'replace' ? 'Erstat øvelse' : 'Tilføj øvelse'}
          description={
            pickerMode === 'replace'
              ? selectedMuscleFilter
                ? `Vælg en ny øvelse fra ${selectedMuscleFilter}-gruppen.`
                : 'Vælg en ny øvelse til at erstatte den valgte.'
              : 'Søg eller filtrér for at udvide dagens program.'
          }
        />
        <div className="space-y-4">
          <Input
            placeholder="Søg efter øvelse"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {pickerMode === 'add' ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={selectedMuscleFilter == null ? 'default' : 'outline'}
                onClick={() => setSelectedMuscleFilter(null)}
              >
                Alle muskelgrupper
              </Button>
              {availableMuscleFilters.map((muscle) => (
                <Button
                  key={muscle}
                  type="button"
                  size="sm"
                  variant={selectedMuscleFilter === muscle ? 'default' : 'outline'}
                  onClick={() => setSelectedMuscleFilter(muscle)}
                >
                  {muscle}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {selectedMuscleFilter
                ? `Viser øvelser for ${selectedMuscleFilter}.`
                : 'Ingen muskelgruppe registreret – viser alle øvelser.'}
            </p>
          )}
          <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-2">
            {catalogLoading ? (
              <p className="text-sm text-muted-foreground">Henter øvelser…</p>
            ) : catalogError ? (
              <p className="text-sm text-destructive">{catalogError}</p>
            ) : filteredExercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen øvelser matcher dine filtre.</p>
            ) : (
              filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  className="w-full rounded-md border border-muted bg-background/80 p-3 text-left transition hover:border-primary/60"
                  onClick={() => handleExerciseSelected(exercise)}
                >
                  <p className="text-sm font-semibold">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.primaryMuscle ?? 'Ukendt muskel'} · {exercise.category}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogCloseButton label="Luk" />
        </DialogFooter>
      </Dialog>
    </div>
  );
}
