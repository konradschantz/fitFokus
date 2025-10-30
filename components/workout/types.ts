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
  previousWeight?: number | null;
  previousReps?: string | null;
};

export type WorkoutProgramOption = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMin?: number;
  calories?: number;
  exerciseCount?: number;
};
