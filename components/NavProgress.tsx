"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const START_EVENT = "navprogress:start";
// Navigations faster than this never show the bar, so it doesn't flash
const SHOW_DELAY_MS = 100;
// Hide the bar if a navigation never finishes (e.g. the request failed)
const GIVE_UP_MS = 15000;

/** Starts the top loading bar for navigations that aren't link clicks, e.g. router.push(). */
export function startNavProgress() {
  window.dispatchEvent(new Event(START_EVENT));
}

/** Thin bar at the top of the page while the next page loads. */
export default function NavProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [lastPath, setLastPath] = useState(pathname);
  const showTimer = useRef<number | undefined>(undefined);

  // The new page has rendered: finish the bar. (No loading.tsx on purpose: it would
  // put a skeleton in the static HTML ahead of the real content.)
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (phase === "loading") setPhase("done");
  }

  useEffect(() => {
    window.clearTimeout(showTimer.current);
  }, [pathname]);

  // Fade the current page while the next one loads
  useEffect(() => {
    document.documentElement.toggleAttribute("data-navigating", phase === "loading");
  }, [phase]);

  useEffect(() => {
    function start() {
      window.clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => setPhase("loading"), SHOW_DELAY_MS);
    }

    // Capture phase: <Link> calls preventDefault() in its own click handler
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener(START_EVENT, start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(START_EVENT, start);
      window.clearTimeout(showTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "idle") return;
    const timer = window.setTimeout(() => setPhase(phase === "done" ? "idle" : "done"), phase === "done" ? 500 : GIVE_UP_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return <div aria-hidden="true" className="nav-progress" data-phase={phase} />;
}
