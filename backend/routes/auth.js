const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // ADD THIS

const router = express.Router();

// Register
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin // ADD THIS to return admin status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE ADMIN USER (One-time setup) - ADD THIS ROUTE
router.post('/create-admin', async (req, res) => {
  try {
    console.log('🔍 Attempting to create admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@dotravel.com' },
        { username: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      return res.status(400).json({ 
        success: false,
        message: 'Admin user already exists' 
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@dotravel.com',
      password: hashedPassword,
      isAdmin: true,
      firstName: 'System',
      lastName: 'Administrator'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    
    res.status(201).json({ 
      success: true,
      message: 'Admin user created successfully!',
      credentials: {
        email: 'admin@dotravel.com',
        username: 'admin',
        password: 'admin123'
      },
      warning: 'CHANGE THIS PASSWORD AFTER FIRST LOGIN!'
    });

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
});

// ADD THIS LINE AT THE END OF EVERY ROUTE FILE:
module.exports = router;