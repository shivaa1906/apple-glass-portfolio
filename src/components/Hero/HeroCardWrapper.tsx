import fs from "fs/promises";
import path from "path";
import { HeroCard } from "./HeroCard";

export const dynamic = "force-dynamic";

const STATE_PATH = path.join(process.cwd(), "bot", "card-state.json");

export default async function HeroCardWrapper() {
  let heroLocation: string | undefined = undefined;
  let heroEmail: string | undefined = undefined;
  try {
    const raw = await fs.readFile(STATE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    heroLocation = parsed?.heroLocation || undefined;
    heroEmail = parsed?.heroEmail || undefined;
  } catch (e) {
    // ignore
  }

  // Render the client HeroCard with initial location from persisted state
  // The HeroCard is a client component and will hydrate on the client.
  return <HeroCard initialHeroLocation={heroLocation} initialHeroEmail={heroEmail} />;
}
