import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newTour, setNewTour] = useState({
    name: '',
    destination: '',
    description: '',
    price: '',
    duration: '',
    image: '',
    category: 'adventure',
    includes: ['Accommodation', 'Guided Tours'],
    highlights: []
  });
  const [editingTour, setEditingTour] = useState(null);
  const [editTourData, setEditTourData] = useState({
    name: '',
    destination: '',
    description: '',
    price: '',
    duration: '',
    image: '',
    category: 'adventure',
    highlights: []
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Token found:', token);
      console.log('Fetching admin data...');

      // Test backend connection first
      try {
        await axios.get('http://localhost:5001/');
        console.log('Backend connection successful');
      } catch (error) {
        setError('Cannot connect to backend server. Make sure it\'s running on port 5001.');
        setLoading(false);
        return;
      }

      // Create headers with Authorization
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Fetch data with individual error handling
      try {
        console.log('Fetching users...');
        const usersResponse = await axios.get('http://localhost:5001/api/admin/users', config);
        setUsers(usersResponse.data);
        console.log('Users fetched successfully:', usersResponse.data.length, 'users');
      } catch (usersError) {
        console.error('Failed to fetch users:', usersError.response?.data || usersError.message);
        if (usersError.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (usersError.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        }
        setUsers([]);
      }

      try {
        console.log('Fetching bookings...');
        const bookingsResponse = await axios.get('http://localhost:5001/api/admin/bookings', config);
        setBookings(bookingsResponse.data);
        console.log('Bookings fetched successfully:', bookingsResponse.data.length, 'bookings');
      } catch (bookingsError) {
        console.error('Failed to fetch bookings:', bookingsError.response?.data || bookingsError.message);
        setBookings([]);
      }

      try {
        console.log('Fetching tours...');
        const toursResponse = await axios.get('http://localhost:5001/api/admin/tours', config);
        setTours(toursResponse.data);
        console.log('Tours fetched successfully:', toursResponse.data.length, 'tours');
      } catch (toursError) {
        console.error('Failed to fetch tours:', toursError.response?.data || toursError.message);
        setTours([]);
      }

    } catch (error) {
      console.error('Admin data fetch error:', error);
      
      if (error.response?.status === 403) {
        setError('Access denied. You do not have admin privileges.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to backend server. Make sure it\'s running on port 5001.');
      } else {
        setError('Failed to fetch admin data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTour = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Convert price and duration to numbers and ensure highlights is an array
      const tourData = {
        ...newTour,
        price: Number(newTour.price),
        duration: Number(newTour.duration),
        highlights: Array.isArray(newTour.highlights) ? newTour.highlights : []
      };
      
      const response = await axios.post('http://localhost:5001/api/admin/tours', tourData, config);
      
      setTours([...tours, response.data]);
      setNewTour({
        name: '',
        destination: '',
        description: '',
        price: '',
        duration: '',
        image: '',
        category: 'adventure',
        includes: ['Accommodation', 'Guided Tours'],
        highlights: []
      });
      setSuccessMessage('Tour created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Tour creation error:', error);
      alert('Error creating tour: ' + (error.response?.data?.message || error.message));
    }
  };

  // DELETE Tour function
  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.delete(`http://localhost:5001/api/admin/tours/${tourId}`, config);
      
      // Remove the tour from the local state
      setTours(tours.filter(tour => tour._id !== tourId));
      setSuccessMessage('Tour deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Delete tour error:', error);
      alert('Error deleting tour: ' + (error.response?.data?.message || error.message));
    }
  };

  // EDIT Tour functions
  const handleEditTour = (tour) => {
    setEditingTour(tour._id);
    setEditTourData({
      name: tour.name,
      destination: tour.destination,
      description: tour.description,
      price: tour.price,
      duration: tour.duration,
      image: tour.image,
      category: tour.category,
      highlights: tour.highlights
    });
  };

  const handleUpdateTour = async (tourId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const tourData = {
        ...editTourData,
        price: Number(editTourData.price),
        duration: Number(editTourData.duration),
        highlights: Array.isArray(editTourData.highlights) ? editTourData.highlights : []
      };

      const response = await axios.put(`http://localhost:5001/api/admin/tours/${tourId}`, tourData, config);
      
      // Update the tour in the local state
      setTours(tours.map(tour => tour._id === tourId ? response.data : tour));
      setEditingTour(null);
      setSuccessMessage('Tour updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Update tour error:', error);
      alert('Error updating tour: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingTour(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTourData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditHighlightsChange = (e) => {
    const highlightsArray = e.target.value
      .split(',')
      .map(item => item.trim())
      .filter(item => item);
    
    setEditTourData(prev => ({
      ...prev,
      highlights: highlightsArray
    }));
  };

  // User management functions
  const handleToggleAdmin = async (userId, isCurrentlyAdmin) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.patch(
        `http://localhost:5001/api/admin/users/${userId}/admin`,
        { isAdmin: !isCurrentlyAdmin },
        config
      );
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isAdmin: !isCurrentlyAdmin } : user
      ));
      
      setSuccessMessage(`Admin status ${!isCurrentlyAdmin ? 'granted' : 'revoked'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Toggle admin error:', error);
      alert('Error updating admin status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.delete(`http://localhost:5001/api/admin/users/${userId}`, config);
      
      // Remove the user from the local state
      setUsers(users.filter(user => user._id !== userId));
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Error deleting user: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add this function near other CRUD functions
  const handleViewProfile = (user) => {
    // Store user data temporarily to pass to profile view
    sessionStorage.setItem('viewingUser', JSON.stringify(user));
    window.location.href = `/admin/user-profile/${user._id}`;
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            {successMessage}
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'bookings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'tours' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Tours ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab('create-tour')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'create-tour' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Create Tour
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Users Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Username</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Admin</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                    <th className="px-4 py-2 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{user.username}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        {user.isAdmin ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Yes</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(user)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                          className={`text-xs px-2 py-1 rounded ${
                            user.isAdmin 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Bookings Management</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-600">No bookings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-left">Tour</th>
                      <th className="px-4 py-2 text-left">Persons</th>
                      <th className="px-4 py-2 text-left">Total Price</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {booking.userId?.username || 'Unknown User'}
                        </td>
                        <td className="px-4 py-2">
                          {booking.tourId?.name || 'Unknown Tour'}
                        </td>
                        <td className="px-4 py-2">{booking.persons}</td>
                        <td className="px-4 py-2">${booking.totalPrice}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tours Tab - Enhanced with CRUD operations */}
        {activeTab === 'tours' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Tours Management</h2>
            {tours.length === 0 ? (
              <p className="text-gray-600">No tours found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Tour Name</th>
                      <th className="px-4 py-2 text-left">Destination</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Duration</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Rating</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tours.map(tour => (
                      <tr key={tour._id} className="border-b hover:bg-gray-50">
                        {editingTour === tour._id ? (
                          <>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                name="name"
                                value={editTourData.name}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                name="destination"
                                value={editTourData.destination}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                name="price"
                                value={editTourData.price}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                name="duration"
                                value={editTourData.duration}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <select
                                name="category"
                                value={editTourData.category}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border rounded"
                              >
                                <option value="adventure">Adventure</option>
                                <option value="cultural">Cultural</option>
                                <option value="beach">Beach</option>
                                <option value="luxury">Luxury</option>
                                <option value="family">Family</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">⭐ {tour.rating}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleUpdateTour(tour._id)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm mr-2"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 font-semibold">{tour.name}</td>
                            <td className="px-4 py-2">{tour.destination}</td>
                            <td className="px-4 py-2">${tour.price}</td>
                            <td className="px-4 py-2">{tour.duration} days</td>
                            <td className="px-4 py-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm capitalize">
                                {tour.category}
                              </span>
                            </td>
                            <td className="px-4 py-2">⭐ {tour.rating}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleEditTour(tour)}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTour(tour._id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Tour Tab */}
        {activeTab === 'create-tour' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Create New Tour</h2>
            <form onSubmit={handleCreateTour} className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tour Name"
                value={newTour.name}
                onChange={(e) => setNewTour({...newTour, name: e.target.value})}
                className="p-3 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Destination"
                value={newTour.destination}
                onChange={(e) => setNewTour({...newTour, destination: e.target.value})}
                className="p-3 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newTour.description}
                onChange={(e) => setNewTour({...newTour, description: e.target.value})}
                className="p-3 border rounded md:col-span-2"
                rows="3"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newTour.price}
                onChange={(e) => setNewTour({...newTour, price: e.target.value})}
                className="p-3 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Duration (days)"
                value={newTour.duration}
                onChange={(e) => setNewTour({...newTour, duration: e.target.value})}
                className="p-3 border rounded"
                required
              />
              <select
                value={newTour.category}
                onChange={(e) => setNewTour({...newTour, category: e.target.value})}
                className="p-3 border rounded"
              >
                <option value="adventure">Adventure</option>
                <option value="cultural">Cultural</option>
                <option value="beach">Beach</option>
                <option value="luxury">Luxury</option>
                <option value="family">Family</option>
              </select>
              <input
                type="url"
                placeholder="Image URL"
                value={newTour.image}
                onChange={(e) => setNewTour({...newTour, image: e.target.value})}
                className="p-3 border rounded"
                required
              />
              
              {/* HIGHLIGHTS INPUT FIELD */}
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold">Highlights (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Beach Access, Free Breakfast, Guided Tour"
                  value={newTour.highlights.join(', ')}
                  onChange={(e) => setNewTour({
                    ...newTour, 
                    highlights: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                  })}
                  className="w-full p-3 border rounded"
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple highlights with commas</p>
              </div>

              <button
                type="submit"
                className="md:col-span-2 bg-green-600 text-white py-3 rounded hover:bg-green-700 font-semibold"
              >
                Create Tour
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;