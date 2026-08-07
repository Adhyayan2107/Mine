export const SEED_PROFILE = {
  name: 'Adhyayan Gupta',
  age: 20,
  heightCm: 188.0,
  currentWeightKg: 107.0,
  goalWeightKg: 94.0,
  goalBodyFatPercent: 20.0,
  dailyCaloriesKcal: 2500,
  dailyProteinG: 160,
  dailyWaterMl: 4000,
  dailySteps: 10000,
  sleepTargetHours: 8.0,
};

export const SEED_WORKOUT_SPLIT = ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Arms + Core'];

export const SEED_CATEGORIES = ['Career', 'Fitness', 'College', 'Personal', 'Shopping'];

export const SEED_HABITS = [
  'Gym',
  '10k Steps',
  'Protein Goal',
  'Calories Goal',
  'Drink 4L Water',
  'Read 30 Minutes',
  'Sleep Before Midnight',
  'Journal',
  'Apply to 5 Companies',
  'Study GTM 2 Hours',
];

export const SEED_DASHBOARD_WIDGET_ORDER = [
  'todaysWeight',
  'todaysWorkout',
  'caloriesRemaining',
  'proteinProgress',
  'waterIntake',
  'habitCompletion',
  'tasksRemaining',
  'weeklyWeightGraph',
  'workoutStreak',
  'currentGoal',
] as const;
