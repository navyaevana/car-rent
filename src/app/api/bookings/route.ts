import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, carListings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('car_id');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(bookings).orderBy(desc(bookings.createdAt));

    if (carId) {
      const carIdInt = parseInt(carId);
      if (isNaN(carIdInt)) {
        return NextResponse.json(
          { 
            error: 'Invalid car_id parameter',
            code: 'INVALID_CAR_ID'
          },
          { status: 400 }
        );
      }
      query = query.where(eq(bookings.carId, carIdInt));
    }

    const results = await query.limit(limit).offset(offset);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      carId,
      carName,
      renterName,
      renterEmail,
      renterPhone,
      startDate,
      endDate,
      totalHours,
      totalPrice,
      status = 'pending'
    } = body;

    // Validate required fields
    if (!carId) {
      return NextResponse.json(
        {
          error: 'carId is required',
          code: 'MISSING_CAR_ID'
        },
        { status: 400 }
      );
    }

    if (!carName) {
      return NextResponse.json(
        {
          error: 'carName is required',
          code: 'MISSING_CAR_NAME'
        },
        { status: 400 }
      );
    }

    if (!renterName) {
      return NextResponse.json(
        {
          error: 'renterName is required',
          code: 'MISSING_RENTER_NAME'
        },
        { status: 400 }
      );
    }

    if (!renterEmail) {
      return NextResponse.json(
        {
          error: 'renterEmail is required',
          code: 'MISSING_RENTER_EMAIL'
        },
        { status: 400 }
      );
    }

    if (!renterPhone) {
      return NextResponse.json(
        {
          error: 'renterPhone is required',
          code: 'MISSING_RENTER_PHONE'
        },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        {
          error: 'startDate is required',
          code: 'MISSING_START_DATE'
        },
        { status: 400 }
      );
    }

    if (!endDate) {
      return NextResponse.json(
        {
          error: 'endDate is required',
          code: 'MISSING_END_DATE'
        },
        { status: 400 }
      );
    }

    if (totalHours === undefined || totalHours === null) {
      return NextResponse.json(
        {
          error: 'totalHours is required',
          code: 'MISSING_TOTAL_HOURS'
        },
        { status: 400 }
      );
    }

    if (totalPrice === undefined || totalPrice === null) {
      return NextResponse.json(
        {
          error: 'totalPrice is required',
          code: 'MISSING_TOTAL_PRICE'
        },
        { status: 400 }
      );
    }

    // Validate carId is valid integer
    const carIdInt = parseInt(carId);
    if (isNaN(carIdInt)) {
      return NextResponse.json(
        {
          error: 'carId must be a valid integer',
          code: 'INVALID_CAR_ID'
        },
        { status: 400 }
      );
    }

    // Validate totalHours is positive number
    const totalHoursInt = parseInt(totalHours);
    if (isNaN(totalHoursInt) || totalHoursInt <= 0) {
      return NextResponse.json(
        {
          error: 'totalHours must be a positive number',
          code: 'INVALID_TOTAL_HOURS'
        },
        { status: 400 }
      );
    }

    // Validate totalPrice is positive number
    const totalPriceFloat = parseFloat(totalPrice);
    if (isNaN(totalPriceFloat) || totalPriceFloat <= 0) {
      return NextResponse.json(
        {
          error: 'totalPrice must be a positive number',
          code: 'INVALID_TOTAL_PRICE'
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'status must be one of: pending, confirmed, completed, cancelled',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(renterEmail)) {
      return NextResponse.json(
        {
          error: 'renterEmail must be a valid email address',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Check that the referenced car listing exists
    const carExists = await db.select()
      .from(carListings)
      .where(eq(carListings.id, carIdInt))
      .limit(1);

    if (carExists.length === 0) {
      return NextResponse.json(
        {
          error: 'Car listing not found',
          code: 'CAR_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      carId: carIdInt,
      carName: carName.trim(),
      renterName: renterName.trim(),
      renterEmail: renterEmail.trim().toLowerCase(),
      renterPhone: renterPhone.trim(),
      startDate,
      endDate,
      totalHours: totalHoursInt,
      totalPrice: totalPriceFloat,
      status,
      createdAt: new Date().toISOString()
    };

    // Create booking
    const newBooking = await db.insert(bookings)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}