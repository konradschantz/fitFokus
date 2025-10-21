import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';

const workoutCreateSchema = z.object({
  planType: z.string().optional(),
  note: z.string().optional(),
  date: z.coerce.date().optional(),
});

export async function POST(request: Request) {
  try {
    const userId = getOrCreateUserId();
    const body = await request.json();
    const payload = workoutCreateSchema.parse(body);
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });
    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        planType: payload.planType ?? 'full_body',
        note: payload.note,
        date: payload.date ?? new Date(),
      },
    });
    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ugyldigt input', issues: error.flatten() }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke oprette workout' }, { status: 500 });
  }
}

const workoutsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const userId = getOrCreateUserId();
    const { searchParams } = new URL(request.url);
    const params = workoutsQuerySchema.parse({
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
    });

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (params.from) dateFilter.gte = new Date(params.from);
    if (params.to) dateFilter.lte = new Date(params.to);

    const where = {
      userId,
      ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
    } as const;

    const workouts = await prisma.workout.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        sets: { include: { Exercise: true } },
      },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ugyldige query-parametre', issues: error.flatten() }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke hente workouts' }, { status: 500 });
  }
}
