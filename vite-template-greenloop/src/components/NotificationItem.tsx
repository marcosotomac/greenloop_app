import React from "react";
import {
  NotificationResponseDto,
  NotificationType,
  notificationService,
} from "@/services/notificationService";

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onAction?: (notification: NotificationResponseDto) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}) => {
  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  const handleAction = () => {
    if (onAction) {
      onAction(notification);
    }
  };

  const typeColor = notificationService.getNotificationColor(notification.type);
  const icon = notificationService.getNotificationIcon(notification.type);
  const formattedDate = notificationService.formatDate(notification.createdAt);

  return (
    <div
      className={`border-l-4 p-4 mb-4 bg-white shadow-sm rounded-lg transition-all duration-200 hover:shadow-md ${
        notification.isRead
          ? "border-gray-300 opacity-80"
          : "border-green-500 shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Icono y badge de tipo */}
          <div className="flex-shrink-0 mt-1">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}
            >
              <span className="mr-1">{icon}</span>
              {notification.type.replace("_", " ")}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4
                className={`text-sm font-medium ${
                  notification.isRead ? "text-gray-700" : "text-gray-900"
                }`}
              >
                {notification.title}
              </h4>
              {!notification.isRead && (
                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
              )}
            </div>

            <p
              className={`mt-1 text-sm ${
                notification.isRead ? "text-gray-500" : "text-gray-700"
              }`}
            >
              {notification.message}
            </p>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">{formattedDate}</span>

              {/* Botones de acción */}
              <div className="flex items-center space-x-2">
                {/* Botón de acción específica */}
                {notification.type === NotificationType.COMMUNITY_REQUEST &&
                  notification.referenceId && (
                    <button
                      onClick={handleAction}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      Responder
                    </button>
                  )}

                {notification.actionUrl && (
                  <button
                    onClick={handleAction}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    Ver detalles
                  </button>
                )}

                {/* Marcar como leída */}
                {!notification.isRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    Marcar leída
                  </button>
                )}

                {/* Eliminar */}
                <button
                  onClick={handleDelete}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
