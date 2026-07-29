'use client';

import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { signInWithFirebaseGoogle, signInWithFirebaseEmail, signUpWithFirebaseEmail } from '../lib/firebase';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithFirebaseUser, updateProfile } = useAppState();

  type Screen = 'main' | 'email-login' | 'email-register' | 'onboarding';
  const [screen, setScreen] = useState<Screen>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Onboarding
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Operating Systems, DBMS, DSA, Computer Networks');

  if (!isOpen) return null;

  const onSuccess = (res: { success: boolean; isNewUser?: boolean }) => {
    if (res.success) {
      if (res.isNewUser || !user?.collegeName) {
        setScreen('onboarding');
      } else {
        onClose();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const fbUser = await signInWithFirebaseGoogle();
      setLoading(false);
      const res = loginWithFirebaseUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });
      onSuccess(res);
    } catch (err: any) {
      if (err.message === 'REDIRECT_INITIATED') {
        // Page will reload — show redirecting state
        setLoading(false);
        setRedirecting(true);
        return;
      }
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.');
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fbUser = screen === 'email-register'
        ? await signUpWithFirebaseEmail(email.trim(), password, displayName.trim() || email.split('@')[0])
        : await signInWithFirebaseEmail(email.trim(), password);

      setLoading(false);
      const res = loginWithFirebaseUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });
      onSuccess(res);
    } catch (err: any) {
      setLoading(false);
      const code = err.code || '';
      if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        setError('Invalid email or password.');
      } else if (code.includes('email-already-in-use')) {
        setError('This email is already registered. Try signing in.');
      } else if (code.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    }
  };

  const handleOnboarding = (e: React.FormEvent) => {
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

  // ─── Shared Styles ───
  const inputStyle: React.CSSProperties = {
    width: '100%', height: '44px', padding: '0 14px',
    borderRadius: '10px', fontSize: '14px', color: '#e2e8f0',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    outline: 'none', fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 500,
    color: '#94a3b8', marginBottom: '6px',
    fontFamily: "'Inter', system-ui, sans-serif",
  };
  const primaryBtnStyle: React.CSSProperties = {
    width: '100%', height: '44px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
    color: '#000', border: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    boxShadow: '0 4px 15px rgba(0,240,255,0.2)',
    transition: 'opacity 0.2s',
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '400px',
          borderRadius: '20px', overflow: 'hidden',
          backgroundColor: '#0c1230',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* ─── Header ─── */}
        <div style={{ padding: '32px 32px 8px', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
            boxShadow: '0 4px 20px rgba(0,240,255,0.3)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
            {screen === 'onboarding' ? 'Complete your profile' : screen === 'email-register' ? 'Create account' : 'Welcome back'}
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '6px 0 0', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {screen === 'onboarding' ? 'Set up your academic details' : 'Sign in to Subjective Test AI'}
          </p>
        </div>

        {/* ─── Body ─── */}
        <div style={{ padding: '20px 32px 28px' }}>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5', fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif",
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Loading / Redirecting */}
          {(loading || redirecting) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid #1e293b', borderTopColor: '#00f0ff',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Inter', system-ui, sans-serif" }}>
                {redirecting ? 'Redirecting to Google...' : 'Authenticating...'}
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

          ) : screen === 'main' ? (
            /* ─── Main Screen ─── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                style={{
                  width: '100%', height: 46, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  backgroundColor: '#fff', color: '#1f2937', border: 'none',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <GoogleLogo />
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Inter', system-ui, sans-serif" }}>or</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Email Button */}
              <button
                onClick={() => { setError(''); setScreen('email-login'); }}
                style={{
                  width: '100%', height: 46, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  backgroundColor: 'transparent', color: '#cbd5e1',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  transition: 'border-color 0.2s, background-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'; e.currentTarget.style.backgroundColor = 'rgba(0,240,255,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                ✉ Continue with Email
              </button>

              {/* Register link */}
              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <button
                  onClick={() => { setError(''); setScreen('email-register'); }}
                  style={{ background: 'none', border: 'none', color: '#00f0ff', fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  No account? <span style={{ fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Create one</span>
                </button>
              </div>
            </div>

          ) : screen === 'email-login' || screen === 'email-register' ? (
            /* ─── Email Auth ─── */
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {screen === 'email-register' && (
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text" required value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              )}
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password" required minLength={6} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
              <button type="submit" style={primaryBtnStyle}>
                {screen === 'email-register' ? 'Create Account' : 'Sign In'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setError(''); setScreen(screen === 'email-login' ? 'email-register' : 'email-login'); }}
                  style={{ background: 'none', border: 'none', color: '#00f0ff', fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  {screen === 'email-login' ? 'Need an account? Register' : 'Have an account? Sign in'}
                </button>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setError(''); setScreen('main'); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  ← All sign-in options
                </button>
              </div>
            </form>

          ) : (
            /* ─── Onboarding ─── */
            <form onSubmit={handleOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                backgroundColor: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.15)',
                color: '#00f0ff', fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif",
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>✓</span> Signed in successfully!
              </div>
              <div>
                <label style={labelStyle}>College / University</label>
                <input type="text" required value={collegeName} onChange={e => setCollegeName(e.target.value)}
                  placeholder="e.g. IIT Delhi" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Degree / Course</label>
                <input type="text" required value={course} onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <input type="text" required value={department} onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. AI & Machine Learning" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Subjects (comma separated)</label>
                <input type="text" value={subjectsStr} onChange={e => setSubjectsStr(e.target.value)}
                  placeholder="OS, DBMS, DSA" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
              <button type="submit" style={primaryBtnStyle}>Complete Setup</button>
            </form>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div style={{
          padding: '0 32px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, color: '#334155', fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <span>🔒 Secured by Firebase</span>
          <span>study-buddy-a26c5</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
