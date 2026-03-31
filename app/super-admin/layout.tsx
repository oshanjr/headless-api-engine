'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Network, Zap } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
     { name: 'Dashboard', href: '/super-admin', icon: <LayoutDashboard className="w-4 h-4" /> },
     { name: 'Node Topology', href: '/super-admin/tenants', icon: <Network className="w-4 h-4" /> },
     { name: 'Rider Fleet', href: '/super-admin/riders', icon: <Zap className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-slate-300 pb-20 selection:bg-cyan-500/30 relative">
       
       {/* Global Dashboard Atmosphere */}
       <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-cyan-900/10 via-slate-900/5 to-transparent pointer-events-none z-0"></div>

       {/* Floating Navigation Pill */}
       <div className="sticky top-6 z-[100] flex justify-center w-full px-6 mb-8 pointer-events-none">
          <nav className="inline-flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] pointer-events-auto shadow-cyan-900/20">
             {navLinks.map((link) => {
                const isActive = pathname === link.href;
                
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${
                       isActive 
                         ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_15px_rgba(6,182,212,0.15)] glow-text' 
                         : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                     {link.icon}
                     {link.name}
                  </Link>
                )
             })}
          </nav>
       </div>

       {/* Route Content Wrapper */}
       <div className="relative z-10">
         {children}
       </div>
    </div>
  );
}
