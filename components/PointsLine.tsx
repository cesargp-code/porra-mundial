export function PointsLine({
  value,
  provisional,
  played = false,
}: {
  value: number | null;
  provisional?: boolean;
  played?: boolean;
}) {
  if (value === null) {
    return (
      <span className="points">
        <span className="points__lbl">{played ? "Pendiente" : "No jugaste"}</span>
      </span>
    );
  }
  return (
    <span className="points">
      <strong>{value > 0 ? `+${value}` : value}</strong>
      <span className="points__lbl">{provisional ? "pts" : "pts"}</span>
    </span>
  );
}
