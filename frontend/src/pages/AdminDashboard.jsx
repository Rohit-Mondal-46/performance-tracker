import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { FloatingElement } from '../components/ui/FloatingElement';
import { MorphingShape } from '../components/ui/MorphingShape';
import { StatsOverview } from '../components/admin/StatsOverview';
import { HRManagerManagement } from '../components/admin/HRManagerManagement.jsx';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboard() {
  const { getAllUsers } = useAuth();
  const hrManagers = getAllUsers().filter(u => u.role === 'hr_manager');
  const employees = getAllUsers().filter(u => u.role === 'employee');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <MorphingShape
          className="absolute top-10 left-10 w-32 h-32 opacity-20"
          color="rgba(220, 38, 38, 0.3)"
        />
        <MorphingShape
          className="absolute bottom-20 right-20 w-40 h-40 opacity-15"
          color="rgba(249, 115, 22, 0.3)"
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <FloatingElement intensity="medium">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-10 h-10 text-red-400" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
          </FloatingElement>
          <p className="text-slate-300 text-base sm:text-lg">
            Manage HR Managers and oversee the entire system
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview 
          hrManagers={hrManagers}
          employees={employees}
          totalUsers={getAllUsers().length}
        />

        {/* HR Manager Management */}
        <HRManagerManagement />
      </div>
    </div>
  );
}