'use client';

import React, { useState } from 'react';
import { MOCK_LEADERBOARDS, LeaderboardEntry } from '../../lib/mockData';
import { Trophy, Award, Flame, Zap, Shield, Users, Building2, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export default function LeaderboardPage() {
  const { user } = useAppState();
  const [tab, setTab] = useState<'college' | 'department' | 'friend'>('college');

  const currentLeaderboard = MOCK_LEADERBOARDS[tab];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/10 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 border border-cyber-blue/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <Trophy className="w-6 h-6 text-cyber-blue animate-pulse" />
          </div>
          <div>
            <h1 className="font-orbitron font-black text-2xl text-white uppercase tracking-wider">
              Academic Leaderboard
            </h1>
            <p className="font-rajdhani text-xs text-slate-400 font-semibold tracking-wide">
              Compare Subjective Test XP, Streaks & Mastery Ratings
            </p>
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex bg-[#080d21] border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTab('college')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'college'
                ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> College
          </button>
          <button
            onClick={() => setTab('department')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'department'
                ? 'bg-cyber-teal/15 text-cyber-teal border border-cyber-teal/30 shadow-[0_0_10px_rgba(0,255,213,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Dept
          </button>
          <button
            onClick={() => setTab('friend')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'friend'
                ? 'bg-cyber-purple/15 text-cyber-purple border border-cyber-purple/30 shadow-[0_0_10px_rgba(189,0,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Friends
          </button>
        </div>
      </div>

      {/* Top 3 Podiums */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {currentLeaderboard.slice(0, 3).map((entry, idx) => {
          const isGold = idx === 0;
          const isSilver = idx === 1;
          const isBronze = idx === 2;

          let badgeColor = 'border-amber-400/50 bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]';
          let rankLabel = '1st Rank';
          if (isSilver) {
            badgeColor = 'border-slate-300/50 bg-slate-300/10 text-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.15)]';
            rankLabel = '2nd Rank';
          } else if (isBronze) {
            badgeColor = 'border-amber-700/50 bg-amber-700/10 text-amber-600 shadow-[0_0_15px_rgba(180,83,9,0.15)]';
            rankLabel = '3rd Rank';
          }

          return (
            <div
              key={entry.rank}
              className={`cyber-glass rounded-2xl border p-6 flex flex-col items-center text-center space-y-4 relative ${badgeColor}`}
            >
              <div className="absolute top-3 right-3 font-orbitron font-extrabold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-current">
                {rankLabel}
              </div>

              <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center font-orbitron font-black text-xl bg-[#050816]/80">
                #{entry.rank}
              </div>

              <div>
                <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-1.5 justify-center">
                  {user && entry.isCurrentUser ? user.name : entry.name}
                  {entry.isCurrentUser && <CheckCircle2 className="w-4 h-4 text-cyber-teal" />}
                </h3>
                <span className="font-rajdhani text-xs text-slate-400 font-semibold">{entry.level}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-white/10 text-xs">
                <div className="flex flex-col items-center">
                  <span className="font-rajdhani text-[10px] text-slate-400 uppercase font-bold">Total XP</span>
                  <span className="font-mono font-black text-cyber-blue flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {entry.xp}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-rajdhani text-[10px] text-slate-400 uppercase font-bold">Streak</span>
                  <span className="font-mono font-black text-cyber-pink flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {entry.streak}d
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="cyber-glass rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <span className="font-orbitron text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-blue" /> Ranked Scholar Directory
          </span>
          <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">UPDATED LIVE</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {currentLeaderboard.map((entry) => {
            const isSelf = entry.isCurrentUser;
            return (
              <div
                key={entry.rank}
                className={`px-6 py-4 flex items-center justify-between transition-colors ${
                  isSelf ? 'bg-cyber-blue/10 border-l-4 border-l-cyber-blue' : 'hover:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`font-orbitron font-black text-sm w-7 text-center ${
                    entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{entry.rank}
                  </span>

                  <div className="flex flex-col">
                    <span className={`font-mono text-xs font-bold ${isSelf ? 'text-cyber-blue font-black' : 'text-slate-200'}`}>
                      {user && isSelf ? `${user.name} (You)` : entry.name}
                    </span>
                    <span className="font-rajdhani text-[11px] text-slate-400 font-medium">
                      {entry.level} • {entry.testsCompleted} Exams
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 font-mono text-xs text-cyber-pink font-bold">
                    <Flame className="w-3.5 h-3.5" /> {entry.streak}d
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs font-black text-cyber-blue bg-cyber-blue/5 border border-cyber-blue/20 px-3 py-1 rounded-lg">
                    <Zap className="w-3.5 h-3.5 text-cyber-blue" /> {entry.xp} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
