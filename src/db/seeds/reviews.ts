import { db } from '@/db';
import { reviews } from '@/db/schema';

async function main() {
    const sampleReviews = [
        {
            carId: 1,
            reviewerName: 'Aditya Verma',
            rating: 5,
            comment: 'Great car! Very smooth drive and the owner was very cooperative.',
            createdAt: new Date('2024-12-15').toISOString(),
        },
        {
            carId: 1,
            reviewerName: 'Priya Sharma',
            rating: 4,
            comment: 'Perfect for family trips. Spacious and comfortable.',
            createdAt: new Date('2024-12-20').toISOString(),
        },
        {
            carId: 3,
            reviewerName: 'Kavya Iyer',
            rating: 5,
            comment: 'Excellent condition, highly recommended for long trips.',
            createdAt: new Date('2024-12-18').toISOString(),
        },
        {
            carId: 3,
            reviewerName: 'Rohan Mehta',
            rating: 4,
            comment: 'Fantastic SUV! The driving experience was top-notch.',
            createdAt: new Date('2024-12-22').toISOString(),
        },
        {
            carId: 4,
            reviewerName: 'Pooja Desai',
            rating: 5,
            comment: 'Amazing electric car! Silent and powerful. Loved the experience.',
            createdAt: new Date('2024-12-17').toISOString(),
        },
        {
            carId: 4,
            reviewerName: 'Arjun Nair',
            rating: 4,
            comment: 'Well-maintained vehicle. Owner was helpful and responsive.',
            createdAt: new Date('2024-12-25').toISOString(),
        },
        {
            carId: 5,
            reviewerName: 'Sneha Reddy',
            rating: 5,
            comment: 'Excellent for group travel. Very spacious and comfortable ride.',
            createdAt: new Date('2024-12-19').toISOString(),
        },
        {
            carId: 6,
            reviewerName: 'Vikram Singh',
            rating: 4,
            comment: 'Good experience overall, but the pickup location was a bit far.',
            createdAt: new Date('2024-12-21').toISOString(),
        },
        {
            carId: 6,
            reviewerName: 'Ananya Krishnan',
            rating: 5,
            comment: 'Fantastic car with all modern features. Highly recommended!',
            createdAt: new Date('2024-12-23').toISOString(),
        },
        {
            carId: 2,
            reviewerName: 'Rahul Gupta',
            rating: 4,
            comment: 'Decent car for city rides. A bit pricey though.',
            createdAt: new Date('2024-12-24').toISOString(),
        },
    ];

    await db.insert(reviews).values(sampleReviews);
    
    console.log('✅ Reviews seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});