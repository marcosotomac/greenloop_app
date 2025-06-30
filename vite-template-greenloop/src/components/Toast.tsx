import React, { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

import { useTheme } from "@/contexts/ThemeContext";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
          theme === "dark"
            ? "bg-green-900 text-white"
            : "bg-green-50 text-green-900"
        }`}
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        <span className="mr-4">{message}</span>
        <button
          className={`p-1 rounded-full hover:bg-opacity-20 ${
            theme === "dark"
              ? "hover:bg-white text-white"
              : "hover:bg-green-900 text-green-900"
          }`}
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
