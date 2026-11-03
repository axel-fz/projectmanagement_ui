'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, suffix, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--muted)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--muted)]">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl py-2 text-sm transition-all duration-150 glass-input placeholder:text-[var(--muted)]/70 ${
              icon ? 'pl-10' : 'pl-3.5'
            } ${suffix ? 'pr-10' : 'pr-3.5'} ${
              error ? 'border-rose-500 focus:border-rose-500' : ''
            } ${className}`}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center text-[var(--muted)]">
              {suffix}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-rose-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

