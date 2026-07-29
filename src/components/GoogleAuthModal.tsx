'use client';

import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { signInWithFirebaseGoogle, signInWithFirebaseEmail, signUpWithFirebaseEmail } from '../lib/firebase';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Google "G" logo SVG ─── */
const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithFirebaseUser, updateProfile } = useAppState();

  type ScreenType = 'sign-in' | 'email-login' | 'email-register' | 'onboarding';
  const [screen, setScreen] = useState<ScreenType>('sign-in');

  // Email Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Onboarding state
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Operating Systems, DBMS, DSA, Computer Networks');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const fbUser = await signInWithFirebaseGoogle();
      const res = loginWithFirebaseUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });
      setLoading(false);
      if (res.success) {
        if (res.isNewUser || !user?.collegeName) {
          setScreen('onboarding');
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let fbUser;
      if (screen === 'email-register') {
        fbUser = await signUpWithFirebaseEmail(email.trim(), password, displayName.trim() || email.split('@')[0]);
      } else {
        fbUser = await signInWithFirebaseEmail(email.trim(), password);
      }
      const res = loginWithFirebaseUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });
      setLoading(false);
      if (res.success) {
        if (res.isNewUser || screen === 'email-register' || !user?.collegeName) {
          setScreen('onboarding');
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Couldn\'t find your account. Check your email and password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email. Sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);
    updateProfile({
      collegeName: collegeName.trim() || 'University',
      course: course.trim() || 'B.Tech',
      department: department.trim() || 'Computer Science',
      subjects: subjects.length > 0 ? subjects : ['Operating Systems', 'DBMS', 'DSA'],
      isProfileComplete: true,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#0a0f2c',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-2 text-center">
          <div className="flex justify-center mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 20px rgba(0,240,255,0.3)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <h2 className="text-[22px] font-semibold text-white tracking-tight" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            {screen === 'onboarding' ? 'Complete your profile' : screen === 'email-register' ? 'Create account' : 'Sign in'}
          </h2>
          <p className="text-sm text-slate-400 mt-1" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            {screen === 'onboarding' ? 'Set up your academic details' : 'to continue to Subjective Test AI'}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-5">
          {/* Error */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
              style={{
                backgroundColor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#fca5a5',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
              }}
            >
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            /* Loading spinner */
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div
                className="w-10 h-10 rounded-full border-[3px] border-slate-700 animate-spin"
                style={{ borderTopColor: '#00f0ff' }}
              />
              <p className="text-sm text-slate-400" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                Connecting to Firebase...
              </p>
            </div>
          ) : screen === 'sign-in' ? (
            /* ── Main Sign-In Screen ── */
            <div className="space-y-3">
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: '#fff',
                  color: '#1f2937',
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = '#fff'; }}
              >
                <GoogleLogo size={20} />
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Email Sign In Button */}
              <button
                onClick={() => { setError(''); setScreen('email-login'); }}
                className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(0,240,255,0.3)'; (e.target as HTMLElement).style.backgroundColor = 'rgba(0,240,255,0.04)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span>Continue with Email</span>
              </button>

              {/* Create account link */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => { setError(''); setScreen('email-register'); }}
                  className="text-sm cursor-pointer"
                  style={{ color: '#00f0ff', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                >
                  Don&apos;t have an account? <span className="font-semibold underline underline-offset-2">Create one</span>
                </button>
              </div>
            </div>

          ) : screen === 'email-login' || screen === 'email-register' ? (
            /* ── Email Auth Form ── */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {screen === 'email-register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Sahil Raj"
                    className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontFamily: "'Inter', 'Segoe UI', sans-serif",
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
                  color: '#000',
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                  boxShadow: '0 4px 15px rgba(0,240,255,0.25)',
                }}
              >
                {screen === 'email-register' ? 'Create Account' : 'Sign In'}
              </button>

              {/* Toggle between Login / Register */}
              <div className="text-center pt-1">
                {screen === 'email-login' ? (
                  <button
                    type="button"
                    onClick={() => { setError(''); setScreen('email-register'); }}
                    className="text-sm cursor-pointer"
                    style={{ color: '#00f0ff', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                  >
                    Need an account? <span className="font-semibold">Register</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setError(''); setScreen('email-login'); }}
                    className="text-sm cursor-pointer"
                    style={{ color: '#00f0ff', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                  >
                    Already have an account? <span className="font-semibold">Sign in</span>
                  </button>
                )}
              </div>

              {/* Back to main sign in */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setError(''); setScreen('sign-in'); }}
                  className="text-xs cursor-pointer"
                  style={{ color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                >
                  ← Back to all sign-in options
                </button>
              </div>
            </form>

          ) : (
            /* ── Onboarding: Academic Profile ── */
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-1" style={{ backgroundColor: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.15)' }}>
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#00f0ff" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm" style={{ color: '#00f0ff', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                  Signed in successfully!
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                  College / University
                </label>
                <input
                  type="text" required value={collegeName} onChange={e => setCollegeName(e.target.value)}
                  placeholder="e.g. IIT Delhi, Chandigarh University"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                  Degree / Course
                </label>
                <input
                  type="text" required value={course} onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                  Department
                </label>
                <input
                  type="text" required value={department} onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. AI & Machine Learning"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                  Subjects (comma separated)
                </label>
                <input
                  type="text" value={subjectsStr} onChange={e => setSubjectsStr(e.target.value)}
                  placeholder="Operating Systems, DBMS, DSA"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
                  color: '#000',
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                  boxShadow: '0 4px 15px rgba(0,240,255,0.25)',
                }}
              >
                Complete Setup
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 pt-2">
          <div className="flex items-center justify-between text-[11px]" style={{ color: '#475569', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Secured by Firebase
            </span>
            <span>study-buddy-a26c5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
