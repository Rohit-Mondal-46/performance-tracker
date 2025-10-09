import React from 'react';
import { Check, X } from 'lucide-react';

export function PasswordStrengthIndicator({ password }) {
  const requirements = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd) => /[0-9]/.test(pwd) },
    { label: 'Contains special character', test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];

  const metRequirements = requirements.filter(req => req.test(password));
  const strength = metRequirements.length;

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-slate-600';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-orange-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength === 0) return 'No password';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-300 text-sm font-medium">Password Strength</span>
          <span className={`text-sm font-medium ${
            strength <= 2 ? 'text-red-400' :
            strength <= 3 ? 'text-orange-400' :
            strength <= 4 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                index < strength ? getStrengthColor() : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <div key={index} className="flex items-center space-x-2">
              {isMet ? (
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={`text-xs ${isMet ? 'text-slate-300' : 'text-slate-500'}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
