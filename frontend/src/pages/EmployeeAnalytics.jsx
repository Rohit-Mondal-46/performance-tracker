import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../services/api';
import { TrendingUp, Activity, Clock, Target, Award, Zap, ChevronRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export function EmployeeAnalytics() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [hoveredCard, setHoveredCard] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const trendsRes = await employeeAPI.getMyPerformanceTrends(timeRange);

      if (trendsRes.data.success) {
        setTrends(trendsRes.data.data.trends || []);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const avgScore = trends.length > 0 
    ? trends.reduce((sum, t) => sum + parseFloat(t.avg_overall || 0), 0) / trends.length 
    : 0;
  const avgProductivity = trends.length > 0
    ? trends.reduce((sum, t) => sum + parseFloat(t.avg_productivity || 0), 0) / trends.length
    : 0;
  const avgEngagement = trends.length > 0
    ? trends.reduce((sum, t) => sum + parseFloat(t.avg_engagement || 0), 0) / trends.length
    : 0;
  const avgWorkingTime = trends.length > 0
    ? trends.reduce((sum, t) => sum + (parseFloat(t.total_working || 0)), 0) / trends.length
    : 0;

  // Current grade - fetch from latest score
  const currentGrade = trends.length > 0 ? 
    (trends[trends.length - 1].avg_overall >= 90 ? 'A+' :
     trends[trends.length - 1].avg_overall >= 80 ? 'A' :
     trends[trends.length - 1].avg_overall >= 70 ? 'B' :
     trends[trends.length - 1].avg_overall >= 60 ? 'C' :
     trends[trends.length - 1].avg_overall >= 50 ? 'D' : 'F') 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black p-4 md:p-6 overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                Performance Analytics
              </h1>
              <p className="text-gray-400">Real-time insights into your performance trends</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Live Analytics</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex justify-between items-center"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics Period</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <motion.select
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.05 }}
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="bg-gray-900/50 backdrop-blur-sm text-white rounded-xl px-6 py-3 outline-none border border-white/10 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 shadow-2xl shadow-blue-500/10"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </motion.select>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <Target className="w-8 h-8" />, title: "Average Score", value: `${avgScore.toFixed(1)}%`, color: "blue" },
            { icon: <TrendingUp className="w-8 h-8" />, title: "Average Productivity", value: `${avgProductivity.toFixed(1)}%`, color: "green" },
            { icon: <Activity className="w-8 h-8" />, title: "Average Engagement", value: `${avgEngagement.toFixed(1)}%`, color: "purple" },
            { icon: <Clock className="w-8 h-8" />, title: "Average Working Time", value: formatMinutes(avgWorkingTime), color: "orange" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative"
            >
              {/* Particle effect on hover */}
              <AnimatePresence>
                {hoveredCard === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 overflow-hidden rounded-2xl"
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        initial={{
                          x: '50%',
                          y: '50%',
                          scale: 0,
                        }}
                        animate={{
                          x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                          y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1,
                          delay: i * 0.1,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <StatCard
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                color={stat.color}
                index={index}
              />
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl shadow-blue-500/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Performance Trend</h2>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20"
              >
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </motion.div>
            </div>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={[...trends].reverse().slice(-30).map(t => ({
                  date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  overall: parseFloat(t.avg_overall || 0),
                  productivity: parseFloat(t.avg_productivity || 0),
                  engagement: parseFloat(t.avg_engagement || 0)
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#fff', fontWeight: '600' }}
                  />
                  <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="overall" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorOverall)" 
                    name="Overall Score" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="productivity" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProductivity)" 
                    name="Productivity" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEngagement)" 
                    name="Engagement" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">📊</div>
                No performance data available
              </div>
            )}
          </motion.div>

          {/* Current Grade Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-gray-900/40 to-gray-900/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl shadow-purple-500/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Current Grade</h2>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="p-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20"
              >
                <Award className="w-5 h-5 text-purple-400" />
              </motion.div>
            </div>
            {currentGrade ? (
              <div className="flex flex-col items-center justify-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.6
                  }}
                  className={`relative ${getGradeColor(currentGrade)}`}
                >
                  <div className="text-8xl font-bold mb-4 relative">
                    {currentGrade}
                    {/* Glow effect */}
                    <div className="absolute inset-0 blur-3xl opacity-30 bg-current -z-10" />
                  </div>
                </motion.div>
                <div className="text-xl text-gray-400 mb-6 text-center">
                  Latest Score: {parseFloat(trends[trends.length - 1].avg_overall || 0).toFixed(1)}%
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-900/50 rounded-xl p-4 border border-green-500/20"
                  >
                    <div className="text-green-400 text-2xl font-bold">
                      {parseFloat(trends[trends.length - 1]?.avg_productivity || 0).toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">Productivity</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-900/50 rounded-xl p-4 border border-blue-500/20"
                  >
                    <div className="text-blue-400 text-2xl font-bold">
                      {parseFloat(trends[trends.length - 1]?.avg_engagement || 0).toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">Engagement</div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">🎓</div>
                No grade data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ y: -4 }}
          className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 shadow-2xl shadow-green-500/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Productivity vs Engagement</h2>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-lg bg-gradient-to-r from-green-600/20 to-emerald-600/20"
            >
              <PieChartIcon className="w-5 h-5 text-green-400" />
            </motion.div>
          </div>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[...trends].reverse().slice(-14).map(t => ({
                date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                productivity: parseFloat(t.avg_productivity || 0),
                engagement: parseFloat(t.avg_engagement || 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" domain={[0, 100]} fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
                <Bar 
                  dataKey="productivity" 
                  fill="#10b981" 
                  name="Productivity" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="engagement" 
                  fill="#3b82f6" 
                  name="Engagement" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">⚖️</div>
              No comparison data available
            </div>
          )}
        </motion.div>

        {/* Time Distribution Analysis */}
        
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, index }) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 text-blue-400 border-blue-500/20',
    green: 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 text-green-400 border-green-500/20',
    purple: 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-400 border-purple-500/20',
    orange: 'bg-gradient-to-br from-orange-600/20 to-amber-600/20 text-orange-400 border-orange-500/20'
  };

  const glowColors = {
    blue: 'shadow-blue-500/20',
    green: 'shadow-green-500/20',
    purple: 'shadow-purple-500/20',
    orange: 'shadow-orange-500/20'
  };

  return (
    <motion.div
      className={`relative backdrop-blur-sm rounded-2xl p-6 border ${colorClasses[color]} shadow-2xl ${glowColors[color]} transition-all duration-300 overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), ${color === 'blue' ? 'rgba(59, 130, 246, 0.1)' : color === 'green' ? 'rgba(16, 185, 129, 0.1)' : color === 'purple' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(249, 115, 22, 0.1)'}, transparent 50%)`
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
          e.currentTarget.style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
        }}
      />
      
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${color === 'blue' ? 'from-blue-600/30 to-cyan-600/30' : color === 'green' ? 'from-green-600/30 to-emerald-600/30' : color === 'purple' ? 'from-purple-600/30 to-pink-600/30' : 'from-orange-600/30 to-amber-600/30'} backdrop-blur-sm`}
      >
        {icon}
      </motion.div>
      <h3 className="text-gray-300 text-sm mb-1 font-medium">{title}</h3>
      <motion.p 
        className="text-3xl font-bold text-white"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
      >
        {value}
      </motion.p>
      
      {/* Floating animation */}
      <motion.div
        className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-10"
        style={{
          background: `conic-gradient(from 0deg, ${color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'purple' ? '#a855f7' : '#f97316'}, transparent 50%)`
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
}

function getGradeColor(grade) {
  const colors = {
    'A+': 'text-gradient bg-gradient-to-r from-green-400 to-emerald-400',
    'A': 'text-gradient bg-gradient-to-r from-green-400 to-emerald-400',
    'B': 'text-gradient bg-gradient-to-r from-blue-400 to-cyan-400',
    'C': 'text-gradient bg-gradient-to-r from-yellow-400 to-amber-400',
    'D': 'text-gradient bg-gradient-to-r from-orange-400 to-red-400',
    'F': 'text-gradient bg-gradient-to-r from-red-400 to-pink-400'
  };
  return colors[grade] || 'text-gray-400';
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