export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';

const cardioSchema = z.object({
  durationMin: z.number().int().min(1),
  intensity: z.number().int().min(1).max(10),
  distanceM: z.number().int().min(0).nullable().optional(),
  notes: z.string().optional(),
  date: z.coerce.date().optional(),
});

export async function POST(request: Request) {
  try {
    const userId = getOrCreateUserId();
    const body = await request.json();
    const payload = cardioSchema.parse(body);
    const cycling = await prisma.exercise.findFirst({ where: { name: 'Cycling' } });
    if (!cycling) {
      return NextResponse.json({ message: 'Cycling-øvelsen mangler. Kør prisma seed.' }, { status: 400 });
    }
    await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
    const session = await prisma.cardioSession.create({
      data: {
        userId,
        exerciseId: cycling.id,
        durationMin: payload.durationMin,
        intensity: payload.intensity,
        distanceM: payload.distanceM ?? null,
        notes: payload.notes,
        date: payload.date ?? new Date(),
      },
    });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ugyldigt cardio-input', issues: error.flatten() }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke logge cardio' }, { status: 500 });
  }
}
 
