# Supabase Integration - Quick Start Checklist

This document provides a quick checklist to get Supabase working with your portfolio and Discord bot.

## What This Does

✅ Bot commands update Supabase database  
✅ Portfolio website displays live updates  
✅ Changes persist across bot restarts  
✅ Automatic fallback to local files if Supabase is down  

**Example flow:**
```
You type: /set-location "New York"
        ↓
Bot stores in Supabase
        ↓
Your portfolio website shows "New York" immediately
```

---

## 📋 Quick Checklist

### 1. Create Supabase Account & Project
- [ ] Go to https://supabase.com
- [ ] Sign up or log in
- [ ] Click "Start your project"
- [ ] Create new project (save the password!)
- [ ] Wait 2-3 minutes for setup

### 2. Create Database Table
- [ ] Open your Supabase project
- [ ] Go to **SQL Editor** 
- [ ] Click **New Query**
- [ ] Copy the entire SQL from `database.sql` file
- [ ] Paste into SQL editor
- [ ] Click **Run**
- [ ] You should see green success message ✓

### 3. Get Your Credentials
From Supabase project:
- [ ] Go to **Settings** → **API**
- [ ] Copy **Project URL** 
- [ ] Copy **anon key** (the public one)
- [ ] Copy **service_role key** (keep this secret!)

### 4. Create `.env.local` File
In your project root directory, create `.env.local`:

```bash
# Copy this into .env.local and fill with your values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

DISCORD_BOT_TOKEN=your-bot-token
DISCORD_USER_ID=your-user-id
DISCORD_GUILD_ID=your-guild-id

FRONTEND_URL=http://localhost:3000
FRONTEND_UPDATE_SECRET=any-random-secret-here
```

> ⚠️ **Never commit `.env.local` to git!** It contains secrets.

### 5. Restart Everything
- [ ] Stop your bot (Ctrl+C)
- [ ] Stop your website (Ctrl+C)
- [ ] Start bot: `npm run bot`
- [ ] Start website: `npm run dev`
- [ ] Watch for this message in bot console: `✓ Supabase database connected successfully`

### 6. Test It
- [ ] Open Discord
- [ ] Run this command: `/set-location "Test City"`
- [ ] Visit your website at `http://localhost:3000`
- [ ] You should see "Test City" displayed
- [ ] Check Supabase: **Table Editor** → `portfolio_card_state` → you should see the new data

---

## 🎮 Available Bot Commands

All these now update your live website:

| Command | What It Does | Example |
|---------|-------------|---------|
| `/set-location` | Change hero location | San Francisco, CA |
| `/set-email` | Change hero email | your@email.com |
| `/set-current-activity` | Discord activity | Building next-gen web |
| `/xfollowers-set` | Twitter followers | 1000 |
| `/xfollowing-set` | Twitter following | 500 |
| `/xtweets-set` | Twitter tweets | 250 |
| `/set-community-announcement` | Facebook announcement | Text and date |
| `/set-connections` | LinkedIn connections | 100 |
| `/set-followers` | LinkedIn followers | 50 |
| `/set-recommendations` | LinkedIn recommendations | 25 |
| `/edit-headline` | LinkedIn headline | Your new headline |
| `/edit-headline-bio` | LinkedIn bio | Your new bio |
| `/change-server-link` | Discord invite URL | https://discord.gg/xxx |

---

## 🔍 Troubleshooting

### Bot says "Supabase not available"
- [ ] Check `.env.local` exists and has correct URLs
- [ ] Verify Supabase project is still running
- [ ] Check internet connection
- [ ] Try restarting bot

### Website not showing updates
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Check `/api/card-state` in browser directly
- [ ] Verify env vars are correct
- [ ] Check browser console for errors

### "Table does not exist" error
- [ ] Make sure you ran the SQL from `database.sql`
- [ ] Verify you ran it in the correct Supabase project
- [ ] Check that the SQL executed without errors

### Still using local files instead of Supabase
- This is normal! Fallback happens if:
  - Env vars not set → use `SUPABASE_URL`
  - Supabase unreachable → retry with different credentials
  - Table doesn't exist → run `database.sql`

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `SUPABASE_SETUP.md` | Detailed setup guide |
| `database.sql` | SQL to create database tables |
| `.env.example` | Template for env variables |
| `bot/supabaseClient.ts` | Helper functions for Supabase |
| `bot/bot.ts` | Discord bot (updated with Supabase) |
| `src/app/api/card-state/route.ts` | Website API (reads from Supabase) |

---

## 🚀 Deployment

### Deploy Website (Vercel, etc)
Add these env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Deploy Bot (Railway, etc)
Add these env vars:
- All from your `.env.local`
- Make sure `FRONTEND_URL` points to your live website

---

## ✨ That's It!

You now have:
- ✅ Discord bot that stores updates in Supabase
- ✅ Website that reads and displays those updates
- ✅ Real-time portfolio that stays current
- ✅ Data persistence across restarts

Enjoy! 🎉
