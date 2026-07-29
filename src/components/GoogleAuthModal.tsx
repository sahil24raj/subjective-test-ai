'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

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
        setLoading(false);
        setRedirecting(true);
        return;
      }
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console.');
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
        setError('Email is already registered. Try logging in.');
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

  // ─── Shared SaaS Styling Tokens ───
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 14px',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#f8fafc',
    backgroundColor: '#05091e',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    outline: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'all 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#38bdf8',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: '100%',
    height: '44px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
    color: '#020617',
    border: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    boxShadow: '0 4px 20px rgba(0,240,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  };

  const modalContent = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(2, 5, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Centered SaaS Dialog Window */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '24px',
          backgroundColor: '#090d2a',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 240, 255, 0.2)',
          position: 'relative',
          margin: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            zIndex: 10,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#94a3b8',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          ✕
        </button>

        {/* ─── Header ─── */}
        <div style={{ padding: '28px 28px 14px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
            boxShadow: '0 4px 22px rgba(0,240,255,0.4)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
            {screen === 'onboarding' ? 'Academic Profile Setup' : screen === 'email-register' ? 'Create Student Account' : 'Sign In to Subjective Test AI'}
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {screen === 'onboarding' ? 'Setup your university details once to auto-fill AI exam builder' : 'Real SaaS Google Authentication Portal'}
          </p>
        </div>

        {/* ─── Body ─── */}
        <div style={{ padding: '20px 28px 24px' }}>

          {/* Error Banner */}
          {error && (
            <div style={{
              marginBottom: 14, padding: '10px 14px', borderRadius: 10,
              backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5', fontSize: 12, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif",
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Loading / Redirecting */}
          {(loading || redirecting) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 0', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid #1e293b', borderTopColor: '#00f0ff',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: 13, color: '#00f0ff', fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif" }}>
                {redirecting ? 'Redirecting to Google OAuth...' : 'Connecting to Firebase Authentication...'}
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

          ) : screen === 'main' ? (
            /* ─── Main Screen ─── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                style={{
                  width: '100%', height: 46, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  backgroundColor: '#fff', color: '#0f172a', border: 'none',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  boxShadow: '0 4px 15px rgba(255,255,255,0.15)',
                  transition: 'transform 0.15s, background-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <GoogleLogo />
                Sign in with Google OAuth
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '2px 0' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif" }}>or</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Email Button */}
              <button
                onClick={() => { setError(''); setScreen('email-login'); }}
                style={{
                  width: '100%', height: 44, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  backgroundColor: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.5)'; e.currentTarget.style.backgroundColor = 'rgba(0,240,255,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
              >
                ✉ Sign in with Firebase Email
              </button>

              {/* Register link */}
              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <button
                  onClick={() => { setError(''); setScreen('email-register'); }}
                  style={{ background: 'none', border: 'none', color: '#00f0ff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  Don&apos;t have an account? <span style={{ textDecoration: 'underline' }}>Register now</span>
                </button>
              </div>
            </div>

          ) : screen === 'email-login' || screen === 'email-register' ? (
            /* ─── Email Auth Form ─── */
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {screen === 'email-register' && (
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text" required value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Sahil Raj"
                    style={inputStyle}
                  />
                </div>
              )}
              <div>
                <label style={labelStyle}>Firebase Email Address</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password" required minLength={6} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>
              <button type="submit" style={{ ...primaryBtnStyle, marginTop: 4 }}>
                {screen === 'email-register' ? 'Register Account' : 'Sign In'}
              </button>
              <div style={{ textAlign: 'center', paddingTop: 2 }}>
                <button
                  type="button"
                  onClick={() => { setError(''); setScreen(screen === 'email-login' ? 'email-register' : 'email-login'); }}
                  style={{ background: 'none', border: 'none', color: '#00f0ff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  {screen === 'email-login' ? 'Need an account? Register' : 'Already registered? Log in'}
                </button>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setError(''); setScreen('main'); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  ← Back to main options
                </button>
              </div>
            </form>

          ) : (
            /* ─── Onboarding Form (Spacious & Clean Layout) ─── */
            <form onSubmit={handleOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                padding: '8px 12px', borderRadius: 8,
                backgroundColor: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)',
                color: '#00f0ff', fontSize: 12, fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif",
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>✓</span> Verified Firebase Account
              </div>

              <div>
                <label style={labelStyle}>College / University Name</label>
                <input type="text" required value={collegeName} onChange={e => setCollegeName(e.target.value)}
                  placeholder="e.g. IIT Delhi / Chandigarh University" style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Degree / Course</label>
                  <input type="text" required value={course} onChange={e => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech CSE" style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Department</label>
                  <input type="text" required value={department} onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. AI & ML" style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Semester Subjects (comma separated)</label>
                <input type="text" value={subjectsStr} onChange={e => setSubjectsStr(e.target.value)}
                  placeholder="Operating Systems, DBMS, DSA, Networks" style={inputStyle}
                />
              </div>

              <button type="submit" style={{ ...primaryBtnStyle, marginTop: 6 }}>
                Complete Setup & Launch App
              </button>
            </form>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div style={{
          padding: '0 28px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, color: '#475569', fontFamily: "'Inter', system-ui, sans-serif",
          borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 12,
        }}>
          <span>🔒 Secured by Firebase Auth SDK</span>
          <span>study-buddy-a26c5</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GoogleAuthModal;
