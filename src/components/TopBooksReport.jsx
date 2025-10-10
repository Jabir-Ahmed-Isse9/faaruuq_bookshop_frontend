// pages/TopBooksReport.jsx
import { useState, useEffect } from 'react';
import API from '../api'; // Adjust path as needed
import { BookOpenIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const TopBooksReport = () => {
  const [loading, setLoading] = useState(true);
  const [topBooksBought, setTopBooksBought] = useState([]);
  const [topBooksByProfit, setTopBooksByProfit] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopBooks = async () => {
      try {
        const res = await API.get('/api/v1/reports');
        setTopBooksBought(res.data.topBooksBought || []);
        setTopBooksByProfit(res.data.topBooksByProfit || []);
      } catch (err) {
        console.error('Failed to load top books:', err);
        setError('Unable to load top books data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopBooks();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Top Books Report</h1>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Loading top books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Top Books Report</h1>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Top Books Report</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare bestsellers by units sold and profitability
        </p>
      </div>

      {/* Top Books by Quantity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              Top Books by Quantity Sold
            </h2>
          </div>
        </div>
        <div className="p-6">
          {topBooksBought.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No sales data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Book</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Author</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Units Sold</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {topBooksBought.map((book, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{book.title}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{book.author}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{book.totalQty}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">${book.totalRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Books by Profit */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">
              Top Books by Profit
            </h2>
          </div>
        </div>
        <div className="p-6">
          {topBooksByProfit.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No profit data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Book</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Author</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Units Sold</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {topBooksByProfit.map((book, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{book.title}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{book.author}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{book.totalQty}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">${book.totalProfit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBooksReport;