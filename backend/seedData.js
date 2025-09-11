const mongoose = require('mongoose');
const Destination = require('./models/Destination');
const Tour = require('./models/Tour');
require('dotenv').config();

const sampleDestinations = [
  {
    name: 'Bali',
    country: 'Indonesia',
    description: 'Beautiful tropical paradise with stunning beaches and temples. Experience the unique culture and breathtaking landscapes.',
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
    price: 1200,
    rating: 4.8
  },
  {
    name: 'Paris',
    country: 'France',
    description: 'The city of love with iconic landmarks like Eiffel Tower and rich historical heritage. Perfect for romantic getaways.',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
    price: 1500,
    rating: 4.7
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    description: 'Modern metropolis blending traditional culture with cutting-edge technology. Amazing food and unique experiences.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    price: 1800,
    rating: 4.9
  },
  {
    name: 'New York',
    country: 'USA',
    description: 'The city that never sleeps. Skyscrapers, Broadway shows, and diverse neighborhoods await.',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    price: 2000,
    rating: 4.6
  },
  {
    name: 'Santorini',
    country: 'Greece',
    description: 'Stunning Greek island with white-washed buildings and breathtaking sunsets over the Aegean Sea.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
    price: 1600,
    rating: 4.8
  },
  {
    name: 'Swiss Alps',
    country: 'Switzerland',
    description: 'Majestic mountains perfect for skiing, hiking, and enjoying pristine natural beauty.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    price: 2200,
    rating: 4.9
  }
];

const sampleTours = [
  {
    name: 'Bali Cultural Experience',
    destination: null, // Will be set after destinations are created
    description: '7-day cultural tour exploring temples, rice terraces, and local traditions',
    price: 899,
    duration: 7,
    maxPeople: 15,
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800'
  },
  {
    name: 'Paris Romantic Getaway',
    destination: null,
    description: '5-day romantic tour including Seine River cruise and fine dining',
    price: 1299,
    duration: 5,
    maxPeople: 12,
    image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Destination.deleteMany({});
    await Tour.deleteMany({});
    console.log('✅ Cleared existing data');
    
    // Insert sample destinations
    const createdDestinations = await Destination.insertMany(sampleDestinations);
    console.log(`✅ Added ${createdDestinations.length} destinations`);
    
    // Update tours with destination references
    sampleTours[0].destination = createdDestinations[0]._id; // Bali
    sampleTours[1].destination = createdDestinations[1]._id; // Paris
    
    // Insert sample tours
    const createdTours = await Tour.insertMany(sampleTours);
    console.log(`✅ Added ${createdTours.length} tours`);
    
    console.log('🎉 Database seeded successfully!');
    console.log('📊 Sample data ready for use');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();