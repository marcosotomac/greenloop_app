// Notification types for frontend based on backend DTOs

export enum NotificationType {
  SYSTEM = "SYSTEM",
  DONATION = "DONATION",
  EXCHANGE = "EXCHANGE",
  EXCHANGE_REQUEST = "EXCHANGE_REQUEST",
  EXCHANGE_ACCEPTED = "EXCHANGE_ACCEPTED",
  EXCHANGE_REJECTED = "EXCHANGE_REJECTED",
  PRODUCT = "PRODUCT",
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_LIKED = "PRODUCT_LIKED",
  PRODUCT_COMMENTED = "PRODUCT_COMMENTED",
  COMMUNITY = "COMMUNITY",
  COMMUNITY_REQUEST = "COMMUNITY_REQUEST",
  COMMUNITY_CREATED = "COMMUNITY_CREATED",
  COMMUNITY_JOINED = "COMMUNITY_JOINED",
  COMMUNITY_POST = "COMMUNITY_POST",
  MESSAGE = "MESSAGE",
  WISHLIST = "WISHLIST",
  WISHLIST_ITEM_AVAILABLE = "WISHLIST_ITEM_AVAILABLE",
  ACHIEVEMENT = "ACHIEVEMENT",
  FOLLOW = "FOLLOW",
  RATING = "RATING",
  GENERAL = "GENERAL",
}

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

export interface NotificationRequestDto {
  userId: number;
  title: string;
  message: string;
}

export interface PaginatedNotifications {
  content: NotificationResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Helper functions
export const getNotificationTypeDisplayName = (
  type: NotificationType
): string => {
  const typeNames: Record<NotificationType, string> = {
    [NotificationType.SYSTEM]: "Sistema",
    [NotificationType.DONATION]: "Donación",
    [NotificationType.EXCHANGE]: "Intercambio",
    [NotificationType.EXCHANGE_REQUEST]: "Solicitud de Intercambio",
    [NotificationType.EXCHANGE_ACCEPTED]: "Intercambio Aceptado",
    [NotificationType.EXCHANGE_REJECTED]: "Intercambio Rechazado",
    [NotificationType.PRODUCT]: "Producto",
    [NotificationType.PRODUCT_CREATED]: "Producto Creado",
    [NotificationType.PRODUCT_LIKED]: "Me Gusta en Producto",
    [NotificationType.PRODUCT_COMMENTED]: "Comentario en Producto",
    [NotificationType.COMMUNITY]: "Comunidad",
    [NotificationType.COMMUNITY_REQUEST]: "Solicitud de Comunidad",
    [NotificationType.COMMUNITY_CREATED]: "Comunidad Creada",
    [NotificationType.COMMUNITY_JOINED]: "Nueva Unión a Comunidad",
    [NotificationType.COMMUNITY_POST]: "Publicación en Comunidad",
    [NotificationType.MESSAGE]: "Mensaje",
    [NotificationType.WISHLIST]: "Lista de Deseos",
    [NotificationType.WISHLIST_ITEM_AVAILABLE]: "Artículo Disponible",
    [NotificationType.ACHIEVEMENT]: "Logro",
    [NotificationType.FOLLOW]: "Nuevo Seguidor",
    [NotificationType.RATING]: "Nueva Valoración",
    [NotificationType.GENERAL]: "General",
  };

  return typeNames[type] || type;
};

export const getNotificationTypeColor = (type: NotificationType): string => {
  const typeColors: Record<NotificationType, string> = {
    [NotificationType.SYSTEM]: "primary",
    [NotificationType.DONATION]: "success",
    [NotificationType.EXCHANGE]: "warning",
    [NotificationType.EXCHANGE_REQUEST]: "warning",
    [NotificationType.EXCHANGE_ACCEPTED]: "success",
    [NotificationType.EXCHANGE_REJECTED]: "danger",
    [NotificationType.PRODUCT]: "secondary",
    [NotificationType.PRODUCT_CREATED]: "success",
    [NotificationType.PRODUCT_LIKED]: "danger",
    [NotificationType.PRODUCT_COMMENTED]: "primary",
    [NotificationType.COMMUNITY]: "primary",
    [NotificationType.COMMUNITY_REQUEST]: "warning",
    [NotificationType.COMMUNITY_CREATED]: "success",
    [NotificationType.COMMUNITY_JOINED]: "primary",
    [NotificationType.COMMUNITY_POST]: "secondary",
    [NotificationType.MESSAGE]: "secondary",
    [NotificationType.WISHLIST]: "danger",
    [NotificationType.WISHLIST_ITEM_AVAILABLE]: "success",
    [NotificationType.ACHIEVEMENT]: "success",
    [NotificationType.FOLLOW]: "primary",
    [NotificationType.RATING]: "warning",
    [NotificationType.GENERAL]: "default",
  };

  return typeColors[type] || "default";
};
