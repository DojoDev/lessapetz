'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays,
  PackageSearch,
  ClipboardList,
  BellRing,
  LogOut,
  Sparkles,
  Box,
  X
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import { useI18n } from '../../../../i18n/I18nProvider';

export default function Sidebar({ isMobileOpen, onClose }: { isMobileOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();
  const { dict } = useI18n();

  const navItems = [
    { label: dict.sidebar.dashboard, icon: LayoutDashboard, href: '/admin' },
    { label: dict.sidebar.schedule, icon: CalendarDays, href: '/admin/schedule' },
    { label: dict.sidebar.customers, icon: Users, href: '/admin/customers' },
    { label: dict.sidebar.services, icon: ClipboardList, href: '/admin/services' },
    { label: dict.sidebar.plans, icon: PackageSearch, href: '/admin/plans' },
    { label: dict.sidebar.products, icon: Box, href: '/admin/products' },
    { label: dict.sidebar.alerts, icon: BellRing, href: '/admin/alerts' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`w-64 bg-slate-950 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="text-teal-400" size={24} />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            VetFlow
          </span>
        </div>
        
        {/* Mobile close button */}
        {isMobileOpen && (
          <button onClick={onClose} className="lg:hidden ml-auto p-2 -mr-2 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-500/10 text-teal-400' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-teal-400' : 'text-slate-500'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 shrink-0 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer w-full text-left font-medium">
          <LogOut size={20} />
          <LogoutButton className="text-inherit hover:text-inherit w-full text-left" />
        </div>
        <div className="text-center text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-2">
          VetFlow - By Automia
        </div>
      </div>
    </aside>
    </>
  );
}
