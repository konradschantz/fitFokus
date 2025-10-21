import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';

const paramsSchema = z.object({
  id: z.string().cuid(),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getOrCreateUserId();
    const { id } = paramsSchema.parse(params);
    const workout = await prisma.workout.findFirst({
      where: { id, userId },
      include: { sets: { include: { Exercise: true } } },
    });
    if (!workout) {
      return NextResponse.json({ message: 'Workout ikke fundet' }, { status: 404 });
    }
    return NextResponse.json(workout);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ugyldigt id', issues: error.flatten() }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke hente workout' }, { status: 500 });
  }
}
