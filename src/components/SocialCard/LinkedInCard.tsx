"use client";

// File: components/SocialCard/LinkedInCard.tsx
// Description: LinkedIn social card with profile metrics and headline.

import React from "react";
import Image from "next/image";
import { SOCIAL_PROFILES } from "@/data/socialData";
import { CardContainer } from "./CardContainer";
import { Briefcase, Award, CheckCircle, ExternalLink } from "lucide-react";
import { LinkedInIcon } from "@/components/Icons/SocialBrandIcons";
import PlatformBadge from "@/components/PlatformBadge/PlatformBadge";
import { useCardState } from "@/lib/useCardState";

export const LinkedInCard: React.FC = () => {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "linkedin")!;
// Core module export or function definition that implements this feature.
  const cardState = useCardState();

// Core module export or function definition that implements this feature.
  const headline = cardState.linkedinHeadline || profile.details?.headline;
// Core module export or function definition that implements this feature.
  const bio = cardState.linkedinHeadlineBio || profile.bio;
// Core module export or function definition that implements this feature.
  const stats = [
    { label: "Connections", value: cardState.linkedinConnections || profile.stats[0].value },
    { label: "Followers", value: cardState.linkedinFollowers || profile.stats[1].value },
    { label: "Recommendations", value: cardState.linkedinRecommendations || profile.stats[2].value },
  ];

  return (
    <CardContainer id="linkedin" accentGlow={profile.accentGlow}>
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-600 shadow-lg shadow-blue-500/20 flex-shrink-0 aspect-square">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black flex-shrink-0 aspect-square">
                <Image
                  src={profile.avatar || "/assets/profile_avatar1.jpg"}
                  alt={profile.name}
                  fill
                  sizes="80px"
                  className="object-cover rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{profile.name}</h3>
                <PlatformBadge
                  icon={<LinkedInIcon size={14} />}
                  label="LinkedIn"
                  bg="rgba(10,102,194,0.12)"
                  border="rgba(10,102,194,0.28)"
                  shadow="0 0 18px rgba(10,102,194,0.18)"
                />
              </div>
              <p className="text-sm font-medium text-blue-400">{headline}</p>
              <p className="text-xs text-white/60 mt-1 max-w-lg">{bio}</p>
            </div>
          </div>

          <a
            href={profile.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-blue-500/30 hover:scale-105"
          >
            <span>{profile.actionLabel}</span>
            <ExternalLink size={15} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/10 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Briefcase size={14} />
              Career Timeline
            </h4>
            <div className="space-y-3">
              {profile.details?.experiences?.map((exp: { role: string; period: string; company: string; description: string }, idx: number) => (
                <div
                  key={idx}
                  className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-white">{exp.role}</span>
                    <span className="text-[11px] text-blue-400 font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 font-medium mt-0.5">{exp.company}</p>
                  <p className="text-xs text-white/70 mt-1.5">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Award size={14} />
              Core Competencies & Endorsements
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {profile.details?.skills?.map((skill: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 text-xs text-white/90 font-medium transition-all"
                >
                  <CheckCircle size={13} className="text-blue-400" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardContainer>
  );
};
