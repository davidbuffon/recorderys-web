"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase-browser";
import { hasSupabaseEnv } from "@/lib/demo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [message, setMessage] = useState("");
  const [nextPath, setNextPath] = useState("/dashboard");

  const demoMode = !hasSupabaseEnv();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode");
    const requestedNext = params.get("next");
    if (requestedMode === "register") setMode("register");
    if (requestedNext?.startsWith("/")) setNextPath(requestedNext);
  }, []);

  async function signInWithProvider(provider: "google" | "apple") {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
  }

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createClient();

    if (mode === "recover") {
      const response = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (response.error) {
        setMessage(response.error.message);
        return;
      }

      setMessage(
        "Te hemos enviado un enlace para restablecer la contraseña si la cuenta existe.",
      );
      return;
    }

    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

    if (response.error) {
      if (
        mode === "register" &&
        /already registered|already exists|user already/i.test(response.error.message)
      ) {
        setMessage(
          "Ese email ya tiene una cuenta. Puedes iniciar sesión o recuperar la contraseña.",
        );
        return;
      }

      setMessage(response.error.message);
      return;
    }

    if (mode === "register") {
      const hasExistingAccount =
        !response.data.session &&
        Array.isArray(response.data.user?.identities) &&
        response.data.user?.identities.length === 0;

      if (hasExistingAccount) {
        setMessage(
          "Ese email ya tiene una cuenta. Puedes iniciar sesión o recuperar la contraseña.",
        );
        return;
      }

      setMessage("Revisa tu correo para confirmar la cuenta.");
      return;
    }

    window.location.href = nextPath;
  }

  return (
    <main className="auth-v2">
      <div className="auth-v2__panel">
        <Link className="auth-v2__brand" href="/" aria-label="Volver a Recorderys">
          <Brand />
        </Link>
        <div className="auth-v2__panel-copy">
          <h1>
            {mode === "login"
              ? "Todo donde lo dejaste."
              : mode === "register"
                ? "Tu primera compra, siempre localizada."
                : "Recupera el acceso."}
          </h1>
          <p>
            Tickets, garantías y devoluciones importantes, disponibles cuando de
            verdad los necesitas.
          </p>
        </div>
      </div>

      <div className="auth-v2__content">
        <div className="auth-v2__box">
          {mode !== "recover" ? (
            <div className="auth-tabs" role="tablist">
              <button
                aria-selected={mode === "login"}
                className={`auth-tabs__tab ${mode === "login" ? "auth-tabs__tab--active" : ""}`}
                onClick={() => setMode("login")}
                role="tab"
                type="button"
              >
                Entrar
              </button>
              <button
                aria-selected={mode === "register"}
                className={`auth-tabs__tab ${mode === "register" ? "auth-tabs__tab--active" : ""}`}
                onClick={() => setMode("register")}
                role="tab"
                type="button"
              >
                Crear cuenta
              </button>
            </div>
          ) : null}

          <h2>
            {mode === "login"
              ? "Accede a tu espacio"
              : mode === "register"
                ? "Empieza a guardar compras"
                : "Recupera tu contraseña"}
          </h2>
          <p className="auth-v2__hint">
            {mode === "recover"
              ? "Introduce tu email y te enviaremos un enlace para crear una nueva contraseña."
              : "Usa Google, Apple o tu email."}
          </p>
          {demoMode ? (
            <p className="auth-v2__message">
              Modo demo activo. Puedes navegar la interfaz sin conectar todavía
              Supabase.
            </p>
          ) : null}

          {mode !== "recover" ? (
            <>
              <div className="auth-v2__providers">
                <button
                  className="pd-button pd-button--secondary"
                  onClick={() => signInWithProvider("google")}
                  type="button"
                >
                  Continuar con Google
                </button>
                <button
                  className="pd-button pd-button--secondary"
                  onClick={() => signInWithProvider("apple")}
                  type="button"
                >
                  Continuar con Apple
                </button>
              </div>

              <div className="auth-v2__divider">
                <span>o con email</span>
              </div>
            </>
          ) : null}

          <form className="wizard__fields" onSubmit={handleEmailAuth}>
            <label>
              Email
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                required
                type="email"
                value={email}
              />
            </label>
            {mode !== "recover" ? (
              <label>
                Contraseña
                <input
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
            ) : null}
            <button className="pd-button pd-button--primary auth-v2__submit" type="submit">
              {mode === "login"
                ? "Entrar"
                : mode === "register"
                  ? "Crear cuenta"
                  : "Enviar enlace"}
            </button>
          </form>

          {message ? <p className="auth-v2__message">{message}</p> : null}

          <button
            className="auth-v2__link"
            onClick={() => setMode(mode === "recover" ? "login" : "recover")}
            type="button"
          >
            {mode === "recover" ? "Volver al login" : "He olvidado mi contraseña"}
          </button>

          {demoMode ? (
            <Link className="pd-button pd-button--primary" href="/dashboard">
              Entrar en modo demo
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
