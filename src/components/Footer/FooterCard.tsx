"use client";

// File: components/Footer/FooterCard.tsx
// Description: Footer section with contact and support information.

import { type FC, type FormEvent, useState } from "react";
import { CardContainer } from "../SocialCard/CardContainer";
import { HERO_DATA } from "@/data/socialData";
import { Send, ArrowUp, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { ViewerCounter } from "@/components/ViewerCounter/ViewerCounter";

export const FooterCard: FC = () => {
// Core module export or function definition that implements this feature.
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
    webhookUrl: "",
  });
// Core module export or function definition that implements this feature.
  const [isSubmitting, setIsSubmitting] = useState(false);
// Core module export or function definition that implements this feature.
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);

    try {
      // Post to Next.js Discord Webhook API route
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          message: formState.message,
          webhookUrl: formState.webhookUrl,
        }),
      });

      // Celebratory Confetti Burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#0a84ff", "#38bdf8", "#5865f2", "#ffffff"],
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormState({ name: "", email: "", message: "", webhookUrl: "" });
      }, 5000);
    } catch (err) {
      console.error("Submission error:", err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <CardContainer id="contact" accentGlow="rgba(10, 132, 255, 0.4)">
      <div className="flex flex-col h-full justify-between space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles size={13} />
            CONTACT ME
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gradient-apple">
            Submit Your Details
          </h2>
          <p className="text-sm text-white/60 max-w-lg mx-auto">
            Submissions are transmitted cleanly formatted and directly to our team.
          </p>
        </div>

        {/* Contact Form Container */}
        <div className="bg-white/[0.02] p-6 sm:p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto w-full">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-xl font-bold text-white">Transmission Delivered!</h4>
              <p className="text-xs text-white/70">
                Thank you, {formState.name}! Your message has been received successfully. I appreciate you reaching out and will respond to {formState.email} as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs text-white/70 font-semibold uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs text-white/70 font-semibold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@spatial.io"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs text-white/70 font-semibold uppercase tracking-wider">Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell me about your vision or project requirements..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              {/* Optional Discord Webhook URL Configuration Toggle }
              <div className="pt-1 text-left">
                <button
                  type="button"
                  onClick={() => setShowWebhookField(!showWebhookField)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <DiscordIcon size={14} />
                  <span>{showWebhookField ? "Hide Discord Webhook URL" : "Configure Custom Discord Webhook URL"}</span>
                </button>

                {showWebhookField && (
                  <div className="mt-2 space-y-1">
                    <input
                      type="url"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={formState.webhookUrl}
                      onChange={(e) => setFormState({ ...formState, webhookUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 placeholder-indigo-400/40 text-xs focus:outline-none focus:border-indigo-400 transition-all"
                    />
                    <p className="text-[10px] text-white/40">
                      Paste your Discord Channel Webhook URL to receive instant clean formatted embeds!
                    </p>
                  </div>
                )}
              </div> */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending Details...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Details</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-white/60">
          <div className="flex-1 text-center sm:text-left">
            <span>© 2026 {HERO_DATA.name}. Built with Next.js 15 & Glassmorphism</span>
          </div>

          <div className="flex flex-1 justify-center sm:justify-end items-center gap-2">
            <ViewerCounter />
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium transition-all hover:scale-105 cursor-pointer"
            >
              <ArrowUp size={14} className="text-blue-400" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </CardContainer>
  );
};
