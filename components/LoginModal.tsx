'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { X, Mail, Lock, User, Eye, EyeOff, Flame } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // called after successful auth
}

// Google G icon SVG
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login, loginWithGoogle, signup, isLoading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignup) {
        if (!name.trim()) {
          setError('Please enter your full name.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err?.message ?? 'Authentication failed. Please try again.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message ?? 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const resetAndSwitch = () => {
    setIsSignup(!isSignup);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
          border: '1px solid #3a3a3a',
        }}
      >
        {/* Top gradient accent */}
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #ff6b35, #f7931e, #c41e3a)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #f7931e)' }}
            >
              <Flame size={16} />
            </div>
            <span className="font-bold text-[var(--foreground)] text-lg">HeatWatch</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--foreground)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <div className="px-7 pb-6">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {isSignup ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {isSignup
              ? 'Start monitoring urban heat for free'
              : 'Sign in to access your heat dashboard'}
          </p>
        </div>

        {/* Body */}
        <div className="px-7 pb-7 space-y-4">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: '#fff',
              color: '#1f1f1f',
              border: '1px solid #dadce0',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#3a3a3a' }} />
            <span className="text-xs text-[var(--text-muted)] font-medium">or</span>
            <div className="flex-1 h-px" style={{ background: '#3a3a3a' }} />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignup && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required={isSignup}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-fire)] transition-all"
                  style={{ background: '#2d2d2d', border: '1px solid #3a3a3a' }}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-fire)] transition-all"
                style={{ background: '#2d2d2d', border: '1px solid #3a3a3a' }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-fire)] transition-all"
                style={{ background: '#2d2d2d', border: '1px solid #3a3a3a' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div
                className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(196, 30, 58, 0.15)', border: '1px solid rgba(196,30,58,0.3)', color: '#ff6b6b' }}
              >
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              style={{
                background: isLoading
                  ? '#666'
                  : 'linear-gradient(135deg, #ff6b35, #c41e3a)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-[var(--text-muted)]">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={resetAndSwitch}
              className="font-semibold transition-colors"
              style={{ color: 'var(--accent-fire)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-heat)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-fire)')}
            >
              {isSignup ? 'Sign in' : 'Sign up for free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
