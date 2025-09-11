import React from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import FlightDeals from '../components/FlightDeals';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Discover Your Next Adventure</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Explore breathtaking destinations around the world with DoTravel. Your journey begins here.
            </p>
            <Link 
              to="/destinations" 
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Advertisement Banner */}
      <AdBanner />

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose DoTravel?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Best Prices</h3>
              <p className="text-gray-600">Get the most competitive prices on tours and accommodations worldwide.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🌎</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Global Destinations</h3>
              <p className="text-gray-600">Explore over 100 destinations across every continent.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🛟</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for all your travel needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flight Deals Section */}
      <FlightDeals />
      
    </div>
  );
};

export default Home;
