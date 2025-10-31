import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Phone, MessageCircle, Coffee } from 'lucide-react';


export function StatusBadge({ status, size = 'md', animated = true, showIcon = true }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'working':
        return {
          icon: CheckCircle,
          label: 'Working',
          color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
          iconColor: 'text-green-500',
          glowColor: 'shadow-green-500/25'
        };
      case 'distracted':
        return {
          icon: AlertTriangle,
          label: 'Distracted',
          color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
          iconColor: 'text-orange-500',
          glowColor: 'shadow-orange-500/25'
        };
      case 'mobile_phone':
        return {
          icon: Phone,
          label: 'On Phone',
          color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
          iconColor: 'text-red-500',
          glowColor: 'shadow-red-500/25'
        };
      case 'absent':
        return {
          icon: XCircle,
          label: 'Absent',
          color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
          iconColor: 'text-red-500',
          glowColor: 'shadow-red-500/25'
        };
      case 'talking':
        return {
          icon: MessageCircle,
          label: 'Talking',
          color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
          iconColor: 'text-blue-500',
          glowColor: 'shadow-blue-500/25'
        };
      case 'break':
        return {
          icon: Coffee,
          label: 'On Break',
          color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
          iconColor: 'text-purple-500',
          glowColor: 'shadow-purple-500/25'
        };
      default:
        return {
          icon: XCircle,
          label: 'Inactive',
          color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
          iconColor: 'text-gray-500',
          glowColor: 'shadow-gray-500/25'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={`
      inline-flex items-center font-medium rounded-full border
      ${config.color}
      ${sizeClasses[size]}
      ${animated ? 'transform transition-all duration-300 hover:scale-110 hover:shadow-lg' : ''}
      ${animated ? config.glowColor : ''}
      relative overflow-hidden
    `}>
      {showIcon && (
        <Icon className={`${iconSizes[size]} ${config.iconColor} mr-1.5 ${animated ? 'animate-pulse' : ''}`} />
      )}
      <span className="relative z-10">{config.label}</span>
      
      {/* Animated background */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
      )}
    </div>
  );
}