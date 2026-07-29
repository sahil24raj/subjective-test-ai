'use client';

import React, { useState } from 'react';
import { Trophy, Flame, Zap, Shield, Users, Building2, GraduationCap, CheckCircle2, UserPlus, Search, Check } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export default function LeaderboardPage() {
  const { user, userDirectory, customFriends, addFriendByUsername } = useAppState();
  const [tab, setTab] = useState<'all' | 'college' | 'department' | 'friend'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Friend Add state
  const [friendInput, setFriendInput] = useState('');
  const [addFeedback, setAddFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendInput.trim()) return;

    const res = addFriendByUsername(friendInput);
    setAddFeedback(res);
    if (res.success) {
      setFriendInput('');
    }
    setTimeout(() => setAddFeedback(null), 4000);
  };

  // Build combined directory with logged-in user + directory users (ONLY REAL REGISTERED ACCOUNTS)
  const allAccountsMap = new Map<string, any>();
  
  // 1. Add all real accounts from userDirectory (fetched live from Cloud Firestore)
  userDirectory.forEach(u => {
    if (u && u.email) {
      const key = u.email.toLowerCase().trim();
      allAccountsMap.set(key, {
        ...u,
        isCurrentUser: Boolean(user && user.email.toLowerCase().trim() === key)
      });
    }
  });

  // 2. Ensure currently logged-in user is updated
  if (user && user.email) {
    const key = user.email.toLowerCase().trim();
    allAccountsMap.set(key, {
      ...(allAccountsMap.get(key) || {}),
      ...user,
      isCurrentUser: true
    });
  }

  const allAccountsList = Array.from(allAccountsMap.values());

  // Filter accounts based on selected tab
  let filteredEntries = [...allAccountsList];

  if (tab === 'college' && user?.collegeName) {
    filteredEntries = filteredEntries.filter(
      u => u.isCurrentUser || (u.collegeName && u.collegeName.toLowerCase() === user.collegeName.toLowerCase())
    );
  } else if (tab === 'department' && user?.department) {
    filteredEntries = filteredEntries.filter(
      u => u.isCurrentUser || (u.department && u.department.toLowerCase() === user.department.toLowerCase())
    );
  } else if (tab === 'friend') {
    filteredEntries = filteredEntries.filter(
      u => u.isCurrentUser || customFriends.includes(u.username.toLowerCase())
    );
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
    filteredEntries = filteredEntries.filter(
      u => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || (u.collegeName && u.collegeName.toLowerCase().includes(q))
    );
  }

  // Sort by XP descending
  filteredEntries.sort((a, b) => (b.xp || 0) - (a.xp || 0));

  // Assign ranked positions
  const rankedLeaderboard = filteredEntries.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));

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
              Academic Scholar Leaderboard
            </h1>
            <p className="font-rajdhani text-xs text-slate-400 font-semibold tracking-wide">
              Realtime Scholar Ranks • Filter by All, College, Dept, or Friends
            </p>
          </div>
        </div>

        {/* Tab Switchers (ALL, COLLEGE, DEPT, FRIENDS) */}
        <div className="flex flex-wrap bg-[#080d21] border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTab('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'all'
                ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> All Scholars
          </button>
          <button
            onClick={() => setTab('college')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'college'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/40 shadow-[0_0_10px_rgba(0,255,213,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> College
          </button>
          <button
            onClick={() => setTab('department')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'department'
                ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40 shadow-[0_0_10px_rgba(189,0,255,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Dept
          </button>
          <button
            onClick={() => setTab('friend')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'friend'
                ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/40 shadow-[0_0_10px_rgba(255,0,85,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Friends
          </button>
        </div>
      </div>

      {/* Add Friend Component (Visible on Friends tab or Header) */}
      <div className="cyber-glass rounded-2xl border border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-cyber-teal" />
          <div>
            <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
              Add Friend by Username
            </h3>
            <p className="font-rajdhani text-[11px] text-slate-400 font-medium">
              Enter any student's unique handle (e.g. <span className="text-cyber-blue">@rahul_cse</span>) to track them on your Friends Leaderboard!
            </p>
          </div>
        </div>

        <form onSubmit={handleAddFriend} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute left-3 top-2.5 font-mono text-xs text-cyber-blue font-bold">@</span>
            <input
              type="text"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              placeholder="friend_username"
              className="w-full bg-[#050816] border border-slate-800 focus:border-cyber-blue/50 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyber-teal/15 border border-cyber-teal/40 text-cyber-teal font-orbitron font-bold text-xs uppercase tracking-wider hover:bg-cyber-teal/25 cursor-pointer whitespace-nowrap"
          >
            + Add Friend
          </button>
        </form>
      </div>

      {/* Add Friend Feedback Toast */}
      {addFeedback && (
        <div className={`p-3 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider animate-fade-in ${
          addFeedback.success
            ? 'border-cyber-teal bg-cyber-teal/10 text-cyber-teal'
            : 'border-cyber-pink bg-cyber-pink/10 text-cyber-pink'
        }`}>
          {addFeedback.message}
        </div>
      )}

      {/* Top Podiums */}
      {rankedLeaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {rankedLeaderboard.slice(0, 3).map((entry, idx) => {
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
                key={entry.username}
                className={`cyber-glass rounded-2xl border p-6 flex flex-col items-center text-center space-y-4 relative ${badgeColor}`}
              >
                <div className="absolute top-3 right-3 font-orbitron font-extrabold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-current">
                  {rankLabel}
                </div>

                <div className="relative">
                  <img
                    src={entry.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                    alt={entry.name}
                    className="w-16 h-16 rounded-full border-2 border-current object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-slate-900 bg-[#050816] flex items-center justify-center font-orbitron font-black text-xs text-white">
                    #{entry.rank}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono font-bold text-sm text-white flex items-center gap-1.5 justify-center">
                    @{entry.username} <span className="text-slate-400 text-xs">({entry.name})</span>
                    {entry.isCurrentUser && <CheckCircle2 className="w-4 h-4 text-cyber-teal" />}
                  </h3>
                  <span className="font-rajdhani text-xs text-slate-400 font-semibold">{entry.level || 'AI Scholar'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-white/10 text-xs">
                  <div className="flex flex-col items-center">
                    <span className="font-rajdhani text-[10px] text-slate-400 uppercase font-bold">Total XP</span>
                    <span className="font-mono font-black text-cyber-blue flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {entry.xp || 780}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-rajdhani text-[10px] text-slate-400 uppercase font-bold">Streak</span>
                    <span className="font-mono font-black text-cyber-pink flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {entry.streak || 5}d
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="cyber-glass rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/40">
          <span className="font-orbitron text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-blue" />
            {tab === 'all' && 'All Global Scholars'}
            {tab === 'college' && `${user?.collegeName || 'College'} Scholars`}
            {tab === 'department' && `${user?.department || 'Department'} Scholars`}
            {tab === 'friend' && 'Friends Leaderboard'}
            <span className="text-cyber-blue font-mono font-bold">({rankedLeaderboard.length})</span>
          </span>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle or college..."
              className="w-full bg-[#050816] border border-slate-800 focus:border-cyber-blue/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {rankedLeaderboard.map((entry) => {
            const isSelf = entry.isCurrentUser;
            return (
              <div
                key={entry.username}
                className={`px-6 py-4 flex items-center justify-between transition-colors ${
                  isSelf ? 'bg-cyber-blue/10 border-l-4 border-l-cyber-blue' : 'hover:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`font-orbitron font-black text-sm w-6 text-center shrink-0 ${
                    entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{entry.rank}
                  </span>

                  <img
                    src={entry.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                    alt={entry.name}
                    className="w-9 h-9 rounded-full object-cover border border-cyber-blue/40 shrink-0 shadow-sm"
                  />

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-black ${isSelf ? 'text-cyber-blue' : 'text-slate-100'}`}>
                        @{entry.username}
                      </span>
                      <span className="font-mono text-xs text-slate-400 font-medium">
                        ({entry.name}){isSelf && ' • (You)'}
                      </span>
                    </div>
                    <span className="font-rajdhani text-[11px] text-slate-400 font-medium">
                      {entry.collegeName || 'University Scholar'} • {entry.department || 'General'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 font-mono text-xs text-cyber-pink font-bold">
                    <Flame className="w-3.5 h-3.5" /> {entry.streak || 5}d
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs font-black text-cyber-blue bg-cyber-blue/5 border border-cyber-blue/20 px-3 py-1 rounded-lg">
                    <Zap className="w-3.5 h-3.5 text-cyber-blue" /> {entry.xp || 780} XP
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
