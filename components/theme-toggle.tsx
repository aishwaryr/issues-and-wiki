"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseTheme, type Theme, THEME_COOKIE, THEMES } from "@/lib/theme";

const OPTIONS: Record<Theme, { label: string; icon: typeof Sun }> = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  system: { label: "System", icon: Monitor },
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Light / dark / system menu in the navbar. Applies the choice to <html> right away and
 * stores it in a cookie, so the next server render (and reload) starts in that theme.
 */
export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState(initialTheme);
  const { label, icon: Icon } = OPTIONS[theme];

  function choose(value: string) {
    const next = parseTheme(value);
    setTheme(next);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;

    const root = document.documentElement;
    root.dataset.theme = next;
    const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle(
      "dark",
      next === "dark" || (next === "system" && systemDark),
    );
  }

  return (
    <Select value={theme} onValueChange={choose}>
      <SelectTrigger
        aria-label="Theme"
        size="sm"
        // Icon button: no border, and no chevron (its only direct <svg> child), so it
        // fits next to the avatar and log-out button at 320px.
        className="size-8 justify-center border-0 bg-transparent p-0 shadow-none hover:bg-accent dark:bg-transparent dark:hover:bg-accent [&>svg]:hidden"
      >
        {/* Children so the icon is in the server HTML (Radix fills it only after hydration). */}
        <SelectValue>
          <Icon aria-hidden />
          <span className="sr-only">{label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {THEMES.map((option) => {
          const { label: optionLabel, icon: OptionIcon } = OPTIONS[option];
          return (
            <SelectItem key={option} value={option}>
              <OptionIcon aria-hidden />
              {optionLabel}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
