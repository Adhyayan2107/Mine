import {
  pgTable,
  serial,
  text,
  real,
  integer,
  boolean,
  date,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  heightCm: real('height_cm').notNull(),
  currentWeightKg: real('current_weight_kg').notNull(),
  goalWeightKg: real('goal_weight_kg').notNull(),
  goalBodyFatPercent: real('goal_body_fat_percent').notNull(),
  dailyCaloriesKcal: integer('daily_calories_kcal').notNull(),
  dailyProteinG: integer('daily_protein_g').notNull(),
  dailyWaterMl: integer('daily_water_ml').notNull(),
  dailySteps: integer('daily_steps').notNull(),
  sleepTargetHours: real('sleep_target_hours').notNull(),
  themeMode: text('theme_mode').notNull().default('dark'),
  motivationalQuoteEnabled: boolean('motivational_quote_enabled').notNull().default(false),
});

export const workoutSplitDays = pgTable('workout_split_days', {
  id: serial('id').primaryKey(),
  orderIndex: integer('order_index').notNull(),
  label: text('label').notNull(),
});

export const dailyLogs = pgTable('daily_logs', {
  id: serial('id').primaryKey(),
  date: date('date', { mode: 'string' }).notNull().unique(),
  weightKg: real('weight_kg'),
  caloriesKcal: integer('calories_kcal'),
  proteinG: integer('protein_g'),
  waterMl: integer('water_ml').notNull().default(0),
  steps: integer('steps'),
  workoutSplitDayId: integer('workout_split_day_id').references(() => workoutSplitDays.id),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  colorValue: integer('color_value').notNull(),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  notes: text('notes'),
  dueDate: date('due_date', { mode: 'string' }),
  // "HH:MM"; null means due by end of the due date.
  dueTime: text('due_time'),
  priority: text('priority').notNull().default('medium'),
  categoryId: integer('category_id').references(() => categories.id),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const habitCompletions = pgTable(
  'habit_completions',
  {
    id: serial('id').primaryKey(),
    habitId: integer('habit_id').notNull().references(() => habits.id),
    date: date('date', { mode: 'string' }).notNull(),
  },
  (table) => ({
    habitDateUnique: unique().on(table.habitId, table.date),
  }),
);

/** The exercise catalog: ~10 movements per muscle group, seeded once. */
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  // chest | lats | biceps | triceps | shoulders | legs | abs
  muscleGroup: text('muscle_group').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

/** Which exercises were picked for a given day's session, in picked order. */
export const workoutSelections = pgTable(
  'workout_selections',
  {
    id: serial('id').primaryKey(),
    date: date('date', { mode: 'string' }).notNull(),
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
    position: integer('position').notNull().default(0),
    // Selections sharing a group number are a superset — logged back to back.
    supersetGroup: integer('superset_group'),
  },
  (table) => ({
    dateExerciseUnique: unique().on(table.date, table.exerciseId),
  }),
);

/** One logged set: weight in kg × reps, numbered within the day+exercise. */
export const workoutSets = pgTable('workout_sets', {
  id: serial('id').primaryKey(),
  date: date('date', { mode: 'string' }).notNull(),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  setNumber: integer('set_number').notNull(),
  weightKg: real('weight_kg').notNull(),
  reps: integer('reps').notNull(),
  // 'normal' | 'drop' — a drop set is the burnout logged right after its set.
  setType: text('set_type').notNull().default('normal'),
});

export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  date: date('date', { mode: 'string' }).notNull().unique(),
  morningPlan: text('morning_plan'),
  wins: text('wins'),
  lessons: text('lessons'),
  tomorrowFocus: text('tomorrow_focus'),
  mood: integer('mood'),
  energy: integer('energy'),
});

export const dashboardWidgetConfigs = pgTable('dashboard_widget_configs', {
  id: serial('id').primaryKey(),
  widgetKey: text('widget_key').notNull(),
  sortOrder: integer('sort_order').notNull(),
  isEnabled: boolean('is_enabled').notNull().default(true),
});

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
export type WorkoutSplitDay = typeof workoutSplitDays.$inferSelect;
export type NewWorkoutSplitDay = typeof workoutSplitDays.$inferInsert;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type NewDailyLog = typeof dailyLogs.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutSelection = typeof workoutSelections.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type DashboardWidgetConfig = typeof dashboardWidgetConfigs.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
