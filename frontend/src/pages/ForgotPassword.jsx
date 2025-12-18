import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('employee'); // 'employee' or 'organization'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = userType === 'employee' 
        ? authAPI.employeeForgotPassword 
        : authAPI.organizationForgotPassword;
      
      await endpoint({ email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-gray-400 mb-6">
              If an account exists with <strong className="text-white">{email}</strong>, 
              you will receive a password reset link shortly.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please check your spam folder if you don't see the email within a few minutes.
            </p>
            
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl shadow-blue-500/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-400">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('employee')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    userType === 'employee'
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-gray-800/50 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="text-sm font-medium">Employee</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('organization')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    userType === 'organization'
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-gray-800/50 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="text-sm font-medium">Organization</div>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </motion.button>

            {/* Back to Login */}
            <div className="text-center pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
