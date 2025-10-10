import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import ReviewAPI from '../reviewApi';
import { StarIcon } from '@heroicons/react/24/solid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookDetail = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await API.get(`/api/v1/books/${id}`);
        const bookData = res.data;

        const reviews = await ReviewAPI.getReviewsByBook(bookData._id);
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = reviews.length > 0 ? totalRating / reviews.length : 0;

        setBook({
          ...bookData,
          ratingAvg: parseFloat(avg.toFixed(1)),
          ratingCount: reviews.length,
          reviews
        });
      } catch (err) {
        setError('Book not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleAddToCart = async () => {
    if (!book || book.stock <= 0) return;
    setIsAdding(true);
    try {
      await API.post('/api/v1/cart', { bookId: book._id, qty: quantity });
      if (onAddToCart) onAddToCart(book);
      toast.success('Added to cart successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!book || book.stock <= 0) return;
    try {
      await API.post('/api/v1/cart', { bookId: book._id, qty: quantity });
      navigate('/checkout');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please log in to submit a review.');
      return;
    }
    if (!book || book.stock <= 0) {
      toast.error('You must purchase this book to review it.');
      return;
    }
    setIsSubmitting(true);
    try {
      await ReviewAPI.createReview(book._id, newReview);
      const reviews = await ReviewAPI.getReviewsByBook(book._id);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = reviews.length > 0 ? totalRating / reviews.length : 0;
      setBook(prev => ({
        ...prev,
        ratingAvg: parseFloat(avg.toFixed(1)),
        ratingCount: reviews.length,
        reviews
      }));
      setNewReview({ rating: 5, comment: '' });
      toast.success('Thank you for your review!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="animate-pulse flex flex-col md:flex-row gap-6">
          <div className="bg-gray-200 dark:bg-gray-700 w-full md:w-1/2 h-96 rounded-xl" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>;

  if (!book) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />

      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        ← Back to Books
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex items-center justify-center">
          <img
            src={book.coverUrl || 'https://via.placeholder.com/400x600?text=No+Cover'}
            alt={book.title}
            className="w-full max-w-xs h-auto object-contain"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x600/374151/9ca3af?text=No+Image';
            }}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">by {book.author}</p>

          <div className="flex items-center mt-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(book.ratingAvg)
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-500'
                }`}
                fill={i < Math.floor(book.ratingAvg) ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            ))}
            <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">
              {book.ratingAvg?.toFixed(1)} ({book.ratingCount} reviews)
            </span>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              ${parseFloat(book.price).toFixed(2)}
            </p>
          </div>

          <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
            <p><span className="font-medium">Language:</span> {book.language}</p>
            {book.pages && <p><span className="font-medium">Pages:</span> {book.pages}</p>}
            {book.isbn && <p><span className="font-medium">ISBN:</span> {book.isbn}</p>}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
              {book.description || 'No description available.'}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                −
              </button>
              <span className="px-4 py-1 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => Math.min(book.stock, prev + 1))}
                disabled={quantity >= book.stock || book.stock <= 0}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/30 transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={book.stock <= 0 || isAdding}
              className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 dark:hover:bg-blue-600"
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={book.stock <= 0}
              className="flex-1 border border-blue-700 text-blue-700 dark:text-blue-400 py-2.5 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-300 dark:border-gray-700 pt-6">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

        {isLoggedIn && book.stock > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-3">Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                      aria-label={`Rate ${star} stars`}
                    >
                      <StarIcon
                        className={`w-6 h-6 ${
                          star <= newReview.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50 text-sm font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {book.reviews && book.reviews.length > 0 ? (
          book.reviews.map((r) => (
            <div key={r._id} className="border-b border-gray-200 dark:border-gray-700 py-3 text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">{r.userName}</p>
              <p className="text-yellow-400">{'★'.repeat(r.rating)}</p>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{r.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
