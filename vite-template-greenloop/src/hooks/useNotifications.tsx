import { useState, useEffect, useCallback } from "react";

import {
  NotificationResponseDto,
  NotificationCountDto,
  NotificationType,
  NotificationFilters,
  notificationService,
} from "@/services/notificationService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<NotificationCountDto>({
    total: 0,
    unread: 0,
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Cargar conteo de notificaciones
  const loadCount = useCallback(async () => {
    try {
      const countData = await notificationService.getNotificationCount();

      setCount(countData);
    } catch {
      // Error silencioso para no molestar al usuario
    }
  }, []);

  // Cargar notificaciones con paginación
  const loadNotifications = useCallback(
    async (
      pageNum = 0,
      size = 20,
      filters?: NotificationFilters,
      append = false
    ) => {
      try {
        setLoading(true);
        setError(null);

        let notificationsData: NotificationResponseDto[] = [];

        if (filters?.type) {
          notificationsData = await notificationService.getNotificationsByType(
            filters.type
          );
        } else if (filters?.days) {
          notificationsData = await notificationService.getRecentNotifications(
            filters.days
          );
        } else if (filters?.onlyUnread) {
          notificationsData =
            await notificationService.getUnreadNotifications();
        } else {
          const response = await notificationService.getAllNotifications(
            pageNum,
            size
          );

          notificationsData = response.content;

          setTotalPages(response.totalPages);
          setHasMore(pageNum < response.totalPages - 1);
        }

        // Aplicar filtro de solo no leídas si está activo y no es el endpoint específico
        if (filters?.onlyUnread && !filters.type && !filters.days) {
          notificationsData = notificationsData.filter((n) => !n.isRead);
        }

        if (append) {
          setNotifications((prev) => [...prev, ...notificationsData]);
        } else {
          setNotifications(notificationsData);
        }

        setPage(pageNum);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error cargando notificaciones"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cargar más notificaciones (para scroll infinito)
  const loadMore = useCallback(
    async (filters?: NotificationFilters) => {
      if (!hasMore || loading) return;

      await loadNotifications(page + 1, 20, filters, true);
    },
    [hasMore, loading, page, loadNotifications]
  );

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );

      // Actualizar conteo
      setCount((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error marcando como leída"
      );
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Actualizar estado local
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      // Actualizar conteo
      setCount((prev) => ({ ...prev, unread: 0 }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error marcando todas como leídas"
      );
    }
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        await notificationService.deleteNotification(notificationId);

        // Actualizar estado local
        const notificationToDelete = notifications.find(
          (n) => n.id === notificationId
        );

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Actualizar conteo
        setCount((prev) => ({
          total: Math.max(0, prev.total - 1),
          unread:
            notificationToDelete && !notificationToDelete.isRead
              ? Math.max(0, prev.unread - 1)
              : prev.unread,
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error eliminando notificación"
        );
      }
    },
    [notifications]
  );

  // Eliminar todas las notificaciones
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationService.deleteAllNotifications();

      // Actualizar estado local
      setNotifications([]);
      setCount({ total: 0, unread: 0 });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error eliminando todas las notificaciones"
      );
    }
  }, []);

  // Responder a solicitud de membresía
  const handleMembershipRequest = useCallback(
    async (requestId: number, approved: boolean, responseMessage?: string) => {
      try {
        await notificationService.handleMembershipRequest(
          requestId,
          approved,
          responseMessage
        );

        // Marcar la notificación relacionada como leída
        const relatedNotification = notifications.find(
          (n) =>
            n.type === NotificationType.COMMUNITY_REQUEST &&
            n.referenceId === requestId
        );

        if (relatedNotification) {
          await markAsRead(relatedNotification.id);
        }

        return { success: true };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error procesando solicitud"
        );

        return {
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        };
      }
    },
    [notifications, markAsRead]
  );

  // Refrescar datos
  const refresh = useCallback(
    async (filters?: NotificationFilters) => {
      await Promise.all([loadNotifications(0, 20, filters), loadCount()]);
    },
    [loadNotifications, loadCount]
  );

  // Cargar datos iniciales
  useEffect(() => {
    refresh();
  }, []);

  // Configurar polling para actualizaciones en tiempo real (cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      loadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadCount]);

  return {
    // Estado
    notifications,
    loading,
    error,
    count,
    page,
    totalPages,
    hasMore,
    // Acciones
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    handleMembershipRequest,
    refresh,
    // Utilidades
    setError,
    loadCount,
  };
};
