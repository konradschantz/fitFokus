import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';

const settingsSchema = z.object({
  goal: z.string().optional(),
  daysPerWeek: z.number().int().min(1).max(7).nullable().optional(),
  equipmentProfile: z.string().optional(),
});

export async function GET() {
  try {
    const userId = getOrCreateUserId();
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    return NextResponse.json(settings ?? {});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke hente indstillinger' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getOrCreateUserId();
    const body = await request.json();
    const payload = settingsSchema.parse(body);
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: payload,
      create: { userId, ...payload },
    });
    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ugyldige indstillinger', issues: error.flatten() }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke gemme indstillinger' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = getOrCreateUserId();
    await prisma.$transaction([
      prisma.set.deleteMany({ where: { workout: { userId } } }),
      prisma.workout.deleteMany({ where: { userId } }),
      prisma.cardioSession.deleteMany({ where: { userId } }),
      prisma.userSettings.deleteMany({ where: { userId } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke slette data' }, { status: 500 });
  }
}
