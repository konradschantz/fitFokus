'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { WorkoutDraft } from '@/lib/plan';

const goals = [
  { value: 'styrke', label: 'Styrke' },
  { value: 'hypertrofi', label: 'Hypertrofi' },
  { value: 'vedligehold', label: 'Vedligehold' },
];

const equipmentOptions = [
  { value: 'gym_full', label: 'Fuldt center' },
  { value: 'home_basic', label: 'Hjemme basis' },
  { value: 'bodyweight', label: 'Kropsvægt' },
];

type PlannerClientProps = {
  initialGoal?: string | null;
  initialDaysPerWeek?: number | null;
  initialEquipment?: string | null;
};

export function PlannerClient({ initialGoal, initialDaysPerWeek, initialEquipment }: PlannerClientProps) {
  const [goal, setGoal] = useState(initialGoal ?? 'styrke');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(initialDaysPerWeek ?? 3);
  const [equipment, setEquipment] = useState(initialEquipment ?? 'gym_full');
  const [preview, setPreview] = useState<WorkoutDraft | null>(null);
  const { push } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, daysPerWeek, equipmentProfile: equipment }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Kunne ikke gemme.');
      }
      push({ title: 'Indstillinger gemt', description: 'Din plan er opdateret.' });
    } catch (error) {
      push({ title: 'Fejl', description: error instanceof Error ? error.message : 'Kunne ikke gemme indstillinger.' });
    } finally {
      setIsSaving(false);
    }
  };

  const generatePlan = async () => {
    try {
      setIsLoadingPlan(true);
      const response = await fetch('/api/plan/suggest', { method: 'POST' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Kunne ikke generere plan.');
      }
      const data = (await response.json()) as WorkoutDraft;
      setPreview(data);
      push({ title: 'Ny plan genereret', description: `Plan-type: ${data.planType}` });
    } catch (error) {
      push({ title: 'Fejl', description: error instanceof Error ? error.message : 'Kunne ikke generere plan.' });
    } finally {
      setIsLoadingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Mål</span>
          <select
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="h-11 rounded-lg border border-muted bg-background px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {goals.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Dage pr. uge</span>
          <input
            type="number"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setDaysPerWeek(Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), 7));
            }}
            className="h-11 rounded-lg border border-muted bg-background px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Udstyr</span>
          <select
            value={equipment}
            onChange={(event) => setEquipment(event.target.value)}
            className="h-11 rounded-lg border border-muted bg-background px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {equipmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void handleSave()} disabled={isSaving} className="min-w-[140px]">
          {isSaving ? 'Gemmer…' : 'Gem indstillinger'}
        </Button>
        <Button variant="outline" onClick={() => void generatePlan()} disabled={isLoadingPlan} className="min-w-[160px]">
          {isLoadingPlan ? 'Beregner…' : 'Generér næste plan'}
        </Button>
      </div>
      {preview ? (
        <div className="rounded-xl border border-muted bg-background/70 p-4 shadow-sm">
          <p className="text-sm font-semibold">Foreslået plan: {preview.planType.replaceAll('_', ' ')}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {preview.sets.map((set) => (
              <li key={set.exerciseId}>
                {set.exerciseName} – {set.targetReps} reps @ {set.suggestedWeight ?? 'BW'} kg
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
