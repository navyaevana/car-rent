import { CarListing, Review, Booking, Favorite } from './types';

const STORAGE_KEY = 'car_listings';
const BOOKINGS_KEY = 'car_bookings';
const FAVORITES_KEY = 'car_favorites';

export const getCarListings = (): CarListing[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCarListing = (listing: CarListing): void => {
  const listings = getCarListings();
  const existingIndex = listings.findIndex(l => l.id === listing.id);
  
  if (existingIndex >= 0) {
    listings[existingIndex] = listing;
  } else {
    listings.push(listing);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
};

export const deleteCarListing = (id: string): void => {
  const listings = getCarListings().filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
};

export const addReview = (carId: string, review: Review): void => {
  const listings = getCarListings();
  const car = listings.find(l => l.id === carId);
  
  if (car) {
    car.reviews.push(review);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  }
};

// Booking Functions
export const getBookings = (): Booking[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(BOOKINGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveBooking = (booking: Booking): void => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const getCarBookings = (carId: string): Booking[] => {
  return getBookings().filter(b => b.carId === carId);
};

export const updateBookingStatus = (bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): void => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (booking) {
    booking.status = status;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }
};

// Check if a car is available for the given date range
export const checkCarAvailability = (carId: string, startDate: string, endDate: string, excludeBookingId?: string): boolean => {
  const bookings = getCarBookings(carId);
  const requestStart = new Date(startDate).getTime();
  const requestEnd = new Date(endDate).getTime();
  
  // Only check against confirmed or pending bookings (not cancelled or completed)
  const activeBookings = bookings.filter(b => 
    (b.status === 'confirmed' || b.status === 'pending') && 
    b.id !== excludeBookingId
  );
  
  // Check for overlapping bookings
  for (const booking of activeBookings) {
    const bookingStart = new Date(booking.startDate).getTime();
    const bookingEnd = new Date(booking.endDate).getTime();
    
    // Check if dates overlap
    // Overlap occurs if: requestStart < bookingEnd AND requestEnd > bookingStart
    if (requestStart < bookingEnd && requestEnd > bookingStart) {
      return false; // Car is not available
    }
  }
  
  return true; // Car is available
};

// Get conflicting bookings for a date range
export const getConflictingBookings = (carId: string, startDate: string, endDate: string): Booking[] => {
  const bookings = getCarBookings(carId);
  const requestStart = new Date(startDate).getTime();
  const requestEnd = new Date(endDate).getTime();
  
  return bookings.filter(booking => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }
    
    const bookingStart = new Date(booking.startDate).getTime();
    const bookingEnd = new Date(booking.endDate).getTime();
    
    return requestStart < bookingEnd && requestEnd > bookingStart;
  });
};

// Favorites Functions
export const getFavorites = (): Favorite[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

export const addFavorite = (carId: string): void => {
  const favorites = getFavorites();
  const exists = favorites.find(f => f.carId === carId);
  
  if (!exists) {
    const favorite: Favorite = {
      id: Date.now().toString(),
      carId,
      addedAt: new Date().toISOString()
    };
    favorites.push(favorite);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = (carId: string): void => {
  const favorites = getFavorites().filter(f => f.carId !== carId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const isFavorite = (carId: string): boolean => {
  return getFavorites().some(f => f.carId === carId);
};