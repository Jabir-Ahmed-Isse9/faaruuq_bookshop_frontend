import { useState, useEffect, useMemo } from 'react';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import AddCouponForm from '../components/AddCouponForm';
import UpdateCouponForm from '../updates/UpdateCouponForm';

const ITEMS_PER_PAGE = 5;

// ✅✅✅ FIXED: NO TRAILING SPACES + TOKEN INTERCEPTOR
const API = axios.create({
  baseURL:  import.meta.env.VITE_API_URL, // ✅ NO TRAILING SPACES — EVER!
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Inject adminToken (if exists) for protected routes
API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const token = localStorage.getItem('token');

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Handle 401 — auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠ Session expired — redirecting to login...');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false); // ✅ NEW: For spinner

  // Fetch coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await API.get('/api/v1/coupons');
        setCoupons(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError('Failed to load coupons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // ✅ Filter ONLY by code — description does NOT exist in backend!
  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon =>
      coupon?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coupons, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCoupons = filteredCoupons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon? This cannot be undone.")) return;

    try {
      await API.delete(`/api/v1/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c._id !== id));
      setError('');
    } catch (err) {
      console.error("Delete error:", err);
      setError('Failed to delete coupon. It may be in use.');
    }
  };

  // ✅ Handle edit — open modal
  const startEdit = (id) => {
    const coupon = coupons.find(c => c._id === id);
    if (coupon) {
      setEditingCoupon(coupon);
    }
  };

  // ✅ Handle add — updates table immediately
  const handleAddCoupon = async (newCoupon) => {
    setIsAdding(true); // ✅ Show spinner
    try {
      const res = await API.post('/api/v1/coupons', newCoupon);
      setCoupons(prev => [...prev, res.data]);
      setShowAddForm(false);
      setError('');

      // ✅ Success feedback
      alert('Coupon created successfully!'); // Replace with toast later
    } catch (err) {
      console.error("Add coupon error:", err);

      if (err.response?.status === 409) {
        setError('Coupon code already exists. Try another.');
      } else if (err.response?.status === 401) {
        setError('Unauthorized. Admin access required.');
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network connection failed. Please check your internet or backend status.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || 'Invalid coupon data.');
      } else {
        setError('Failed to create coupon. Please try again later.');
      }
    } finally {
      setIsAdding(false); // ✅ Hide spinner
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Coupons Management</h2>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Add New Coupon Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Coupon
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search coupons by code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Code</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Type</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Discount</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Min Subtotal</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCoupons.map(coupon => (
                <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Code */}
                  <td className="px-6 py-4 max-w-xs break-words font-medium text-gray-800 dark:text-white">
                    {coupon.code}
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">
                    {coupon.type}
                  </td>

                  {/* Discount: % or $ */}
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {coupon.type === 'percent'
                      ? `${coupon.value}%`
                      : `$${coupon.value}`
                    }
                  </td>

                  {/* Min Subtotal */}
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    ${coupon.minSubtotal}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      coupon.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(coupon._id)}
                        className="p-2 rounded text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Edit coupon"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="p-2 rounded text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Delete coupon"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCoupons.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No coupons match your search.' : 'No coupons found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* ✅✨ POLISHED ADD COUPON MODAL POPUP */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl transform transition-all duration-300 scale-100 animate-fadeIn">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add New Coupon</h3>
              <AddCouponForm
                onAddCoupon={handleAddCoupon}
                onCancel={() => setShowAddForm(false)}
                isSubmitting={isAdding} // ✅ Pass down for spinner
              />
            </div>
          </div>
        </div>
      )}

      {/* ✅✨ POLISHED UPDATE COUPON MODAL POPUP */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl transform transition-all duration-300 scale-100 animate-fadeIn">
            <button
              onClick={() => setEditingCoupon(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Edit Coupon</h3>
              <UpdateCouponForm
                coupon={editingCoupon}
                onUpdate={(updatedCoupon) => {
                  setCoupons(prev =>
                    prev.map(c => c._id === updatedCoupon._id ? updatedCoupon : c)
                  );
                  setEditingCoupon(null);
                }}
                onCancel={() => setEditingCoupon(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;