import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/tours');
      setTours(response.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setError('Failed to fetch tours. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (tour) => {
    addToCart(tour);
    alert(`${tour.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchTours}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Explore Our Tours</h1>
        
        {tours.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 text-lg">No tours available at the moment.</p>
            <p className="text-gray-500">Please check back later or contact us for more information.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map(tour => (
              <div key={tour._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={tour.image} 
                  alt={tour.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tour.name}</h3>
                  <p className="text-gray-600 mb-2">📍 {tour.destination}</p>
                  <p className="text-sm text-gray-500 mb-3">{tour.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-green-600">${tour.price}</span>
                    <span className="text-sm text-gray-500">{tour.duration} days</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">{tour.rating}</span>
                    <span className="text-sm text-gray-400 ml-2">({Math.floor(Math.random() * 100) + 1} reviews)</span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                      {tour.category}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Highlights:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tour.highlights && tour.highlights.slice(0, 3).map((highlight, index) => (
                        <span 
                          key={index} 
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(tour)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => window.location.href = `/tour/${tour._id}`}
                    className="w-full mt-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tours;