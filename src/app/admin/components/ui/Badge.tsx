import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = 'neutral', children, className = '', ...props }: BadgeProps) {
  const baseClasses = 'px-2 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md inline-flex items-center justify-center';
  
  const variants = {
    success: 'bg-admin-success-bg text-admin-success',
    warning: 'bg-admin-warning-bg text-admin-warning',
    danger: 'bg-admin-danger-bg text-admin-danger',
    neutral: 'bg-admin-border text-admin-text-secondary',
    accent: 'bg-admin-accent-muted text-admin-accent',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
