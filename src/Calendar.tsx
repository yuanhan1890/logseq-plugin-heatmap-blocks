import React, { CSSProperties, useMemo } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import dayjs from "dayjs";
import { maxBy, minBy } from "lodash-es";
import { getLongestStreak, useThemeMode } from "./utils";
import { getInterpolatedColor } from "./color";

const NUM_WEEKS = 25;

const attrStyle: CSSProperties = {
  marginLeft: "8px",
  padding: "4px 8px",
  border: "1px dashed #333",
};

type Datum = {
  date: string;
  count: number;
};

export const Calendar = ({
  formattedData,
  title = "Activity Heatmap",
  titleAlign = "center",
  unit = "Time",
  unitPural = "Times",
  colorPalette = [],
  defaultFill,
  showTotalTimes = true,
  showActiveDays = true,
  showPeakDay = true,
  showLongestStreak = true,
}: {
  formattedData: { date: string; count: number }[];
  title?: string;
  titleAlign?: "left" | "center" | "right";
  unit?: string;
  unitPural?: string;
  colorPalette?: string[];
  defaultFill?: string;
  showTotalTimes?: boolean;
  showActiveDays?: boolean;
  showPeakDay?: boolean;
  showLongestStreak?: boolean;
}) => {
  const startDate = dayjs()
    .subtract(NUM_WEEKS, "week")
    .startOf("week")
    .toDate();

  const endDate = useMemo(() => dayjs().endOf("day").toDate(), []);
  const today = dayjs().format("YYYY-MM-DD");
  const themeMode = useThemeMode();

  const data = useMemo(() => {
    const list = formattedData.slice();
    if (list.every((d) => d.date !== today)) {
      list.push({ date: today, count: 0 });
    }
    return list;
  }, [formattedData, today]);

  const showSummary = useMemo(() => {
    return showTotalTimes || showActiveDays || showPeakDay || showLongestStreak;
  }, [showTotalTimes, showActiveDays, showPeakDay, showLongestStreak]);

  const summary = useMemo(() => {
    if (!showSummary) return null;
    let totalCount = 0;
    let activeDays = 0;
    let maxCount = 0;
    let longestStreak = 0;

    const startStr = dayjs(startDate).format("YYYY-MM-DD");

    let minCount = Infinity;
    formattedData.forEach((d) => {
      if (d.date >= startStr && d.date <= today) {
        totalCount += d.count;
        if (d.count > 0) activeDays++;
        if (d.count > maxCount) maxCount = d.count;
        if (d.count < minCount) minCount = d.count;
      }
    });

    longestStreak = getLongestStreak(formattedData);

    return {
      totalCount,
      activeDays,
      maxCount,
      longestStreak,
      minCount,
    };
  }, [formattedData, startDate, today, showSummary]);

  const containerWidth = "100%";
  return (
    <div className="heatmap-root" style={{ width: containerWidth }}>
      <div className={`p-4 ${themeMode}`} style={{ fontFamily: "sans-serif" }}>
        {title && (
          <div
            className="heatmap-title"
            style={{
              marginBottom: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: titleAlign,
            }}
          >
            {title}
          </div>
        )}

        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={data}
          showOutOfRangeDays
          classForValue={(value: Datum) => {
            let classes: string[] = [];
            let level = 0;
            if (value?.count > 0 && summary && summary?.maxCount > 0) {
              level = Math.floor((value?.count / summary.maxCount) * 5);
            }
            classes.push(`color-github-${level}`);
            if (today === value?.date) {
              classes.push("today");
            }
            return classes.join(" ");
          }}
          gutterSize={4}
          transformDayElement={(element, value: Datum, index) => {
            const count = value?.count ?? 0;
            const dateStr = value?.date
              ? dayjs(value.date).format("YYYY-MM-DD")
              : "";

            let customFill: string = "";
            if (count === 0 && defaultFill) {
              customFill = defaultFill;
            }
            if (count > 0 && !customFill && summary && summary.maxCount != 0) {
              customFill = getInterpolatedColor(
                colorPalette,
                defaultFill || "#eeeeee",
                count,
                summary.maxCount,
              );
            }

            return React.cloneElement(element, {
              rx: 3,
              title: dateStr ? `${dateStr} : ${count} times` : "No data",
              ...(customFill
                ? { style: { ...element.props.style, fill: customFill } }
                : {}),
            });
          }}
        />

        {showSummary && summary && (
          <div
            className="heatmap-summary"
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#666",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>In Last {NUM_WEEKS} Weeks -</span>
            {showTotalTimes && (
              <span style={attrStyle}>
                Total <strong>{summary.totalCount}</strong>{" "}
                {summary.totalCount > 1 ? unitPural : unit}
              </span>
            )}
            {showActiveDays && (
              <span style={attrStyle}>
                Active: <strong>{summary.activeDays}</strong> Day
                {summary.activeDays > 1 ? "s" : ""}
              </span>
            )}
            {showPeakDay && (
              <span style={attrStyle}>
                Peak Day: <strong>{summary.maxCount}</strong>{" "}
                {summary.maxCount > 1 ? unitPural : unit}
              </span>
            )}
            {showLongestStreak && (
              <span style={attrStyle}>
                Longest Period: <strong>{summary.longestStreak}</strong> Day
                {summary.longestStreak > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
