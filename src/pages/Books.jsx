// src/pages/Books.jsx

import { useState, useEffect, useMemo } from 'react';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import AddBookForm from './AddBookForm'; // Adjust path as needed
import UpdateBookForm from '../updates/updateBookForm'; // Ensure this also supports new fields
import axios from 'axios';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 5;

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

const Books = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBook, setEditingBook] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const limit = ITEMS_PER_PAGE;
        const skip = (currentPage - 1) * limit;
        let url = `/api/v1/books?limit=${limit}&skip=${skip}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

        const res = await API.get(url);
        setBooks(res.data.books || []);
      } catch (err) {
        toast.error('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [currentPage, searchTerm]);

  const filteredBooks = useMemo(() => {
    if (!searchTerm) return books;
    const term = searchTerm.toLowerCase();
    return books.filter(book =>
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.language?.toLowerCase().includes(term) ||
      book.productType?.toLowerCase().includes(term) ||
      book.status?.toLowerCase().includes(term) ||
      book.description?.toLowerCase().includes(term) ||
      book.categories?.some(cat => cat.name.toLowerCase().includes(term))
    );
  }, [books, searchTerm]);

  const totalBooks = books.length;
  const totalPages = Math.ceil(totalBooks / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/api/v1/books/${id}`);
      setBooks(prev => prev.filter(b => b._id !== id));
      if (currentPage > 1 && paginatedBooks.length === 1) {
        setCurrentPage(prev => prev - 1);
      }
      toast.success('🗑️ Product deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const handleAddBook = async (formDataToSend) => {
    try {
      const res = await API.post('/api/v1/books', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBooks(prev => [res.data, ...prev]);
      setShowAddForm(false);
      setCurrentPage(1);
      toast.success('🎉 Product added successfully!');
    } catch (err) {
      toast.error('Failed to add product. Please check your data.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Products Management</h2>

      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow max-w-md">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by title, author, type, status, or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedBooks.length > 0 ? (
                paginatedBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 max-w-xs truncate">{book.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{book.author}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.productType === 'books' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        book.productType === 'stationary' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {book.productType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">${parseFloat(book.costPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">${parseFloat(book.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{book.stock}</td>
                    <td className="px-4 py-3 text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditingBook(book)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 text-sm">
            <div className="text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{currentPage}</span> of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-white dark:bg-gray-800 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-white dark:bg-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <AddBookForm onSubmit={handleAddBook} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl">
            <button
              onClick={() => setEditingBook(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <UpdateBookForm
              book={editingBook}
              onUpdate={(updated) => {
                setBooks(prev => prev.map(b => (b._id === updated._id ? updated : b)));
                setEditingBook(null);
              }}
              onCancel={() => setEditingBook(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;