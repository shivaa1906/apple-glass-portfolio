"use client";

// File: components/SocialCard/CardContainer.tsx
// Description: Reusable card wrapper that handles mobile/desktop styling and tilt effects.

import { type CSSProperties, type FC, type MouseEvent, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Type definition used to describe the structure of data in this component.
type CustomCSSProperties = CSSProperties & {
  "--mouse-x"?: string;
  "--mouse-y"?: string;
};

// Interface definition used for typed data structures.
interface CardContainerProps {
  id: string;
  accentGlow?: string;
  children: React.ReactNode;
}

/**
 * Parses "rgba(R, G, B, A)" or "rgb(R, G, B)" → "R,G,B"
 * so each card automatically gets its own accent color on mobile.
 */
// Core module export or function definition that implements this feature.
function extractRgb(glow: string): string {
// Core module export or function definition that implements this feature.
  const m = glow.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? `${m[1]},${m[2]},${m[3]}` : "10,132,255";
}

// Core module export or function definition that implements this feature.
export const CardContainer: FC<CardContainerProps> = ({
  id,
  accentGlow = "rgba(10, 132, 255, 0.4)",
  children,
}) => {
// Core module export or function definition that implements this feature.
  const rgb = extractRgb(accentGlow);

// Core module export or function definition that implements this feature.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMobileQuery = () =>
    typeof window !== "undefined" &&
    (window.innerWidth < 768 ||
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? isMobileQuery() : false
  );

// Core module export or function definition that implements this feature.
  const [rotateX, setRotateX] = useState(0);
// Core module export or function definition that implements this feature.
  const [rotateY, setRotateY] = useState(0);
// Core module export or function definition that implements this feature.
  const [mouseX, setMouseX] = useState("50%");
// Core module export or function definition that implements this feature.
  const [mouseY, setMouseY] = useState("50%");

  useEffect(() => {
    setIsMobile(isMobileQuery());
    const handleResize = () => setIsMobile(isMobileQuery());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Desktop-only scroll animations (UNTOUCHED) ────────────────────────── */
// Core module export or function definition that implements this feature.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center", "end start"],
  });
// Core module export or function definition that implements this feature.
  const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1, 0.85]);
// Core module export or function definition that implements this feature.
  const opacityValue = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0.3, 0.85, 1, 0.85, 0.3]);
// Core module export or function definition that implements this feature.
  const scale = isMobile ? 1 : scaleValue;
// Core module export or function definition that implements this feature.
  const opacity = isMobile ? 1 : opacityValue;
// Core module export or function definition that implements this feature.
  const y = 0;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile || !containerRef.current) return;
// Core module export or function definition that implements this feature.
    const rect = containerRef.current.getBoundingClientRect();
// Core module export or function definition that implements this feature.
    const x = e.clientX - rect.left;
// Core module export or function definition that implements this feature.
    const yy = e.clientY - rect.top;
// Core module export or function definition that implements this feature.
    const rX = ((yy - rect.height / 2) / (rect.height / 2)) * -6;
// Core module export or function definition that implements this feature.
    const rY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    setRotateX(rX);
    setRotateY(rY);
    setMouseX(`${x}px`);
    setMouseY(`${yy}px`);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

// Core module export or function definition that implements this feature.
  const tiltStyle: CustomCSSProperties = {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    "--mouse-x": mouseX,
    "--mouse-y": mouseY,
    boxShadow: `0 0 35px ${accentGlow}, 0 25px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)`,
  };
  /* ────────────────────────────────────────────────────────────────────────── */

  /*
   * Mobile card inline style — EXACTLY matches HeroCard values:
   *   background gradient  → same 145deg, dark start, 0.12 tint end
   *   boxShadow glow       → 0.30 outer, same deep black, same inset highlight
   *   border               → 0.30 accent
   *
   * Intensities are identical to HeroCard.tsx lines 204-206.
   */
// Core module export or function definition that implements this feature.
  const mobileCardStyle: CSSProperties = {
    background: `linear-gradient(145deg, rgba(8,10,20,0.99) 0%, rgba(${rgb},0.12) 100%)`,
    boxShadow: `0 0 40px rgba(${rgb},0.30), 0 20px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)`,
    border: `1px solid rgba(${rgb},0.30)`,
  };

  return (
    <section
      id={id}
      ref={containerRef}
      className="relative min-h-screen md:h-screen w-full flex items-center justify-center py-6 sm:py-12 md:py-0 md:snap-start px-3 sm:px-4"
    >
      {isMobile ? (
        /* ── Mobile: exact same max-w / rounding / padding as HeroCard ── */
        <div className="w-full max-w-4xl z-10">
          <div
            style={mobileCardStyle}
            className="w-full rounded-[28px] sm:rounded-[40px] p-5 sm:p-12 relative overflow-hidden"
          >
            {/* Top-left ambient orb — matches HeroCard's -top-24 -left-24 w-64 h-64 */}
            <div
              style={{ background: `rgba(${rgb},0.20)` }}
              className="absolute -top-24 -left-24 w-64 h-64 rounded-full pointer-events-none"
            />
            {/* Bottom-right ambient orb — matches HeroCard's -bottom-24 -right-24 w-64 h-64 */}
            <div
              style={{ background: `rgba(${rgb},0.20)` }}
              className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
            />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      ) : (
        /* ── Desktop: UNTOUCHED ── */
        <motion.div
          style={{ scale, opacity, y }}
          className="w-full max-w-5xl z-10 flex justify-center"
        >
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
            className="glass-panel glass-reflection glass-card-hover w-full rounded-[40px] p-6 sm:p-10 border border-white/15 relative overflow-hidden transition-transform duration-300 ease-out"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};
