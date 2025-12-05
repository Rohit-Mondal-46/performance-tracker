import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReportViewer } from './ReportViewer';

const mockPersonalData = [
  { date: '2024-01-01', productivity: 82, engagement: 79, hours: 7.2 },
  { date: '2024-01-02', productivity: 86, engagement: 83, hours: 7.8 },
  { date: '2024-01-03', productivity: 84, engagement: 81, hours: 7.5 },
  { date: '2024-01-04', productivity: 89, engagement: 86, hours: 8.1 },
  { date: '2024-01-05', productivity: 87, engagement: 84, hours: 7.6 },
  { date: '2024-01-06', productivity: 91, engagement: 88, hours: 7.9 },
  { date: '2024-01-07', productivity: 89, engagement: 87, hours: 8.0 },
];

export function ProfilePerformance() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up stagger-3">
        <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Personal Reports
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <ReportViewer />
        </div>
      </div>

      <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up stagger-4">
        <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Personal Performance Trend
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPersonalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Productivity"
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up stagger-5">
        <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Detailed Metrics
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weekly Average Productivity
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">87%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weekly Average Engagement
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">84%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Active Hours (This Week)
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">54.6h</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Best Day Performance
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">91%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}