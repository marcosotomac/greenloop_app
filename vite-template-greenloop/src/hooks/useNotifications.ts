import { useState, useCallback } from "react";

import { NotificationMessage } from "../components/NotificationToast";
import { getDonationErrorMessage } from "../utils/donationErrorHandler";

interface UseNotificationsReturn {
  notifications: NotificationMessage[];
  addNotification: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const addNotification = useCallback(
    (
      type: "success" | "error" | "warning" | "info",
      title: string,
      message: string,
      duration: number = 5000
    ) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newNotification: NotificationMessage = {
        id,
        type,
        title,
        message,
        duration,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

// Helper functions for common notification types
export const createSuccessNotification = (
  addNotification: UseNotificationsReturn["addNotification"],
  title: string,
  message: string
) => {
  addNotification("success", title, message);
};

export const createErrorNotification = (
  addNotification: UseNotificationsReturn["addNotification"],
  title: string,
  message: string,
  duration?: number
) => {
  addNotification("error", title, message, duration);
};

export const createWarningNotification = (
  addNotification: UseNotificationsReturn["addNotification"],
  title: string,
  message: string
) => {
  addNotification("warning", title, message);
};

export const createInfoNotification = (
  addNotification: UseNotificationsReturn["addNotification"],
  title: string,
  message: string
) => {
  addNotification("info", title, message);
};

// Helper to extract error messages from different error types
export const getErrorMessage = (error: any): string => {
  // Use the specialized donation error handler first
  try {
    return getDonationErrorMessage(error);
  } catch {
    // Fallback to generic error handling
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    if (error?.message) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }

    return "Ha ocurrido un error inesperado";
  }
};
