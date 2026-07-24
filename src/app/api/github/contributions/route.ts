// File: app/api/github/contributions/route.ts
// Description: API route handler for the corresponding data endpoint.

import { NextResponse } from "next/server";

// Core module export or function definition that implements this feature.
export const revalidate = 600;

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

// Core module export or function definition that implements this feature.
const defaultCalendar: GitHubContributionsCalendar = {
  totalContributions: 0,
  weeks: Array.from({ length: 53 }, () => ({ contributionDays: [] })),
};

export async function GET() {
// Core module export or function definition that implements this feature.
  const githubUsername = process.env.GITHUB_USERNAME ?? "shivaa1906";
// Core module export or function definition that implements this feature.
  const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN;

  if (!githubToken) {
    console.warn("GitHub contributions route: no token configured, returning empty calendar fallback.");
    return NextResponse.json(defaultCalendar, {
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  }

// Core module export or function definition that implements this feature.
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
// Core module export or function definition that implements this feature.
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

    if (!response.ok) {
// Core module export or function definition that implements this feature.
      const bodyText = await response.text();
      console.error("GitHub GraphQL error", response.status, bodyText);
      return NextResponse.json(defaultCalendar, {
        headers: {
          "Cache-Control": "public, max-age=600, s-maxage=600",
        },
      });
    }

// Type definition used to describe the structure of data in this component.
    type GitHubGraphQLContributionDay = {
      date?: string;
      contributionCount?: number;
      contributionLevel?: ContributionLevel;
    };

// Type definition used to describe the structure of data in this component.
    type GitHubGraphQLContributionWeek = {
      contributionDays?: GitHubGraphQLContributionDay[];
    };

// Type definition used to describe the structure of data in this component.
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

// Core module export or function definition that implements this feature.
    const json = (await response.json()) as GitHubGraphQLResponse;
// Core module export or function definition that implements this feature.
    const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      return NextResponse.json(defaultCalendar, {
        headers: {
          "Cache-Control": "public, max-age=600, s-maxage=600",
        },
      });
    }

    const weeks = (calendar.weeks || []).map((week) => ({
      contributionDays: (week.contributionDays || []).map((day) => ({
        date: day.date ?? "",
        contributionCount: Number(day.contributionCount ?? 0),
        contributionLevel: day.contributionLevel ?? "NONE",
      })),
    }));

// Core module export or function definition that implements this feature.
    const result: GitHubContributionsCalendar = {
      totalContributions: Number(calendar.totalContributions ?? 0),
      weeks,
    };

    return NextResponse.json(result, {
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
