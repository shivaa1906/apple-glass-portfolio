import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";

const DEFAULT_ALLOWED_HOSTS = [
  "cdn.discordapp.com",
  "media.discordapp.net",
  "images.discordapp.net",
  "discordapp.com",
  "graph.facebook.com",
  "static.xx.fbcdn.net",
  "platform-lookaside.fbsbx.com",
];

// Allow suffixes for broad Facebook CDN coverage (e.g. scontent.xx.fbcdn.net)
const DEFAULT_ALLOWED_SUFFIXES = [".fbcdn.net", ".facebook.com", ".fbsbx.com"];

const envAllowed = (process.env.ALLOWED_IMAGE_HOSTS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_HOSTS = new Set([...DEFAULT_ALLOWED_HOSTS, ...envAllowed]);
const ALLOWED_HOST_SUFFIXES = DEFAULT_ALLOWED_SUFFIXES.concat(
  (process.env.ALLOWED_IMAGE_HOST_SUFFIXES || "").split(",").map((s) => s.trim()).filter(Boolean)
);

const CACHE_DIR = path.join(process.cwd(), "bot", "image-cache");

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const urlParam = new URL(req.url).searchParams.get("u");
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const host = target.hostname.toLowerCase();
  const allowedExact = ALLOWED_HOSTS.has(host);
  const allowedSuffix = ALLOWED_HOST_SUFFIXES.some((s) => s && host.endsWith(s));
  if (!allowedExact && !allowedSuffix) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const hash = crypto.createHash("sha256").update(String(urlParam)).digest("hex");
  const cachePath = path.join(CACHE_DIR, `${hash}`);

  try {
    // return cached file if exists
    const stat = await fs.stat(cachePath).catch(() => null);
    if (stat && stat.size > 0) {
      const buf = await fs.readFile(cachePath);
      // try to detect content-type by magic header or fallback
      const ct = target.pathname.endsWith(".png") ? "image/png" : target.pathname.endsWith(".jpg") || target.pathname.endsWith(".jpeg") ? "image/jpeg" : "application/octet-stream";
      return new NextResponse(buf, { headers: { "Content-Type": ct, "Cache-Control": "public, max-age=86400" } });
    }
  } catch {
    // continue to fetch
  }

  try {
    const res = await fetch(String(urlParam));
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
    }
    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    await ensureCacheDir();
    // write cache best-effort
    fs.writeFile(cachePath, buf).catch(() => null);

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    return new NextResponse(buf, { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    return NextResponse.json({ error: "Unable to fetch image" }, { status: 500 });
  }
}
