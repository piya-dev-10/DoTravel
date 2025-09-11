const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:userId', auth, async (req, res) => {
  try {
    // Allow admin to view any profile, users to view only their own
    if (req.user._id.toString() !== req.params.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let user;
    
    // Handle hardcoded admin user
    if (req.params.userId === 'admin-id') {
      user = {
        _id: 'admin-id',
        username: 'admin',
        email: 'admin@dotravel.com',
        isAdmin: true
      };
    } else {
      // Handle database users
      user = await User.findById(req.params.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile (for My Account page)
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;