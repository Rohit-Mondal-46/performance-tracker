import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../services/api';
import { TrendingUp, Activity, Clock, Target, Award } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

export function EmployeeAnalytics() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const trendsRes = await employeeAPI.getPerformanceTrends(timeRange);

      if (trendsRes.data.success) {
        setTrends(trendsRes.data.data.trends);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  // Calculate statistics
  const avgScore = trends.length > 0 
    ? trends.reduce((sum, t) => sum + parseFloat(t.overall_score || 0), 0) / trends.length 
    : 0;
  const avgProductivity = trends.length > 0
    ? trends.reduce((sum, t) => sum + parseFloat(t.productivity_score || 0), 0) / trends.length
    : 0;
  const avgEngagement = trends.length > 0
    ? trends.reduce((sum, t) => sum + parseFloat(t.engagement_score || 0), 0) / trends.length
    : 0;
  const avgWorkingTime = trends.length > 0
    ? trends.reduce((sum, t) => sum + parseFloat(t.working_time || 0), 0) / trends.length
    : 0;

  // Current grade (latest performance)
  const currentGrade = trends.length > 0 ? trends[0].performance_grade : null;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Performance Analytics</h1>
          <p className="text-gray-400">Detailed insights into your performance trends and progress</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex justify-end">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Target className="w-8 h-8" />}
            title="Average Score"
            value={`${avgScore.toFixed(1)}%`}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Average Productivity"
            value={`${avgProductivity.toFixed(1)}%`}
            color="green"
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            title="Average Engagement"
            value={`${avgEngagement.toFixed(1)}%`}
            color="purple"
          />
          <StatCard
            icon={<Clock className="w-8 h-8" />}
            title="Avg Working Time"
            value={`${avgWorkingTime.toFixed(0)}min`}
            color="orange"
          />
        </div>

        {/* Performance Trend Chart */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Performance Trend Over Time</h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={[...trends].reverse().slice(-30).map(t => ({
                date: new Date(t.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                overall: parseFloat(t.overall_score || 0),
                productivity: parseFloat(t.productivity_score || 0),
                engagement: parseFloat(t.engagement_score || 0),
                grade: t.performance_grade
              }))}>
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="overall" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOverall)" name="Overall Score" />
                <Area type="monotone" dataKey="productivity" stroke="#10b981" fillOpacity={1} fill="url(#colorProductivity)" name="Productivity" />
                <Area type="monotone" dataKey="engagement" stroke="#a855f7" fillOpacity={1} fill="url(#colorEngagement)" name="Engagement" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No performance data available for this period
            </div>
          )}
        </div>

        {/* Current Grade Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Current Performance Grade</h2>
          {currentGrade ? (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className={`text-9xl font-bold mb-4 ${getGradeColor(currentGrade)}`}>
                  {currentGrade}
                </div>
                <div className="text-2xl text-gray-400 mb-2">Your Current Grade</div>
                <div className="text-lg text-gray-500">
                  Based on latest performance score: {parseFloat(trends[0].overall_score || 0).toFixed(1)}%
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-green-400 text-2xl font-bold">
                      {parseFloat(trends[0].productivity_score || 0).toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">Productivity</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-blue-400 text-2xl font-bold">
                      {parseFloat(trends[0].engagement_score || 0).toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No grade data available
            </div>
          )}
        </div>

        {/* Detailed Performance Metrics */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Productivity vs Engagement Comparison</h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={[...trends].reverse().slice(-14).map(t => ({
                date: new Date(t.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                productivity: parseFloat(t.productivity_score || 0),
                engagement: parseFloat(t.engagement_score || 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="productivity" fill="#10b981" name="Productivity" radius={[8, 8, 0, 0]} />
                <Bar dataKey="engagement" fill="#3b82f6" name="Engagement" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No performance data available
            </div>
          )}
        </div>

        {/* Time Distribution Analysis */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Time Distribution Analysis</h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={[...trends].reverse().slice(-10).map(t => ({
                  date: new Date(t.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  working: parseFloat(t.working_time || 0),
                  unproductive: parseFloat(t.unproductive_time || 0)
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="date" type="category" stroke="#9ca3af" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="working" stackId="a" fill="#10b981" name="Working Time (min)" />
                <Bar dataKey="unproductive" stackId="a" fill="#ef4444" name="Unproductive Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No time distribution data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function getGradeColor(grade) {
  const colors = {
    'A+': 'text-green-400',
    'A': 'text-green-400',
    'B': 'text-blue-400',
    'C': 'text-yellow-400',
    'D': 'text-orange-400',
    'F': 'text-red-400'
  };
  return colors[grade] || 'text-gray-400';
}
