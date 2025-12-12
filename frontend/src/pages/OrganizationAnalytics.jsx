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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="relative">
          <div className="text-white text-xl animate-pulse">Loading analytics...</div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6 relative overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
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
              <h1 className="text-3xl font-bold text-white">Organization Analytics</h1>
              <div className="absolute -top-1 -right-4">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
          <p className="text-gray-400">Comprehensive performance insights for your team</p>
        </div>

        {/* Time Range Selector with glow effect */}
        <div className="mb-6 flex justify-end animate-fade-in">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="relative bg-gray-800/80 backdrop-blur-sm text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
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
                value={`${parseFloat(analytics.average_working_time || 0).toFixed(0)}min`}
                color="orange"
                index={3}
              />
            </div>

            {/* Grade Distribution with enhanced 3D effect */}
            <div className="animate-float-slow mb-8">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-2xl shadow-black/30 hover:shadow-blue-900/20 transition-all duration-500 hover:border-blue-500/30 hover:translate-y-[-4px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Performance Grade Distribution</h2>
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
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
                          backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(75, 85, 99, 0.5)', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
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
                          className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/30 animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className={`text-3xl font-bold mb-2 animate-pulse ${getGradeColor(grade)}`}>
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
            </div>

            {/* Time Distribution with glowing bars */}
            <div className="animate-float-slow mb-8">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-2xl shadow-black/30 hover:shadow-green-900/20 transition-all duration-500 hover:border-green-500/30 hover:translate-y-[-4px]">
                <h2 className="text-xl font-bold text-white mb-6">Average Time Distribution</h2>
                <div className="space-y-6">
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
            </div>
          </>
        )}

        {/* Employee Performance Comparison */}
        <div className="animate-float-slow">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-2xl shadow-black/30 hover:shadow-purple-900/20 transition-all duration-500 hover:border-purple-500/30 hover:translate-y-[-4px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Employee Performance Trends</h2>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-20 animate-pulse"></div>
                  <Users className="w-5 h-5 text-purple-400 relative" />
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <select
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="relative bg-gray-700/80 backdrop-blur-sm text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 hover:border-purple-500/50 transition-all duration-300"
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedEmployee && employeeTrends.length > 0 ? (
              <div className="space-y-8">
                {/* Trend Chart with glowing effect */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={[...employeeTrends].reverse().slice(-30).map(t => ({
                        date: new Date(t.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        overall: parseFloat(t.overall_score || 0),
                        productivity: parseFloat(t.productivity_score || 0),
                        engagement: parseFloat(t.engagement_score || 0),
                        grade: t.performance_grade
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                        <XAxis dataKey="date" stroke="#9ca3af" strokeOpacity={0.7} />
                        <YAxis stroke="#9ca3af" strokeOpacity={0.7} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(75, 85, 99, 0.5)', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ color: '#fff' }} />
                        <Line 
                          type="monotone" 
                          dataKey="overall" 
                          stroke="url(#overallGradient)" 
                          strokeWidth={3} 
                          name="Overall Score" 
                          dot={{ r: 4, fill: '#3b82f6' }}
                          activeDot={{ r: 8, fill: '#60a5fa' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="productivity" 
                          stroke="url(#productivityGradient)" 
                          strokeWidth={2} 
                          name="Productivity" 
                          strokeDasharray="5 5"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="engagement" 
                          stroke="url(#engagementGradient)" 
                          strokeWidth={2} 
                          name="Engagement" 
                          strokeDasharray="3 3"
                        />
                        <defs>
                          <linearGradient id="overallGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                          <linearGradient id="productivityGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                          </linearGradient>
                          <linearGradient id="engagementGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart for Latest Performance */}
                <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-600/30 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-bold text-white">Latest Performance Breakdown</h3>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  </div>
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
                      <PolarGrid stroke="#374151" strokeOpacity={0.3} />
                      <PolarAngleAxis dataKey="metric" stroke="#9ca3af" strokeOpacity={0.7} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" strokeOpacity={0.7} />
                      <Radar 
                        name="Performance" 
                        dataKey="value" 
                        stroke="url(#radarGradient)" 
                        fill="url(#radarFill)" 
                        fillOpacity={0.6} 
                        strokeWidth={2}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(75, 85, 99, 0.5)', 
                          borderRadius: '12px'
                        }} 
                      />
                      <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 animate-pulse">
                {selectedEmployee ? 'No performance data available for this period' : 'Select an employee to view their performance trends'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, index }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30 hover:border-blue-400/50',
    green: 'from-green-500/20 to-green-600/10 text-green-400 border-green-500/30 hover:border-green-400/50',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30 hover:border-purple-400/50',
    orange: 'from-orange-500/20 to-orange-600/10 text-orange-400 border-orange-500/30 hover:border-orange-400/50'
  };

  const glowColors = {
    blue: 'hover:shadow-blue-500/20',
    green: 'hover:shadow-green-500/20',
    purple: 'hover:shadow-purple-500/20',
    orange: 'hover:shadow-orange-500/20'
  };

  return (
    <div 
      className={`
        relative bg-gradient-to-br ${colorClasses[color]} 
        backdrop-blur-sm rounded-xl p-6 border 
        transition-all duration-500 hover:duration-300
        hover:translate-y-[-8px] hover:scale-[1.02]
        shadow-2xl shadow-black/30 ${glowColors[color]}
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
        <h3 className="text-gray-300 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
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
      text: 'text-green-400'
    },
    red: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-400',
      glow: 'shadow-red-500/30',
      text: 'text-red-400'
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-400',
      glow: 'shadow-blue-500/30',
      text: 'text-blue-400'
    }
  };

  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-white font-semibold">
          {value.toFixed(0)} min <span className="text-gray-400">({percentage.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="relative w-full bg-gray-700/50 backdrop-blur-sm rounded-full h-4 overflow-hidden border border-gray-600/30">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-transparent animate-shimmer"></div>
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
    'A+': 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
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