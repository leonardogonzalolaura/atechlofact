'use client'
import React from 'react';

interface SunatStatusIndicatorProps {
  status: 'pending' | 'sent' | 'accepted' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const SunatStatusIndicator = ({ status, size = 'md', showText = true }: SunatStatusIndicatorProps) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳',
        text: 'Pendiente'
      },
      sent: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📤',
        text: 'Enviado'
      },
      accepted: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
        text: 'Aceptado'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '❌',
        text: 'Rechazado'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getSizeClasses = (size: string) => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[size as keyof typeof sizes] || sizes.md;
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClasses}`}
      title={`Estado SUNAT: ${config.text}`}
    >
      <span className="mr-1">{config.icon}</span>
      {showText && config.text}
    </span>
  );
};

export default SunatStatusIndicator;