import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] text-[var(--text-muted)] pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-heat)] rounded-full flex items-center justify-center text-white text-sm font-bold">🌡️</div>
              HeatWatch
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Advanced urban heat island prediction and analysis for climate authorities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[var(--foreground)] font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-[var(--accent-fire)] transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-[var(--accent-fire)] transition-colors">About</Link></li>
              <li><Link href="/why-us" className="hover:text-[var(--accent-fire)] transition-colors">Why Us</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--accent-fire)] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[var(--foreground)] font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-[var(--accent-fire)] transition-colors">Pricing</Link></li>
              <li><a href="#features" className="hover:text-[var(--accent-fire)] transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-[var(--accent-fire)] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[var(--accent-fire)] transition-colors">API</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[var(--foreground)] font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:support@heatwatch.com" className="hover:text-[var(--accent-fire)] transition-colors">
                  support@heatwatch.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5" />
                <span>San Francisco, CA, USA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {currentYear} HeatWatch. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
