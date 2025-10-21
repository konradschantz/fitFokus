import { describe, expect, it, vi } from 'vitest';

const recordResultMock = vi.fn();

vi.mock('@/lib/auth', () => ({ getOrCreateUserId: () => 'user' }));
vi.mock('@/lib/plan', () => ({ recordResult: recordResultMock }));

const workoutFindFirst = vi.fn().mockResolvedValue({ id: 'w1', userId: 'user', planType: 'full_body' });
const setFindMany = vi.fn().mockResolvedValue([
  {
    id: 'set1',
    workoutId: 'w1',
    exerciseId: 'exercise1',
    orderIndex: 0,
    weightKg: 40,
    reps: 10,
    rpe: 7,
    completed: true,
    notes: null,
    Exercise: { name: 'Bench Press' },
  },
]);

vi.mock('@/lib/db', () => ({
  prisma: {
    workout: { findFirst: workoutFindFirst },
    set: { findMany: setFindMany },
  },
}));

describe('POST /api/sets/batch', () => {
  it('gemmer sæt og returnerer opdateret liste', async () => {
    const { POST } = await import('@/app/api/sets/batch/route');
    const request = new Request('http://localhost/api/sets/batch', {
      method: 'POST',
      body: JSON.stringify({
        workoutId: 'w1',
        planType: 'full_body',
        note: 'Solid session',
        sets: [
          {
            exerciseId: 'exercise1',
            orderIndex: 0,
            weightKg: 40,
            reps: 10,
            rpe: 7,
            completed: true,
          },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(recordResultMock).toHaveBeenCalledWith(
      expect.objectContaining({ workoutId: 'w1', sets: expect.any(Array) })
    );
    expect(data.sets).toHaveLength(1);
    expect(data.sets[0].Exercise.name).toBe('Bench Press');
  });
});
