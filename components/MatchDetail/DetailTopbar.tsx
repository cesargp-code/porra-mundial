import { BackButton } from "@/components/BackButton";

export function DetailTopbar({ when, where }: { when: string; where: string }) {
  return (
    <div className="topbar">
      <BackButton href="/" />
      <div className="topbar__meta">
        <div className="topbar__when">{when}</div>
        {where && <div className="topbar__where">{where}</div>}
      </div>
    </div>
  );
}
