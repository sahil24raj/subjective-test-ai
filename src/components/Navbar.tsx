'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, Menu, X, Clock, Terminal } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/generator', label: 'Test Builder', icon: Cpu },
    { href: '/history', label: 'Test History', icon: Clock },
  ];

  const getLinkClass = (href: string) => {
    const baseClass = "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 ";
    const isActive = pathname === href;
    return isActive 
      ? baseClass + "text-cyber-blue border border-cyber-blue/30 bg-cyber-blue/10 neon-text-blue"
      : baseClass + "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent";
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-cyan-500/10 bg-[#050816]/85 backdrop-blur-md px-4 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Subjective Test AI Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-300">
            <Terminal className="w-4.5 h-4.5 text-white" />
            <div className="absolute inset-0 rounded-lg bg-cyber-blue/30 blur-sm group-hover:opacity-100 opacity-50 transition-opacity" />
          </div>
          <span className="font-orbitron font-black text-base text-white tracking-widest uppercase flex items-center gap-1.5">
            Subjective Test <span className="text-cyber-blue neon-text-blue">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={getLinkClass(link.href)}>
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden mt-3 p-4 rounded-xl border border-cyan-500/10 bg-[#080d21] flex flex-col gap-2 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={getLinkClass(link.href)}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
