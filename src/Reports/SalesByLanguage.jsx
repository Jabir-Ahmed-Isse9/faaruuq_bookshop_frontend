// pages/SalesByLanguage.jsx
import { useState, useEffect } from 'react';
import API from '../api'; // Adjust path as needed
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const SalesByLanguage = () => {
  const [loading, setLoading] = useState(true);
  const [languageData, setLanguageData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLanguageSales = async () => {
      try {
        const res = await API.get('/api/v1/reports');
        setLanguageData(res.data.salesByLanguage || []);
      } catch (err) {
        console.error('Failed to load language sales:', err);
        setError('Unable to load sales by language data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLanguageSales();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sales by Language</h1>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Loading language report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sales by Language</h1>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GlobeAltIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales by Language</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Revenue, profit, and order volume broken down by book language
        </p>
      </div>

      {languageData.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No sales data available by language.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {languageData.map((lang, index) => {
                  const margin = lang.totalRevenue > 0 
                    ? ((lang.totalProfit / lang.totalRevenue) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {lang.language}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        ${lang.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        ${lang.totalProfit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {lang.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesByLanguage;