import React, { useState, useEffect, useCallback, useRef } from 'react';
import { organizationAPI } from '../services/api';
import { TrendingUp, Users, Activity, Clock, Award, Sparkles } from 'lucide-react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const containerRef = useRef(null);

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

  // Mouse move handler for particle effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(employeeSearchQuery.toLowerCase()))
  );

  const handleEmployeeSelect = (empId, empName) => {
    setSelectedEmployee(empId);
    setEmployeeSearchQuery(empName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="text-gray-800 dark:text-white text-xl animate-pulse">Loading analytics...</div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-blue-500 dark:text-blue-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6 relative overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 7}s`,
            }}
          />
        ))}
        {/* Interactive particle glow near cursor */}
        <div
          className="absolute w-64 h-64 bg-blue-500/5 rounded-full blur-3xl transition-all duration-300 ease-out"
          style={{
            left: `${mousePosition.x - 128}px`,
            top: `${mousePosition.y - 128}px`,
            transform: 'translateZ(0)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with floating animation */}
        <div className="mb-8 animate-float-slow">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Analytics</h1>
              <div className="absolute -top-1 -right-4">
                <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive performance insights for your team</p>
        </div>

        {/* Time Range Selector with glow effect */}
        <div className="mb-6 flex justify-end animate-fade-in">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-lg blur opacity-20 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 dark:border-gray-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Overall Performance Metrics with floating cards */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Award className="w-8 h-8" />}
                title="Average Score"
                value={`${parseFloat(analytics.average_score || 0).toFixed(1)}%`}
                color="blue"
                index={0}
              />
              <StatCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="Average Productivity"
                value={`${parseFloat(analytics.average_productivity || 0).toFixed(1)}%`}
                color="green"
                index={1}
              />
              <StatCard
                icon={<Activity className="w-8 h-8" />}
                title="Average Engagement"
                value={`${parseFloat(analytics.average_engagement || 0).toFixed(1)}%`}
                color="purple"
                index={2}
              />
              <StatCard
                icon={<Clock className="w-8 h-8" />}
                title="Avg Working Time"
                value={formatMinutes(analytics.average_working_time)}
                color="orange"
                index={3}
              />
            </div>

            {/* Grade Distribution with enhanced 3D effect */}
            <div className="animate-float-slow mb-8">
              <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-black/10 dark:shadow-black/30 hover:shadow-blue-900/10 dark:hover:shadow-blue-900/20 transition-all duration-500 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:translate-y-[-4px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Grade Distribution</h2>
                  <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={['A+', 'A', 'B', 'C', 'D', 'F'].map(grade => {
                          return {
                            name: `Grade ${grade}`,
                            value: parseInt(analytics.grade_distribution?.[grade] || 0)
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getPieColor(grade)}
                            className="hover:opacity-80 transition-opacity duration-300"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(209, 213, 219, 0.5)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                          color: '#111827'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 content-center">
                    {['A+', 'A', 'B', 'C', 'D', 'F'].map((grade, index) => {
                      const count = parseInt(analytics.grade_distribution?.[grade] || 0);
                      const total = Object.values(analytics.grade_distribution || {}).reduce((sum, val) => sum + parseInt(val || 0), 0) || 1;
                      const percentage = ((count / total) * 100).toFixed(1);
                      
                      return (
                        <div 
                          key={grade} 
                          className="bg-gradient-to-br from-gray-100/80 to-white/80 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-300/30 dark:border-gray-600/30 hover:border-gray-400/50 dark:hover:border-gray-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30 animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className={`text-3xl font-bold mb-2 animate-pulse ${getGradeColor(grade)}`}>
                            {count}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Grade {grade}</div>
                          <div className="text-gray-500 dark:text-gray-500 text-xs">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="animate-float-slow">
              <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-black/10 dark:shadow-black/30 hover:shadow-purple-900/10 dark:hover:shadow-purple-900/20 transition-all duration-500 hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:translate-y-[-4px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employee Performance</h2>
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-full blur opacity-20 dark:opacity-20 animate-pulse"></div>
                      <Users className="w-5 h-5 text-purple-500 dark:text-purple-400 relative" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">({filteredEmployees.length} employees)</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 rounded-lg blur opacity-20 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <input
                      type="text"
                      placeholder="Search by name, email, or department..."
                      value={employeeSearchQuery}
                      onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                      className="relative bg-white text-gray-900 rounded-lg px-4 py-2 pr-10 w-96 outline-none focus:ring-2 focus:ring-purple-500 border border-gray-300 hover:border-purple-500/50 transition-all duration-300 placeholder:text-gray-500"
                    />
                    {employeeSearchQuery && (
                      <button
                        onClick={() => setEmployeeSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Employee Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-700">
                        <th className="text-left text-gray-600 dark:text-gray-400 text-sm font-medium py-3 px-4">Name</th>
                        <th className="text-left text-gray-600 dark:text-gray-400 text-sm font-medium py-3 px-4">Email</th>
                        <th className="text-left text-gray-600 dark:text-gray-400 text-sm font-medium py-3 px-4">Department</th>
                        <th className="text-left text-gray-600 dark:text-gray-400 text-sm font-medium py-3 px-4">Position</th>
                        <th className="text-center text-gray-600 dark:text-gray-400 text-sm font-medium py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp, index) => (
                          <tr 
                            key={emp.id}
                            className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <td className="py-4 px-4">
                              <div className="text-gray-900 dark:text-white font-medium">{emp.name}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-gray-600 dark:text-gray-300 text-sm">{emp.email}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-gray-600 dark:text-gray-300 text-sm">{emp.department || 'N/A'}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-gray-600 dark:text-gray-300 text-sm">{emp.position || 'N/A'}</div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => handleEmployeeSelect(emp.id, emp.name)}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 dark:from-purple-600 dark:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                              >
                                View Trends
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center">
                            <div className="text-gray-600 dark:text-gray-400">
                              {employeeSearchQuery ? `No employees found matching "${employeeSearchQuery}"` : 'No employees available'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Performance Trends Modal */}
        {selectedEmployee && (
          <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in pl-64"
            onClick={() => setSelectedEmployee(null)}
          >
            <div 
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Performance Trends</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedEmployee.name}</p>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {employeeTrends.length > 0 ? (
                  <div className="space-y-6">
                    {/* Performance Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-600/20 dark:to-blue-700/10 backdrop-blur-sm rounded-xl p-5 border border-blue-400/30 dark:border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Current Score</span>
                          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {parseFloat(employeeTrends[0]?.overall_score || 0).toFixed(1)}%
                        </div>
                        <div className={`text-sm font-medium px-2 py-1 rounded-lg inline-block ${
                          employeeTrends[0]?.performance_grade === 'A+' || employeeTrends[0]?.performance_grade === 'A' 
                            ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                            : employeeTrends[0]?.performance_grade === 'B' 
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                            : employeeTrends[0]?.performance_grade === 'C'
                            ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                            : 'bg-red-500/20 text-red-700 dark:text-red-300'
                        }`}>
                          Grade {employeeTrends[0]?.performance_grade}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-600/20 dark:to-green-700/10 backdrop-blur-sm rounded-xl p-5 border border-green-400/30 dark:border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-700 dark:text-green-300 text-sm font-medium">Avg Productivity</span>
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {(employeeTrends.reduce((sum, t) => sum + parseFloat(t.productivity_score || 0), 0) / employeeTrends.length).toFixed(1)}%
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          Best: {Math.max(...employeeTrends.map(t => parseFloat(t.productivity_score || 0))).toFixed(1)}%
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-600/20 dark:to-purple-700/10 backdrop-blur-sm rounded-xl p-5 border border-purple-400/30 dark:border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">Avg Engagement</span>
                          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {(employeeTrends.reduce((sum, t) => sum + parseFloat(t.engagement_score || 0), 0) / employeeTrends.length).toFixed(1)}%
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                          Best: {Math.max(...employeeTrends.map(t => parseFloat(t.engagement_score || 0))).toFixed(1)}%
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-600/20 dark:to-orange-700/10 backdrop-blur-sm rounded-xl p-5 border border-orange-400/30 dark:border-orange-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-orange-700 dark:text-orange-300 text-sm font-medium">Active Days</span>
                          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {employeeTrends.length}
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">
                          {timeRange} day period
                        </div>
                      </div>
                    </div>

                    {/* Combined Performance & Time Chart */}
                    <div className="bg-gray-100/80 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/30">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Performance & Working Time Trends</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Daily scores and working hours over time</p>
                      </div>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={[...employeeTrends].reverse().slice(-30).map(t => ({
                          date: new Date(t.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          overall: parseFloat(t.overall_score || 0),
                          productivity: parseFloat(t.productivity_score || 0),
                          engagement: parseFloat(t.engagement_score || 0),
                          workingHours: (parseFloat(t.working_total || 0) / 60).toFixed(1),
                          grade: t.performance_grade
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" strokeOpacity={0.3} />
                          <XAxis dataKey="date" stroke="#6b7280" strokeOpacity={0.7} fontSize={12} />
                          <YAxis yAxisId="left" stroke="#6b7280" strokeOpacity={0.7} domain={[0, 100]} fontSize={12} />
                          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" strokeOpacity={0.7} fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(209, 213, 219, 0.5)',
                              borderRadius: '12px',
                              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                              color: '#111827'
                            }}
                            labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '8px' }}
                          />
                          <Legend wrapperStyle={{ color: '#374151' }} />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="overall" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            name="Overall Score (%)" 
                            dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e3a8a' }}
                            activeDot={{ r: 7, fill: '#60a5fa' }}
                          />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="productivity" 
                            stroke="#10b981" 
                            strokeWidth={2} 
                            name="Productivity (%)" 
                            strokeDasharray="5 5"
                            dot={{ r: 4, fill: '#10b981' }}
                          />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="engagement" 
                            stroke="#a855f7" 
                            strokeWidth={2} 
                            name="Engagement (%)" 
                            strokeDasharray="3 3"
                            dot={{ r: 4, fill: '#a855f7' }}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="workingHours" 
                            stroke="#f59e0b" 
                            strokeWidth={2} 
                            name="Working Hours" 
                            dot={{ r: 4, fill: '#f59e0b' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Daily Performance Breakdown */}
                    <div className="bg-gray-100/80 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/30">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Recent Daily Performance</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days detailed breakdown</p>
                      </div>
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {[...employeeTrends].slice(0, 7).map((day, index) => (
                          <div 
                            key={index}
                            className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-300/50 dark:border-gray-600/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="text-gray-900 dark:text-white font-semibold">
                                  {new Date(day.score_date).toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                  day.performance_grade === 'A+' || day.performance_grade === 'A' 
                                    ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30' 
                                    : day.performance_grade === 'B' 
                                    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                    : day.performance_grade === 'C'
                                    ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                                }`}>
                                  {day.performance_grade}
                                </div>
                              </div>
                              <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                {parseFloat(day.overall_score || 0).toFixed(1)}%
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="bg-gray-200/50 dark:bg-gray-900/50 rounded-lg p-3">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Productivity</div>
                                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                  {parseFloat(day.productivity_score || 0).toFixed(1)}%
                                </div>
                              </div>
                              <div className="bg-gray-200/50 dark:bg-gray-900/50 rounded-lg p-3">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Engagement</div>
                                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                  {parseFloat(day.engagement_score || 0).toFixed(1)}%
                                </div>
                              </div>
                              <div className="bg-gray-200/50 dark:bg-gray-900/50 rounded-lg p-3">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Working Time</div>
                                <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                  {formatMinutes(day.working_total)}
                                </div>
                              </div>
                              <div className="bg-gray-200/50 dark:bg-gray-900/50 rounded-lg p-3">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Time</div>
                                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                  {formatMinutes(day.grand_total)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    <div className="text-6xl mb-4">📊</div>
                    <p>No performance data available for this period</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, index }) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-400/30 dark:border-blue-500/30 hover:border-blue-500/50 dark:hover:border-blue-400/50',
    green: 'from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 text-green-600 dark:text-green-400 border-green-400/30 dark:border-green-500/30 hover:border-green-500/50 dark:hover:border-green-400/50',
    purple: 'from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-400/30 dark:border-purple-500/30 hover:border-purple-500/50 dark:hover:border-purple-400/50',
    orange: 'from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-orange-600/10 text-orange-600 dark:text-orange-400 border-orange-400/30 dark:border-orange-500/30 hover:border-orange-500/50 dark:hover:border-orange-400/50'
  };

  const glowColors = {
    blue: 'hover:shadow-blue-500/20 dark:hover:shadow-blue-500/20',
    green: 'hover:shadow-green-500/20 dark:hover:shadow-green-500/20',
    purple: 'hover:shadow-purple-500/20 dark:hover:shadow-purple-500/20',
    orange: 'hover:shadow-orange-500/20 dark:hover:shadow-orange-500/20'
  };

  return (
    <div 
      className={`
        relative bg-gradient-to-br ${colorClasses[color]} 
        backdrop-blur-sm rounded-xl p-6 border 
        transition-all duration-500 hover:duration-300
        hover:translate-y-[-8px] hover:scale-[1.02]
        shadow-2xl shadow-black/10 dark:shadow-black/30 ${glowColors[color]}
        animate-float
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-current/5 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-lg mb-4 bg-gradient-to-br from-current/10 to-transparent`}>
          {icon}
        </div>
        <h3 className="text-gray-600 dark:text-gray-300 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function TimeBar({ label, value, total, color }) {
  const percentage = (value / total) * 100;
  const colorClasses = {
    green: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-400',
      glow: 'shadow-green-500/30',
      text: 'text-green-600 dark:text-green-400'
    },
    red: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-400',
      glow: 'shadow-red-500/30',
      text: 'text-red-600 dark:text-red-400'
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-400',
      glow: 'shadow-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400'
    }
  };

  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
        <span className="text-gray-900 dark:text-white font-semibold">
          {value.toFixed(0)} min <span className="text-gray-500 dark:text-gray-400">({percentage.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="relative w-full bg-gray-300/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full h-4 overflow-hidden border border-gray-400/30 dark:border-gray-600/30">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-transparent dark:from-gray-600/20 dark:to-transparent animate-shimmer"></div>
        <div
          className={`
            relative h-4 rounded-full ${colorClasses[color].bg}
            transition-all duration-1000 ease-out group-hover:shadow-lg ${colorClasses[color].glow}
            group-hover:h-5
          `}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
        </div>
        {/* Glowing dot at the end */}
        <div 
          className={`absolute top-1/2 w-2 h-2 rounded-full ${colorClasses[color].bg} -translate-y-1/2 shadow-lg ${colorClasses[color].glow} animate-pulse`}
          style={{ left: `${Math.min(percentage, 100)}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  );
}

function getGradeColor(grade) {
  const colors = {
    'A+': 'text-green-600 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)] dark:text-green-400 dark:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
    'A': 'text-green-600 dark:text-green-400',
    'B': 'text-blue-600 dark:text-blue-400',
    'C': 'text-yellow-600 dark:text-yellow-400',
    'D': 'text-orange-600 dark:text-orange-400',
    'F': 'text-red-600 dark:text-red-400'
  };
  return colors[grade] || 'text-gray-600 dark:text-gray-400';
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

function formatMinutes(minutes) {
  const totalMinutes = parseInt(minutes || 0);
  if (totalMinutes < 60) {
    return `${totalMinutes}min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return `${hours}hr`;
  }
  return `${hours}hr ${mins}min`;
}