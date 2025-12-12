import React, { useState, useEffect } from 'react';
import { organizationAPI } from '../services/api';
import { Users, TrendingUp, BarChart3, Plus, Edit, Trash2, Eye, Building, Target, Clock, Award, ChevronRight, UserPlus, Sparkles } from 'lucide-react';

export function OrganizationDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);
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
      const [dashboardRes, employeesRes] = await Promise.all([
        organizationAPI.getDashboard(),
        organizationAPI.getMyEmployees()
      ]);

      if (dashboardRes.data.success) {
        setDashboard(dashboardRes.data.data);
      }
      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.data.employees || []);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-20"></div>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Preparing Your Dashboard</h2>
            <p className="text-gray-400">Loading organizational insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="glass-effect-red p-8 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 text-red-400">!</div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboard?.statistics || {};
  const departmentBreakdown = stats.departmentBreakdown || {};
  const positionBreakdown = stats.positionBreakdown || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-6 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float animation-delay-3000"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float animation-delay-6000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                {dashboard?.organization?.name || 'Organization Dashboard'}
              </h1>
              <p className="text-gray-400">Welcome to your management dashboard</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                <UserPlus className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-semibold relative z-10">Add Employee</span>
                
                {/* Button particles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-2 h-2 bg-white rounded-full animate-sparkle" style={{ top: '20%', left: '20%' }}></div>
                  <div className="absolute w-1 h-1 bg-cyan-300 rounded-full animate-sparkle" style={{ top: '40%', left: '80%', animationDelay: '0.2s' }}></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards with 3D Floating Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative">
          {/* 3D Shadow Layer */}
          <div className="absolute inset-0 -bottom-6 z-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="h-48 bg-gradient-to-t from-black/30 to-transparent rounded-2xl blur-xl opacity-40"
                  style={{
                    transform: 'perspective(1000px) rotateX(60deg) translateZ(-20px)',
                    animationDelay: `${i * 200}ms`
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Actual Cards */}
          <div className="relative z-10">
            <FloatingCard delay={0}>
              <QuantumParticleEffect color="blue" />
              <StatCard
                icon={<Users className="w-8 h-8" />}
                title="Total Employees"
                value={stats.totalEmployees || 0}
                color="from-blue-500 to-cyan-500"
              />
            </FloatingCard>
          </div>
          <div className="relative z-10">
            <FloatingCard delay={200}>
              <QuantumParticleEffect color="green" />
              <StatCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="Departments"
                value={Object.keys(departmentBreakdown).length}
                color="from-green-500 to-emerald-500"
              />
            </FloatingCard>
          </div>
          <div className="relative z-10">
            <FloatingCard delay={400}>
              <QuantumParticleEffect color="purple" />
              <StatCard
                icon={<BarChart3 className="w-8 h-8" />}
                title="Active Positions"
                value={Object.keys(positionBreakdown).length}
                color="from-purple-500 to-pink-500"
              />
            </FloatingCard>
          </div>
          <div className="relative z-10">
            <FloatingCard delay={600}>
              <QuantumParticleEffect color="orange" />
              <StatCard
                icon={<Award className="w-8 h-8" />}
                title="Active Employees"
                value={employees.length}
                color="from-orange-500 to-yellow-500"
              />
            </FloatingCard>
          </div>
        </div>

        {/* Departments & Positions Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative">
          {/* 3D Shadows */}
          <div className="absolute inset-0 -bottom-4 z-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <div className="bg-gradient-to-t from-black/30 to-transparent rounded-2xl blur-xl opacity-40" 
                   style={{ transform: 'perspective(1000px) rotateX(60deg) translateZ(-20px)' }}></div>
              <div className="bg-gradient-to-t from-black/30 to-transparent rounded-2xl blur-xl opacity-40" 
                   style={{ transform: 'perspective(1000px) rotateX(60deg) translateZ(-20px)' }}></div>
            </div>
          </div>
          
          {/* Actual Cards */}
          <div className="relative z-10">
            <FloatingCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Departments</h2>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-pulse-slow">
                    <Building className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(departmentBreakdown).map(([dept, count], index) => (
                    <div 
                      key={dept}
                      className="group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/30 hover:border-blue-500/40 transition-all duration-300 cursor-pointer hover:translate-x-2 hover:scale-101">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-sm font-bold text-blue-300">{index + 1}</span>
                          </div>
                          <span className="text-gray-300">{dept}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold bg-gradient-to-r from-blue-500/20 to-blue-600/20 px-3 py-1 rounded-lg">{count}</span>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FloatingCard>
          </div>
          
          <div className="relative z-10">
            <FloatingCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Position Distribution</h2>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center animate-pulse-slow">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(positionBreakdown).map(([pos, count], index) => (
                    <div 
                      key={pos}
                      className="group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/30 hover:border-purple-500/40 transition-all duration-300 cursor-pointer hover:translate-x-2 hover:scale-101">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-sm font-bold text-purple-300">{index + 1}</span>
                          </div>
                          <span className="text-gray-300">{pos}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-lg">{count}</span>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Employees Section */}
        <div className="relative">
          {/* 3D Shadow */}
          <div className="absolute inset-0 -bottom-4 z-0">
            <div className="h-full bg-gradient-to-t from-black/40 to-transparent rounded-2xl blur-xl opacity-40"
                 style={{ transform: 'perspective(1000px) rotateX(60deg) translateZ(-20px)' }}></div>
          </div>
          
          {/* Actual Card */}
          <div className="relative z-10">
            <FloatingCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Employee Management</h2>
                    <p className="text-gray-400">Manage your team members and their performance</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
                      <span className="text-sm font-semibold text-blue-300">
                        {employees.length} Team Members
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left py-4 px-6 text-gray-400 font-semibold">Employee</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-semibold">Role</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-semibold">Department</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-semibold">Status</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, index) => (
                        <tr 
                          key={emp.id} 
                          className="border-b border-gray-700/30 hover:bg-white/5 transition-all duration-300 group animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <div className="text-lg font-bold text-blue-300">
                                    {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </div>
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                              </div>
                              <div>
                                <div className="text-white font-semibold">{emp.name}</div>
                                <div className="text-gray-400 text-sm">{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700/50 border border-gray-600/50 group-hover:border-blue-500/50 transition-colors duration-300">
                              <span className="w-2 h-2 rounded-full bg-green-400"></span>
                              <span className="text-gray-300">{emp.position || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-gray-300">{emp.department || 'N/A'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                              <span className="text-green-300 text-sm font-medium">Active</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedEmployee(emp)}
                                className="group relative p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 transform hover:scale-110 active:scale-95 overflow-hidden"
                                title="View Performance"
                              >
                                <Eye className="w-4 h-4 text-blue-400 group-hover:text-blue-300 relative z-10" />
                                <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="group relative p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/40 transition-all duration-300 transform hover:scale-110 active:scale-95 overflow-hidden"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300 relative z-10" />
                                <div className="absolute inset-0 bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FloatingCard>
          </div>
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
  );
}

function FloatingCard({ children, className = '', delay = 0 }) {
  return (
    <div 
      className={`relative group ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
      
      {/* Main card with floating animation */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/40 rounded-2xl overflow-hidden hover:border-gray-600/60 transition-all duration-300 animate-card-float-3d group-hover:animate-card-float-hover">
        {/* Card shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
             style={{ transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }}></div>
        
        {children}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="p-6 relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${color}/20 border ${color.split(' ')[0]}/30 flex items-center justify-center group`}>
          {/* Icon glow effect */}
          <div className={`absolute inset-0 ${color.split(' ')[0]}/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          <div className={`relative ${color.split(' ')[0].replace('from-', 'text-')} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </div>
      <div className="mb-1">
        <div className="text-3xl font-bold text-white animate-count-up">{value}</div>
        <div className="text-gray-400 text-sm mt-2">{title}</div>
      </div>
    </div>
  );
}

function QuantumParticleEffect({ color }) {
  const particles = [];
  const colorMap = {
    blue: 'from-blue-400 to-cyan-400',
    green: 'from-green-400 to-emerald-400',
    purple: 'from-purple-400 to-pink-400',
    orange: 'from-orange-400 to-yellow-400'
  };

  // Create 15 particles with random positions and delays
  for (let i = 0; i < 15; i++) {
    particles.push({
      id: i,
      size: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 5 + 5,
      opacity: Math.random() * 0.4 + 0.1
    });
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute rounded-full bg-gradient-to-r ${colorMap[color]}`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            opacity: particle.opacity,
            filter: 'blur(1px)',
            animation: `particle-drift ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            transform: `translate(${Math.sin(particle.id) * 20}px, ${Math.cos(particle.id) * 20}px)`
          }}
        />
      ))}
      
      {/* Particle trails */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={`trail-${i}`}
            className={`absolute rounded-full bg-gradient-to-r ${colorMap[color]}`}
            style={{
              width: '100%',
              height: '1px',
              top: `${30 + i * 20}%`,
              left: '-100%',
              opacity: 0.05,
              animation: `particle-trail 8s linear infinite`,
              animationDelay: `${i * 2.5}s`,
              filter: 'blur(2px)'
            }}
          />
        ))}
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-modal-enter">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Add Team Member</h2>
                <p className="text-gray-400 text-sm mt-1">Invite a new employee to your organization</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-5 h-5 text-gray-400">×</div>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-shake">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <div className="text-red-400">!</div>
                  </div>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="group">
                <label className="block text-sm font-medium text-gray-400 mb-2 group-hover:text-blue-300 transition-colors">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-400 mb-2 group-hover:text-blue-300 transition-colors">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300"
                  placeholder="john@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-400 mb-2 group-hover:text-blue-300 transition-colors">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300"
                    placeholder="Engineering"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-400 mb-2 group-hover:text-blue-300 transition-colors">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300"
                    placeholder="Developer"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  'Invite Employee'
                )}
              </button>
            </div>
          </form>
        </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] animate-modal-enter">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden h-full flex flex-col">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <div className="text-2xl font-bold text-blue-300">
                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                  <p className="text-gray-400">{employee.position} • {employee.department}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-5 h-5 text-gray-400">×</div>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                  <div className="mt-4 text-gray-400">Loading performance data...</div>
                </div>
              </div>
            ) : performanceData?.scores?.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-6">Performance History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {performanceData.scores.map((score) => (
                    <div 
                      key={score.id}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-white font-medium">
                            {new Date(score.score_date).toLocaleDateString()}
                          </div>
                          <div className="text-3xl font-bold text-blue-400">
                            {parseFloat(score.overall_score || 0).toFixed(1)}%
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Productivity</span>
                              <span className="text-green-300">{parseFloat(score.productivity_score || 0).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: `${score.productivity_score || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Engagement</span>
                              <span className="text-purple-300">{parseFloat(score.engagement_score || 0).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                                style={{ width: `${score.engagement_score || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                              <span className="text-sm text-blue-300">{score.performance_grade}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {score.total_time} min
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-20 h-20 rounded-full bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-4">
                  <BarChart3 className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                <p className="text-gray-400 text-center">No performance records found for this employee.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}