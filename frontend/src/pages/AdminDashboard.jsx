import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, Building2, TrendingUp, Activity, Plus, Edit, Trash2, Eye } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, orgsRes, empsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllOrganizations(),
        adminAPI.getAllEmployees()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (orgsRes.data.success) {
        setOrganizations(orgsRes.data.data.organizations);
      }
      if (empsRes.data.success) {
        setEmployees(empsRes.data.data.employees);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization? All associated employees will be deleted.')) {
      return;
    }

    try {
      const response = await adminAPI.deleteOrganization(orgId);
      if (response.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete organization');
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

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage organizations and monitor system-wide performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Building2 className="w-8 h-8" />}
            title="Total Organizations"
            value={stats?.totalOrganizations || 0}
            color="blue"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Avg Employees/Org"
            value={stats?.averageEmployeesPerOrg || 0}
            color="purple"
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            title="Active Organizations"
            value={organizations.length}
            color="orange"
          />
        </div>

        {/* Organizations Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Organizations</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Organization
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Industry</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Employees</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4 text-white">{org.name}</td>
                    <td className="py-3 px-4 text-gray-300">{org.email}</td>
                    <td className="py-3 px-4 text-gray-300">{org.industry || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-300">{org.location || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-300">
                      {employees.filter(e => e.organization_id === org.id).length}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrg(org)}
                          className="p-2 text-blue-400 hover:bg-gray-700 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrganization(org.id)}
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

        {/* Recent Employees */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Employees</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Organization</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Position</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 10).map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4 text-white">{emp.name}</td>
                    <td className="py-3 px-4 text-gray-300">{emp.email}</td>
                    <td className="py-3 px-4 text-gray-300">{emp.organization_name}</td>
                    <td className="py-3 px-4 text-gray-300">{emp.department || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-300">{emp.position || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Organization Modal */}
        {showCreateModal && (
          <CreateOrganizationModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchDashboardData();
            }}
          />
        )}

        {/* Organization Details Modal */}
        {selectedOrg && (
          <OrganizationDetailsModal
            organization={selectedOrg}
            employees={employees.filter(e => e.organization_id === selectedOrg.id)}
            onClose={() => setSelectedOrg(null)}
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

function CreateOrganizationModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.createOrganization(formData);
      if (response.data.success) {
        alert('Organization created successfully! Credentials sent to email.');
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Create Organization</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Organization Name *</label>
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
            <label className="block text-gray-400 mb-2">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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

function OrganizationDetailsModal({ organization, employees, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">{organization.name}</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="text-white ml-2">{organization.email}</span>
          </div>
          <div>
            <span className="text-gray-400">Industry:</span>
            <span className="text-white ml-2">{organization.industry || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-400">Location:</span>
            <span className="text-white ml-2">{organization.location || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-400">Total Employees:</span>
            <span className="text-white ml-2">{employees.length}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-3">Employees</h3>
        <div className="space-y-2">
          {employees.map((emp) => (
            <div key={emp.id} className="bg-gray-700 rounded p-3">
              <div className="text-white font-medium">{emp.name}</div>
              <div className="text-gray-400 text-sm">{emp.email}</div>
              <div className="text-gray-400 text-sm">
                {emp.department && `${emp.department} - `}{emp.position || 'N/A'}
              </div>
            </div>
          ))}
        </div>

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
