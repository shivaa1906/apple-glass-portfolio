// File: data/socialData.ts
// Description: Static social profile and content data used throughout the site.

export interface SocialProfile {
  id: string;
  name: string;
  handle: string;
  platform: string;
  color: string;
  accentGlow: string;
  avatar: string;
  bio: string;
  stats: { label: string; value: string }[];
  actionLabel: string;
  actionUrl: string;
  badge?: string;
  details?: Record<string, any>;
}

// Core module export or function definition that implements this feature.
export const HERO_DATA = {
  name: "Shiva Gopi",
  title: "Principal Spatial UI Architect & Developer",
  shortBio: "Building cinematic glass interfaces, spatial computing experiences, and high-performance WebGL web applications.",
  location: "",
  email: "",
  status: "Available for Select Advisory & Keynotes",
  avatar: "/assets/profile_avatar1.jpg",
  resumeUrl: "#resume",
};

// Core module export or function definition that implements this feature.
export const SOCIAL_PROFILES: SocialProfile[] = [
  {
    id: "instagram",
    platform: "Instagram",
    name: "Shiva Gopi",
    handle: "",
    color: "#E1306C",
    accentGlow: "rgba(225, 48, 108, 0.4)",
    avatar: "",
    bio: "Visualizing spatial UI concepts, dark glass setups & next-gen creative code snippets 🎨✨",
    stats: [
      { label: "Posts", value: "0" },
      { label: "Followers", value: "0" },
      { label: "Following", value: "0" },
    ],
    actionLabel: "Visit Profile",
    actionUrl: "https://instagram.com/shivagopichowdary03",
    badge: "Creative Studio",
    details: {
      highlights: ["Vision OS", "Dark Workspaces", "Framer Physics", "GLSL Shaders"],
      posts: [],
    },
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    name: "Shiva Gopi",
    handle: "in/shivaa-gopi-b8b181424",
    color: "#0A66C2",
    accentGlow: "rgba(10, 102, 194, 0.4)",
    avatar: "/assets/profile_avatar1.jpg",
    bio: "Passionate about building modern web applications, interactive 3D experiences, and continuously learning React, Next.js, and Basic web applications.",
    stats: [
      { label: "Connections", value: "19" },
      { label: "Followers", value: "0" },
      { label: "Recommendations", value: "0" },
    ],
    actionLabel: "Connect on LinkedIn",
    actionUrl: "https://www.linkedin.com/in/shivaa-gopi-b8b181424",
    badge: "Top Voice in Design Engineering",
    details: {
      headline: "Frontend Developer | React & Next.js Developer | Spatial Computing Enthusiast",
      experiences: [
        {
          role: "Frontend Developer",
          company: "Personal Projects & Freelance Learning.",
          period: "2024 - Present",
          description: "Building responsive web applications with modern frontend technologies.",
        },
        {
          role: "Cybersecurity Enthusiast",
          company: "Independent Study",
          period: "2025 - Present",
          description: "Building a strong foundation in cybersecurity through hands-on practice.",
        },
      ],
      skills: ["Java", "Node.js", "TypeScript", "Web Development", "Discord Bots", "Tailwind CSS","Kali Linux","Windows Optimization Tools"],
    },
  },
  {
    id: "youtube",
    platform: "YouTube",
    name: "Shivaxroy Cybersecurity",
    handle: "@shivaxroycybersecurity",
    color: "#FF0000",
    accentGlow: "rgba(255, 0, 0, 0.4)",
    avatar: "/assets/profile_avatar1.jpg",
    bio: "Weekly deep dives into advanced web graphics, 120fps motion design, and building luxury user interfaces from scratch.",
    stats: [/*
      { label: "Subscribers", value: "45.2K" },
      { label: "Total Views", value: "1.8M" },
      { label: "Videos", value: "84" },
    */],
    actionLabel: "Subscribe on YouTube",
    actionUrl: "https://youtube.com/@shivaxroycybersecurity",
    badge: "Verified Creator",
    details: {
      videos: [
        {
          /*id: "v1",
          title: "VISION UI 2.0 - Building Apple Glass Interfaces in React 19",
          views: "142K views",
          duration: "18:42",
          timeAgo: "3 days ago",
          thumbnail: "/assets/youtube_thumb_1.jpg",*/
        },
        {
          /*id: "v2",
          title: "120FPS ANIMATION ENGINE - Physics & GSAP Masterclass",
          views: "210K views",
          duration: "24:15",
          timeAgo: "2 weeks ago",
          thumbnail: "/assets/youtube_thumb_2.jpg",*/
        },
      ],
    },
  },
  {
    id: "github",
    platform: "GitHub",
    name: "Shiva Gopi",
    handle: "@shivaa1906",
    color: "#F0F6FC",
    accentGlow: "rgba(240, 246, 252, 0.3)",
    avatar: "/assets/profile_avatar1.jpg",
    bio: "Open-source contributor & creator of modern glassmorphism animation engines, React spatial hooks, and GLSL shader primitives.",
    stats: [
      { label: "Stars", value: "0" },
      { label: "Followers", value: "0" },
      { label: "Repositories", value: "0" },
    ],
    actionLabel: "Visit GitHub Profile",
    actionUrl: "https://github.com/shivaa1906",
    badge: "Pro Contributor",
    details: {
      repos: [/*
        {
          name: "apple-glass-ui",
          description: "Production-ready Apple Vision OS glass components for React & Next.js",
          language: "TypeScript",
          stars: "6.8K",
          forks: "412",
        },
        {
          name: "spatial-motion-engine",
          description: "GPU-accelerated 120fps spring physics and scroll triggers for Next.js 15",
          language: "TypeScript",
          stars: "3.9K",
          forks: "280",
        },
        {
          name: "glsl-aurora-canvas",
          description: "High-performance procedural background canvas shaders",
          language: "GLSL",
          stars: "1.7K",
          forks: "145",
        },
      */],
      contributionsCount: "2,840 commits in the last year",
    },
  },
  {
    id: "facebook",
    platform: "Facebook",
    name: "Shiva Gopi",
    handle: "@shivaxroy",
    color: "#1877F2",
    accentGlow: "rgba(24, 119, 242, 0.4)",
    avatar: "/assets/profile_avatar1.jpg",
    bio: "Community page sharing software development tutorials, keynote highlights, tech hardware reviews, and industry insights.",
    stats: [
      { label: "Followers", value: "0" },
      { label: "Likes", value: "0" },
      { label: "Community", value: "0" },
    ],
    actionLabel: "Visit Facebook Page",
    actionUrl: "https://facebook.com",
    badge: "Official Page",
    details: {
      cover: "/assets/youtube_thumb_1.jpg",
      featuredPost: {
        text: "Just released our latest open-source Apple Glass UI kit for Next.js 15! Check out the live demo and let us know your feedback. 🚀✨",
        date: "July 18, 2026",
        likes: "1.2K",
        shares: "248",
      },
    },
  },
  {
    id: "discord",
    platform: "Discord",
    name: "Shiva gopi",
    handle: "root_roy",
    color: "#5865F2",
    accentGlow: "rgba(88, 101, 242, 0.4)",
    avatar: "/assets/profile_avatar1.jpg",
    bio: "",
    stats: [
      { label: "Status", value: "" },
      { label: "Servers", value: "" },
      { label: "Roles", value: "" },
    ],
    actionLabel: "Copy Discord Tag",
    actionUrl: "#copy",
    badge: "Developer Verified",
    details: {
      customStatus: "",
      servers: [""],
    },
  },
  {
    id: "twitter",
    platform: "Twitter (X)",
    name: "Shiva gopi",
    handle: "@Shivaxroy",
    color: "#1DA1F2",
    accentGlow: "rgba(29, 161, 242, 0.4)",
    avatar: "/assets/profile_avatar1.jpg",
    bio: "Thoughts on modern frontend engineering, immersive UI, WebGL, performance optimization, and minimalist design..",
    stats: [
      { label: "Followers", value: "0" },
      { label: "Following", value: "0" },
      { label: "Tweets", value: "0" },
    ],
    actionLabel: "Follow on X",
    actionUrl: "https://x.com",
    badge: "Verified Account",
    details: {
      pinnedTweet: {
        text: "Great products aren't built by adding more—they're built by removing everything users don't need.",
        likes: 3420,
        retweets: 890,
        replies: 142,
        date: "2h ago",
      },
    },
  },
];
