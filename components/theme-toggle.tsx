"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "recorderys_theme";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.dataset.theme = "dark";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage no disponible (p. ej. navegación privada estricta)
    }
  }

  return { dark, toggle };
}

export function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      aria-pressed={dark}
      className={`theme-toggle ${dark ? "theme-toggle--on" : ""}`}
      onClick={toggle}
      type="button"
    >
      <span className="theme-toggle__knob" />
    </button>
  );
}
