import React from 'react';
import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  icon: Icon = FileSearch, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-admin-card rounded-xl border border-admin-border shadow-sm min-h-[250px]">
      <div className="h-12 w-12 rounded-full bg-admin-border/50 flex items-center justify-center mb-4">
        <Icon size={24} className="text-admin-text-muted" />
      </div>
      <h3 className="text-admin-text-primary font-medium">{title}</h3>
      {description && <p className="text-admin-text-muted text-sm mt-1 mb-4 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
