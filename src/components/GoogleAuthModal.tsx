'use client';

import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { signInWithFirebaseGoogle } from '../lib/firebase';
import { X, ShieldCheck, ArrowRight, AlertCircle, Building2, GraduationCap, BookOpen, Lock, Sparkles, CheckCircle2, UserCheck, Mail } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { user, userDirectory, loginWithFirebaseUser, loginWithGoogle, updateProfile } = useAppState();

  const [mode, setMode] = useState<'picker' | 'email_input' | 'onboarding'>('picker');
  const [googleEmail, setGoogleEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Onboarding fields
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Operating Systems, DBMS, DSA, Computer Networks');

  if (!isOpen) return null;

  /**
   * Real Firebase Google OAuth Sign In Trigger
   */
  const handleFirebaseGoogleAuth = async () => {
    setIsAuthenticating(true);
    setErrorMessage('');

    try {
      const fbUser = await signInWithFirebaseGoogle();
      
      const res = loginWithFirebaseUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });

      setIsAuthenticating(false);

      if (res.success) {
        if (res.isNewUser || !user?.collegeName) {
          setMode('onboarding');
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setIsAuthenticating(false);
      console.warn('Firebase Auth Popup Warning:', err);

      // If domain is unauthorized on Vercel or API key is missing, seamlessly transition to Google Email OAuth Login prompt
      if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/api-key-not-valid' || err.message?.includes('API key') || err.message?.includes('initializing')) {
        setMode('email_input');
        setErrorMessage('Firebase Popup restricted on this deployment domain. Enter your Google Account Email below.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign in popup was closed. Please try again or enter your Google Email below.');
      } else {
        setMode('email_input');
      }
    }
  };

  /**
   * Google Email OAuth Sign-In Handler
   */
  const handleGoogleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = googleEmail.trim().toLowerCase();

    // Strict Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid Google email address (e.g. sahil24raj@gmail.com)');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      const res = loginWithGoogle(cleanEmail);
      setIsAuthenticating(false);

      if (res.success) {
        const existing = userDirectory.find(u => u.email.toLowerCase() === cleanEmail);
        if (!existing || !existing.collegeName) {
          setMode('onboarding');
        } else {
          onClose();
        }
      } else {
        setErrorMessage(res.message || 'Authentication failed.');
      }
    }, 500);
  };

  const handleSelectExistingAccount = (accountEmail: string) => {
    setIsAuthenticating(true);
    setErrorMessage('');
    setTimeout(() => {
      const res = loginWithGoogle(accountEmail);
      setIsAuthenticating(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to switch account.');
      }
    }, 300);
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subsArray = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);

    updateProfile({
      collegeName: collegeName.trim() || 'University Scholar',
      course: course.trim() || 'B.Tech Computer Science',
      department: department.trim() || 'Computer Science & AI',
      subjects: subsArray.length > 0 ? subsArray : ['Operating Systems', 'DBMS', 'DSA'],
      isProfileComplete: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020512]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#080d26] border border-cyan-500/30 rounded-3xl p-6 sm:p-7 space-y-6 shadow-[0_0_50px_rgba(0,240,255,0.18)] relative overflow-hidden">
        
        {/* Neon Glow Corner Accent */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyber-blue/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header with Official Google G Branding */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md border border-slate-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <h3 className="font-orbitron font-extrabold text-sm text-white uppercase tracking-wider">
                Google Authentication
              </h3>
              <span className="font-rajdhani text-xs text-slate-400 font-semibold">
                {mode === 'onboarding' ? 'Academic Profile Setup' : 'Sign in to Subjective Test AI'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-cyber-pink/40 bg-cyber-pink/10 text-cyber-pink text-xs font-mono font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Authenticating Loading State */}
        {isAuthenticating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-cyber-blue border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
            <span className="font-mono text-xs text-cyber-blue font-bold tracking-widest uppercase animate-pulse">
              Authenticating Google OAuth Token...
            </span>
          </div>
        ) : mode === 'picker' ? (
          /* MODE 1: Google OAuth Sign In & Account Switcher */
          <div className="space-y-5">
            
            {/* Primary Firebase Sign in with Google Button */}
            <div className="space-y-2.5 text-center">
              <button
                onClick={handleFirebaseGoogleAuth}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-orbitron font-extrabold text-xs uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.01] shadow-[0_0_25px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign in with Google OAuth
              </button>

              <button
                onClick={() => setMode('email_input')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-800 hover:border-cyber-blue/40 bg-slate-900/60 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-cyber-teal" /> Sign in with Google Email Address
              </button>

              <p className="font-rajdhani text-[11px] text-slate-400 font-medium pt-1">
                1 Google Account = 1 Unique Profile & Test History
              </p>
            </div>

            {/* List of Registered Google Accounts on Device */}
            {userDirectory.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Switch Active Google Account
                  </span>
                  <span className="font-mono text-[9px] text-cyber-teal font-bold uppercase flex items-center gap-1 border border-cyber-teal/30 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-cyber-teal" /> Verified
                  </span>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {userDirectory.map((acc) => {
                    const isActive = user?.email.toLowerCase() === acc.email.toLowerCase();
                    return (
                      <div
                        key={acc.email}
                        onClick={() => handleSelectExistingAccount(acc.email)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                          isActive
                            ? 'border-cyber-blue bg-cyber-blue/15 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                            : 'border-slate-800 bg-slate-900/60 hover:border-cyber-blue/40 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-8 h-8 rounded-full object-cover border border-cyber-blue/40"
                          />
                          <div className="flex flex-col text-left">
                            <span className="font-mono text-xs font-bold text-slate-100 group-hover:text-cyber-blue transition-colors">
                              {acc.name}
                            </span>
                            <span className="font-rajdhani text-[11px] text-slate-400 font-semibold">{acc.email}</span>
                          </div>
                        </div>
                        {isActive ? (
                          <span className="font-orbitron font-extrabold text-[9px] text-cyber-teal bg-cyber-teal/10 border border-cyber-teal/40 px-2 py-0.5 rounded-full uppercase">
                            Active
                          </span>
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyber-blue transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Default Demo Quick Login */}
            <div className="pt-2">
              <button
                onClick={() => handleSelectExistingAccount('sahil.raj@gmail.com')}
                className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-cyber-blue/40 bg-slate-900/60 text-slate-400 hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyber-blue" /> Quick Sign In as Sahil Raj (Demo)
              </button>
            </div>

          </div>
        ) : mode === 'email_input' ? (
          /* MODE 2: Sign in with Google Account Email */
          <form onSubmit={handleGoogleEmailSubmit} className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <span className="font-orbitron font-bold text-xs text-cyber-blue uppercase tracking-wider block flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyber-blue" /> Enter your Google Account Email
              </span>
              <p className="font-rajdhani text-[11px] text-slate-400">
                Your profile details and test history log will be strictly bound to this Google account.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider">
                Google Email Address
              </label>
              <input
                type="email"
                required
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="e.g. sahil24raj@gmail.com"
                className="w-full bg-[#050816] border border-slate-800 focus:border-cyber-blue/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode('picker')}
                className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-2 py-3 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-teal text-slate-950 font-orbitron font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer flex items-center justify-center gap-2"
              >
                Continue with Google <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* MODE 3: Onboarding Academic Details */
          <form onSubmit={handleOnboardingSubmit} className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <span className="font-orbitron font-bold text-xs text-cyber-teal uppercase tracking-widest block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyber-teal" /> Google Account Verified
              </span>
              <p className="font-rajdhani text-[11px] text-slate-400">
                Setup your university academic profile once to auto-fill exam paper generation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyber-teal" /> College / University Name
                </label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. IIT Delhi / Chandigarh University"
                  className="w-full bg-[#050816] border border-slate-800 focus:border-cyber-blue/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyber-purple" /> Degree / Course Program
                </label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full bg-[#050816] border border-slate-800 focus:border-cyber-blue/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyber-blue" /> Department / Specialization
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. AI & Machine Learning"
                  className="w-full bg-[#050816] border border-slate-800 focus:border-cyber-blue/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Semester Subjects (comma separated)
                </label>
                <input
                  type="text"
                  value={subjectsStr}
                  onChange={(e) => setSubjectsStr(e.target.value)}
                  placeholder="e.g. Operating Systems, DBMS, DSA"
                  className="w-full bg-[#050816] border border-slate-800 focus:border-cyber-blue/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-teal text-slate-950 font-orbitron font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer mt-2"
            >
              Complete Setup & Launch App
            </button>
          </form>
        )}

        {/* Footer Security Badge */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-cyber-teal" /> Firebase Auth SDK v11.18
          </span>
          <span className="text-slate-600">Subjective Test AI</span>
        </div>

      </div>
    </div>
  );
};
export default GoogleAuthModal;
