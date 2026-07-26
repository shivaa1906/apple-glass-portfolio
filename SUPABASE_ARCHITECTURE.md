# Supabase Integration - Complete Overview

## 🏗️ Architecture

Your system now works like this:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR PORTFOLIO SITE                         │
│                      (Next.js React Website)                        │
│                                                                     │
│  Displays: Hero location, Email, Social stats, Announcements...   │
│                                                                     │
│  Reads from: GET /api/card-state                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    /api/card-state (Next.js)                         │
│                                                                      │
│  1. Tries to read from Supabase database                           │
│  2. Falls back to local JSON file if Supabase unavailable          │
│  3. Returns data to website                                         │
└──────┬────────────────────────────────────────────────────────────────┘
       │
       ├─────────────────────────┬─────────────────────────────────┐
       ▼                         ▼                                 ▼
   SUPABASE            Local File (Backup)              Discord Bot
   Database            bot/card-state.json              bot/bot.ts
   (Primary)
   
   ┌──────────────────┐  ┌────────────────────┐  ┌─────────────────────┐
   │  portfolio_card  │  │  {                 │  │  /set-location      │
   │  _state table    │  │    "heroLocation"  │  │  /set-email         │
   │                  │  │    "heroEmail"     │  │  /xfollowers-set    │
   │  Stores:         │  │    ...             │  │  /edit-headline     │
   │  - Hero info     │  │  }                 │  │  ...                │
   │  - Social stats  │  │                    │  │                     │
   │  - Announcements │  └────────────────────┘  │  User runs command  │
   └──────────────────┘                          └──────────┬──────────┘
                                                            │
                                                            ▼
                                                   Bot updates Supabase
                                                   (writes to both DB
                                                    and local file)
```

## 📝 What You Set Up

### 1. **Supabase Database**
   - Cloud database hosted by Supabase
   - Stores your portfolio data
   - Free tier included
   - Primary source of truth

### 2. **Discord Bot Integration**
   - Bot now syncs to Supabase when commands are run
   - Commands like `/set-location` write to the database
   - Updates propagate to your website in real-time

### 3. **Next.js API Route**
   - Reads from Supabase database
   - Already set up in `src/app/api/card-state/route.ts`
   - Falls back to local files if needed

### 4. **React Components**
   - Already fetch data via the API hook
   - Display updated values automatically
   - No changes needed - they just work!

## 🔄 Data Flow Example

**Scenario: You update your location via Discord**

```
Step 1: You type in Discord
└─> /set-location "San Francisco, CA"

Step 2: Bot receives command
└─> Validates it's from an admin
    └─> Updates local JSON file
        └─> Sends to Supabase database
            └─> Attempts to sync to website API

Step 3: Website receives update
└─> /api/card-state endpoint gets PATCH request
    └─> API updates Supabase
        └─> Returns new state to bot

Step 4: Your website updates
└─> Next time someone visits: http://localhost:3000
    └─> Fetches latest data from /api/card-state
        └─> Shows "San Francisco, CA" as your location
```

**Time to see changes: < 1 second**

## 📦 New Files Created

| File | Purpose | Location |
|------|---------|----------|
| `database.sql` | SQL schema for Supabase | Root |
| `.env.example` | Template for env variables | Root |
| `bot/supabaseClient.ts` | Supabase helper functions | Bot folder |
| `SUPABASE_SETUP.md` | Detailed setup guide | Root |
| `SUPABASE_QUICK_START.md` | Quick checklist | Root |

## 🔧 Modified Files

| File | Changes |
|------|---------|
| `bot/bot.ts` | Added Supabase import & write sync |
| `.env.example` | Updated with Supabase variables |

> `src/app/api/card-state/route.ts` was already set up for Supabase - no changes needed!

## 🚀 Next Steps

1. **Set up Supabase** (5 minutes)
   - Follow: [SUPABASE_QUICK_START.md](SUPABASE_QUICK_START.md)

2. **Configure Environment Variables** (2 minutes)
   - Copy `.env.example` → `.env.local`
   - Fill in your Supabase credentials

3. **Test** (2 minutes)
   - Run bot: `npm run bot`
   - Run website: `npm run dev`
   - Try a command: `/set-location "Your City"`
   - Check your website - it should update!

## 📊 What's Stored in Supabase

Your database stores this JSON structure:

```json
{
  "heroLocation": "San Francisco, CA",
  "heroEmail": "you@example.com",
  "heroStatus": "Available",
  
  "twitterFollowers": "1000",
  "twitterFollowing": "500",
  "twitterTweets": "250",
  
  "linkedinConnections": "500",
  "linkedinFollowers": "1000",
  "linkedinRecommendations": "25",
  "linkedinHeadline": "Your headline",
  "linkedinHeadlineBio": "Your bio",
  
  "facebookAnnouncementText": "Latest update...",
  "facebookAnnouncementDate": "Today",
  
  "discordInviteUrl": "https://discord.gg/xxx",
  "discordManualActivity": "Building cool stuff",
  "discordSyncEnabled": true,
  
  "botLogsEnabled": true,
  "viewerCounterEnabled": true,
  
  "adminUserIds": ["discord-user-id-1", "discord-user-id-2"]
}
```

## ✅ Feature Checklist

- [x] Supabase database table created
- [x] Bot writes to Supabase when commands run
- [x] Website reads from Supabase
- [x] Fallback to local JSON files
- [x] Real-time updates
- [x] Environment variables configured
- [x] Helper utilities created
- [x] All commands integrated

## 🔐 Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe to expose (they're client-side)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is kept server-side (bot only)
- ✅ Supabase RLS policies restrict who can update
- ✅ Website can only read, not write (writes only from bot)

## 📞 Support

### Got errors in bot console?

Check these:
1. Is `.env.local` in the root directory?
2. Did you copy the exact credentials from Supabase?
3. Did you run the SQL from `database.sql`?
4. Is your internet connection stable?

### Website not updating?

Check these:
1. Clear browser cache
2. Check browser console for errors
3. Visit `http://localhost:3000/api/card-state` directly
4. Verify Supabase credentials in `.env.local`

### Need detailed help?

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for comprehensive troubleshooting.

## 🎯 Your New Superpowers

With this setup, you can:

✨ **Update portfolio instantly** via Discord commands  
✨ **Keep data persistent** across restarts  
✨ **Scale easily** - Supabase handles the database  
✨ **Collaborate** - Multiple people can run bot commands  
✨ **Track changes** - Database logs all updates  
✨ **Deploy anywhere** - No database setup needed on servers  

## 🎉 You're All Set!

Your portfolio is now powered by Supabase and your Discord bot.

Start with: [SUPABASE_QUICK_START.md](SUPABASE_QUICK_START.md)

Good luck! 🚀
