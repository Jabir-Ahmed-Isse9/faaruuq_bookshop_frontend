import React, { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const ITEMS_PER_PAGE = 10;

// Axios instance with adminToken
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(config => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) console.error("Unauthorized: adminToken may be expired or invalid.");
    return Promise.reject(err);
  }
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/v1/users');
      setUsers(res.data || []);
      setError('');
    } catch (err) {
      console.error("Fetch users error:", err);
      setError('Failed to load users. Please refresh or check admin token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = page => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const startEditRole = user => setEditingUser(user);
  const closeEditRole = () => setEditingUser(null);
  const confirmDelete = user => setDeletingUser(user);
  const cancelDelete = () => setDeletingUser(null);

  const handleUpdateRole = async (newRole) => {
    if (!editingUser) return;
    try {
      const res = await API.put(`/api/v1/users/${editingUser._id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === editingUser._id ? res.data : u));
      closeEditRole();
    } catch (err) { setError('Failed to update role. Try again.'); }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    if (!window.confirm(`Are you sure you want to delete ${deletingUser.name}?`)) return;
    try {
      await API.delete(`/api/v1/users/${deletingUser._id}`);
      setUsers(prev => prev.filter(u => u._id !== deletingUser._id));
      cancelDelete();
    } catch (err) { setError('Failed to delete user.'); }
  };

  const RoleBadge = ({ role }) => {
    const colors = {
      admin: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    const labels = { admin: 'Admin', user: 'User' };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
        {role === 'admin' && <CheckIcon className="w-3 h-3" />}
        {labels[role]}
      </span>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-lg text-gray-600 dark:text-gray-300">Loading users...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Management</h2>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Search + Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow max-w-md w-full">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Refresh Users
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Last Login</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 flex items-center gap-3 text-gray-800 dark:text-gray-200">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold uppercase">
                      {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium hover:underline cursor-pointer">{user.name || 'Unknown'}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => startEditRole(user)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                      aria-label="Update role"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(user)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                      aria-label="Delete user"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? `No users found for "${searchTerm}"` : "No users available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{currentPage}</span> of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 disabled:opacity-50 shadow hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={`w-8 h-8 rounded text-sm shadow ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 disabled:opacity-50 shadow hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
            <button
              onClick={closeEditRole}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Update Role for {editingUser.name}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Current role: <strong>{editingUser.role}</strong><br />
              Email: {editingUser.email}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => handleUpdateRole('user')}
                className={`p-3 rounded-lg text-sm font-medium transition ${editingUser.role === 'user' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
              >
                <RoleBadge role="user" />
              </button>
              <button
                onClick={() => handleUpdateRole('admin')}
                className={`p-3 rounded-lg text-sm font-medium transition ${editingUser.role === 'admin' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/30' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
              >
                <RoleBadge role="admin" />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditRole}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
            <button
              onClick={cancelDelete}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Delete User?
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>{deletingUser.name}</strong>?<br />
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
