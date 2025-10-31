'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NumberStepInput } from './number-step-input';
import { cn } from '@/lib/utils';
import type { EditableSet } from './types';
import { getExerciseImageSrc } from './exercise-images';

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
  const canComplete = value.weight != null && value.reps != null;

  return (
    <Card
      className={cn(
        'flex h-full min-h-[360px] flex-col justify-between gap-6 p-6 transition-all duration-200 sm:min-h-[380px]',
        isActive
          ? 'border-primary/70 shadow-lg shadow-primary/10 opacity-100 scale-100'
          : 'border-muted/80 bg-background/80 opacity-60 scale-[0.98]'
      )}
    >
      <div className="overflow-hidden rounded-t-xl bg-black -mx-6 -mt-6">
        <div className="aspect-video w-full">
          <img
            src={getExerciseImageSrc(value.exerciseName) ?? '/exercise-placeholder.svg'}
            alt={`${value.exerciseName} billede`}
            className="h-full w-full object-contain object-center"
            loading="lazy"
          />
        </div>
      </div>

      <CardHeader className="gap-3 p-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{value.exerciseName}</CardTitle>
            <p className="text-sm text-muted-foreground">Mål: {value.targetReps} reps</p>
            {(value.previousWeight != null || value.previousReps) && (
              <p className="mt-1 text-xs text-muted-foreground">
                Sidst logget: {value.previousWeight != null ? `${value.previousWeight} kg` : '—'} •{' '}
                {value.previousReps ?? '—'}
              </p>
            )}
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
        </div>
      </CardContent>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={onToggleComplete}
          className="h-12 text-base"
          variant={value.completed ? 'outline' : 'default'}
          disabled={!value.completed && !canComplete}
        >
          {value.completed ? 'Markér som ikke udført' : 'Markér som udført'}
        </Button>
        {value.completed ? (
          <p className="text-center text-xs text-muted-foreground">Øvelsen er logget – godt arbejde!</p>
        ) : canComplete ? (
          <p className="text-center text-xs text-muted-foreground">
            Log øvelsen som udført for at hoppe videre til næste kort.
          </p>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Indtast både vægt og gentagelser før du markerer øvelsen som udført.
          </p>
        )}
      </div>
    </Card>
  );
}
