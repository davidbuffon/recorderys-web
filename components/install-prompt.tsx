"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | null;

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return null;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [visible, setVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem("install_dismissed")) return;

    const p = detectPlatform();
    setPlatform(p);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (p === "android") setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (p === "ios") setVisible(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setVisible(false);
    setShowIosGuide(false);
    localStorage.setItem("install_dismissed", "1");
  }

  async function installAndroid() {
    if (!deferredPrompt) return;
    (deferredPrompt as BeforeInstallPromptEvent).prompt();
    const { outcome } = await (deferredPrompt as BeforeInstallPromptEvent).userChoice;
    if (outcome === "accepted") dismiss();
  }

  if (!visible) return null;

  return (
    <>
      <div className="install-overlay" onClick={() => setShowIosGuide(false)} />

      {showIosGuide ? (
        <div className="install-guide">
          <button className="install-guide__close" onClick={dismiss} type="button" aria-label="Cerrar">✕</button>
          <img src="/brand-icons/iphone.png" alt="RECORDERYS" className="install-guide__icon" />
          <h2>Añadir a pantalla de inicio</h2>
          <ol>
            <li>
              Toca el botón{" "}
              <span className="install-guide__inline-icon" aria-label="compartir">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </span>{" "}
              en la barra de Safari.
            </li>
            <li>Desplázate y toca <strong>«Añadir a pantalla de inicio»</strong>.</li>
            <li>Pulsa <strong>Añadir</strong> para confirmar.</li>
          </ol>
          <p className="install-guide__note">
            Recorderys aparecerá en tu pantalla de inicio como una app nativa.
          </p>
        </div>
      ) : (
        <div className="install-banner">
          <div className="install-banner__body">
            <img src="/brand-icons/iphone.png" alt="" className="install-banner__icon" />
            <div>
              <strong>Añadir a pantalla de inicio</strong>
              <span>Úsala como una app nativa</span>
            </div>
          </div>
          <div className="install-banner__actions">
            {platform === "ios" ? (
              <button
                className="button button-primary install-banner__btn"
                onClick={() => setShowIosGuide(true)}
                type="button"
              >
                Cómo hacerlo
              </button>
            ) : (
              <button
                className="button button-primary install-banner__btn"
                onClick={installAndroid}
                type="button"
              >
                Instalar
              </button>
            )}
            <button className="install-banner__dismiss" onClick={dismiss} type="button" aria-label="Cerrar">
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
