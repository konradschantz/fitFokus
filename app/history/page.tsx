import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProgress } from '@/lib/progress';
import { ExerciseOverview, type ExerciseGroup } from '@/components/history/exercise-overview';
import { WorkoutAccordion } from '@/components/history/workout-accordion';

export default async function HistoryPage() {
  const userId = await getOrCreateUserId();
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 10,
    include: { sets: { include: { Exercise: true } } },
  });
  const progress = await getProgress(userId);
  // Build exercise overview grouped by exercise name from recent workouts
  const exerciseMap = new Map<string, ExerciseGroup>();
  for (const w of workouts) {
    for (const s of w.sets) {
      const name = (s as any).exerciseName ?? (s as any).Exercise?.name ?? 'Ukendt øvelse';
      if (!exerciseMap.has(name)) {
        exerciseMap.set(name, { name, entries: [] });
      }
      exerciseMap.get(name)!.entries.push({
        date: w.date instanceof Date ? w.date.toISOString() : new Date(w.date as any).toISOString(),
        weightKg: s.weightKg ?? null,
        reps: s.reps ?? null,
        completed: Boolean(s.completed),
      });
    }
  }
  // Sort entries per group by date desc
  const exerciseGroups: ExerciseGroup[] = Array.from(exerciseMap.values()).map((g) => ({
    ...g,
    entries: g.entries.sort((a, b) => (a.date < b.date ? 1 : -1)),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tidligere træninger</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutAccordion
            workouts={workouts.map((w) => ({
              id: w.id,
              date: w.date,
              planType: w.planType,
              sets: w.sets.map((s) => ({
                orderIndex: s.orderIndex,
                weightKg: s.weightKg,
                reps: s.reps,
                completed: s.completed,
                Exercise: { name: (s as any).Exercise?.name ?? 'Ukendt øvelse' },
              })),
            }))}
          />
        </CardContent>
      </Card>
      
    </div>
  );
}
