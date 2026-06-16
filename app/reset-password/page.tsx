"use client";

import { useState } from "react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    const supabase = createClient();
    const response = await supabase.auth.updateUser({ password });

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    setMessage("Contraseña actualizada. Ya puedes volver a entrar.");
    window.location.href = "/login";
  }

  return (
    <main className="auth-page">
      <section className="card auth-card auth-card--elevated">
        <Brand />
        <div>
          <span className="chip chip-blue">Nueva contraseña</span>
          <h2>Restablece tu acceso</h2>
          <p className="muted">
            Elige una contraseña nueva para volver a entrar en RECORDERYS.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nueva contraseña
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <label>
            Repite la contraseña
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          <button className="button button-primary" type="submit">
            Guardar nueva contraseña
          </button>
        </form>

        {message ? <p className="auth-message">{message}</p> : null}
      </section>
    </main>
  );
}
