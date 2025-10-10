import React, { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import API from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ITEMS_PER_PAGE = 5;

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/api/v1/orders/my');
        console.log('📦 My Orders:', res.data);
        setOrders(res.data || []);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 🔍 Search ONLY by book title (Order ID removed from search)
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter(order =>
      order.items.some(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [orders, searchTerm]);

  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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
      shipped: <TruckIcon className="w-4 h-4" />,
      delivered: <CheckCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[110px] pb-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Orders</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
              <div className="space-y-6">
                {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[110px] pb-10 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Orders</h1>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl mb-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* 🔍 Search — now only by book title */}
          <div className="mb-8 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" 
                aria-hidden="true"
              />
              <input
                type="text"
                aria-label="Search orders by book title"
                placeholder="Search by book title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* 📦 Orders Table — NO ORDER ID COLUMN */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-750">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Items</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </span>
                            <div className="mt-1 space-y-1">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                  {item.title} × {item.qty}
                                </p>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  +{order.items.length - 2} more
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                            $ {order.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-7H5.4M12 17v-5m-3 0h6" />
                          </svg>
                          <h3 className="text-lg font-medium mb-1">
                            {searchTerm ? `No orders found matching "${searchTerm}"` : "You haven't placed any orders yet."}
                          </h3>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try searching with a different book title."
                              : "Start shopping to see your orders here!"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page <span className="font-medium">{currentPage}</span> of {totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else {
                      if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 text-sm rounded-lg flex items-center justify-center transition ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default UserOrders;