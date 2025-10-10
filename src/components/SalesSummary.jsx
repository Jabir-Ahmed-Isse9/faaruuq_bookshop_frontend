// pages/SalesSummary.jsx
import { useState, useEffect } from 'react';
import API from '../api'; // Adjust path as needed
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  BookOpenIcon, 
  UsersIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const SalesSummary = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        const res = await API.get('/api/v1/reports');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load sales summary:', err);
        setError('Unable to load sales data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sales Summary</h1>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sales Summary</h1>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const {
    totalRevenue,
    totalProfit,
    avgProfitMargin,
    totalBooks,
    totalUsers,
    totalPaidOrders
  } = data;

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales Summary</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Key financial and operational metrics for your bookstore
        </p>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricCard
          title="Total Revenue"
          value={`$${formatNumber(totalRevenue)}`}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <MetricCard
          title="Total Profit"
          value={`$${formatNumber(totalProfit)}`}
          icon={ArrowTrendingUpIcon}
          color="purple"
        />
        <MetricCard
          title="Profit Margin"
          value={`${avgProfitMargin}%`}
          icon={ArrowTrendingUpIcon}
          color="blue"
        />
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Books"
          value={formatNumber(totalBooks)}
          icon={BookOpenIcon}
          color="gray"
        />
        <MetricCard
          title="Total Customers"
          value={formatNumber(totalUsers)}
          icon={UsersIcon}
          color="gray"
        />
        <MetricCard
          title="Paid Orders"
          value={formatNumber(totalPaidOrders)}
          icon={ShoppingCartIcon}
          color="gray"
        />
      </div>
    </div>
  );
};

// Reusable Metric Card
const MetricCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    blue: 'text-blue-600 dark:text-blue-400',
    gray: 'text-gray-800 dark:text-gray-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${colorClasses[color]}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
          color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
          color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
          'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Icon className={`h-6 w-6 ${
            color === 'green' ? 'text-green-600 dark:text-green-400' :
            color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
            color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            'text-gray-600 dark:text-gray-300'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;
