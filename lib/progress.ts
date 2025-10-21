import { startOfWeek, differenceInCalendarDays } from 'date-fns';
import { prisma } from './db';

const KEY_LIFTS = ['Bench Press', 'Squat', 'Deadlift'] as const;

type OneRmTrend = {
  lift: string;
  points: Array<{ date: string; value: number }>;
};

type VolumePoint = {
  week: string;
  totalVolume: number;
};

type ProgressResponse = {
  volumePerWeek: VolumePoint[];
  oneRepMaxTrends: OneRmTrend[];
  streak: number;
};

function epley1RM(weight: number, reps: number) {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
}

export async function getProgress(userId: string): Promise<ProgressResponse> {
  const [sets, workouts, exercises] = await Promise.all([
    prisma.set.findMany({
      where: { Workout: { userId } },
      select: { weightKg: true, reps: true, Workout: { select: { date: true } }, exerciseId: true },
    }),
    prisma.workout.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    }),
    prisma.exercise.findMany({ where: { name: { in: KEY_LIFTS as unknown as string[] } }, select: { id: true, name: true } }),
  ]);

  const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise.name] as const));

  const volumeByWeek = new Map<string, number>();
  for (const set of sets) {
    const weight = set.weightKg ?? 0;
    const reps = set.reps ?? 0;
    const volume = weight * reps;
    if (volume <= 0) continue;
    const week = startOfWeek(set.Workout.date, { weekStartsOn: 1 }).toISOString().slice(0, 10);
    volumeByWeek.set(week, (volumeByWeek.get(week) ?? 0) + volume);
  }

  const volumePerWeek: VolumePoint[] = Array.from(volumeByWeek.entries())
    .map(([week, totalVolume]) => ({ week, totalVolume }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const liftTrends: OneRmTrend[] = KEY_LIFTS.map((lift) => ({ lift, points: [] }));
  for (const set of sets) {
    const liftName = exerciseMap.get(set.exerciseId);
    if (!liftName) continue;
    const reps = set.reps ?? 0;
    const weight = set.weightKg ?? 0;
    const estimate = epley1RM(weight, reps);
    const trend = liftTrends.find((entry) => entry.lift === liftName);
    if (!trend) continue;
    trend.points.push({ date: set.Workout.date.toISOString(), value: Math.round(estimate * 10) / 10 });
  }

  for (const trend of liftTrends) {
    trend.points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  let streak = 0;
  if (workouts.length > 0) {
    let previousDate = new Date(workouts[0].date);
    streak = 1;
    for (let index = 1; index < workouts.length; index += 1) {
      const current = new Date(workouts[index].date);
      const diff = differenceInCalendarDays(previousDate, current);
      if (diff === 1) {
        streak += 1;
        previousDate = current;
      } else if (diff > 1) {
        break;
      }
    }
  }

  return {
    volumePerWeek,
    oneRepMaxTrends: liftTrends,
    streak,
  };
}
