ALTER TABLE "workout_selections" ADD COLUMN "superset_group" integer;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD COLUMN "set_type" text DEFAULT 'normal' NOT NULL;