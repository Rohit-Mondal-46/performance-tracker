import React, { useState, useEffect, useCallback } from 'react';
import { organizationAPI } from '../services/api';
import { TrendingUp, Users, Activity, Clock, Award } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export function OrganizationAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTrends, setEmployeeTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, employeesRes] = await Promise.all([
        organizationAPI.getOrganizationAnalytics(timeRange),
        organizationAPI.getMyEmployees()
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data.analytics);
      }
      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.data.employees);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const fetchEmployeeTrends = useCallback(async () => {
    try {
      const response = await organizationAPI.getEmployeePerformanceTrends(selectedEmployee, timeRange);
      if (response.data.success) {
        setEmployeeTrends(response.data.data.trends);
      }
    } catch (err) {
      console.error('Error fetching employee trends:', err);
    }
  }, [selectedEmployee, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeTrends();
    }
  }, [selectedEmployee, fetchEmployeeTrends]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Organization Analytics</h1>
          <p className="text-gray-400">Comprehensive performance insights for your team</p>
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

        {/* Overall Performance Metrics */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Award className="w-8 h-8" />}
                title="Average Score"
                value={`${parseFloat(analytics.average_score || 0).toFixed(1)}%`}
                color="blue"
              />
              <StatCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="Average Productivity"
                value={`${parseFloat(analytics.average_productivity || 0).toFixed(1)}%`}
                color="green"
              />
              <StatCard
                icon={<Activity className="w-8 h-8" />}
                title="Average Engagement"
                value={`${parseFloat(analytics.average_engagement || 0).toFixed(1)}%`}
                color="purple"
              />
              <StatCard
                icon={<Clock className="w-8 h-8" />}
                title="Avg Working Time"
                value={`${parseFloat(analytics.average_working_time || 0).toFixed(0)}min`}
                color="orange"
              />
            </div>

            {/* Grade Distribution */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Performance Grade Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={['A+', 'A', 'B', 'C', 'D', 'F'].map(grade => {
                        const gradeKey = `grade_${grade.toLowerCase().replace('+', '_plus')}`;
                        return {
                          name: `Grade ${grade}`,
                          value: parseInt(analytics[gradeKey] || 0)
                        };
                      }).filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {['A+', 'A', 'B', 'C', 'D', 'F'].map((grade, index) => (
                        <Cell key={`cell-${index}`} fill={getPieColor(grade)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 content-center">
                  {['A+', 'A', 'B', 'C', 'D', 'F'].map(grade => {
                    const gradeKey = `grade_${grade.toLowerCase().replace('+', '_plus')}`;
                    const count = parseInt(analytics[gradeKey] || 0);
                    const total = parseInt(analytics.total_scores || 1);
                    const percentage = ((count / total) * 100).toFixed(1);
                    
                    return (
                      <div key={grade} className="bg-gray-700 rounded-lg p-4 text-center">
                        <div className={`text-3xl font-bold mb-2 ${getGradeColor(grade)}`}>
                          {count}
                        </div>
                        <div className="text-gray-400 text-sm mb-1">Grade {grade}</div>
                        <div className="text-gray-500 text-xs">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time Distribution */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Average Time Distribution</h2>
              <div className="space-y-4">
                <TimeBar
                  label="Working Time"
                  value={parseFloat(analytics.average_working_time || 0)}
                  total={480}
                  color="green"
                />
                <TimeBar
                  label="Unproductive Time (Idle + Distracted)"
                  value={parseFloat(analytics.average_unproductive_time || 0)}
                  total={480}
                  color="red"
                />
              </div>
            </div>
          </>
        )}

        {/* Employee Performance Comparison */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Employee Performance Trends</h2>
            <select
              value={selectedEmployee || ''}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {selectedEmployee && employeeTrends.length > 0 ? (
            <div className="space-y-6">
              {/* Trend Chart */}
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={[...employeeTrends].reverse().slice(-30).map(t => ({
                  date: new Date(t.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  overall: parseFloat(t.overall_score || 0),
                  productivity: parseFloat(t.productivity_score || 0),
                  engagement: parseFloat(t.engagement_score || 0),
                  grade: t.performance_grade
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={3} name="Overall Score" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="productivity" stroke="#10b981" strokeWidth={2} name="Productivity" />
                  <Line type="monotone" dataKey="engagement" stroke="#a855f7" strokeWidth={2} name="Engagement" />
                </LineChart>
              </ResponsiveContainer>

              {/* Radar Chart for Latest Performance */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Latest Performance Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    {
                      metric: 'Overall',
                      value: parseFloat(employeeTrends[0]?.overall_score || 0)
                    },
                    {
                      metric: 'Productivity',
                      value: parseFloat(employeeTrends[0]?.productivity_score || 0)
                    },
                    {
                      metric: 'Engagement',
                      value: parseFloat(employeeTrends[0]?.engagement_score || 0)
                    }
                  ]}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                    <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              {selectedEmployee ? 'No performance data available for this period' : 'Select an employee to view their performance trends'}
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

function TimeBar({ label, value, total, color }) {
  const percentage = (value / total) * 100;
  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-semibold">{value.toFixed(0)} min ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4">
        <div
          className={`h-4 rounded-full ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
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

function getPieColor(grade) {
  const colors = {
    'A+': '#10b981',
    'A': '#22c55e',
    'B': '#3b82f6',
    'C': '#eab308',
    'D': '#f97316',
    'F': '#ef4444'
  };
  return colors[grade] || '#6b7280';
}
