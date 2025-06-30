import { API_URL } from "../api/api";

export interface NotificationResponseDto {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: NotificationType;
  userId: number;
  referenceId?: number;
  actionUrl?: string;
}

export interface NotificationCountDto {
  total: number;
  unread: number;
}

export enum NotificationType {
  SYSTEM = "SYSTEM",
  DONATION = "DONATION",
  EXCHANGE = "EXCHANGE",
  PRODUCT = "PRODUCT",
  COMMUNITY = "COMMUNITY",
  COMMUNITY_REQUEST = "COMMUNITY_REQUEST",
  MESSAGE = "MESSAGE",
  WISHLIST = "WISHLIST",
  ACHIEVEMENT = "ACHIEVEMENT",
  GENERAL = "GENERAL",
}

export interface NotificationFilters {
  type?: NotificationType;
  days?: number;
  onlyUnread?: boolean;
}

class NotificationService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Obtener todas las notificaciones con paginación
  async getAllNotifications(
    page = 0,
    size = 20
  ): Promise<{
    content: NotificationResponseDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const response = await fetch(
      `${API_URL}/api/notifications?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching notifications: ${response.status}`);
    }

    return response.json();
  }

  // Obtener notificaciones no leídas
  async getUnreadNotifications(): Promise<NotificationResponseDto[]> {
    const response = await fetch(`${API_URL}/api/notifications/unread`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching unread notifications: ${response.status}`
      );
    }

    return response.json();
  }

  // Obtener conteo de notificaciones
  async getNotificationCount(): Promise<NotificationCountDto> {
    const response = await fetch(`${API_URL}/api/notifications/count`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error fetching notification count: ${response.status}`);
    }

    return response.json();
  }

  // Obtener notificaciones por tipo
  async getNotificationsByType(
    type: NotificationType
  ): Promise<NotificationResponseDto[]> {
    const response = await fetch(`${API_URL}/api/notifications/type/${type}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching notifications by type: ${response.status}`
      );
    }

    return response.json();
  }

  // Obtener notificaciones recientes (últimos N días)
  async getRecentNotifications(days = 7): Promise<NotificationResponseDto[]> {
    const response = await fetch(
      `${API_URL}/api/notifications/recent?days=${days}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching recent notifications: ${response.status}`
      );
    }

    return response.json();
  }

  // Marcar una notificación como leída
  async markAsRead(notificationId: number): Promise<NotificationResponseDto> {
    const response = await fetch(
      `${API_URL}/api/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error marking notification as read: ${response.status}`);
    }

    return response.json();
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Error marking all notifications as read: ${response.status}`
      );
    }
  }

  // Eliminar una notificación
  async deleteNotification(notificationId: number): Promise<void> {
    const response = await fetch(
      `${API_URL}/api/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting notification: ${response.status}`);
    }
  }

  // Eliminar todas las notificaciones
  async deleteAllNotifications(): Promise<void> {
    const response = await fetch(`${API_URL}/api/notifications`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error deleting all notifications: ${response.status}`);
    }
  }

  // Responder a solicitud de membresía desde notificación
  async handleMembershipRequest(
    requestId: number,
    approved: boolean,
    responseMessage?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append("approved", approved.toString());
    if (responseMessage) {
      params.append("responseMessage", responseMessage);
    }

    const response = await fetch(
      `${API_URL}/api/notifications/handle-membership-request/${requestId}?${params}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error handling membership request: ${response.status}`);
    }

    return response.json();
  }

  // Obtener icono para cada tipo de notificación
  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.SYSTEM:
        return "🔧";
      case NotificationType.DONATION:
        return "💝";
      case NotificationType.EXCHANGE:
        return "🔄";
      case NotificationType.PRODUCT:
        return "📦";
      case NotificationType.COMMUNITY:
        return "👥";
      case NotificationType.COMMUNITY_REQUEST:
        return "📝";
      case NotificationType.MESSAGE:
        return "💬";
      case NotificationType.WISHLIST:
        return "⭐";
      case NotificationType.ACHIEVEMENT:
        return "🏆";
      case NotificationType.GENERAL:
      default:
        return "🔔";
    }
  }

  // Obtener color para cada tipo de notificación
  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.SYSTEM:
        return "bg-blue-100 text-blue-800";
      case NotificationType.DONATION:
        return "bg-pink-100 text-pink-800";
      case NotificationType.EXCHANGE:
        return "bg-purple-100 text-purple-800";
      case NotificationType.PRODUCT:
        return "bg-green-100 text-green-800";
      case NotificationType.COMMUNITY:
        return "bg-indigo-100 text-indigo-800";
      case NotificationType.COMMUNITY_REQUEST:
        return "bg-yellow-100 text-yellow-800";
      case NotificationType.MESSAGE:
        return "bg-cyan-100 text-cyan-800";
      case NotificationType.WISHLIST:
        return "bg-orange-100 text-orange-800";
      case NotificationType.ACHIEVEMENT:
        return "bg-amber-100 text-amber-800";
      case NotificationType.GENERAL:
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // Formatear fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
    } else if (diffInHours > 0) {
      return `hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    } else if (diffInMinutes > 0) {
      return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`;
    } else {
      return "hace unos momentos";
    }
  }
}

export const notificationService = new NotificationService();
