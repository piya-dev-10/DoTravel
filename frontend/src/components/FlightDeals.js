import React from 'react';

const FlightDeals = () => {
  const flightDeals = [
    {
      id: 1,
      airline: "Emirates",
      route: "NYC → BALI",
      price: 699,
      duration: "18h 30m",
      stops: "1 stop",
      departure: "Jun 15, 2024",
      return: "Jun 30, 2024",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300",
      discount: "15% OFF"
    },
    {
      id: 2,
      airline: "Singapore Airlines",
      route: "LAX → TOKYO",
      price: 599,
      duration: "12h 45m",
      stops: "Non-stop",
      departure: "Jul 10, 2024",
      return: "Jul 25, 2024",
      image: "https://images.unsplash.com/photo-1556388155-4cee0f47e8ec?w=300",
      discount: "20% OFF"
    }
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">✈️ Flight Deals</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {flightDeals.map((flight) => (
            <div key={flight.id} className="border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <img src={flight.image} alt={flight.airline} className="w-16 h-16 object-contain" />
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {flight.discount}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{flight.airline}</h3>
              <p className="text-gray-600 mb-2">{flight.route}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold">{flight.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stops</p>
                  <p className="font-semibold">{flight.stops}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Departure</p>
                  <p className="font-semibold">{flight.departure}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Return</p>
                  <p className="font-semibold">{flight.return}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">${flight.price}</div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold">
                  Book Flight
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
            View All Flight Deals
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDeals;