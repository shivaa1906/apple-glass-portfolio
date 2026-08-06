"use client";

// File: components/Hero/HeroCard.tsx
// Description: Hero section component with profile content and motion effects.

import { type CSSProperties, type FC, type MouseEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { HERO_DATA } from "@/data/socialData";
import { MapPin, Mail, FileText, Send, Sparkles } from "lucide-react";
import {
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
  GitHubIcon,
  DiscordIcon,
  TwitterIcon,
} from "@/components/Icons/SocialBrandIcons";
import { ResumeModal } from "./ResumeModal";
import { useCardState } from "@/lib/useCardState";

// Type definition used to describe the structure of data in this component.
type CustomCSSProperties = CSSProperties & {
  "--mouse-x"?: string;
  "--mouse-y"?: string;
};

type HeroCardProps = {
  initialHeroLocation?: string;
  initialHeroEmail?: string;
};

export const HeroCard: FC<HeroCardProps> = ({ initialHeroLocation, initialHeroEmail }) => {
// Core module export or function definition that implements this feature.
  const containerRef = useRef<HTMLDivElement | null>(null);
// Core module export or function definition that implements this feature.
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  
  // Prevent hydration mismatch by tracking mount state
  const [hasMounted, setHasMounted] = useState(false);
  
  const getIsMobile = () =>
    typeof window !== "undefined" &&
    (window.innerWidth < 768 ||
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches);

  const [isMobile, setIsMobile] = useState<boolean>(() => getIsMobile());

// Core module export or function definition that implements this feature.
  const [rotateX, setRotateX] = useState(0);
// Core module export or function definition that implements this feature.
  const [rotateY, setRotateY] = useState(0);
// Core module export or function definition that implements this feature.
  const [mouseX, setMouseX] = useState("50%");
// Core module export or function definition that implements this feature.
  const [mouseY, setMouseY] = useState("50%");

  useEffect(() => {
    setHasMounted(true);
    const handleResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

// Core module export or function definition that implements this feature.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

// Core module export or function definition that implements this feature.
  const opacityValue = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
// Core module export or function definition that implements this feature.
  const scaleValue = useTransform(scrollYProgress, [0, 0.75], [1, 0.88]);
// Core module export or function definition that implements this feature.
  const yValue = useTransform(scrollYProgress, [0, 0.75], [0, -120]);

// Core module export or function definition that implements this feature.
  const opacity = isMobile ? 1 : opacityValue;
// Core module export or function definition that implements this feature.
  const scale = isMobile ? 1 : scaleValue;
// Core module export or function definition that implements this feature.
  const y = isMobile ? 0 : yValue;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile || !containerRef.current) return;
// Core module export or function definition that implements this feature.
    const rect = containerRef.current.getBoundingClientRect();
// Core module export or function definition that implements this feature.
    const x = e.clientX - rect.left;
// Core module export or function definition that implements this feature.
    const y = e.clientY - rect.top;
// Core module export or function definition that implements this feature.
    const centerX = rect.width / 2;
// Core module export or function definition that implements this feature.
    const centerY = rect.height / 2;

// Core module export or function definition that implements this feature.
    const rX = ((y - centerY) / centerY) * -6;
// Core module export or function definition that implements this feature.
    const rY = ((x - centerX) / centerX) * 6;

    setRotateX(rX);
    setRotateY(rY);
    setMouseX(`${x}px`);
    setMouseY(`${y}px`);
  };

// Core module export or function definition that implements this feature.
  const hoverStyle: CustomCSSProperties = {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    "--mouse-x": mouseX,
    "--mouse-y": mouseY,
  };

// Core module export or function definition that implements this feature.
  const cardState = useCardState();

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Use server-rendered initial values as primary, only update if API provides different values
  // This prevents the flash when page loads
  const statusLabel = cardState.heroStatus || HERO_DATA.status || "";
  const statusVisible = cardState.heroStatusVisible !== false;
  const normalizedStatus = statusLabel?.trim().toLowerCase();
  const isUnavailable = normalizedStatus === "unavailable";
  const statusDotColor = isUnavailable ? "bg-red-400" : "bg-emerald-400";
  const statusBorderColor = isUnavailable ? "border-red-500/40" : "border-emerald-500/40";
  const statusTextColor = isUnavailable ? "text-red-300" : "text-emerald-300";

  // Location: Use Supabase value if set, fallback to server initial
  // Supabase values become the "new defaults" when bot edits them
  const locationLabel = 
    (cardState.heroLocation && cardState.heroLocation.trim() !== "") 
      ? cardState.heroLocation 
      : (initialHeroLocation && initialHeroLocation.trim() !== "" ? initialHeroLocation : "");

  // Email: Use Supabase value if set, fallback to server initial
  // Supabase values become the "new defaults" when bot edits them
  const emailLabel =
    (cardState.heroEmail && cardState.heroEmail.trim() !== "")
      ? cardState.heroEmail
      : (initialHeroEmail && initialHeroEmail.trim() !== "" ? initialHeroEmail : "");

  const renderCardContent = () => (
    <>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 mb-6 flex-shrink-0 aspect-square">
        <div className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-blue-500 via-cyan-400 to-purple-500 shadow-xl shadow-blue-500/30 flex items-center justify-center flex-shrink-0 aspect-square">
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black/40 flex-shrink-0 aspect-square">
            <Image
              src={HERO_DATA.avatar}
              alt={HERO_DATA.name}
              fill
              sizes="128px"
              loading="eager"
              priority
              className="object-cover scale-105 hover:scale-110 transition-transform duration-500 rounded-full"
            />
          </div>
        </div>
        {statusVisible ? (
          // <div className={`absolute bottom-0 right-0 z-20 flex items-center gap-1.5 bg-black/85 px-2.5 py-1 rounded-full border ${statusBorderColor} shadow-lg`}>
          //   {/* <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor} animate-ping flex-shrink-0`} /> */}
          //   <span className={`text-[10px] font-semibold ${statusTextColor} tracking-wider whitespace-nowrap`}>{statusLabel?.toUpperCase()}</span>
          // </div>
          null
        ) : null}
      </div>

      <div className="inline-block relative mb-3">
        <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-gradient-apple">
          {HERO_DATA.name}
        </h1>
        <div className="animated-blue-underline mt-2" />
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
          <Sparkles size={13} />
          {HERO_DATA.title}
        </span>
      </div>

      <p className="max-w-2xl mx-auto text-sm sm:text-lg text-white/90 leading-relaxed font-normal mb-6">
        {HERO_DATA.shortBio}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/80 mb-8">
        {locationLabel ? (
          <span className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-full border border-white/15">
            <MapPin size={14} className="text-blue-400" />
            {locationLabel}
          </span>
        ) : null}
        {emailLabel ? (
          <span className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-full border border-white/15">
            <Mail size={14} className="text-cyan-400" />
            {emailLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
        <button
          onClick={() => setIsResumeOpen(true)}
          className="flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
        >
          <FileText size={18} className="text-blue-400" />
          <span>Resume</span>
        </button>

        <a
          href="#contact"
          className="flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-600/40 hover:shadow-blue-500/60 active:scale-95"
        >
          <Send size={18} />
          <span>Contact Me</span>
        </a>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3 pt-6 border-t border-white/10">
        {[
          { icon: InstagramIcon, href: "#instagram", label: "Instagram", color: "hover:text-pink-400" },
          { icon: LinkedInIcon, href: "#linkedin", label: "LinkedIn", color: "hover:text-blue-400" },
          { icon: YouTubeIcon, href: "#youtube", label: "YouTube", color: "hover:text-red-400" },
          { icon: GitHubIcon, href: "#github", label: "GitHub", color: "hover:text-gray-200" },
          { icon: DiscordIcon, href: "#discord", label: "Discord", color: "hover:text-indigo-400" },
          { icon: TwitterIcon, href: "#twitter", label: "Twitter", color: "hover:text-cyan-400" },
        ].map((item, idx) => {
// Core module export or function definition that implements this feature.
          const IconComponent = item.icon;
          return (
            <a
              key={idx}
              href={item.href}
              title={item.label}
              className={`p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 text-white/70 ${item.color} hover:bg-white/15 hover:scale-110 transition-all duration-300`}
            >
              <IconComponent size={18} />
            </a>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <section
        id="hero"
        ref={containerRef}
        className="relative min-h-screen md:h-screen w-full flex items-center justify-center py-6 sm:py-12 md:py-0 md:snap-start px-3 sm:px-4"
      >
        {isMobile ? (
          <div className="w-full max-w-4xl z-10">
            <div
              style={{
                background: "linear-gradient(145deg, rgba(8,10,20,0.99) 0%, rgba(10,132,255,0.12) 100%)",
                boxShadow: "0 0 40px rgba(10,132,255,0.30), 0 20px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)",
                border: "1px solid rgba(10,132,255,0.30)",
              }}
              className="w-full rounded-[28px] sm:rounded-[40px] p-5 sm:p-12 text-center relative overflow-hidden"
            >
              {renderCardContent()}
            </div>
          </div>
        ) : (
          <motion.div
            style={{
              opacity,
              scale,
              y,
            }}
            className="w-full max-w-4xl z-10"
          >
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={hoverStyle}
              className="glass-panel glass-reflection rounded-[40px] p-8 sm:p-12 border border-white/15 shadow-2xl shadow-black/80 text-center relative overflow-hidden transition-transform duration-300 ease-out"
            >
              {renderCardContent()}
            </div>
          </motion.div>
        )}
      </section>

      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </>
  );
};
