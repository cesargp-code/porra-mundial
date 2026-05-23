export function DayHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="day-head">
      <div className="day-head__title">{label}</div>
      {count !== undefined && (
        <div className="day-head__count">
          {count} {count === 1 ? "partido" : "partidos"}
        </div>
      )}
    </div>
  );
}
