import React from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function HRManagerList({ hrManagers }) {
  const { deleteUser } = useAuth();

  const handleDeleteHRManager = (userId) => {
    if (window.confirm('Are you sure you want to delete this HR Manager?')) {
      deleteUser(userId);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Current HR Managers</h3>
      {hrManagers.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No HR Managers yet. Create one to get started!</p>
      ) : (
        <div className="space-y-3">
          {hrManagers.map((manager) => (
            <div
              key={manager.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={manager.avatar}
                  alt={manager.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-500/50"
                />
                <div>
                  <p className="text-white font-medium">{manager.name}</p>
                  <p className="text-slate-400 text-sm">{manager.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteHRManager(manager.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="Delete HR Manager"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}