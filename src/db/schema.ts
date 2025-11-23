import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Car listings table
export const carListings = sqliteTable('car_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  carName: text('car_name').notNull(),
  carModel: text('car_model').notNull(),
  numberPlate: text('number_plate').notNull().unique(),
  rcNumber: text('rc_number').notNull(),
  fuelType: text('fuel_type').notNull(), // 'Petrol', 'Diesel', 'Electric', 'Hybrid'
  pricePerHour: real('price_per_hour').notNull(),
  insurance: text('insurance').notNull(),
  drivingNotes: text('driving_notes'),
  ownerName: text('owner_name').notNull(),
  ownerContact: text('owner_contact').notNull(),
  ownerEmail: text('owner_email').notNull(),
  ownerLicense: text('owner_license').notNull(),
  carImage: text('car_image'),
  createdAt: text('created_at').notNull(),
});

// Reviews table
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  carId: integer('car_id').notNull().references(() => carListings.id),
  reviewerName: text('reviewer_name').notNull(),
  rating: integer('rating').notNull(), // 1 to 5
  comment: text('comment').notNull(),
  createdAt: text('created_at').notNull(),
});

// Bookings table
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  carId: integer('car_id').notNull().references(() => carListings.id),
  carName: text('car_name').notNull(),
  renterName: text('renter_name').notNull(),
  renterEmail: text('renter_email').notNull(),
  renterPhone: text('renter_phone').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalHours: integer('total_hours').notNull(),
  totalPrice: real('total_price').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'completed', 'cancelled'
  createdAt: text('created_at').notNull(),
});

// Favorites table
export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  carId: integer('car_id').notNull().references(() => carListings.id),
  addedAt: text('added_at').notNull(),
});