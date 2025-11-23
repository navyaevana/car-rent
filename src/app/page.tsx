"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, KeyRound, Sparkles, Shield, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

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

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 text-white rounded-full px-6 py-2 mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">India's Premier Car Sharing Platform</span>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            CarRental Hub
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            Rent a car or earn by listing yours
          </p>
          
          {/* Hero Image */}
          <div className="relative w-full max-w-3xl mx-auto h-64 mb-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/24f70104-8a8b-4385-8099-542b8902b32f/generated_images/modern-digital-illustration-of-two-paths-ace3fa1e-20251103161401.jpg"
              alt="Car rental platform"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Option Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Rent a Car Option */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="mx-auto mb-4 w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center border-4 border-orange-300 dark:border-orange-700 shadow-lg">
                <Car className="w-12 h-12 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">Need a Car?</CardTitle>
              <CardDescription className="text-lg font-medium">
                Browse available cars and rent the perfect ride for your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/rent-car')}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 shadow-lg"
                size="lg"
              >
                Browse Cars Now
              </Button>
              <ul className="mt-6 space-y-3 text-base">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full"></span>
                  View detailed car information & specs
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full"></span>
                  Contact verified owners directly
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full"></span>
                  Read & leave reviews and ratings
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* List Your Car Option */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="mx-auto mb-4 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30 rounded-full flex items-center justify-center border-4 border-purple-300 dark:border-purple-700 shadow-lg">
                <KeyRound className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Have a Car?</CardTitle>
              <CardDescription className="text-lg font-medium">
                List your car and start earning money from rentals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/list-car')}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                size="lg"
              >
                List Your Car Now
              </Button>
              <ul className="mt-6 space-y-3 text-base">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                  Upload photos & detailed specifications
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                  Manage & edit your listings anytime
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                  Set your own pricing & availability
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Why Choose CarRental Hub?
            </h2>
            <p className="text-lg text-muted-foreground">Experience the best car sharing platform in India</p>
          </div>
          
          {/* Features Image */}
          <div className="relative w-full max-w-md mx-auto h-64 mb-12 rounded-2xl overflow-hidden shadow-xl border-4 border-purple-200 dark:border-purple-800">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/24f70104-8a8b-4385-8099-542b8902b32f/generated_images/friendly-illustration-of-diverse-happy-p-f4da8664-20251103161359.jpg"
              alt="Happy customers"
              fill
              className="object-cover"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center border-2 border-orange-300 dark:border-orange-700">
                <Car className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">Wide Selection</h3>
              <p className="text-base text-muted-foreground">
                Choose from various car models, fuel types, and price ranges
              </p>
            </Card>
            
            <Card className="p-6 text-center border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center border-2 border-purple-300 dark:border-purple-700">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Verified Owners</h3>
              <p className="text-base text-muted-foreground">
                All car owners are verified with valid licenses and documents
              </p>
            </Card>
            
            <Card className="p-6 text-center border-2 border-pink-200 dark:border-pink-800 hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-full flex items-center justify-center border-2 border-pink-300 dark:border-pink-700">
                <Clock className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Flexible Rental</h3>
              <p className="text-base text-muted-foreground">
                Rent by the hour with transparent pricing and no hidden fees
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}