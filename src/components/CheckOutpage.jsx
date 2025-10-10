// src/pages/CheckOutPage.jsx
import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const CheckOutPage = ({ cartData }) => {
  const navigate = useNavigate();

  // ✅ NEW: Add cart total state
  const [cartTotal, setCartTotal] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    district: '',
    city: '',
    country: 'Somalia',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ NEW: Fetch cart total on mount (if not passed via props)
  useEffect(() => {
    if (cartData?.total) {
      setCartTotal(cartData.total);
      return;
    }

    const fetchCartTotal = async () => {
      try {
        const res = await API.get('/api/v1/cart');
        setCartTotal(res.data.total || 0);
      } catch (err) {
        console.error('Failed to load cart total');
        setCartTotal(0);
      }
    };
    fetchCartTotal();
  }, [cartData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.street ||
      !formData.district ||
      !formData.city
    ) {
      setError('All fields are required.');
      return;
    }

    const phoneRegex = /^(\+?252)?6[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError(
        'Please enter a valid Somali mobile number (e.g., 611234567 or +252611234567)'
      );
      return;
    }

    const normalizedPhone = formData.phone.startsWith('+252')
      ? formData.phone
      : `+252${formData.phone.startsWith('6') ? formData.phone : '6' + formData.phone}`;

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/api/v1/orders', {
        shippingAddress: {
          label: 'Home',
          name: formData.fullName,
          phone: normalizedPhone,
          street: formData.street,
          district: formData.district,
          city: formData.city,
          country: formData.country,
        },
      });

      const orderId = res.data.orderId;
      localStorage.setItem('lastOrderId', orderId);

      const payRes = await API.post(`/api/v1/orders/${orderId}/pay`);

      if (!payRes.data.success) {
        throw new Error(payRes.data.error);
      }

      navigate('/payment-success', {
        state: {
          orderId,
          message: payRes.data.message,
          waafiResponse: payRes.data.waafiResponse,
        },
      });
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err.message || 'Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Complete Your Order
        </h2>

        {/* ✅ NEW: Show cart total */}
        {cartTotal !== null && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total to pay: <span className="font-bold">${parseFloat(cartTotal).toFixed(2)}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="yahye abdullahi abdi"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mobile Number * (Somali format)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="614270702"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="^(\+?252)?6[0-9]{8}$"
              title="Enter Somali mobile number like 611234567 or +252611234567"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Example: 614270702 or +252614270702
            </p>
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="warshadaha street"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District *
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Hamar Weyne"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Mogadishu"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <input type="hidden" name="country" value="Somalia" />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3 rounded-xl hover:from-blue-900 hover:to-blue-950 transition font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </div>
            ) : (
              'Pay Now'
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full mt-3 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-700 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-sm font-medium"
          >
            ← Back to Store
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckOutPage;