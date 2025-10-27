// app/workout/today/page.tsx
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { suggestNextWorkout } from '@/lib/plan';
import { WorkoutTodayClient } from '@/components/workout/workout-today-client';
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
  // 1) Få et rigtigt id (med await) og bekræft at det findes i DB
  const userId = await getOrCreateUserId();

  // Hårdfør sanity check – hvis dette fejler, peger du på en anden DB eller får et forkert id retur
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) {
    console.error('Resolved userId not found in DB:', { userId });
    throw new Error('User not found for resolved userId — check auth & DATABASE_URL');
  }

  const suggestion = await suggestNextWorkout(userId);
  let workout = await getActiveWorkout(userId);

  if (!workout) {
    // 2) Brug relations-syntaks (connect) i stedet for rå userId
    workout = await prisma.workout.create({
      data: {
        User: { connect: { id: userId } },
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

  const orderedSets = [...initialSets, ...extraSets].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/15 via-background to-background p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Træning i dag</p>
            <h1 className="text-3xl font-bold sm:text-4xl">Dagens program</h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Din plan er skræddersyet efter {suggestion.planType.replaceAll('_', ' ')}-programmet. Vælg den øvelse du vil starte
              med, og log den direkte fra karrusellen.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Øvelser i dag</p>
              <p className="text-lg font-semibold">{orderedSets.length}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Aktivt program</p>
              <p className="text-lg font-semibold">{suggestion.planType.replaceAll('_', ' ')}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Dato</p>
              <p className="text-lg font-semibold">{formatDate(new Date())}</p>
            </div>
          </div>
        </div>
      </section>

      <WorkoutTodayClient
        workoutId={workout.id}
        planType={suggestion.planType}
        initialSets={orderedSets}
        initialNote={workout.note}
      />
    </div>
  );
}
console.log("DB host:", (process.env.DATABASE_URL ?? "").split("@").pop()?.split("/")[0]);
