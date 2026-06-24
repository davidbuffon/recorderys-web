"use client";

import { useEffect, useMemo, useState } from "react";

type CookiePreferences = {
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "recorderys_cookie_preferences";

const defaultPreferences: CookiePreferences = {
  analytics: false,
  marketing: false,
};

function readPreferences(): CookiePreferences | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookiePreferences) : null;
  } catch {
    return null;
  }
}

function savePreferences(preferences: CookiePreferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new Event("recorderys:cookies-updated"));
}

export function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);

  const summary = useMemo(() => {
    const enabled = [
      preferences.analytics ? "analítica" : null,
      preferences.marketing ? "marketing" : null,
    ].filter(Boolean);

    return enabled.length
      ? `Opcionales activas: ${enabled.join(", ")}.`
      : "Solo cookies técnicas activas.";
  }, [preferences]);

  useEffect(() => {
    const stored = readPreferences();
    if (stored) {
      setPreferences(stored);
      setVisible(false);
    } else {
      setVisible(true);
    }
    setReady(true);

    const openSettings = () => {
      const next = readPreferences() ?? defaultPreferences;
      setPreferences(next);
      setSettingsOpen(true);
      setVisible(true);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("[data-cookie-settings]")
      ) {
        openSettings();
      }
    };

    window.addEventListener("recorderys:open-cookie-settings", openSettings);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("recorderys:open-cookie-settings", openSettings);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  if (!ready || !visible) return null;

  const acceptAll = () => {
    const next = { analytics: true, marketing: true };
    setPreferences(next);
    savePreferences(next);
    setVisible(false);
    setSettingsOpen(false);
  };

  const rejectAll = () => {
    setPreferences(defaultPreferences);
    savePreferences(defaultPreferences);
    setVisible(false);
    setSettingsOpen(false);
  };

  const saveSelection = () => {
    savePreferences(preferences);
    setVisible(false);
    setSettingsOpen(false);
  };

  return (
    <div className="cookie-panel" role="dialog" aria-label="Preferencias de cookies">
      <div className="cookie-panel__copy">
        <span className="legal-eyebrow">Privacidad</span>
        <h2>Cookies bajo control</h2>
        <p>
          Usamos cookies técnicas para que RECORDERYS funcione. Las cookies de
          analítica o marketing solo se activarán si nos das permiso.
        </p>
        <small>{summary}</small>
      </div>

      {settingsOpen ? (
        <div className="cookie-settings">
          <label className="cookie-toggle cookie-toggle--locked">
            <input checked disabled type="checkbox" />
            <span>
              <strong>Técnicas</strong>
              <small>Necesarias para iniciar sesión, seguridad y preferencias.</small>
            </span>
          </label>

          <label className="cookie-toggle">
            <input
              checked={preferences.analytics}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  analytics: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>
              <strong>Analítica</strong>
              <small>Medición agregada para mejorar la experiencia.</small>
            </span>
          </label>

          <label className="cookie-toggle">
            <input
              checked={preferences.marketing}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  marketing: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>
              <strong>Marketing y partners</strong>
              <small>Medición de campañas o acuerdos comerciales.</small>
            </span>
          </label>
        </div>
      ) : null}

      <div className="cookie-panel__actions">
        {settingsOpen ? (
          <button className="button button-primary" onClick={saveSelection} type="button">
            Guardar preferencias
          </button>
        ) : (
          <button className="button button-secondary" onClick={() => setSettingsOpen(true)} type="button">
            Configurar
          </button>
        )}
        <button className="button button-secondary" onClick={rejectAll} type="button">
          Rechazar
        </button>
        <button className="button button-primary" onClick={acceptAll} type="button">
          Aceptar
        </button>
      </div>
    </div>
  );
}
