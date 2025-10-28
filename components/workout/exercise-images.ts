// Central mapping of exercise names to bundled image assets
// Images are stored in `components/ui/Workouts` and imported statically.

import benchpress from '@/components/ui/Workouts/benchpress.png';
import deadlift from '@/components/ui/Workouts/deadlift.png';
import back_squat from '@/components/ui/Workouts/back_squat.png';
import seated_row from '@/components/ui/Workouts/seated_row.png';
import shulder_dumbell from '@/components/ui/Workouts/shulder_dumbell.png';
import biceps_ez_curl from '@/components/ui/Workouts/biceps_ez_curl.png';
import triceps_rope_pushdown from '@/components/ui/Workouts/triceps_rope_pushdown.png';
import leg_extension from '@/components/ui/Workouts/leg_extension.png';
import pull_up_workout from '@/components/ui/Workouts/pull_up_workout.png';
import cycle_stationary from '@/components/ui/Workouts/cycle_stationary.png';
import treadmill_run from '@/components/ui/Workouts/treadmill_run.png';

// Explicit mapping because some filenames differ from the canonical exercise names
const IMAGE_MAP: Record<string, string> = {
  'Bench Press': benchpress.src,
  Deadlift: deadlift.src,
  Squat: back_squat.src, // using back squat image for generic Squat
  'Back Squat': back_squat.src, // alias: same image as Squat
  'Seated Row': seated_row.src,
  'Shoulder Press (Dumbbell)': shulder_dumbell.src, // note: filename uses "shulder_dumbell"
  'Biceps Curl (EZ-bar)': biceps_ez_curl.src,
  'Triceps Rope Pushdown': triceps_rope_pushdown.src,
  'Leg Extension': leg_extension.src,
  'Pull-up': pull_up_workout.src,
  'Cycling (Stationary)': cycle_stationary.src,
  'Treadmill Run': treadmill_run.src,
};

export function getExerciseImageSrc(name: string): string | undefined {
  return IMAGE_MAP[name];
}
