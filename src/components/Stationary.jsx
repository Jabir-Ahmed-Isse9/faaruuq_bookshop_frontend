// src/components/Stationary.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import ReviewAPI from '../reviewApi';
import { StarIcon } from '@heroicons/react/24/solid';
import Header from './UserHeader';
import Footer from './Footer';

const Stationary = ({ onAddToCart, isAdding = false }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!user;

  // Fetch stationary products
  useEffect(() => {
    const fetchStationary = async () => {
      try {
        setLoading(true);
        const url = `/api/v1/books?productType=stationary&limit=50`;
        const res = await API.get(url);

        const activeStationary = (res.data.books || []).filter(
          item => item.status === 'active' && item.productType === 'stationary'
        );

        const productsWithReviews = await Promise.all(
          activeStationary.map(async (item) => {
            try {
              const reviews = await ReviewAPI.getReviewsByBook(item._id);
              const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
              const avg = reviews.length > 0 ? totalRating / reviews.length : 0;
              return {
                ...item,
                ratingAvg: parseFloat(avg.toFixed(1)),
                ratingCount: reviews.length,
              };
            } catch (err) {
              return { ...item, ratingAvg: 0, ratingCount: 0 };
            }
          })
        );
        setProducts(productsWithReviews);
        setFilteredProducts(productsWithReviews);
      } catch (err) {
        console.error("Fetch stationary error:", err);
        setError('Failed to load stationary items.');
      } finally {
        setLoading(false);
      }
    };
    fetchStationary();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const results = products.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.author && item.author.toLowerCase().includes(query))
      );
      setFilteredProducts(results);
    }
  }, [searchQuery, products]);

  const handleRateProduct = async (productId, rating) => {
    if (!isLoggedIn) {
      alert("Please log in to rate this item.");
      return;
    }
    try {
      await ReviewAPI.createReview(productId, { rating });
      const reviews = await ReviewAPI.getReviewsByBook(productId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = reviews.length > 0 ? totalRating / reviews.length : 0;
      setProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, ratingAvg: parseFloat(avg.toFixed(1)), ratingCount: reviews.length }
            : product
        )
      );
      setFilteredProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, ratingAvg: parseFloat(avg.toFixed(1)), ratingCount: reviews.length }
            : product
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to rate item.");
    }
  };

  const renderStars = (productId, avg, count) => {
    const maxStars = 5;
    const filledStars = Math.floor(avg || 0);
    const hasHalfStar = avg && avg % 1 !== 0;
    return (
      <div className="flex items-center gap-1 mt-1">
        {[...Array(maxStars)].map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleRateProduct(productId, i + 1)}
            className="focus:outline-none"
            aria-label={`Rate ${i + 1} stars`}
          >
            <StarIcon
              className={`w-4 h-4 transition-colors ${
                i < filledStars
                  ? 'text-yellow-400'
                  : i === filledStars && hasHalfStar
                  ? 'text-yellow-400'
                  : 'text-gray-400 dark:text-gray-300 hover:text-yellow-300'
              }`}
              fill={i < filledStars || (i === filledStars && hasHalfStar) ? 'currentColor' : 'none'}
              stroke={i >= filledStars && !hasHalfStar ? 'currentColor' : undefined}
              strokeWidth="1.5"
            />
          </button>
        ))}
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          ({count || 0})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-700 dark:text-gray-300">Loading stationary items...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 dark:text-blue-400">
            Featured Stationary
          </h2>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search stationary by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No stationary items found</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              // ✅ UPDATED LINK: /stationery/:id instead of /book/:id
              <Link key={product._id} to={`/stationery/${product._id}`} className="block h-full">
                <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 overflow-hidden h-80 flex flex-col">
                  <div className="h-40 overflow-hidden bg-gray-50 dark:bg-gray-700">
                    <img
                      src={product.coverUrl || "https://via.placeholder.com/300x400?text=No+Image"}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // ✅ FIXED: Removed extra spaces in URL
                        e.target.src = "https://via.placeholder.com/300x400/374151/9ca3af?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-1">
                        {product.author}
                      </p>
                      <p className="text-blue-700 dark:text-blue-400 font-bold text-sm mt-1">
                        $ {parseFloat(product.price).toFixed(2)}
                      </p>
                      {renderStars(product._id, product.ratingAvg, product.ratingCount)}
                    </div>
                    <div
                      className="flex gap-2 mt-2"
                      onClick={(e) => e.preventDefault()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart && onAddToCart(product);
                        }}
                        disabled={isAdding}
                        className="flex-1 bg-blue-700 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 dark:hover:bg-blue-600"
                      >
                        {isAdding ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (product.stock <= 0) return;
                          try {
                            await API.post('/api/v1/cart', { bookId: product._id, qty: 1 });
                            navigate('/checkout');
                          } catch (err) {
                            alert('Failed to add to cart');
                          }
                        }}
                        disabled={product.stock <= 0}
                        className="flex-1 border border-blue-700 text-blue-700 dark:text-blue-400 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Stationary;