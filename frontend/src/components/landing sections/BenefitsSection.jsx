import React from 'react';
import { CheckCircle, Shield, Zap, TrendingUp, Users, Award, Globe } from 'lucide-react';
import { Card3D } from '../ui/landing ui/Card3D';

export function BenefitsSection() {
  const benefits = [
    {
      icon: CheckCircle,
      title: 'Increase Productivity by 40%',
      description: 'Our AI-powered insights help teams identify and eliminate productivity bottlenecks.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Blockchain verification and local processing ensure your data remains secure and private.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Zap,
      title: 'Real-Time Feedback',
      description: 'Get instant notifications and insights to stay focused and maintain peak performance.',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const stats = [
    { icon: TrendingUp, value: '89%', label: 'Avg Productivity' },
    { icon: Users, value: '24', label: 'Team Members' },
    { icon: Award, value: '95%', label: 'Engagement' },
    { icon: Globe, value: '7.8h', label: 'Daily Average' }
  ];

  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <Card3D hoverEffect="lift">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 px-4 lg:px-0">
                Why Choose
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  ProMonitor?
                </span>
              </h2>
              
              <div className="space-y-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start group">
                    <div className={`bg-gradient-to-br ${benefit.color} p-3 rounded-xl mr-4 mt-1 shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 relative overflow-hidden`}>
                      <benefit.icon className="h-6 w-6 text-white relative z-10" />
                      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                    </div>
                    <div className="transform transition-transform duration-300 group-hover:translate-x-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card3D>

          <Card3D delay={400} hoverEffect="rotate">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl transform transition-all duration-700 overflow-hidden relative">
                {/* Enhanced animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>
                
                {/* Floating geometric shapes */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/20 rounded-lg animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 right-8 w-4 h-4 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                </div>
                
                <div className="relative z-10 grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center group">
                      <div className="transform transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                        <div className="relative mb-3">
                          <stat.icon className="h-8 w-8 mx-auto transform transition-transform duration-300 group-hover:rotate-12" />
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="text-2xl font-bold mb-1 transform transition-transform duration-300 group-hover:scale-110">{stat.value}</div>
                        <div className="text-blue-100 text-sm">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card3D>
        </div>
      </div>
    </section>
  );
}