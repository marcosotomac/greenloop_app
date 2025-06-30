import React from "react";
import { Tooltip as HeroUITooltip } from "@heroui/react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  placement?: "top" | "bottom" | "left" | "right";
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  color = "default",
  placement = "top",
}) => {
  return (
    <HeroUITooltip
      showArrow
      classNames={{
        base: "py-2 px-4 shadow-lg",
        arrow: "bg-white",
      }}
      color={color}
      content={content}
      placement={placement}
    >
      {children}
    </HeroUITooltip>
  );
};

export default Tooltip;
