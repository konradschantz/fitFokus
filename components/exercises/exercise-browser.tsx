'use client';

import { ExercisePicker, type ExerciseOption } from '@/components/common/exercise-picker';
import { useToast } from '@/components/ui/toast';

type ExerciseBrowserProps = {
  exercises: ExerciseOption[];
};

export function ExerciseBrowser({ exercises }: ExerciseBrowserProps) {
  const { push } = useToast();
  return (
    <ExercisePicker
      exercises={exercises}
      onSelect={(exercise) =>
        push({
          title: exercise.name,
          description: `${exercise.category} • ${exercise.metric}`,
        })
      }
    />
  );
}
