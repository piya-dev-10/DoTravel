import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  let cartCountFromContext = 0;
  try {
    const { cartCount } = useCart();
    cartCountFromContext = cartCount || 0;
  } catch (error) {
    console.log('CartContext not available yet, using fallback');
  }

  const [user, setUser] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const updateCartCount = () => {
      const cartItems = localStorage.getItem('cartItems');
      if (cartItems) {
        try {
          const items = JSON.parse(cartItems);
          const count = items.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartItemsCount(count);
        } catch (error) {
          console.error('Error parsing cart items:', error);
        }
      } else {
        setCartItemsCount(0);
      }
    };

    updateCartCount();

    const handleStorageChange = (e) => {
      if (e.key === 'cartItems') updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const displayCartCount = cartCountFromContext > 0 ? cartCountFromContext : cartItemsCount;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <span className="text-white text-xl">✈️</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">DoTravel</span>
          </Link>

          {/* Main nav links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium">Home</Link>
            <Link to="/destinations" className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium">Destinations</Link>
            <Link to="/tours" className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium">Tours</Link>
            <Link to="/booking" className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium">Booking</Link>

            {user && user.isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium">
                Admin
              </Link>
            )}
          </div>

          {/* Right side: cart + auth */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 px-3 py-2 font-medium">
              🛒 Cart
              {displayCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {displayCartCount}
                </span>
              )}
            </Link>

            {!user ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {/* ✅ Modified auth section */}
                <Link to="/my-account" className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium">
                  My Account
                </Link>
                <span className="text-gray-700 px-3">Hi, {user.username}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('cartItems');
                    window.location.reload();
                  }}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
