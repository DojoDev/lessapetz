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
  Sparkles
} from 'lucide-react';
import LogoutButton from './LogoutButton';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Schedule', icon: CalendarDays, href: '/admin/schedule' },
    { label: 'Customers', icon: Users, href: '/admin/customers' },
    { label: 'Services', icon: ClipboardList, href: '/admin/services' },
    { label: 'Plans', icon: PackageSearch, href: '/admin/plans' },
    { label: 'Alerts', icon: BellRing, href: '/admin/alerts' },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 h-screen fixed left-0 top-0 hidden lg:flex flex-col z-50">
      
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="text-teal-400" size={24} />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            PetFlow
          </span>
        </div>
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
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer w-full text-left font-medium">
          <LogOut size={20} />
          <LogoutButton className="text-inherit hover:text-inherit w-full text-left" />
        </div>
      </div>
    </aside>
  );
}
