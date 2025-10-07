import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { testimonials } from '../../data/testimonials';

export function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="relative py-20 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/50 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Card3D className="text-center mb-16" hoverEffect="lift">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-4">
            Trusted by Leading Teams
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 px-4">
            See what our customers are saying about ProMonitor
          </p>
        </Card3D>

        <Card3D hoverEffect="scale">
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-700 hover:shadow-blue-500/10 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center mb-6">
                  <div className="relative mb-4 sm:mb-0">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      className="h-16 w-16 rounded-full shadow-lg transform transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                  <div className="sm:ml-6 text-center sm:text-left">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                    </p>
                  </div>
                  <div className="sm:ml-auto flex mt-4 sm:mt-0">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-5 w-5 text-yellow-400 fill-current transform transition-transform duration-300 hover:scale-125" 
                        style={{ animationDelay: `${i * 100}ms` }} 
                      />
                    ))}
                  </div>
                </div>
                
                <blockquote className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed italic transform transition-all duration-500 text-center sm:text-left">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
              </div>
            </div>

            {/* Enhanced testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-500 transform hover:scale-125 relative overflow-hidden ${
                    index === currentTestimonial 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                >
                  {index === currentTestimonial && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card3D>
      </div>
    </section>
  );
}