"use client";

import { useEffect } from "react";
import { useVisitorAnalytics } from "@/lib/analyticsClient";

export const AnalyticsTracker = () => {
  const { track } = useVisitorAnalytics();

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const ua = navigator.userAgent || "";
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const browserVersion = ua;
        await track({
          browser: ua,
          browserVersion,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          language: navigator.language || "",
          deviceType: isMobile ? "mobile" : "desktop",
          screenResolution: screenRes,
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
