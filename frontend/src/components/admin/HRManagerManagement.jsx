import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { FloatingElement } from '../ui/FloatingElement';
import { AnimatedCard } from '../ui/AnimatedCard';
import { GlassCard } from '../ui/GlassCard';
import { HRManagerForm } from './HRManagerForm';
import { HRManagerList } from './HRManagerList';
import { useAuth } from '../../contexts/AuthContext';
import { CredentialsAlert } from './CredentialsAlert';



export function HRManagerManagement() {
  const { getAllUsers } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const hrManagers = getAllUsers().filter(u => u.role === 'hr_manager');

  return (
    <div className="mb-8">
      <FloatingElement intensity="medium">
        <AnimatedCard>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">HR Manager Management</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add HR Manager</span>
              </button>
            </div>

            {/* Add HR Manager Form */}
            {showForm && (
              <HRManagerForm 
                onClose={() => setShowForm(false)}
                onSuccess={(credentials) => setGeneratedCredentials(credentials)}
              />
            )}

            {/* Generated Credentials Alert */}
            {generatedCredentials && (
              <CredentialsAlert 
                credentials={generatedCredentials}
                onClose={() => setGeneratedCredentials(null)}
              />
            )}

            {/* HR Managers List */}
            <HRManagerList hrManagers={hrManagers} />
          </GlassCard>
        </AnimatedCard>
      </FloatingElement>
    </div>
  );
}