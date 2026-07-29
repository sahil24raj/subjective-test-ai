'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, Menu, X, Clock, Terminal, Trophy, LogOut, User as UserIcon } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loginWithGoogle, logout } = useAppState();

  const navLinks = [
    { href: '/generator', label: 'Test Builder', icon: Cpu },
    { href: '/history', label: 'Test History', icon: Clock },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/profile', label: 'Profile', icon: UserIcon },
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

        {/* Desktop Links & Auth */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
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

          {/* Google Auth Button / User Profile */}
          {user ? (
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <Link href="/profile" className="flex items-center gap-2 group cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-cyber-blue/20 border border-cyber-blue/50 flex items-center justify-center font-bold text-[10px] text-cyber-blue uppercase font-mono group-hover:border-cyber-blue transition-colors">
                  {user.name.charAt(0)}
                </div>
                <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyber-blue transition-colors">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1 text-slate-500 hover:text-cyber-pink transition-colors cursor-pointer border-l border-slate-800 pl-2 ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.08)]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.4-.7-.6-1.5-.6-2.3z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              Sign in with Google
            </button>
          )}
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
          
          {/* Mobile Auth button */}
          <div className="pt-2 border-t border-slate-800">
            {user ? (
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyber-blue/20 border border-cyber-blue/50 flex items-center justify-center font-bold text-[10px] text-cyber-blue uppercase font-mono">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-200">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="font-mono text-xs text-cyber-pink font-bold uppercase"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  loginWithGoogle();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-orbitron font-bold text-xs uppercase tracking-wider"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.4-.7-.6-1.5-.6-2.3z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
