// File: app/layout.tsx
// Description: Application layout for HTML structure and global metadata.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/env";
import { NetworkStatus } from "@/components/NetworkStatus/NetworkStatus";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import "./globals.css";

// Core module export or function definition that implements this feature.
const inter = Inter({ subsets: ["latin"] });

// Core module export or function definition that implements this feature.
export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

// Core module export or function definition that implements this feature.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Shivaxroy — Social Portfolio",
  description:
    "An immersive, cinematic spatial portfolio website with floating glass cards, 3D tilt physics, 120fps scroll transitions, and live social showcases.",
  keywords: [
    "Apple Glass Portfolio",
    "Glassmorphism",
    "Spatial Computing UI",
    "Next.js 15",
    "React 19",
    "Framer Motion",
    "WebGL",
    "UI Architect",
  ],
  authors: [{ name: "Shivaxroy" }],
  openGraph: {
    title: "Shivaxroy — Social Portfolio",
    description:
      "Cinematic floating glass portfolio with synchronized scroll physics, 3D cursor tilt, and spatial UI card showcases.",
    url: getSiteUrl(),
    siteName: "Shivaxroy Spatial Portfolio",
    images: [
      {
        url: "/assets/profile_avatar.jpg",
        width: 1200,
        height: 630,
        alt: "Shivaxroy Spatial UI Architect",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivaxroy— Apple Glass Social Portfolio",
    description:
      "Cinematic floating glass portfolio with synchronized scroll physics, 3D cursor tilt, and spatial UI card showcases.",
    creator: "@shivaxroy",
    images: ["/assets/profile_avatar.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased scroll-smooth">
      <body className={`${inter.className} min-h-full bg-[#050505] text-white overflow-x-hidden`} suppressHydrationWarning>
        <LoadingScreen />
        <NetworkStatus />
        {children}
      </body>
    </html>
  );
}
