"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors w-full text-slate-700 dark:text-zinc-400 font-medium"
    >
      {theme === "dark" ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-500" />}
      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}