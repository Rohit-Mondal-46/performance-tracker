import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card3D } from "../ui/landing ui/Card3D";
import { RippleButton } from "../ui/landing ui/RippleButton";

export function CTASection() {
  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Card3D hoverEffect="scale">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl transform transition-all duration-700 overflow-hidden">
            {/* Enhanced animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "3s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "6s" }}
              ></div>
            </div>

            {/* Floating geometric shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute top-8 left-8 w-12 h-12 border-2 border-white/20 rounded-lg animate-spin"
                style={{ animationDuration: "10s" }}
              ></div>
              <div
                className="absolute top-16 right-16 w-8 h-8 border-2 border-white/20 rounded-full animate-bounce"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute bottom-16 left-16 w-6 h-6 bg-white/20 rounded-full animate-ping"
                style={{ animationDelay: "2s" }}
              ></div>
              <div
                className="absolute bottom-8 right-8 w-10 h-10 border-2 border-white/20 transform rotate-45 animate-pulse"
                style={{ animationDelay: "3s" }}
              ></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 px-4">
                Ready to Transform Your Productivity?
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-8 text-blue-100 max-w-3xl mx-auto px-4">
                Join thousands of teams already using VISTA to boost
                productivity and achieve better work-life balance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
                <Link to="/contact" className="w-full sm:w-auto">
                  <RippleButton
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl w-full sm:w-auto justify-center flex items-center"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </RippleButton>
                </Link>

                <RippleButton
                  variant="secondary"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto justify-center flex items-center"
                >
                  Schedule Demo
                </RippleButton>
              </div>

              <p className="text-sm text-blue-100 mt-6 animate-fade-in-up stagger-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </Card3D>
      </div>
    </section>
  );
}
