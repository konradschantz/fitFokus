'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { signOut } from 'next-auth/react';

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

type SettingsClientProps = {
  initialGoal?: string | null;
  initialDaysPerWeek?: number | null;
  initialEquipment?: string | null;
};

export function SettingsClient({ initialGoal, initialDaysPerWeek, initialEquipment }: SettingsClientProps) {
  const [goal, setGoal] = useState(initialGoal ?? 'styrke');
  const [daysPerWeek, setDaysPerWeek] = useState(initialDaysPerWeek ?? 3);
  const [equipment, setEquipment] = useState(initialEquipment ?? 'gym_full');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { push } = useToast();

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
        throw new Error(data.message ?? 'Kunne ikke gemme indstillinger.');
      }
      push({ title: 'Indstillinger gemt', description: 'Dine præferencer er opdateret.' });
    } catch (error) {
      push({ title: 'Fejl', description: error instanceof Error ? error.message : 'Kunne ikke gemme indstillinger.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/settings', { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Kunne ikke slette data.');
      }
      push({ title: 'Data slettet', description: 'Alle dine workouts er fjernet.' });
    } catch (error) {
      push({ title: 'Fejl', description: error instanceof Error ? error.message : 'Kunne ikke slette data.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-base sm:text-sm font-semibold">Mål</span>
          <select
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="h-11 rounded-lg border border-muted bg-background px-3 text-base sm:text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {goals.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-base sm:text-sm font-semibold">Dage pr. uge</span>
          <input
            type="number"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setDaysPerWeek(Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), 7));
            }}
            className="h-11 rounded-lg border border-muted bg-background px-3 text-base sm:text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-base sm:text-sm font-semibold">Udstyr</span>
          <select
            value={equipment}
            onChange={(event) => setEquipment(event.target.value)}
            className="h-11 rounded-lg border border-muted bg-background px-3 text-base sm:text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {equipmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button onClick={() => void handleSave()} disabled={isSaving} className="min-w-[140px]">
        {isSaving ? 'Gemmer…' : 'Gem præferencer'}
      </Button>
      <div className="space-y-3 rounded-xl border border-muted bg-background/70 p-4 shadow-sm">
        <p className="text-base sm:text-sm font-semibold">Eksport</p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/export?format=json"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-muted px-4 text-base sm:text-sm font-medium text-foreground hover:border-primary"
          >
            Download JSON
          </a>
          <a
            href="/api/export?format=csv"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-muted px-4 text-base sm:text-sm font-medium text-foreground hover:border-primary"
          >
            Download CSV
          </a>
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
        <p className="text-base sm:text-sm font-semibold text-destructive">Slet alle data</p>
        <p className="text-sm text-destructive/80">Dette kan ikke fortrydes.</p>
        <Button
          variant="outline"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          className="border-destructive/40 text-destructive transition hover:bg-destructive/10"
        >
          {isDeleting ? 'Sletter…' : 'Slet data'}
        </Button>
      </div>
      <div className="pt-2">
        <Button onClick={() => signOut({ callbackUrl: '/' })} className="w-full">
          Log af
        </Button>
      </div>
    </div>
  );
}
