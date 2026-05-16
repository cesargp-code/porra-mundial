export function PointsLine({
  value,
  provisional,
}: {
  value: number | null;
  provisional?: boolean;
}) {
  if (value === null) {
    return (
      <span className="points">
        <span className="points__lbl">No jugaste</span>
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
