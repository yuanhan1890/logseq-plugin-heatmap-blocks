import React, { CSSProperties, useState } from "react";
import { Tooltip, type IPosition, type PlacesType } from "react-tooltip";

const wrapperStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 0",
};

const buttonStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid var(--ls-border-color, #d0d7de)",
  borderRadius: "6px",
  background: "var(--ls-primary-background-color, #fff)",
  color: "var(--ls-primary-text-color, #24292f)",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: 1,
  padding: "8px 12px",
};

type TooltipButtonProps = {
  label?: string;
  tooltip?: string;
  tooltipId: string;
  place?: PlacesType;
};

export const TooltipButton = ({
  label = "Hover me",
  tooltip = "This tooltip is rendered by react-tooltip.",
  tooltipId,
  place = "top",
}: TooltipButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<IPosition | undefined>();
  const [clicks, setClicks] = useState(0);

  const updatePosition = (target: HTMLButtonElement) => {
    const rect = target.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <span style={wrapperStyle}>
      <button
        type="button"
        style={buttonStyle}
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltip}
        onClick={() => setClicks((count) => count + 1)}
        onFocus={(event) => {
          updatePosition(event.currentTarget);
          setIsOpen(true);
        }}
        onBlur={() => setIsOpen(false)}
        onMouseEnter={(event) => {
          updatePosition(event.currentTarget);
          setIsOpen(true);
        }}
        onMouseMove={(event) => updatePosition(event.currentTarget)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {clicks > 0 ? `${label} (${clicks})` : label}
      </button>

      <Tooltip
        id={tooltipId}
        content={tooltip}
        isOpen={isOpen}
        position={position}
        place={place}
        positionStrategy="fixed"
        disableStyleInjection
      />
    </span>
  );
};
