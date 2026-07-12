export type ItemStatus =
  | { kind: "return"; daysLeft: number; urgent: boolean }
  | { kind: "warranty"; until: string }
  | { kind: "expired" }
  | { kind: "saved" };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Estado calculado de una compra (prioridad según handoff v2):
 * devolución activa > garantía vigente > garantía vencida > ticket guardado.
 * Devolución con ≤5 días restantes se marca como urgente (banner de atención).
 */
export function getItemStatus(item: {
  return_until?: string | null;
  warranty_until?: string | null;
  warranty_until_manual?: string | null;
}): ItemStatus {
  const today = startOfDay(new Date());
  const returnUntil = parseDate(item.return_until);
  const warrantyUntil = parseDate(item.warranty_until_manual ?? item.warranty_until);

  if (returnUntil && returnUntil >= today) {
    const daysLeft = Math.round((returnUntil.getTime() - today.getTime()) / DAY_MS);
    return { kind: "return", daysLeft, urgent: daysLeft <= 5 };
  }

  if (warrantyUntil && warrantyUntil >= today) {
    return { kind: "warranty", until: warrantyUntil.toISOString().slice(0, 10) };
  }

  if (warrantyUntil) {
    return { kind: "expired" };
  }

  return { kind: "saved" };
}

export function statusBadgeClass(status: ItemStatus): string {
  return `status-badge status-badge--${status.kind}`;
}

export function statusLabel(status: ItemStatus): string {
  switch (status.kind) {
    case "return":
      return status.daysLeft === 0
        ? "Devolución: hoy"
        : `Devolución: ${status.daysLeft} día${status.daysLeft === 1 ? "" : "s"}`;
    case "warranty":
      return `Garantía hasta ${new Date(status.until).getFullYear()}`;
    case "expired":
      return "Garantía vencida";
    case "saved":
      return "Ticket guardado";
  }
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : startOfDay(d);
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
