'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, Menu, X, Clock, Terminal, Trophy, LogOut, User as UserIcon, Users } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { GoogleAuthModal } from './GoogleAuthModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAppState();

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
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-md">
              <Link href="/profile" className="flex items-center gap-2.5 group cursor-pointer">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-cyber-blue/60 group-hover:border-cyber-blue transition-colors"
                />
                <div className="flex flex-col text-left">
                  <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyber-blue transition-colors leading-tight">
                    {user.name}
                  </span>
                  <span className="font-mono text-[9px] text-cyber-blue leading-none">@{user.username}</span>
                </div>
              </Link>
              <button
                onClick={() => setShowAuthModal(true)}
                title="Switch Account"
                className="p-1 text-slate-400 hover:text-cyber-teal transition-colors cursor-pointer border-l border-slate-800 pl-2 ml-1"
              >
                <Users className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1 text-slate-400 hover:text-cyber-pink transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyber-blue/40 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <UserIcon className="w-3.5 h-3.5 text-cyber-blue" />
              Sign In / Register
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
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-cyber-blue/50"
                  />
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
                  setShowAuthModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyber-blue/40 text-white font-orbitron font-bold text-xs uppercase tracking-wider"
              >
                <UserIcon className="w-3.5 h-3.5 text-cyber-blue" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}

      {/* SaaS Google Auth Modal */}
      <GoogleAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
};
export default Navbar;

