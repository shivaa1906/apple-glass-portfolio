"use client";

// File: components/SmoothScroll/LenisProvider.tsx
// Description: Smooth scrolling provider using Lenis integration.

import React, { useEffect } from "react";
import Lenis from "lenis";

export const LenisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Detect mobile
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
// Core module export or function definition that implements this feature.
    const lenis = new Lenis({
      duration: isMobile ? 0.0 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    });

// Core module export or function definition that implements this feature.
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
