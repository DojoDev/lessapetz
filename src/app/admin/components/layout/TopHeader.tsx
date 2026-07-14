'use client';

import { Bell, Search } from 'lucide-react';

export default function TopHeader({ email, role }: { email?: string, role?: string }) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <p className="text-sm text-slate-400 capitalize">{today}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-slate-900 border border-slate-800 text-sm rounded-full pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 w-64 transition-all"
          />
        </div>

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-teal-500 rounded-full border-2 border-slate-950"></span>
        </button>

        <div className="flex items-center gap-3 ml-2">
          <div className="text-sm text-slate-400 hidden sm:flex flex-col items-end">
            <span className="font-medium text-slate-200">{email}</span>
            <span className="text-xs">{role === 'root' ? 'Root Admin' : 'Admin'}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-sm font-bold text-slate-950 ring-2 ring-slate-800">
            {email ? email.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
