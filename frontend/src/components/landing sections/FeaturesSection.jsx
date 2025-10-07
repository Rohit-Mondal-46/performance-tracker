import React from 'react';
import { Card3D } from '../ui/Card3D';
import { features } from '../../data/features';

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-20 mt-20 lg:mt-32 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Card3D className="text-center mb-16" hoverEffect="lift">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-4">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Modern Teams
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
            Everything you need to monitor, analyze, and improve productivity across your organization
          </p>
        </Card3D>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card3D 
              key={index} 
              delay={index * 150} 
              hoverEffect={index % 2 === 0 ? 'lift' : 'rotate'}
              glowColor={index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'purple' : 'green'}
            >
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
                {/* Enhanced animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/10 dark:via-purple-900/5 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Animated particles in background */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        left: `${20 + i * 20}%`,
                        top: `${30 + i * 15}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: `${3 + i}s`
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg relative overflow-hidden`}>
                    <feature.icon className="h-7 w-7 relative z-10" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Enhanced hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}