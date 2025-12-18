import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../services/api';
import { Users, Building2, TrendingUp, Activity, Plus, Edit, Trash2, Eye, Search, X, Download, Filter, Sparkles, Zap, Shield, BarChart3, Mail, Globe, Phone, Calendar, CheckCircle } from 'lucide-react';

// Define the modal components first
function OrganizationDetailsModal({ organization, employees, onClose, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this organization? All associated employees will be permanently deleted.')) {
      setLoading(true);
      try {
        await onDelete(organization.id);
        onClose();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete organization');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 backdrop-blur-xl border border-gray-300 dark:border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-purple-500/20 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {organization.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4" />
              <span>{organization.email}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Industry</span>
              </div>
              <span className="text-gray-900 dark:text-white text-lg font-semibold">
                {organization.industry || 'Not specified'}
              </span>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 backdrop-blur-sm rounded-xl p-4 border border-green-200 dark:border-green-700/30">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Total Employees</span>
              </div>
              <span className="text-gray-900 dark:text-white text-lg font-semibold">
                {employees.length}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 backdrop-blur-sm rounded-xl p-4 border border-purple-200 dark:border-purple-700/30">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Location</span>
              </div>
              <span className="text-gray-900 dark:text-white text-lg font-semibold">
                {organization.location || 'Not specified'}
              </span>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 backdrop-blur-sm rounded-xl p-4 border border-orange-200 dark:border-orange-700/30">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Status</span>
              </div>
              <span className="text-green-600 dark:text-green-400 text-lg font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Employees ({employees.length})</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">Showing all employees</span>
          </div>
          
          {employees.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {employees.map((emp, index) => (
                <div 
                  key={emp.id} 
                  className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-sm rounded-xl p-4 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/40 dark:hover:to-gray-800/40 transition-all duration-300 border border-gray-200 dark:border-gray-700/30"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-gray-900 dark:text-white font-semibold text-sm">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">{emp.name}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm">{emp.email}</div>
                        <div className="flex gap-2 mt-2">
                          {emp.department && (
                            <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-lg">
                              {emp.department}
                            </span>
                          )}
                          {emp.position && (
                            <span className="text-xs bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-lg">
                              {emp.position}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {emp.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/30">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-gray-600 dark:text-gray-400 mb-2">No employees found in this organization</div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Add employees to get started</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700/50">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700/50 dark:hover:to-gray-800/50 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
          >
            Close
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Organization</span>
              </>
            )}
          </button>
        </div>
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
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 backdrop-blur-xl border border-gray-300 dark:border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-blue-500/20 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
              <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Organization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-950/20 backdrop-blur-sm border border-red-300 dark:border-red-500/30 rounded-xl">
            <div className="text-red-600 dark:text-red-300 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { 
              label: "Organization Name *", 
              type: "text", 
              value: formData.name, 
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              placeholder: "Enter organization name",
              icon: <Building2 className="w-4 h-4" />
            },
            { 
              label: "Email *", 
              type: "email", 
              value: formData.email, 
              onChange: (e) => setFormData({ ...formData, email: e.target.value }),
              placeholder: "Enter organization email",
              icon: <Mail className="w-4 h-4" />
            },
            { 
              label: "Industry", 
              type: "text", 
              value: formData.industry, 
              onChange: (e) => setFormData({ ...formData, industry: e.target.value }),
              placeholder: "e.g., Technology, Healthcare",
              icon: <Globe className="w-4 h-4" />
            },
            { 
              label: "Location", 
              type: "text", 
              value: formData.location, 
              onChange: (e) => setFormData({ ...formData, location: e.target.value }),
              placeholder: "e.g., New York, USA",
              icon: <Activity className="w-4 h-4" />
            },
          ].map((field, index) => (
            <div 
              key={index}
              className="group"
            >
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {field.label}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                  {field.icon}
                </div>
                <input
                  type={field.type}
                  required={field.label.includes('*')}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  className="w-full pl-10 bg-white dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white rounded-xl px-4 py-3 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700/50 dark:hover:to-gray-800/50 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main AdminDashboard component
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [hoverState, setHoverState] = useState({ type: null, id: null });
  const particlesRef = useRef(null);
  
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
        setSelectedOrg(null);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete organization');
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const searchTerm = orgSearch.toLowerCase();
    return (
      org.name.toLowerCase().includes(searchTerm) ||
      org.email.toLowerCase().includes(searchTerm) ||
      (org.industry && org.industry.toLowerCase().includes(searchTerm)) ||
      (org.location && org.location.toLowerCase().includes(searchTerm))
    );
  });

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

  const createParticles = (x, y, count = 8, color = 'blue') => {
    if (!particlesRef.current) return;
    
    const particles = [];
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 rounded-full pointer-events-none';
      particle.style.background = `linear-gradient(135deg, var(--color-${color}-500), var(--color-${color}-400))`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.transform = 'translate(-50%, -50%) scale(0)';
      
      particlesRef.current.appendChild(particle);
      
      particle.animate([
        { 
          transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
          opacity: 1
        },
        { 
          transform: `translate(${Math.cos(i * (2 * Math.PI / count)) * 80}px, ${Math.sin(i * (2 * Math.PI / count)) * 80}px) scale(1) rotate(360deg)`,
          opacity: 0.5
        },
        { 
          transform: `translate(${Math.cos(i * (2 * Math.PI / count)) * 120}px, ${Math.sin(i * (2 * Math.PI / count)) * 120}px) scale(0) rotate(720deg)`,
          opacity: 0
        }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }).onfinish = () => particle.remove();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-950/30 backdrop-blur-xl border border-red-300 dark:border-red-500/40 rounded-2xl p-8 shadow-lg dark:shadow-red-500/20">
          <div className="text-red-600 dark:text-red-300 text-xl font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black p-6 transition-colors duration-300">
      {/* Particle Container */}
      <div ref={particlesRef} className="fixed inset-0 pointer-events-none z-0" />
      
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with enhanced text visibility */}
        <div className="mb-8 animate-fade-in-down">
          <div 
            className="relative bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-900/70 dark:to-gray-950/70 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              createParticles(rect.left + 50, rect.top + 50, 12, 'blue');
              createParticles(rect.right - 50, rect.bottom - 50, 12, 'purple');
            }}
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg opacity-90">Manage organizations and monitor system-wide performance</p>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-500/20 dark:border-blue-400/20 animate-pulse-slow">
                <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">Live System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with particle effects */}
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
              <StatCard 
                {...stat} 
                onHover={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createParticles(rect.left + rect.width/2, rect.top + rect.height/2, 6, stat.color);
                }}
              />
            </div>
          ))}
        </div>

        {/* Organizations Section with enhanced text */}
        <div 
          className="relative bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/60 dark:to-gray-950/60 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-6 mb-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden"
          onMouseEnter={(e) => {
            if (hoverState.type !== 'org-section') {
              setHoverState({ type: 'org-section', id: null });
              const rect = e.currentTarget.getBoundingClientRect();
              createParticles(rect.left + 100, rect.top + 100, 15, 'blue');
            }
          }}
        >
          {/* Hover gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-700 -z-10"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Organizations</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 opacity-90">Manage all registered organizations</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                createParticles(rect.left + rect.width/2, rect.top + rect.height/2, 8, 'blue');
              }}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 overflow-hidden"
            >
              {/* Button glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold relative">
                Add Organization
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div 
            className="relative mb-6 group"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              createParticles(rect.left + 30, rect.top + 20, 4, 'blue');
            }}
          >
            <div className="relative flex items-center">
              <div className="absolute left-0 pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search organizations..."
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-gray-100 rounded-xl border-2 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300 group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 shadow-lg"
              />
              {orgSearch && (
                <button
                  onClick={() => setOrgSearch('')}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    createParticles(rect.left + rect.width/2, rect.top + rect.height/2, 3, 'gray');
                  }}
                  className="absolute right-0 pr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Table with enhanced text visibility */}
          <div className="overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/60 dark:to-gray-900/60">
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Name</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Industry</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Location</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Employees</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org, index) => (
                    <tr 
                      key={org.id} 
                      className="border-b border-gray-100/80 dark:border-gray-700/40 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-300 group cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoverState({ type: 'org-row', id: org.id });
                        const rect = e.currentTarget.getBoundingClientRect();
                        createParticles(rect.left + 20, rect.top + rect.height/2, 4, 'blue');
                      }}
                      onClick={() => setSelectedOrg(org)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{org.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{org.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 px-3 py-1 rounded-lg text-blue-800 dark:text-blue-300">
                          {org.industry || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{org.location || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {employees.filter(e => e.organization_id === org.id).length}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrg(org);
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              createParticles(rect.left + rect.width/2, rect.top + rect.height/2, 3, 'blue');
                            }}
                            className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-400 hover:text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-300 hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOrganization(org.id);
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              createParticles(rect.left + rect.width/2, rect.top + rect.height/2, 3, 'red');
                            }}
                            className="p-2 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-700 dark:text-red-400 hover:text-white hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-300 hover:scale-110"
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
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800/60 dark:to-gray-900/60 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-gray-500 dark:text-gray-500" />
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-lg">
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

        {/* Employees Section with enhanced text */}
        <div 
          className="relative bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/60 dark:to-gray-950/60 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden"
          onMouseEnter={(e) => {
            if (hoverState.type !== 'emp-section') {
              setHoverState({ type: 'emp-section', id: null });
              const rect = e.currentTarget.getBoundingClientRect();
              createParticles(rect.left + 100, rect.top + 100, 15, 'purple');
            }
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Employees</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 opacity-90">Latest employees across all organizations</p>
            </div>
          </div>
          
          {/* Search Box */}
          <div 
            className="relative mb-6 group"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              createParticles(rect.left + 30, rect.top + 20, 4, 'purple');
            }}
          >
            <div className="relative flex items-center">
              <div className="absolute left-0 pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-gray-100 rounded-xl border-2 border-gray-300/50 dark:border-gray-600/50 focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-300 group-hover:border-purple-400/50 dark:group-hover:border-purple-500/50 shadow-lg"
              />
              {empSearch && (
                <button
                  onClick={() => setEmpSearch('')}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    createParticles(rect.left + rect.width/2, rect.top + rect.height/2, 3, 'gray');
                  }}
                  className="absolute right-0 pr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/60 dark:to-gray-900/60">
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Name</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Organization</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Department</th>
                  <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">Position</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.slice(0, 10).map((emp, index) => (
                    <tr 
                      key={emp.id} 
                      className="border-b border-gray-100/80 dark:border-gray-700/40 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 transition-all duration-300 group"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        createParticles(rect.left + 20, rect.top + rect.height/2, 4, 'purple');
                      }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                              <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
                                {emp.name.charAt(0)}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-ping opacity-30"></div>
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{emp.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 px-3 py-1 rounded-lg text-purple-800 dark:text-purple-300">
                          {emp.organization_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{emp.department || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 px-3 py-1 rounded-lg text-green-800 dark:text-green-300">
                          {emp.position || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800/60 dark:to-gray-900/60 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-500 dark:text-gray-500" />
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-lg">
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

        {/* Modals - Now properly defined above */}
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

      <style jsx>{`
        :root {
          --color-blue-500: #3b82f6;
          --color-blue-400: #60a5fa;
          --color-green-500: #10b981;
          --color-green-400: #34d399;
          --color-purple-500: #8b5cf6;
          --color-purple-400: #a78bfa;
          --color-orange-500: #f97316;
          --color-orange-400: #fb923c;
          --color-red-500: #ef4444;
          --color-red-400: #f87171;
          --color-gray-500: #6b7280;
          --color-gray-400: #9ca3af;
        }

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
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
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
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

// StatCard component
function StatCard({ icon, title, value, color, onHover }) {
  const colorClasses = {
    blue: {
      light: 'from-blue-100 to-blue-200 text-blue-700 border-blue-200',
      dark: 'from-blue-500/30 to-blue-600/30 text-blue-300 border-blue-500/40',
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/20',
      hoverShadow: 'hover:shadow-blue-500/30'
    },
    green: {
      light: 'from-green-100 to-green-200 text-green-700 border-green-200',
      dark: 'from-green-500/30 to-green-600/30 text-green-300 border-green-500/40',
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-500/20',
      hoverShadow: 'hover:shadow-green-500/30'
    },
    purple: {
      light: 'from-purple-100 to-purple-200 text-purple-700 border-purple-200',
      dark: 'from-purple-500/30 to-purple-600/30 text-purple-300 border-purple-500/40',
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/20',
      hoverShadow: 'hover:shadow-purple-500/30'
    },
    orange: {
      light: 'from-orange-100 to-orange-200 text-orange-700 border-orange-200',
      dark: 'from-orange-500/30 to-orange-600/30 text-orange-300 border-orange-500/40',
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/20',
      hoverShadow: 'hover:shadow-orange-500/30'
    }
  };

  return (
    <div 
      className="group relative cursor-pointer"
      onMouseEnter={onHover}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl -z-10`}></div>
      
      {/* Particle trigger area */}
      <div className="absolute inset-0 rounded-2xl hover:bg-gradient-to-br hover:from-transparent hover:to-transparent transition-all duration-300"></div>
      
      <div className={`relative bg-gradient-to-br ${colorClasses[color].light} dark:${colorClasses[color].dark} backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500 group-hover:scale-[1.05] group-hover:-translate-y-2 ${colorClasses[color].shadow} ${colorClasses[color].hoverShadow} group-hover:shadow-xl`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${colorClasses[color].light.split(' ')[0]} ${colorClasses[color].light.split(' ')[1]} dark:${colorClasses[color].dark.split(' ')[0]} dark:${colorClasses[color].dark.split(' ')[1]} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            {React.cloneElement(icon, { className: "w-6 h-6 group-hover:rotate-12 transition-transform duration-300" })}
          </div>
          <div className={`w-2 h-2 rounded-full ${colorClasses[color].light.split(' ')[3]} dark:${colorClasses[color].dark.split(' ')[3]} animate-pulse group-hover:animate-none group-hover:scale-150 transition-all duration-300`}></div>
        </div>
        <h3 className="text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium opacity-90">{title}</h3>
        <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        
        {/* Animated underline */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-50 dark:group-hover:opacity-70 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-center"></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}