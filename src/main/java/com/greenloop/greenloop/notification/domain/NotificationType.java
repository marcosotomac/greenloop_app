package com.greenloop.greenloop.notification.domain;

public enum NotificationType {
    SYSTEM, // Notificaciones del sistema
    DONATION, // Relacionadas con donaciones
    EXCHANGE, // Relacionadas con intercambios
    EXCHANGE_REQUEST, // Nuevas solicitudes de intercambio
    EXCHANGE_ACCEPTED, // Intercambio aceptado
    EXCHANGE_REJECTED, // Intercambio rechazado
    PRODUCT, // Relacionadas con productos
    PRODUCT_CREATED, // Producto creado por usuarios que sigues
    PRODUCT_LIKED, // Alguien le dio like a tu producto
    PRODUCT_COMMENTED, // Nuevo comentario en tu producto
    COMMUNITY, // Relacionadas con comunidades
    COMMUNITY_REQUEST, // Solicitudes de membresía a comunidades
    COMMUNITY_CREATED, // Nueva comunidad creada
    COMMUNITY_JOINED, // Alguien se unió a tu comunidad
    COMMUNITY_POST, // Nueva publicación en comunidades que sigues
    MESSAGE, // Mensajes de otros usuarios
    WISHLIST, // Relacionadas con listas de deseos
    WISHLIST_ITEM_AVAILABLE, // Artículo de tu wishlist está disponible
    ACHIEVEMENT, // Logros desbloqueados
    FOLLOW, // Nuevo seguidor
    RATING, // Nueva valoración recibida
    GENERAL, // Notificaciones generales
}
