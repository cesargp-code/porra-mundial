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
        <strong>—</strong>
        <span className="points__lbl">{provisional ? "pts prov." : "pts"}</span>
      </span>
    );
  }
  return (
    <span className="points">
      <strong>{value > 0 ? `+${value}` : value}</strong>
      <span className="points__lbl">{provisional ? "pts prov." : "pts"}</span>
    </span>
  );
}
