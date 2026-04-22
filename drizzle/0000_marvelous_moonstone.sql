CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"wp_post_id" integer,
	"subject" text NOT NULL,
	"description" text,
	"where" text,
	"timestamp" timestamp NOT NULL,
	"date_civil" text NOT NULL,
	"location_id" uuid NOT NULL,
	CONSTRAINT "courses_wp_post_id_unique" UNIQUE("wp_post_id")
);
--> statement-breakpoint
CREATE TABLE "credits" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"timestamp" timestamp NOT NULL,
	"grade" text,
	"attended" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	"timezone" text NOT NULL,
	"description" text,
	CONSTRAINT "locations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"permissions" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "roles_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"role_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"middle_initial" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"address_1" text NOT NULL,
	"address_2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_location_id_idx" ON "courses" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_subject_date_location_unique" ON "courses" USING btree ("subject","date_civil","location_id");--> statement-breakpoint
CREATE INDEX "credits_user_id_idx" ON "credits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credits_course_id_idx" ON "credits" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credits_course_user_unique" ON "credits" USING btree ("course_id","user_id");--> statement-breakpoint
CREATE INDEX "locations_city_idx" ON "locations" USING btree ("city");--> statement-breakpoint
CREATE INDEX "locations_state_idx" ON "locations" USING btree ("state");--> statement-breakpoint
CREATE INDEX "users_role_id_idx" ON "users" USING btree ("role_id");