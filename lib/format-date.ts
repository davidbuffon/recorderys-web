export function formatShortDate(date: string | null | undefined) {
  if (!date) return "Sin definir";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Sin definir";
  }

  const day = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);

  const month = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    timeZone: "UTC",
  })
    .format(parsed)
    .replace(".", "")
    .toUpperCase();

  const year = new Intl.DateTimeFormat("es-ES", {
    year: "2-digit",
    timeZone: "UTC",
  }).format(parsed);

  return `${day} ${month}'${year}`;
}
