import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Sparkles, Play, ArrowRight, ChevronDown } from 'lucide-react';
import { ParallaxSection } from '../ui/ParallaxSection';
import { Card3D } from '../ui/Card3D';
import { RippleButton } from '../ui/RippleButton';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { MorphingShape } from '../ui/MorphingShape';
import { Cube3D } from '../ui/Cube3D';
import { stats } from '../../data/stats';

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 sm:pb-24 md:pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center w-full">
      <div className="w-full max-w-7xl mx-auto">
        <ParallaxSection speed={0.3}>
          <div className="relative z-10 w-full">
            <div className="text-center w-full">
              {/* Logo Animation */}
              <div className="flex justify-center mb-8 w-full">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 p-8 rounded-2xl transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-y-12 shadow-2xl">
                    <Monitor className="h-20 w-20 text-blue-600 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                    
                    {/* Orbiting elements */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 -right-4 w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
              
              {/* Title */}
              <div className="relative max-w-5xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight px-4">
                  <span className="inline-block animate-fade-in-up stagger-1">
                    AI-Powered
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block animate-fade-in-up stagger-2 bg-size-200 animate-gradient-x">
                    Productivity Monitoring
                  </span>
                </h1>

                {/* Floating elements */}
                <MorphingShape className="hidden xl:block absolute -top-16 -left-32 opacity-30" />
                <Cube3D className="hidden xl:block absolute -top-8 -right-32 opacity-40" />
                <div className="hidden xl:block absolute top-1/2 -right-40 w-12 h-12 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up stagger-3 px-4">
                Transform your workplace with intelligent monitoring that tracks focus, engagement, and productivity
                in real-time. Secure, private, and powered by cutting-edge AI technology.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 animate-fade-in-up stagger-4 px-4 max-w-3xl mx-auto">
                <Link to="/login" className="w-full sm:w-auto">
                  <RippleButton variant="primary" className="flex items-center justify-center w-full sm:w-auto">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </RippleButton>
                </Link>

                <RippleButton variant="secondary" className="flex items-center justify-center w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" />
                  Watch Demo
                </RippleButton>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto animate-fade-in-up stagger-5 px-4 mt-16">
                {stats.map((stat, index) => (
                  <Card3D key={index} delay={index * 200} hoverEffect="scale" glowColor={index % 2 === 0 ? 'blue' : 'purple'}>
                    <div className="text-center group p-4">
                      <AnimatedCounter 
                        end={stat.number.includes('+') ? parseInt(stat.number.replace(/[^0-9]/g, '')) : 
                             stat.number.includes('%') ? parseInt(stat.number.replace('%', '')) :
                             stat.number.includes('.') ? parseFloat(stat.number) : parseInt(stat.number)}
                        suffix={stat.number.includes('+') ? '+' : 
                               stat.number.includes('%') ? '%' : 
                               stat.number.includes('/') ? '/7' : ''}
                      />
                      <div className="text-gray-600 dark:text-gray-400 font-medium transform transition-transform duration-300 group-hover:scale-105">
                        {stat.label}
                      </div>
                    </div>
                  </Card3D>
                ))}
              </div>
            </div>
          </div>
        </ParallaxSection>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="flex flex-col items-center">
          <ChevronDown className="h-6 w-6 text-gray-400 animate-pulse" />
          <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent mt-2"></div>
        </div>
      </div>
    </section>
  );
}