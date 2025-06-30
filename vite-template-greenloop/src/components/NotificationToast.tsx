import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export interface NotificationMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

interface NotificationToastProps {
  notifications: NotificationMessage[];
  onRemove: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onRemove,
}) => {
  const getIcon = (type: NotificationMessage["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = (type: NotificationMessage["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  const getTitleColor = (type: NotificationMessage["type"]) => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      case "info":
        return "text-blue-800 dark:text-blue-200";
      default:
        return "text-blue-800 dark:text-blue-200";
    }
  };

  const getMessageColor = (type: NotificationMessage["type"]) => {
    switch (type) {
      case "success":
        return "text-green-700 dark:text-green-300";
      case "error":
        return "text-red-700 dark:text-red-300";
      case "warning":
        return "text-yellow-700 dark:text-yellow-300";
      case "info":
        return "text-blue-700 dark:text-blue-300";
      default:
        return "text-blue-700 dark:text-blue-300";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.2 },
              x: 300,
            }}
            initial={{ opacity: 0, scale: 0.3, x: 300 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={`w-96 max-w-sm p-4 rounded-lg border shadow-lg backdrop-blur-sm ${getBackgroundColor(
              notification.type
            )}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">{getIcon(notification.type)}</div>
              <div className="ml-3 w-0 flex-1">
                <p
                  className={`text-sm font-medium ${getTitleColor(notification.type)}`}
                >
                  {notification.title}
                </p>
                <p
                  className={`mt-1 text-sm ${getMessageColor(notification.type)}`}
                >
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:hover:text-gray-200"
                  onClick={() => onRemove(notification.id)}
                >
                  <span className="sr-only">Cerrar</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
