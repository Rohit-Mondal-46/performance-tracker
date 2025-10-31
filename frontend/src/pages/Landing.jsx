import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FloatingParticles } from '../components/ui/landing ui/FloatingParticles';
import { Navigation } from '../components/layout/Navigation';
import { HeroSection } from '../components/landing sections/HeroSection';
import { FeaturesSection } from '../components/landing sections/FeaturesSection';
import { HowItWorksSection } from '../components/landing sections/HowItWorksSection';
import { TestimonialsSection } from '../components/landing sections/TestimonialsSection';
import { BenefitsSection } from '../components/landing sections/BenefitsSection';
import { PricingSection } from '../components/landing sections/PricingSection';
import { CTASection } from '../components/landing sections/CTASection';
import { Footer } from '../components/landing sections/Footer';

export function Landing() {
  const { isDark } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-pink-900/20"></div>
        <FloatingParticles />
        
        {/* Interactive gradient orbs that follow mouse */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x / 10,
            top: mousePosition.y / 10,
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl transition-all duration-1500 ease-out"
          style={{
            right: mousePosition.x / 15,
            bottom: mousePosition.y / 15,
          }}
        />
      </div>

      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <BenefitsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}