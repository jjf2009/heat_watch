'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/why-us', label: 'Why Us' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--accent-fire)]">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-heat)] rounded-full flex items-center justify-center text-white text-sm font-bold">🌡️</div>
              HeatWatch
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[var(--accent-fire)]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-heat)] flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--foreground)]">{user.name}</p>
                    <p className="text-xs text-[var(--accent-fire)] font-semibold uppercase">{user.plan} plan</p>
                  </div>
                  <button
                    onClick={async () => {
                      await logout();
                      router.push('/');
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} className="text-[var(--text-muted)]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                  suppressHydrationWarning
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2"
            >
              {mobileOpen ? (
                <X size={24} className="text-gray-600" />
              ) : (
                <Menu size={24} className="text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-gray-600 hover:text-orange-600 text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 mt-4">
                {user ? (
                  <button
                    onClick={async () => {
                      await logout();
                      router.push('/');
                      setMobileOpen(false);
                    }}
                    className="w-full text-left py-2 text-gray-600 hover:text-orange-600 text-sm font-medium flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setLoginOpen(true);
                      setMobileOpen(false);
                    }}
                    className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                    suppressHydrationWarning
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
