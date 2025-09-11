const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dotavel';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️  Starting without database...');
  });

// ====================== MODELS ======================

// User Model - UPDATED WITH PROFILE FIELDS
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  dateOfBirth: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema); // ← ADD THIS LINE

// Tour Model
const TourSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  category: { type: String, enum: ['adventure', 'cultural', 'beach', 'luxury', 'family'] },
  includes: [String],
  highlights: [String],
  createdAt: { type: Date, default: Date.now }
});

const Tour = mongoose.model('Tour', TourSchema);

// Booking Model
const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  persons: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
});

const Booking = mongoose.model('Booking', BookingSchema);

// ====================== ROUTES ======================

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ DoTravel API is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Database status
app.get('/api/db-status', (req, res) => {
  const status = mongoose.connection.readyState;
  const statusMessages = {
    0: 'Disconnected',
    1: 'Connected', 
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.json({
    status: statusMessages[status] || 'Unknown',
    readyState: status
  });
});

// ---------------------- AUTH ----------------------
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (mongoose.connection.readyState === 1) {
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      
      return res.status(201).json({
        token,
        user: { id: user._id, username, email, isAdmin: user.isAdmin }
      });
    }

    const token = jwt.sign({ userId: 'temp-id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: 'temp-id', username: email.split('@')[0], email, isAdmin: false },
      message: 'Database not connected - using temporary account'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    // HARDCODED ADMIN LOGIN - ALWAYS WORKS
    if (email === 'admin@dotravel.com' && password === 'admin123') {
      const token = jwt.sign({ userId: 'admin-id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ 
        token, 
        user: { id: 'admin-id', username: 'admin', email: 'admin@dotravel.com', isAdmin: true }, 
        message: 'Logged in as admin' 
      });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ 
        token, 
        user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin } 
      });
    }

    const token = jwt.sign({ userId: 'temp-user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { id: 'temp-user', username: email.split('@')[0], email, isAdmin: false }, 
      message: 'Database not connected - using temporary login' 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ---------------------- TOURS ----------------------
app.get('/api/tours', async (req, res) => {
  try {
    const tours = await Tour.find();
    res.json(tours);
  } catch (error) {
    console.error('Tours fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Tour fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- BOOKINGS ----------------------
app.post('/api/bookings', async (req, res) => {
  try {
    const { tourId, persons } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });

    const booking = new Booking({ 
      userId: decoded.userId, 
      tourId, 
      persons, 
      totalPrice: tour.price * persons 
    });
    await booking.save();

    await booking.populate('tourId', 'name destination price');
    await booking.populate('userId', 'username email');

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const bookings = await Booking.find({ userId: decoded.userId })
      .populate('tourId', 'name destination price image');

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- ADMIN ----------------------
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Admin auth token:', token);
    
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Decoded token:', decoded);
    
    // Handle hardcoded admin user
    if (decoded.userId === 'admin-id') {
      console.log('Hardcoded admin detected');
      req.adminUser = { 
        _id: 'admin-id', 
        username: 'admin', 
        email: 'admin@dotravel.com', 
        isAdmin: true 
      };
      return next();
    }
    
    // Handle database users
    const user = await User.findById(decoded.userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

    req.adminUser = user;
    next();
  } catch (error) {
    console.log('Admin auth error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
app.post('/api/create-admin', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database not connected' });
    }

    const existingAdmin = await User.findOne({ email: 'admin@dotravel.com' });
    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@dotravel.com',
      password: hashedPassword,
      isAdmin: true
    });
    
    await adminUser.save();
    res.json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/bookings', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'username email')
      .populate('tourId', 'name destination price')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/tours', adminAuth, async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/tours', adminAuth, async (req, res) => {
  try {
    const tour = new Tour(req.body);
    await tour.save();
    res.status(201).json(tour);
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});
// ---------------------- ADMIN TOUR DELETE ----------------------
app.delete('/api/admin/tours/:id', adminAuth, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ---------------------- CART ROUTES ----------------------

// Get user's cart
app.get('/api/cart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // For now, we'll use localStorage-based cart, but you can implement database cart later
    res.json({ message: 'Cart functionality uses localStorage on frontend' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- BOOKING ROUTE (for cart checkout) ----------------------
app.post('/api/bookings', async (req, res) => {
  try {
    const { tourId, persons } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const tour = await Tour.findById(tourId);
    
    if (!tour) return res.status(404).json({ message: 'Tour not found' });

    const booking = new Booking({ 
      userId: decoded.userId, 
      tourId, 
      persons, 
      totalPrice: tour.price * persons 
    });
    
    await booking.save();
    await booking.populate('tourId', 'name destination price image');

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- ADMIN TOUR UPDATE ----------------------
app.put('/api/admin/tours/:id', adminAuth, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ---------------------- SEED DATA ----------------------
app.post('/api/seed-data', async (req, res) => {
  try {
    await Tour.deleteMany({});
    await Booking.deleteMany({});

    const sampleTours = [
      {
        name: "Bali Cultural Experience",
        destination: "Bali, Indonesia",
        description: "7-day cultural tour exploring temples and rice terraces",
        price: 899,
        duration: 7,
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400",
        rating: 4.8,
        category: "cultural",
        includes: ["Accommodation", "Guided Tours", "Meals"],
        highlights: ["Tanah Lot Temple", "Ubud Rice Terraces"]
      },
      {
        name: "Paris Romantic Getaway",
        destination: "Paris, France",
        description: "5-day romantic tour including Eiffel Tower and Louvre",
        price: 1299,
        duration: 5,
        image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400",
        rating: 4.7,
        category: "luxury",
        includes: ["4-star Hotel", "Museum Entries", "City Tours"],
        highlights: ["Eiffel Tower", "Louvre Museum", "Seine Cruise"]
      }
    ];

    const createdTours = await Tour.insertMany(sampleTours);
    res.json({ 
      message: "Sample data created successfully",
      tours: createdTours.length
    });
  } catch (error) {
    console.error('Seed data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- PROFILE ROUTES ----------------------
// GET CURRENT USER PROFILE
app.get('/api/profile/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Handle hardcoded admin user
    if (decoded.userId === 'admin-id') {
      return res.json({
        _id: 'admin-id',
        username: 'admin',
        email: 'admin@dotravel.com',
        isAdmin: true
      });
    }

    // Fetch user from DB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET SPECIFIC USER PROFILE
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Handle hardcoded admin
    if (decoded.userId === 'admin-id') {
      // Admin can view any profile
      if (req.params.userId === 'admin-id') {
        return res.json({
          _id: 'admin-id',
          username: 'admin',
          email: 'admin@dotravel.com',
          isAdmin: true
        });
      }
      
      const user = await User.findById(req.params.userId).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }

    // Regular users can only view their own profile
    if (decoded.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// GET USER BOOKINGS WITH TOUR DETAILS
app.get('/api/profile/:userId/bookings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Check if user is accessing their own bookings or is admin
    if (decoded.userId !== req.params.userId && decoded.userId !== 'admin-id') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('tourId', 'name destination price image')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CANCEL BOOKING
app.put('/api/profile/bookings/:bookingId/cancel', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.userId.toString() !== decoded.userId && decoded.userId !== 'admin-id') {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = 'cancelled';
    await booking.save();
    
    await booking.populate('tourId', 'name destination price image');

    res.json({ 
      message: 'Booking cancelled successfully',
      booking 
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====================== SERVER START ======================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(`🔐 Test Admin Login: admin@dotravel.com / admin123`);
});