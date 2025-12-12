import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, User, Check, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);

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
      description: 'Full system access with ability to manage organizations and monitor overall performance',
      features: [
        'Create and manage organizations',
        'Generate login credentials',
        'View all employees across organizations',
        'Access system-wide analytics'
      ]
    },
    {
      id: 'organization',
      name: 'Organization',
      displayName: 'Organization Manager',
      icon: Users,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-500/10 to-purple-500/10',
      borderColor: 'border-blue-500/50',
      iconColor: 'text-blue-400',
      description: 'Manage employees, monitor productivity, and generate reports for your organization',
      features: [
        'Add and manage employees',
        'Monitor employee productivity',
        'Generate detailed reports',
        'View organization analytics'
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
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-purple-400 animate-float" />
              <div className="absolute inset-0 bg-purple-400/20 blur-lg rounded-full" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-slideDown">
            Choose Your Role
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto animate-slideUp">
            Select your role to continue to the appropriate login experience
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl w-full mb-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            const isHovered = hoveredRole === role.id;

            return (
              <div
                key={role.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                <div
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full cursor-pointer transition-all duration-300 ease-out ${
                    isSelected ? 'transform scale-105' : isHovered ? 'transform scale-102' : ''
                  }`}
                >
                  <GlassCard className={`p-6 sm:p-8 h-full flex flex-col relative overflow-hidden border-2 transition-all duration-300 ${
                    isSelected ? `${role.borderColor} shadow-2xl` : 'border-white/10'
                  } ${isHovered ? 'border-white/30 bg-white/5' : ''}`}>
                    
                    {/* Animated Background Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.bgColor} opacity-0 transition-opacity duration-300 ${
                      isHovered || isSelected ? 'opacity-100' : ''
                    }`} />
                    
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounceIn">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}

                    {/* Content Container */}
                    <div className="relative z-10">
                      {/* Icon with Hover Effect */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.bgColor} flex items-center justify-center mb-6 border border-white/10 transition-all duration-300 ${
                        isHovered || isSelected ? 'transform scale-110 shadow-lg' : ''
                      }`}>
                        <div className="relative">
                          <Icon className={`w-8 h-8 ${role.iconColor} transition-transform duration-300 ${
                            isHovered || isSelected ? 'transform scale-110' : ''
                          }`} />
                          {(isHovered || isSelected) && (
                            <div className="absolute inset-0 bg-current blur-md opacity-30" />
                          )}
                        </div>
                      </div>

                      {/* Role Name */}
                      <h3 className={`text-2xl font-bold text-white mb-2 transition-all duration-300 ${
                        isHovered || isSelected ? 'transform translate-y-[-2px]' : ''
                      }`}>
                        {role.displayName}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-300 text-sm mb-6">
                        {role.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3 flex-grow">
                        {role.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start space-x-2 transition-all duration-300"
                            style={{ transitionDelay: `${idx * 50}ms` }}
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${role.color} mt-2 flex-shrink-0 transition-transform duration-300 ${
                              isHovered || isSelected ? 'transform scale-125' : ''
                            }`} />
                            <span className={`text-slate-400 text-sm transition-all duration-300 ${
                              isHovered || isSelected ? 'text-slate-300 transform translate-x-1' : ''
                            }`}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Animated Border Bottom */}
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${role.color} transform origin-left transition-transform duration-500 ${
                        isHovered || isSelected ? 'scale-x-100' : 'scale-x-0'
                      }`} />
                    </div>
                  </GlassCard>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="group mt-8 text-slate-400 hover:text-white transition-all duration-300 animate-fadeIn"
          style={{ animationDelay: '600ms' }}
        >
          <span className="relative">
            <span className="relative z-10 flex items-center space-x-2">
              <span>Back to Home</span>
              <svg
                className="w-4 h-4 transform -rotate-180 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
          </span>
        </button>
      </div>

      {/* Add custom animations to global CSS or style tag */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-10px) translateX(5px);
          }
          66% {
            transform: translateY(5px) translateX(-5px);
          }
        }
        
        @keyframes bounceIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.6s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.4s ease-out forwards;
        }
        
        .transform.scale-102 {
          transform: scale(1.02);
        }
        
        .transform.scale-105 {
          transform: scale(1.05);
        }
        
        .transform.scale-110 {
          transform: scale(1.1);
        }
        
        .transform.scale-125 {
          transform: scale(1.25);
        }
        
        .transform.translate-y-\[-2px\] {
          transform: translateY(-2px);
        }
        
        .transform.translate-x-1 {
          transform: translateX(0.25rem);
        }
      `}</style>
    </div>
  );
}