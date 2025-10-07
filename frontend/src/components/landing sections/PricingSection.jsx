import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { RippleButton } from '../ui/RippleButton';
import { pricingPlans } from '../../data/pricing';

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-20 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/50 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Card3D className="text-center mb-16" hoverEffect="lift">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-4">
            Simple, Transparent
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Pricing
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 px-4">
            Choose the plan that fits your team size and needs
          </p>
        </Card3D>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card3D 
              key={index} 
              delay={index * 200} 
              hoverEffect={plan.popular ? "scale" : "lift"} 
              glowColor={index === 0 ? 'blue' : index === 1 ? 'purple' : 'green'}
            >
              <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-500 h-full relative overflow-visible ${
                plan.popular ? 'pt-10 border-2 border-blue-500/50' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg relative overflow-hidden">
                      Most Popular
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </span>
                  </div>
                )}

                {/* Animated background for popular plan */}
                {plan.popular && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-pink-900/20 opacity-50 rounded-3xl"></div>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-gradient-x"></div>
                  </>
                )}

                <div className="relative z-10">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.borderColor} rounded-t-3xl`}></div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/user/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center transform transition-transform duration-300 hover:translate-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 transform transition-transform duration-300 hover:scale-110" />
                        <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <RippleButton 
                    variant={plan.popular ? "primary" : "secondary"} 
                    className="w-full"
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </RippleButton>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}