import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, User, Check, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { FloatingElement } from '../components/ui/FloatingElement';
import { MorphingShape } from '../components/ui/MorphingShape';

export function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      displayName: 'System Administrator',
      icon: Shield,
      color: 'from-red-500 to-orange-500',
      bgColor: 'from-red-500/10 to-orange-500/10',
      borderColor: 'border-red-500/50',
      iconColor: 'text-red-400',
      description: 'Full system access with ability to manage HR Managers and system settings',
      features: [
        'Create and manage HR Manager accounts',
        'Generate login credentials',
        'Full system configuration',
        'Access all reports and analytics'
      ]
    },
    {
      id: 'hr_manager',
      name: 'HR Manager',
      displayName: 'HR Manager',
      icon: Users,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-500/10 to-purple-500/10',
      borderColor: 'border-blue-500/50',
      iconColor: 'text-blue-400',
      description: 'Manage employees, monitor productivity, and generate reports',
      features: [
        'Add and manage employees',
        'Monitor employee productivity',
        'Generate detailed reports',
        'View analytics dashboard'
      ]
    },
    {
      id: 'employee',
      name: 'Employee',
      displayName: 'Employee',
      icon: User,
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-500/10 to-teal-500/10',
      borderColor: 'border-green-500/50',
      iconColor: 'text-green-400',
      description: 'Access your personal dashboard and track your productivity',
      features: [
        'View personal dashboard',
        'Track your productivity',
        'Access personal reports',
        'Update profile settings'
      ]
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setTimeout(() => {
      navigate('/login', { state: { selectedRole: role } });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <MorphingShape
          className="absolute top-10 left-10 w-32 h-32 opacity-20"
          color="rgba(139, 92, 246, 0.3)"
        />
        <MorphingShape
          className="absolute bottom-20 right-20 w-40 h-40 opacity-15"
          color="rgba(236, 72, 153, 0.3)"
        />
        <MorphingShape
          className="absolute top-1/2 right-1/3 w-24 h-24 opacity-10"
          color="rgba(59, 130, 246, 0.3)"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <FloatingElement intensity="medium">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-12 h-12 text-purple-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Choose Your Role
            </h1>
            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto">
              Select your role to continue to the appropriate login experience
            </p>
          </div>
        </FloatingElement>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl w-full mb-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <div key={role.id} className="flex">
                <div
                  onClick={() => handleRoleSelect(role.id)}
                  className="w-full cursor-pointer"
                >
                  <GlassCard className={`p-6 sm:p-8 h-full flex flex-col relative overflow-visible border-2 transition-colors duration-200 ${
                    isSelected ? role.borderColor : 'border-white/10 hover:border-white/20'
                  }`}>
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.bgColor} flex items-center justify-center mb-6 border border-white/10 pointer-events-none`}>
                      <Icon className={`w-8 h-8 ${role.iconColor}`} />
                    </div>

                    {/* Role Name */}
                    <h3 className="text-2xl font-bold text-white mb-2 pointer-events-none">
                      {role.displayName}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-300 text-sm mb-6 pointer-events-none">
                      {role.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 flex-grow pointer-events-none">
                      {role.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.color} mt-2 flex-shrink-0`}></div>
                          <span className="text-slate-400 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to home link */}
        <button
          onClick={() => navigate('/')}
          className="mt-8 text-slate-400 hover:text-white transition-colors duration-200"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
