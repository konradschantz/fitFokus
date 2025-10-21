import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { suggestNextWorkout } from '@/lib/plan';
import { WorkoutTodayClient } from '@/components/workout/workout-today-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

async function getActiveWorkout(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const workout = await prisma.workout.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    include: { sets: { include: { Exercise: true } } },
  });
  if (workout && new Date(workout.date).getTime() >= today.getTime()) {
    return workout;
  }
  return null;
}

export default async function WorkoutTodayPage() {
  const userId = getOrCreateUserId();
  const suggestion = await suggestNextWorkout(userId);
  let workout = await getActiveWorkout(userId);

  if (!workout) {
    workout = await prisma.workout.create({
      data: {
        userId,
        planType: suggestion.planType,
        date: new Date(),
      },
      include: { sets: { include: { Exercise: true } } },
    });
  }

  const existingSets = workout.sets.sort((a, b) => a.orderIndex - b.orderIndex);
  const initialSets = suggestion.sets.map((set, index) => {
    const existing = existingSets.find((item) => item.orderIndex === index || item.exerciseId === set.exerciseId);
    return {
      id: existing?.id,
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      orderIndex: index,
      weight: existing?.weightKg ?? set.suggestedWeight ?? null,
      reps: existing?.reps ?? null,
      rpe: existing?.rpe ?? null,
      completed: existing?.completed ?? false,
      targetReps: set.targetReps,
      notes: existing?.notes ?? '',
    };
  });

  const unmatched = existingSets.filter(
    (existing) => !initialSets.some((set) => set.exerciseId === existing.exerciseId && set.orderIndex === existing.orderIndex)
  );

  const extraSets = unmatched.map((set) => ({
    id: set.id,
    exerciseId: set.exerciseId,
    exerciseName: set.Exercise.name,
    orderIndex: set.orderIndex,
    weight: set.weightKg ?? null,
    reps: set.reps ?? null,
    rpe: set.rpe ?? null,
    completed: set.completed,
    targetReps: suggestion.sets.find((s) => s.exerciseId === set.exerciseId)?.targetReps ?? '8-12',
    notes: set.notes ?? '',
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dagens plan – {formatDate(new Date())}</CardTitle>
          <p className="text-sm text-muted-foreground">Plan-type: {suggestion.planType.replaceAll('_', ' ')}</p>
        </CardHeader>
        <CardContent>
          <WorkoutTodayClient
            workoutId={workout.id}
            planType={suggestion.planType}
            initialSets={[...initialSets, ...extraSets].sort((a, b) => a.orderIndex - b.orderIndex)}
            initialNote={workout.note}
          />
        </CardContent>
      </Card>
    </div>
  );
}
