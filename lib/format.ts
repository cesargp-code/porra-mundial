const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAYS_SHORT_ES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WEEKDAY_INDEX = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TZ = "Europe/Madrid";

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

type LocalParts = {
  weekday: number;
  year: number;
  month: number; // 0-indexed
  day: number;
  hour: number;
  minute: number;
};

function localParts(utc: Date): LocalParts {
  const map = Object.fromEntries(
    partsFmt.formatToParts(utc).map((p) => [p.type, p.value])
  ) as Record<string, string>;
  const hour = map.hour === "24" ? 0 : Number(map.hour);
  return {
    weekday: WEEKDAY_INDEX.indexOf(map.weekday),
    year: Number(map.year),
    month: Number(map.month) - 1,
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
  };
}

export function dayLabel(utc: Date): string {
  const p = localParts(utc);
  return `${DAYS_ES[p.weekday]} ${p.day} ${MONTHS_ES[p.month]}`;
}

export function timeLabel(utc: Date): string {
  const p = localParts(utc);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

export function compactDateTimeLabel(utc: Date): string {
  const p = localParts(utc);
  const time = `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
  return `${DAYS_SHORT_ES[p.weekday]} ${p.day} ${MONTHS_ES[p.month].toUpperCase()} ${time}`;
}

export function whenLabel(utc: Date): string {
  const p = localParts(utc);
  const time = `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
  return `${DAYS_ES[p.weekday]} ${p.day} ${MONTHS_ES[p.month]} · ${time}`;
}

export function venueLabel(stadium: string | null, city: string | null): string {
  if (stadium && city) return `${stadium} · ${city}`;
  return stadium ?? city ?? "";
}

export function dayKey(utc: Date): string {
  const p = localParts(utc);
  return `${p.year}-${String(p.month + 1).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}
