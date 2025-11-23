import { db } from '@/db';
import { carListings } from '@/db/schema';

async function main() {
    const sampleCarListings = [
        {
            carName: 'Honda City',
            carModel: 'City VX CVT',
            numberPlate: 'KA-01-AB-1234',
            rcNumber: 'KA01AB1234RC',
            fuelType: 'Petrol',
            pricePerHour: 500,
            insurance: 'Comprehensive (ICICI Lombard)',
            drivingNotes: 'Well-maintained sedan, perfect for family trips',
            ownerName: 'Rajesh Kumar',
            ownerContact: '+91-9876543210',
            ownerEmail: 'rajesh.kumar@example.com',
            ownerLicense: 'KA01DL123456',
            carImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            carName: 'Maruti Swift',
            carModel: 'Swift VXI',
            numberPlate: 'KA-02-CD-5678',
            rcNumber: 'KA02CD5678RC',
            fuelType: 'Petrol',
            pricePerHour: 300,
            insurance: 'Third Party (Bajaj Allianz)',
            drivingNotes: 'Compact and fuel-efficient, great for city drives',
            ownerName: 'Priya Sharma',
            ownerContact: '+91-9876543211',
            ownerEmail: 'priya.sharma@example.com',
            ownerLicense: 'KA02DL234567',
            carImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            carName: 'Hyundai Creta',
            carModel: 'Creta SX Diesel',
            numberPlate: 'KA-03-EF-9012',
            rcNumber: 'KA03EF9012RC',
            fuelType: 'Diesel',
            pricePerHour: 800,
            insurance: 'Comprehensive (HDFC Ergo)',
            drivingNotes: 'Premium SUV with spacious interiors, ideal for long journeys',
            ownerName: 'Amit Patel',
            ownerContact: '+91-9876543212',
            ownerEmail: 'amit.patel@example.com',
            ownerLicense: 'KA03DL345678',
            carImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            carName: 'Tata Nexon EV',
            carModel: 'Nexon EV Max',
            numberPlate: 'KA-04-GH-3456',
            rcNumber: 'KA04GH3456RC',
            fuelType: 'Electric',
            pricePerHour: 600,
            insurance: 'Comprehensive (Reliance General)',
            drivingNotes: 'Eco-friendly electric SUV, charging stations available across the city',
            ownerName: 'Sneha Reddy',
            ownerContact: '+91-9876543213',
            ownerEmail: 'sneha.reddy@example.com',
            ownerLicense: 'KA04DL456789',
            carImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            carName: 'Toyota Innova Crysta',
            carModel: 'Innova Crysta ZX Diesel',
            numberPlate: 'KA-05-IJ-7890',
            rcNumber: 'KA05IJ7890RC',
            fuelType: 'Diesel',
            pricePerHour: 1200,
            insurance: 'Comprehensive (New India Assurance)',
            drivingNotes: '7-seater MPV, perfect for group travel and family outings',
            ownerName: 'Vikram Singh',
            ownerContact: '+91-9876543214',
            ownerEmail: 'vikram.singh@example.com',
            ownerLicense: 'KA05DL567890',
            carImage: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
            createdAt: new Date('2024-01-28').toISOString(),
        },
        {
            carName: 'MG Hector',
            carModel: 'Hector Hybrid',
            numberPlate: 'KA-06-KL-2345',
            rcNumber: 'KA06KL2345RC',
            fuelType: 'Hybrid',
            pricePerHour: 1000,
            insurance: 'Comprehensive (SBI General)',
            drivingNotes: 'Hybrid SUV with connected car tech, best for tech-savvy drivers',
            ownerName: 'Neha Gupta',
            ownerContact: '+91-9876543215',
            ownerEmail: 'neha.gupta@example.com',
            ownerLicense: 'KA06DL678901',
            carImage: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
            createdAt: new Date('2024-02-01').toISOString(),
        }
    ];

    await db.insert(carListings).values(sampleCarListings);
    
    console.log('✅ Car listings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});