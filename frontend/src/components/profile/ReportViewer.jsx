import React, { useState, useEffect } from 'react';
import { Calendar, Download, FileText, TrendingUp, Clock, Target } from 'lucide-react';
import { reportGeneratorService } from '../../services/reportGenerator';
import { pdfReportService } from '../../services/pdfReportService';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';


export function ReportViewer({ userId }) {
  const { user, isAdmin } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('daily');
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadReport();
    }
  }, [selectedDate, reportType, targetUserId]);

  const loadReport = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      if (reportType === 'daily') {
        const report = reportGeneratorService.getDailyReport(targetUserId, selectedDate);
        setDailyReport(report);
        setWeeklyReport(null);
      } else {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
        const report = reportGeneratorService.getWeeklyReport(targetUserId, weekStart);
        setWeeklyReport(report);
        setDailyReport(null);
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!targetUserId) return;

    const userName = user?.name || 'User';

    if (reportType === 'daily' && dailyReport) {
      pdfReportService.downloadDailyReport(dailyReport, userName);
    } else if (reportType === 'weekly' && weeklyReport) {
      pdfReportService.downloadWeeklyReport(weeklyReport, userName);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (!targetUserId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">No user selected for report viewing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value | 'weekly')}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
            </select>
          </div>

          <button
            onClick={downloadReport}
            disabled={(!dailyReport && !weeklyReport) || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
          </div>
        </div>
      ) : reportType === 'daily' ? (
        <DailyReportView report={dailyReport} />
      ) : (
        <WeeklyReportView report={weeklyReport} />
      )}
    </div>
  );
}

function DailyReportView({ report }) {
  if (!report) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No data available for this date.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Start monitoring to generate reports.
          </p>
        </div>
      </div>
    );
  }

  const chartData = report.hourlyBreakdown.map(hour => ({
    hour: hour.hour === 0 ? '12 AM' : 
          hour.hour < 12 ? `${hour.hour} AM` :
          hour.hour === 12 ? '12 PM' : `${hour.hour - 12} PM`,
    working: Math.round(hour.working / 60), // Convert to minutes
    distracted: Math.round(hour.distracted / 60),
    mobile_phone: Math.round(hour.mobile_phone / 60),
    talking: Math.round(hour.talking / 60),
    break: Math.round(hour.break / 60),
    absent: Math.round(hour.absent / 60),
  })).filter(hour => hour.working > 0 || hour.distracted > 0 || hour.mobile_phone > 0 || 
                     hour.talking > 0 || hour.break > 0 || hour.absent > 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Productivity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.productivityScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.engagementScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Working Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(report.workingTime / 3600 * 10) / 10}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(report.totalTime / 3600 * 10) / 10}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hourly Activity Breakdown
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="working" fill="#10B981" name="Working (min)" />
                <Bar dataKey="distracted" fill="#F59E0B" name="Distracted (min)" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights */}
      {report.insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Daily Insights
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {report.insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded-full mr-3 mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{insight}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyReportView({ report }) {
  if (!report || report.dailyReports.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No data available for this week.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Start monitoring to generate reports.
          </p>
        </div>
      </div>
    );
  }

  const chartData = report.dailyReports.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    productivity: day.productivityScore,
    engagement: day.engagementScore,
    hours: Math.round(day.totalTime / 3600 * 10) / 10,
  }));

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Productivity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.averageProductivity}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {report.trends.productivity === 'improving' ? '↗️ Improving' :
                 report.trends.productivity === 'declining' ? '↘️ Declining' : '→ Stable'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.averageEngagement}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {report.trends.engagement === 'improving' ? '↗️ Improving' :
                 report.trends.engagement === 'declining' ? '↘️ Declining' : '→ Stable'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(report.totalWorkingHours * 10) / 10}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly Performance Trend
          </h3>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
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
                name="Productivity %"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Engagement %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Recommendations
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded-full mr-3 mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}