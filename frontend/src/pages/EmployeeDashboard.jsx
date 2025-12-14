import React, { useState, useEffect, useRef } from 'react';
import { employeeAPI } from '../services/api';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Clock, 
  Award,
  Calendar,
  BarChart3,
  AlertCircle,
  Sparkles,
  Zap,
  ChevronRight,
  User
} from 'lucide-react';

export function EmployeeDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [performanceScores, setPerformanceScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Initialize particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedX: Math.random() * 0.4 - 0.2,
      speedY: Math.random() * 0.4 - 0.2,
      color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, 0.2)`
    }));
    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.speedX + 100) % 100,
        y: (p.y + p.speedY + 100) % 100
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, scoresRes] = await Promise.all([
        employeeAPI.getDashboard(),
        employeeAPI.getMyCalculatedScores(30)
      ]);

      if (dashboardRes.data.success) {
        setDashboard(dashboardRes.data.data);
      }
      if (scoresRes.data.success) {
        setPerformanceScores(scoresRes.data.data.scores || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-blue-500 rounded-full opacity-20"></div>
          <div className="relative text-white text-xl flex items-center space-x-3">
            <Sparkles className="w-6 h-6 animate-spin" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-xl text-center">{error}</div>
        </div>
      </div>
    );
  }

  const employee = dashboard?.employee || {};
  const metrics = dashboard?.metrics || {};
  const recentPerformance = dashboard?.recentPerformance || {};
  const performanceStatus = dashboard?.performanceStatus || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 overflow-hidden relative">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.size}px ${particle.color}`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${particle.id * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Animation */}
        <div className="mb-8 transform transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50">
                <User className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Welcome, {employee.name}
              </h1>
              <p className="text-gray-400">Track your performance and progress in real-time</p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-slide-right"></div>
        </div>

        {/* Performance Status Banner with Enhanced Animation */}
        {performanceStatus.rating && (
          <div 
            className="rounded-2xl p-6 mb-8 transform transition-all duration-500 hover:scale-[1.02] animate-float"
            style={{ 
              animationDelay: '100ms',
              background: `linear-gradient(135deg, ${getStatusGradientColor(performanceStatus.color)}`,
              boxShadow: `0 20px 60px ${getStatusShadowColor(performanceStatus.color)}, 0 0 40px ${getStatusShadowColor(performanceStatus.color)}/30`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                  <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {performanceStatus.rating.toUpperCase()} PERFORMER
                  </h2>
                  <p className="text-white/90 text-lg">{performanceStatus.message}</p>
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
          </div>
        )}

        {/* Key Metrics with Floating Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: <Target className="w-10 h-10" />,
              title: "Performance Rating",
              value: `${metrics.performanceRating?.toFixed(1) || 0}%`,
              color: "blue",
              trend: metrics.performanceTrend,
              delay: 0
            },
            {
              icon: <TrendingUp className="w-10 h-10" />,
              title: "Productivity Score",
              value: `${metrics.productivityScore?.toFixed(1) || 0}%`,
              color: "green",
              delay: 100
            },
            {
              icon: <Activity className="w-10 h-10" />,
              title: "Engagement Score",
              value: `${metrics.engagementScore?.toFixed(1) || 0}%`,
              color: "purple",
              delay: 200
            },
            {
              icon: <Calendar className="w-10 h-10" />,
              title: "Active Days",
              value: metrics.totalActiveDays || 0,
              color: "orange",
              delay: 300
            }
          ].map((stat, index) => (
            <div
              key={index}
              style={{ animationDelay: `${stat.delay}ms` }}
              className="animate-float"
              onMouseEnter={() => setHoveredCard(`stat-${index}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <AnimatedStatCard
                {...stat}
                isHovered={hoveredCard === `stat-${index}`}
              />
            </div>
          ))}
        </div>

        {/* Employee Info Card with Enhanced Animation */}
        <div 
          className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50 transform transition-all duration-500 hover:scale-[1.01]"
          style={{
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 100px rgba(59, 130, 246, 0.05)'
          }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Employee Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem 
              label="Email" 
              value={employee.email} 
              icon="✉️"
            />
            <InfoItem 
              label="Organization" 
              value={employee.organization_name} 
              icon="🏢"
            />
            <InfoItem 
              label="Department" 
              value={employee.department || 'Not specified'} 
              icon="📊"
            />
            <InfoItem 
              label="Position" 
              value={employee.position || 'Not specified'} 
              icon="💼"
            />
            <InfoItem 
              label="Join Date" 
              value={employee.created_at ? new Date(employee.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A'} 
              icon="📅"
            />
            <InfoItem 
              label="Last Activity" 
              value={metrics.lastActivity ? new Date(metrics.lastActivity).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'} 
              icon="🕒"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Latest Performance Score with Enhanced Animation */}
          {recentPerformance.latestScore && (
            <div 
              className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transform transition-all duration-500 hover:scale-[1.01] group"
              style={{
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 100px rgba(59, 130, 246, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
                    <Zap className="w-6 h-6 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Latest Performance</h2>
                </div>
                <div className="text-sm text-gray-400 group-hover:text-white transition-colors duration-300">
                  {new Date(recentPerformance.latestScore.date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex justify-between items-center mb-8">
                  <div className="text-gray-400 text-sm">Overall Score</div>
                  <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {parseFloat(recentPerformance.latestScore.finalScore).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-6">
                  <EnhancedScoreBar 
                    label="Productivity" 
                    value={parseFloat(recentPerformance.latestScore.productivityScore)} 
                    color="green"
                    icon="⚡"
                  />
                  <EnhancedScoreBar 
                    label="Engagement" 
                    value={parseFloat(recentPerformance.latestScore.engagementScore)} 
                    color="blue"
                    icon="🎯"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Monthly Average with Enhanced Animation */}
          {recentPerformance.monthlyAverage && (
            <div 
              className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transform transition-all duration-500 hover:scale-[1.01]"
              style={{
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 100px rgba(59, 130, 246, 0.05)'
              }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Monthly Average <span className="text-gray-400 text-lg">({recentPerformance.monthlyAverage.daysTracked} days)</span>
                </h2>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50 text-center transform transition-all duration-300 hover:scale-105">
                  <div className="text-gray-400 text-sm mb-2">Overall Average</div>
                  <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                    {parseFloat(recentPerformance.monthlyAverage.finalScore || 0).toFixed(1)}%
                  </div>
                  <div className="text-gray-500 text-sm">Last 30 days</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-gray-700/50 text-center transform transition-all duration-300 hover:scale-105 hover:border-green-500/30 group">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-gray-400 text-sm mb-1">Productivity</div>
                    <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">
                      {parseFloat(recentPerformance.monthlyAverage.productivity || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-gray-700/50 text-center transform transition-all duration-300 hover:scale-105 hover:border-blue-500/30 group">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-gray-400 text-sm mb-1">Engagement</div>
                    <div className="text-2xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      {parseFloat(recentPerformance.monthlyAverage.engagement || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Last 7 Days Performance with Enhanced Visualization */}
        {recentPerformance.last7Days && recentPerformance.last7Days.length > 0 && (
          <div 
            className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50 transform transition-all duration-500 hover:scale-[1.01]"
            style={{
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 100px rgba(59, 130, 246, 0.05)'
            }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Weekly Performance Trend</h2>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {recentPerformance.last7Days.map((day, index) => {
                const score = parseFloat(day.score || 0);
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                const dateNum = new Date(day.date).getDate();
                
                return (
                  <div 
                    key={index} 
                    className="text-center group transform transition-all duration-300 hover:scale-110"
                    onMouseEnter={() => setHoveredCard(`day-${index}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-gray-400 text-xs mb-3">
                      {dayName}
                    </div>
                    <div className="relative">
                      <div 
                        className="w-16 h-32 mx-auto bg-gradient-to-t from-gray-900 to-gray-800 rounded-2xl flex flex-col items-center justify-end p-3 border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300"
                        style={{
                          boxShadow: `inset 0 0 20px ${getScoreGlowColor(score)}/20`,
                          background: `linear-gradient(to top, ${getScoreColor(score)} 0%, ${getScoreColor(score)} ${score}%, transparent ${score}%)`
                        }}
                      >
                        <div className="text-white font-bold text-lg mb-1">
                          {dateNum}
                        </div>
                        <div className="text-white font-semibold text-xl">
                          {score.toFixed(0)}%
                        </div>
                      </div>
                      {hoveredCard === `day-${index}` && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 px-3 py-2 rounded-lg border border-gray-700/50 text-xs text-white whitespace-nowrap">
                          {dayName} {dateNum}: {score.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Performance History with Enhanced Animation */}
        <div 
          className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transform transition-all duration-500 hover:scale-[1.005]"
          style={{
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 100px rgba(59, 130, 246, 0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Performance History</h2>
            </div>
            <div className="text-sm text-gray-400">
              Last 30 days
            </div>
          </div>
          
          {performanceScores.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {performanceScores.map((score, index) => (
                <div 
                  key={score.id} 
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-gray-700/50 transform transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-white font-medium text-lg group-hover:text-blue-300 transition-colors duration-300">
                        {new Date(score.score_date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors duration-300" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${getGradeBadgeColorEnhanced(score.performance_grade)} transform transition-transform duration-300 group-hover:scale-110`}>
                        {score.performance_grade}
                      </span>
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {parseFloat(score.overall_score || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricItem 
                      label="Productivity" 
                      value={`${parseFloat(score.productivity_score || 0).toFixed(1)}%`} 
                      color="green"
                    />
                    <MetricItem 
                      label="Engagement" 
                      value={`${parseFloat(score.engagement_score || 0).toFixed(1)}%`} 
                      color="blue"
                    />
                    <MetricItem 
                      label="Working Time" 
                      value={`${score.working_time}min`} 
                      color="purple"
                    />
                    <MetricItem 
                      label="Total Time" 
                      value={`${score.total_time}min`} 
                      color="orange"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No performance data available yet</p>
                <p className="text-gray-500 text-sm mt-2">Your performance metrics will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(0.5deg); }
        }
        
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slide-right {
          animation: slide-right 1s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
}

function AnimatedStatCard({ icon, title, value, color, trend, isHovered, delay = 0 }) {
  const colorClasses = {
    blue: { 
      bg: 'bg-blue-500/20', 
      text: 'text-blue-400', 
      glow: 'rgba(59, 130, 246, 0.5)',
      iconBg: 'bg-blue-500/10'
    },
    green: { 
      bg: 'bg-green-500/20', 
      text: 'text-green-400', 
      glow: 'rgba(16, 185, 129, 0.5)',
      iconBg: 'bg-green-500/10'
    },
    purple: { 
      bg: 'bg-purple-500/20', 
      text: 'text-purple-400', 
      glow: 'rgba(168, 85, 247, 0.5)',
      iconBg: 'bg-purple-500/10'
    },
    orange: { 
      bg: 'bg-orange-500/20', 
      text: 'text-orange-400', 
      glow: 'rgba(249, 115, 22, 0.5)',
      iconBg: 'bg-orange-500/10'
    }
  };

  const trendColors = {
    improving: 'text-green-400',
    declining: 'text-red-400',
    stable: 'text-gray-400'
  };

  const colors = colorClasses[color];

  return (
    <div 
      className="relative group cursor-pointer"
      style={{
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
        animationDelay: `${delay}ms`
      }}
    >
      {/* Glow effect on hover */}
      <div 
        className={`absolute -inset-0.5 ${colors.bg} rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}
        style={{
          boxShadow: isHovered ? `0 0 40px ${colors.glow}` : 'none'
        }}
      />
      
      {/* Main card */}
      <div 
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-transparent"
        style={{
          boxShadow: isHovered 
            ? `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 60px ${colors.glow}`
            : '0 10px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Icon with particle effect */}
        <div className="relative">
          <div className={`inline-flex p-4 rounded-2xl ${colors.iconBg} mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 border ${colors.text.replace('text-', 'border-')} border-opacity-30`}>
            {icon}
          </div>
          {isHovered && (
            <>
              <div className="absolute top-0 left-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75 delay-300"></div>
            </>
          )}
        </div>
        
        <h3 className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors duration-300">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-bold text-white group-hover:scale-105 transition-transform duration-300">{value}</p>
          {trend && (
            <span className={`text-sm font-medium ${trendColors[trend]} group-hover:scale-110 transition-transform duration-300`}>
              {trend}
            </span>
          )}
        </div>
        
        {/* Animated underline */}
        <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-1000 mt-2"></div>
        
        {/* Floating particles on hover */}
        {isHovered && (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-current rounded-full opacity-50"
                style={{
                  top: `${Math.random() * 60 + 20}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  animation: `float ${Math.random() * 2 + 1}s infinite ease-in-out`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700/50 transform transition-all duration-300 hover:scale-105 hover:border-blue-500/30 group">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors duration-300">{label}</div>
          <div className="text-white font-medium truncate group-hover:text-blue-300 transition-colors duration-300">{value}</div>
        </div>
      </div>
    </div>
  );
}

function EnhancedScoreBar({ label, value, color, icon }) {
  const colorClasses = {
    green: { 
      bg: 'bg-gradient-to-r from-green-500 to-emerald-400', 
      text: 'text-green-400',
      glow: 'rgba(16, 185, 129, 0.3)'
    },
    blue: { 
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-400', 
      text: 'text-blue-400',
      glow: 'rgba(59, 130, 246, 0.3)'
    },
    purple: { 
      bg: 'bg-gradient-to-r from-purple-500 to-pink-400', 
      text: 'text-purple-400',
      glow: 'rgba(168, 85, 247, 0.3)'
    }
  };

  const colors = colorClasses[color];
  const numValue = parseFloat(value || 0);

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-gray-400 group-hover:text-white transition-colors duration-300 font-medium">{label}</span>
        </div>
        <span className="text-xl font-bold text-white bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-xl border border-gray-700/50 group-hover:border-transparent transition-all duration-300">
          {numValue.toFixed(1)}%
        </span>
      </div>
      <div className="relative">
        <div className="w-full bg-gradient-to-r from-gray-800 to-gray-900 rounded-full h-3 border border-gray-700/50 overflow-hidden">
          <div
            className={`h-3 rounded-full ${colors.bg} relative transition-all duration-1000 ease-out group-hover:h-4`}
            style={{ width: `${Math.min(numValue, 100)}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>
        {/* Percentage indicator */}
        <div 
          className="absolute top-0 h-3 w-0.5 bg-white/50 group-hover:bg-white transition-all duration-300"
          style={{ left: `${numValue}%` }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-white bg-gray-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {numValue.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value, color }) {
  const colorClasses = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400'
  };

  return (
    <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 transform transition-all duration-300 hover:scale-105 hover:border-gray-600/50">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className={`text-xl font-bold ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}

function getStatusGradientColor(color) {
  const gradients = {
    green: '#10b981, #059669',
    blue: '#3b82f6, #2563eb',
    yellow: '#f59e0b, #d97706',
    red: '#ef4444, #dc2626'
  };
  return gradients[color] || '#6b7280, #4b5563';
}

function getStatusShadowColor(color) {
  const shadows = {
    green: 'rgba(16, 185, 129, 0.5)',
    blue: 'rgba(59, 130, 246, 0.5)',
    yellow: 'rgba(245, 158, 11, 0.5)',
    red: 'rgba(239, 68, 68, 0.5)'
  };
  return shadows[color] || 'rgba(107, 114, 128, 0.5)';
}

function getScoreColor(score) {
  if (score >= 90) return '#10b981'; // green
  if (score >= 80) return '#22c55e'; // light green
  if (score >= 70) return '#3b82f6'; // blue
  if (score >= 60) return '#8b5cf6'; // purple
  if (score >= 50) return '#f59e0b'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getScoreGlowColor(score) {
  if (score >= 90) return '#10b981';
  if (score >= 80) return '#22c55e';
  if (score >= 70) return '#3b82f6';
  if (score >= 60) return '#8b5cf6';
  if (score >= 50) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function getGradeBadgeColorEnhanced(grade) {
  const colors = {
    'A': 'bg-gradient-to-r from-green-500 to-emerald-400 text-white',
    'B': 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
    'C': 'bg-gradient-to-r from-yellow-500 to-amber-400 text-white',
    'D': 'bg-gradient-to-r from-orange-500 to-red-400 text-white',
    'F': 'bg-gradient-to-r from-red-500 to-pink-400 text-white'
  };
  return colors[grade] || 'bg-gradient-to-r from-gray-500 to-gray-400 text-white';
}

// Add shimmer animation to CSS
const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Add the style to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}