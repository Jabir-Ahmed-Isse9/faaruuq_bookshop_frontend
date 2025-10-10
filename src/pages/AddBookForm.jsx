// src/components/AddBookForm.jsx

import { useState, useEffect } from 'react';
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

const AddBookForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '',
    language: '',
    productType: 'books',
    status: 'active',
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/api/v1/categories');
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        toast.error('Failed to load categories.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedCategories(selected);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      setCoverImage(null);
      setPreviewUrl(null);
      return;
    }
    setCoverImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['title', 'author', 'price', 'costPrice', 'stock', 'language', 'productType', 'status'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`"${field}" is required.`);
        return;
      }
    }

    const numPrice = parseFloat(formData.price);
    const numCostPrice = parseFloat(formData.costPrice);
    if (numCostPrice > numPrice) {
      toast.error('Cost Price cannot be higher than selling price.');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
      selectedCategories.forEach((catId) => formDataToSend.append('categories', catId));
      if (coverImage) formDataToSend.append('coverImage', coverImage);

      await onSubmit(formDataToSend);

      setFormData({
        title: '',
        author: '',
        description: '',
        price: '',
        costPrice: '',
        stock: '',
        language: '',
        productType: 'books',
        status: 'active',
      });
      setSelectedCategories([]);
      setCoverImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add product. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Add New Product</h2>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Language *</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Type *</label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="books">Books</option>
                <option value="stationary">Stationary</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categories *</label>
              {loadingCategories ? (
                <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
              ) : (
                <select
                  multiple
                  value={selectedCategories}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg h-32 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-700 dark:text-gray-300"
              />
              {previewUrl && (
                <div className="mt-3 flex items-center gap-4">
                  <img src={previewUrl} alt="Preview" className="h-20 w-16 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setPreviewUrl(null);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Add Product
        </button>
      </div>
    </div>
  );
};

export default AddBookForm;