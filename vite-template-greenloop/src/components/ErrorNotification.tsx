import React from "react";
import { Button, Card, CardBody } from "@nextui-org/react";
import { Icon } from "@iconify/react";

interface ErrorNotificationProps {
  error: string;
  onClear: () => void;
  onRetry?: () => void;
  type?: "error" | "warning" | "info";
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onClear,
  onRetry,
  type = "error",
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case "warning":
        return {
          icon: "mdi:alert",
          color: "warning",
          bgColor: "bg-warning-50 dark:bg-warning-900/20",
          borderColor: "border-warning-200 dark:border-warning-800",
          textColor: "text-warning-800 dark:text-warning-200",
        };
      case "info":
        return {
          icon: "mdi:information",
          color: "primary",
          bgColor: "bg-primary-50 dark:bg-primary-900/20",
          borderColor: "border-primary-200 dark:border-primary-800",
          textColor: "text-primary-800 dark:text-primary-200",
        };
      default:
        return {
          icon: "mdi:alert-circle",
          color: "danger",
          bgColor: "bg-danger-50 dark:bg-danger-900/20",
          borderColor: "border-danger-200 dark:border-danger-800",
          textColor: "text-danger-800 dark:text-danger-200",
        };
    }
  };

  const { icon, color, bgColor, borderColor, textColor } = getIconAndColor();

  return (
    <Card className={`${bgColor} ${borderColor} border`}>
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <Icon
            className={`text-xl ${textColor} flex-shrink-0 mt-0.5`}
            icon={icon}
          />
          <div className="flex-1">
            <p className={`${textColor} text-sm font-medium`}>{error}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {onRetry && (
              <Button
                color={color as any}
                size="sm"
                variant="flat"
                onPress={onRetry}
              >
                Reintentar
              </Button>
            )}
            <Button
              isIconOnly
              color={color as any}
              size="sm"
              variant="light"
              onPress={onClear}
            >
              <Icon icon="mdi:close" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ErrorNotification;
