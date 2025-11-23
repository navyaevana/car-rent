import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('car_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Validation: Check all required parameters are provided
    if (!carId) {
      return NextResponse.json({ 
        error: "car_id is required",
        code: "MISSING_CAR_ID" 
      }, { status: 400 });
    }

    if (!startDate) {
      return NextResponse.json({ 
        error: "start_date is required",
        code: "MISSING_START_DATE" 
      }, { status: 400 });
    }

    if (!endDate) {
      return NextResponse.json({ 
        error: "end_date is required",
        code: "MISSING_END_DATE" 
      }, { status: 400 });
    }

    // Validation: Validate car_id is a valid integer
    const parsedCarId = parseInt(carId);
    if (isNaN(parsedCarId)) {
      return NextResponse.json({ 
        error: "car_id must be a valid integer",
        code: "INVALID_CAR_ID" 
      }, { status: 400 });
    }

    // Validation: Validate dates are valid ISO strings
    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (isNaN(requestedStart.getTime())) {
      return NextResponse.json({ 
        error: "start_date must be a valid ISO date string",
        code: "INVALID_START_DATE" 
      }, { status: 400 });
    }

    if (isNaN(requestedEnd.getTime())) {
      return NextResponse.json({ 
        error: "end_date must be a valid ISO date string",
        code: "INVALID_END_DATE" 
      }, { status: 400 });
    }

    // Validation: Validate start_date is before end_date
    if (requestedStart >= requestedEnd) {
      return NextResponse.json({ 
        error: "start_date must be before end_date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }

    // Query all bookings for the car where status != 'cancelled'
    const existingBookings = await db.select()
      .from(bookings)
      .where(
        and(
          eq(bookings.carId, parsedCarId),
          ne(bookings.status, 'cancelled')
        )
      );

    // Check for date range overlaps
    const conflicts = [];
    
    for (const booking of existingBookings) {
      const existingStart = new Date(booking.startDate);
      const existingEnd = new Date(booking.endDate);

      // Date overlap logic: (requestedStart < existingEnd) AND (requestedEnd > existingStart)
      const hasOverlap = requestedStart < existingEnd && requestedEnd > existingStart;

      if (hasOverlap) {
        conflicts.push({
          id: booking.id,
          carId: booking.carId,
          carName: booking.carName,
          renterName: booking.renterName,
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
          totalHours: booking.totalHours,
          totalPrice: booking.totalPrice
        });
      }
    }

    // Return availability result
    if (conflicts.length === 0) {
      return NextResponse.json({
        available: true,
        message: "Car is available"
      }, { status: 200 });
    } else {
      return NextResponse.json({
        available: false,
        message: "Car is not available",
        conflicts: conflicts
      }, { status: 200 });
    }

  } catch (error) {
    console.error('GET availability error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}