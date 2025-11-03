// Central mapping of exercise names to bundled image assets
// Images are stored in `components/ui/Workouts` and imported statically.

// Base images
import benchpress from '@/components/ui/Workouts/benchpress.png';
import deadlift from '@/components/ui/Workouts/deadlift.png';
import back_squat from '@/components/ui/Workouts/back_squat.png';
import front_squat from '@/components/ui/Workouts/front_squat.png';
import seated_row from '@/components/ui/Workouts/seated_row.png';
import shulder_dumbell from '@/components/ui/Workouts/shulder_dumbell.png';
import biceps_ez_curl from '@/components/ui/Workouts/biceps_ez_curl.png';
import triceps_rope_pushdown from '@/components/ui/Workouts/triceps_rope_pushdown.png';
import leg_extension from '@/components/ui/Workouts/leg_extension.png';
import pull_up_workout from '@/components/ui/Workouts/pull_up_workout.png';
import cycle_stationary from '@/components/ui/Workouts/cycle_stationary.png';
import treadmill_run from '@/components/ui/Workouts/treadmill_run.png';

// Additional workout images
import romanian_deadlift from '@/components/ui/Workouts/romanian_deadlift..png';
import machine_hip_abductor from '@/components/ui/Workouts/Machine_Hip_Abductor.png';
import dumbbell_front_raise from '@/components/ui/Workouts/dumbbell_front_raise.png';
import dumbbell_rear_delt_raise from '@/components/ui/Workouts/Dumbbell_Rear_Delt_Raise.png';
import alt_medicine_ball_push_up from '@/components/ui/Workouts/Alternate_Medicine_Ball.png';
import barbell_bench_press from '@/components/ui/Workouts/Barbell_Bench_Press.png';
import cable_cross_fly from '@/components/ui/Workouts/Cable_Cross_Fly.png';
import push_up from '@/components/ui/Workouts/push_up.png';
import dumbbell_bench_press from '@/components/ui/Workouts/dumbbell_bench_press.png';
import dumbbell_fly from '@/components/ui/Workouts/Dumbbell_fly.png';
import hammer_strength_chest_press from '@/components/ui/Workouts/Hammer_Strength_Chest_Press.png';
import low_cable_chest_fly from '@/components/ui/Workouts/low_cable_chest_fly.png';
import mid_cable_crossover_fly from '@/components/ui/Workouts/mid_cable_croosover_fly.png';
import svend_press from '@/components/ui/Workouts/svend_press.png';
import bicycle_crunch from '@/components/ui/Workouts/bicycle_crunch.png';
import cable_wood_chop from '@/components/ui/Workouts/cable_wood_chop.png';
import leg_raise from '@/components/ui/Workouts/leg_raise.png';
import russian_twist from '@/components/ui/Workouts/russian_twist.png';
import seated_cable_row from '@/components/ui/Workouts/seated Cable Row.png';
import dumbbell_bicep_curl from '@/components/ui/Workouts/dumbell_bicep_curl.png';
import hammer_curl from '@/components/ui/Workouts/hammer_curl.png';
import reverse_barbell_curl from '@/components/ui/Workouts/reverse_babell_curl.png';
import cable_tricep_extension from '@/components/ui/Workouts/Cable_Tricep_Extension.png';
import dumbbell_skullcrusher from '@/components/ui/Workouts/dumbell_skullcrusher.png';
import skullcrusher from '@/components/ui/Workouts/skullcrusher.png';
import standing_barbell_calf_raise from '@/components/ui/Workouts/Standing_Barbell_Calf_Raise.png';
import burpee from '@/components/ui/Workouts/Burpee.png';
import dumbbell_lunge from '@/components/ui/Workouts/dumbbell_lunge.png';
import leg_press from '@/components/ui/Workouts/leg_press.png';
import good_morning from '@/components/ui/Workouts/good_morning.png';
import kettlebell_sumo_squat from '@/components/ui/Workouts/kettkebell_sumo_squat.png';

// Explicit mapping because some filenames differ from canonical exercise names
const IMAGE_MAP: Record<string, string> = {
  // Base
  'Bench Press': benchpress.src,
  Deadlift: deadlift.src,
  Squat: back_squat.src, // generic Squat uses back squat image
  'Back Squat': back_squat.src,
  'Front Squat': front_squat.src,
  'Seated Row': seated_row.src,
  'Shoulder Press (Dumbbell)': shulder_dumbell.src,
  'Biceps Curl (EZ-bar)': biceps_ez_curl.src,
  'Triceps Rope Pushdown': triceps_rope_pushdown.src,
  'Leg Extension': leg_extension.src,
  'Pull-up': pull_up_workout.src,
  'Cycling (Stationary)': cycle_stationary.src,
  'Treadmill Run': treadmill_run.src,

  // Strength / core
  'Romanian Deadlift': romanian_deadlift.src,
  'Machine Hip Abductor': machine_hip_abductor.src,
  'Dumbbell Front Raise': dumbbell_front_raise.src,
  'Dumbbell Rear Delt Raise': dumbbell_rear_delt_raise.src,
  'Alternating Medicine Ball Push Up': alt_medicine_ball_push_up.src,
  'Barbell Bench Press': barbell_bench_press.src,
  'Cable Cross Fly': cable_cross_fly.src,
  'Decline Push Up': push_up.src, // jpg not imported; use generic push-up
  'Incline Push Up': push_up.src,
  'Dumbbell Bench Press': dumbbell_bench_press.src,
  'Dumbbell Fly': dumbbell_fly.src,
  'Hammer Strength Chest Press': hammer_strength_chest_press.src,
  'Low Cable Chest Fly': low_cable_chest_fly.src,
  'Mid Cable Crossover Fly': mid_cable_crossover_fly.src,
  'Svend Press': svend_press.src,
  'Bicycle Crunch': bicycle_crunch.src,
  'Cable Wood Chop': cable_wood_chop.src,
  'Cable Wood Chop (Low to High)': cable_wood_chop.src,
  'Leg Raise': leg_raise.src,
  'Russian Twist': russian_twist.src,
  'Cable Row': seated_cable_row.src, // using seated cable row image
  'Dumbbell Row': seated_row.src, // fallback: closest available back row image
  'Lat Pulldown': seated_row.src, // fallback until a dedicated image exists
  'Back Extensions': good_morning.src, // approximate until a dedicated image exists
  'Stiff-Legged Barbell Good Morning': good_morning.src,
  'Upright Row': hammer_curl.src, // placeholder-ish until dedicated image
  'Dumbbell Shrug': hammer_strength_chest_press.src, // placeholder
  'Cable Shrugs': hammer_strength_chest_press.src, // placeholder
  'Biceps Curl to Shoulder Press': shulder_dumbell.src, // composite: map to dumbbell press image
  'Dumbbell Bicep Curl': dumbbell_bicep_curl.src,
  'Hammer Curls': hammer_curl.src,
  'Reverse Barbell Curl': reverse_barbell_curl.src,
  'Cable Rope Tricep Extension': cable_tricep_extension.src,
  'Dumbbell Skullcrusher': dumbbell_skullcrusher.src,
  Skullcrusher: skullcrusher.src,
  'Standing Barbell Calf Raise': standing_barbell_calf_raise.src,
  Burpee: burpee.src,
  'Dumbbell Lunge': dumbbell_lunge.src,
  'Leg Press': leg_press.src,
  'Good Morning': good_morning.src,
  'Kettlebell Sumo Squat': kettlebell_sumo_squat.src,
};

export function getExerciseImageSrc(name: string): string | undefined {
  return IMAGE_MAP[name];
}
