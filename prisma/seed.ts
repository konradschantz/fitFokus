/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// NB: Navne matcher det du faktisk bruger i appen/logs.
// Hvis du senere skifter display-navne, så behold disse som "kanoniske"
// og lav evt. en map/alias i koden.
const exercises = [
  // DINE KONKRETE
  { name: 'Bænkpres',               category: 'upper', equipment: 'barbell',   primaryMuscle: 'chest',           metric: 'strength' },
  { name: 'Diverging seated row',   category: 'upper', equipment: 'machine',   primaryMuscle: 'back',            metric: 'strength' },
  { name: 'Skulder dumbbell',       category: 'upper', equipment: 'dumbbell',  primaryMuscle: 'shoulders',       metric: 'strength' },
  { name: 'Pull ups',               category: 'upper', equipment: 'bodyweight',primaryMuscle: 'back',            metric: 'strength' },
  { name: 'Biceps curl stang',      category: 'upper', equipment: 'barbell',   primaryMuscle: 'biceps',          metric: 'strength' },
  { name: 'Triceps rope',           category: 'upper', equipment: 'cable',     primaryMuscle: 'triceps',         metric: 'strength' },
  { name: 'Leg extension',          category: 'lower', equipment: 'machine',   primaryMuscle: 'quadriceps',      metric: 'strength' },

  // GENERELLE (kan være nyttige andre steder i appen)
  { name: 'Bench Press',            category: 'upper', equipment: 'barbell',   primaryMuscle: 'chest',           metric: 'strength' },
  { name: 'Seated Row',             category: 'upper', equipment: 'machine',   primaryMuscle: 'back',            metric: 'strength' },
  { name: 'Shoulder Dumbbell Press',category: 'upper', equipment: 'dumbbell',  primaryMuscle: 'shoulders',       metric: 'strength' },
  { name: 'Squat',                  category: 'lower', equipment: 'barbell',   primaryMuscle: 'legs',            metric: 'strength' },
  { name: 'Deadlift',               category: 'full',  equipment: 'barbell',   primaryMuscle: 'posterior_chain', metric: 'strength' },
  { name: 'Overhead Press',         category: 'upper', equipment: 'barbell',   primaryMuscle: 'shoulders',       metric: 'strength' },
];

async function main() {
  console.log('Seeding exercises...');
  for (const e of exercises) {
    await prisma.exercise.upsert({
      where: { name: e.name },     // kræver at name er @unique i schema.prisma
      update: {
        category: e.category,
        equipment: e.equipment ?? null,
        primaryMuscle: e.primaryMuscle ?? null,
        metric: e.metric,
      },
      create: {
        name: e.name,
        category: e.category,
        equipment: e.equipment ?? null,
        primaryMuscle: e.primaryMuscle ?? null,
        metric: e.metric,
      },
    });
  }
  console.log('✅ Seed completed');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
