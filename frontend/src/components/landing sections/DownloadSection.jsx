import React from 'react';
import { Download, CheckCircle, Monitor, Apple, Laptop } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function DownloadSection() {
  const { isDark } = useTheme();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = 'https://github.com/Rohit-Mondal-46/performance-tracker/releases/latest/download/vista-setup.exe';
    link.download = 'VISTA-Setup.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="download" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Download VISTA Desktop App
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started with our powerful desktop application for seamless performance tracking
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-500"></div>
            
            {/* Main card */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left side - Download button and info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="text-xl font-semibold">Windows Desktop App</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Compatible with Windows 10/11</p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <Download className="w-6 h-6 group-hover:animate-bounce" />
                      Download Now for Windows
                    </span>
                  </button>

                  {/* Mac and Linux Coming Soon */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium text-sm cursor-not-allowed border border-gray-200 dark:border-gray-600 flex items-center justify-center gap-2"
                    >
                      <Apple className="w-4 h-4" />
                      <span>macOS Soon</span>
                    </button>
                    <button
                      disabled
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium text-sm cursor-not-allowed border border-gray-200 dark:border-gray-600 flex items-center justify-center gap-2"
                    >
                      <Laptop className="w-4 h-4" />
                      <span>Linux Soon</span>
                    </button>
                  </div>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Free download • Quick installation • Secure
                  </p>
                </div>

                {/* Right side - Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">What's included:</h4>
                  {[
                    'Real-time activity tracking',
                    'Detailed analytics',
                    'Automatic performance scoring',
                    'Secure data encryption',
                    'Lightweight & efficient'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation note */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  💡 <strong>Quick Setup:</strong> Download, install, and start tracking in under 2 minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System requirements note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            System Requirements: Windows 10/11 (64-bit) • 4GB RAM
          </p>
        </div>
      </div>
    </section>
  );
}
