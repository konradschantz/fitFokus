import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { recordResult } from '@/lib/plan';

const setSchema = z.object({
  exerciseId: z.string(),
  orderIndex: z.number().int().nonnegative(),
  weightKg: z.number().finite().nullable().optional(),
  reps: z.number().int().min(0).nullable().optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  completed: z.boolean().default(false),
  notes: z.string().optional(),
});

const payloadSchema = z.object({
  workoutId: z.string().cuid(),
  planType: z.string().optional(),
  note: z.string().optional(),
  sets: z.array(setSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const userId = getOrCreateUserId();
    const body = await request.json();
    const payload = payloadSchema.parse(body);
    const workout = await prisma.workout.findFirst({ where: { id: payload.workoutId, userId } });
    if (!workout) {
      return NextResponse.json({ message: 'Workout ikke fundet' }, { status: 404 });
    }
    await recordResult({
      workoutId: payload.workoutId,
      planType: payload.planType ?? workout.planType,
      note: payload.note,
      sets: payload.sets.map((set) => ({
        ...set,
        weightKg: set.weightKg ?? null,
        reps: set.reps ?? null,
        rpe: set.rpe ?? null,
      })),
    });
    const updated = await prisma.set.findMany({
      where: { workoutId: payload.workoutId },
      include: { Exercise: true },
      orderBy: { orderIndex: 'asc' },
    });
    return NextResponse.json({ sets: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ugyldigt input', issues: error.flatten() }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke gemme sæt' }, { status: 500 });
  }
}
