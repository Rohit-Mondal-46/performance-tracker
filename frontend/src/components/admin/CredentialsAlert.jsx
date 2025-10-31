import React, { useState } from 'react';
import { CheckCircle, Copy } from 'lucide-react';

export function CredentialsAlert({ credentials, onClose }) {
  const [copiedPassword, setCopiedPassword] = useState(false);

  const handleCopyPassword = () => {
    if (credentials) {
      navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="mb-6 p-6 bg-green-500/10 border-2 border-green-500/50 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">HR Manager Created Successfully!</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <p className="text-slate-300 mb-4">Share these credentials with the new HR Manager:</p>
      <div className="bg-black/30 p-4 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Email:</span>
          <span className="text-white font-mono">{credentials.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Password:</span>
          <span className="text-white font-mono">{credentials.password}</span>
        </div>
      </div>
      <button
        onClick={handleCopyPassword}
        className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {copiedPassword ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            <span>Copy Credentials</span>
          </>
        )}
      </button>
    </div>
  );
}