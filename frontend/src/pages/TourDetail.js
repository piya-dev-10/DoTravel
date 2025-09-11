import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [tour, setTour] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchTour();
  }, [id]);

  const fetchTour = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/tours/${id}`);
      setTour(response.data);
    } catch (error) {
      console.error('Error fetching tour:', error);
    }
  };

  const handleAddToCart = () => {
    addToCart(tour._id, quantity);
    navigate('/cart');
  };

  if (!tour) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src={tour.image} alt={tour.name} className="w-full h-64 object-cover" />
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{tour.name}</h1>
            <p className="text-gray-600 mb-2">{tour.destination}</p>
            <p className="text-gray-700 mb-6">{tour.description}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Tour Details</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold">Duration:</span> {tour.duration} days</p>
                  <p><span className="font-semibold">Category:</span> {tour.category}</p>
                  <p><span className="font-semibold">Rating:</span> ⭐ {tour.rating}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Price & Booking</h3>
                <div className="text-2xl font-bold text-blue-600 mb-4">${tour.price} per person</div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <label className="font-semibold">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-20 p-2 border rounded"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Add to Cart - ${tour.price * quantity}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">What's Included</h3>
              <ul className="list-disc list-inside space-y-1">
                {tour.includes.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Tour Highlights</h3>
              <ul className="list-disc list-inside space-y-1">
                {tour.highlights.map((highlight, index) => (
                  <li key={index} className="text-gray-700">{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;