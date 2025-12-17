import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../services/api';
import { Users, Building2, TrendingUp, Activity, Plus, Edit, Trash2, Eye, Search, X, Download, Filter } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  
  // Search states
  const [orgSearch, setOrgSearch] = useState('');
  const [empSearch, setEmpSearch] = useState('');

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
        setSelectedOrg(null); // Close modal after deletion
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete organization');
    }
  };

  // Filter organizations based on search
  const filteredOrganizations = organizations.filter(org => {
    const searchTerm = orgSearch.toLowerCase();
    return (
      org.name.toLowerCase().includes(searchTerm) ||
      org.email.toLowerCase().includes(searchTerm) ||
      (org.industry && org.industry.toLowerCase().includes(searchTerm)) ||
      (org.location && org.location.toLowerCase().includes(searchTerm))
    );
  });

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => {
    const searchTerm = empSearch.toLowerCase();
    return (
      emp.name.toLowerCase().includes(searchTerm) ||
      emp.email.toLowerCase().includes(searchTerm) ||
      (emp.organization_name && emp.organization_name.toLowerCase().includes(searchTerm)) ||
      (emp.department && emp.department.toLowerCase().includes(searchTerm)) ||
      (emp.position && emp.position.toLowerCase().includes(searchTerm))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="bg-gradient-to-r from-red-900/20 to-red-950/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl shadow-red-500/10 animate-pulse">
          <div className="text-red-400 text-xl font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 animate-gradient">
      <div className="max-w-7xl mx-auto">
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-slower"></div>
          <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-green-500/5 rounded-full blur-3xl animate-float"></div>
        </div>

        {/* Header with floating animation */}
        <div className="mb-8 animate-fade-in-down">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02]">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Manage organizations and monitor system-wide performance</p>
          </div>
        </div>

        {/* Stats Cards with floating effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <Building2 className="w-8 h-8" />, title: "Total Organizations", value: stats?.totalOrganizations || 0, color: "blue", delay: 100 },
            { icon: <Users className="w-8 h-8" />, title: "Total Employees", value: stats?.totalEmployees || 0, color: "green", delay: 200 },
            { icon: <TrendingUp className="w-8 h-8" />, title: "Avg Employees/Org", value: stats?.averageEmployeesPerOrg || 0, color: "purple", delay: 300 },
            { icon: <Activity className="w-8 h-8" />, title: "Active Organizations", value: organizations.length, color: "orange", delay: 400 },
          ].map((stat, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        {/* Organizations Section with glassmorphism */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 mb-8 shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.005]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Organizations</h2>
              <p className="text-gray-400">Manage all registered organizations</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Organization</span>
            </button>
          </div>

          {/* Search Box for Organizations - IMPROVED DESIGN */}
          <div className="relative mb-6 group animate-fade-in">
            <div className="relative flex items-center">
              <div className="absolute left-0 pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search organizations..."
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-800/40 backdrop-blur-xl text-white rounded-xl border-2 border-gray-700/50 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300 group-hover:border-gray-600/70 shadow-lg shadow-black/20"
              />
              {orgSearch && (
                <button
                  onClick={() => setOrgSearch('')}
                  className="absolute right-0 pr-4 text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-2 px-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-400">Try searching by:</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">name</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">email</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">industry</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">location</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-700/30">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Industry</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Location</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Employees</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org, index) => (
                    <tr 
                      key={org.id} 
                      className="border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-700/20 hover:to-gray-800/20 group cursor-pointer transition-all duration-300 hover:scale-[1.002]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td 
                        className="py-4 px-6 text-white group-hover:text-blue-300 transition-colors duration-300"
                        onClick={() => setSelectedOrg(org)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          {org.name}
                        </div>
                      </td>
                      <td 
                        className="py-4 px-6 text-gray-300 group-hover:text-white transition-colors duration-300"
                        onClick={() => setSelectedOrg(org)}
                      >
                        {org.email}
                      </td>
                      <td 
                        className="py-4 px-6 text-gray-300 group-hover:text-white transition-colors duration-300"
                        onClick={() => setSelectedOrg(org)}
                      >
                        <span className="inline-block bg-gray-700/50 px-3 py-1 rounded-lg">
                          {org.industry || 'N/A'}
                        </span>
                      </td>
                      <td 
                        className="py-4 px-6 text-gray-300 group-hover:text-white transition-colors duration-300"
                        onClick={() => setSelectedOrg(org)}
                      >
                        {org.location || 'N/A'}
                      </td>
                      <td 
                        className="py-4 px-6 text-gray-300 group-hover:text-white transition-colors duration-300"
                        onClick={() => setSelectedOrg(org)}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="font-semibold">
                            {employees.filter(e => e.organization_id === org.id).length}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrg(org)}
                            className="p-2 bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-400 hover:text-white hover:from-blue-600/30 hover:to-blue-700/30 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrganization(org.id)}
                            className="p-2 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 hover:text-white hover:from-red-600/30 hover:to-red-700/30 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="text-gray-400 text-lg">
                          {orgSearch ? 'No organizations found matching your search.' : 'No organizations found.'}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Employees Section */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 shadow-2xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.005]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Recent Employees</h2>
              <p className="text-gray-400">Latest employees across all organizations</p>
            </div>
            {/* <div className="flex items-center gap-3">
              <button className="group flex items-center gap-2 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-300">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="group flex items-center gap-2 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-300">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div> */}
          </div>
          
          {/* Search Box for Employees - IMPROVED DESIGN */}
          <div className="relative mb-6 group animate-fade-in">
            <div className="relative flex items-center">
              <div className="absolute left-0 pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-800/40 backdrop-blur-xl text-white rounded-xl border-2 border-gray-700/50 focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-300 group-hover:border-gray-600/70 shadow-lg shadow-black/20"
              />
              {empSearch && (
                <button
                  onClick={() => setEmpSearch('')}
                  className="absolute right-0 pr-4 text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-2 px-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-400">Try searching by:</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">name</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">email</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">organization</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">department</span>
              <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">position</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-700/30">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Organization</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Department</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Position</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.slice(0, 10).map((emp, index) => (
                    <tr 
                      key={emp.id} 
                      className="border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-700/20 hover:to-gray-800/20 transition-all duration-300 hover:scale-[1.002]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {emp.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-white font-medium">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">{emp.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-gradient-to-r from-gray-700/50 to-gray-800/50 px-3 py-1 rounded-lg text-gray-300">
                          {emp.organization_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">{emp.department || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-gradient-to-r from-green-600/20 to-green-700/20 px-3 py-1 rounded-lg text-green-400">
                          {emp.position || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="text-gray-400 text-lg">
                          {empSearch ? 'No employees found matching your search.' : 'No employees found.'}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals remain the same */}
        {showCreateModal && (
          <CreateOrganizationModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchDashboardData();
            }}
          />
        )}

        {selectedOrg && (
          <OrganizationDetailsModal
            organization={selectedOrg}
            employees={employees.filter(e => e.organization_id === selectedOrg.id)}
            onClose={() => setSelectedOrg(null)}
            onDelete={handleDeleteOrganization}
          />
        )}
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-40px); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-60px); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 text-green-400 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30'
  };

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"></div>
      <div className={`relative bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} rounded-xl`}>
            {React.cloneElement(icon, { className: "w-6 h-6" })}
          </div>
          <div className={`w-3 h-3 rounded-full ${colorClasses[color].split(' ')[3]} animate-pulse`}></div>
        </div>
        <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
        <p className="text-4xl font-bold text-white">{value}</p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
      </div>
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-blue-500/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create Organization
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-900/20 to-red-950/20 backdrop-blur-sm border border-red-500/30 rounded-xl animate-shake">
            <div className="text-red-400 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: "Organization Name *", type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) },
            { label: "Email *", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }) },
            { label: "Industry", type: "text", value: formData.industry, onChange: (e) => setFormData({ ...formData, industry: e.target.value }) },
            { label: "Location", type: "text", value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }) },
          ].map((field, index) => (
            <div 
              key={index}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <label className="block text-gray-400 mb-2 group-hover:text-blue-300 transition-colors duration-300">
                {field.label}
              </label>
              <input
                type={field.type}
                required={field.label.includes('*')}
                value={field.value}
                onChange={field.onChange}
                className="w-full bg-gradient-to-r from-gray-700/50 to-gray-800/50 backdrop-blur-sm text-white rounded-xl px-4 py-3 border-2 border-gray-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 group-hover:border-gray-500/50"
              />
            </div>
          ))}

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrganizationDetailsModal({ organization, employees, onClose, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-purple-500/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {organization.name}
            </h2>
            <p className="text-gray-400 mt-2">{organization.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Industry</span>
              </div>
              <span className="text-white font-medium text-lg">{organization.industry || 'N/A'}</span>
            </div>
            <div className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Total Employees</span>
              </div>
              <span className="text-white font-medium text-lg">{employees.length}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-orange-400" />
                <span className="text-gray-400 text-sm">Location</span>
              </div>
              <span className="text-white font-medium text-lg">{organization.location || 'N/A'}</span>
            </div>
            <div className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Status</span>
              </div>
              <span className="text-green-400 font-medium text-lg">Active</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Employees ({employees.length})</h3>
          </div>
          {employees.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {employees.map((emp, index) => (
                <div 
                  key={emp.id} 
                  className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-xl p-4 hover:from-gray-600/30 hover:to-gray-700/30 transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{emp.name}</div>
                        <div className="text-gray-400 text-sm">{emp.email}</div>
                        <div className="flex gap-2 mt-2">
                          {emp.department && (
                            <span className="text-xs bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-300 px-2 py-1 rounded-lg">
                              {emp.department}
                            </span>
                          )}
                          {emp.position && (
                            <span className="text-xs bg-gradient-to-r from-green-600/20 to-green-700/20 text-green-300 px-2 py-1 rounded-lg">
                              {emp.position}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <div className="text-gray-400">No employees found in this organization</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this organization? All associated employees will be deleted.')) {
                onDelete(organization.id);
              }
            }}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  );
}