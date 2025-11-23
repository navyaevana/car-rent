"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CarListing, Review, Booking } from "@/lib/types";
import { ArrowLeft, Car, Fuel, Phone, Mail, Star, FileText, Search, Sparkles, Heart, Calendar, Clock, ArrowUpDown, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

type SortOption = "newest" | "price-low" | "price-high" | "rating";

export default function RentCarPage() {
  const router = useRouter();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CarListing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    renterName: "",
    renterEmail: "",
    renterPhone: "",
    startDate: "",
    endDate: "",
  });
  const [rentalDuration, setRentalDuration] = useState({ hours: 0, days: 0 });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCarAvailable, setIsCarAvailable] = useState(true);
  const [conflictingBookings, setConflictingBookings] = useState<Booking[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    loadListings();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterAndSortListings();
  }, [searchQuery, fuelFilter, sortBy, priceRange, listings, showFavoritesOnly]);

  useEffect(() => {
    calculateRentalDuration();
    checkAvailability();
  }, [bookingForm.startDate, bookingForm.endDate, selectedCar]);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/car-listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data);
      
      // Calculate max price for slider
      if (data.length > 0) {
        const max = Math.max(...data.map((car: CarListing) => car.pricePerHour));
        setMaxPrice(Math.ceil(max / 100) * 100);
        setPriceRange([0, Math.ceil(max / 100) * 100]);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load car listings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();
      setFavorites(data.map((f: any) => f.carId));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(car => 
        car.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.carModel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Fuel filter
    if (fuelFilter !== "all") {
      filtered = filtered.filter(car => car.fuelType === fuelFilter);
    }

    // Price range filter
    filtered = filtered.filter(car => 
      car.pricePerHour >= priceRange[0] && car.pricePerHour <= priceRange[1]
    );

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(car => favorites.includes(car.id));
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case "price-high":
        filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case "rating":
        filtered.sort((a, b) => {
          const avgA = calculateAverageRating(a.reviews);
          const avgB = calculateAverageRating(b.reviews);
          return parseFloat(avgB) - parseFloat(avgA);
        });
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredListings(filtered);
  };

  const handleSubmitReview = async () => {
    if (!selectedCar || !reviewForm.name || !reviewForm.comment) {
      toast.error("Please fill in all review fields");
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCar.id,
          reviewerName: reviewForm.name,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      setReviewForm({ name: "", rating: 5, comment: "" });
      await loadListings();
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const toggleFavorite = async (carId: number) => {
    try {
      const isFav = favorites.includes(carId);
      
      if (isFav) {
        const response = await fetch(`/api/favorites?car_id=${carId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove favorite');
        toast.success("Removed from favorites");
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId }),
        });
        if (!response.ok) throw new Error('Failed to add favorite');
        toast.success("Added to favorites");
      }
      
      await loadFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const calculateRentalDuration = () => {
    if (!bookingForm.startDate || !bookingForm.endDate || !selectedCar) {
      setRentalDuration({ hours: 0, days: 0 });
      setTotalPrice(0);
      return;
    }

    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    const diffMs = end.getTime() - start.getTime();
    
    if (diffMs <= 0) {
      setRentalDuration({ hours: 0, days: 0 });
      setTotalPrice(0);
      return;
    }

    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    setRentalDuration({ hours: remainingHours, days });
    setTotalPrice(hours * selectedCar.pricePerHour);
  };

  const checkAvailability = async () => {
    if (!selectedCar || !bookingForm.startDate || !bookingForm.endDate) {
      setIsCarAvailable(true);
      setConflictingBookings([]);
      return;
    }

    try {
      setIsCheckingAvailability(true);
      const params = new URLSearchParams({
        car_id: selectedCar.id.toString(),
        start_date: bookingForm.startDate,
        end_date: bookingForm.endDate,
      });

      const response = await fetch(`/api/bookings/availability?${params}`);
      if (!response.ok) throw new Error('Failed to check availability');
      
      const data = await response.json();
      setIsCarAvailable(data.available);
      setConflictingBookings(data.conflicts || []);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedCar || !bookingForm.renterName || !bookingForm.renterEmail || 
        !bookingForm.renterPhone || !bookingForm.startDate || !bookingForm.endDate) {
      toast.error("Please fill in all booking fields");
      return;
    }

    if (totalPrice === 0) {
      toast.error("Please select valid dates");
      return;
    }

    if (!isCarAvailable) {
      toast.error("This car is not available for the selected dates. Please choose different dates.");
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCar.id,
          carName: `${selectedCar.carName} ${selectedCar.carModel}`,
          renterName: bookingForm.renterName,
          renterEmail: bookingForm.renterEmail,
          renterPhone: bookingForm.renterPhone,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
          totalHours: rentalDuration.days * 24 + rentalDuration.hours,
          totalPrice: totalPrice,
          status: 'pending',
        }),
      });

      if (!response.ok) throw new Error('Failed to create booking');

      setBookingForm({
        renterName: "",
        renterEmail: "",
        renterPhone: "",
        startDate: "",
        endDate: "",
      });
      toast.success("Booking request submitted! The owner will contact you soon.");
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to submit booking request');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading amazing cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
      {/* Background Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/24f70104-8a8b-4385-8099-542b8902b32f/generated_images/abstract-decorative-pattern-with-subtle--535d0ed1-20251103161214.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="mb-6 hover:bg-white/50 dark:hover:bg-gray-800/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Hero Section */}
        <div className="mb-12 relative">
          <div className="grid lg:grid-cols-2 gap-8 items-center bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 rounded-3xl p-8 lg:p-12 shadow-2xl overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-purple-600/20 to-pink-600/20" />
            
            <div className="relative z-10 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Find Your Perfect Ride</span>
              </div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Browse Amazing Cars
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Connect directly with car owners and get the best rental deals in town
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Car className="h-5 w-5" />
                  <span className="font-semibold">{listings.length}+ Cars Available</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Star className="h-5 w-5" />
                  <span className="font-semibold">Verified Owners</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 hidden lg:block">
              <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/24f70104-8a8b-4385-8099-542b8902b32f/generated_images/modern-digital-illustration-of-a-person--4e929f05-20251103161212.jpg"
                  alt="Browse rental cars"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Find Your Dream Car
            </h2>
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={showFavoritesOnly ? "bg-gradient-to-r from-orange-500 to-pink-500" : "border-2"}
            >
              <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? "fill-white" : ""}`} />
              Favorites ({favorites.length})
            </Button>
          </div>

          {/* Search and Fuel Filter */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by car name or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 text-lg border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 shadow-lg"
              />
            </div>
            <Select value={fuelFilter} onValueChange={setFuelFilter}>
              <SelectTrigger className="h-14 text-lg border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                <SelectValue placeholder="Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🚗 All Fuel Types</SelectItem>
                <SelectItem value="Petrol">⛽ Petrol</SelectItem>
                <SelectItem value="Diesel">🛢️ Diesel</SelectItem>
                <SelectItem value="Electric">⚡ Electric</SelectItem>
                <SelectItem value="Hybrid">🔋 Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort and Price Range */}
          <div className="grid md:grid-cols-2 gap-4">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-14 text-lg border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">🆕 Newest First</SelectItem>
                <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                <SelectItem value="price-high">💎 Price: High to Low</SelectItem>
                <SelectItem value="rating">⭐ Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Price Range (per hour)</Label>
                <span className="text-sm font-bold text-purple-600">₹{priceRange[0]} - ₹{priceRange[1]}</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={maxPrice}
                step={50}
                className="mt-2"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="text-sm">
                Search: {searchQuery}
              </Badge>
            )}
            {fuelFilter !== "all" && (
              <Badge variant="secondary" className="text-sm">
                Fuel: {fuelFilter}
              </Badge>
            )}
            {showFavoritesOnly && (
              <Badge variant="secondary" className="text-sm">
                Favorites Only
              </Badge>
            )}
            <Badge variant="outline" className="text-sm font-semibold">
              {filteredListings.length} car{filteredListings.length !== 1 ? 's' : ''} found
            </Badge>
          </div>
        </div>

        {/* Car Listings */}
        {filteredListings.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-purple-300 dark:border-purple-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
            <div className="relative w-64 h-64 mx-auto mb-6">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/24f70104-8a8b-4385-8099-542b8902b32f/generated_images/friendly-illustration-of-a-person-happil-c06b5a13-20251103161213.jpg"
                alt="No cars available"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              No Cars Found
            </h3>
            <p className="text-muted-foreground text-lg mb-6">
              {searchQuery || fuelFilter !== "all" || showFavoritesOnly
                ? "Try adjusting your filters to see more results" 
                : "Be the first to list a car and start earning!"}
            </p>
            <Button 
              onClick={() => router.push('/list-car')}
              className="bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 hover:from-orange-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-lg shadow-lg"
            >
              List Your Car Now
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((car) => (
              <Card key={car.id} className="hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105">
                <CardHeader>
                  {car.carImage && (
                    <div className="relative w-full h-52 mb-4 rounded-xl overflow-hidden bg-muted border-2 border-purple-100 dark:border-purple-900 shadow-lg">
                      <Image 
                        src={car.carImage} 
                        alt={car.carName}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 rounded-full shadow-lg"
                        onClick={() => toggleFavorite(car.id)}
                      >
                        <Heart 
                          className={`h-5 w-5 ${favorites.includes(car.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                        />
                      </Button>
                    </div>
                  )}
                  <CardTitle className="text-2xl font-bold">{car.carName}</CardTitle>
                  <CardDescription className="text-lg font-medium">{car.carModel}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-orange-100 to-purple-100 dark:from-orange-900/30 dark:to-purple-900/30 border-2 border-orange-200 dark:border-orange-800">
                      <Fuel className="h-4 w-4" />
                      {car.fuelType}
                    </Badge>
                    <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full border-2 border-yellow-200 dark:border-yellow-800">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold text-lg">
                        {calculateAverageRating(car.reviews)}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">
                        ({car.reviews.length})
                      </span>
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₹{car.pricePerHour}
                    <span className="text-lg text-muted-foreground font-normal">/hour</span>
                  </div>
                  <div className="text-base space-y-1.5 bg-muted/50 p-3 rounded-lg">
                    <p><span className="font-bold">RC:</span> {car.rcNumber}</p>
                    <p><span className="font-bold">Plate:</span> {car.numberPlate}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 hover:from-orange-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg shadow-lg" 
                        onClick={() => setSelectedCar(car)}
                      >
                        View Details & Book
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{car.carName} - {car.carModel}</DialogTitle>
                        <DialogDescription>Complete car details, booking, and reviews</DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {car.carImage && (
                          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                            <Image 
                              src={car.carImage} 
                              alt={car.carName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Car Details */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Car Information
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Fuel Type</p>
                              <p className="font-medium">{car.fuelType}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price per Hour</p>
                              <p className="font-medium text-blue-600">₹{car.pricePerHour}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">RC Number</p>
                              <p className="font-medium">{car.rcNumber}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Number Plate</p>
                              <p className="font-medium">{car.numberPlate}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-muted-foreground">Insurance</p>
                              <p className="font-medium">{car.insurance}</p>
                            </div>
                          </div>
                        </div>

                        {/* Driving Notes */}
                        {car.drivingNotes && (
                          <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Important Driving Notes
                            </h3>
                            <p className="text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                              {car.drivingNotes}
                            </p>
                          </div>
                        )}

                        {/* Price Calculator & Booking */}
                        <div className="border-2 border-purple-300 dark:border-purple-700 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            Book This Car
                          </h3>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Your Name</Label>
                                <Input 
                                  value={bookingForm.renterName}
                                  onChange={(e) => setBookingForm({...bookingForm, renterName: e.target.value})}
                                  placeholder="Full name"
                                />
                              </div>
                              <div>
                                <Label>Phone</Label>
                                <Input 
                                  value={bookingForm.renterPhone}
                                  onChange={(e) => setBookingForm({...bookingForm, renterPhone: e.target.value})}
                                  placeholder="Mobile number"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Email</Label>
                              <Input 
                                type="email"
                                value={bookingForm.renterEmail}
                                onChange={(e) => setBookingForm({...bookingForm, renterEmail: e.target.value})}
                                placeholder="your.email@example.com"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Start Date & Time</Label>
                                <Input 
                                  type="datetime-local"
                                  value={bookingForm.startDate}
                                  onChange={(e) => setBookingForm({...bookingForm, startDate: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label>End Date & Time</Label>
                                <Input 
                                  type="datetime-local"
                                  value={bookingForm.endDate}
                                  onChange={(e) => setBookingForm({...bookingForm, endDate: e.target.value})}
                                />
                              </div>
                            </div>

                            {/* Availability Warning */}
                            {!isCarAvailable && bookingForm.startDate && bookingForm.endDate && (
                              <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                      Car Not Available
                                    </p>
                                    <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                                      This car is already booked for the selected dates. Please choose different dates.
                                    </p>
                                    {conflictingBookings.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-xs font-semibold text-red-900 dark:text-red-100">
                                          Conflicting Bookings:
                                        </p>
                                        {conflictingBookings.map((booking) => (
                                          <div key={booking.id} className="text-xs bg-white/50 dark:bg-gray-900/50 p-2 rounded border border-red-200 dark:border-red-900">
                                            <p className="font-medium">{formatDateTime(booking.startDate)} → {formatDateTime(booking.endDate)}</p>
                                            <p className="text-muted-foreground">Status: {booking.status}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Price Calculation Display */}
                            {totalPrice > 0 && isCarAvailable && (
                              <div className="bg-white dark:bg-gray-900 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium">Rental Duration:</span>
                                  <span className="font-bold">
                                    {rentalDuration.days > 0 && `${rentalDuration.days} day${rentalDuration.days > 1 ? 's' : ''}`}
                                    {rentalDuration.days > 0 && rentalDuration.hours > 0 && ' + '}
                                    {rentalDuration.hours > 0 && `${rentalDuration.hours} hour${rentalDuration.hours > 1 ? 's' : ''}`}
                                  </span>
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span className="text-sm font-medium">Total Hours:</span>
                                  <span className="font-bold">{rentalDuration.days * 24 + rentalDuration.hours} hours</span>
                                </div>
                                <div className="flex items-baseline justify-between pt-2 border-t-2 border-dashed">
                                  <span className="text-lg font-semibold">Total Price:</span>
                                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                                    ₹{totalPrice.toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  ₹{car.pricePerHour}/hour × {rentalDuration.days * 24 + rentalDuration.hours} hours
                                </p>
                              </div>
                            )}

                            <Button 
                              onClick={handleBooking} 
                              disabled={!isCarAvailable || isCheckingAvailability}
                              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCheckingAvailability ? "Checking..." : !isCarAvailable ? "Car Not Available" : "Submit Booking Request"}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                              The owner will contact you to confirm the booking
                            </p>
                          </div>
                        </div>

                        {/* Owner Contact */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Owner Contact Details</h3>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {car.ownerName}</p>
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <a href={`tel:${car.ownerContact}`} className="text-blue-600 hover:underline">
                                {car.ownerContact}
                              </a>
                            </p>
                            <p className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <a href={`mailto:${car.ownerEmail}`} className="text-blue-600 hover:underline">
                                {car.ownerEmail}
                              </a>
                            </p>
                            <p><span className="font-medium">License:</span> {car.ownerLicense}</p>
                          </div>
                        </div>

                        {/* Reviews */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Reviews ({car.reviews.length})</h3>
                          {car.reviews.length > 0 ? (
                            <div className="space-y-3 max-h-40 overflow-y-auto">
                              {car.reviews.map((review) => (
                                <div key={review.id} className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm">{review.reviewerName}</p>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                          )}
                        </div>

                        {/* Add Review Form */}
                        <div className="border-t pt-4">
                          <h3 className="font-semibold mb-3">Leave a Review</h3>
                          <div className="space-y-3">
                            <div>
                              <Label>Your Name</Label>
                              <Input 
                                value={reviewForm.name}
                                onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                                placeholder="Enter your name"
                              />
                            </div>
                            <div>
                              <Label>Rating</Label>
                              <Select 
                                value={reviewForm.rating.toString()}
                                onValueChange={(value) => setReviewForm({...reviewForm, rating: parseInt(value)})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5 Stars - Excellent</SelectItem>
                                  <SelectItem value="4">4 Stars - Good</SelectItem>
                                  <SelectItem value="3">3 Stars - Average</SelectItem>
                                  <SelectItem value="2">2 Stars - Below Average</SelectItem>
                                  <SelectItem value="1">1 Star - Poor</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Your Review</Label>
                              <Textarea 
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                placeholder="Share your experience..."
                                rows={3}
                              />
                            </div>
                            <Button onClick={handleSubmitReview} className="w-full">
                              Submit Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}