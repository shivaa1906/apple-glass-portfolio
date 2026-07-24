"use client";

// File: components/SocialCard/YouTubeCard.tsx
// Description: YouTube social card rendering latest channel metrics.

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { SOCIAL_PROFILES } from "@/data/socialData";
import { CardContainer } from "./CardContainer";
import { Play, Eye, Clock, ExternalLink, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { YouTubeIcon } from "@/components/Icons/SocialBrandIcons";

// Type definition used to describe the structure of data in this component.
type YouTubeStatsResponse = {
  channelTitle: string;
  profilePictureUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  videos: YouTubeVideo[];
};

// Type definition used to describe the structure of data in this component.
type YouTubeVideo = {
  id: string;
  title: string;
  views: string;
  duration: string;
  timeAgo: string;
  thumbnail: string;
  url: string;
};

const formatCount = (value: number) => {
  if (!Number.isFinite(value)) return "—";

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat("en-US").format(value);
};

export const YouTubeCard: React.FC = () => {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "youtube")!;
// Core module export or function definition that implements this feature.
  const [youtubeData, setYoutubeData] = useState<YouTubeStatsResponse | null>(null);
// Core module export or function definition that implements this feature.
  const [statsLoading, setStatsLoading] = useState(true);
// Core module export or function definition that implements this feature.
  const [statsError, setStatsError] = useState<string | null>(null);
// Core module export or function definition that implements this feature.
  const [currentPage, setCurrentPage] = useState(0);
// Core module export or function definition that implements this feature.
  const [dragStartX, setDragStartX] = useState<number | null>(null);
// Core module export or function definition that implements this feature.
  const cardSliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncYoutubeData = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

// Core module export or function definition that implements this feature.
        const response = await fetch("/api/youtube", {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (!response.ok) {
          throw new Error("Unable to load live YouTube profile information.");
        }

// Core module export or function definition that implements this feature.
        const data: YouTubeStatsResponse = await response.json();
        setYoutubeData(data);
        setCurrentPage(0);
      } catch (error) {
// Core module export or function definition that implements this feature.
        const message = error instanceof Error ? error.message : "Something went wrong while loading YouTube data.";
        setStatsError(message);
      } finally {
        setStatsLoading(false);
      }
    };

    void syncYoutubeData();
    const intervalId = window.setInterval(() => {
      void syncYoutubeData();
    }, 300000);

    return () => window.clearInterval(intervalId);
  }, []);

  const isValidVideo = (video: Partial<YouTubeVideo>): video is YouTubeVideo =>
    Boolean(
      video?.id &&
      typeof video.id === "string" &&
      video.id.trim() &&
      typeof video?.thumbnail === "string" &&
      video.thumbnail.trim() &&
      typeof video?.title === "string" &&
      video.title.trim() &&
      typeof video?.url === "string" &&
      video.url.trim()
    );

// Core module export or function definition that implements this feature.
  const fallbackVideos = ((profile.details?.videos as Partial<YouTubeVideo>[] | undefined) ?? []).filter(isValidVideo);
// Core module export or function definition that implements this feature.
  const apiVideos = (youtubeData?.videos ?? []).filter(isValidVideo);
// Core module export or function definition that implements this feature.
  const allVideos = apiVideos.length ? apiVideos : fallbackVideos;
// Core module export or function definition that implements this feature.
  const totalPages = Math.max(1, Math.ceil(allVideos.length / 2));
// Core module export or function definition that implements this feature.
  const visibleVideos = allVideos.slice(currentPage * 2, currentPage * 2 + 2);
// Core module export or function definition that implements this feature.
  const displayAvatar = youtubeData?.profilePictureUrl || profile.avatar || "/assets/profile_avatar1.jpg";
// Core module export or function definition that implements this feature.
  const displayName = youtubeData?.channelTitle || profile.name;

  const stats = useMemo(() => {
    const fallbackStats = profile.stats.map((stat) => stat.value);

    return [
      {
        label: "Subscribers",
        value: youtubeData ? formatCount(youtubeData.subscriberCount) : fallbackStats[0],
      },
      {
        label: "Total Views",
        value: youtubeData ? formatCount(youtubeData.viewCount) : fallbackStats[1],
      },
      {
        label: "Videos",
        value: youtubeData ? formatCount(youtubeData.videoCount) : fallbackStats[2],
      },
    ];
  }, [profile.stats, youtubeData]);

  const handlePrev = () => setCurrentPage((page) => Math.max(page - 1, 0));
  const handleNext = () => setCurrentPage((page) => Math.min(page + 1, totalPages - 1));

  const handleSwipeStart = (clientX: number) => {
    setDragStartX(clientX);
  };

  const handleSwipeEnd = (clientX: number) => {
    if (dragStartX === null) {
      return;
    }

// Core module export or function definition that implements this feature.
    const delta = clientX - dragStartX;
    if (delta > 40) {
      handlePrev();
    } else if (delta < -40) {
      handleNext();
    }

    setDragStartX(null);
  };

  return (
    <CardContainer id="youtube" accentGlow={profile.accentGlow}>
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-lg shadow-red-500/20 flex-shrink-0 aspect-square">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black flex-shrink-0 aspect-square">
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  fill
                  sizes="80px"
                  className="object-cover rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{displayName}</h3>
                <span className="p-1.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
                  <YouTubeIcon size={16} />
                </span>
              </div>
              <p className="text-sm font-medium text-red-400">{profile.handle}</p>
              <p className="text-xs text-white/60 mt-1 max-w-lg">{profile.bio}</p>
              {statsLoading && <p className="text-[11px] text-white/50 mt-2">Syncing live subscriber count...</p>}
              {statsError && <p className="text-[11px] text-rose-300 mt-2">{statsError}</p>}
            </div>
          </div>

          <a
            href={profile.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-red-600/30 hover:scale-105"
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
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Sparkles size={13} />
              Featured Masterclasses & Tech Demos
            </span>
            <span className="text-xs text-white/40">Latest Videos</span>
          </div>

          <div
            ref={cardSliderRef}
            onMouseDown={(event) => handleSwipeStart(event.clientX)}
            onMouseUp={(event) => handleSwipeEnd(event.clientX)}
            onMouseLeave={() => setDragStartX(null)}
            className="relative"
          >
            {visibleVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {visibleVideos.map((vid, idx) => (
                  <a
                    key={vid.id || `video-${idx}`}
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                      <Image
                        src={vid.thumbnail}
                        alt={vid.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        loading={idx === 0 ? "eager" : "lazy"}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1">
                        <Clock size={11} />
                        {vid.duration}
                      </div>
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={20} className="fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                        {vid.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Eye size={13} />
                          {vid.views}
                        </span>
                        <span>{vid.timeAgo}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-xs text-white/50">No video previews available.</div>
            )}

            {allVideos.length > 2 && (
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentPage === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Show previous videos"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}

            {allVideos.length > 2 && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentPage === totalPages - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Show more videos"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CardContainer>
  );
};
