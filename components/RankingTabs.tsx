import type { ReactNode } from "react";

import { SegmentedTabs } from "./SegmentedTabs";

type Props = {
  userName: string;
  rankingContent: ReactNode;
  userContent: ReactNode;
  defaultTab?: "ranking" | "user";
};

export function RankingTabs({
  userName,
  rankingContent,
  userContent,
  defaultTab = "user",
}: Props) {
  return (
    <SegmentedTabs
      ariaLabel="Vista"
      leftLabel="Clasificación"
      rightLabel={userName}
      defaultTab={defaultTab === "ranking" ? "left" : "right"}
      leftContent={rankingContent}
      rightContent={userContent}
    />
  );
}
