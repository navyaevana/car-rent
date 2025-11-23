import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { carListings, reviews } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single car listing by ID with reviews
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const carListing = await db
        .select()
        .from(carListings)
        .where(eq(carListings.id, parseInt(id)))
        .limit(1);

      if (carListing.length === 0) {
        return NextResponse.json(
          { error: 'Car listing not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      // Fetch reviews for this car
      const carReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.carId, parseInt(id)))
        .orderBy(desc(reviews.createdAt));

      return NextResponse.json({
        ...carListing[0],
        reviews: carReviews,
      });
    }

    // List all car listings with reviews
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(carListings);

    if (search) {
      query = query.where(
        or(
          like(carListings.carName, `%${search}%`),
          like(carListings.carModel, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(carListings.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch reviews for all car listings
    const carIds = results.map((car) => car.id);
    const allReviews = carIds.length > 0
      ? await db.select().from(reviews).orderBy(desc(reviews.createdAt))
      : [];

    // Group reviews by carId
    const reviewsByCarId = allReviews.reduce((acc, review) => {
      if (!acc[review.carId]) {
        acc[review.carId] = [];
      }
      acc[review.carId].push(review);
      return acc;
    }, {} as Record<number, typeof allReviews>);

    // Combine car listings with their reviews
    const carListingsWithReviews = results.map((car) => ({
      ...car,
      reviews: reviewsByCarId[car.id] || [],
    }));

    return NextResponse.json(carListingsWithReviews);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      carName,
      carModel,
      numberPlate,
      rcNumber,
      fuelType,
      pricePerHour,
      insurance,
      drivingNotes,
      ownerName,
      ownerContact,
      ownerEmail,
      ownerLicense,
      carImage,
    } = body;

    // Validate required fields
    if (!carName) {
      return NextResponse.json(
        { error: 'Car name is required', code: 'MISSING_CAR_NAME' },
        { status: 400 }
      );
    }

    if (!carModel) {
      return NextResponse.json(
        { error: 'Car model is required', code: 'MISSING_CAR_MODEL' },
        { status: 400 }
      );
    }

    if (!numberPlate) {
      return NextResponse.json(
        { error: 'Number plate is required', code: 'MISSING_NUMBER_PLATE' },
        { status: 400 }
      );
    }

    if (!rcNumber) {
      return NextResponse.json(
        { error: 'RC number is required', code: 'MISSING_RC_NUMBER' },
        { status: 400 }
      );
    }

    if (!fuelType) {
      return NextResponse.json(
        { error: 'Fuel type is required', code: 'MISSING_FUEL_TYPE' },
        { status: 400 }
      );
    }

    if (!pricePerHour) {
      return NextResponse.json(
        { error: 'Price per hour is required', code: 'MISSING_PRICE_PER_HOUR' },
        { status: 400 }
      );
    }

    if (!insurance) {
      return NextResponse.json(
        { error: 'Insurance is required', code: 'MISSING_INSURANCE' },
        { status: 400 }
      );
    }

    if (!ownerName) {
      return NextResponse.json(
        { error: 'Owner name is required', code: 'MISSING_OWNER_NAME' },
        { status: 400 }
      );
    }

    if (!ownerContact) {
      return NextResponse.json(
        { error: 'Owner contact is required', code: 'MISSING_OWNER_CONTACT' },
        { status: 400 }
      );
    }

    if (!ownerEmail) {
      return NextResponse.json(
        { error: 'Owner email is required', code: 'MISSING_OWNER_EMAIL' },
        { status: 400 }
      );
    }

    if (!ownerLicense) {
      return NextResponse.json(
        { error: 'Owner license is required', code: 'MISSING_OWNER_LICENSE' },
        { status: 400 }
      );
    }

    // Validate fuel type
    const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
    if (!validFuelTypes.includes(fuelType)) {
      return NextResponse.json(
        {
          error: `Fuel type must be one of: ${validFuelTypes.join(', ')}`,
          code: 'INVALID_FUEL_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate price per hour
    if (isNaN(parseFloat(pricePerHour)) || parseFloat(pricePerHour) <= 0) {
      return NextResponse.json(
        {
          error: 'Price per hour must be a positive number',
          code: 'INVALID_PRICE_PER_HOUR',
        },
        { status: 400 }
      );
    }

    // Check if number plate already exists
    const existingCar = await db
      .select()
      .from(carListings)
      .where(eq(carListings.numberPlate, numberPlate.trim()))
      .limit(1);

    if (existingCar.length > 0) {
      return NextResponse.json(
        {
          error: 'A car with this number plate already exists',
          code: 'DUPLICATE_NUMBER_PLATE',
        },
        { status: 400 }
      );
    }

    // Create new car listing
    const newCarListing = await db
      .insert(carListings)
      .values({
        carName: carName.trim(),
        carModel: carModel.trim(),
        numberPlate: numberPlate.trim(),
        rcNumber: rcNumber.trim(),
        fuelType,
        pricePerHour: parseFloat(pricePerHour),
        insurance: insurance.trim(),
        drivingNotes: drivingNotes?.trim() || null,
        ownerName: ownerName.trim(),
        ownerContact: ownerContact.trim(),
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerLicense: ownerLicense.trim(),
        carImage: carImage?.trim() || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newCarListing[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if car listing exists
    const existingCar = await db
      .select()
      .from(carListings)
      .where(eq(carListings.id, parseInt(id)))
      .limit(1);

    if (existingCar.length === 0) {
      return NextResponse.json(
        { error: 'Car listing not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      carName,
      carModel,
      numberPlate,
      rcNumber,
      fuelType,
      pricePerHour,
      insurance,
      drivingNotes,
      ownerName,
      ownerContact,
      ownerEmail,
      ownerLicense,
      carImage,
    } = body;

    // Validate fuel type if provided
    if (fuelType) {
      const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
      if (!validFuelTypes.includes(fuelType)) {
        return NextResponse.json(
          {
            error: `Fuel type must be one of: ${validFuelTypes.join(', ')}`,
            code: 'INVALID_FUEL_TYPE',
          },
          { status: 400 }
        );
      }
    }

    // Validate price per hour if provided
    if (pricePerHour !== undefined) {
      if (isNaN(parseFloat(pricePerHour)) || parseFloat(pricePerHour) <= 0) {
        return NextResponse.json(
          {
            error: 'Price per hour must be a positive number',
            code: 'INVALID_PRICE_PER_HOUR',
          },
          { status: 400 }
        );
      }
    }

    // Check if number plate is being changed and if it already exists
    if (numberPlate && numberPlate !== existingCar[0].numberPlate) {
      const duplicateCar = await db
        .select()
        .from(carListings)
        .where(eq(carListings.numberPlate, numberPlate.trim()))
        .limit(1);

      if (duplicateCar.length > 0) {
        return NextResponse.json(
          {
            error: 'A car with this number plate already exists',
            code: 'DUPLICATE_NUMBER_PLATE',
          },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updates: any = {};

    if (carName !== undefined) updates.carName = carName.trim();
    if (carModel !== undefined) updates.carModel = carModel.trim();
    if (numberPlate !== undefined) updates.numberPlate = numberPlate.trim();
    if (rcNumber !== undefined) updates.rcNumber = rcNumber.trim();
    if (fuelType !== undefined) updates.fuelType = fuelType;
    if (pricePerHour !== undefined) updates.pricePerHour = parseFloat(pricePerHour);
    if (insurance !== undefined) updates.insurance = insurance.trim();
    if (drivingNotes !== undefined) updates.drivingNotes = drivingNotes?.trim() || null;
    if (ownerName !== undefined) updates.ownerName = ownerName.trim();
    if (ownerContact !== undefined) updates.ownerContact = ownerContact.trim();
    if (ownerEmail !== undefined) updates.ownerEmail = ownerEmail.trim().toLowerCase();
    if (ownerLicense !== undefined) updates.ownerLicense = ownerLicense.trim();
    if (carImage !== undefined) updates.carImage = carImage?.trim() || null;

    const updatedCarListing = await db
      .update(carListings)
      .set(updates)
      .where(eq(carListings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedCarListing[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if car listing exists
    const existingCar = await db
      .select()
      .from(carListings)
      .where(eq(carListings.id, parseInt(id)))
      .limit(1);

    if (existingCar.length === 0) {
      return NextResponse.json(
        { error: 'Car listing not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedCarListing = await db
      .delete(carListings)
      .where(eq(carListings.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Car listing deleted successfully',
      deleted: deletedCarListing[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}