'use client';

import { useState } from 'react';
import { IntensityDial } from './intensity-dial';
import { NumberStepInput } from '@/components/workout/number-step-input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

export function CardioLogger({ defaultDuration, defaultIntensity }: { defaultDuration: number; defaultIntensity: number }) {
  const [duration, setDuration] = useState<number | null>(defaultDuration);
  const [intensity, setIntensity] = useState<number>(defaultIntensity);
  const [distance, setDistance] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { push } = useToast();

  const handleSubmit = async () => {
    if (duration == null || duration <= 0) {
      push({ title: 'Varighed mangler', description: 'Sæt varighed i minutter.' });
      return;
    }
    try {
      setIsSaving(true);
      const response = await fetch('/api/cardio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMin: duration, intensity, distanceM: distance, notes }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Ukendt fejl');
      }
      push({ title: 'Cardio logget', description: `${duration} min på intensitet ${intensity}` });
      setNotes('');
    } catch (error) {
      push({ title: 'Fejl', description: error instanceof Error ? error.message : 'Kunne ikke logge cardio.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold">Varighed (minutter)</p>
        <NumberStepInput value={duration} onChange={(v) => setDuration(v)} step={5} min={5} inputProps={{ 'data-set-input': 'true', name: 'duration' }} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Intensitet (1-10)</p>
        <IntensityDial value={intensity} onChange={setIntensity} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Distance (meter, valgfri)</p>
        <NumberStepInput value={distance} onChange={(v) => setDistance(v)} step={100} min={0} inputProps={{ 'data-set-input': 'true', name: 'distance' }} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Noter</p>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Hvordan føltes turen?" />
      </div>
      <Button onClick={() => void handleSubmit()} disabled={isSaving} className="min-w-[160px]">
        {isSaving ? 'Gemmer…' : 'Log cykling'}
      </Button>
    </div>
  );
}
