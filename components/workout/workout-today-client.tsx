'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SetRow, type EditableSet } from './set-row';
import { Button } from '@/components/ui/button';
import { RestTimer } from './rest-timer';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';

type WorkoutTodayClientProps = {
  workoutId: string;
  planType: string;
  initialSets: EditableSet[];
  initialNote?: string | null;
};

export function WorkoutTodayClient({ workoutId, planType, initialSets, initialNote }: WorkoutTodayClientProps) {
  const [sets, setSets] = useState<EditableSet[]>(initialSets);
  const [note, setNote] = useState(initialNote ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const { push } = useToast();

  const nextIncompleteIndex = useMemo(() => sets.findIndex((set) => !set.completed), [sets]);

  const updateSet = useCallback(
    (index: number, next: EditableSet) => {
      setSets((prev) => prev.map((set, idx) => (idx === index ? next : set)));
    },
    []
  );

  const focusInput = useCallback((index: number) => {
    const selector = `[data-set-input][name$='-${index}']`;
    const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    input?.focus();
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/sets/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutId,
          planType,
          note,
          sets: sets.map((set) => ({
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
      push({ title: 'Gemt', description: 'Dine sæt er gemt.' });
    } catch (error) {
      push({ title: 'Fejl', description: error instanceof Error ? error.message : 'Kunne ikke gemme.' });
    } finally {
      setIsSaving(false);
    }
  }, [note, planType, push, sets, workoutId]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !(event.target as HTMLElement)?.closest('textarea')) {
        event.preventDefault();
        const inputs = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-set-input]'));
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
    },
    [handleSave]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const markNextSet = useCallback(() => {
    const index = nextIncompleteIndex >= 0 ? nextIncompleteIndex : sets.length - 1;
    if (index < 0) return;
    updateSet(index, { ...sets[index], completed: true });
    focusInput(index + 1);
  }, [focusInput, nextIncompleteIndex, sets, updateSet]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {sets.map((set, index) => (
          <SetRow key={`${set.exerciseId}-${index}`} value={set} onChange={(next) => updateSet(index, next)} autoFocus={index === nextIncompleteIndex} />
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-muted bg-white/70 p-4 shadow-sm">
        <label className="text-base sm:text-sm font-semibold" htmlFor="note">
          Noter
        </label>
        <Textarea
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Hvordan gik træningen?"
          data-set-input="true"
          name="note"
          className="text-base sm:text-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void handleSave()} disabled={isSaving} className="min-w-[140px] h-12 text-base sm:text-sm">
          {isSaving ? 'Gemmer…' : 'Log sæt'}
        </Button>
        <Button variant="outline" onClick={markNextSet} className="min-w-[140px] h-12 text-base sm:text-sm">
          Næste sæt
        </Button>
        <RestTimer />
      </div>
    </div>
  );
}

