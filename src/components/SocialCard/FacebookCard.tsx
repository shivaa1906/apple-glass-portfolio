"use client";

// File: components/SocialCard/FacebookCard.tsx
// Description: Facebook social card with page stats and recent post preview.

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SOCIAL_PROFILES } from "@/data/socialData";
import { CardContainer } from "./CardContainer";
import { Share2, ExternalLink, Globe } from "lucide-react";
import { FacebookIcon } from "@/components/Icons/SocialBrandIcons";
import PlatformBadge from "@/components/PlatformBadge/PlatformBadge";
import { useCardState } from "@/lib/useCardState";

// Type definition used to describe the structure of data in this component.
type FacebookProfileResponse = {
  name: string;
  username?: string;
  picture: string;
  cover?: string;
  link: string;
  followers_count?: number;
  fan_count?: number;
  posts_count?: number;
};

type FacebookPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  shares?: { count?: number };
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const resolveStatValue = (value: string | null | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : "0";
};

const ensureHandle = (username: string) => {
  if (!username.trim()) return "";
  return username.startsWith("@") ? username : `@${username}`;
};

export const FacebookCard: React.FC = () => {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "facebook")!;
// Core module export or function definition that implements this feature.
  const [facebookProfile, setFacebookProfile] = useState<FacebookProfileResponse | null>(null);
  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[] | null>(null);
  const [displayFollowers, setDisplayFollowers] = useState(() => resolveStatValue(profile.stats[0].value));
  const [displayLikes, setDisplayLikes] = useState(() => resolveStatValue(profile.stats[1].value));
  const followerAnimationRef = useRef<number | null>(null);
  const likesAnimationRef = useRef<number | null>(null);
  const previousFollowersRef = useRef<number | null>(null);
  const previousLikesRef = useRef<number | null>(null);

// Core module export or function definition that implements this feature.
  const animateValue = (
    from: number,
    to: number,
    setter: React.Dispatch<React.SetStateAction<string>>,
    frameRef: React.MutableRefObject<number | null>
  ) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

// Core module export or function definition that implements this feature.
    const duration = 500;
// Core module export or function definition that implements this feature.
    const startTime = performance.now();

    const step = (timestamp: number) => {
// Core module export or function definition that implements this feature.
      const progress = Math.min((timestamp - startTime) / duration, 1);
// Core module export or function definition that implements this feature.
      const current = Math.round(from + (to - from) * progress);
      setter(formatNumber(current));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(step);
  };

  const fetchFacebookData = async () => {
    try {
// Core module export or function definition that implements this feature.
      const response = await fetch("/api/facebook/page", {
        cache: "no-store",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (!response.ok) {
        throw new Error("Unable to load Facebook page data.");
      }

// Core module export or function definition that implements this feature.
      const data = await response.json();
      setFacebookProfile(data);
    } catch {
      // Keep the existing card state if the fetch fails.
    }
  };

  const fetchFacebookPosts = async () => {
    try {
      const resp = await fetch("/api/facebook/posts", { cache: "no-store" });
      if (!resp.ok) return;
      const d = await resp.json();
      setFacebookPosts(Array.isArray(d) ? d : null);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Poll every 4-6 minutes (randomized) so updates happen regularly but not all at once.
    const pollMs = 240000 + Math.floor(Math.random() * 120000);
    const intervalId = window.setInterval(() => {
      void fetchFacebookData();
      void fetchFacebookPosts();
    }, pollMs);

    // initial load
    void fetchFacebookData();
    void fetchFacebookPosts();

// Core module export or function definition that implements this feature.
    const followerFrame = followerAnimationRef.current;
    const likeFrame = likesAnimationRef.current;

    return () => {
      window.clearInterval(intervalId);
      if (followerFrame !== null) cancelAnimationFrame(followerFrame);
      if (likeFrame !== null) cancelAnimationFrame(likeFrame);
    };
  }, []);

  useEffect(() => {
    if (facebookProfile?.followers_count == null) {
      return;
    }

    const target = facebookProfile.followers_count;
    const previous = previousFollowersRef.current ?? target;
    if (previous !== target) {
      animateValue(previous, target, setDisplayFollowers, followerAnimationRef);
    } else {
      setDisplayFollowers(formatNumber(target));
    }
    previousFollowersRef.current = target;
  }, [facebookProfile?.followers_count]);

  useEffect(() => {
    if (facebookProfile?.fan_count == null) {
      return;
    }

    const target = facebookProfile.fan_count;
    const previous = previousLikesRef.current ?? target;
    if (previous !== target) {
      animateValue(previous, target, setDisplayLikes, likesAnimationRef);
    } else {
      setDisplayLikes(formatNumber(target));
    }
    previousLikesRef.current = target;
  }, [facebookProfile?.fan_count]);

// Core module export or function definition that implements this feature.
  const coverUrl = facebookProfile?.cover || (typeof profile.details?.cover === "string" ? profile.details.cover : facebookProfile?.picture || "/assets/profile_avatar1.jpg");
// Core module export or function definition that implements this feature.
  const avatarUrl = facebookProfile?.picture || profile.avatar || "/assets/profile_avatar1.jpg";
// Core module export or function definition that implements this feature.
  const cardState = useCardState();
// Core module export or function definition that implements this feature.
  const displayName = facebookProfile?.name || profile.name;
// Core module export or function definition that implements this feature.
  const displayHandle = facebookProfile?.username ? ensureHandle(facebookProfile.username) : profile.handle;
// Core module export or function definition that implements this feature.
  const followersValue = facebookProfile?.followers_count != null ? displayFollowers : resolveStatValue(profile.stats[0].value);
  const likesValue = facebookProfile?.fan_count != null ? displayLikes : resolveStatValue(profile.stats[1].value);
  const postsCount = facebookProfile?.posts_count != null ? String(facebookProfile.posts_count) : Array.isArray(facebookPosts) ? String(facebookPosts.length) : resolveStatValue(profile.stats[2].value);

  // If there are live posts from the API, prefer the latest post as the featured announcement.
  const latest = Array.isArray(facebookPosts) && facebookPosts.length ? facebookPosts[0] : null;
  const featuredPostDetails = profile.details?.featuredPost as Record<string, unknown> | undefined;
  const featuredPost = latest
    ? {
        text: latest.message || "",
        date: latest.created_time || "",
        likes: "",
        shares: latest.shares?.count ? String(latest.shares.count) : "",
      }
    : {
        text: cardState.facebookAnnouncementText || (typeof featuredPostDetails?.text === "string" ? featuredPostDetails.text : ""),
        date: cardState.facebookAnnouncementDate || (typeof featuredPostDetails?.date === "string" ? featuredPostDetails.date : ""),
        likes: typeof featuredPostDetails?.likes === "string" ? featuredPostDetails.likes : "",
        shares: typeof featuredPostDetails?.shares === "string" ? featuredPostDetails.shares : "",
      };
// Core module export or function definition that implements this feature.
  const actionUrl = facebookProfile?.link || profile.actionUrl;

  return (
    <CardContainer id="facebook" accentGlow={profile.accentGlow}>
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="relative h-32 sm:h-40 w-full rounded-2xl overflow-hidden border border-white/10">
          <Image
            src={coverUrl}
            alt="Facebook Cover"
            fill
            sizes="100vw"
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
            <Globe size={13} className="text-blue-400" />
            <span>Official Tech & Design Community</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-10 px-2">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-blue-600 shadow-xl shadow-blue-500/30 z-10 flex-shrink-0 aspect-square">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black flex-shrink-0 aspect-square">
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  sizes="80px"
                  className="object-cover rounded-full"
                />
              </div>
            </div>
            <div className="pt-6 sm:pt-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{displayName}</h3>
                <PlatformBadge
                  icon={<FacebookIcon size={14} />}
                  label="Facebook"
                  bg="rgba(24,119,242,0.12)"
                  border="rgba(24,119,242,0.24)"
                  shadow="0 0 18px rgba(24,119,242,0.12)"
                />
              </div>
              <p className="text-sm font-medium text-blue-400">{displayHandle}</p>
            </div>
          </div>

          <a
            href={actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-blue-600/30 hover:scale-105"
          >
            <span>{profile.actionLabel}</span>
            <ExternalLink size={15} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/10 text-center">
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-white">{followersValue}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Followers</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-white">{likesValue}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Likes</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-white">{postsCount}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Posts</div>
          </div>
        </div>

        <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="font-semibold text-white/90">Latest Community Announcement</span>
            <span>{featuredPost?.date}</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-normal">
            {featuredPost?.text}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/60 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
              <Share2 size={14} />
              {featuredPost?.shares} Shares
            </span>
          </div>
        </div>
      </div>
    </CardContainer>
  );
};
