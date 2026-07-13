"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type SettingsV2Props = {
  changePasswordAction: (formData: FormData) => void;
  deleteAccountAction: () => void;
  email: string;
  name: string;
  phone: string;
  address: string;
  pwError: boolean;
  pwOk: boolean;
  updateProfileAction: (formData: FormData) => void;
};

const NOTIF_KEY = "recorderys_notifications";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className={`theme-toggle ${checked ? "theme-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span className="theme-toggle__knob" />
    </button>
  );
}

export function SettingsV2({
  changePasswordAction,
  deleteAccountAction,
  email,
  name,
  phone,
  address,
  pwError,
  pwOk,
  updateProfileAction,
}: SettingsV2Props) {
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(pwOk || pwError);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notifReturn, setNotifReturn] = useState(true);
  const [notifWarranty, setNotifWarranty] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifReturn(parsed.return !== false);
        setNotifWarranty(parsed.warranty !== false);
      }
    } catch {
      // valores por defecto
    }
  }, []);

  function saveNotif(returnOn: boolean, warrantyOn: boolean) {
    setNotifReturn(returnOn);
    setNotifWarranty(warrantyOn);
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ return: returnOn, warranty: warrantyOn }));
    } catch {
      // sin persistencia
    }
  }

  const initials =
    (name || email)
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "R";

  return (
    <div className="settings">
      <h1>Ajustes</h1>

      {/* Perfil */}
      <section className="card-v2 settings__block">
        <div className="settings__profile">
          <span className="settings__avatar" aria-hidden="true">{initials}</span>
          <div className="settings__identity">
            <strong>{name || "Tu perfil"}</strong>
            <small>{email}</small>
          </div>
          <button
            className="pd-button pd-button--secondary settings__edit"
            onClick={() => setEditing(!editing)}
            type="button"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
        </div>

        {editing ? (
          <form action={updateProfileAction} className="wizard__fields settings__form">
            <label>
              Nombre
              <input autoComplete="name" defaultValue={name} name="name" placeholder="Tu nombre" />
            </label>
            <label>
              Teléfono
              <input
                autoComplete="tel"
                defaultValue={phone}
                inputMode="tel"
                name="phone"
                placeholder="+34 600 000 000"
                type="tel"
              />
            </label>
            <label>
              Dirección (opcional)
              <textarea
                autoComplete="street-address"
                defaultValue={address}
                name="address"
                placeholder="Tu dirección"
                rows={2}
              />
            </label>
            <div className="wizard__nav">
              <button className="pd-button pd-button--primary" type="submit">
                Guardar cambios
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {/* Notificaciones */}
      <section className="card-v2 settings__block">
        <h2>Notificaciones</h2>
        <div className="settings__row">
          <div>
            <strong>Avisos de devolución</strong>
            <small>Te avisamos antes de que acabe el plazo de devolución.</small>
          </div>
          <Toggle checked={notifReturn} onChange={(v) => saveNotif(v, notifWarranty)} />
        </div>
        <div className="settings__row">
          <div>
            <strong>Avisos de garantía</strong>
            <small>Te avisamos cuando una garantía esté a punto de vencer.</small>
          </div>
          <Toggle checked={notifWarranty} onChange={(v) => saveNotif(notifReturn, v)} />
        </div>
      </section>

      {/* Apariencia */}
      <section className="card-v2 settings__block">
        <h2>Apariencia</h2>
        <div className="settings__row">
          <div>
            <strong>Modo oscuro</strong>
            <small>Cambia entre tema claro y oscuro.</small>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Seguridad */}
      <section className="card-v2 settings__block">
        <h2>Seguridad</h2>
        {!showPassword ? (
          <button
            className="pd-button pd-button--secondary"
            onClick={() => setShowPassword(true)}
            type="button"
          >
            Cambiar contraseña
          </button>
        ) : (
          <>
            {pwOk && <p className="settings__msg settings__msg--ok">Contraseña actualizada correctamente.</p>}
            {pwError && (
              <p className="settings__msg settings__msg--error">
                Error al actualizar. Comprueba que ambas contraseñas coinciden y tienen al menos 8 caracteres.
              </p>
            )}
            <form action={changePasswordAction} className="wizard__fields">
              <label>
                Nueva contraseña
                <input autoComplete="new-password" minLength={8} name="new_password" required type="password" />
              </label>
              <label>
                Confirmar contraseña
                <input autoComplete="new-password" minLength={8} name="confirm_password" required type="password" />
              </label>
              <div className="wizard__nav">
                <button
                  className="pd-button pd-button--secondary"
                  onClick={() => setShowPassword(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button className="pd-button pd-button--primary" type="submit">
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      {/* Soporte y ayuda */}
      <section className="card-v2 settings__block">
        <div className="settings__row">
          <div>
            <strong>¿Necesitas ayuda?</strong>
            <small>Escríbenos y te respondemos lo antes posible.</small>
          </div>
          <a className="pd-button pd-button--secondary settings__edit" href="/messages">
            Soporte
          </a>
        </div>
        <div className="settings__row">
          <div>
            <strong>Cómo funciona Recorderys</strong>
            <small>Vuelve a la página de inicio para resolver dudas.</small>
          </div>
          <a className="pd-button pd-button--secondary settings__edit" href="/">
            Ver
          </a>
        </div>
      </section>

      {/* Sesión y cuenta */}
      <section className="card-v2 settings__block">
        <form action="/auth/signout" method="post">
          <button className="settings__logout" type="submit">
            Cerrar sesión
          </button>
        </form>

        {!confirmDelete ? (
          <button
            className="settings__delete-link"
            onClick={() => setConfirmDelete(true)}
            type="button"
          >
            Eliminar mi cuenta
          </button>
        ) : (
          <div className="settings__delete-confirm">
            <p>
              Esta acción borra tu cuenta, artículos, tickets y todos tus datos de
              forma permanente e irreversible.
            </p>
            <div className="wizard__nav">
              <button
                className="pd-button pd-button--secondary"
                onClick={() => setConfirmDelete(false)}
                type="button"
              >
                Cancelar
              </button>
              <form action={deleteAccountAction}>
                <button className="pd-button settings__delete-btn" type="submit">
                  Sí, eliminar definitivamente
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
