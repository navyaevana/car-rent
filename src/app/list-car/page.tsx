"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CarListing, Booking } from "@/lib/types";
import { ArrowLeft, Plus, Pencil, Trash2, Car, Sparkles, Shield, TrendingUp, Calendar, Clock, Phone, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

const carSchema = z.object({
  carName: z.string().min(2, "Car name must be at least 2 characters"),
  carModel: z.string().min(2, "Car model must be at least 2 characters"),
  numberPlate: z.string().min(5, "Number plate is required"),
  rcNumber: z.string().min(5, "RC number is required"),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']),
  pricePerHour: z.string().min(1, "Price is required"),
  insurance: z.string().min(5, "Insurance details are required"),
  drivingNotes: z.string().min(10, "Please provide important driving notes"),
  ownerName: z.string().min(2, "Owner name is required"),
  ownerContact: z.string().min(10, "Valid contact number is required"),
  ownerEmail: z.string().email("Valid email is required"),
  ownerLicense: z.string().min(5, "License number is required"),
  carImage: z.string().optional(),
});

type CarFormValues = z.infer<typeof carSchema>;

export default function ListCarPage() {
  const router = useRouter();
  const [myListings, setMyListings] = useState<CarListing[]>([]);
  const [bookingsMap, setBookingsMap] = useState<Record<number, Booking[]>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      carName: "",
      carModel: "",
      numberPlate: "",
      rcNumber: "",
      fuelType: "Petrol",
      pricePerHour: "",
      insurance: "",
      drivingNotes: "",
      ownerName: "",
      ownerContact: "",
      ownerEmail: "",
      ownerLicense: "",
      carImage: "",
    },
  });

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/car-listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const listings = await response.json();
      setMyListings(listings);
      
      // Load bookings for each car
      const bookings: Record<number, Booking[]> = {};
      await Promise.all(
        listings.map(async (listing: CarListing) => {
          const bookingResponse = await fetch(`/api/bookings?car_id=${listing.id}`);
          if (bookingResponse.ok) {
            bookings[listing.id] = await bookingResponse.json();
          } else {
            bookings[listing.id] = [];
          }
        })
      );
      setBookingsMap(bookings);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load car listings');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CarFormValues) => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        carName: data.carName,
        carModel: data.carModel,
        numberPlate: data.numberPlate,
        rcNumber: data.rcNumber,
        fuelType: data.fuelType,
        pricePerHour: parseFloat(data.pricePerHour),
        insurance: data.insurance,
        drivingNotes: data.drivingNotes,
        ownerName: data.ownerName,
        ownerContact: data.ownerContact,
        ownerEmail: data.ownerEmail,
        ownerLicense: data.ownerLicense,
        carImage: data.carImage || undefined,
      };

      let response;
      if (editingId) {
        response = await fetch(`/api/car-listings?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/car-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save listing');
      }

      form.reset();
      setEditingId(null);
      setImagePreview("");
      await loadMyListings();
      toast.success(editingId ? "Car listing updated successfully!" : "Car listing added successfully!");
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (listing: CarListing) => {
    setEditingId(listing.id);
    form.reset({
      carName: listing.carName,
      carModel: listing.carModel,
      numberPlate: listing.numberPlate,
      rcNumber: listing.rcNumber,
      fuelType: listing.fuelType,
      pricePerHour: listing.pricePerHour.toString(),
      insurance: listing.insurance,
      drivingNotes: listing.drivingNotes || "",
      ownerName: listing.ownerName,
      ownerContact: listing.ownerContact,
      ownerEmail: listing.ownerEmail,
      ownerLicense: listing.ownerLicense,
      carImage: listing.carImage || "",
    });
    setImagePreview(listing.carImage || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    setListingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (listingToDelete) {
      try {
        const response = await fetch(`/api/car-listings?id=${listingToDelete}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete listing');
        
        await loadMyListings();
        toast.success("Car listing deleted successfully!");
        setListingToDelete(null);
      } catch (error) {
        console.error('Error deleting listing:', error);
        toast.error('Failed to delete listing');
      }
    }
    setDeleteDialogOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('carImage', value);
    setImagePreview(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleAcceptBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) throw new Error('Failed to accept booking');

      await loadMyListings();
      toast.success("Booking accepted! The renter will be notified.");
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error('Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) throw new Error('Failed to reject booking');

      await loadMyListings();
      toast.error("Booking rejected.");
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <Image 
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/24f70104-8a8b-4385-8099-542b8902b32f/generated_images/modern-abstract-background-pattern-with--b8e0d98a-20251103160111.jpg"
            alt="Background pattern"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Start Earning Today</span>
              </div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                List Your Car & Start Earning
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Turn your idle car into a money-making asset. List your vehicle in minutes and connect with verified renters.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Secure</div>
                    <div className="text-sm text-white/80">Protected rentals</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Earn More</div>
                    <div className="text-sm text-white/80">Competitive rates</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/24f70104-8a8b-4385-8099-542b8902b32f/generated_images/modern-minimalist-illustration-of-a-slee-7546c592-20251103160111.jpg"
                  alt="List your car"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-purple-500/10">
              <CardTitle className="flex items-center gap-2 text-2xl">
                {editingId ? <Pencil className="h-6 w-6 text-purple-600" /> : <Plus className="h-6 w-6 text-orange-600" />}
                {editingId ? "Edit Car Listing" : "Add New Car"}
              </CardTitle>
              <CardDescription className="text-base">
                Fill in all the details about your car to attract renters
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Car Image */}
                  <FormField
                    control={form.control}
                    name="carImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Car Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/car-image.jpg" 
                            {...field}
                            onChange={handleImageChange}
                            className="border-2"
                          />
                        </FormControl>
                        <FormDescription>Enter a valid image URL (e.g., from Unsplash)</FormDescription>
                        {imagePreview && (
                          <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden bg-muted ring-2 ring-purple-500/20">
                            <Image 
                              src={imagePreview} 
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Car Name */}
                  <FormField
                    control={form.control}
                    name="carName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Car Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Honda City" {...field} className="border-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Car Model */}
                  <FormField
                    control={form.control}
                    name="carModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Car Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2023 VX CVT" {...field} className="border-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number Plate */}
                  <FormField
                    control={form.control}
                    name="numberPlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Number Plate</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., KA-01-AB-1234" {...field} className="border-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* RC Number */}
                  <FormField
                    control={form.control}
                    name="rcNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">RC Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Registration Certificate Number" {...field} className="border-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Fuel Type */}
                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Fuel Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2">
                              <SelectValue placeholder="Select fuel type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Petrol">⛽ Petrol</SelectItem>
                            <SelectItem value="Diesel">🚗 Diesel</SelectItem>
                            <SelectItem value="Electric">⚡ Electric</SelectItem>
                            <SelectItem value="Hybrid">🔋 Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price Per Hour */}
                  <FormField
                    control={form.control}
                    name="pricePerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Price Per Hour (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 500" {...field} className="border-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Insurance */}
                  <FormField
                    control={form.control}
                    name="insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Insurance Details</FormLabel>
                        <FormControl>
                          <Input placeholder="Insurance policy number and validity" {...field} className="border-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Driving Notes */}
                  <FormField
                    control={form.control}
                    name="drivingNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Important Driving Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add important notes: gear type, special features, restrictions, dos and don'ts, etc."
                            rows={4}
                            {...field}
                            className="border-2"
                          />
                        </FormControl>
                        <FormDescription>
                          Include manual/automatic, mileage limits, special features, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t-2 border-dashed pt-6 mt-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-600" />
                      Owner Contact Details
                    </h3>
                    
                    {/* Owner Name */}
                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="font-semibold">Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} className="border-2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Owner Contact */}
                    <FormField
                      control={form.control}
                      name="ownerContact"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="font-semibold">Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="10-digit mobile number" {...field} className="border-2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Owner Email */}
                    <FormField
                      control={form.control}
                      name="ownerEmail"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="font-semibold">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} className="border-2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Owner License */}
                    <FormField
                      control={form.control}
                      name="ownerLicense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Driving License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your driving license number" {...field} className="border-2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-6"
                    >
                      {isSubmitting ? "Saving..." : editingId ? "Update Listing" : "Add Listing"}
                    </Button>
                    {editingId && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          form.reset();
                          setImagePreview("");
                        }}
                        className="border-2"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* My Listings Section */}
          <div className="space-y-6">
            <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Car className="h-6 w-6 text-purple-600" />
                  My Listings ({myListings.length})
                </CardTitle>
                <CardDescription className="text-base">
                  Manage your car listings and track your earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {myListings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative w-48 h-48 mx-auto mb-6">
                      <Image 
                        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/24f70104-8a8b-4385-8099-542b8902b32f/generated_images/friendly-empty-state-illustration-showin-96e28940-20251103160111.jpg"
                        alt="No listings"
                        fill
                        className="object-contain opacity-80"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first car and start earning today!
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Car
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myListings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden border-2 hover:shadow-lg transition-all hover:border-purple-300">
                        <div className="flex">
                          {listing.carImage && (
                            <div className="relative w-40 h-40 flex-shrink-0 bg-muted">
                              <Image 
                                src={listing.carImage} 
                                alt={listing.carName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-xl">{listing.carName}</h3>
                                <p className="text-sm text-muted-foreground">{listing.carModel}</p>
                              </div>
                              <span className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {listing.fuelType}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-4">
                              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                                ₹{listing.pricePerHour}
                              </span>
                              <span className="text-sm text-muted-foreground">/hour</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(listing)}
                                className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(listing.id)}
                                className="font-semibold"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {listing.reviews.length > 0 && (
                                <Badge variant="secondary" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                  ⭐ {listing.reviews.length} review{listing.reviews.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                              {bookingsMap[listing.id] && bookingsMap[listing.id].length > 0 && (
                                <Badge variant="secondary" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {bookingsMap[listing.id].length} booking request{bookingsMap[listing.id].length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Requests Section */}
            {myListings.length > 0 && (
              <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-pink-500/10">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Calendar className="h-6 w-6 text-orange-600" />
                    Booking Requests
                  </CardTitle>
                  <CardDescription className="text-base">
                    Review and manage booking requests from renters
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {Object.values(bookingsMap).flat().length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No booking requests yet</h3>
                      <p className="text-muted-foreground text-sm">
                        When renters send booking requests, they'll appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {myListings.map((listing) => {
                        const bookings = bookingsMap[listing.id] || [];
                        if (bookings.length === 0) return null;

                        return (
                          <div key={listing.id}>
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                              <Car className="h-5 w-5 text-orange-600" />
                              {listing.carName} - {listing.carModel}
                            </h3>
                            <div className="space-y-3">
                              {bookings.map((booking) => (
                                <Card key={booking.id} className="border-2 border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow">
                                  <CardContent className="pt-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                          {booking.renterName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-base">{booking.renterName}</p>
                                          <Badge variant="outline" className="text-xs">
                                            {booking.status === 'pending' ? '⏳ Pending' : booking.status}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                                          ₹{booking.totalPrice.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{booking.totalHours} hours</p>
                                      </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4 text-orange-600" />
                                        <a href={`tel:${booking.renterPhone}`} className="hover:text-orange-600 hover:underline">
                                          {booking.renterPhone}
                                        </a>
                                      </div>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4 text-purple-600" />
                                        <a href={`mailto:${booking.renterEmail}`} className="hover:text-purple-600 hover:underline truncate">
                                          {booking.renterEmail}
                                        </a>
                                      </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950/20 dark:to-purple-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Pickup
                                          </p>
                                          <p className="font-semibold">{formatDateTime(booking.startDate)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Return
                                          </p>
                                          <p className="font-semibold">{formatDateTime(booking.endDate)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-3">
                                      Requested on {formatDateTime(booking.createdAt)}
                                    </p>

                                    {/* Accept/Reject Buttons */}
                                    {booking.status === 'pending' && (
                                      <div className="flex gap-2 mt-4">
                                        <Button
                                          onClick={() => handleAcceptBooking(booking.id)}
                                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
                                        >
                                          ✓ Accept Booking
                                        </Button>
                                        <Button
                                          onClick={() => handleRejectBooking(booking.id)}
                                          variant="destructive"
                                          className="flex-1 font-semibold"
                                        >
                                          ✕ Reject
                                        </Button>
                                      </div>
                                    )}

                                    {booking.status === 'confirmed' && (
                                      <div className="mt-4">
                                        <Badge className="w-full justify-center py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-500">
                                          ✓ Booking Accepted
                                        </Badge>
                                      </div>
                                    )}

                                    {booking.status === 'cancelled' && (
                                      <div className="mt-4">
                                        <Badge variant="destructive" className="w-full justify-center py-2 opacity-60">
                                          ✕ Booking Rejected
                                        </Badge>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action cannot be undone. This will permanently delete your car listing and remove all associated reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold">
              Delete Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}