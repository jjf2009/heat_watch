'use client';

import { useAuth } from '@/lib/auth-context';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import CTASection from '@/components/CTASection';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
    </div>
  );
}
