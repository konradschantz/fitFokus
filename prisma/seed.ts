/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1) Demo-bruger + indstillinger
  const demoEmail = "demo@fitfokus.local";

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      settings: {
        create: {
          goal: "Styrke + kondition",
          daysPerWeek: 4,
          equipmentProfile: "Fitnesscenter (maskiner + frie vægte)",
          lastPlanType: "Push/Pull/Legs",
        },
      },
    },
    include: { settings: true },
  });

  // 2) Øvelser (Exercise.name er @unique i dit schema)
  // metric er 'String' i schema — jeg bruger konsistente “nøgler”
  //   - "kg_reps"  => styrkesæt med vægt og reps
  //   - "bodyweight_reps" => kropsvægtøvelser
  //   - "duration_min" / "duration_min_distance_m" => cardio
  const exercises = [
    {
      name: "Bench Press",
      category: "Strength",
      equipment: "Barbell",
      primaryMuscle: "Chest",
      metric: "kg_reps",
    },
    {
      name: "Deadlift",
      category: "Strength",
      equipment: "Barbell",
      primaryMuscle: "Back",
      metric: "kg_reps",
    },
    {
      name: "Back Squat",
      category: "Strength",
      equipment: "Barbell",
      primaryMuscle: "Quads",
      metric: "kg_reps",
    },
    {
      name: "Seated Row",
      category: "Strength",
      equipment: "Machine",
      primaryMuscle: "Back",
      metric: "kg_reps",
    },
    {
      name: "Shoulder Press (Dumbbell)",
      category: "Strength",
      equipment: "Dumbbell",
      primaryMuscle: "Shoulders",
      metric: "kg_reps",
    },
    {
      name: "Biceps Curl (EZ-bar)",
      category: "Strength",
      equipment: "EZ-bar",
      primaryMuscle: "Biceps",
      metric: "kg_reps",
    },
    {
      name: "Triceps Rope Pushdown",
      category: "Strength",
      equipment: "Cable",
      primaryMuscle: "Triceps",
      metric: "kg_reps",
    },
    {
      name: "Leg Extension",
      category: "Strength",
      equipment: "Machine",
      primaryMuscle: "Quads",
      metric: "kg_reps",
    },
    {
      name: "Pull-up",
      category: "Strength",
      equipment: "Bar",
      primaryMuscle: "Back",
      metric: "bodyweight_reps",
    },
    {
      name: "Cycling (Stationary)",
      category: "Cardio",
      equipment: "Bike",
      primaryMuscle: "Cardio",
      metric: "duration_min_distance_m",
    },
    {
      name: "Treadmill Run",
      category: "Cardio",
      equipment: "Treadmill",
      primaryMuscle: "Cardio",
      metric: "duration_min_distance_m",
    },
  ] as const;

  await Promise.all(
    exercises.map((e) =>
      prisma.exercise.upsert({
        where: { name: e.name },
        update: {
          category: e.category,
          equipment: e.equipment,
          primaryMuscle: e.primaryMuscle,
          metric: e.metric,
        },
        create: {
          name: e.name,
          category: e.category,
          equipment: e.equipment,
          primaryMuscle: e.primaryMuscle,
          metric: e.metric,
        },
      })
    )
  );

  // Slå relevante øvelser op (vi connector via unique name)
  const [
    bench,
    row,
    shoulderDb,
    bicepsEz,
    tricepsRope,
    pullup,
    legExt,
    cycling,
  ] = await Promise.all([
    prisma.exercise.findUniqueOrThrow({ where: { name: "Bench Press" } }),
    prisma.exercise.findUniqueOrThrow({ where: { name: "Seated Row" } }),
    prisma.exercise.findUniqueOrThrow({
      where: { name: "Shoulder Press (Dumbbell)" },
    }),
    prisma.exercise.findUniqueOrThrow({
      where: { name: "Biceps Curl (EZ-bar)" },
    }),
    prisma.exercise.findUniqueOrThrow({
      where: { name: "Triceps Rope Pushdown" },
    }),
    prisma.exercise.findUniqueOrThrow({ where: { name: "Pull-up" } }),
    prisma.exercise.findUniqueOrThrow({ where: { name: "Leg Extension" } }),
    prisma.exercise.findUniqueOrThrow({
      where: { name: "Cycling (Stationary)" },
    }),
  ]);

  // 3) Eksempel-workout med Set[] (bemærk @@unique([workoutId, orderIndex]))
  // Vi bruger fast orderIndex: 1..n
  const workout = await prisma.workout.create({
    data: {
      userId: user.id,
      date: new Date(), // default(now()) alligevel, men eksplicit er fint
      planType: "Upper Body",
      note: "Seedet eksempelpas",
      sets: {
        create: [
          {
            orderIndex: 1,
            exerciseId: bench.id,
            weightKg: 40,
            reps: 12,
            rpe: 7.5,
            completed: true,
            notes: "Opvarmningssæt",
          },
          {
            orderIndex: 2,
            exerciseId: bench.id,
            weightKg: 40,
            reps: 14,
            rpe: 8.0,
            completed: true,
          },
          {
            orderIndex: 3,
            exerciseId: row.id,
            weightKg: 29.5,
            reps: 14,
            rpe: 7.5,
            completed: true,
          },
          {
            orderIndex: 4,
            exerciseId: shoulderDb.id,
            weightKg: 12,
            reps: 10,
            rpe: 7.0,
            completed: true,
            notes: "2x10 + 1x12 i log",
          },
          {
            orderIndex: 5,
            exerciseId: bicepsEz.id,
            weightKg: 19,
            reps: 12,
            rpe: 7.0,
            completed: true,
          },
          {
            orderIndex: 6,
            exerciseId: tricepsRope.id,
            weightKg: 18,
            reps: 12,
            rpe: 7.0,
            completed: true,
          },
          {
            orderIndex: 7,
            exerciseId: pullup.id,
            weightKg: null, // kropsvægt
            reps: 10,
            rpe: 8.0,
            completed: true,
          },
          {
            orderIndex: 8,
            exerciseId: legExt.id,
            weightKg: 32,
            reps: 6,
            rpe: 8.0,
            completed: true,
            notes: "Fra din første registrering",
          },
        ],
      },
    },
    include: { sets: true },
  });

  // 4) Cardio-session (Cycling)
  await prisma.cardioSession.create({
    data: {
      userId: user.id,
      exerciseId: cycling.id,
      date: new Date(),
      durationMin: 10,
      distanceM: 5000,
      intensity: 8, // du vil gemme intensitet 1–10
      avgHeartRate: null,
      notes: "Eksempel fra seed",
    },
  });

  console.log(`Seed OK: user=${user.email}, workout=${workout.id}, sets=${workout.sets.length}`);
}

main()
  .catch((e) => {
    console.error("Seed fejlede:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
