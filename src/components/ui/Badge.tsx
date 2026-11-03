'use client';

import React from 'react';
import { ProjectStatus, TaskStatus, Priority } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: ProjectStatus | TaskStatus;
  priority?: Priority;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  priority,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  // Handle Project Status
  if (status) {
    if (status === ProjectStatus.IN_PROGRESS || status === TaskStatus.IN_PROGRESS) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${className}`}
          style={{
            backgroundColor: 'var(--primary-tint)',
            color: 'var(--primary)',
            border: '1px solid rgba(127, 119, 221, 0.25)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
          {children || (status === ProjectStatus.IN_PROGRESS ? 'In Progress' : 'In Progress')}
        </span>
      );
    }
    if (status === ProjectStatus.COMPLETED || status === TaskStatus.DONE) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${className}`}
          style={{
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success-text)',
            border: '1px solid rgba(39, 80, 10, 0.2)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {children || (status === ProjectStatus.COMPLETED ? 'Completed' : 'Done')}
        </span>
      );
    }
    if (status === ProjectStatus.PENDING || status === TaskStatus.TODO) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${className}`}
          style={{
            backgroundColor: 'var(--warning-bg)',
            color: 'var(--warning-text)',
            border: '1px solid rgba(99, 56, 6, 0.2)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {children || (status === ProjectStatus.PENDING ? 'Pending' : 'To Do')}
        </span>
      );
    }
  }

  // Handle Task Priority
  if (priority) {
    const dotColors = {
      [Priority.HIGH]: 'bg-rose-500',
      [Priority.MEDIUM]: 'bg-amber-400',
      [Priority.LOW]: 'bg-sky-400',
    };
    const labels = {
      [Priority.HIGH]: 'High',
      [Priority.MEDIUM]: 'Medium',
      [Priority.LOW]: 'Low',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${className}`}
        style={{ color: 'var(--text)' }}
      >
        <span className={`w-2 h-2 rounded-full ${dotColors[priority]}`} />
        <span>{children || labels[priority]}</span>
      </span>
    );
  }

  // Handle generic variants
  const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
    primary: {
      bg: 'var(--primary-tint)',
      text: 'var(--primary)',
      border: 'rgba(127, 119, 221, 0.25)',
    },
    success: {
      bg: 'var(--success-bg)',
      text: 'var(--success-text)',
      border: 'rgba(39, 80, 10, 0.2)',
    },
    warning: {
      bg: 'var(--warning-bg)',
      text: 'var(--warning-text)',
      border: 'rgba(99, 56, 6, 0.2)',
    },
    danger: {
      bg: 'var(--danger-bg)',
      text: 'var(--danger-text)',
      border: 'rgba(121, 31, 31, 0.2)',
    },
    info: {
      bg: 'var(--info-bg)',
      text: 'var(--info-text)',
      border: 'rgba(12, 68, 124, 0.2)',
    },
    neutral: {
      bg: 'var(--neutral-bg)',
      text: 'var(--neutral-text)',
      border: 'var(--border)',
    },
  };

  const styleConfig = variantStyles[variant || 'neutral'];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${className}`}
      style={{
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
        border: `1px solid ${styleConfig.border}`,
      }}
    >
      {children}
    </span>
  );
};

