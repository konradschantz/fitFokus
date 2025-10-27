'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NumberStepInput } from './number-step-input';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { EditableSet } from './types';

export type ExerciseCardProps = {
  value: EditableSet;
  onChange: (value: EditableSet) => void;
  onToggleComplete: () => void;
  onFocus?: () => void;
  isActive: boolean;
  displayIndex: number;
};

export function ExerciseCard({
  value,
  onChange,
  onToggleComplete,
  onFocus,
  isActive,
  displayIndex,
}: ExerciseCardProps) {
  const statusLabel = useMemo(() => (value.completed ? 'Udført' : 'Klar'), [value.completed]);

  return (
    <Card
      className={cn(
        'flex h-full min-h-[360px] flex-col justify-between gap-6 p-6 transition-all duration-200 sm:min-h-[380px]',
        isActive ? 'border-primary/70 shadow-lg shadow-primary/10' : 'border-muted/80 bg-background/80'
      )}
    >
      <CardHeader className="gap-3 p-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{value.exerciseName}</CardTitle>
            <p className="text-sm text-muted-foreground">Mål: {value.targetReps} reps</p>
          </div>
          <span
            className={cn(
              'inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
              value.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
            )}
          >
            {statusLabel}
          </span>
        </div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Øvelse {displayIndex}</p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6 p-0">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-muted-foreground">Vægt (kg)</span>
            <NumberStepInput
              value={value.weight}
              onChange={(weight) => onChange({ ...value, weight })}
              step={2.5}
              min={0}
              placeholder="Vægt"
              inputProps={{
                'data-set-input': 'true',
                name: `weight-${value.orderIndex}`,
                onFocus,
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-muted-foreground">Reps</span>
            <NumberStepInput
              value={value.reps}
              onChange={(reps) => onChange({ ...value, reps })}
              min={0}
              placeholder="Reps"
              inputProps={{
                'data-set-input': 'true',
                name: `reps-${value.orderIndex}`,
                onFocus,
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-muted-foreground">RPE</span>
            <NumberStepInput
              value={value.rpe}
              onChange={(rpe) => onChange({ ...value, rpe })}
              step={0.5}
              min={1}
              max={10}
              placeholder="RPE"
              inputProps={{
                'data-set-input': 'true',
                name: `rpe-${value.orderIndex}`,
                onFocus,
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-muted-foreground">Noter</span>
            <Input
              value={value.notes ?? ''}
              onChange={(event) => onChange({ ...value, notes: event.target.value })}
              placeholder="Tilføj noter"
              className="h-11 text-base"
              data-set-input="true"
              name={`notes-${value.orderIndex}`}
              onFocus={onFocus}
            />
          </div>
        </div>
      </CardContent>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={onToggleComplete}
          className="h-12 text-base"
          variant={value.completed ? 'secondary' : 'default'}
        >
          {value.completed ? 'Markér som ikke udført' : 'Markér som udført'}
        </Button>
        {value.completed ? (
          <p className="text-center text-xs text-muted-foreground">Øvelsen er logget – godt arbejde!</p>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Log øvelsen som udført for at hoppe videre til næste kort.
          </p>
        )}
      </div>
    </Card>
  );
}
