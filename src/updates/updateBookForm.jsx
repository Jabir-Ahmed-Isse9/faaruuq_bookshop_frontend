// src/components/UpdateBookForm.jsx

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UpdateBookForm = ({ book, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    title: book.title || '',
    author: book.author || '',
    description: book.description || '',
    price: book.price?.toString() || '',
    costPrice: book.costPrice?.toString() || '',
    stock: book.stock?.toString() || '',
    language: book.language || '',
    productType: book.productType || 'books',
    status: book.status || 'active',
  });
  const [selectedCategories, setSelectedCategories] = useState(
    book.categories?.map(cat => cat._id) || []
  );
  const [categories, setCategories] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(book.coverUrl || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/api/v1/categories');
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        toast.error('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setSelectedCategories(selected);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, author, description, price, costPrice, stock, language, productType, status } = formData;

    if (!title.trim() || !author.trim() || !language.trim() || !productType || !status) {
      toast.error('Title, author, language, product type, and status are required.');
      return;
    }

    const numPrice = parseFloat(price);
    const numCostPrice = parseFloat(costPrice);
    const numStock = parseInt(stock, 10);

    if (isNaN(numPrice) || numPrice < 0) {
      toast.error('Price must be ≥ 0.');
      return;
    }
    if (isNaN(numCostPrice) || numCostPrice < 0) {
      toast.error('Cost Price must be ≥ 0.');
      return;
    }
    if (numCostPrice > numPrice) {
      toast.error('Cost Price cannot be higher than selling price.');
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      toast.error('Stock must be a whole number ≥ 0.');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('title', title.trim());
      payload.append('author', author.trim());
      if (description.trim()) payload.append('description', description.trim());
      payload.append('price', numPrice.toString());
      payload.append('costPrice', numCostPrice.toString());
      payload.append('stock', numStock.toString());
      payload.append('language', language.trim());
      payload.append('productType', productType);
      payload.append('status', status);

      selectedCategories.forEach(catId => payload.append('categories', catId));
      if (coverImage) payload.append('coverImage', coverImage);

      const res = await API.put(`/api/v1/books/${book._id}`, payload);
      onUpdate(res.data);
      onCancel();
      toast.success('✅ Product updated successfully!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to update product.';
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Product</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto pr-1">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Language *</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select</option>
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
                <option value="French">French</option>
                <option value="Somali">Somali</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Product Type *</label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="books">Books</option>
                <option value="stationary">Stationary</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Categories * <span className="text-gray-500">(Select one or more)</span>
              </label>
              {loading ? (
                <p className="mt-1 text-xs text-gray-500">Loading categories...</p>
              ) : (
                <select
                  multiple
                  value={selectedCategories}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md h-24 dark:bg-gray-700 dark:text-white"
                >
                  {categories.length === 0 ? (
                    <option disabled>No categories available</option>
                  ) : (
                    categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Stock</label>
              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-xs text-gray-700 dark:text-gray-300"
              />
              {(previewUrl || book.coverUrl) && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={previewUrl || book.coverUrl}
                    alt="Cover Preview"
                    className="h-16 w-12 object-cover rounded border"
                  />
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => {
                        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                        setCoverImage(null);
                        setPreviewUrl(book.coverUrl);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove New Image
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Update Product
        </button>
      </div>
    </div>
  );
};

export default UpdateBookForm;