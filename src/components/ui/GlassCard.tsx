'use client';

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  glow?: 'primary' | 'cyan' | 'emerald' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  interactive = false,
  glow = 'none',
  ...props
}) => {
  const glowClasses = {
    primary: 'glow-primary',
    cyan: 'glow-cyan',
    emerald: 'glow-emerald',
    none: '',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${
        interactive ? 'glass-panel-interactive cursor-pointer' : 'glass-panel'
      } ${glowClasses[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

