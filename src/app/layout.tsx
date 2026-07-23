import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://shivaxroy.dev"),
  title: "Shivaxroy — Premium Apple Glass Social Portfolio",
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
    title: "Shivaxroy— Apple Glass Social Portfolio",
    description:
      "Cinematic floating glass portfolio with synchronized scroll physics, 3D cursor tilt, and spatial UI card showcases.",
    url: "https://shivaxroy.dev",
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
        {children}
      </body>
    </html>
  );
}
