// src/components/AddCategoryForm.jsx
import { useState, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const AddCategoryForm = ({ onAddCategory, onCancel }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isMounted = useRef(true);

  // Cleanup on unmount
  // (Not strictly needed here since form is short-lived, but safe)
  // useEffect(() => () => { isMounted.current = false; }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setError('Category name is required');
      toast.warning('⚠️ Category name is required!');
      return;
    }

    const slug = trimmedName.toLowerCase().replace(/\s+/g, '-');
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/api/v1/categories', {
        name: trimmedName,
        slug,
      });

      if (response.status === 201) {
        // Notify parent to refetch categories and close modal
        onAddCategory(); // ✅ No argument needed
        setFormData({ name: '' });
        toast.success('🎉 Category added successfully!');
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to add category. Please try again.';

      if (isMounted.current) {
        setError(errorMessage);
        toast.error(`❌ ${errorMessage}`);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Add New Category
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          aria-label="Close form"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="categoryName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Category Name
          </label>
          <input
            id="categoryName"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Science, History, Fiction"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategoryForm;