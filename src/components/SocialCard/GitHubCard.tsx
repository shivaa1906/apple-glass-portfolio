"use client";

// File: components/SocialCard/GitHubCard.tsx
// Description: GitHub social card component displaying contribution and repo stats.

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { SOCIAL_PROFILES } from "@/data/socialData";
import { CardContainer } from "./CardContainer";
import { Star, GitFork, Code2, ExternalLink, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { GitHubIcon } from "@/components/Icons/SocialBrandIcons";

// Type definition used to describe the structure of data in this component.
type ContributionLevel = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";

// Type definition used to describe the structure of data in this component.
type GitHubContributionDay = {
  contributionCount: number;
  date: string;
  contributionLevel: ContributionLevel;
};

// Type definition used to describe the structure of data in this component.
type GitHubContributionWeek = {
  contributionDays: GitHubContributionDay[];
};

// Type definition used to describe the structure of data in this component.
type GitHubContributionsCalendar = {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
};

// Type definition used to describe the structure of data in this component.
type GitHubProfileResponse = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  followers: number;
  publicRepos: number;
  totalStars: number;
  contributionsCount: string;
  repos: GitHubRepo[];
};

// Type definition used to describe the structure of data in this component.
type GitHubRepo = {
  id: number;
  name: string;
  url: string;
  description: string;
  language: string;
  stars: string;
  forks: string;
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

const formatCalendarDate = (value: string) => {
  if (!value) return "unknown date";

// Core module export or function definition that implements this feature.
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
};

const formatCalendarTooltip = (value: string, count: number) => {
  if (!value) return "Unknown date";

// Core module export or function definition that implements this feature.
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
// Core module export or function definition that implements this feature.
    const suffix = count === 1 ? "contribution" : "contributions";
    return `${count === 0 ? "No contributions" : `${count} ${suffix}`} on ${value}`;
  }

// Core module export or function definition that implements this feature.
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(parsed);
// Core module export or function definition that implements this feature.
  const formattedDate = formatCalendarDate(value);
  if (count === 0) {
    return `No contributions on ${weekday}, ${formattedDate}`;
  }

  return `${count === 1 ? "1 contribution" : `${count} contributions`} on ${weekday}, ${formattedDate}`;
};

const contributionLevelToColor = (level: ContributionLevel) => {
  switch (level) {
    case "FIRST_QUARTILE":
      return "bg-emerald-900/60";
    case "SECOND_QUARTILE":
      return "bg-emerald-700/80";
    case "THIRD_QUARTILE":
      return "bg-emerald-500";
    case "FOURTH_QUARTILE":
      return "bg-emerald-400";
    default:
      return "bg-white/5";
  }
};

// Core module export or function definition that implements this feature.
const areContributionCalendarsEqual = (
  a: GitHubContributionsCalendar,
  b: GitHubContributionsCalendar
) => {
  if (a.totalContributions !== b.totalContributions) {
    return false;
  }

  if (a.weeks.length !== b.weeks.length) {
    return false;
  }

  return a.weeks.every((week, weekIndex) => {
// Core module export or function definition that implements this feature.
    const otherWeek = b.weeks[weekIndex];
    if (!otherWeek || week.contributionDays.length !== otherWeek.contributionDays.length) {
      return false;
    }

    return week.contributionDays.every((day, dayIndex) => {
// Core module export or function definition that implements this feature.
      const otherDay = otherWeek.contributionDays[dayIndex];
      return (
        otherDay &&
        day.date === otherDay.date &&
        day.contributionCount === otherDay.contributionCount &&
        day.contributionLevel === otherDay.contributionLevel
      );
    });
  });
};

export const GitHubCard: React.FC = () => {
  const profile = SOCIAL_PROFILES.find((p) => p.id === "github")!;
// Core module export or function definition that implements this feature.
  const [githubData, setGithubData] = useState<GitHubProfileResponse | null>(null);
// Core module export or function definition that implements this feature.
  const [statsLoading, setStatsLoading] = useState(true);
// Core module export or function definition that implements this feature.
  const [statsError, setStatsError] = useState<string | null>(null);
// Core module export or function definition that implements this feature.
  const [contributionCalendar, setContributionCalendar] = useState<GitHubContributionsCalendar | null>(null);
// Core module export or function definition that implements this feature.
  const contributionCacheRef = useRef<GitHubContributionsCalendar | null>(null);
// Core module export or function definition that implements this feature.
  const [currentPage, setCurrentPage] = useState(0);
// Core module export or function definition that implements this feature.
  const [dragStartX, setDragStartX] = useState<number | null>(null);
// Core module export or function definition that implements this feature.
  const repoSliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncGitHubData = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

// Core module export or function definition that implements this feature.
        const response = await fetch("/api/github", {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (!response.ok) {
          throw new Error("Unable to load live GitHub profile information.");
        }

// Core module export or function definition that implements this feature.
        const data: GitHubProfileResponse = await response.json();
        setGithubData(data);
        setCurrentPage(0);
      } catch (error) {
// Core module export or function definition that implements this feature.
        const message = error instanceof Error ? error.message : "Something went wrong while loading GitHub data.";
        setStatsError(message);
      } finally {
        setStatsLoading(false);
      }
    };

    void syncGitHubData();
    const intervalId = window.setInterval(() => {
      void syncGitHubData();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const syncContributionCalendar = async () => {
      try {
// Core module export or function definition that implements this feature.
        const response = await fetch("/api/github/contributions", {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!response.ok) {
          throw new Error("Unable to load GitHub contributions.");
        }

// Core module export or function definition that implements this feature.
        const data: GitHubContributionsCalendar = await response.json();
        if (!contributionCacheRef.current || !areContributionCalendarsEqual(contributionCacheRef.current, data)) {
          setContributionCalendar(data);
          contributionCacheRef.current = data;
        }
      } catch (error) {
// Core module export or function definition that implements this feature.
        const message = error instanceof Error ? error.message : "Unable to load GitHub contributions.";
        console.error(message);
        setContributionCalendar((current) => current ?? { totalContributions: 0, weeks: [] });
      }
    };

    void syncContributionCalendar();
    const contributionInterval = window.setInterval(() => {
      void syncContributionCalendar();
    }, 600000);

    return () => window.clearInterval(contributionInterval);
  }, []);

  const contributionDays = useMemo(() => {
// Core module export or function definition that implements this feature.
    const weeks = contributionCalendar?.weeks ?? [];

    const createEmptyDay = (index: number) => {
// Core module export or function definition that implements this feature.
      const date = new Date();
      date.setDate(date.getDate() - (364 - index));

      return {
        id: `empty-${index}`,
        colorClass: contributionLevelToColor("NONE"),
        contributionCount: 0,
        date: date.toISOString().split("T")[0],
      };
    };

    const hasContributionDays = weeks.some((week) => week.contributionDays.length > 0);
    if (!hasContributionDays) {
      return Array.from({ length: 53 * 7 }, (_, index) => createEmptyDay(index));
    }

    return weeks.flatMap((week, weekIndex) =>
      week.contributionDays.map((day, dayIndex) => ({
        id: day.date || `${weekIndex}-${dayIndex}`,
        colorClass: contributionLevelToColor(day.contributionLevel),
        contributionCount: day.contributionCount,
        date: day.date,
      }))
    );
  }, [contributionCalendar]);

  const monthLabelPositions = useMemo(() => {
// Core module export or function definition that implements this feature.
    const weeks = contributionCalendar?.weeks ?? [];
// Core module export or function definition that implements this feature.
    const monthLabels: Array<{ label: string; index: number }> = [];

    let lastMonth = -1;
    weeks.forEach((week, index) => {
// Core module export or function definition that implements this feature.
      const firstDay = week.contributionDays[0];
      if (!firstDay || !firstDay.date) {
        return;
      }

// Core module export or function definition that implements this feature.
      const parsed = new Date(firstDay.date);
// Core module export or function definition that implements this feature.
      const month = parsed.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(parsed),
          index,
        });
        lastMonth = month;
      }
    });

    return monthLabels;
  }, [contributionCalendar]);

  const stats = useMemo(() => {
    const fallbackStats = profile.stats.map((stat) => stat.value);

    return [
      {
        label: "Stars",
        value: githubData ? formatCount(githubData.totalStars) : fallbackStats[0],
      },
      {
        label: "Followers",
        value: githubData ? formatCount(githubData.followers) : fallbackStats[1],
      },
      {
        label: "Repositories",
        value: githubData ? formatCount(githubData.publicRepos) : fallbackStats[2],
      },
    ];
  }, [githubData, profile.stats]);

// Core module export or function definition that implements this feature.
  const displayRepos = githubData?.repos ?? [];
// Core module export or function definition that implements this feature.
  const visibleRepos = displayRepos.slice(currentPage * 3, currentPage * 3 + 3);
// Core module export or function definition that implements this feature.
  const totalPages = Math.max(1, Math.ceil(displayRepos.length / 3));

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
    <CardContainer id="github" accentGlow={profile.accentGlow}>
      <div className="flex flex-col h-full justify-between space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-gray-400 via-gray-200 to-white shadow-lg shadow-white/10 flex-shrink-0 aspect-square">
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
                <span className="p-1.5 rounded-full bg-white/10 text-white border border-white/20">
                  <GitHubIcon size={16} />
                </span>
              </div>
              <p className="text-sm font-medium text-gray-300">{profile.handle}</p>
              <p className="text-xs text-white/60 mt-1 max-w-lg">{profile.bio}</p>
              {statsLoading && <p className="text-[11px] text-white/50 mt-2">Syncing live GitHub metrics...</p>}
              {statsError && <p className="text-[11px] text-rose-300 mt-2">{statsError}</p>}
            </div>
          </div>

          <a
            href={profile.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-white/5 hover:scale-105"
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

        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-white/70 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Sparkles size={13} />
              {contributionCalendar
                ? `${contributionCalendar.totalContributions.toLocaleString()} contributions in the last year`
                : githubData?.contributionsCount || profile.details?.contributionsCount}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-white/40">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-white/5" />
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-900/60" />
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700/80" />
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="space-y-2">
              <div className="pl-10 relative min-w-[640px] h-4">
                {monthLabelPositions.map((month) => (
                  <span
                    key={`${month.label}-${month.index}`}
                    className="absolute text-[10px] text-white/40 font-semibold whitespace-nowrap"
                    style={{ left: `${month.index * 16}px`, top: 0 }}
                  >
                    {month.label}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col gap-1 text-[10px] text-white/40 font-semibold justify-center">
                  <div style={{ height: "12px" }}>Mon</div>
                  <div style={{ height: "12px" }} />
                  <div style={{ height: "12px" }}>Wed</div>
                  <div style={{ height: "12px" }} />
                  <div style={{ height: "12px" }}>Fri</div>
                  <div style={{ height: "12px" }} />
                  <div style={{ height: "12px" }} />
                </div>

                <div className="grid grid-flow-col grid-rows-7 gap-1 auto-cols-max">
                  {contributionDays.map((day) => (
                    <div
                      key={day.id}
                      className={`w-3 h-3 rounded-[2px] ${day.colorClass} transition-all duration-200 hover:scale-150 hover:shadow-lg hover:shadow-emerald-500/50 cursor-pointer hover:z-20 relative`}
                      title={`${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"} on ${formatCalendarDate(day.date)}`}
                      suppressHydrationWarning
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={repoSliderRef}
          onMouseDown={(event) => handleSwipeStart(event.clientX)}
          onMouseUp={(event) => handleSwipeEnd(event.clientX)}
          onMouseLeave={() => setDragStartX(null)}
          className="relative"
        >
          {displayRepos.length === 0 ? (
            <div className="text-xs text-white/50">No public repositories to display for this account.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {visibleRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/[0.06] transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Code2 size={14} className="text-emerald-400" />
                      {repo.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      {repo.language}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{repo.description}</p>
                  <div className="flex items-center gap-3 text-xs text-white/50 pt-1">
                    <span className="flex items-center gap-1">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={13} />
                      {repo.forks}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {displayRepos.length > 3 && (
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Show previous repositories"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          {displayRepos.length > 3 && (
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleNext}
                disabled={currentPage === totalPages - 1}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Show more repositories"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </CardContainer>
  );
};
