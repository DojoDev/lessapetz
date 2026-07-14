"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AdminLayoutWrapper({ 
  email, 
  role, 
  children 
}: { 
  email: string; 
  role: string; 
  children: React.ReactNode; 
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300 w-full">
        <TopHeader 
          email={email} 
          role={role} 
          onMenuClick={() => setIsMobileOpen(true)} 
        />
        {children}
      </div>
    </>
  );
}
