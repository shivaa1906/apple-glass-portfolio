# Supabase Integration Setup Guide

This guide will walk you through setting up Supabase to store and display bot-edited portfolio data.

## Overview

Your portfolio system now works like this:

```
Discord Bot (Commands) 
  ↓
Supabase Database ← → Your Portfolio Website
  ↓
Local Fallback (JSON files)
```

When you run bot commands like `/set-location` or `/set-email`, the values are:
1. Stored in Supabase database
2. Automatically synced to your portfolio website
3. Displayed live on your portfolio

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or sign in if you have an account
3. Create a new project:
   - **Name**: `apple-glass-portfolio` (or your preference)
   - **Password**: Save this securely
   - **Region**: Choose closest to your location
   - Click **"Create new project"**

4. Wait for the project to be provisioned (2-3 minutes)

---

## Step 2: Create the Database Table

Once your Supabase project is ready:

1. Go to the **SQL Editor** section
2. Click **"New Query"**
3. Paste this SQL:

```sql
-- Create the portfolio card state table
CREATE TABLE portfolio_card_state (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE portfolio_card_state ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Enable read access for all users" ON portfolio_card_state
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated updates via API secret
CREATE POLICY "Enable updates for authenticated users" ON portfolio_card_state
  FOR UPDATE
  USING (true);

-- Insert initial record
INSERT INTO portfolio_card_state (id, value) 
VALUES ('main', '{}') 
ON CONFLICT (id) DO NOTHING;
```

4. Click **"Run"** to execute
5. You should see a success message

---

## Step 3: Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values (keep them secret!):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (for backend)

---

## Step 4: Set Up Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Discord Bot
DISCORD_BOT_TOKEN=your-token
DISCORD_USER_ID=your-user-id
DISCORD_GUILD_ID=your-guild-id
DISCORD_DEFAULT_LOG_WEBHOOK_URL=your-webhook-url

# Frontend Sync (for bot to update frontend)
FRONTEND_URL=http://localhost:3000  # or your deployed URL
FRONTEND_UPDATE_SECRET=your-secret-key-here
```

---

## Step 5: How It Works

### Bot Command Flow:

1. **You run a command** in Discord:
   ```
   /set-location "San Francisco, CA"
   ```

2. **Bot updates Supabase**:
   - Writes to local file
   - Updates `portfolio_card_state` table in Supabase
   - Syncs to your website API

3. **Website reads the data**:
   - Frontend calls `/api/card-state` (GET)
   - API reads from Supabase (with file fallback)
   - Component displays the new location

4. **Real-time updates**:
   - Portfolio shows the new value immediately
   - If Supabase is down, uses local JSON files as backup

### Example: Editing Hero Location

**Before:**
```
Hero Location: KPHB, Hyderabad
```

**Command:**
```
/set-location "San Francisco, CA"
```

**After (immediate):**
```
Hero Location: San Francisco, CA
```

The location is now stored in Supabase and will persist even if you restart your bot or deploy to a new server.

---

## Step 6: Available Bot Commands

All these commands now update Supabase:

```
/set-location <text>              → Hero profile location
/set-email <email>                → Hero profile email  
/set-current-activity <text>      → Discord activity
/xfollowers-set <count>           → Twitter followers
/xfollowing-set <count>           → Twitter following
/xtweets-set <count>              → Twitter tweets count
/set-community-announcement <text> <date> → Facebook announcement
/set-connections <count>          → LinkedIn connections
/set-followers <count>            → LinkedIn followers
/set-recommendations <count>      → LinkedIn recommendations
/edit-headline <text>             → LinkedIn headline
/edit-headline-bio <text>         → LinkedIn bio
/change-server-link <link>        → Discord invite link
/edit-webhook <url>               → Custom webhook URL
```

---

## Step 7: Test the Integration

1. **Start your bot**:
   ```bash
   npm run bot
   ```

2. **Start your website**:
   ```bash
   npm run dev
   ```

3. **Run a test command** in Discord:
   ```
   /set-location "Your New Location"
   ```

4. **Check Supabase**:
   - Go to **Table Editor** → `portfolio_card_state`
   - Click the `main` row
   - You should see the updated `value` JSON

5. **Check your website**:
   - Visit `http://localhost:3000`
   - You should see the new location displayed
   - Check browser console for any errors

---

## Step 8: Deployment

### For Vercel/Next.js Deployment:

1. Add environment variables to your deployment platform:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. For the bot (on a separate server):
   - Add the same variables
   - Also add `FRONTEND_URL=your-deployed-site.com`

### For Bot Hosting:

- Use Railway, Replit, or AWS Lambda
- Set all the environment variables from Step 4
- Your bot will now update the live website

---

## Troubleshooting

### "SUPABASE_URL is not set"
- Check your `.env.local` file
- Make sure it's in the project root, not in `src/`
- Restart your dev server after adding env vars

### Bot commands not updating the website
- Check that `FRONTEND_URL` is set correctly
- Make sure the website is running on that URL
- Check browser console and bot logs for errors

### Website not showing updates
- Clear browser cache (Ctrl+Shift+Delete)
- Check `/api/card-state` endpoint directly
- Verify Supabase credentials are correct

### Still using JSON files instead of Supabase
- This is normal! System falls back to files if:
  - Supabase credentials not provided
  - Supabase down/unreachable
  - Network error occurs
- To force Supabase usage, remove `.env` fallback option

---

## File Structure

Your system uses these files:

| File | Purpose |
|------|---------|
| `src/app/api/card-state/route.ts` | API that reads/writes to Supabase or file |
| `bot/bot.ts` | Discord bot that updates state |
| `bot/card-state.json` | Local backup of card state |
| `src/lib/useCardState.ts` | React hook to fetch card state |
| `.env.local` | Your Supabase credentials |

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Create database table
3. ✅ Set environment variables
4. ✅ Test with bot commands
5. 🔄 Deploy your bot and website
6. 🎉 Your portfolio now updates in real-time!

---

## Support

If you encounter issues:
1. Check Supabase logs: Settings → Database → Logs
2. Check Next.js server logs in terminal
3. Check Discord bot console output
4. Verify all environment variables are set correctly

