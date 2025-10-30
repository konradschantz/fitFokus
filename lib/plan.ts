import { prisma } from './db';
import { getPlanTypeSequence, largeLiftIncrement, templates } from './planConfig';

export type WorkoutDraft = {
  planType: string;
  sets: Array<{
    exerciseId: string;
    exerciseName: string;
    targetReps: string;
    suggestedWeight: number | null;
    rpeTarget: number | null;
    orderIndex: number;
    metric: string;
    lastLogged: { weight: number | null; reps: string | null } | null;
  }>;
};

export type RecordSetInput = {
  exerciseId: string;
  orderIndex: number;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  notes?: string;
};

export type RecordResultInput = {
  workoutId: string;
  planType: string;
  sets: RecordSetInput[];
  note?: string;
};

const TARGET_REP_RANGE = { min: 8, max: 12 };

function defaultWeightForExercise(name: string) {
  if (name.toLowerCase().includes('deadlift')) return 60;
  if (name.toLowerCase().includes('squat')) return 50;
  if (name.toLowerCase().includes('bench')) return 40;
  if (name.toLowerCase().includes('press')) return 30;
  if (name.toLowerCase().includes('row')) return 30;
  if (name.toLowerCase().includes('curl')) return 12;
  if (name.toLowerCase().includes('extension')) return 25;
  if (name.toLowerCase().includes('pushdown')) return 20;
  return 20;
}

function incrementForLift(name: string) {
  return largeLiftIncrement.has(name) ? 5 : 2.5;
}

async function determineNextPlanType(userId: string, basePlan: string): Promise<keyof typeof templates> {
  if (basePlan === 'full_body') return 'full_body';
  const sequence = getPlanTypeSequence(basePlan);
  if (!sequence.length) return 'full_body';
  const lastWorkout = await prisma.workout.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { planType: true },
  });
  if (!lastWorkout) return (sequence[0] ?? 'full_body') as keyof typeof templates;
  const currentIndex = sequence.indexOf(lastWorkout.planType);
  const next = currentIndex === -1 ? sequence[0] : sequence[(currentIndex + 1) % sequence.length];
  return (next ?? 'full_body') as keyof typeof templates;
}

async function fetchExerciseByName(name: string) {
  return prisma.exercise.findUnique({ where: { name }, select: { id: true, name: true, metric: true } });
}

type SetHistory = {
  weight: number | null;
  minReps: number;
  maxReps: number;
  rpe: number | null;
};

async function getLastSetHistories(userId: string, exerciseId: string, limit: number): Promise<SetHistory[]> {
  const sets = await prisma.set.findMany({
    where: { exerciseId, Workout: { userId } },
    orderBy: [{ Workout: { date: 'desc' } }, { orderIndex: 'asc' }],
    take: limit * 3,
    select: { weightKg: true, reps: true, rpe: true, workoutId: true, Workout: { select: { date: true } } },
  });
  const grouped = new Map<string, { weight: number | null; reps: number[]; rpe: (number | null)[] }>();
  for (const set of sets) {
    const existing =
      grouped.get(set.workoutId) ?? { weight: set.weightKg ?? null, reps: [] as number[], rpe: [] as (number | null)[] };
    if (typeof set.reps === 'number') {
      existing.reps.push(set.reps);
    }
    existing.rpe.push(set.rpe ?? null);
    if (set.weightKg != null) existing.weight = set.weightKg;
    grouped.set(set.workoutId, existing);
  }
  return Array.from(grouped.values())
    .slice(0, limit)
    .map((value) => ({
      weight: value.weight ?? null,
      minReps: value.reps.length ? Math.min(...value.reps) : 0,
      maxReps: value.reps.length ? Math.max(...value.reps) : 0,
      rpe: value.rpe.filter((v): v is number => v != null).at(-1) ?? null,
    }));
}

function computeSuggestedWeight(name: string, metric: string, histories: SetHistory[]) {
  if (metric !== 'kg_reps') return null;
  if (name.toLowerCase().includes('pull-up')) {
    return null;
  }
  const last = histories[0];
  const previous = histories[1];
  if (!last) return defaultWeightForExercise(name);
  let suggested = last.weight ?? defaultWeightForExercise(name);
  if (last.minReps < 6) {
    suggested = Math.max(0, suggested - incrementForLift(name));
  } else if (last.maxReps >= TARGET_REP_RANGE.max && (last.rpe == null || last.rpe <= 7)) {
    suggested += incrementForLift(name);
  } else if (
    previous &&
    previous.maxReps >= TARGET_REP_RANGE.max &&
    last.maxReps >= TARGET_REP_RANGE.max &&
    last.weight != null
  ) {
    suggested += incrementForLift(name);
  }
  return Math.round(suggested * 2) / 2;
}

export async function suggestNextWorkout(
  userId: string,
  options?: { planType?: string }
): Promise<WorkoutDraft> {
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  const planPreference = settings?.lastPlanType;
  let planGroup: 'full_body' | 'upper_lower' | 'push_pull_legs' = 'full_body';
  if (settings?.daysPerWeek) {
    if (settings.daysPerWeek <= 2) planGroup = 'full_body';
    else if (settings.daysPerWeek <= 4) planGroup = 'upper_lower';
    else planGroup = 'push_pull_legs';
  }
  let planType: keyof typeof templates;
  if (options?.planType && options.planType in templates) {
    planType = options.planType as keyof typeof templates;
  } else if (planPreference && planPreference in templates) {
    planType = planPreference as keyof typeof templates;
  } else {
    planType = await determineNextPlanType(userId, planGroup);
  }
  const computedPlanType = planType as keyof typeof templates;
  const exercises = templates[computedPlanType] ?? templates.full_body;
  const resolved = await Promise.all(
    exercises.map(async (exerciseName, index) => {
      const exercise = await fetchExerciseByName(exerciseName);
      if (!exercise) {
        throw new Error(`Øvelsen ${exerciseName} findes ikke i databasen. Kør prisma seed.`);
      }
      const histories = await getLastSetHistories(userId, exercise.id, 2);
      const suggestedWeight = computeSuggestedWeight(exercise.name, exercise.metric, histories);
      const last = histories[0];
      const lastLogged = last
        ? {
            weight: last.weight ?? null,
            reps:
              last.minReps === 0 && last.maxReps === 0
                ? null
                : last.minReps === last.maxReps
                  ? `${last.maxReps} reps`
                  : `${last.minReps}-${last.maxReps} reps`,
          }
        : null;
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetReps: `${TARGET_REP_RANGE.min}-${TARGET_REP_RANGE.max}`,
        suggestedWeight,
        rpeTarget: 7,
        orderIndex: index,
        metric: exercise.metric,
        lastLogged,
      };
    })
  );
  return { planType, sets: resolved };
}

export async function recordResult(input: RecordResultInput) {
  const { workoutId, planType, sets, note } = input;
  const workout = await prisma.workout.findUnique({ where: { id: workoutId }, select: { userId: true } });
  if (!workout) {
    throw new Error('Workout ikke fundet');
  }
  await prisma.$transaction(async (tx) => {
    await tx.workout.update({
      where: { id: workoutId },
      data: { planType, note },
    });
    for (const set of sets) {
      await tx.set.upsert({
        where: {
          workoutId_orderIndex: { workoutId, orderIndex: set.orderIndex },
        },
        update: {
          exerciseId: set.exerciseId,
          weightKg: set.weightKg,
          reps: set.reps ?? null,
          rpe: set.rpe ?? null,
          completed: set.completed,
          notes: set.notes,
        },
        create: {
          workoutId,
          exerciseId: set.exerciseId,
          orderIndex: set.orderIndex,
          weightKg: set.weightKg,
          reps: set.reps,
          rpe: set.rpe,
          completed: set.completed,
          notes: set.notes,
        },
      });
    }
    await tx.userSettings.upsert({
      where: { userId: workout.userId },
      update: { lastPlanType: planType },
      create: {
        userId: workout.userId,
        lastPlanType: planType,
      },
    });
  });
}
