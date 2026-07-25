"use client";

import React from "react";

type Props = {
  icon: React.ReactNode;
  label: string;
  bg?: string;
  border?: string;
  shadow?: string;
  textColor?: string;
};

export const PlatformBadge: React.FC<Props> = ({ icon, label, bg, border, shadow, textColor }) => {
  const style: React.CSSProperties = {
    background: bg || "rgba(255,255,255,0.04)",
    border: border ? `1px solid ${border}` : "1px solid rgba(255,255,255,0.08)",
    boxShadow: shadow || "0 0 12px rgba(0,0,0,0.12)",
    color: textColor || "white",
  };

  return (
    <span
      className="p-1.5 rounded-full flex items-center gap-1 text-xs font-semibold px-2.5"
      style={style}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="uppercase">{label}</span>
    </span>
  );
};

export default PlatformBadge;
