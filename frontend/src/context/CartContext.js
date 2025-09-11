import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Custom hook to use cart
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart items:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (tour) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === tour._id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item._id === tour._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...tour, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (tourId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== tourId));
  };

  const updateQuantity = (tourId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(tourId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === tourId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    cartTotal: getCartTotal(),
    cartCount: getCartCount(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Remove any duplicate exports - make sure you only have one export for each