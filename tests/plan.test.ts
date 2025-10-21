import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

const exerciseIds = new Map<string, string>();

const userSettingsMock = { findUnique: vi.fn() };
const workoutMock = { findFirst: vi.fn() };
const exerciseMock = {
  findUnique: vi.fn(({ where: { name } }: { where: { name: string } }) => {
    if (!exerciseIds.has(name)) {
      exerciseIds.set(name, name.toLowerCase().replace(/\s+/g, '-'));
    }
    return { id: exerciseIds.get(name)!, name };
  }),
};
const setMock = { findMany: vi.fn() };

vi.mock('@/lib/db', () => {
  const prisma = {
    userSettings: userSettingsMock,
    workout: workoutMock,
    exercise: exerciseMock,
    set: setMock,
    $transaction: vi.fn(async (callback: (tx: PrismaClient) => Promise<void>) => {
      await callback(prisma as unknown as PrismaClient);
    }),
  } as unknown as PrismaClient;
  return { prisma };
});

describe('plan suggestions', () => {
  beforeEach(() => {
    exerciseIds.clear();
    vi.clearAllMocks();
    userSettingsMock.findUnique.mockResolvedValue({ userId: 'user', daysPerWeek: 2, lastPlanType: null });
    workoutMock.findFirst.mockResolvedValue({ planType: 'full_body' });
  });

  it('increases weight when reps are consistently high with lav RPE', async () => {
    const { suggestNextWorkout } = await import('@/lib/plan');
    setMock.findMany.mockImplementation(({ where: { exerciseId } }: any) => {
      if (!exerciseId.includes('bench')) return [];
      return [
        { weightKg: 40, reps: 12, rpe: 7, workoutId: 'w1', workout: { date: new Date() } },
        { weightKg: 40, reps: 12, rpe: 7, workoutId: 'w1', workout: { date: new Date() } },
        { weightKg: 37.5, reps: 11, rpe: 8, workoutId: 'w0', workout: { date: new Date(Date.now() - 86400000) } },
      ];
    });
    const draft = await suggestNextWorkout('user');
    const bench = draft.sets.find((set) => set.exerciseName === 'Bench Press');
    expect(bench?.suggestedWeight).toBeGreaterThan(40);
  });

  it('reduces weight when reps drop under seks', async () => {
    const { suggestNextWorkout } = await import('@/lib/plan');
    setMock.findMany.mockImplementation(({ where: { exerciseId } }: any) => {
      if (!exerciseId.includes('squat')) return [];
      return [
        { weightKg: 60, reps: 5, rpe: 9, workoutId: 'w2', workout: { date: new Date() } },
        { weightKg: 60, reps: 5, rpe: 9, workoutId: 'w2', workout: { date: new Date() } },
        { weightKg: 60, reps: 10, rpe: 8, workoutId: 'w1', workout: { date: new Date(Date.now() - 86400000) } },
      ];
    });
    const draft = await suggestNextWorkout('user');
    const squat = draft.sets.find((set) => set.exerciseName === 'Squat');
    expect(squat?.suggestedWeight).toBeLessThan(60);
  });
});
