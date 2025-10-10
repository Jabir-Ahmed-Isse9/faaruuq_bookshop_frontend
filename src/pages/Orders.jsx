import React, { useState, useEffect, useMemo } from 'react';
import { 
  PencilIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const ITEMS_PER_PAGE = 5;

const API = axios.create({
  baseURL:  import.meta.env.VITE_API_URL,
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
    if (err.response?.status === 401) {
      console.error("Unauthorized: adminToken may be expired or invalid.");
    }
    return Promise.reject(err);
  }
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const limit = ITEMS_PER_PAGE;
        const skip = (currentPage - 1) * limit;
        let url = `/api/v1/orders?limit=${limit}&skip=${skip}`;

        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const res = await API.get(url);
        setOrders(res.data?.orders || []);
        setError('');
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError('Failed to load orders. Please refresh or check admin token.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, searchTerm]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter(order =>
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const startEdit = (order) => setEditingOrder(order);
  const closeEdit = () => setEditingOrder(null);

  const handleUpdateStatus = async (newStatus) => {
    if (!editingOrder) return;

    try {
      const res = await API.put(`/api/v1/orders/${editingOrder._id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === editingOrder._id ? res.data : o));
      closeEdit();
    } catch (err) {
      setError('Failed to update status. Try again.');
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      created: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    const icons = {
      created: <ClockIcon className="w-4 h-4" />,
      paid: <CheckCircleIcon className="w-4 h-4" />,
      failed: <ExclamationCircleIcon className="w-4 h-4" />,
      shipped: <PencilIcon className="w-4 h-4" />,
      delivered: <CheckCircleIcon className="w-4 h-4" />,
      cancelled: <ExclamationCircleIcon className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Orders Management</h2>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow max-w-md w-full">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, order ID, or book..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent"
          />
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Refresh Orders
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Items</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Total</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-mono text-sm">{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      <strong>{order.user?.name || 'Unknown'}</strong>
                      <br /><small className="text-gray-500 dark:text-gray-400">{order.user?.email}</small>
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      <br /><small className="text-gray-500 dark:text-gray-400">
                        {order.items.slice(0, 2).map(i => i.title).join(', ')}
                        {order.items.length > 2 && `... (+${order.items.length - 2})`}
                      </small>
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">$ {parseFloat(order.amount).toFixed(2)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 text-sm">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => startEdit(order)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                        aria-label="Update status"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? `No orders found for "${searchTerm}"` : "No orders available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                  className={`w-8 h-8 rounded text-sm shadow ${
                    currentPage === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
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

      {/* ✅ STATUS UPDATE MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
            <button
              onClick={closeEdit}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Update Order Status
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Order ID:</strong> {editingOrder._id.slice(-6)}<br />
              <strong>Customer:</strong> {editingOrder.user?.name}<br />
              <strong>Current Status:</strong> {editingOrder.status}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {['created', 'paid', 'failed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  className={`p-3 rounded-lg text-sm font-medium transition ${
                    editingOrder.status === status
                      ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  <StatusBadge status={status} />
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeEdit}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;