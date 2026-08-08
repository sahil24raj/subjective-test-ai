'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../context/AppStateContext';
import { signInWithSupabaseEmail, signUpWithSupabaseEmail } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithSupabaseUser, updateProfile } = useAppState();

  const [mounted, setMounted] = useState(false);
  type Screen = 'login' | 'register' | 'onboarding';
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const spUser = screen === 'register'
        ? await signUpWithSupabaseEmail(email.trim(), password, displayName.trim() || email.split('@')[0])
        : await signInWithSupabaseEmail(email.trim(), password);

      setLoading(false);

      if (!spUser) {
        if (screen === 'register') {
          setError('Registration successful! Check your email if verification is required.');
          return;
        }
        throw new Error("Unable to authenticate with Supabase.");
      }

      const res = await loginWithSupabaseUser({
        id: spUser.id,
        email: spUser.email || null,
        displayName: (spUser.user_metadata?.display_name || spUser.user_metadata?.full_name || displayName) || null,
        photoURL: spUser.user_metadata?.avatar_url || null,
      });
      onSuccess(res);
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
      } else if (msg.includes('User already registered')) {
        setError('Email is already registered. Try logging in.');
      } else {
        setError(msg || 'Authentication failed.');
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
    height: '44px',
    padding: '0 14px',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#f8fafc',
    backgroundColor: '#05091e',
    border: '1px solid rgba(0, 240, 255, 0.25)',
    outline: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'all 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#38bdf8',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: '100%',
    height: '46px',
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
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
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
        <div style={{ padding: '28px 28px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #00f0ff, #3b82f6)',
            boxShadow: '0 4px 22px rgba(0,240,255,0.4)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="26" height="26" stroke="#020617" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
            {screen === 'onboarding' ? 'Academic Profile Setup' : 'Supabase Authentication'}
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {screen === 'onboarding' ? 'Setup your university details for AI exam generator' : 'Sign in or create account powered by Supabase'}
          </p>

          {/* Login / Register Toggle Tabs */}
          {screen !== 'onboarding' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 18, backgroundColor: 'rgba(5, 9, 30, 0.8)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => { setError(''); setScreen('login'); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  backgroundColor: screen === 'login' ? '#00f0ff' : 'transparent',
                  color: screen === 'login' ? '#020617' : '#94a3b8',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setError(''); setScreen('register'); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  backgroundColor: screen === 'register' ? '#00f0ff' : 'transparent',
                  color: screen === 'register' ? '#020617' : '#94a3b8',
                }}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* ─── Body ─── */}
        <div style={{ padding: '20px 28px 24px' }}>

          {/* Error Banner */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5', fontSize: 12, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif",
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 0', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid #1e293b', borderTopColor: '#00f0ff',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: 13, color: '#00f0ff', fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif" }}>
                Connecting to Supabase...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

          ) : screen === 'login' || screen === 'register' ? (
            /* ─── Direct Supabase Email/Password Form ─── */
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {screen === 'register' && (
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
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
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
              <button type="submit" style={{ ...primaryBtnStyle, marginTop: 6 }}>
                {screen === 'register' ? 'Register Account' : 'Sign In with Supabase'}
              </button>
            </form>

          ) : (
            /* ─── Onboarding Form ─── */
            <form onSubmit={handleOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                padding: '8px 12px', borderRadius: 8,
                backgroundColor: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)',
                color: '#00f0ff', fontSize: 12, fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif",
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>✓</span> Authenticated via Supabase
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
          <span>🔒 Secured by Supabase Auth</span>
          <span>Study Buddy AI</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GoogleAuthModal;
