export function GroupPressure({
  ready,
  total,
  missingYou,
  prediction,
}: {
  ready: number;
  total: number;
  missingYou?: boolean;
  prediction?: { home: number; away: number } | null;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((ready / total) * 100)) : 0;
  return (
    <div className={`pressure ${missingYou ? "pressure--missing" : ""}`}>
      <div className="pressure__bar">
        <div className="pressure__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="pressure__txt">
        <strong>{ready}</strong>/{total} {missingYou ? "ya jugaron · faltas tú" : "ya jugaron"}
        {prediction ? (
          <>
            {" · "}
            <strong>
              {prediction.home} - {prediction.away}
            </strong>
          </>
        ) : null}
      </div>
    </div>
  );
}
