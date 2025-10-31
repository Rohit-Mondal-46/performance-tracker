import React from 'react';
import { Shield, User } from 'lucide-react';
import { FloatingElement } from '../ui/FloatingElement';
import { AnimatedCard } from '../ui/AnimatedCard';
import { GlassCard } from '../ui/GlassCard';

export function StatsOverview({ hrManagers, employees, totalUsers }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <FloatingElement intensity="low">
        <AnimatedCard>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">HR Managers</p>
                <p className="text-3xl font-bold text-white">{hrManagers.length}</p>
              </div>
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
          </GlassCard>
        </AnimatedCard>
      </FloatingElement>

      <FloatingElement intensity="low" delay={100}>
        <AnimatedCard>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-white">{employees.length}</p>
              </div>
              <User className="w-12 h-12 text-green-400" />
            </div>
          </GlassCard>
        </AnimatedCard>
      </FloatingElement>

      <FloatingElement intensity="low" delay={200}>
        <AnimatedCard>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
              </div>
              <User className="w-12 h-12 text-purple-400" />
            </div>
          </GlassCard>
        </AnimatedCard>
      </FloatingElement>
    </div>
  );
}