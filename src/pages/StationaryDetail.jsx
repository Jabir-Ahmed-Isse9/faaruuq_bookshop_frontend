// src/pages/StationaryDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import ReviewAPI from '../reviewApi';
import { StarIcon } from '@heroicons/react/24/solid';
import Header from '../components/UserHeader';
import Footer from '../components/Footer';

const StationaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isReviewing, setIsReviewing] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!user;

  // Fetch product and reviews
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/v1/books/${id}`);
        if (res.data.productType !== 'stationary') {
          setError('Item not found');
          return;
        }
        setProduct(res.data);

        // Fetch reviews
        const reviewsRes = await ReviewAPI.getReviewsByBook(id);
        setReviews(reviewsRes);
      } catch (err) {
        console.error("Fetch product error:", err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    try {
      await API.post('/api/v1/cart', { bookId: id, qty: quantity });
      alert(`"${product.title}" added to cart!`);
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;
    try {
      await API.post('/api/v1/cart', { bookId: id, qty: quantity });
      navigate('/checkout');
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please log in to submit a review.");
      return;
    }
    try {
      setIsReviewing(true);
      await ReviewAPI.createReview(id, newReview);
      // Refresh reviews
      const reviewsRes = await ReviewAPI.getReviewsByBook(id);
      setReviews(reviewsRes);
      setNewReview({ rating: 5, comment: '' });
      alert('Thank you for your review!');
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setIsReviewing(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-5 h-5 ${
              i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-700 dark:text-gray-300">Loading product...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Product not found.'}</p>
          <Link
            to="/stationery"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Stationery
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link> /{" "}
          <Link to="/stationery" className="hover:text-blue-600 dark:hover:text-blue-400">Stationery</Link> /{" "}
          <span className="text-gray-900 dark:text-gray-200">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center">
            <img
              src={product.coverUrl || "https://via.placeholder.com/400x500?text=No+Image"}
              alt={product.title}
              className="max-h-96 object-contain"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x500/374151/9ca3af?text=No+Image";
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{product.author}</p>

            <div className="flex items-center gap-3 mb-4">
              {renderStars(product.ratingAvg)}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({product.ratingCount} reviews)
              </span>
            </div>

            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4">
              $ {parseFloat(product.price).toFixed(2)}
            </p>

            {/* ✅ REMOVED: Stock availability message */}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-3 py-1 min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  disabled={quantity >= product.stock || product.stock <= 0}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  product.stock <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-blue-700 text-white hover:bg-blue-800 dark:hover:bg-blue-600'
                }`}
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 py-3 border border-blue-700 text-blue-700 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specs - Language removed ✅ */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Details</h3>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                {product.isbn && <li><span className="font-medium">Model/Code:</span> {product.isbn}</li>}
                {product.pages && <li><span className="font-medium">Pages/Sheets:</span> {product.pages}</li>}
                {/* ✅ Language line removed */}
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>

          {/* Add Review */}
          {isLoggedIn && product.stock > 0 && (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-3">Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`w-6 h-6 ${
                            star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows="3"
                    maxLength="500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isReviewing}
                  className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                >
                  {isReviewing ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{review.user?.name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && <p className="mt-2 text-gray-700 dark:text-gray-300">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default StationaryDetail;