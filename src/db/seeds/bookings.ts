import { db } from '@/db';
import { bookings } from '@/db/schema';

async function main() {
    const sampleBookings = [
        {
            carId: 1,
            carName: 'Honda City',
            renterName: 'Karthik Reddy',
            renterEmail: 'karthik.reddy@example.com',
            renterPhone: '+91-9876543210',
            startDate: new Date('2024-01-10T09:00:00').toISOString(),
            endDate: new Date('2024-01-10T17:00:00').toISOString(),
            totalHours: 8,
            totalPrice: 4000,
            status: 'completed',
            createdAt: new Date('2024-01-08T10:30:00').toISOString(),
        },
        {
            carId: 2,
            carName: 'Hyundai Creta',
            renterName: 'Divya Shah',
            renterEmail: 'divya.shah@example.com',
            renterPhone: '+91-9845612378',
            startDate: new Date('2024-03-15T10:00:00').toISOString(),
            endDate: new Date('2024-03-15T16:00:00').toISOString(),
            totalHours: 6,
            totalPrice: 4800,
            status: 'confirmed',
            createdAt: new Date('2024-02-10T14:20:00').toISOString(),
        },
        {
            carId: 3,
            carName: 'Tata Nexon EV',
            renterName: 'Rahul Kapoor',
            renterEmail: 'rahul.kapoor@example.com',
            renterPhone: '+91-9123456789',
            startDate: new Date('2024-01-20T08:00:00').toISOString(),
            endDate: new Date('2024-01-20T18:00:00').toISOString(),
            totalHours: 10,
            totalPrice: 6000,
            status: 'completed',
            createdAt: new Date('2024-01-18T11:45:00').toISOString(),
        },
        {
            carId: 4,
            carName: 'Toyota Innova',
            renterName: 'Sanjana Pillai',
            renterEmail: 'sanjana.pillai@example.com',
            renterPhone: '+91-9988776655',
            startDate: new Date('2024-03-20T07:00:00').toISOString(),
            endDate: new Date('2024-03-20T19:00:00').toISOString(),
            totalHours: 12,
            totalPrice: 14400,
            status: 'confirmed',
            createdAt: new Date('2024-02-15T09:30:00').toISOString(),
        },
        {
            carId: 5,
            carName: 'Maruti Swift',
            renterName: 'Arjun Mehta',
            renterEmail: 'arjun.mehta@example.com',
            renterPhone: '+91-9765432108',
            startDate: new Date('2024-02-25T14:00:00').toISOString(),
            endDate: new Date('2024-02-25T18:00:00').toISOString(),
            totalHours: 4,
            totalPrice: 1200,
            status: 'pending',
            createdAt: new Date('2024-02-24T16:15:00').toISOString(),
        },
        {
            carId: 6,
            carName: 'MG Hector',
            renterName: 'Priya Deshmukh',
            renterEmail: 'priya.deshmukh@example.com',
            renterPhone: '+91-9854321076',
            startDate: new Date('2024-02-26T11:00:00').toISOString(),
            endDate: new Date('2024-02-26T16:00:00').toISOString(),
            totalHours: 5,
            totalPrice: 5000,
            status: 'pending',
            createdAt: new Date('2024-02-25T13:40:00').toISOString(),
        },
        {
            carId: 1,
            carName: 'Honda City',
            renterName: 'Vikram Singh',
            renterEmail: 'vikram.singh@example.com',
            renterPhone: '+91-9712345680',
            startDate: new Date('2024-01-05T15:00:00').toISOString(),
            endDate: new Date('2024-01-05T18:00:00').toISOString(),
            totalHours: 3,
            totalPrice: 1500,
            status: 'cancelled',
            createdAt: new Date('2024-01-04T12:00:00').toISOString(),
        },
    ];

    await db.insert(bookings).values(sampleBookings);
    
    console.log('✅ Bookings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});