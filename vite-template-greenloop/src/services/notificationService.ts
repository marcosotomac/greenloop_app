import {
  NotificationResponseDto,
  NotificationCountDto,
  NotificationType,
  PaginatedNotifications,
} from "../types/notification";
import { apiClient } from "../config/apiClient";
import { respondToMembershipRequest as apiRespondToMembershipRequest } from "../api/api";

class NotificationService {
  private readonly baseUrl = "/api/notifications";

  /**
   * Get paginated notifications for the current user
   */
  async getUserNotifications(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedNotifications> {
    const response = await apiClient.get<PaginatedNotifications>(
      `${this.baseUrl}?page=${page}&size=${size}&sort=createdAt,desc`
    );

    return response.data;
  }

  /**
   * Get unread notifications for the current user
   */
  async getUnreadNotifications(): Promise<NotificationResponseDto[]> {
    const response = await apiClient.get<NotificationResponseDto[]>(
      `${this.baseUrl}/unread`
    );

    return response.data;
  }

  /**
   * Get notification count (total and unread)
   */
  async getNotificationCount(): Promise<NotificationCountDto> {
    const response = await apiClient.get<NotificationCountDto>(
      `${this.baseUrl}/count`
    );

    return response.data;
  }

  /**
   * Get recent notifications (last N days)
   */
  async getRecentNotifications(
    days: number = 7
  ): Promise<NotificationResponseDto[]> {
    const response = await apiClient.get<NotificationResponseDto[]>(
      `${this.baseUrl}/recent?days=${days}`
    );

    return response.data;
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(
    type: NotificationType
  ): Promise<NotificationResponseDto[]> {
    const response = await apiClient.get<NotificationResponseDto[]>(
      `${this.baseUrl}/type/${type}`
    );

    return response.data;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<NotificationResponseDto> {
    const response = await apiClient.put<NotificationResponseDto>(
      `${this.baseUrl}/${notificationId}/read`
    );

    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put<void>(`${this.baseUrl}/read-all`);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${notificationId}`);
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<void> {
    await apiClient.delete(this.baseUrl);
  }

  /**
   * Handle membership request from notification
   */
  async handleMembershipRequest(
    requestId: number,
    approved: boolean,
    responseMessage?: string
  ): Promise<{ success: boolean; message: string; redirectUrl?: string }> {
    const params = new URLSearchParams({
      approved: approved.toString(),
    });

    if (responseMessage) {
      params.append("responseMessage", responseMessage);
    }

    const response = await apiClient.post<{
      success: boolean;
      message: string;
      redirectUrl?: string;
    }>(
      `${this.baseUrl}/handle-membership-request/${requestId}?${params.toString()}`
    );

    return response.data;
  }

  /**
   * Respond to a membership request directly
   */
  async respondToMembershipRequest(
    requestId: number,
    approved: boolean,
    responseMessage?: string
  ): Promise<void> {
    // Asegurarse de que approved sea explícitamente boolean
    const approvedBoolean = Boolean(approved);

    const actionData = {
      approved: approvedBoolean,
      responseMessage:
        responseMessage ||
        (approvedBoolean ? "Solicitud aprobada" : "Solicitud rechazada"),
    };

    console.log("Enviando solicitud de membresía:", {
      requestId,
      actionData,
      approvedType: typeof approvedBoolean,
      responseMessageType: typeof actionData.responseMessage,
      url: `/api/communities/membership-requests/${requestId}/respond`,
    });

    try {
      await apiRespondToMembershipRequest(requestId, actionData);
      console.log("Solicitud procesada exitosamente");
    } catch (error) {
      console.error("Error detallado en respondToMembershipRequest:", error);
      // Agregar más información del error
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  }

  /**
   * Get pending membership requests for the current user's communities
   */
  async getPendingMembershipRequests(): Promise<any[]> {
    const response = await apiClient.get<any[]>(
      "/api/communities/membership-requests/pending"
    );

    return response.data;
  }
}

export const notificationService = new NotificationService();
