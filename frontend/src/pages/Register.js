import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, cardNumber, expiryDate, cvv, cardHolder, ...userData } = formData;

      // Register user
      const response = await axios.post('http://localhost:5001/api/register', userData);

      // Save payment method if card details provided
      if (cardNumber && expiryDate && cvv && cardHolder) {
        const token = response.data.token;
        await axios.post('http://localhost:5001/api/payment-methods', {
          cardNumber,
          expiryDate,
          cvv,
          cardHolder
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" name="username" placeholder="Username" onChange={handleChange} required className="p-3 border rounded" />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="p-3 border rounded" />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="p-3 border rounded" />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="p-3 border rounded" />
            <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} className="p-3 border rounded" />
            <input type="text" name="country" placeholder="Country" onChange={handleChange} className="p-3 border rounded" />
            <input type="text" name="address" placeholder="Address" onChange={handleChange} className="p-3 border rounded" />
            <input type="text" name="city" placeholder="City" onChange={handleChange} className="p-3 border rounded" />
            <input type="text" name="zipCode" placeholder="ZIP Code" onChange={handleChange} className="p-3 border rounded" />
          </div>

          {/* Payment Information */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">Payment Information (Optional)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="cardNumber" placeholder="Card Number" onChange={handleChange} className="p-3 border rounded" />
              <input type="text" name="expiryDate" placeholder="MM/YY" onChange={handleChange} className="p-3 border rounded" />
              <input type="text" name="cvv" placeholder="CVV" onChange={handleChange} className="p-3 border rounded" />
              <input type="text" name="cardHolder" placeholder="Card Holder Name" onChange={handleChange} className="p-3 border rounded" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700">
            Create Account
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;