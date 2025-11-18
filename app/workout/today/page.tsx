// app/workout/today/page.tsx
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { suggestNextWorkout } from '@/lib/plan';
import { WorkoutTodayClient } from '@/components/workout/workout-today-client';
import type { EditableSet, WorkoutProgramOption } from '@/components/workout/types';

const PROGRAM_OPTIONS: WorkoutProgramOption[] = [
  {
    id: 'upper',
    title: 'Overkrop',
    subtitle: 'Generer upper body program',
    description: 'Fokus på bryst, skuldre og ryg med press, rows og trækøvelser.',
  },
  {
    id: 'legs',
    title: 'Underkrop',
    subtitle: 'Generer leg muscles program',
    description: 'Skru op for squat-, lår- og baglårsarbejdet med tunge benøvelser.',
  },
  {
    id: 'full_body',
    title: 'Full Body',
    subtitle: 'Balancér over- og underkrop',
    description: 'En blanding af ben og overkropsøvelser for en komplet session.',
  },
  {
    id: 'cardio',
    title: 'Cardio',
    subtitle: 'Generer cardio program',
    description: 'Forbrænd kalorier og boost konditionen med simple maskinintervaller.',
  },
];

// Visuelt rigere kort med billede og metadata
const ENHANCED_PROGRAM_OPTIONS: WorkoutProgramOption[] = [
  {
    id: 'upper',
    title: 'Overkrop',
    subtitle: 'Generer upper body program',
    description: 'Fokus på bryst, skuldre og ryg med pres, rows og trækøvelser.',
    imageUrl:
      'https://images.unsplash.com/photo-1534367610401-9f625f525bb1?q=80&w=1600&auto=format&fit=crop',
    level: 'Intermediate',
    durationMin: 45,
    calories: 420,
    exerciseCount: 8,
  },
  {
    id: 'legs',
    title: 'Underkrop',
    subtitle: 'Generer leg muscles program',
    description: 'Skru op for squat-, lår- og baglårsarbejdet med tunge benøvelser.',
    imageUrl:
      'https://images.unsplash.com/photo-1571907480495-3b319147d3bd?q=80&w=1600&auto=format&fit=crop',
    level: 'Intermediate',
    durationMin: 40,
    calories: 400,
    exerciseCount: 8,
  },
  {
    id: 'full_body',
    title: 'Full Body',
    subtitle: 'Balancér over- og underkrop',
    description: 'En komplet workout der matcher ben og overkrop i samme session.',
    imageUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop',
    level: 'Intermediate',
    durationMin: 50,
    calories: 460,
    exerciseCount: 10,
  },
  {
    id: 'cardio',
    title: 'Cardio',
    subtitle: 'Generer cardio program',
    description: 'Forbrænd kalorier og boost konditionen med simple maskinintervaller.',
    imageUrl:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2a125c?q=80&w=1600&auto=format&fit=crop',
    level: 'Advanced',
    durationMin: 25,
    calories: 380,
    exerciseCount: 6,
  },
];

// Tilføj Yoga som ekstra kategori med metadata
const ALL_PROGRAM_OPTIONS: WorkoutProgramOption[] = [
  ...ENHANCED_PROGRAM_OPTIONS,
  {
    id: 'yoga',
    title: 'Yoga',
    subtitle: 'Rolig mobilitet og balance',
    description: 'Udstrækning og balance med grundlæggende flow og statiske stillinger.',
    level: 'Beginner',
    durationMin: 30,
    calories: 180,
    exerciseCount: 10,
  },
];

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

export default async function WorkoutTodayPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // 1) Få et rigtigt id (med await) og bekræft at det findes i DB
  const userId = await getOrCreateUserId();

  // Hårdfør sanity check – hvis dette fejler, peger du på en anden DB eller får et forkert id retur
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) {
    console.error('Resolved userId not found in DB:', { userId });
    throw new Error('User not found for resolved userId — check auth & DATABASE_URL');
  }

  const forceSelect = Boolean(searchParams?.select);
  const workout = forceSelect ? null : await getActiveWorkout(userId);

  let orderedSets: EditableSet[] = [];
  let planType: string | null = null;
  let workoutId: string | null = null;
  if (workout) {
    workoutId = workout.id;
    planType = workout.planType;
    const suggestion = await suggestNextWorkout(userId, { planType: workout.planType });
    const existingSets = workout.sets.sort((a, b) => a.orderIndex - b.orderIndex);
    const suggestionByExercise = new Map(suggestion.sets.map((item) => [item.exerciseId, item]));
    const initialSets = suggestion.sets.map((set, index) => {
      const existing = existingSets.find((item) => item.orderIndex === index || item.exerciseId === set.exerciseId);
      return {
        id: existing?.id,
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        orderIndex: index,
        primaryMuscle: set.primaryMuscle ?? existing?.Exercise.primaryMuscle ?? null,
        weight: existing?.weightKg ?? set.suggestedWeight ?? null,
        reps: existing?.reps ?? null,
        rpe: existing?.rpe ?? null,
        sets: null,
        completed: existing?.completed ?? false,
        targetReps: set.targetReps,
        notes: existing?.notes ?? '',
        previousWeight: set.lastLogged?.weight ?? null,
        previousReps: set.lastLogged?.reps ?? null,
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
      primaryMuscle: set.Exercise.primaryMuscle,
      weight: set.weightKg ?? null,
      reps: set.reps ?? null,
      rpe: set.rpe ?? null,
      sets: null,
      completed: set.completed,
      targetReps: suggestionByExercise.get(set.exerciseId)?.targetReps ?? '8-12',
      notes: set.notes ?? '',
      previousWeight: suggestionByExercise.get(set.exerciseId)?.lastLogged?.weight ?? null,
      previousReps: suggestionByExercise.get(set.exerciseId)?.lastLogged?.reps ?? null,
    }));

    orderedSets = [...initialSets, ...extraSets].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  return (
    <div className="space-y-10">
      <WorkoutTodayClient
        initialWorkoutId={workoutId}
        initialPlanType={planType}
        initialSets={orderedSets}
        programs={ALL_PROGRAM_OPTIONS}
      />
    </div>
  );
}
console.log("DB host:", (process.env.DATABASE_URL ?? "").split("@").pop()?.split("/")[0]);
