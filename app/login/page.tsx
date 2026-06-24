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

  const demoMode = !hasSupabaseEnv();

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "register") setMode("register");
  }, []);

  async function signInWithProvider(provider: "google" | "apple") {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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

    window.location.href = "/dashboard";
  }

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <div className="auth-showcase">
          <Link href="/" aria-label="Volver a Recorderys">
            <Brand />
          </Link>
          <span className="chip chip-yellow">Tu espacio privado</span>
          <h1>{mode === "login" ? "Todo donde lo dejaste." : "Tu primera compra, siempre localizada."}</h1>
          <p>
            Tickets, garantías y devoluciones importantes, disponibles cuando
            de verdad los necesitas.
          </p>

          <div className="auth-proof">
            <span>Ticket localizado</span>
            <span>Garantía vigente</span>
            <span>Todo privado</span>
          </div>
        </div>

        <section className="card auth-card auth-card--elevated">
          <div>
            <span className="chip chip-blue">
              {mode === "login"
                ? "Bienvenido"
                : mode === "register"
                  ? "Nueva cuenta"
                  : "Recuperación"}
            </span>
            <h2>
              {mode === "login"
                ? "Accede a tu espacio"
                : mode === "register"
                  ? "Empieza a guardar compras"
                  : "Recupera tu contraseña"}
            </h2>
            <p className="muted">
              {mode === "recover"
                ? "Introduce tu email y te enviaremos un enlace para crear una nueva contraseña."
                : "Usa Google, Apple o crea tu acceso con email y contraseña."}
            </p>
            {demoMode ? (
              <p className="auth-message">
                Modo demo activo. Puedes navegar la interfaz sin conectar todavía
                Supabase.
              </p>
            ) : null}
          </div>

          <div className="auth-card__providers">
            <button
              className="button button-secondary"
              onClick={() => signInWithProvider("google")}
              type="button"
            >
              Continuar con Google
            </button>
            <button
              className="button button-secondary"
              onClick={() => signInWithProvider("apple")}
              type="button"
            >
              Continuar con Apple
            </button>
          </div>

          <div className="auth-divider">
            <span>o continúa con email</span>
          </div>

          <form className="auth-form" onSubmit={handleEmailAuth}>
            <label>
              Email
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
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
            <button className="button button-primary" type="submit">
              {mode === "login"
                ? "Entrar con email"
                : mode === "register"
                  ? "Registrarme"
                  : "Enviar enlace"}
            </button>
          </form>

          {message ? <p className="auth-message">{message}</p> : null}

          <div className="auth-actions">
            <button
              className="auth-switch"
              onClick={() =>
                setMode(
                  mode === "login" ? "register" : "login",
                )
              }
              type="button"
            >
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate"
                : "Ya tengo cuenta"}
            </button>
            <button
              className="auth-switch"
              onClick={() => setMode(mode === "recover" ? "login" : "recover")}
              type="button"
            >
              {mode === "recover" ? "Volver al login" : "He olvidado mi contraseña"}
            </button>
          </div>
          {demoMode ? (
            <Link className="button button-primary" href="/dashboard">
              Entrar en modo demo
            </Link>
          ) : null}
        </section>
      </section>
    </main>
  );
}
