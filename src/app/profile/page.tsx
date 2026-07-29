'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { User as UserIcon, Building2, GraduationCap, Zap, Flame, Shield, CheckCircle2, Edit3, Save, Sparkles, BookOpen, Award } from 'lucide-react';
import { GoogleAuthModal } from '../../components/GoogleAuthModal';

export default function ProfilePage() {
  const { user, updateProfile } = useAppState();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [department, setDepartment] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setCollegeName(user.collegeName || '');
      setCourse(user.course || '');
      setDepartment(user.department || '');
      setSubjects(user.subjects || ['Operating Systems', 'Database Management Systems (DBMS)', 'Data Structures & Algorithms (DSA)', 'Computer Networks']);
    }
  }, [user]);

  const handleAddSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      const updated = [...subjects, trimmed];
      setSubjects(updated);
      setNewSubjectInput('');
    }
  };

  const handleRemoveSubject = (index: number) => {
    const updated = subjects.filter((_, idx) => idx !== index);
    setSubjects(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateProfile({
      name: name.trim() || user.name,
      username: username.trim() || user.username,
      collegeName: collegeName.trim() || user.collegeName,
      course: course.trim() || user.course,
      department: department.trim() || user.department,
      subjects: subjects,
      isProfileComplete: true
    });

    // Also update localStorage for test builder auto-fill
    try {
      if (collegeName.trim()) localStorage.setItem('study_buddy_collegeName', collegeName.trim());
      if (course.trim()) localStorage.setItem('study_buddy_course', course.trim());
      if (department.trim()) localStorage.setItem('study_buddy_subject', department.trim());
      localStorage.setItem('study_buddy_user_subjects', JSON.stringify(subjects));
    } catch (e) {}

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!user) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <UserIcon className="w-8 h-8 text-cyber-blue" />
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-extrabold text-xl text-white uppercase tracking-wider">
            Sign in to Access Student Profile
          </h2>
          <p className="font-rajdhani text-sm text-slate-400 font-medium max-w-md mx-auto">
            Build your unique academic profile, track your level XP progression, and auto-fill exam generator details.
          </p>
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.4-.7-.6-1.5-.6-2.3z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
          </svg>
          Sign in with Google
        </button>

        <GoogleAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Save Toast Notification */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-cyber-teal bg-cyber-teal/10 text-cyber-teal font-mono text-xs font-bold uppercase tracking-wider animate-fade-in shadow-[0_0_15px_rgba(0,255,213,0.2)]">
          <CheckCircle2 className="w-5 h-5" /> Profile successfully updated & synced with Test Builder!
        </div>
      )}

      {/* Gamified Hero Card */}
      <div className="cyber-glass rounded-3xl border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyber-blue/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar & Rank Ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-2 border-cyber-blue/50 bg-[#060a22] overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-orbitron font-black text-3xl text-cyber-blue uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-cyber-pink text-white font-orbitron font-black text-[9px] px-2 py-0.5 rounded-full border border-slate-900 shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3 fill-white" /> {user.streak}d
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="font-orbitron font-black text-2xl text-white uppercase tracking-wider flex items-center gap-2 justify-center md:justify-start">
                  {user.name} <CheckCircle2 className="w-5 h-5 text-cyber-teal" />
                </h1>
                <span className="font-mono text-xs text-cyber-blue font-bold tracking-wider">
                  @{user.username || 'student_scholar'}
                </span>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-600 font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-cyber-blue" /> Edit Profile
                </button>
              )}
            </div>

            {/* Academic Tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-800 bg-[#02040c] text-slate-300 font-rajdhani font-bold">
                <Building2 className="w-3.5 h-3.5 text-cyber-teal" /> {user.collegeName}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-800 bg-[#02040c] text-slate-300 font-rajdhani font-bold">
                <GraduationCap className="w-3.5 h-3.5 text-cyber-purple" /> {user.course}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-800 bg-[#02040c] text-slate-300 font-rajdhani font-bold">
                <BookOpen className="w-3.5 h-3.5 text-cyber-blue" /> {user.department}
              </span>
            </div>
          </div>
        </div>

        {/* Gamified XP & Mastery Metrics Bar (PW/Byju's Style) */}
        <div className="grid grid-cols-3 gap-4 border-t border-slate-800/80 mt-6 pt-6 text-center">
          <div className="flex flex-col items-center">
            <span className="font-rajdhani text-xs font-bold text-slate-500 uppercase tracking-widest">Scholar Level</span>
            <span className="font-orbitron font-black text-sm md:text-base text-cyber-teal mt-0.5 flex items-center gap-1">
              <Shield className="w-4 h-4" /> {user.level}
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-800/80 px-2">
            <span className="font-rajdhani text-xs font-bold text-slate-500 uppercase tracking-widest">Total Mastery XP</span>
            <span className="font-mono font-black text-sm md:text-base text-cyber-blue mt-0.5 flex items-center gap-1">
              <Zap className="w-4 h-4 fill-cyber-blue" /> {user.xp} XP
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-rajdhani text-xs font-bold text-slate-500 uppercase tracking-widest">Daily Streak</span>
            <span className="font-mono font-black text-sm md:text-base text-cyber-pink mt-0.5 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-cyber-pink" /> {user.streak} Days
            </span>
          </div>
        </div>

      </div>

      {/* Profile Form (Edit Mode / Setup Mode) */}
      {isEditing && (
        <form onSubmit={handleSave} className="cyber-glass rounded-3xl border border-slate-800 p-6 md:p-8 space-y-6 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-orbitron font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyber-blue" /> Academic Profile Credentials
            </h2>
            <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">Auto-syncs with Test Builder</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Display Name */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sahil Raj"
                className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none font-mono"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                Unique Student Handle (Username)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sahil24raj"
                className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none font-mono"
              />
            </div>

            {/* College Name */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                College / University Name
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. IIT Delhi"
                className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none font-mono"
              />
            </div>

            {/* Course */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                Course / Degree Program
              </label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech CSE"
                className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none font-mono"
              />
            </div>

            {/* Semester Subjects Section in Form */}
            <div className="md:col-span-2 flex flex-col space-y-3 pt-2 border-t border-slate-800">
              <label className="font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyber-blue" /> Current Semester Subjects (8-10 Subjects)
              </label>
              <p className="font-rajdhani text-[11px] text-slate-400 font-medium">
                Add all your semester subjects here. They will appear as quick one-tap subject chips when generating tests!
              </p>

              {/* Add Subject Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubject(); } }}
                  placeholder="e.g. Database Management Systems (DBMS)"
                  className="flex-1 bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-4 py-2.5 rounded-xl bg-cyber-blue/15 border border-cyber-blue/40 text-cyber-blue font-orbitron font-bold text-xs uppercase tracking-wider hover:bg-cyber-blue/25 cursor-pointer"
                >
                  + Add Subject
                </button>
              </div>

              {/* Active Subjects Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {subjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-xs font-bold"
                  >
                    {sub}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(idx)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-cyber-pink hover:bg-cyber-pink/20 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-teal text-slate-950 font-orbitron font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Credentials
            </button>
          </div>
        </form>
      )}

      {/* Semester Subjects Display Card (When Not Editing) */}
      {!isEditing && (
        <div className="cyber-glass rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="font-orbitron font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyber-blue" /> Saved Semester Subjects ({user.subjects?.length || subjects.length})
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="font-mono text-[10px] text-cyber-blue font-bold uppercase hover:underline cursor-pointer"
            >
              + Manage Subjects
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(user.subjects && user.subjects.length > 0 ? user.subjects : subjects).map((sub, idx) => (
              <span
                key={idx}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-[#060a22] text-slate-200 font-mono text-xs font-bold hover:border-cyber-blue/40 transition-colors"
              >
                📘 {sub}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
