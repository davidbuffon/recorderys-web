export function getMessageStatusLabel(status: string) {
  if (status === "closed") {
    return "Respondido";
  }

  if (status === "in_progress") {
    return "En revisión";
  }

  return "Abierto";
}
