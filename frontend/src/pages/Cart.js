import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, cartTotal, clearCart } = useCart(); // Changed from cart to cartItems
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to complete payment');
        setLoading(false);
        return;
      }

      // Process each item in cart
      for (const item of cartItems) {
        await axios.post('http://localhost:5001/api/bookings', {
          tourId: item._id,
          persons: item.quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert('Payment successful! Your bookings are confirmed.');
      clearCart();
      setShowPayment(false);
      navigate('/');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + (error.response?.data?.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (tourId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(tourId);
    } else {
      // You'll need to add updateQuantity function to your CartContext
      // For now, we'll handle it directly
      const updatedItems = cartItems.map(item =>
        item._id === tourId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      window.location.reload(); // Simple refresh to update UI
    }
  };

  const removeFromCart = (tourId) => {
    const updatedItems = cartItems.filter(item => item._id !== tourId);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.location.reload(); // Simple refresh to update UI
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <a href="/tours" className="text-blue-600 hover:underline">Browse tours</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Shopping Cart</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {cartItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-4 mb-4 last:border-b-0 last:mb-0">
              <div className="flex items-center space-x-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{item.destination}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${item.price * item.quantity}</p>
                <p className="text-sm text-gray-600">${item.price} each</p>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-600 text-sm mt-2 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold mb-6">
              <span>Total:</span>
              <span>${cartTotal}</span>
            </div>
            
            {!showPayment ? (
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Proceed to Payment
              </button>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                
                <div className="space-y-4">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 border rounded"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                  </select>

                  {paymentMethod === 'card' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="p-3 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="p-3 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="p-3 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Card Holder Name"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="p-3 border rounded"
                      />
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className={`flex-1 bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Processing...' : 'Confirm Payment'}
                    </button>
                    <button
                      onClick={() => setShowPayment(false)}
                      className="flex-1 bg-gray-600 text-white py-3 rounded font-semibold hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;