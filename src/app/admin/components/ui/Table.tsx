import React from 'react';

export function Table({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left text-sm whitespace-nowrap">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="text-xs uppercase tracking-wider text-admin-text-muted bg-admin-bg/50 border-y border-admin-border">
      {children}
    </thead>
  );
}

export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={`border-b border-admin-border hover:bg-admin-border/30 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', align = 'left' }: { children: React.ReactNode, className?: string, align?: 'left' | 'center' | 'right' }) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  return (
    <th className={`px-6 py-4 font-semibold ${alignments[align]} ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', align = 'left' }: { children: React.ReactNode, className?: string, align?: 'left' | 'center' | 'right' }) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  return (
    <td className={`px-6 py-4 ${alignments[align]} ${className}`}>
      {children}
    </td>
  );
}
