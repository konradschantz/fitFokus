export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getOrCreateUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { suggestNextWorkout } from '@/lib/plan';
import { templates } from '@/lib/planConfig';

const startWorkoutSchema = z.object({
  planType: z
    .string({ required_error: 'Plan type er påkrævet' })
    .refine((value) => value in templates, { message: 'Ukendt plan type' }),
});

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

export async function POST(request: Request) {
  try {
    const userId = await getOrCreateUserId();
    const body = await request.json();
    const { planType } = startWorkoutSchema.parse(body);

    let workout = await getActiveWorkout(userId);
    if (!workout) {
      workout = await prisma.workout.create({
        data: {
          User: { connect: { id: userId } },
          planType,
          date: new Date(),
        },
        include: { sets: { include: { Exercise: true } } },
      });
    } else if (workout.planType !== planType) {
      workout = await prisma.workout.update({
        where: { id: workout.id },
        data: { planType },
        include: { sets: { include: { Exercise: true } } },
      });
    }

    const suggestion = await suggestNextWorkout(userId, { planType });
    const existingSets = workout.sets.sort((a, b) => a.orderIndex - b.orderIndex);
    const suggestionByExercise = new Map(suggestion.sets.map((item) => [item.exerciseId, item]));

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
      weight: set.weightKg ?? null,
      reps: set.reps ?? null,
      rpe: set.rpe ?? null,
      completed: set.completed,
      targetReps: suggestionByExercise.get(set.exerciseId)?.targetReps ?? '8-12',
      notes: set.notes ?? '',
      previousWeight: suggestionByExercise.get(set.exerciseId)?.lastLogged?.weight ?? null,
      previousReps: suggestionByExercise.get(set.exerciseId)?.lastLogged?.reps ?? null,
    }));

    const orderedSets = [...initialSets, ...extraSets].sort((a, b) => a.orderIndex - b.orderIndex);

    return NextResponse.json({
      workoutId: workout.id,
      planType: suggestion.planType,
      note: workout.note,
      sets: orderedSets,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ugyldigt input', issues: error.flatten() }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke starte program' }, { status: 500 });
  }
}
