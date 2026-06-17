import React, { CSSProperties, useEffect, useMemo, useRef } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import dayjs from "dayjs";
import { Tooltip, type TooltipRefProps } from "react-tooltip";
import { getLongestStreak, useThemeMode } from "./utils";
import { getInterpolatedColor } from "./color";
import { useMemoizedFn } from "ahooks";

const attrStyle: CSSProperties = {
  marginRight: "8px",
  padding: "4px 8px",
  border: "1px dashed #333",
};

type Datum = {
  date: string;
  count: number;
};

const NUM_WEEKS = 25;
const DEFAULT_TOOLTIP_TEMPLATE = "{date}: {count} times";
const DEFAULT_TOOLTIP_FALLBACK = "无记录";

function renderTooltipTemplate(
  template: string,
  data: { date: string; count: number },
) {
  return template.replace(/\{(date|count)\}/g, (_, key: "date" | "count") =>
    String(data[key]),
  );
}

function findChildNode(
  nodes: NodeListOf<ChildNode>,
  predicate: (node: ChildNode) => boolean,
) {
  for (const child of nodes) {
    if (predicate(child)) {
      return child;
    }
  }
  return null;
}

function mouseInsideRect(
  event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  box: DOMRect,
) {
  const x = event.clientX;
  const y = event.clientY;
  return (
    event.clientX >= box.left &&
    event.clientX <= box.right &&
    event.clientY >= box.top &&
    event.clientY <= box.bottom
  );
}

function findHoveredDay(
  event: React.MouseEvent<HTMLDivElement, MouseEvent>,
): SVGRectElement | undefined {
  const containerEl = event.target as HTMLElement;
  const svg = findChildNode(
    containerEl.childNodes,
    (c) => (c as SVGSVGElement).tagName === "svg",
  );
  if (!svg) {
    return;
  }
  const svgWin = svg.ownerDocument?.defaultView || window;

  const weeksEl = findChildNode((svg as SVGSVGElement).childNodes, (c) => {
    return (
      c instanceof svgWin.SVGElement &&
      c.classList.contains("react-calendar-heatmap-all-weeks")
    );
  });

  if (
    !weeksEl ||
    !mouseInsideRect(event, (weeksEl as SVGElement).getBoundingClientRect())
  ) {
    return;
  }

  for (const weekEl of weeksEl.childNodes) {
    if (
      weekEl instanceof svgWin.SVGGElement &&
      mouseInsideRect(event, weekEl.getBoundingClientRect())
    ) {
      for (const dayEl of weekEl.childNodes) {
        if (
          dayEl instanceof svgWin.SVGRectElement &&
          mouseInsideRect(event, dayEl.getBoundingClientRect())
        ) {
          return dayEl;
        }
      }
      return;
    }
  }
}

export const Calendar = ({
  formattedData,
  startDate: _startDate,
  endDate: _endDate,
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
  enableTooltip = true,
  tooltipContentTemplate,
  tooltipTemplate,
  tooltipFallback = DEFAULT_TOOLTIP_FALLBACK,
  tooltipFallbackContent,
}: {
  formattedData: { date: string; count: number }[];
  startDate?: string;
  endDate?: string;
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
  enableTooltip?: boolean;
  tooltipContentTemplate?: string;
  tooltipTemplate?: string;
  tooltipFallback?: string;
  tooltipFallbackContent?: string;
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<TooltipRefProps>(null);
  const activeTooltipTargetRef = useRef<SVGRectElement | null>(null);

  const startDateDayjs = _startDate
    ? dayjs(_startDate, "YYYY-MM-DD")
    : dayjs().subtract(NUM_WEEKS, "week").startOf("week");

  const endDateDayjs = _endDate
    ? dayjs(_endDate, "YYYY-MM-DD")
    : dayjs().endOf("day");

  const duration = endDateDayjs.diff(startDateDayjs, "days");
  const startDate = startDateDayjs.toDate();
  const endDate = endDateDayjs.toDate();

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

  const tooltipTemplateString =
    tooltipContentTemplate || tooltipTemplate || DEFAULT_TOOLTIP_TEMPLATE;
  const tooltipFallbackString = tooltipFallbackContent || tooltipFallback;
  const tooltipId = useMemo(
    () => `heatmap-day-tooltip-${Math.random().toString(36).slice(2)}`,
    [],
  );

  const getTooltipContent = (value: Datum | null) => {
    const count = value?.count ?? 0;
    const dateStr = value?.date ? dayjs(value.date).format("YYYY-MM-DD") : "";
    return dateStr && count > 0
      ? renderTooltipTemplate(tooltipTemplateString, {
          date: dateStr,
          count,
        })
      : tooltipFallbackString;
  };

  const openTooltip = useMemoizedFn((target: SVGRectElement) => {
    const content = target.getAttribute("data-heatmap-tooltip");
    if (!content) return;

    const rect = target.getBoundingClientRect();
    activeTooltipTargetRef.current = target;
    tooltipRef.current?.open({
      content,
      place: "top",
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    });
  });

  const closeTooltip = useMemoizedFn(() => {
    activeTooltipTargetRef.current = null;
    tooltipRef.current?.close();
  });

  const containerWidth = "100%";
  return (
    <div
      className="heatmap-root"
      ref={rootRef}
      style={{ width: containerWidth }}
      onMouseMove={(event) => {
        if (enableTooltip) {
          const dayEl = findHoveredDay(event);

          if (!dayEl) {
            if (activeTooltipTargetRef.current) closeTooltip();
            return;
          }

          openTooltip(dayEl);
        }
      }}
    >
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
          titleForValue={
            enableTooltip
              ? (value: Datum | null) => getTooltipContent(value)
              : undefined
          }
          tooltipDataAttrs={
            enableTooltip
              ? (value: Datum | null) => {
                  const content = getTooltipContent(value);
                  return {
                    "data-heatmap-tooltip": content,
                    "data-tooltip-id": tooltipId,
                    "data-tooltip-content": content,
                  };
                }
              : undefined
          }
          classForValue={(value: Datum) => {
            let classes: string[] = [];
            let level = 0;
            if (value?.count > 0 && summary && summary?.maxCount > 0) {
              level = Math.ceil((value?.count / summary.maxCount) * 4);
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
              ...(customFill
                ? { style: { ...element.props.style, fill: customFill } }
                : {}),
            });
          }}
        />

        {enableTooltip && (
          <Tooltip
            ref={tooltipRef}
            id={tooltipId}
            place="top"
            positionStrategy="fixed"
            disableStyleInjection
          />
        )}

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
