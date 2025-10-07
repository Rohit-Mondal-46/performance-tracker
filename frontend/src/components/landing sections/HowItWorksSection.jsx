import React from 'react';
import { Monitor, Brain, TrendingUp, Sparkles } from 'lucide-react';
import { Card3D } from '../ui/Card3D';

export function HowItWorksSection() {
  const steps = [
    {
      step: 1,
      title: 'Quick Setup',
      description: 'Install ProMonitor and grant camera permissions. Our AI starts learning your work patterns immediately.',
      color: 'from-blue-500 to-blue-600',
      icon: Monitor
    },
    {
      step: 2,
      title: 'Smart Monitoring',
      description: 'AI analyzes your activity patterns, detecting focus levels, distractions, and engagement in real-time.',
      color: 'from-green-500 to-green-600',
      icon: Brain
    },
    {
      step: 3,
      title: 'Actionable Insights',
      description: 'Receive detailed reports and recommendations to optimize your productivity and work habits.',
      color: 'from-purple-500 to-purple-600',
      icon: TrendingUp
    }
  ];

  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Card3D className="text-center mb-16" hoverEffect="lift">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-4">
            How ProMonitor Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 px-4">
            Simple setup, powerful insights, complete privacy
          </p>
        </Card3D>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          {steps.map((item, index) => (
            <Card3D key={index} delay={index * 300} hoverEffect="rotate">
              <div className="text-center group relative">
                {/* Connection line to next step */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-12 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 z-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                )}
                
                <div className="relative mb-8 z-10">
                  <div className={`bg-gradient-to-br ${item.color} w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 relative overflow-hidden`}>
                    <span className="text-3xl font-bold text-white relative z-10">{item.step}</span>
                    <item.icon className="absolute inset-0 m-auto h-8 w-8 text-white/30" />
                    <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse`}></div>
                  
                  {/* Floating mini icons */}
                  <div className="absolute -top-4 -right-4 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transform transition-transform duration-300 group-hover:translate-y-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}