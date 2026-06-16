import React from "react";
import dayjs from "dayjs";
import { useMountedState } from "react-use";

export const triggerIconName = "logseq-heatmap-trigger-icon";

export const useThemeMode = () => {
  const isMounted = useMountedState();
  const [mode, setMode] = React.useState<"dark" | "light">("light");
  React.useEffect(() => {
    setMode(
      (top?.document
        .querySelector("html")
        ?.getAttribute("data-theme") as typeof mode) ??
        (matchMedia("prefers-color-scheme: dark").matches ? "dark" : "light"),
    );
    logseq.App.onThemeModeChanged((s) => {
      if (isMounted()) {
        setMode(s.mode);
      }
    });
  }, [isMounted]);

  return mode;
};

export const getLongestStreak = (
  formattedData: { date: string; count: number }[],
): number => {
  const activeDates = formattedData
    .filter((item) => item.count > 0)
    .map((item) => dayjs(item.date).format("YYYY-MM-DD"));

  const uniqueSortedDates = Array.from(new Set(activeDates)).sort((a, b) =>
    dayjs(a).isBefore(dayjs(b)) ? -1 : 1,
  );

  if (uniqueSortedDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const prevDate = dayjs(uniqueSortedDates[i - 1]);
    const currDate = dayjs(uniqueSortedDates[i]);

    if (currDate.diff(prevDate, "day") === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(maxStreak, currentStreak);
};
