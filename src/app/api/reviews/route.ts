import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, carListings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, reviewerName, rating, comment } = body;

    // Validate all required fields are present
    if (!carId) {
      return NextResponse.json(
        { 
          error: 'carId is required',
          code: 'MISSING_CAR_ID'
        },
        { status: 400 }
      );
    }

    if (!reviewerName) {
      return NextResponse.json(
        { 
          error: 'reviewerName is required',
          code: 'MISSING_REVIEWER_NAME'
        },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { 
          error: 'rating is required',
          code: 'MISSING_RATING'
        },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        { 
          error: 'comment is required',
          code: 'MISSING_COMMENT'
        },
        { status: 400 }
      );
    }

    // Validate carId is a valid integer
    const parsedCarId = parseInt(carId);
    if (isNaN(parsedCarId)) {
      return NextResponse.json(
        { 
          error: 'carId must be a valid integer',
          code: 'INVALID_CAR_ID'
        },
        { status: 400 }
      );
    }

    // Validate rating is an integer between 1 and 5
    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { 
          error: 'rating must be an integer between 1 and 5',
          code: 'INVALID_RATING'
        },
        { status: 400 }
      );
    }

    // Validate reviewerName and comment are non-empty strings
    const trimmedReviewerName = reviewerName.trim();
    const trimmedComment = comment.trim();

    if (trimmedReviewerName.length === 0) {
      return NextResponse.json(
        { 
          error: 'reviewerName cannot be empty',
          code: 'EMPTY_REVIEWER_NAME'
        },
        { status: 400 }
      );
    }

    if (trimmedComment.length === 0) {
      return NextResponse.json(
        { 
          error: 'comment cannot be empty',
          code: 'EMPTY_COMMENT'
        },
        { status: 400 }
      );
    }

    // Check that the referenced car listing exists
    const carListing = await db.select()
      .from(carListings)
      .where(eq(carListings.id, parsedCarId))
      .limit(1);

    if (carListing.length === 0) {
      return NextResponse.json(
        { 
          error: 'Car listing not found',
          code: 'CAR_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Insert the review
    const newReview = await db.insert(reviews)
      .values({
        carId: parsedCarId,
        reviewerName: trimmedReviewerName,
        rating: parsedRating,
        comment: trimmedComment,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}