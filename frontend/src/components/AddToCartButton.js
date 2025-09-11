import React from 'react';
import { useCart } from '../context/CartContext';

const AddToCartButton = ({ tour }) => {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(tour)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Add to Cart
    </button>
  );
};

export default AddToCartButton;