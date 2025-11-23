import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const bookingId = parseInt(id);

    // Parse request body
    const body = await request.json();

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    // Add fields from body if they exist
    if (body.status !== undefined) updateData.status = body.status;
    if (body.renterName !== undefined) updateData.renterName = body.renterName.trim();
    if (body.renterEmail !== undefined) updateData.renterEmail = body.renterEmail.toLowerCase().trim();
    if (body.renterPhone !== undefined) updateData.renterPhone = body.renterPhone.trim();
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;
    if (body.totalHours !== undefined) updateData.totalHours = body.totalHours;
    if (body.totalPrice !== undefined) updateData.totalPrice = body.totalPrice;
    if (body.carName !== undefined) updateData.carName = body.carName.trim();

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'No fields to update',
          code: 'NO_UPDATE_FIELDS'
        },
        { status: 400 }
      );
    }

    // Update the booking
    const updated = await db.update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}