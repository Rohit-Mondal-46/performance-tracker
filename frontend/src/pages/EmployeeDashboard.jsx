import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Clock, 
  Award,
  Calendar,
  BarChart3,
  AlertCircle
} from 'lucide-react';

export function EmployeeDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [performanceScores, setPerformanceScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, scoresRes] = await Promise.all([
        employeeAPI.getDashboard(),
        employeeAPI.getMyPerformanceScores(30)
      ]);

      if (dashboardRes.data.success) {
        setDashboard(dashboardRes.data.data);
      }
      if (scoresRes.data.success) {
        setPerformanceScores(scoresRes.data.data.performanceScores);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const employee = dashboard?.employee || {};
  const metrics = dashboard?.metrics || {};
  const recentPerformance = dashboard?.recentPerformance || {};
  const performanceStatus = dashboard?.performanceStatus || {};

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {employee.name}
          </h1>
          <p className="text-gray-400">Track your performance and progress</p>
        </div>

        {/* Performance Status Banner */}
        {performanceStatus.rating && (
          <div className={`rounded-lg p-6 mb-8 ${getStatusBgColor(performanceStatus.color)}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${getStatusIconBg(performanceStatus.color)}`}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {performanceStatus.rating.toUpperCase()}
                </h2>
                <p className="text-white/90">{performanceStatus.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Target className="w-8 h-8" />}
            title="Performance Rating"
            value={`${metrics.performanceRating?.toFixed(1) || 0}%`}
            color="blue"
            trend={metrics.performanceTrend}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Productivity Score"
            value={`${metrics.productivityScore?.toFixed(1) || 0}%`}
            color="green"
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            title="Engagement Score"
            value={`${metrics.engagementScore?.toFixed(1) || 0}%`}
            color="purple"
          />
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            title="Active Days"
            value={metrics.totalActiveDays || 0}
            color="orange"
          />
        </div>

        {/* Employee Info Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Email" value={employee.email} />
            <InfoItem label="Organization" value={employee.organization_name} />
            <InfoItem label="Department" value={employee.department || 'Not specified'} />
            <InfoItem label="Position" value={employee.position || 'Not specified'} />
            <InfoItem 
              label="Join Date" 
              value={employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'N/A'} 
            />
            <InfoItem 
              label="Last Activity" 
              value={metrics.lastActivity ? new Date(metrics.lastActivity).toLocaleDateString() : 'N/A'} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Latest Performance Score */}
          {recentPerformance.latestScore && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Latest Performance</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-gray-400">
                    {new Date(recentPerformance.latestScore.date).toLocaleDateString()}
                  </div>
                  <div className="text-3xl font-bold text-blue-400">
                    {parseFloat(recentPerformance.latestScore.finalScore).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <ScoreBar 
                    label="Productivity" 
                    value={parseFloat(recentPerformance.latestScore.productivityScore)} 
                    color="green"
                  />
                  <ScoreBar 
                    label="Engagement" 
                    value={parseFloat(recentPerformance.latestScore.engagementScore)} 
                    color="blue"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Monthly Average */}
          {recentPerformance.monthlyAverage && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Monthly Average ({recentPerformance.monthlyAverage.daysTracked} days)
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Overall Score</div>
                  <div className="text-3xl font-bold text-white">
                    {parseFloat(recentPerformance.monthlyAverage.finalScore || 0).toFixed(1)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm mb-1">Productivity</div>
                    <div className="text-xl font-bold text-green-400">
                      {parseFloat(recentPerformance.monthlyAverage.productivity || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm mb-1">Engagement</div>
                    <div className="text-xl font-bold text-blue-400">
                      {parseFloat(recentPerformance.monthlyAverage.engagement || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Last 7 Days Performance */}
        {recentPerformance.last7Days && recentPerformance.last7Days.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Last 7 Days Performance</h2>
            <div className="grid grid-cols-7 gap-2">
              {recentPerformance.last7Days.map((day, index) => {
                const score = parseFloat(day.score || 0);
                return (
                  <div key={index} className="text-center">
                    <div className="text-gray-400 text-xs mb-2">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div 
                      className="h-24 bg-gray-700 rounded-lg flex items-end justify-center p-2"
                      style={{
                        background: `linear-gradient(to top, ${getScoreColor(score)} 0%, ${getScoreColor(score)} ${score}%, #374151 ${score}%)`
                      }}
                    >
                      <div className="text-white font-semibold text-sm">
                        {score.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Performance History */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Performance History</h2>
          {performanceScores.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {performanceScores.map((score) => (
                <div key={score.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-white font-medium">
                      {new Date(score.score_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${getGradeBadgeColor(score.performance_grade)}`}>
                        {score.performance_grade}
                      </span>
                      <span className="text-2xl font-bold text-blue-400">
                        {parseFloat(score.overall_score || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Productivity:</span>
                      <span className="text-white ml-2">{parseFloat(score.productivity_score || 0).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Engagement:</span>
                      <span className="text-white ml-2">{parseFloat(score.engagement_score || 0).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Working:</span>
                      <span className="text-white ml-2">{score.working_time}min</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Total:</span>
                      <span className="text-white ml-2">{score.total_time}min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No performance data available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, trend }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400'
  };

  const trendColors = {
    improving: 'text-green-400',
    declining: 'text-red-400',
    stable: 'text-gray-400'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-white">{value}</div>
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  };

  const numValue = parseFloat(value || 0);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{numValue.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${numValue}%` }}
        ></div>
      </div>
    </div>
  );
}

function getStatusBgColor(color) {
  const colors = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };
  return colors[color] || 'bg-gray-600';
}

function getStatusIconBg(color) {
  const colors = {
    green: 'bg-green-700',
    blue: 'bg-blue-700',
    yellow: 'bg-yellow-700',
    red: 'bg-red-700'
  };
  return colors[color] || 'bg-gray-700';
}

function getScoreColor(score) {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#3b82f6'; // blue
  if (score >= 40) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}

function getGradeBadgeColor(grade) {
  const colors = {
    'A': 'bg-green-500 text-white',
    'B': 'bg-blue-500 text-white',
    'C': 'bg-yellow-500 text-white',
    'D': 'bg-orange-500 text-white',
    'F': 'bg-red-500 text-white'
  };
  return colors[grade] || 'bg-gray-500 text-white';
}
