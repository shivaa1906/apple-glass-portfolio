"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
}

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Detect mobile device
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return; // Skip on mobile
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    // Initialize subtle floating particles & stars - reduce on mobile
    const particleCount = isMobile 
      ? Math.min(40, Math.floor((width * height) / 36000))
      : Math.min(80, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];

    const colors = [
      "rgba(10, 132, 255, ", // Apple Blue
      "rgba(168, 85, 247, ", // Aurora Purple
      "rgba(56, 189, 248, ", // Cyan Light
      "rgba(255, 255, 255, ", // Star White
    ];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.4 + 0.1;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: baseAlpha,
        baseAlpha,
      });
    }

    // Floating glass aurora blobs
    let time = 0;

    const render = () => {
      time += 0.008;
      
      if (!isMobile) {
        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      // Deep space black base
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      // Radial Aurora Glow 1 - Apple Blue (reduced on mobile)
      const blob1X = width * 0.3 + Math.sin(time * 0.6) * 120 + (isMobile ? 0 : (mouseX - width / 2) * 0.05);
      const blob1Y = height * 0.4 + Math.cos(time * 0.8) * 100 + (isMobile ? 0 : (mouseY - height / 2) * 0.05);
      const grad1 = ctx.createRadialGradient(blob1X, blob1Y, 50, blob1X, blob1Y, 550);
      grad1.addColorStop(0, isMobile ? "rgba(10, 132, 255, 0.06)" : "rgba(10, 132, 255, 0.12)");
      grad1.addColorStop(0.5, isMobile ? "rgba(10, 132, 255, 0.02)" : "rgba(10, 132, 255, 0.04)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Radial Aurora Glow 2 - Deep Violet (reduced on mobile)
      const blob2X = width * 0.7 + Math.cos(time * 0.5) * 140 + (isMobile ? 0 : -(mouseX - width / 2) * 0.03);
      const blob2Y = height * 0.6 + Math.sin(time * 0.7) * 120 + (isMobile ? 0 : -(mouseY - height / 2) * 0.03);
      const grad2 = ctx.createRadialGradient(blob2X, blob2Y, 40, blob2X, blob2Y, 600);
      grad2.addColorStop(0, isMobile ? "rgba(147, 51, 234, 0.04)" : "rgba(147, 51, 234, 0.09)");
      grad2.addColorStop(0.6, isMobile ? "rgba(79, 70, 229, 0.01)" : "rgba(79, 70, 229, 0.03)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Particles render & update
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse alpha
        p.alpha = p.baseAlpha + Math.sin(time * 2 + p.x) * 0.15;
        p.alpha = Math.max(0.05, Math.min(0.7, p.alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
};
