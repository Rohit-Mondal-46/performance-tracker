import React from 'react';
import { Monitor, Globe, Shield, Brain } from 'lucide-react';

export function Footer() {
  const productLinks = ['Features', 'Pricing', 'Security', 'API'];
  const companyLinks = ['About', 'Blog', 'Careers', 'Contact'];
  const legalLinks = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];

  return (
    <footer className="relative bg-gray-900 text-white py-16 z-10 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4 group">
              <div className="relative">
                <Monitor className="h-8 w-8 text-blue-400 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="ml-2 text-xl font-bold">VISTA</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-md">
              The future of workplace productivity monitoring. Secure, intelligent, and privacy-focused.
            </p>
            <div className="flex space-x-4">
              {[Globe, Shield, Brain].map((Icon, index) => (
                <div key={index} className="group bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              {productLinks.map((item, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              {companyLinks.map((item, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 VISTA. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 mt-4 md:mt-0">
            {legalLinks.map((item, index) => (
              <a key={index} href="#" className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-y-1 relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}