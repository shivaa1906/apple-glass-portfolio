import { NextResponse } from "next/server";

export const revalidate = 300;

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

const formatTimeAgo = (isoString: string) => {
  const publishedAt = new Date(isoString).getTime();
  const diffMs = Date.now() - publishedAt;

  if (!Number.isFinite(publishedAt) || diffMs < 0) {
    return "Recently";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return diffHours <= 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
};

const formatDuration = (duration: string) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return "0:00";
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

type YouTubeVideoApiItem = {
  id: string;
  snippet?: {
    title?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
    publishedAt?: string;
  };
  statistics?: {
    viewCount?: string;
  };
  contentDetails?: {
    duration?: string;
  };
};

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return NextResponse.json(
      {
        error: "Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`;

    const channelResponse = await fetch(channelUrl, {
      next: { revalidate: 300 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!channelResponse.ok) {
      const errorBody = await channelResponse.text();
      console.error("YouTube channel API error:", errorBody);

      return NextResponse.json(
        { error: "Failed to fetch YouTube channel information." },
        { status: channelResponse.status }
      );
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];
    const statistics = channel?.statistics;
    const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;
    const profilePictureUrl = channel?.snippet?.thumbnails?.high?.url || channel?.snippet?.thumbnails?.medium?.url || channel?.snippet?.thumbnails?.default?.url || "";
    const channelTitle = channel?.snippet?.title || "";

    if (!statistics || !uploadsPlaylistId) {
      return NextResponse.json(
        { error: "YouTube channel data was not returned by the API." },
        { status: 404 }
      );
    }

    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=8&key=${encodeURIComponent(apiKey)}`,
      {
        next: { revalidate: 300 },
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!playlistResponse.ok) {
      const errorBody = await playlistResponse.text();
      console.error("YouTube playlist API error:", errorBody);

      return NextResponse.json(
        { error: "Failed to fetch YouTube playlist items." },
        { status: playlistResponse.status }
      );
    }

    const playlistData = await playlistResponse.json();
    const videoIds = (playlistData.items ?? [])
      .map((item: { snippet?: { resourceId?: { videoId?: string } } }) => item.snippet?.resourceId?.videoId)
      .filter(Boolean)
      .join(",");

    let videos: Array<{
      id: string;
      title: string;
      thumbnail: string;
      url: string;
      views: string;
      duration: string;
      timeAgo: string;
    }> = [];

    if (videoIds) {
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${encodeURIComponent(videoIds)}&key=${encodeURIComponent(apiKey)}`,
        {
          next: { revalidate: 300 },
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();

        videos = (videosData.items ?? []).map((item: YouTubeVideoApiItem) => ({
          id: item.id,
          title: item.snippet?.title || "Untitled YouTube video",
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
          url: `https://www.youtube.com/watch?v=${item.id}`,
          views: formatCompactCount(Number(item.statistics?.viewCount || 0)),
          duration: formatDuration(item.contentDetails?.duration || "PT0S"),
          timeAgo: formatTimeAgo(item.snippet?.publishedAt || new Date().toISOString()),
        }));
      }
    }

    return NextResponse.json(
      {
        channelTitle,
        profilePictureUrl,
        subscriberCount: Number(statistics.subscriberCount || 0),
        viewCount: Number(statistics.viewCount || 0),
        videoCount: Number(statistics.videoCount || 0),
        videos,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (error) {
    console.error("YouTube profile route exception:", error);

    return NextResponse.json(
      {
        error: "Unable to load live YouTube profile right now.",
      },
      { status: 500 }
    );
  }
}
