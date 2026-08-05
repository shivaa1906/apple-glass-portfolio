"use client";

import { useEffect, useRef, useState } from "react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<number | null>(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handleStatusChange = () => {
      const online = window.navigator.onLine;

      if (!online) {
        setIsOnline(false);
        setMessage("You are offline");
        setShowMessage(true);
        wasOfflineRef.current = true;
        clearTimer();
        return;
      }

      if (wasOfflineRef.current) {
        setIsOnline(true);
        setMessage("You are back online");
        setShowMessage(true);
        clearTimer();
        timeoutRef.current = window.setTimeout(() => {
          setShowMessage(false);
        }, 2000);
      } else {
        setIsOnline(true);
        setShowMessage(false);
        clearTimer();
      }

      wasOfflineRef.current = false;
    };

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    return () => {
      clearTimer();
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  if (!showMessage) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4">
      <div className="network-toast pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <span
          className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-rose-400"}`}
        />
        <span className={isOnline ? "text-emerald-100" : "text-rose-100"}>{message}</span>
      </div>
    </div>
  );
}
