"use client";

import { useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

interface AdminHeaderProps {
  email?: string;
  role?: string;
  activeTab: 'overview' | 'agenda' | 'customers' | 'servicos' | 'planos';
}

const navItems = [
  { key: 'overview', label: 'Visão Geral', href: '/admin' },
  { key: 'agenda', label: 'Agenda', href: '/admin/agenda' },
  { key: 'customers', label: 'Clientes', href: '/admin/customers' },
  { key: 'servicos', label: 'Serviços', href: '/admin/servicos' },
  { key: 'planos', label: 'Planos', href: '/admin/planos' },
] as const;

export default function AdminHeader({ email, role, activeTab }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
            L
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
            System Admin
          </h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-sm text-slate-500 flex flex-col items-end hidden sm:flex">
            <span className="font-medium text-slate-700">{email}</span>
            <span className="text-xs">{role === 'root' ? 'Root Administrator' : 'Administrator'}</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Desktop Navigation */}
      <div className="hidden md:flex bg-white border-b border-slate-200 px-6 gap-6 text-sm font-medium sticky top-[73px] z-10 overflow-x-auto">
        {navItems.map(item => (
          <Link
            key={item.key}
            href={item.href}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === item.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex flex-col gap-1 sticky top-[65px] z-10 shadow-sm">
          {navItems.map(item => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`py-3 px-4 rounded-lg flex items-center min-h-[44px] text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {/* User info on mobile */}
          <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col px-4 pb-2 sm:hidden">
            <span className="text-sm font-medium text-slate-700">{email}</span>
            <span className="text-xs text-slate-500">{role === 'root' ? 'Root Admin' : 'Admin'}</span>
          </div>
        </div>
      )}
    </>
  );
}
