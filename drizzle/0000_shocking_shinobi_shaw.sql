CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_id` integer NOT NULL,
	`car_name` text NOT NULL,
	`renter_name` text NOT NULL,
	`renter_email` text NOT NULL,
	`renter_phone` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`total_hours` integer NOT NULL,
	`total_price` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `car_listings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `car_listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_name` text NOT NULL,
	`car_model` text NOT NULL,
	`number_plate` text NOT NULL,
	`rc_number` text NOT NULL,
	`fuel_type` text NOT NULL,
	`price_per_hour` real NOT NULL,
	`insurance` text NOT NULL,
	`driving_notes` text,
	`owner_name` text NOT NULL,
	`owner_contact` text NOT NULL,
	`owner_email` text NOT NULL,
	`owner_license` text NOT NULL,
	`car_image` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_listings_number_plate_unique` ON `car_listings` (`number_plate`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_id` integer NOT NULL,
	`added_at` text NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `car_listings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_id` integer NOT NULL,
	`reviewer_name` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `car_listings`(`id`) ON UPDATE no action ON DELETE no action
);
