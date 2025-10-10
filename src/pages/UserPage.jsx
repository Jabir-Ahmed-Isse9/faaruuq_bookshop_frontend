import React, { useState, useEffect } from 'react';
import API from '../api'; // ← Import API for real requests

// Components
import Header from '../components/UserHeader';
import Hero from '../components/userHero';
import FeaturedProducts from '../components/featuredProducts';
import CartSidebar from '../components/CartSidebar';
import Footer from '../components/Footer';



const UserPage = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // 🌙 DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await API.get('/api/v1/cart');
        setCartData(res.data);
      } catch (err) {
        console.error("Failed to fetch cart:", err.message);
      }
    };

    fetchCart();
  }, []);

  // Handle Add to Cart
  const handleAddToCart = async (book) => {
    if (isAdding) return;
    if (!book?._id) {
      console.error("Invalid book object:", book);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to add items to cart");
      return;
    }

    setIsAdding(true);

    try {
      const res = await API.post('/api/v1/cart', {
        bookId: book._id,
        qty: 1
      });

      console.log("✅ Added to cart:", res.data);
      setCartData(res.data);
      setCartOpen(true);
      alert(`${book.title} added to cart!`);
    } catch (err) {
      console.error("❌ Add to cart failed:", err.message);
      alert(err.response?.data?.error || "Failed to add item. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleCart = () => setCartOpen(!cartOpen);

  // 🌙 Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        onCartClick={toggleCart} 
        cartItemCount={cartData?.items?.length || 0}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <Hero />
      <FeaturedProducts 
        onAddToCart={handleAddToCart} 
        isAdding={isAdding}
      />
      {/* <ShopByGenre /> */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={toggleCart} 
        cartData={cartData}
      />
     
      <Footer />
    </div>
  );
};

export default UserPage;