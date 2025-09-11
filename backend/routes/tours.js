const express = require('express');
const Tour = require('../models/Tour');

const router = express.Router();

// Get all tours
router.get('/', async (req, res) => {
  try {
    const tours = await Tour.find().populate('destination');
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single tour
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('destination');
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tour (admin only)
router.post('/', async (req, res) => {
  try {
    const tour = new Tour(req.body);
    await tour.save();
    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ADD THIS LINE:
module.exports = router;