"use client";

// File: components/Hero/ResumeModal.tsx
// Description: Resume modal dialog with open/close animation.

import { type FC, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Download, FileText, CheckCircle2, Sparkles } from "lucide-react";

// Interface definition used for typed data structures.
interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getIsMobileDevice = () =>
  typeof window !== "undefined" &&
  (window.innerWidth < 768 ||
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches);

export const ResumeModal: FC<ResumeModalProps> = ({ isOpen, onClose }) => {
// Core module export or function definition that implements this feature.
  const shouldReduceMotion = useReducedMotion();

  const [isMobileDevice, setIsMobileDevice] = useState(() => getIsMobileDevice());

  useEffect(() => {
    const handleResize = () => setIsMobileDevice(getIsMobileDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const disableMotion = shouldReduceMotion || isMobileDevice;

  const renderModalContent = () => (
    <>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white transition-all"
        aria-label="Close Modal"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
          <FileText size={26} />
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Shiva Gopi — Curriculum Vitae
            <Sparkles size={18} className="text-blue-400 animate-pulse" />
          </h3>
          <p className="text-sm text-white/60">Principal Spatial UI Architect & Principal Engineer</p>
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-6 bg-white/[0.03] p-6 rounded-2xl border border-white/10">
        {/* Executive Summary */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-2">
            Executive Summary
          </h4>
          <p className="text-sm text-white/80 leading-relaxed">
            Pioneer in design engineering and spatial compute UI architectures. Over 8+ years experience developing high-performance WebGL 3D interfaces, Framer physics engines, and enterprise design systems for global tech leaders.
          </p>
        </div>

        {/* Core Competencies */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-3">
            Core Technical Mastery
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-white/90">
            {[
              "React 19 & Next.js 15",
              "WebGL & Three.js",
              "GSAP & Framer Motion",
              "TypeScript Architecture",
              "Tailwind & Shader Systems",
              "GPU Accelerated Physics",
            ].map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10"
              >
                <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Impact */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-3">
            Selected Key Experience
          </h4>
          <div className="space-y-3 text-sm">
            <div className="border-l-2 border-blue-500/50 pl-4 py-1">
              <div className="flex justify-between items-center text-xs font-semibold text-white/90">
                <span>Spatial Labs Inc. — Principal UI Architect</span>
                <span className="text-white/50">2023 - Present</span>
              </div>
              <p className="text-xs text-white/70 mt-1">
                Directing next-generation spatial computing interfaces and glass UI design tokens serving over 1.5M monthly active users.
              </p>
            </div>
            <div className="border-l-2 border-white/20 pl-4 py-1">
              <div className="flex justify-between items-center text-xs font-semibold text-white/90">
                <span>Vercel Partner Studio — Senior Frontend Architect</span>
                <span className="text-white/50">2020 - 2023</span>
              </div>
              <p className="text-xs text-white/70 mt-1">
                Created micro-frontend systems, streaming SSR frameworks, and high-performance animation engines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="text-xs text-white/50 flex items-center gap-1.5">
          <span>PDF Format • Updated July 2026 • Verified 8.2MB</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="#download"
            onClick={(e) => {
              e.preventDefault();
              alert("Alex Rivera's official Resume PDF download started!");
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </a>
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          {disableMotion ? (
            <div
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
          )}

          {/* Modal Container */}
          {disableMotion ? (
            <div className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-panel rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl shadow-blue-500/10 text-white">
              {renderModalContent()}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-panel rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl shadow-blue-500/10 text-white"
            >
              {renderModalContent()}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
