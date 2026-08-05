"use client";

import { useEffect } from "react";
import { useVisitorAnalytics } from "@/lib/analyticsClient";

export const AnalyticsTracker = () => {
  const { track } = useVisitorAnalytics();

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await track({
          browser: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          language: navigator.language || "",
          landingPage: window.location.pathname,
          currentPage: window.location.href,
        });
      } catch {
        // tracking should never block page load
      }
    };

    void trackVisitor();
  }, [track]);

  return null;
};
