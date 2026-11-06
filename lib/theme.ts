/** The theme choices, in menu order. "system" follows the OS and changes with it. */
export const THEMES = ["light", "dark", "system"] as const;

/** Type: one theme choice. */
export type Theme = (typeof THEMES)[number];

/** Dark until someone picks otherwise: the app was dark-only before the toggle. */
export const DEFAULT_THEME: Theme = "dark";

/** Cookie the choice lives in, so the server can render the right class on <html>. */
export const THEME_COOKIE = "theme";

/** Reads a cookie value; anything unknown falls back to the default. */
export function parseTheme(value: string | undefined): Theme {
  return THEMES.find((theme) => theme === value) ?? DEFAULT_THEME;
}

/**
 * Inline <head> script. The server can't see the OS setting, so for "system" this adds
 * `.dark` before the first paint (no flash of the wrong theme) and keeps it in sync
 * when the OS setting changes. "light" and "dark" are already right in the server HTML.
 */
export const THEME_SCRIPT = `(() => {
  const root = document.documentElement;
  const media = matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    if (root.dataset.theme === "system") {
      root.classList.toggle("dark", media.matches);
    }
  };
  apply();
  media.addEventListener("change", apply);
})();`;
