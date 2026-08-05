# Deployment Guide - Hero Card Data Reliability

This guide ensures your Hero Card (location & email) displays reliably when deployed.

## ✅ Pre-Deployment Checklist

### 1. **Supabase Setup**
- [ ] Supabase project created
- [ ] `portfolio_card_state` table exists
- [ ] Environment variables set correctly

### 2. **Environment Variables**

Set these on your deployment platform:

**Vercel:**
- Go to Settings → Environment Variables
- Add:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  DISCORD_PRESENCE_URL=https://your-bot-server.ngrok.io/presence
  FRONTEND_URL=https://shivagopiportfolio.netlify.app
  FRONTEND_UPDATE_SECRET=replace_with_a_random_secret
  FACEBOOK_PAGE_ID=your_page_id_here
  FACEBOOK_ACCESS_TOKEN=your_page_access_token_here
  INSTAGRAM_BUSINESS_ID=your_instagram_business_id_here
  INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
  ```

**Netlify:**
- Go to Site settings → Build & deploy → Environment
- Add same variables as Vercel.

> If your bot runs locally or on Render and you want it to update the deployed frontend, set `FRONTEND_URL` to the Netlify site URL and `FRONTEND_UPDATE_SECRET` to the same secret on both the bot and the site.

### 3. **API Route Verification**
- [ ] Test `/api/card-state` on deployed site
- [ ] Test `/api/facebook/page` and `/api/facebook/posts`
- [ ] Test `/api/instagram` and `/api/instagram/posts`
- [ ] Should return JSON with no `error` message

---

## 🏗️ How It Works on Deployment

```
User visits deployed site
  ↓
1. Server-side rendering (HeroCardWrapper)
   └─> Fetches /api/card-state
       └─> API tries Supabase first
           └─> Falls back to defaults
  ↓
2. Initial HTML rendered with location & email
  ↓
3. Client hydrates (HeroCard component)
   └─> useCardState hook fetches fresh data
       └─> Updates if different from initial
```

### Why This Works 100%

✅ **Always has defaults** - Even if Supabase fails, shows default values  
✅ **Server-rendered** - Content visible before JavaScript loads  
✅ **Supabase prioritized** - Uses database on all platforms  
✅ **Fallback chain** - Never returns nothing  

---

## 🔒 Data Flow on Deployment

### When You Update via Bot Command

```
/set-location "New York"
  ↓
Bot runs command
  ↓
Saves to Supabase database
  ↓
Sends to deployed website API
  ↓
Website updates in real-time
```

### When Someone Visits Your Site

```
Visitor opens site
  ↓
Server fetches from /api/card-state
  ↓
API reads from Supabase
  ↓
Returns location & email
  ↓
Hero card displays immediately
```

---

## 🧪 Test Before Deployment

### Local Test

1. Start bot: `npm run bot`
2. Start site: `npm run dev`
3. Run command: `/set-email "newemail@test.com"`
4. Check Supabase console
5. Refresh browser at `http://localhost:3000`
6. Should see new email

### Deployment Test

1. Deploy to Vercel/Netlify
2. Set env vars for Supabase
3. Run command from bot: `/set-location "Test City"`
4. Visit deployed site
5. Should see "Test City" in hero card
6. Check network tab - `/api/card-state` returns data

---

## 🚨 Troubleshooting

### Hero card shows default email after deployment

**Problem:** Supabase not configured or unreachable

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is set in deployment platform
2. Check that URL is correct (should be `https://xxx.supabase.co`)
3. Ensure table `portfolio_card_state` exists in Supabase
4. Test manually: `curl https://your-site.com/api/card-state`

### API returns empty values

**Problem:** No data in Supabase

**Solution:**
1. Run a bot command to populate data: `/set-email "your@email.com"`
2. Check Supabase Table Editor - row should exist
3. If missing, run database.sql script again

### Changes not reflecting on site

**Problem:** Cache or stale data

**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check `/api/card-state` directly for fresh data
3. Wait 60 seconds (cache revalidation time)
4. Clear browser cache completely

---

## 📊 What Gets Displayed

Your Hero Card always displays:

| Field | Source |
|-------|--------|
| **Location** | Supabase → Default → empty |
| **Email** | Supabase → Default → empty |
| **Status** | Supabase → Default → "Available" |

Default values (guaranteed minimum):
```json
{
  "heroLocation": "KPHB, Hyderabad, Telangana",
  "heroEmail": "shivaa1906@gmail.com",
  "heroStatus": "Available"
}
```

---

## 🔐 Security on Deployment

- ✅ `NEXT_PUBLIC_*` vars are public (shown in browser)
- ✅ No secrets exposed in frontend code
- ✅ PATCH endpoint secured with `FRONTEND_UPDATE_SECRET`
- ✅ Bot syncs via secret header

---

## 📝 Deployment Platform Notes

### Vercel
- Auto-detects Next.js
- Env vars work immediately
- No special config needed
- Supports ISR (incremental static regeneration)

### Netlify
- May need build command: `npm run build`
- Env vars work immediately
- Check `netlify.toml` for build settings

### Other Platforms
- Ensure Node.js 18+
- Set env variables before deploying
- Run `npm run build` to test locally first

---

## ✨ Your Hero Card Guarantee

With this setup, your Hero Card will **ALWAYS** display location & email because:

1. ✅ Server renders with data before JavaScript
2. ✅ Always has fallback values
3. ✅ Supabase automatically provides real-time data
4. ✅ Multiple fallback chains ensure no errors
5. ✅ Works on all deployment platforms

---

## Next Steps

1. **Set env variables** on your deployment platform
2. **Deploy your site**
3. **Test the `/api/card-state` endpoint**
4. **Run a bot command** to populate data
5. **Refresh your deployed site** - should show your location & email

**Your portfolio is now deployment-ready!** 🚀
