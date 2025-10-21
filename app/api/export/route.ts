import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';

const querySchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
});

function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    if (value == null) return '';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header])).join(','));
  }
  return lines.join('\n');
}

export async function GET(request: Request) {
  try {
    const userId = getOrCreateUserId();
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({ format: searchParams.get('format') ?? 'json' });

    const [workouts, sets, cardio] = await Promise.all([
      prisma.workout.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.set.findMany({ where: { Workout: { userId } }, include: { Exercise: true, Workout: true } }),
      prisma.cardioSession.findMany({ where: { userId }, include: { Exercise: true }, orderBy: { date: 'desc' } }),
    ]);

    if (params.format === 'csv') {
      const workoutCsv = toCsv(
        workouts.map((workout) => ({
          id: workout.id,
          date: workout.date.toISOString(),
          planType: workout.planType,
          note: workout.note ?? '',
        }))
      );
      const setCsv = toCsv(
        sets.map((set) => ({
          workoutId: set.workoutId,
          exercise: set.Exercise.name,
          orderIndex: set.orderIndex,
          weightKg: set.weightKg ?? '',
          reps: set.reps ?? '',
          rpe: set.rpe ?? '',
          completed: set.completed,
          notes: set.notes ?? '',
        }))
      );
      const cardioCsv = toCsv(
        cardio.map((session) => ({
          id: session.id,
          date: session.date.toISOString(),
          exercise: session.Exercise.name,
          durationMin: session.durationMin,
          distanceM: session.distanceM ?? '',
          intensity: session.intensity,
          notes: session.notes ?? '',
        }))
      );
      const csvContent = `# Workouts\n${workoutCsv}\n\n# Sets\n${setCsv}\n\n# Cardio\n${cardioCsv}`;
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="fitfokus-export.csv"',
        },
      });
    }

    return NextResponse.json({ workouts, sets, cardio });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Ugyldig format-parameter', issues: error.flatten() }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke eksportere data' }, { status: 500 });
  }
}
