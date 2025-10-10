// components/DashboardCard.js
import { Fragment } from 'react';

const DashboardCard = ({ title, value, change, positive, icon: Icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{value}</p>
        </div>
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      
      {change !== null && (
        <div className="mt-3 flex items-center">
          <span className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {positive ? 'vs last week' : 'vs last week'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;