import React from 'react';
import { StatusBadge } from './StatusBadge';


const colorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
  green: 'bg-green-100 dark:bg-green-900/20 text-green-600',
  orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
  purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
  red: 'bg-red-100 dark:bg-red-900/20 text-red-600',
};

export function AnimatedCard({ title, value, icon: Icon, color, subtitle, delay = 0, onClick, changeText, changeStatus, className, children }) {
  // If children are provided, render wrapper
  if (children) {
    return (
      <div 
        className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-xl cursor-pointer perspective-1000 animate-fade-in-up ${className || ''}`}
        style={{ animationDelay: `${delay}ms` }}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  // Original stat card rendering when props are provided
  return (
    <div 
      className={`group bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-xl cursor-pointer perspective-1000 animate-fade-in-up ${className || ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="relative preserve-3d group-hover:rotate-y-5 transition-transform duration-500">
        <div className="flex items-center justify-between mb-4 w-full">
          <div className={`${color ? colorClasses[color] : ''} p-3 rounded-xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 relative overflow-hidden`}>
            {Icon && <Icon className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
          </div>
          {changeText && changeStatus && (
            <StatusBadge status={changeStatus}>
              {changeText}
            </StatusBadge>
          )}
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-500 mb-1">
            {value}
          </p>
          {title && <p className="text-slate-400 text-sm">{title}</p>}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">{subtitle}</p>
          )}
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-4 right-6 w-1 h-1 bg-purple-400 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-pink-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
}