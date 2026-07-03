"use client";

import { useState } from "react";

type ChangePasswordProps = {
  action: (formData: FormData) => void;
  pwOk: boolean;
  pwError: boolean;
};

type DeleteAccountProps = {
  action: () => void;
};

export function ChangePasswordSection({ action, pwOk, pwError }: ChangePasswordProps) {
  const [open, setOpen] = useState(pwOk || pwError);

  if (!open) {
    return (
      <button
        className="button button-secondary"
        onClick={() => setOpen(true)}
        style={{ width: "100%" }}
        type="button"
      >
        Cambiar contraseña
      </button>
    );
  }

  return (
    <section className="card form-card" style={{ maxWidth: "100%" }}>
      <div>
        <span className="chip chip-blue">Seguridad</span>
        <h2>Cambiar contraseña</h2>
        <p className="muted">Elige una contraseña nueva de al menos 8 caracteres.</p>
      </div>
      {pwOk && (
        <p className="auth-message" style={{ color: "green" }}>
          Contraseña actualizada correctamente.
        </p>
      )}
      {pwError && (
        <p className="auth-message" style={{ color: "#c0392b" }}>
          Error al actualizar. Comprueba que ambas contraseñas coinciden y tienen al menos 8 caracteres.
        </p>
      )}
      <form action={action} className="item-form">
        <label>
          Nueva contraseña
          <input autoComplete="new-password" minLength={8} name="new_password" required type="password" />
        </label>
        <label>
          Confirmar contraseña
          <input autoComplete="new-password" minLength={8} name="confirm_password" required type="password" />
        </label>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="button button-primary" type="submit">Actualizar contraseña</button>
          <button className="button button-secondary" onClick={() => setOpen(false)} type="button">Cancelar</button>
        </div>
      </form>
    </section>
  );
}

export function DeleteAccountSection({ action }: DeleteAccountProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        className="button button-signout"
        onClick={() => setOpen(true)}
        style={{ width: "100%" }}
        type="button"
      >
        Eliminar mi cuenta
      </button>
    );
  }

  return (
    <section className="card form-card danger-zone" style={{ maxWidth: "100%" }}>
      <div>
        <span className="chip chip-red">Zona de peligro</span>
        <h2>Eliminar cuenta</h2>
        <p className="muted">
          Esta acción borra tu cuenta y todos tus datos de forma permanente e irreversible. No podrás recuperarlos.
        </p>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>
        ¿Seguro? Se eliminarán tu cuenta, artículos, tickets y todos tus datos almacenados.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <form action={action}>
          <button className="button button-danger" type="submit">Sí, eliminar definitivamente</button>
        </form>
        <button className="button button-secondary" onClick={() => setOpen(false)} type="button">Cancelar</button>
      </div>
    </section>
  );
}
