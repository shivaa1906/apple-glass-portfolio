// File: app/api/github/route.ts
// Description: GitHub profile API route with repo and contribution data.

import { NextResponse } from "next/server";

// Core module export or function definition that implements this feature.
export const revalidate = 300;

// Type definition used to describe the structure of data in this component.
type GitHubUserResponse = {
  login: string;
  avatar_url: string;
  html_url: string;
  followers: number;
  public_repos: number;
};

// Type definition used to describe the structure of data in this component.
type GitHubRepoResponse = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

// Type definition used to describe the structure of data in this component.
type GitHubContributionDay = {
  contributionCount: number;
  date: string;
};

// Type definition used to describe the structure of data in this component.
type GitHubContributionWeek = {
  contributionDays: GitHubContributionDay[];
};

// Type definition used to describe the structure of data in this component.
type GitHubContributionCalendar = {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
};

const formatCompactCount = (value: number) => {
  if (!Number.isFinite(value)) return "0";

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat("en-US").format(value);
};

export async function GET() {
// Core module export or function definition that implements this feature.
  const configuredUsername = process.env.GITHUB_USERNAME;
// Core module export or function definition that implements this feature.
  const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN;

  try {
// Core module export or function definition that implements this feature.
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "apple-glass-portfolio",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    };

    let username = configuredUsername || "shivaa1906";

// Core module export or function definition that implements this feature.
    const userResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      next: { revalidate: 300 },
      headers,
    });

    if (!userResponse.ok) {
// Core module export or function definition that implements this feature.
      const errorBody = await userResponse.text();
      console.error("GitHub user API error:", errorBody);

      return NextResponse.json(
        { error: "Failed to fetch GitHub profile information." },
        { status: userResponse.status }
      );
    }

// Core module export or function definition that implements this feature.
    const userData: GitHubUserResponse = await userResponse.json();

    if (githubToken && userData.login) {
      username = userData.login;
    }

// Core module export or function definition that implements this feature.
    const reposResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      {
        next: { revalidate: 300 },
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "apple-glass-portfolio",
        },
      }
    );

    if (!reposResponse.ok) {
// Core module export or function definition that implements this feature.
      const errorBody = await reposResponse.text();
      console.error("GitHub repos API error:", errorBody);

      return NextResponse.json(
        { error: "Failed to fetch GitHub repositories." },
        { status: reposResponse.status }
      );
    }

// Core module export or function definition that implements this feature.
    const reposData: GitHubRepoResponse[] = await reposResponse.json();
    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
// Core module export or function definition that implements this feature.
    const sortedRepos = [...reposData]
      .sort((a, b) => b.stargazers_count - a.stargazers_count || Number(new Date(b.updated_at)) - Number(new Date(a.updated_at)))
      .slice(0, 12)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        url: repo.html_url,
        description: repo.description || "No description provided.",
        language: repo.language || "Code",
        stars: formatCompactCount(repo.stargazers_count),
        forks: formatCompactCount(repo.forks_count),
      }));

    let contributionCalendar: GitHubContributionCalendar = {
      totalContributions: 0,
      weeks: [],
    };

    if (githubToken) {
// Core module export or function definition that implements this feature.
      const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
// Core module export or function definition that implements this feature.
      const toDate = new Date().toISOString();

// Core module export or function definition that implements this feature.
      const graphqlResponse = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "apple-glass-portfolio",
          Authorization: `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
          query: `
            query($login: String!, $from: DateTime!, $to: DateTime!) {
              user(login: $login) {
                contributionsCollection(from: $from, to: $to) {
                  totalContributions
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        contributionCount
                        date
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            login: username,
            from: fromDate,
            to: toDate,
          },
        }),
      });

      if (graphqlResponse.ok) {
// Core module export or function definition that implements this feature.
        const graphqlData = await graphqlResponse.json();
// Core module export or function definition that implements this feature.
        const collection = graphqlData?.data?.user?.contributionsCollection;

        if (collection?.contributionCalendar) {
          contributionCalendar = {
            totalContributions: Number(collection.contributionCalendar.totalContributions || 0),
            weeks: (collection.contributionCalendar.weeks || []).map((week: GitHubContributionWeek) => ({
              contributionDays: (week.contributionDays || []).map((day: GitHubContributionDay) => ({
                contributionCount: Number(day.contributionCount || 0),
                date: day.date,
              })),
            })),
          };
        }
      } else {
// Core module export or function definition that implements this feature.
        const errorBody = await graphqlResponse.text();
        console.error("GitHub GraphQL API error:", errorBody);
      }
    }

    return NextResponse.json(
      {
        login: userData.login,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        followers: userData.followers,
        publicRepos: userData.public_repos,
        totalStars,
        repos: sortedRepos,
        contributionCalendar,
        contributionsCount: `${formatCompactCount(contributionCalendar.totalContributions)} contributions in the last year`,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (error) {
    console.error("GitHub profile route exception:", error);

    return NextResponse.json(
      {
        error: "Unable to load live GitHub profile right now.",
      },
      { status: 500 }
    );
  }
}
