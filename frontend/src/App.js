import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // Only import once
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import Tours from './pages/Tours';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import Cart from './pages/Cart';
import TourDetail from './pages/TourDetail';
import CreateTour from './pages/CreateTour';
import Signup from './pages/Signup';
import UserProfile from './pages/UserProfile';
import MyAccount from './pages/MyAccount';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/tour/:id" element={<TourDetail />} />
            <Route path="/create-tour" element={<CreateTour />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/user-profile/:userId" element={<UserProfile />} />
            <Route path="/my-account" element={<MyAccount />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;