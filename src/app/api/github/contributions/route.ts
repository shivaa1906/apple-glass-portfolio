// File: app/api/github/contributions/route.ts
// Description: API route handler for the corresponding data endpoint.

import { NextResponse } from "next/server";

export const revalidate = 600;

type ContributionLevel = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";

type GitHubContributionDay = {
  contributionCount: number;
  date: string;
  contributionLevel: ContributionLevel;
};

type GitHubContributionWeek = {
  contributionDays: GitHubContributionDay[];
};

type GitHubContributionsCalendar = {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
};

type GitHubGraphQLContributionDay = {
  date?: string;
  contributionCount?: number;
  contributionLevel?: ContributionLevel;
};

type GitHubGraphQLContributionWeek = {
  contributionDays?: GitHubGraphQLContributionDay[];
};

type GitHubGraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: GitHubGraphQLContributionWeek[];
        };
      };
    };
  };
};

const defaultCalendar: GitHubContributionsCalendar = {
  totalContributions: 0,
  weeks: Array.from({ length: 53 }, () => ({ contributionDays: [] })),
};

const normalizeContributionLevel = (value?: string | number): ContributionLevel => {
  switch (value) {
    case 1:
    case "1":
      return "FIRST_QUARTILE";
    case 2:
    case "2":
      return "SECOND_QUARTILE";
    case 3:
    case "3":
      return "THIRD_QUARTILE";
    case 4:
    case "4":
      return "FOURTH_QUARTILE";
    default:
      return "NONE";
  }
};

async function fetchPublicContributionCalendar(username: string): Promise<GitHubContributionsCalendar | null> {
  const response = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const cells = Array.from(html.matchAll(/<td[^>]*data-date="([0-9-]+)"[^>]*data-level="([0-9]+)"[^>]*>/gi));

  if (cells.length === 0) {
    return null;
  }

  const totalSlots = 53 * 7;
  const days = cells.slice(0, totalSlots).map(([, date, level]) => ({
    date,
    contributionCount: 0,
    contributionLevel: normalizeContributionLevel(level),
  }));

  const weeks: GitHubContributionWeek[] = Array.from({ length: 53 }, (_, weekIndex) => {
    const contributionDays = Array.from({ length: 7 }, (_, dayIndex) => {
      const day = days[weekIndex * 7 + dayIndex];
      if (!day) {
        return {
          date: "",
          contributionCount: 0,
          contributionLevel: "NONE" as ContributionLevel,
        };
      }

      return day;
    });

    return { contributionDays };
  });

  return {
    totalContributions: days.reduce((sum, day) => sum + (day.contributionLevel === "NONE" ? 0 : 1), 0),
    weeks,
  };
}

export async function GET() {
  const githubUsername = process.env.GITHUB_USERNAME ?? "shivaa1906";
  const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN;

  const graphqlQuery = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    if (githubToken) {
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { login: githubUsername },
        }),
      });

      if (response.ok) {
        const json = (await response.json()) as GitHubGraphQLResponse;
        const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;

        if (calendar) {
          const weeks = (calendar.weeks || []).map((week) => ({
            contributionDays: (week.contributionDays || []).map((day) => ({
              date: day.date ?? "",
              contributionCount: Number(day.contributionCount ?? 0),
              contributionLevel: day.contributionLevel ?? "NONE",
            })),
          }));

          const result: GitHubContributionsCalendar = {
            totalContributions: Number(calendar.totalContributions ?? 0),
            weeks,
          };

          return NextResponse.json(result, {
            headers: {
              "Cache-Control": "public, max-age=600, s-maxage=600",
            },
          });
        }
      } else {
        const bodyText = await response.text();
        console.warn("GitHub GraphQL unavailable, falling back to public calendar scrape.", response.status, bodyText);
      }
    }

    const fallbackCalendar = await fetchPublicContributionCalendar(githubUsername);
    if (fallbackCalendar) {
      return NextResponse.json(fallbackCalendar, {
        headers: {
          "Cache-Control": "public, max-age=600, s-maxage=600",
        },
      });
    }

    return NextResponse.json(defaultCalendar, {
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  } catch (error) {
    console.error("GitHub contributions route error", error);
    return NextResponse.json(defaultCalendar, {
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  }
}
