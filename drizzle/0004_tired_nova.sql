CREATE TABLE "cardio_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"type" text NOT NULL,
	"duration_min" integer NOT NULL,
	"distance_km" real,
	"calories_kcal" integer
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "workout_finished_at" timestamp;