# Facebook and Instagram API Setup

This project requires four values for live social card data:
- `FACEBOOK_PAGE_ID`
- `FACEBOOK_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ID`
- `INSTAGRAM_ACCESS_TOKEN`

These values are used by the app routes:
- `GET /api/facebook/page`
- `GET /api/facebook/posts`
- `GET /api/instagram`
- `GET /api/instagram/posts`

---

## 1. Prerequisites
You need:
- a Facebook Page you manage
- an Instagram Business or Creator account
- the Instagram account linked to that Facebook Page
- a Meta Developer account: https://developers.facebook.com/

---

## 2. Create a Facebook App
1. Go to https://developers.facebook.com/apps
2. Click **Create App**
3. Choose **Business** for app type
4. Enter a name and contact email
5. Click **Create App**
6. Stay in development mode while you set this up

---

## 3. Add the required Graph API permissions

### Facebook Page permissions
In your app dashboard, add **Facebook Login** and request these permissions:
- `pages_show_list`
- `pages_read_engagement`
- `pages_read_user_content`

These allow reading the page list, page stats, and page posts.

### Instagram permissions
Also add **Instagram Basic Display** or **Instagram Graph API** and request:
- `instagram_basic`
- `instagram_manage_insights`
- `pages_show_list`

These allow reading Instagram profile fields and media data. The minimum required for this repo is `instagram_basic` plus the Facebook page permissions.

---

## 4. Generate the access token

### Use Graph API Explorer
1. Open: https://developers.facebook.com/tools/explorer/
2. Select your app in the **Application** dropdown
3. Click **Get Token** → **Get User Access Token**
4. Select permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_read_user_content`
   - `instagram_basic`
   - `instagram_manage_insights`
5. Click **Get Access Token**

### Convert to a Page access token
1. In Graph API Explorer, run:
   ```
   GET /me/accounts
   ```
2. Find your Facebook Page in the response
3. Copy the `access_token` value from that page entry

That token is your `FACEBOOK_ACCESS_TOKEN`.

> If the Instagram account is linked to the same Page, this same token can often also serve as `INSTAGRAM_ACCESS_TOKEN`.

---

## 5. Get `FACEBOOK_PAGE_ID`

### Option A: Page settings
1. Open your Facebook Page
2. Go to **Settings** → **Page Info**
3. Copy the **Page ID** value

### Option B: Graph API
1. Using Graph API Explorer with your user access token, run:
   ```
   GET /me/accounts
   ```
2. Find the row for your page
3. Copy the `id` field

That value is your `FACEBOOK_PAGE_ID`.

---

## 6. Get `INSTAGRAM_BUSINESS_ID`
This is the Instagram Business Account ID connected to your Facebook Page.

### Option A: Graph API
1. Use your Page access token
2. Run:
   ```
   GET /{FACEBOOK_PAGE_ID}?fields=instagram_business_account
   ```
3. Copy the returned ID from `instagram_business_account.id`

### Option B: Business Suite
1. Open Meta Business Suite
2. Go to **Business Settings**
3. Choose **Accounts** → **Instagram Accounts**
4. Select your account and copy the Account ID

That value is your `INSTAGRAM_BUSINESS_ID`.

---

## 7. Get `INSTAGRAM_ACCESS_TOKEN`

### Recommended method
1. Use the same Page access token from Graph API Explorer
2. Confirm it works for Instagram with:
   ```
   GET /{INSTAGRAM_BUSINESS_ID}?fields=username,followers_count,follows_count,media_count,profile_picture_url
   ```
3. If the response succeeds, use that token as `INSTAGRAM_ACCESS_TOKEN`

If that fails, ensure the token is generated with:
- `instagram_basic`
- `pages_show_list`
- `instagram_manage_insights`

---

## 8. Save values in `.env.local`
Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_ACCESS_TOKEN=your_page_access_token_here
INSTAGRAM_BUSINESS_ID=your_instagram_business_id_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
```

> Keep `.env.local` out of version control.

---

## Required scopes summary

| Variable | Needed Scopes |
|---|---|
| `FACEBOOK_PAGE_ID` | none |
| `FACEBOOK_ACCESS_TOKEN` | `pages_show_list`, `pages_read_engagement`, `pages_read_user_content` |
| `INSTAGRAM_BUSINESS_ID` | none |
| `INSTAGRAM_ACCESS_TOKEN` | `instagram_basic`, `pages_show_list`, `instagram_manage_insights` |

---

## Verify the API endpoints locally

Start the app and visit:
- `http://localhost:3000/api/facebook/page`
- `http://localhost:3000/api/facebook/posts`
- `http://localhost:3000/api/instagram`
- `http://localhost:3000/api/instagram/posts`

Each endpoint should return JSON with no `error` message.

---

## Troubleshooting

### `Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ID`
- Confirm those env vars exist in `.env.local`
- Restart your dev server after editing `.env.local`

### `FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN are required`
- Confirm the exact env names are correct
- Confirm `.env.local` is loaded by your terminal

### Graph API failures
- Check the token scopes
- Ensure Facebook and Instagram are linked
- Use Graph API Explorer for live testing

---

## Quick local validation

```bash
curl "http://localhost:3000/api/facebook/page"
curl "http://localhost:3000/api/facebook/posts"
curl "http://localhost:3000/api/instagram"
curl "http://localhost:3000/api/instagram/posts"
```

If any return errors, the likely cause is:
- wrong env var name
- missing Graph API scope
- expired or invalid token
- Instagram account not linked to the correct Facebook Page
