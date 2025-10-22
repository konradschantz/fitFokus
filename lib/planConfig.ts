// prisma/planConfig.ts (opdateret)
export const templates = {
  full_body: [
    'Squat',
    'Bench Press',
    'Deadlift',
    'Shoulder Press (Dumbbell)', // was "Overhead Press"
    'Seated Row',
    'Pull-up',                   // was "Pull-ups"
  ],
  upper: [
    'Bench Press',
    'Shoulder Press (Dumbbell)', // was "Overhead Press"
    'Seated Row',
    'Pull-up',                   // was "Pull-ups"
    'Biceps Curl (EZ-bar)',      // was "Biceps Curl"
    'Triceps Rope Pushdown',
  ],
  lower: ['Squat', 'Deadlift', 'Leg Extension'],
  push: [
    'Bench Press',
    'Shoulder Press (Dumbbell)', // was "Overhead Press"
    'Shoulder Press (Dumbbell)', // was "Shoulder Dumbbell Press"
    'Triceps Rope Pushdown',
  ],
  pull: [
    'Deadlift',
    'Seated Row',
    'Pull-up',                   // was "Pull-ups"
    'Biceps Curl (EZ-bar)',      // was "Biceps Curl"
  ],
  legs: ['Squat', 'Leg Extension'],
} as const;

export const largeLiftIncrement = new Set([
  'Bench Press',
  'Squat',
  'Deadlift',
  // hvis du vil have OHP som “stor løft”, men du bruger DB-varianten:
  'Shoulder Press (Dumbbell)',   // was "Overhead Press"
]);

export function getPlanTypeSequence(base: string): string[] {
  switch (base) {
    case 'upper_lower':
      return ['upper', 'lower'];
    case 'push_pull_legs':
      return ['push', 'pull', 'legs'];
    case 'full_body':
      return ['full_body'];
    default:
      return ['full_body'];
  }
}
