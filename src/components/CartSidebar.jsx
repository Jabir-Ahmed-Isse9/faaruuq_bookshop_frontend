import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import API from '../api';
import { Link } from 'react-router-dom';

const CartSidebar = ({ isOpen, onClose, cartData }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState(''); // ✅ New state for coupon
  const [couponError, setCouponError] = useState(''); // ✅ New state for coupon error

  useEffect(() => {
    if (cartData) {
      setCart(cartData);
      setLoading(false);
      return;
    }

    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, cartData]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/v1/cart');
      setCart(res.data || { items: [], subtotal: 0, total: 0, discount: 0 });
      setError('');
    } catch (err) {
      console.error("❌ Fetch cart error:", err);
      setError('Failed to load cart. Please log in.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Apply Coupon Function
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponError('');
      const res = await API.post('/api/v1/cart/coupon', {
        code: couponCode.trim()
      });
      setCart(res.data);
      alert('Coupon applied successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to apply coupon';
      setCouponError(errorMsg);
      alert(errorMsg);
    }
  };

  const updateQuantity = async (bookId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await API.put('/api/v1/cart/item', { bookId, qty: newQty });
      setCart(res.data);
    } catch (err) {
      alert('Failed to update quantity. Check stock.');
    }
  };

  const removeItem = async (bookId) => {
    if (!window.confirm('Remove this item?')) return;
    try {
      const res = await API.delete(`/api/v1/cart/item/${bookId}`);
      setCart(res.data);
    } catch (err) {
      alert('Failed to remove item.');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Clear entire cart?')) return;
    try {
      await API.delete('/api/v1/cart');
      setCart({ items: [], subtotal: 0, total: 0, discount: 0 });
    } catch (err) {
      alert('Failed to clear cart.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-96 shadow-2xl transform transition-transform duration-500 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-950/20">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300">
              Your Cart ({cart?.items?.length || 0} items)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full p-2 transition"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex-1 p-5 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex-1 p-5 flex items-center justify-center">
              <p className="text-red-600 bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-lg text-center dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Items */}
          {!loading && !error && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 dark:bg-gray-800">
              {cart?.items?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-3 opacity-40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-7H5.4M12 17v-5m-3 0h6"
                    />
                  </svg>
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-1">Add books to see them here.</p>
                </div>
              ) : (
                cart.items.map((item) => {
                  const bookId = item.book?._id || item.book;
                  const title = item.book?.title || item.title || 'Untitled Book';
                  const price = item.book?.price || item.price || 0;

                  return (
                    <div
                      key={bookId}
                      className="flex gap-4 bg-white dark:bg-gray-750 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
                    >
                      <img
                        src={item.book?.coverUrl || "https://via.placeholder.com/300x400/cccccc/666666?text=Book+Cover"}
                        alt={title}
                        className="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 leading-tight line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                          $ {parseFloat(price).toFixed(2)}
                        </p>
                        <div className="flex items-center mt-2 gap-3">
                          <button
                            onClick={() => updateQuantity(bookId, (item.qty || 1) - 1)}
                            disabled={item.qty <= 1}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-5 text-center">
                            {item.qty || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(bookId, (item.qty || 1) + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(bookId)}
                            className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Coupon Section */}
          {/* {!loading && !error && cart && cart.items.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-red-500 text-sm mt-2">{couponError}</p>
              )}
              {cart.discount > 0 && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  ✓ Coupon applied! You saved ETB {parseFloat(cart.discount).toFixed(2)}
                </p>
              )}
            </div>
          )} */}

          {/* Footer */}
          {!loading && !error && cart && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>$ {parseFloat(cart.subtotal || 0).toFixed(2)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-green-600 dark:text-green-400">
                      $ {parseFloat(cart.discount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="flex justify-between font-medium text-gray-800 dark:text-gray-200 border-t pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    $ {parseFloat(cart.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3 rounded-xl hover:from-blue-900 hover:to-blue-950 transition font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={cart.items.length === 0}
              >
                {cart.items.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
              </Link>

              <button
                className="w-full mt-3 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-700 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-sm font-medium"
                onClick={onClose}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;