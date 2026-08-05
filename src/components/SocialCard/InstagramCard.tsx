"use client";

// File: components/SocialCard/InstagramCard.tsx
// Description: Instagram social card displaying latest posts and follower data.

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SOCIAL_PROFILES } from "@/data/socialData";
import { CardContainer } from "./CardContainer";
import { Heart, MessageCircle, ExternalLink, Sparkles, Eye } from "lucide-react";
import { InstagramIcon } from "@/components/Icons/SocialBrandIcons";
import PlatformBadge from "@/components/PlatformBadge/PlatformBadge";

// Type definition used to describe the structure of data in this component.
type InstagramProfileResponse = {
  username: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string;
};

// Type definition used to describe the structure of data in this component.
type InstagramPostResponse = {
  id: string;
  caption: string;
  media_url: string;
  permalink: string;
  timestamp: string;
};

const formatCount = (value: number) => {
  if (!Number.isFinite(value)) return "—";

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
};

export const InstagramCard: React.FC = () => {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "instagram")!;

  // Live profile state used to replace the static Instagram values.
  const [instagramProfile, setInstagramProfile] = useState<InstagramProfileResponse | null>(null);
// Core module export or function definition that implements this feature.
  const [profileLoading, setProfileLoading] = useState(true);
// Core module export or function definition that implements this feature.
  const [profileError, setProfileError] = useState<string | null>(null);

  // The latest 3 public posts are pulled from the Instagram posts API route.
  const [featuredPosts, setFeaturedPosts] = useState<InstagramPostResponse[]>([]);
// Core module export or function definition that implements this feature.
  const [postsLoading, setPostsLoading] = useState(true);
// Core module export or function definition that implements this feature.
  const [postsError, setPostsError] = useState<string | null>(null);
  const [totalLikes, setTotalLikes] = useState<number | null>(null);
  const [totalComments, setTotalComments] = useState<number | null>(null);
  const [totalReach, setTotalReach] = useState<number | null>(null);
  const [profileReachValue, setProfileReachValue] = useState<number | null>(null);
  const [profileSince, setProfileSince] = useState<Date | null>(null);
  const [profileUntil, setProfileUntil] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: number | null = null;

    const fetchInstagramData = async () => {
      try {
        setProfileLoading(true);
        setPostsLoading(true);
        setProfileError(null);
        setPostsError(null);

        // Build default date range (last 30 days) and request profile insights
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        const qs = `?since=${encodeURIComponent(start.toISOString())}&until=${encodeURIComponent(end.toISOString())}`;

        const [profileResponse, postsResponse] = await Promise.all([
          fetch(`/api/instagram${qs}`, { cache: "no-store", headers: { "ngrok-skip-browser-warning": "true" } }),
          fetch("/api/instagram/posts", { cache: "no-store", headers: { "ngrok-skip-browser-warning": "true" } }),
        ]);

        if (!profileResponse.ok) {
          const profileError = await profileResponse.json().catch(() => null);
          throw new Error(
            profileError?.error
              ? `Instagram profile error: ${profileError.error}`
              : "Unable to load Instagram profile information."
          );
        }

        if (!postsResponse.ok) {
          const postsError = await postsResponse.json().catch(() => null);
          throw new Error(
            postsError?.error
              ? `Instagram posts error: ${postsError.error}`
              : "Unable to load latest Instagram posts."
          );
        }

        const profileJson = await profileResponse.json();
        const profileData: InstagramProfileResponse = {
          username: profileJson.username || "",
          followers_count: Number(profileJson.followers_count || 0),
          follows_count: Number(profileJson.follows_count || 0),
          media_count: Number(profileJson.media_count || 0),
          profile_picture_url: profileJson.profile_picture_url || "",
        };

        const postsData = await postsResponse.json();

        if (!isMounted) return;
        setInstagramProfile(profileData);
        setFeaturedPosts(Array.isArray(postsData.posts) ? postsData.posts : []);
        setTotalLikes(typeof postsData.totalLikes === "number" ? postsData.totalLikes : null);
        setTotalComments(typeof postsData.totalComments === "number" ? postsData.totalComments : null);
        setTotalReach(typeof postsData.totalReach === "number" ? postsData.totalReach : null);
        setProfileReachValue(typeof profileJson.profileReach === "number" ? profileJson.profileReach : null);
        setProfileSince(profileJson.since ? new Date(profileJson.since) : start);
        setProfileUntil(profileJson.until ? new Date(profileJson.until) : end);
      } catch (error) {
        if (!isMounted) return;
// Core module export or function definition that implements this feature.
        const message = error instanceof Error ? error.message : "Something went wrong while loading Instagram data.";
        setProfileError(message);
        setPostsError(message);
      } finally {
        if (!isMounted) return;
        setProfileLoading(false);
        setPostsLoading(false);
      }
    };

    fetchInstagramData();
    intervalId = window.setInterval(fetchInstagramData, 300000);

    return () => {
      isMounted = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  const stats = useMemo(() => {
    // Keep the original card layout intact while swapping the live values into the same three stat slots.
    const fallbackStats = profile.stats.map((stat) => stat.value);

    return [
      {
        label: "Posts",
        value: instagramProfile ? formatCount(instagramProfile.media_count) : fallbackStats[0],
      },
      {
        label: "Followers",
        value: instagramProfile ? formatCount(instagramProfile.followers_count) : fallbackStats[1],
      },
      {
        label: "Following",
        value: instagramProfile ? formatCount(instagramProfile.follows_count) : fallbackStats[2],
      },
    ];
  }, [instagramProfile, profile.stats]);

  // Use the live avatar when available; otherwise, preserve a local placeholder so the card
  // layout remains stable while the API data is still loading.
  const avatarUrl = instagramProfile?.profile_picture_url || profile.avatar || "/assets/profile_avatar1.jpg";
// Core module export or function definition that implements this feature.
  const displayHandle = instagramProfile?.username ? `@${instagramProfile.username}` : profile.handle;

  return (
    <CardContainer id="instagram" accentGlow={profile.accentGlow}>
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 shadow-lg shadow-pink-500/20 flex-shrink-0 aspect-square">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black flex-shrink-0 aspect-square">
                <Image
                  src={avatarUrl}
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
                  icon={<InstagramIcon size={14} />}
                  label="Instagram"
                  bg="rgba(225,48,108,0.12)"
                  border="rgba(225,48,108,0.28)"
                  shadow="0 0 18px rgba(225,48,108,0.18)"
                />
              </div>
              <p className="text-sm font-medium text-pink-400/90">{displayHandle}</p>
              <p className="text-xs text-white/70 mt-1 max-w-md">{profile.bio}</p>
              {profileLoading && (
                <p className="text-[11px] text-white/50 mt-2">Loading live Instagram data...</p>
              )}
              {profileError && (
                <p className="text-[11px] text-rose-300 mt-2">{profileError}</p>
              )}
            </div>
          </div>

          <a
            href={profile.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-pink-500/25 hover:scale-105"
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

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Sparkles size={13} />
              Featured Instagram Visuals
            </span>
            <span className="text-xs text-white/40 flex items-center gap-3">
              <span>Latest Grid</span>
              {profileReachValue !== null && profileSince && profileUntil && (
                <span className="text-xs text-white/50 flex items-center gap-3">
                  <span className="text-xs text-white/50">{`${profileSince.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${profileUntil.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} className="text-white/60" /> {formatCount(profileReachValue)}
                  </span>
                </span>
              )}
            </span>
          </div>

          {postsLoading ? (
            <div className="text-xs text-white/50">Loading latest posts...</div>
          ) : postsError ? (
            <div className="text-xs text-rose-300">{postsError}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredPosts.slice(0, 3).map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40"
                >
                  <Image
                    src={post.media_url}
                    alt={post.caption || "Instagram post"}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <div className="flex items-center gap-4 text-white font-bold text-sm">
                      <span className="flex items-center gap-1">
                        <Heart size={16} className="text-pink-500 fill-pink-500" />
                        {formatCount((post as any).like_count || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={16} className="text-white" />
                        {formatCount((post as any).comments_count || 0)}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 line-clamp-2">{post.caption || "Latest post"}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardContainer>
  );
};
