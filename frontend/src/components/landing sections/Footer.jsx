import React from 'react';
import { Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white py-8 z-10 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo and Brand */}
          <div className="flex items-center group">
            <div className="relative">
              <Monitor className="h-6 w-6 text-blue-400 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="ml-2 text-lg font-bold">VISTA</span>
          </div>

          {/* Copyright */}
          <p className="text-gray-400 text-sm">
            © 2025 VISTA. All rights reserved.
          </p>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <a
              href="#features"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              Features
            </a>

            <a
              href="#testimonials"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              Testimonials
            </a>

            {/* Request Service → Contact Page */}
            <Link
              to="/contact"
              className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:scale-105 relative group"
            >
              Request Service
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
