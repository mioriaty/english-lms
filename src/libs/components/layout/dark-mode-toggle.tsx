"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/libs/components/ui/button";
import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
        <Sun className="size-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      id="dark-mode-toggle"
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="size-4 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="size-4 transition-transform duration-300 rotate-0" />
      )}
    </Button>
  );
}
