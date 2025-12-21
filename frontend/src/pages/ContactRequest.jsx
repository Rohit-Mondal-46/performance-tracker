import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Building, MapPin, Briefcase, Send, CheckCircle, Sparkles, Home, ArrowLeft, Clock, Shield, BarChart } from 'lucide-react';
import { contactAPI } from '../services/api';

export function ContactRequest() {
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    industry: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Construction',
    'Transportation',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.organizationName.trim() || !formData.email.trim()) {
      setError('Organization Name and Email are required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await contactAPI.sendContactRequest(formData);
      
      if (response.data.success) {
        // Save email before resetting form
        setSubmittedEmail(formData.email);
        setSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          organizationName: '',
          email: '',
          industry: '',
          location: ''
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(response.data.message || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error sending contact request:', err);
      setError(err.response?.data?.message || 'Failed to send request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-6 overflow-hidden relative">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              backgroundColor: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, 0.2)`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back to Home Button
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">Back to Home</span>
          </Link>
        </div> */}

        {/* Header */}
        <div className="text-center mb-12 pt-4">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 animate-float">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Request Our Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Fill the detials carefully. we'll get back to you within 24 hours.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-500/30 dark:border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  <CheckCircle className="relative w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Request Sent Successfully!</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Thank you for your interest. Our team will contact you at <span className="text-gray-900 dark:text-white font-semibold">{submittedEmail}</span> within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 dark:from-red-500/10 dark:to-pink-500/10 border border-red-500/30 dark:border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-8 h-8 text-red-600 dark:text-red-400 flex items-center justify-center">
                    !
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Error</h3>
                  <p className="text-gray-700 dark:text-gray-300">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-300/50 dark:border-gray-700/50 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/10 transform transition-all duration-500 hover:scale-[1.01]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Organization Name */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-300/50 dark:border-gray-700/50 group-hover:border-transparent transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Building className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold text-lg mb-1">
                      Organization Name *
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Your company or organization name</p>
                  </div>
                </div>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter organization name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-300/50 dark:border-gray-700/50 group-hover:border-transparent transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold text-lg mb-1">
                      Email Address *
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Where we can reach you</p>
                  </div>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Industry */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-300/50 dark:border-gray-700/50 group-hover:border-transparent transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 text-green-500 dark:text-green-400" />
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold text-lg mb-1">
                      Industry
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Select your industry</p>
                  </div>
                </div>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-6 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 appearance-none"
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-300/50 dark:border-gray-700/50 group-hover:border-transparent transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold text-lg mb-1">
                      Location
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Your city and country</p>
                  </div>
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter location (e.g., New York, USA)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-8 py-5 font-bold text-lg transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Send Request</span>
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Home Button at Bottom */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-gray-300/50 dark:border-gray-700/50 hover:border-blue-500/30"
          >
            <Home className="w-5 h-5" />
            <span>Return to Homepage</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 pb-8">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            By submitting this form, you agree to our{' '}
            <a href="#" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Privacy Policy</a>
            {' '}and{' '}
            <a href="#" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        /* Custom select arrow */
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.5em 1.5em;
        }
        
        select:focus {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        }
        
        /* Dark mode select arrow */
        @media (prefers-color-scheme: dark) {
          select {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          }
          
          select:focus {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          }
        }
      `}</style>
    </div>
  );
}