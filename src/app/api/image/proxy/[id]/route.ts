import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextResponse, NextRequest } from "next/server";

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

function base64UrlDecode(b64: string) {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  const pad = s.length % 4;
  if (pad === 2) s += "==";
  else if (pad === 3) s += "=";
  else if (pad !== 0) s += "";
  try {
    return Buffer.from(s, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: any) {
  const params = context?.params ? await context.params : undefined;
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const url = base64UrlDecode(id);
  if (!url) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const host = target.hostname.toLowerCase();
  const allowedExact = ALLOWED_HOSTS.has(host);
  const allowedSuffix = ALLOWED_HOST_SUFFIXES.some((s) => s && host.endsWith(s));
  if (!allowedExact && !allowedSuffix) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const hash = crypto.createHash("sha256").update(String(url)).digest("hex");
  const cachePath = path.join(CACHE_DIR, `${hash}`);

  try {
    const stat = await fs.stat(cachePath).catch(() => null);
    if (stat && stat.size > 0) {
      const buf = await fs.readFile(cachePath);
      const ct = target.pathname.endsWith(".png") ? "image/png" : target.pathname.endsWith(".jpg") || target.pathname.endsWith(".jpeg") ? "image/jpeg" : "application/octet-stream";
      return new NextResponse(buf, { headers: { "Content-Type": ct, "Cache-Control": "public, max-age=86400" } });
    }
  } catch {
    // continue
  }

  try {
    const res = await fetch(String(url));
    if (!res.ok) return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    await ensureCacheDir();
    fs.writeFile(cachePath, buf).catch(() => null);
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    return new NextResponse(buf, { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    return NextResponse.json({ error: "Unable to fetch image" }, { status: 500 });
  }
}
