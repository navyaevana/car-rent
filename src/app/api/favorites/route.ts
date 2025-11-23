import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { favorites, carListings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch all favorites sorted by addedAt DESC
    const allFavorites = await db.select()
      .from(favorites)
      .orderBy(desc(favorites.addedAt));

    // Fetch corresponding car details for each favorite
    const favoritesWithCarDetails = await Promise.all(
      allFavorites.map(async (favorite) => {
        const carDetails = await db.select()
          .from(carListings)
          .where(eq(carListings.id, favorite.carId))
          .limit(1);

        return {
          id: favorite.id,
          carId: favorite.carId,
          addedAt: favorite.addedAt,
          car: carDetails[0] || null
        };
      })
    );

    return NextResponse.json(favoritesWithCarDetails, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId } = body;

    // Validate carId is present
    if (!carId) {
      return NextResponse.json({ 
        error: "carId is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate carId is a valid integer
    const parsedCarId = parseInt(carId);
    if (isNaN(parsedCarId)) {
      return NextResponse.json({ 
        error: "carId must be a valid integer",
        code: "INVALID_CAR_ID" 
      }, { status: 400 });
    }

    // Check that the car listing exists
    const carExists = await db.select()
      .from(carListings)
      .where(eq(carListings.id, parsedCarId))
      .limit(1);

    if (carExists.length === 0) {
      return NextResponse.json({ 
        error: "Car listing not found",
        code: "CAR_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if already in favorites
    const existingFavorite = await db.select()
      .from(favorites)
      .where(eq(favorites.carId, parsedCarId))
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json(existingFavorite[0], { status: 200 });
    }

    // Create new favorite
    const newFavorite = await db.insert(favorites)
      .values({
        carId: parsedCarId,
        addedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newFavorite[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const carId = searchParams.get('car_id');

    // Validate car_id is present
    if (!carId) {
      return NextResponse.json({ 
        error: "car_id query parameter is required",
        code: "MISSING_CAR_ID" 
      }, { status: 400 });
    }

    // Validate car_id is a valid integer
    const parsedCarId = parseInt(carId);
    if (isNaN(parsedCarId)) {
      return NextResponse.json({ 
        error: "car_id must be a valid integer",
        code: "INVALID_CAR_ID" 
      }, { status: 400 });
    }

    // Check if favorite exists
    const existingFavorite = await db.select()
      .from(favorites)
      .where(eq(favorites.carId, parsedCarId))
      .limit(1);

    if (existingFavorite.length === 0) {
      return NextResponse.json({ 
        error: "Favorite not found",
        code: "FAVORITE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete the favorite
    const deleted = await db.delete(favorites)
      .where(eq(favorites.carId, parsedCarId))
      .returning();

    return NextResponse.json({ 
      message: "Favorite removed successfully",
      deleted: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}