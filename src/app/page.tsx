// File: app/page.tsx
// Description: Root page component that assembles all app sections.

import React from "react";
import { LenisProvider } from "@/components/SmoothScroll/LenisProvider";
import { BackgroundCanvas } from "@/components/Background/BackgroundCanvas";
import { CursorGlow } from "@/components/CursorGlow/CursorGlow";
import { FloatingNav } from "@/components/Navigation/FloatingNav";

import HeroCardWrapper from "@/components/Hero/HeroCardWrapper";
import { InstagramCard } from "@/components/SocialCard/InstagramCard";
import { LinkedInCard } from "@/components/SocialCard/LinkedInCard";
import { YouTubeCard } from "@/components/SocialCard/YouTubeCard";
import { GitHubCard } from "@/components/SocialCard/GitHubCard";
import { FacebookCard } from "@/components/SocialCard/FacebookCard";
import { DiscordCard } from "@/components/SocialCard/DiscordCard";
import { TwitterCard } from "@/components/SocialCard/TwitterCard";
import { FooterCard } from "@/components/Footer/FooterCard";

export default function Home() {
  return (
    <LenisProvider>
      <main className="relative min-h-screen bg-[#050505] text-white selection:bg-blue-500 selection:text-white">
        {/* Dynamic Background Canvas Layer */}
        <BackgroundCanvas />

        {/* Spring Cursor Spotlight Glow */}
        <CursorGlow />

        {/* Floating Right Dock Nav */}
        <FloatingNav />

        {/* Fullscreen Card Sections on Desktop / Sequential Gapped Cards on Mobile */}
        <div className="relative z-10 flex flex-col gap-6 sm:gap-10 md:gap-0">
          <HeroCardWrapper />
          <InstagramCard />
          <LinkedInCard />
          <YouTubeCard />
          <GitHubCard />
          <FacebookCard />
          <DiscordCard />
          <TwitterCard />
          <FooterCard />
        </div>
      </main>
    </LenisProvider>
  );
}
