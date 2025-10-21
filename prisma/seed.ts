/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  { name: 'Bench Press', category: 'upper', equipment: 'barbell', primaryMuscle: 'chest', metric: 'strength' },
  { name: 'Squat', category: 'lower', equipment: 'barbell', primaryMuscle: 'legs', metric: 'strength' },
  { name: 'Deadlift', category: 'full', equipment: 'barbell', primaryMuscle: 'posterior_chain', metric: 'strength' },
  { name: 'Overhead Press', category: 'upper', equipment: 'barbell', primaryMuscle: 'shoulders', metric: 'strength' },
  { name: 'Seated Row', category: 'upper', equipment: 'machine', primaryMuscle: 'back', metric: 'strength' },
  { name: 'Leg Extension', category: 'lower', equipment: 'machine', primaryMuscle: 'quadriceps', metric: 'strength' },
  { name: 'Biceps Curl', category: 'upper', equipment: 'dumbbell', primaryMuscle: 'biceps', metric: 'strength' },
  { name: 'Triceps Rope Pushdown', category: 'upper', equipment: 'cable', primaryMuscle: 'triceps', metric: 'strength' },
  { name: 'Shoulder Dumbbell Press', category: 'upper', equipment: 'dumbbell', primaryMuscle: 'shoulders', metric: 'strength' },
  { name: 'Pull-ups', category: 'upper', equipment: 'bodyweight', primaryMuscle: 'back', metric: 'strength' },
  { name: 'Cycling', category: 'cardio', equipment: 'bike', primaryMuscle: 'cardio', metric: 'cardio' },
];

async function main() {
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise,
    });
  }
  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
