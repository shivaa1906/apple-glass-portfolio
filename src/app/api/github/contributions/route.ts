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

const defaultCalendar: GitHubContributionsCalendar = {
  totalContributions: 0,
  weeks: Array.from({ length: 53 }, () => ({ contributionDays: [] })),
};

export async function GET() {
  const githubUsername = process.env.GITHUB_USERNAME;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubUsername || !githubToken) {
    return NextResponse.json(
      { error: "GITHUB_USERNAME and GITHUB_TOKEN must be configured." },
      { status: 500 }
    );
  }

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
      const bodyText = await response.text();
      console.error("GitHub GraphQL error", response.status, bodyText);
      return NextResponse.json(
        { error: "Failed to fetch GitHub contributions." },
        { status: response.status }
      );
    }

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

    const json = (await response.json()) as GitHubGraphQLResponse;
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
    return NextResponse.json(
      { error: "Unable to load GitHub contributions." },
      { status: 500 }
    );
  }
}
