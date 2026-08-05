# Instagram Graph API Setup Guide

This guide explains how to configure Instagram data access for the portfolio site and keep the token refreshed. Instagram does not offer a truly permanent token for normal apps; the best practice is to use the long-lived token flow and refresh it regularly.

## Overview

The site uses the Instagram Graph API to fetch profile statistics for a Business or Creator account. This requires:

- a Facebook Developer App
- a connected Facebook Page
- an Instagram Business or Creator account linked to that Page
- a long-lived access token that is refreshed automatically before expiry

## Why the token expires

Instagram Graph API tokens are not permanent.

- Short-lived tokens: ~1 hour
- Long-lived tokens: ~60 days
- Refreshing long-lived tokens is required to keep access working

There is no official `never-expire` token for Instagram Graph API access in this setup.

## Required account setup

1. Create a Facebook Developer account at https://developers.facebook.com
2. Create a new app and add the **Instagram Graph API** product
3. Add a **Facebook Page** to the app
4. Connect your Instagram Business or Creator account to that Facebook Page
5. Grant the app the following permissions for your app access token:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`
   - `instagram_manage_insights`

> If you only need read-only profile metrics, `instagram_basic` and `pages_read_engagement` are usually sufficient.

## Environment variables used by this repo

Add the following to your `.env.local` or environment config:

```bash
INSTAGRAM_ACCESS_TOKEN=your-long-lived-token
INSTAGRAM_BUSINESS_ID=your-instagram-business-account-id
INSTAGRAM_PAGE_ID=your-facebook-page-id
INSTAGRAM_APP_ID=your-facebook-app-id
INSTAGRAM_APP_SECRET=your-facebook-app-secret
```

The repo currently reads `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_BUSINESS_ID` in `src/app/api/instagram/route.ts`.

## Generate a long-lived token

1. Get a short-lived user access token from the Graph API Explorer or via your app OAuth flow.
2. Exchange the short-lived token for a long-lived token:

```bash
https://graph.facebook.com/v17.0/oauth/access_token?
  grant_type=ig_exchange_token
  &client_secret={app-secret}
  &access_token={short-lived-token}
```

Example:

```bash
curl "https://graph.facebook.com/v17.0/oauth/access_token?grant_type=ig_exchange_token&client_secret=$INSTAGRAM_APP_SECRET&access_token=$SHORT_LIVED_TOKEN"
```

The response will contain `access_token` and `token_type`.

## Refresh the long-lived token

Long-lived tokens expire after about 60 days. Refresh it before expiry using:

```bash
https://graph.facebook.com/v17.0/refresh_access_token?
  grant_type=ig_refresh_token
  &access_token={long-lived-token}
```

Example:

```bash
curl "https://graph.facebook.com/v17.0/refresh_access_token?grant_type=ig_refresh_token&access_token=$INSTAGRAM_ACCESS_TOKEN"
```

The response returns a new token and expiry info.

## Recommended workflow

1. Store the refreshed token securely in a backend secret store or database
2. Use the token in `INSTAGRAM_ACCESS_TOKEN`
3. Schedule a refresh every 45–55 days
4. If refresh fails, re-run the app authorization flow and generate a new short-lived token

## Example refresh script

Create a small server-side script to refresh your token automatically. For example:

```js
import fetch from "node-fetch";
import fs from "fs";

const appSecret = process.env.INSTAGRAM_APP_SECRET;
const currentToken = process.env.INSTAGRAM_ACCESS_TOKEN;

async function refreshToken() {
  const url = new URL("https://graph.facebook.com/v17.0/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", currentToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  console.log("new token", data.access_token);
  console.log("expires in", data.expires_in);

  // Save to a secure location or update your env management system.
  fs.writeFileSync("./token-refresh-output.json", JSON.stringify(data, null, 2));
}

refreshToken().catch(console.error);
```

> Keep this script on the server side only. Do not expose your app secret in frontend code.

## Updating the repo environment

Set these values in `.env.local`:

```bash
INSTAGRAM_ACCESS_TOKEN=your-refreshed-long-lived-token
INSTAGRAM_BUSINESS_ID=your-instagram-business-id
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
INSTAGRAM_PAGE_ID=your-page-id
```

## Use the refreshed token in the repo

The API route in `src/app/api/instagram/route.ts` uses the token directly in requests like:

```ts
const profileUrl = `https://graph.facebook.com/v22.0/${businessId}?fields=...&access_token=${encodeURIComponent(accessToken)}`;
```

If the token expires, the API will fail with a Graph API error. Refresh the token and replace `INSTAGRAM_ACCESS_TOKEN`.

## Troubleshooting

- `OAuthException` or `Invalid OAuth access token` means your token expired or was revoked
- `Invalid scope` means the app lacks required permissions
- `Unsupported get request` means the business account ID or page ID is wrong

### Best practice

- automate refresh every 45 days
- use server-side storage for the token
- do not embed the token in frontend code
- treat the token as refreshable, not permanent

## Summary

Instagram Graph API tokens must be refreshed frequently. The best setup is:

1. Use a Business/Creator account
2. exchange short-lived token for long-lived token
3. refresh long-lived token every 45–55 days
4. store token securely and update `INSTAGRAM_ACCESS_TOKEN`

This is the safest way to keep your Instagram API integration working without manual hourly regeneration.