'use client';

import { Checkbox } from '@/components/workout/set-row/checkbox';
import { NumberStepInput } from './number-step-input';
import { Input } from '@/components/ui/input';

export type EditableSet = {
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
};

type SetRowProps = {
  value: EditableSet;
  onChange: (value: EditableSet) => void;
  autoFocus?: boolean;
};

export function SetRow({ value, onChange, autoFocus }: SetRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-muted bg-white/70 p-3 shadow-sm sm:grid-cols-[1fr,auto,1fr,auto] sm:items-start">
      <div className="text-base sm:text-sm min-w-0">
        <p className="font-semibold truncate">{value.exerciseName}</p>
        <p className="text-sm sm:text-xs text-muted-foreground">Mål: {value.targetReps} reps</p>
      </div>
      <NumberStepInput
        value={value.weight}
        onChange={(weight) => onChange({ ...value, weight })}
        step={2.5}
        min={0}
        placeholder="Vægt (kg)"
        className="w-full min-w-0"
        inputProps={{
          'data-set-input': 'true',
          name: `weight-${value.orderIndex}`,
          autoFocus,
        }}
      />
      <div className="flex flex-col gap-2 min-w-0">
        <NumberStepInput
          value={value.reps}
          onChange={(reps) => onChange({ ...value, reps })}
          min={0}
          placeholder="Reps"
          className="h-11 w-full min-w-0"
          inputProps={{
            'data-set-input': 'true',
            name: `reps-${value.orderIndex}`,
          }}
        />
        <Input
          value={value.notes ?? ''}
          onChange={(event) => onChange({ ...value, notes: event.target.value })}
          placeholder="Noter"
          className="h-11 text-base sm:text-sm"
          data-set-input="true"
          name={`notes-${value.orderIndex}`}
        />
      </div>
      <div className="flex flex-col items-stretch sm:items-center gap-2 min-w-0">
        <NumberStepInput
          value={value.rpe}
          onChange={(rpe) => onChange({ ...value, rpe })}
          step={0.5}
          min={1}
          max={10}
          placeholder="RPE"
          className="h-11 w-full min-w-0"
          inputProps={{
            'data-set-input': 'true',
            name: `rpe-${value.orderIndex}`,
          }}
        />
        <Checkbox checked={value.completed} onCheckedChange={(completed) => onChange({ ...value, completed })} />
      </div>
    </div>
  );
}

