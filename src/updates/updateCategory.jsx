// src/updates/updateCategory.jsx (or wherever your file is)
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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

const UpdateCategoryForm = ({ category, onUpdate, onCancel }) => {
  // ✅ Initialize with both name and language
  const [formData, setFormData] = useState({
    name: category.name || '',
    language: category.language || '', // ✅ Add language
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync with prop if category changes
  useEffect(() => {
    setFormData({
      name: category.name || '',
      language: category.language || '',
    });
  }, [category]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedLanguage = formData.language.trim();

    // ✅ Validate both fields (adjust if language is optional)
    if (!trimmedName) {
      const msg = 'Category name is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!trimmedLanguage) {
      const msg = 'Language is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    const slug = trimmedName.toLowerCase().replace(/\s+/g, '-');
    setLoading(true);
    setError('');

    try {
      const response = await API.put(`/api/v1/categories/${category._id}`, {
        name: trimmedName,
        slug,
        language: trimmedLanguage, // ✅ Send language to backend
      });

      if (response.status === 200) {
        onUpdate(response.data); // Parent updates local state
        onCancel();
        toast.success('✅ Category updated successfully!');
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update category. Please try again.';
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Edit Category
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
        {/* Name */}
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-indigo-500 focus:border-indigo-500 
                       dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* ✅ Language Input */}
        <div>
          <label
            htmlFor="categoryLanguage"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Language
          </label>
          <input
            id="categoryLanguage"
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
            required
            placeholder="e.g. English, Spanish, French"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-indigo-500 focus:border-indigo-500 
                       dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg 
                       hover:bg-gray-400 transition disabled:opacity-70"
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
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCategoryForm;