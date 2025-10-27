'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

export type ExerciseOption = {
  id: string;
  name: string;
  category: string;
  equipment: string | null;
  metric: string;
};

type ExercisePickerProps = {
  exercises: ExerciseOption[];
  onSelect: (exercise: ExerciseOption) => void;
};

export function ExercisePicker({ exercises, onSelect }: ExercisePickerProps) {
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useLocalStorage<string[]>('fitfokus_favorites', []);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(lower));
  }, [exercises, query]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Søg efter øvelse"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-11"
      />
      <div className="grid gap-2">
        {filtered.map((exercise) => {
          const isFavorite = favorites.includes(exercise.id);
          return (
            <div
              key={exercise.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(exercise)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(exercise);
                }
              }}
              className={cn(
                'flex w-full flex-col rounded-xl border border-muted bg-background/80 p-3 text-left shadow-sm transition hover:border-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">{exercise.category}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn('h-9 rounded-full border border-muted px-3 text-xs', isFavorite && 'border-primary text-primary')}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(exercise.id);
                  }}
                >
                  {isFavorite ? '★ Favorit' : '☆ Favorit'}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{exercise.equipment ?? 'Ingen udstyr'} • {exercise.metric}</p>
            </div>
          );
        })}
        {filtered.length === 0 ? <p className="text-sm text-muted-foreground">Ingen øvelser matcher søgningen.</p> : null}
      </div>
    </div>
  );
}
