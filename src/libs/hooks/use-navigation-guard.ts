"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UseNavigationGuardOptions {
  /** Whether the guard is currently active (i.e. there is unsaved content) */
  isDirty: boolean;
  /** Called when navigation is intercepted — show your confirmation dialog here */
  onBlock: (proceed: () => void, cancel: () => void) => void;
}

/**
 * useNavigationGuard
 *
 * Intercepts three types of navigation when `isDirty` is true:
 *  1. Hard navigation / tab close          → window.beforeunload
 *  2. In-app soft navigation (Link clicks) → document click capture (fires before Next.js)
 *  3. Browser Back / Forward button        → popstate + history.forward() undo trick
 *
 * Strategy for #2: intercept at the **click event capture phase** so we get the event
 * before Next.js's router link handler. We call e.preventDefault() +
 * e.stopImmediatePropagation() to stop Next.js, then invoke router.push() ourselves
 * only after the user confirms.
 */
export function useNavigationGuard({ isDirty, onBlock }: UseNavigationGuardOptions) {
  const router = useRouter();
  const isDirtyRef = useRef(isDirty);
  const onBlockRef = useRef(onBlock);
  // Flag to skip our own popstate handler when we trigger history.forward()/.back()
  const ignoringPopstateRef = useRef(false);

  // Keep refs in sync so event handlers always see latest values without re-registering
  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);
  useEffect(() => { onBlockRef.current = onBlock; }, [onBlock]);

  // ── 1. Browser tab/window close & hard refresh ───────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = ""; // Modern browsers show their own generic message
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── 2. In-app soft navigation — intercept anchor clicks BEFORE Next.js ───────
  //
  // Using { capture: true } on `document` ensures this fires in the capture phase,
  // before Next.js's bubbling-phase click handler on the Link component.
  // e.stopImmediatePropagation() prevents any other capture-phase listeners too.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isDirtyRef.current) return;

      const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";

      // Skip: hash-only links, external URLs, modifier-key clicks (open new tab)
      const isHashOnly = href.startsWith("#");
      const isExternal =
        href.startsWith("http") && !href.startsWith(window.location.origin);
      const isModified = e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
      const isNewTab = anchor.target === "_blank";

      if (!href || isHashOnly || isExternal || isModified || isNewTab) return;

      // Stop Next.js from processing this click
      e.preventDefault();
      e.stopImmediatePropagation();

      // Resolve the destination path
      let destination: string;
      try {
        if (href.startsWith("/")) {
          destination = href;
        } else {
          const url = new URL(href, window.location.origin);
          destination = url.pathname + url.search + url.hash;
        }
      } catch {
        destination = href;
      }

      onBlockRef.current(
        () => router.push(destination), // proceed: navigate after user confirms
        () => {},                        // cancel: do nothing
      );
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [router]);

  // ── 3. Browser Back / Forward button ─────────────────────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      if (!isDirtyRef.current || ignoringPopstateRef.current) return;

      // Undo the back/forward navigation by going in the opposite direction.
      // We set the flag so our own handler doesn't re-trigger.
      ignoringPopstateRef.current = true;
      window.history.forward();

      // Give history.forward() time to settle, then show the dialog.
      setTimeout(() => {
        ignoringPopstateRef.current = false;

        onBlockRef.current(
          () => {
            // User confirmed — actually go back now
            ignoringPopstateRef.current = true;
            window.history.back();
            setTimeout(() => { ignoringPopstateRef.current = false; }, 200);
          },
          () => {}, // cancel: stay on page (forward() already restored it)
        );
      }, 100);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
}
