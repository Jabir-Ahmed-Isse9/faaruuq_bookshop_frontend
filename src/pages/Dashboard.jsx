import { useState, useEffect, useMemo } from "react";
import API from "../api";
import DashboardCard from "../components/DashboardCard";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  BookOpenIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalRevenue: 0,
    avgProfitMargin: 0,
    topBooksBought: [],
    salesByLanguage: [],
  });
  const [error, setError] = useState(null);

  // ✅ Always call hooks — never conditionally
  const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = [12, 15, 18, 22, 25, 28, 30];

  const salesChartData = useMemo(() => ({
    labels: weeklyLabels,
    datasets: [
      {
        label: "Books Sold (Last 7 Days)",
        data: weeklyData,
        backgroundColor: "rgba(79, 70, 229, 0.7)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
      },
    ],
  }), []);

  const languageLabels = reportData.salesByLanguage.map(l => l.language);
  const languageData = reportData.salesByLanguage.map(l => l.totalOrders);

  const genreChartData = useMemo(() => ({
    labels: languageLabels,
    datasets: [
      {
        data: languageData,
        backgroundColor: [
          "#8b5cf6",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#ec4899",
          "#6366f1",
        ],
      },
    ],
  }), [languageLabels, languageData]);

  // ✅ Fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get("/api/v1/reports");
        setReportData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  const { totalBooks, totalUsers, totalRevenue, avgProfitMargin, topBooksBought } = reportData;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Books" value={totalBooks.toLocaleString()} icon={BookOpenIcon} />
        <DashboardCard title="Total Customers" value={totalUsers.toLocaleString()} icon={UsersIcon} />
        <DashboardCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={CurrencyDollarIcon} />
        <DashboardCard title="Profit Margin" value={`${avgProfitMargin}%`} icon={ArrowTrendingUpIcon} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Weekly Sales Trend</h3>
          <Bar
            key={JSON.stringify(salesChartData)}
            data={salesChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Sales by Language</h3>
          <Doughnut
            key={JSON.stringify(genreChartData)}
            data={genreChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: "right" } },
            }}
          />
        </div>
      </div>

      {/* Top Books */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Top 5 Books (Units Sold)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Book</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Author</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Units Sold</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topBooksBought.map((book, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{book.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{book.author}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{book.totalQty}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">${book.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
