const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  destination: { 
    type: mongoose.Schema.Types.Mixed, // keep flexibility: string or ObjectId
    required: true 
  },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in days
  maxPeople: { type: Number, required: true },
  availableDates: [{ startDate: Date, endDate: Date }],
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  category: { type: String, enum: ['adventure', 'cultural', 'beach', 'luxury', 'family'] },
  includes: [String],
  highlights: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tour', tourSchema);
