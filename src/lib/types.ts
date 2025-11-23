export interface CarListing {
  id: string;
  carName: string;
  carModel: string;
  numberPlate: string;
  rcNumber: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  pricePerHour: number;
  insurance: string;
  drivingNotes: string;
  ownerName: string;
  ownerContact: string;
  ownerEmail: string;
  ownerLicense: string;
  carImage?: string;
  createdAt: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  carId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  carId: string;
  carName: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Favorite {
  id: string;
  carId: string;
  addedAt: string;
}