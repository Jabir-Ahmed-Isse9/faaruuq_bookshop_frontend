// src/pages/Categories.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import AddCategoryForm from '../components/addCategory';
import UpdateCategoryForm from '../updates/updateCategory';
import axios from 'axios';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 5;

// ✅ Axios setup
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/v1/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter & paginate
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category?.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/api/v1/categories/${id}`);
      toast.success('Category deleted successfully!');
      fetchCategories(); // ✅ Refetch to stay in sync
    } catch (err) {
      console.error("Delete error:", err);
      toast.error('Failed to delete category. It may be in use.');
    }
  };

  // ✅ NEW: Refetch after adding
  const handleAddCategory = async () => {
    try {
      await fetchCategories(); // ✅ Full refresh
      toast.success('🎉 Category added successfully!');
    } catch (err) {
      // fetchCategories already shows error, but we still close modal
      console.error('Refetch failed after add:', err);
    } finally {
      setShowAddForm(false); // ✅ Close modal immediately
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Categories Management</h2>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Slug</th>
                <th className="px-6 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCategories.map(category => (
                <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 max-w-xs break-words">{category.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{category.slug}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-2 rounded text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-2 rounded text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCategories.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No categories match your search.' : 'No categories found.'}
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
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Add New Category</h3>
            <AddCategoryForm
              onAddCategory={handleAddCategory}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Update Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setEditingCategory(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Edit Category</h3>
            <UpdateCategoryForm
              category={editingCategory}
              onUpdate={(updatedCategory) => {
                setCategories(prev =>
                  prev.map(c => c._id === updatedCategory._id ? updatedCategory : c)
                );
                setEditingCategory(null);
                toast.success('Category updated successfully!');
              }}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;