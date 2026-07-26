import { HeroCard } from "./HeroCard";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every 60 seconds on deployment

type CardState = {
  heroLocation?: string;
  heroEmail?: string;
  [key: string]: any;
};

export default async function HeroCardWrapper() {
  let heroLocation: string | undefined = undefined;
  let heroEmail: string | undefined = undefined;

  try {
    // Fetch from the API route (works on all platforms)
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/card-state`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      // Revalidate on next.js deployment
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = (await response.json()) as CardState;
      
      // Use values from Supabase (which become new defaults when bot edits them)
      // Pass them to client to ensure no flash on load
      heroLocation = data?.heroLocation || undefined;
      heroEmail = data?.heroEmail || undefined;
    }
  } catch (error) {
    console.warn("Failed to fetch card state in HeroCardWrapper:", error);
    // Fallback: let client-side fetch handle it
  }

  // Render the client HeroCard with initial values from API
  // The HeroCard is a client component and will also fetch on mount via useCardState hook
  return <HeroCard initialHeroLocation={heroLocation} initialHeroEmail={heroEmail} />;
}
