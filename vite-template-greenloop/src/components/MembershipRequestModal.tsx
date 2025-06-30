import React, { useState } from "react";
import { NotificationResponseDto } from "@/services/notificationService";

interface MembershipRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationResponseDto;
  onResponse: (
    requestId: number,
    approved: boolean,
    responseMessage?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const MembershipRequestModal: React.FC<MembershipRequestModalProps> = ({
  isOpen,
  onClose,
  notification,
  onResponse,
}) => {
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !notification.referenceId) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const result = await onResponse(
        notification.referenceId!,
        true,
        responseMessage
      );
      if (result.success) {
        onClose();
        setResponseMessage("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const result = await onResponse(
        notification.referenceId!,
        false,
        responseMessage
      );
      if (result.success) {
        onClose();
        setResponseMessage("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Responder Solicitud de Membresía
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">
            {notification.title}
          </h4>
          <p className="text-gray-700 text-sm">{notification.message}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje de respuesta (opcional)
          </label>
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Escribe un mensaje para el solicitante..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Procesando..." : "Aprobar"}
          </button>
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Procesando..." : "Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
};
