"use client";

// File: components/Navigation/FloatingNav.tsx
// Description: Source file for FloatingNav.tsx.

import React, { useState, useEffect } from "react";
import { User, Mail } from "lucide-react";
import {
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
  GitHubIcon,
  FacebookIcon,
  DiscordIcon,
  TwitterIcon,
} from "@/components/Icons/SocialBrandIcons";

// Core module export or function definition that implements this feature.
const NAV_ITEMS = [
  { id: "hero", label: "Developer", icon: User },
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "linkedin", label: "LinkedIn", icon: LinkedInIcon },
  { id: "youtube", label: "YouTube", icon: YouTubeIcon },
  { id: "github", label: "GitHub", icon: GitHubIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
  { id: "discord", label: "Discord", icon: DiscordIcon },
  { id: "twitter", label: "Twitter (X)", icon: TwitterIcon },
  { id: "contact", label: "Contact", icon: Mail },
];

export const FloatingNav: React.FC = () => {
// Core module export or function definition that implements this feature.
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map((item) => document.getElementById(item.id));
// Core module export or function definition that implements this feature.
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        if (section) {
// Core module export or function definition that implements this feature.
          const top = section.offsetTop;
// Core module export or function definition that implements this feature.
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-3 p-3 rounded-full bg-white/5 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80">
      {NAV_ITEMS.map((item) => {
// Core module export or function definition that implements this feature.
        const Icon = item.icon;
// Core module export or function definition that implements this feature.
        const isActive = activeSection === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            title={item.label}
            className={`group relative p-2.5 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-110"
                : "text-white/40 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon size={16} />

            <span className="absolute right-12 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-black/90 backdrop-blur-md border border-white/15 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
};
