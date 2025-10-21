export const templates = {
  full_body: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Seated Row', 'Pull-ups'],
  upper: ['Bench Press', 'Overhead Press', 'Seated Row', 'Pull-ups', 'Biceps Curl', 'Triceps Rope Pushdown'],
  lower: ['Squat', 'Deadlift', 'Leg Extension'],
  push: ['Bench Press', 'Overhead Press', 'Shoulder Dumbbell Press', 'Triceps Rope Pushdown'],
  pull: ['Deadlift', 'Seated Row', 'Pull-ups', 'Biceps Curl'],
  legs: ['Squat', 'Leg Extension'],
} as const;

export const largeLiftIncrement = new Set(['Bench Press', 'Squat', 'Deadlift', 'Overhead Press']);

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
