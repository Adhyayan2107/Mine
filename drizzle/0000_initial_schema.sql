CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color_value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"weight_kg" real,
	"calories_kcal" integer,
	"protein_g" integer,
	"water_ml" integer DEFAULT 0 NOT NULL,
	"steps" integer,
	"workout_split_day_id" integer,
	CONSTRAINT "daily_logs_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "dashboard_widget_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"widget_key" text NOT NULL,
	"sort_order" integer NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"habit_id" integer NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "habit_completions_habit_id_date_unique" UNIQUE("habit_id","date")
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"morning_plan" text,
	"wins" text,
	"lessons" text,
	"tomorrow_focus" text,
	"mood" integer,
	"energy" integer,
	CONSTRAINT "journal_entries_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"age" integer NOT NULL,
	"height_cm" real NOT NULL,
	"current_weight_kg" real NOT NULL,
	"goal_weight_kg" real NOT NULL,
	"goal_body_fat_percent" real NOT NULL,
	"daily_calories_kcal" integer NOT NULL,
	"daily_protein_g" integer NOT NULL,
	"daily_water_ml" integer NOT NULL,
	"daily_steps" integer NOT NULL,
	"sleep_target_hours" real NOT NULL,
	"theme_mode" text DEFAULT 'dark' NOT NULL,
	"motivational_quote_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"due_date" date,
	"priority" text DEFAULT 'medium' NOT NULL,
	"category_id" integer,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_split_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_index" integer NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_workout_split_day_id_workout_split_days_id_fk" FOREIGN KEY ("workout_split_day_id") REFERENCES "public"."workout_split_days"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;