import React from 'react';

const AdBanner = () => {
  const featuredTours = [
    {
      id: 1,
      title: "Summer Special: Bali Package",
      description: "Get 20% off on all Bali tours this summer! Limited time offer.",
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400",
      price: 799,
      originalPrice: 999,
      badge: "HOT DEAL"
    },
    {
      id: 2,
      title: "Early Bird: European Tour",
      description: "Book now and save 25% on our European adventure packages.",
      image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400",
      price: 1299,
      originalPrice: 1729,
      badge: "POPULAR"
    }
  ];

  const handleAdClick = () => {
    alert('This is an advertisement. Please go to the Tours page to book real tours.');
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">🔥 Special Offers</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {featuredTours.map((tour) => (
            <div key={tour.id} className="bg-white text-gray-900 rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <img src={tour.image} alt={tour.title} className="w-full h-48 object-cover" />
                <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {tour.badge}
                </span>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
                <p className="text-gray-600 mb-4">{tour.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">${tour.price}</span>
                    <span className="text-lg text-gray-500 line-through">${tour.originalPrice}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Save ${tour.originalPrice - tour.price}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={handleAdClick}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 font-semibold"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={handleAdClick}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 font-semibold"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <p className="text-lg mb-4">✨ Limited time offers - Book now and save! ✨</p>
          <button
            onClick={handleAdClick}
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            View All Deals
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
