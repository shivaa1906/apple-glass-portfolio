/**
 * Bot Supabase Utility
 * Helper functions for bot to interact with Supabase database
 * Stores and retrieves portfolio card state (hero location, email, social stats, etc.)
 */

import { createClient } from "@supabase/supabase-js";

export type CardState = {
  editableWebhookUrl?: string;
  botLogsEnabled?: boolean;
  discordInviteUrl?: string;
  discordSyncEnabled?: boolean;
  discordManualActivity?: string;
  twitterFollowers?: string;
  twitterFollowing?: string;
  twitterTweets?: string;
  facebookAnnouncementText?: string;
  facebookAnnouncementDate?: string;
  linkedinConnections?: string;
  linkedinFollowers?: string;
  linkedinRecommendations?: string;
  linkedinHeadline?: string;
  linkedinHeadlineBio?: string;
  heroLocation?: string;
  heroEmail?: string;
  heroStatus?: string;
  botLogChannelId?: string;
  adminUserIds?: string[];
  viewerCounterEnabled?: boolean;
};

// Initialize Supabase client (lazy - called after dotenv setup)
let supabaseClient: ReturnType<typeof createClient> | null = null;
let supabaseInitialized = false;

const initSupabase = () => {
  if (supabaseInitialized) return supabaseClient;
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseServiceKey) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    supabaseInitialized = true;
  }
  
  return supabaseClient;
};

export const getSupabase = () => initSupabase();

/**
 * Read card state from Supabase
 * @returns Complete card state object
 */
export async function readCardStateFromSupabase(): Promise<CardState | null> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await (supabase
      .from("portfolio_card_state" as any)
      .select("value")
      .eq("id", "main")
      .single() as any);

    if (error) {
      console.error("Error reading from Supabase:", error);
      return null;
    }

    const dataRow = data as Record<string, unknown> | null;
    if (!dataRow?.value) {
      return null;
    }

    // Handle both string and object value types
    const parsed = typeof dataRow.value === "string" ? JSON.parse(dataRow.value as string) : dataRow.value;
    return parsed as CardState;
  } catch (error) {
    console.error("Failed to read card state from Supabase:", error);
    return null;
  }
}

/**
 * Write card state to Supabase
 * @param state Partial card state to update/merge
 * @returns Success status
 */
export async function writeCardStateToSupabase(state: Partial<CardState>): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("Supabase not configured, skipping database write");
    return false;
  }

  try {
    // Read current state to merge
    const current = await readCardStateFromSupabase() || {};
    const merged = { ...current, ...state };

    const upsertData: any = { id: "main", value: merged };
    const { error } = await (supabase
      .from("portfolio_card_state" as any)
      .upsert(upsertData, { onConflict: "id" } as any) as any);

    if (error) {
      console.error("Error writing to Supabase:", error);
      return false;
    }

    console.log("✓ Card state updated in Supabase");
    return true;
  } catch (error) {
    console.error("Failed to write card state to Supabase:", error);
    return false;
  }
}

/**
 * Update a specific field in card state
 * More convenient than updating the entire state
 * 
 * @param field Field name to update
 * @param value New value for the field
 */
export async function updateCardStateField(
  field: keyof CardState,
  value: any
): Promise<boolean> {
  return writeCardStateToSupabase({ [field]: value } as Partial<CardState>);
}

/**
 * Get a specific field value from card state
 * @param field Field name to retrieve
 * @returns Field value or null if not found
 */
export async function getCardStateField(field: keyof CardState): Promise<any> {
  const state = await readCardStateFromSupabase();
  return state?.[field] ?? null;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!getSupabase();
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  try {
    const { data, error } = await supabase
      .from("portfolio_card_state")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }

    console.log("✓ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Supabase connection test error:", error);
    return false;
  }
}

// Export convenience functions for common updates
export const SupabaseCardState = {
  read: readCardStateFromSupabase,
  write: writeCardStateToSupabase,
  updateField: updateCardStateField,
  getField: getCardStateField,
  isConfigured: isSupabaseConfigured,
  testConnection: testSupabaseConnection,
};
