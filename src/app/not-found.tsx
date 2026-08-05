"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 py-16 text-white sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_0%,transparent_50%,rgba(10,132,255,0.08)_100%)]" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center gap-4">
        <DotLottieReact
          src="https://lottie.host/22dbab04-8cfa-49f1-9fc1-971be0b0c3d6/aDccVJ4G3W.json"
          loop
          autoplay
          style={{ width: "100%", maxWidth: 720, height: "auto" }}
        />

        <Link
          href="/"
          className="rounded-2xl border border-blue-400/40 bg-blue-500/20 px-6 py-3 text-sm font-medium text-blue-100 transition hover:bg-blue-500/30"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
