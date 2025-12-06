import React, { useState, useEffect } from 'react';
import { organizationAPI } from '../services/api';
import { Users, TrendingUp, BarChart3, Plus, Edit, Trash2, Eye } from 'lucide-react';

export function OrganizationDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, employeesRes, analyticsRes] = await Promise.all([
        organizationAPI.getDashboard(),
        organizationAPI.getMyEmployees(),
        organizationAPI.getOrganizationAnalytics(30)
      ]);

      if (dashboardRes.data.success) {
        setDashboard(dashboardRes.data.data);
      }
      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.data.employees);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await organizationAPI.deleteEmployee(empId);
      if (response.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
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

  const stats = dashboard?.statistics || {};
  const departmentBreakdown = stats.departmentBreakdown || {};
  const positionBreakdown = stats.positionBreakdown || {};

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {dashboard?.organization?.name || 'Organization Dashboard'}
          </h1>
          <p className="text-gray-400">Manage your employees and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Employees"
            value={stats.totalEmployees || 0}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Departments"
            value={Object.keys(departmentBreakdown).length}
            color="green"
          />
          <StatCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Active Positions"
            value={Object.keys(positionBreakdown).length}
            color="purple"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Avg Performance"
            value={analytics?.averageScore ? `${parseFloat(analytics.averageScore).toFixed(1)}%` : 'N/A'}
            color="orange"
          />
        </div>

        {/* Department & Position Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Department Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(departmentBreakdown).map(([dept, count]) => (
                <div key={dept} className="flex justify-between items-center">
                  <span className="text-gray-300">{dept}</span>
                  <span className="text-white font-semibold bg-gray-700 px-3 py-1 rounded">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Position Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(positionBreakdown).map(([pos, count]) => (
                <div key={pos} className="flex justify-between items-center">
                  <span className="text-gray-300">{pos}</span>
                  <span className="text-white font-semibold bg-gray-700 px-3 py-1 rounded">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        {analytics && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Performance Overview (Last 30 Days)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Average Overall Score</div>
                <div className="text-3xl font-bold text-white">
                  {parseFloat(analytics.averageScore || 0).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Average Productivity</div>
                <div className="text-3xl font-bold text-green-400">
                  {parseFloat(analytics.averageProductivity || 0).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Average Engagement</div>
                <div className="text-3xl font-bold text-blue-400">
                  {parseFloat(analytics.averageEngagement || 0).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employees Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Employees</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Position</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4 text-white">{emp.name}</td>
                    <td className="py-3 px-4 text-gray-300">{emp.email}</td>
                    <td className="py-3 px-4 text-gray-300">{emp.department || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-300">{emp.position || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="p-2 text-blue-400 hover:bg-gray-700 rounded transition-colors"
                          title="View Performance"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="p-2 text-red-400 hover:bg-gray-700 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Employee Modal */}
        {showCreateModal && (
          <CreateEmployeeModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchDashboardData();
            }}
          />
        )}

        {/* Employee Performance Modal */}
        {selectedEmployee && (
          <EmployeePerformanceModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}
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

function CreateEmployeeModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await organizationAPI.createEmployee(formData);
      if (response.data.success) {
        alert('Employee created successfully! Credentials sent to email.');
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Add Employee</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeePerformanceModal({ employee, onClose }) {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await organizationAPI.getEmployeePerformanceScores(employee.id, 30);
        if (response.data.success) {
          setPerformanceData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching performance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [employee.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">{employee.name} - Performance</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="text-white ml-2">{employee.email}</span>
          </div>
          <div>
            <span className="text-gray-400">Department:</span>
            <span className="text-white ml-2">{employee.department || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-400">Position:</span>
            <span className="text-white ml-2">{employee.position || 'N/A'}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading performance data...</div>
        ) : performanceData?.performanceScores?.length > 0 ? (
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Recent Performance Scores</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {performanceData.performanceScores.map((score) => (
                <div key={score.id} className="bg-gray-700 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-white font-medium">
                      {new Date(score.score_date).toLocaleDateString()}
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {parseFloat(score.overall_score || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Productivity:</span>
                      <span className="text-white ml-2">{parseFloat(score.productivity_score || 0).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Engagement:</span>
                      <span className="text-white ml-2">{parseFloat(score.engagement_score || 0).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Grade:</span>
                      <span className="text-white ml-2">{score.performance_grade}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Time:</span>
                      <span className="text-white ml-2">{score.total_time}min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">No performance data available</div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
