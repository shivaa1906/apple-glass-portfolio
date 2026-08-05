"use client";

// File: components/SocialCard/TwitterCard.tsx
// Description: Twitter social card showing follower counts and engagement.

import React, { useState } from "react";
import Image from "next/image";
import { SOCIAL_PROFILES } from "@/data/socialData";
import { CardContainer } from "./CardContainer";
import { Heart, Repeat2, MessageCircle, Bookmark, ExternalLink, Pin } from "lucide-react";
import { Eye } from "lucide-react";
import { TwitterIcon } from "@/components/Icons/SocialBrandIcons";
import { useCardState } from "@/lib/useCardState";
import PlatformBadge from "@/components/PlatformBadge/PlatformBadge";
import TwitterReach from "./TwitterReach";

export const TwitterCard: React.FC = () => {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "twitter")!;
// Core module export or function definition that implements this feature.
  const cardState = useCardState();
// Core module export or function definition that implements this feature.
  const tweetData = profile.details?.pinnedTweet as { likes?: number; retweets?: number; replies?: number; date?: string; text?: string } | undefined;

// Core module export or function definition that implements this feature.
  const [likes, setLikes] = useState(tweetData?.likes ?? 3420);
// Core module export or function definition that implements this feature.
  const [hasLiked, setHasLiked] = useState(false);
// Core module export or function definition that implements this feature.
  const [retweets, setRetweets] = useState(tweetData?.retweets ?? 890);
// Core module export or function definition that implements this feature.
  const [hasRetweeted, setHasRetweeted] = useState(false);

  const toggleLike = () => {
    if (hasLiked) {
      setLikes((prev: number) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev: number) => prev + 1);
      setHasLiked(true);
    }
  };

  const toggleRetweet = () => {
    if (hasRetweeted) {
      setRetweets((prev: number) => prev - 1);
      setHasRetweeted(false);
    } else {
      setRetweets((prev: number) => prev + 1);
      setHasRetweeted(true);
    }
  };

  return (
    <CardContainer id="twitter" accentGlow={profile.accentGlow}>
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-lg shadow-sky-500/20 flex-shrink-0 aspect-square">
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
                  icon={<TwitterIcon size={14} />}
                  label="Twitter"
                  bg="rgba(56,189,248,0.12)"
                  border="rgba(56,189,248,0.24)"
                  shadow="0 0 18px rgba(56,189,248,0.12)"
                />
              </div>
              <p className="text-sm font-medium text-sky-400">{profile.handle}</p>
              <p className="text-xs text-white/60 mt-1 max-w-lg">{profile.bio}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <a
              href={profile.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-sky-500/30 hover:scale-105"
            >
              <span>{profile.actionLabel}</span>
              <ExternalLink size={15} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <TwitterReach />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/10 text-center">
          {[
            { label: "Followers", value: cardState.twitterFollowers || profile.stats[0].value },
            { label: "Following", value: cardState.twitterFollowing || profile.stats[1].value },
            { label: "Tweets", value: cardState.twitterTweets || profile.stats[2].value },
          ].map((stat) => (
            <div key={stat.label} className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="flex items-center gap-1.5 font-semibold text-sky-400">
              <Pin size={13} className="rotate-45" />
              Pinned Thought
            </span>
            <span>{tweetData?.date}</span>
          </div>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
            {tweetData?.text}
          </p>

          <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-white/10">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                hasLiked ? "text-pink-500 font-bold" : "hover:text-pink-400"
              }`}
            >
              <Heart size={16} className={hasLiked ? "fill-pink-500" : ""} />
              <span>{likes.toLocaleString()}</span>
            </button>

            <button
              onClick={toggleRetweet}
              className={`flex items-center gap-1.5 transition-colors ${
                hasRetweeted ? "text-emerald-400 font-bold" : "hover:text-emerald-400"
              }`}
            >
              <Repeat2 size={16} />
              <span>{retweets.toLocaleString()}</span>
            </button>

            <span className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer">
              <MessageCircle size={16} />
              <span>{tweetData?.replies}</span>
            </span>

            <span className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer">
              <Bookmark size={16} />
              <span>Bookmark</span>
            </span>
          </div>
        </div>
      </div>
    </CardContainer>
  );
};
