'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Shield, 
  Users, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  UserPlus, 
  Search, 
  Crown, 
  Sparkles,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { getLevelFromXp } from '../../lib/mockData';
import { GoogleAuthModal } from '../../components/GoogleAuthModal';

export default function LeaderboardPage() {
  const { user, userDirectory, customFriends, addFriendByUsername } = useAppState();
  const [tab, setTab] = useState<'all' | 'college' | 'department' | 'friend'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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

  const handleQuickAddFriend = (username: string) => {
    const res = addFriendByUsername(username);
    setAddFeedback(res);
    setTimeout(() => setAddFeedback(null), 4000);
  };

  // Build combined directory with ONLY REAL REGISTERED USERS from Cloud Firestore + Active Logged-In User
  const allAccountsMap = new Map<string, any>();

  // 1. Add real registered accounts from Cloud Firestore userDirectory (ignoring any mock accounts)
  userDirectory.forEach(u => {
    if (u && (u.email || u.username) && !u.id?.startsWith('sch_') && !u.email?.includes('mock')) {
      const key = (u.email || u.username).toLowerCase().trim();
      const levelTitle = getLevelFromXp(u.xp ?? 0).name;
      const displayName = u.name || u.username || u.email?.split('@')[0] || 'Scholar';
      const avatarUrl = u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00f0ff&color=020617&bold=true`;
      
      allAccountsMap.set(key, {
        ...u,
        name: displayName,
        avatar: avatarUrl,
        username: u.username || u.email?.split('@')[0] || 'scholar',
        level: levelTitle,
        isCurrentUser: Boolean(user && (user.email.toLowerCase().trim() === key || user.username?.toLowerCase() === u.username?.toLowerCase()))
      });
    }
  });

  // 2. Ensure currently logged-in user is ALWAYS inserted with exact active profile details & avatar
  if (user && (user.email || user.username)) {
    const key = (user.email || user.username).toLowerCase().trim();
    const existing = allAccountsMap.get(key) || {};
    const levelTitle = getLevelFromXp(user.xp ?? 0).name;
    const displayName = user.name || user.username || user.email.split('@')[0] || 'Logged-In Scholar';
    const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00f0ff&color=020617&bold=true`;

    allAccountsMap.set(key, {
      ...existing,
      ...user,
      name: displayName,
      avatar: avatarUrl,
      username: user.username || user.email.split('@')[0],
      level: levelTitle,
      isCurrentUser: true
    });
  }

  const allAccountsList = Array.from(allAccountsMap.values());

  const sortComparator = (a: any, b: any) => {
    const xpDiff = (b.xp || 0) - (a.xp || 0);
    if (xpDiff !== 0) return xpDiff;
    const testsDiff = (b.testsCompleted || 0) - (a.testsCompleted || 0);
    if (testsDiff !== 0) return testsDiff;
    const avgDiff = (b.avgScore || 0) - (a.avgScore || 0);
    if (avgDiff !== 0) return avgDiff;
    return (a.name || '').localeCompare(b.name || '');
  };

  // Compute Overall Global Rank for Current Logged-In User
  const globalRanked = [...allAccountsList]
    .sort(sortComparator)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const currentUserStanding = globalRanked.find(u => u.isCurrentUser);

  // Filter accounts based on selected tab
  let filteredEntries = [...allAccountsList];

  if (tab === 'college') {
    if (user?.collegeName) {
      filteredEntries = filteredEntries.filter(
        u => u.isCurrentUser || (u.collegeName && u.collegeName.toLowerCase() === user.collegeName.toLowerCase())
      );
    }
  } else if (tab === 'department') {
    if (user?.department) {
      filteredEntries = filteredEntries.filter(
        u => u.isCurrentUser || (u.department && u.department.toLowerCase() === user.department.toLowerCase())
      );
    }
  } else if (tab === 'friend') {
    filteredEntries = filteredEntries.filter(
      u => u.isCurrentUser || (u.username && customFriends.includes(u.username.toLowerCase()))
    );
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
    filteredEntries = filteredEntries.filter(
      u => (u.username && u.username.toLowerCase().includes(q)) || 
           (u.name && u.name.toLowerCase().includes(q)) || 
           (u.collegeName && u.collegeName.toLowerCase().includes(q)) ||
           (u.department && u.department.toLowerCase().includes(q))
    );
  }

  // Sort by XP descending with tie-breaking
  filteredEntries.sort(sortComparator);

  // Assign ranked positions for current view
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
            <h1 className="font-orbitron font-black text-2xl text-white uppercase tracking-wider flex items-center gap-2">
              Real Student Leaderboard
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-cyber-blue/40 bg-cyber-blue/10 text-cyber-blue font-bold">
                100% REAL SCHOLARS
              </span>
            </h1>
            <p className="font-rajdhani text-xs text-slate-400 font-semibold tracking-wide">
              Live Supabase Realtime Sync • Real Logged-In Students with Supabase Accounts
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
            <Shield className="w-3.5 h-3.5" /> All Real Scholars
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

      {/* Logged-In User Highlight Standing Banner */}
      {user ? (
        <div className="cyber-glass rounded-2xl border border-cyber-blue/40 p-5 bg-gradient-to-r from-cyber-blue/10 via-[#060c28] to-cyber-purple/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=00f0ff&color=020617&bold=true`}
                alt={user.name}
                className="w-14 h-14 rounded-full border-2 border-cyber-blue object-cover shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-cyber-teal text-slate-950 font-orbitron font-black text-[10px] px-1.5 py-0.5 rounded-full border border-slate-900 shadow">
                YOU
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-black text-base text-white uppercase tracking-wider">
                  {user.name}
                </h3>
                <span className="font-mono text-xs text-cyber-blue font-bold">
                  @{user.username}
                </span>
                <CheckCircle2 className="w-4 h-4 text-cyber-teal" />
              </div>
              <p className="font-rajdhani text-xs text-slate-300 font-semibold flex items-center gap-2 mt-0.5">
                <span>{user.collegeName || 'University Scholar'}</span>
                <span>•</span>
                <span>{user.department || 'Computer Science'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-center">
              <span className="font-rajdhani text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your Global Rank</span>
              <span className="font-orbitron font-black text-lg text-amber-400 flex items-center gap-1 justify-center">
                <Crown className="w-4 h-4 text-amber-400" /> #{currentUserStanding?.rank || 1}
              </span>
            </div>

            <div className="text-center">
              <span className="font-rajdhani text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Scholar Level</span>
              <span className="font-orbitron font-bold text-xs text-cyber-teal mt-0.5 block">
                {currentUserStanding?.level || 'Beginner Scholar'}
              </span>
            </div>

            <div className="text-center">
              <span className="font-rajdhani text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total XP</span>
              <span className="font-mono font-black text-sm text-cyber-blue flex items-center gap-1 justify-center mt-0.5">
                <Zap className="w-3.5 h-3.5 fill-cyber-blue" /> {user.xp ?? 0} XP
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="cyber-glass rounded-2xl border border-cyber-purple/40 p-5 bg-gradient-to-r from-cyber-purple/10 to-cyber-blue/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-cyber-blue animate-pulse" />
            <div>
              <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                Log In to Show Your Real Google Account on the Leaderboard!
              </h3>
              <p className="font-rajdhani text-xs text-slate-400 font-medium">
                Log in with your Google or Email account to record your XP, streak, and compete with real students.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-teal text-slate-950 font-orbitron font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            Sign In with Google
          </button>
        </div>
      )}

      {/* Add Friend Component */}
      <div className="cyber-glass rounded-2xl border border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-cyber-teal" />
          <div>
            <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
              Add Friend by Username (@handle)
            </h3>
            <p className="font-rajdhani text-[11px] text-slate-400 font-medium">
              Enter any real registered student's unique handle (e.g. <span className="text-cyber-blue">@username</span>) to track them on your Friends Leaderboard!
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
              placeholder="username"
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

      {/* Top Podiums (Only if real users exist) */}
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
                key={entry.email || entry.username || idx}
                className={`cyber-glass rounded-2xl border p-6 flex flex-col items-center text-center space-y-4 relative ${badgeColor} ${
                  entry.isCurrentUser ? 'ring-2 ring-cyber-blue shadow-[0_0_30px_rgba(0,240,255,0.3)]' : ''
                }`}
              >
                <div className="absolute top-3 right-3 font-orbitron font-extrabold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-current flex items-center gap-1">
                  {isGold && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  {rankLabel}
                </div>

                <div className="relative">
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-16 h-16 rounded-full border-2 border-current object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-slate-900 bg-[#050816] flex items-center justify-center font-orbitron font-black text-xs text-white">
                    #{entry.rank}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono font-bold text-sm text-white flex items-center gap-1.5 justify-center flex-wrap">
                    @{entry.username}
                    <span className="text-slate-400 text-xs">({entry.name})</span>
                    {entry.isCurrentUser && (
                      <span className="bg-cyber-blue/20 text-cyber-blue text-[10px] font-orbitron font-extrabold px-1.5 py-0.5 rounded border border-cyber-blue/40">
                        YOU
                      </span>
                    )}
                  </h3>
                  <span className="font-rajdhani text-xs text-slate-300 font-bold block mt-0.5">{entry.level}</span>
                  <span className="font-rajdhani text-[11px] text-slate-400 font-medium block">
                    {entry.collegeName || 'University Scholar'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-white/10 text-xs">
                  <div className="flex flex-col items-center">
                    <span className="font-rajdhani text-[10px] text-slate-400 uppercase font-bold">Total XP</span>
                    <span className="font-mono font-black text-cyber-blue flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-cyber-blue" /> {entry.xp ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-rajdhani text-[10px] text-slate-400 uppercase font-bold">Streak</span>
                    <span className="font-mono font-black text-cyber-pink flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-cyber-pink" /> {entry.streak || 1}d
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
            {tab === 'all' && 'Real Logged-In Scholars'}
            {tab === 'college' && `${user?.collegeName || 'College'} Real Scholars`}
            {tab === 'department' && `${user?.department || 'Department'} Real Scholars`}
            {tab === 'friend' && 'Friends Leaderboard'}
            <span className="text-cyber-blue font-mono font-bold">({rankedLeaderboard.length})</span>
          </span>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by real name, handle, college..."
              className="w-full bg-[#050816] border border-slate-800 focus:border-cyber-blue/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
            />
          </div>
        </div>

        {rankedLeaderboard.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserX className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-orbitron font-bold text-sm text-slate-400">
              No registered real scholars found matching your criteria.
            </p>
            <p className="font-rajdhani text-xs text-slate-500 max-w-sm mx-auto">
              {!user 
                ? 'Sign in with Google to be the first real scholar on the leaderboard!'
                : tab === 'friend'
                ? 'Add friends using their unique handle (@username) above to track them on your Friends Leaderboard.'
                : 'As other students log in to the site, they will appear here live!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {rankedLeaderboard.map((entry) => {
              const isSelf = entry.isCurrentUser;
              const isFriend = customFriends.includes((entry.username || '').toLowerCase());

              return (
                <div
                  key={entry.email || entry.username || entry.rank}
                  className={`px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    isSelf ? 'bg-cyber-blue/10 border-l-4 border-l-cyber-blue' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`font-orbitron font-black text-sm w-7 text-center shrink-0 ${
                      entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      #{entry.rank}
                    </span>

                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-10 h-10 rounded-full object-cover border border-cyber-blue/40 shrink-0 shadow-sm"
                    />

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono text-xs font-black ${isSelf ? 'text-cyber-blue' : 'text-slate-100'}`}>
                          @{entry.username}
                        </span>
                        <span className="font-mono text-xs text-slate-400 font-medium">
                          ({entry.name})
                        </span>
                        {isSelf && (
                          <span className="bg-cyber-blue/20 text-cyber-blue text-[9px] font-orbitron font-extrabold px-1.5 py-0.5 rounded border border-cyber-blue/40">
                            YOU
                          </span>
                        )}
                        <span className="text-[10px] font-rajdhani font-bold px-2 py-0.5 rounded-full border border-slate-800 bg-slate-900 text-cyber-teal">
                          {entry.level}
                        </span>
                      </div>
                      <span className="font-rajdhani text-[11px] text-slate-400 font-medium truncate">
                        {entry.collegeName || 'University Scholar'} • {entry.department || 'Computer Science'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center shrink-0">
                    {!isSelf && (
                      <button
                        onClick={() => handleQuickAddFriend(entry.username)}
                        disabled={isFriend}
                        className={`px-3 py-1 rounded-lg font-orbitron font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                          isFriend 
                            ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                            : 'bg-cyber-teal/10 hover:bg-cyber-teal/25 text-cyber-teal border border-cyber-teal/30'
                        }`}
                      >
                        {isFriend ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Friend
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" /> + Add Friend
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex items-center gap-1 font-mono text-xs text-cyber-pink font-bold">
                      <Flame className="w-3.5 h-3.5 fill-cyber-pink" /> {entry.streak || 1}d
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs font-black text-cyber-blue bg-cyber-blue/5 border border-cyber-blue/20 px-3 py-1 rounded-lg">
                      <Zap className="w-3.5 h-3.5 fill-cyber-blue" /> {entry.xp ?? 0} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Quick Sign-In */}
      <GoogleAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
