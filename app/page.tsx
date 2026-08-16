'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import AtmosphereBackground from '@/components/AtmosphereBackground';
import LandingHero from '@/components/LandingHero';
import FeatureShowcase from '@/components/FeatureShowcase';
import VisualProofSection from '@/components/VisualProofSection';
import FinalCTASection from '@/components/FinalCTASection';

export default function LandingPage() {
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleLaunch = () => {
    router.push('/editor');
  };

  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen bg-[#05050A] text-[#F4F5FF] overflow-x-hidden selection:bg-glowViolet/30 selection:text-white">
      {/* Background Atmosphere */}
      <AtmosphereBackground />

      {/* Section 1: Hero */}
      <LandingHero
        onLaunch={handleLaunch}
        onScrollToFeatures={handleScrollToFeatures}
      />

      {/* Section 2: Feature Showcase (Scroll-Pinned) */}
      <div ref={featuresRef}>
        <FeatureShowcase />
      </div>

      {/* Section 3: Visual Proof Strip */}
      <VisualProofSection />

      {/* Section 4: Final CTA & Climax */}
      <FinalCTASection onLaunch={handleLaunch} />
    </main>
  );
}
