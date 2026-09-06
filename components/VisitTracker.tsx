"use client";

import { useEffect } from "react";

const STORAGE_KEY = "moone_visit_session_id";

export function VisitTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;

    try {
      let sessionId = sessionStorage.getItem(STORAGE_KEY);
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(STORAGE_KEY, sessionId);
      }

      fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, path: window.location.pathname }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // sessionStorage no disponible (modo privado, etc.) — no es crítico.
    }
  }, []);

  return null;
}
