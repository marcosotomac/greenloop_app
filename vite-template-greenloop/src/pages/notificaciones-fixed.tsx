import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Spinner,
  Chip,
  Badge,
  Tabs,
  Tab,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Divider,
  Switch,
  ButtonGroup,
  Progress,
  Tooltip,
} from "@nextui-org/react";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  EyeIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellSolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

import {
  NotificationResponseDto,
  NotificationCountDto,
  NotificationType,
  getNotificationTypeDisplayName,
  getNotificationTypeColor,
} from "../types/notification";
import { notificationService } from "../services/notificationService";
import { useNotifications } from "../hooks/useNotifications";
import MembershipRequestNotification from "../components/notifications/MembershipRequestNotification";

const NotificacionesPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(
    []
  );
  const [notificationCount, setNotificationCount] =
    useState<NotificationCountDto>({
      total: 0,
      unread: 0,
    });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "type" | "read">("date");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const { addNotification } = useNotifications();

  // Load notifications and count
  useEffect(() => {
    loadNotifications();
    loadNotificationCount();
  }, [currentPage, selectedTab]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      if (selectedTab === "unread") {
        const data = await notificationService.getUnreadNotifications();

        setNotifications(data);
        setTotalPages(1);
      } else if (selectedTab === "all" || selectedTab === "read") {
        const data = await notificationService.getUserNotifications(
          currentPage,
          10
        );
        let filteredData = data.content;

        if (selectedTab === "read") {
          filteredData = data.content.filter((n) => n.isRead);
        }

        setNotifications(filteredData);
        setTotalPages(data.totalPages);
      } else {
        // Filter by notification type/category or custom groups
        const typeMap: Record<string, NotificationType[]> = {
          exchange: [
            NotificationType.EXCHANGE,
            NotificationType.EXCHANGE_REQUEST,
            NotificationType.EXCHANGE_ACCEPTED,
            NotificationType.EXCHANGE_REJECTED,
          ],
          community: [
            NotificationType.COMMUNITY,
            NotificationType.COMMUNITY_REQUEST,
            NotificationType.COMMUNITY_CREATED,
            NotificationType.COMMUNITY_JOINED,
            NotificationType.COMMUNITY_POST,
          ],
          products: [
            NotificationType.PRODUCT,
            NotificationType.PRODUCT_CREATED,
            NotificationType.PRODUCT_LIKED,
            NotificationType.PRODUCT_COMMENTED,
          ],
          social: [
            NotificationType.FOLLOW,
            NotificationType.RATING,
            NotificationType.MESSAGE,
          ],
          achievements: [NotificationType.ACHIEVEMENT],
          system: [NotificationType.SYSTEM, NotificationType.GENERAL],
          message: [NotificationType.MESSAGE],
        };

        if (typeMap[selectedTab]) {
          const data = await notificationService.getUserNotifications(
            currentPage,
            50
          );
          const filteredData = data.content.filter((n) =>
            typeMap[selectedTab].includes(n.type)
          );

          setNotifications(filteredData);
          setTotalPages(Math.ceil(filteredData.length / 10));
        }
      }
    } catch {
      addNotification("error", "Error", "Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const count = await notificationService.getNotificationCount();

      setNotificationCount(count);
    } catch {
      addNotification("error", "Error", "Error al cargar el contador");
    }
  };

  // Filter notifications by search term and priority
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "urgent" &&
        !notification.isRead &&
        notification.type === NotificationType.COMMUNITY_REQUEST) ||
      (priorityFilter === "community" &&
        (notification.type === NotificationType.COMMUNITY ||
          notification.type === NotificationType.COMMUNITY_REQUEST)) ||
      (priorityFilter === "exchange" &&
        notification.type === NotificationType.EXCHANGE);

    return matchesSearch && matchesPriority;
  });

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "type":
        return a.type.localeCompare(b.type);
      case "read":
        return Number(a.isRead) - Number(b.isRead);
      default:
        return 0;
    }
  });

  // Manejo inteligente de acciones completadas en notificaciones
  const handleNotificationActionComplete = async (
    notificationId: number,
    actionType: "processed" | "updated" = "processed"
  ) => {
    try {
      // Encontrar la notificación antes de procesarla
      const notification = notifications.find((n) => n.id === notificationId);

      if (actionType === "processed") {
        // Eliminar inmediatamente la notificación de la UI para mejor UX
        setNotifications((prev) => {
          const filtered = prev.filter((n) => n.id !== notificationId);
          console.log(
            `Notificación ${notificationId} eliminada de la UI. Restantes: ${filtered.length}`
          );
          return filtered;
        });

        // Actualizar el contador local inmediatamente
        setNotificationCount((prev) => ({
          total: Math.max(0, prev.total - 1),
          unread:
            notification && !notification.isRead
              ? Math.max(0, prev.unread - 1)
              : prev.unread,
        }));

        // Marcar como leída en el backend si no lo estaba
        if (notification && !notification.isRead) {
          try {
            await notificationService.markAsRead(notificationId);
          } catch (error) {
            console.error("Error al marcar como leída:", error);
          }
        }
      }

      // Recargar solo el contador para verificar sincronización
      setTimeout(async () => {
        try {
          await loadNotificationCount();
        } catch (error) {
          console.error("Error al sincronizar contador:", error);
        }
      }, 500);

      // Feedback específico para GreenLoop
      const feedbackMessages: Record<string, string> = {
        [NotificationType.COMMUNITY_REQUEST]:
          "¡Solicitud de comunidad procesada! 🌱",
        [NotificationType.COMMUNITY_CREATED]: "¡Comunidad creada! 🌱",
        [NotificationType.COMMUNITY_JOINED]: "¡Nuevo miembro! 🤝",
        [NotificationType.COMMUNITY_POST]: "¡Publicación procesada! 📢",
        [NotificationType.EXCHANGE]: "¡Intercambio actualizado! ♻️",
        [NotificationType.EXCHANGE_REQUEST]:
          "¡Solicitud de intercambio procesada! 🔄",
        [NotificationType.EXCHANGE_ACCEPTED]: "¡Intercambio aceptado! ✅",
        [NotificationType.EXCHANGE_REJECTED]: "¡Intercambio rechazado! ❌",
        [NotificationType.PRODUCT]: "¡Producto actualizado! 📦",
        [NotificationType.PRODUCT_CREATED]: "¡Producto creado! ✨",
        [NotificationType.PRODUCT_LIKED]: "¡Me gusta procesado! ❤️",
        [NotificationType.PRODUCT_COMMENTED]: "¡Comentario procesado! 💬",
        [NotificationType.DONATION]: "¡Donación procesada! 💚",
        [NotificationType.COMMUNITY]: "¡Actividad de comunidad actualizada! 👥",
        [NotificationType.ACHIEVEMENT]: "¡Logro registrado! 🏆",
        [NotificationType.WISHLIST]: "¡Lista de deseos actualizada! ❤️",
        [NotificationType.WISHLIST_ITEM_AVAILABLE]: "¡Artículo disponible! ⭐",
        [NotificationType.FOLLOW]: "¡Seguidor procesado! �",
        [NotificationType.RATING]: "¡Valoración procesada! ⭐",
        [NotificationType.MESSAGE]: "¡Mensaje procesado! �",
        [NotificationType.SYSTEM]: "¡Notificación del sistema procesada! ⚙️",
        [NotificationType.GENERAL]: "¡Notificación general procesada! 📢",
        default: "¡Acción completada exitosamente! ✅",
      };

      const message = notification
        ? feedbackMessages[notification.type] || feedbackMessages.default
        : feedbackMessages.default;

      addNotification("success", "GreenLoop", message);
    } catch (error) {
      console.error("Error al manejar la acción completada:", error);
      addNotification(
        "error",
        "Error",
        "Hubo un problema al procesar la acción. Recargando..."
      );
      // Recargar completamente en caso de error
      setTimeout(() => {
        loadNotifications();
        loadNotificationCount();
      }, 1000);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      setActionLoading(true);
      await notificationService.markAsRead(id);
      addNotification("success", "Éxito", "Notificación marcada como leída");
      loadNotifications();
      loadNotificationCount();
    } catch {
      addNotification("error", "Error", "Error al marcar como leída");
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading(true);
      await notificationService.markAllAsRead();
      addNotification(
        "success",
        "Éxito",
        "Todas las notificaciones marcadas como leídas"
      );
      loadNotifications();
      loadNotificationCount();
    } catch {
      addNotification("error", "Error", "Error al marcar todas como leídas");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNotification = async (id: number) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta notificación?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await notificationService.deleteNotification(id);
      addNotification("success", "Éxito", "Notificación eliminada");
      loadNotifications();
      loadNotificationCount();
    } catch {
      addNotification("error", "Error", "Error al eliminar la notificación");
    } finally {
      setActionLoading(false);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons = {
      [NotificationType.COMMUNITY_REQUEST]: "👥",
      [NotificationType.COMMUNITY_CREATED]: "🌱",
      [NotificationType.COMMUNITY_JOINED]: "🤝",
      [NotificationType.COMMUNITY_POST]: "📢",
      [NotificationType.DONATION]: "💝",
      [NotificationType.EXCHANGE]: "🔄",
      [NotificationType.EXCHANGE_REQUEST]: "🔄",
      [NotificationType.EXCHANGE_ACCEPTED]: "✅",
      [NotificationType.EXCHANGE_REJECTED]: "❌",
      [NotificationType.PRODUCT]: "📦",
      [NotificationType.PRODUCT_CREATED]: "✨",
      [NotificationType.PRODUCT_LIKED]: "❤️",
      [NotificationType.PRODUCT_COMMENTED]: "💬",
      [NotificationType.ACHIEVEMENT]: "🏆",
      [NotificationType.WISHLIST]: "❤️",
      [NotificationType.WISHLIST_ITEM_AVAILABLE]: "⭐",
      [NotificationType.MESSAGE]: "💬",
      [NotificationType.FOLLOW]: "👤",
      [NotificationType.RATING]: "⭐",
      [NotificationType.SYSTEM]: "⚙️",
      [NotificationType.COMMUNITY]: "👥",
      [NotificationType.GENERAL]: "📢",
    };

    return icons[type] || "🔔";
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;

    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  // Estadísticas específicas para GreenLoop
  const getGreenLoopStats = () => {
    const stats = {
      communityRequests: notifications.filter(
        (n) => n.type === NotificationType.COMMUNITY_REQUEST
      ).length,
      communityActivity: notifications.filter(
        (n) =>
          n.type === NotificationType.COMMUNITY_CREATED ||
          n.type === NotificationType.COMMUNITY_JOINED ||
          n.type === NotificationType.COMMUNITY_POST
      ).length,
      exchangeActivity: notifications.filter(
        (n) =>
          n.type === NotificationType.EXCHANGE ||
          n.type === NotificationType.EXCHANGE_REQUEST ||
          n.type === NotificationType.EXCHANGE_ACCEPTED ||
          n.type === NotificationType.EXCHANGE_REJECTED
      ).length,
      productActivity: notifications.filter(
        (n) =>
          n.type === NotificationType.PRODUCT ||
          n.type === NotificationType.PRODUCT_CREATED ||
          n.type === NotificationType.PRODUCT_LIKED ||
          n.type === NotificationType.PRODUCT_COMMENTED
      ).length,
      donationActivity: notifications.filter(
        (n) => n.type === NotificationType.DONATION
      ).length,
      achievements: notifications.filter(
        (n) => n.type === NotificationType.ACHIEVEMENT
      ).length,
      socialActivity: notifications.filter(
        (n) =>
          n.type === NotificationType.FOLLOW ||
          n.type === NotificationType.RATING ||
          n.type === NotificationType.MESSAGE
      ).length,
      wishlistActivity: notifications.filter(
        (n) =>
          n.type === NotificationType.WISHLIST ||
          n.type === NotificationType.WISHLIST_ITEM_AVAILABLE
      ).length,
    };

    return stats;
  };

  const greenLoopStats = getGreenLoopStats();
  const unreadCount = notificationCount.unread;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Spinner color="success" size="lg" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto p-4 md:p-6 max-w-full">
        {/* Header mejorado con estadísticas */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-800 dark:via-emerald-800 dark:to-teal-800 shadow-2xl border-none overflow-hidden">
            <CardBody className="p-6 relative">
              {/* Patrón de fondo sostenible */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-6xl">🌱</div>
                <div className="absolute bottom-4 left-4 text-4xl">♻️</div>
                <div className="absolute top-1/2 right-1/3 text-3xl">🌍</div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <motion.div
                      animate={unreadCount > 0 ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Avatar
                        className="w-20 h-20 bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl"
                        icon={
                          <BellSolidIcon className="w-10 h-10 text-white" />
                        }
                      />
                    </motion.div>
                    {unreadCount > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge
                          className="absolute -top-2 -right-2 border-2 border-white shadow-lg"
                          color="danger"
                          size="lg"
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <motion.h1
                      className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      Centro de Actividad 🌱
                    </motion.h1>
                    <motion.div
                      className="flex items-center gap-6 text-white/90"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${unreadCount > 0 ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`}
                        />
                        <p className="text-lg font-semibold">
                          {unreadCount > 0
                            ? `${unreadCount} ${unreadCount === 1 ? "actividad nueva" : "actividades nuevas"}`
                            : "Comunidad al día 🌍"}
                        </p>
                      </div>
                      <Chip
                        className="bg-white/20 text-white font-semibold backdrop-blur-sm"
                        size="md"
                        variant="flat"
                      >
                        Total: {notificationCount.total}
                      </Chip>
                      <Chip
                        className="bg-green-500/20 text-white font-semibold backdrop-blur-sm"
                        size="md"
                        variant="flat"
                      >
                        Leídas: {notificationCount.total - unreadCount}
                      </Chip>
                    </motion.div>

                    {/* Estadísticas específicas de GreenLoop */}
                    <motion.div
                      className="mt-3 flex flex-wrap gap-2 text-white/80 text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      {greenLoopStats.communityRequests > 0 && (
                        <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
                          <span>👥</span>
                          <span>
                            {greenLoopStats.communityRequests} solicitudes
                          </span>
                        </div>
                      )}
                      {greenLoopStats.exchangeActivity > 0 && (
                        <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
                          <span>🔄</span>
                          <span>
                            {greenLoopStats.exchangeActivity} intercambios
                          </span>
                        </div>
                      )}
                      {greenLoopStats.donationActivity > 0 && (
                        <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
                          <span>💝</span>
                          <span>
                            {greenLoopStats.donationActivity} donaciones
                          </span>
                        </div>
                      )}
                      {greenLoopStats.achievements > 0 && (
                        <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
                          <span>🏆</span>
                          <span>{greenLoopStats.achievements} logros</span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className="flex flex-wrap gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <ButtonGroup variant="flat">
                    <Button
                      className="bg-white/20 text-white hover:bg-white/30 transition-all duration-300 font-semibold border border-white/20"
                      isDisabled={unreadCount === 0}
                      isLoading={actionLoading}
                      startContent={<CheckCircleIcon className="w-5 h-5" />}
                      onPress={markAllAsRead}
                    >
                      ✅ Marcar como vistas
                    </Button>
                    <Button
                      className="bg-white/20 text-white hover:bg-white/30 transition-all duration-300 font-semibold border border-white/20"
                      startContent={<FunnelIcon className="w-5 h-5" />}
                      onPress={() => setShowFilters(!showFilters)}
                    >
                      🔍 {showFilters ? "Ocultar" : "Filtros"}
                    </Button>
                  </ButtonGroup>
                </motion.div>
              </div>

              {/* Estadísticas visuales mejoradas */}
              <motion.div
                className="mt-6 pt-6 border-t border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {greenLoopStats.communityRequests}
                    </div>
                    <div className="text-white/80 text-sm font-medium">
                      👥 Solicitudes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {greenLoopStats.exchangeActivity}
                    </div>
                    <div className="text-white/80 text-sm font-medium">
                      ♻️ Intercambios
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {greenLoopStats.productActivity}
                    </div>
                    <div className="text-white/80 text-sm font-medium">
                      📦 Productos
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {greenLoopStats.communityActivity}
                    </div>
                    <div className="text-white/80 text-sm font-medium">
                      🌱 Comunidades
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {greenLoopStats.socialActivity}
                    </div>
                    <div className="text-white/80 text-sm font-medium">
                      👤 Social
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {greenLoopStats.achievements}
                    </div>
                    <div className="text-white/80 text-sm font-medium">
                      🏆 Logros
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Filtros y Búsqueda súper mejorados */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardBody className="p-6">
                  {/* Búsqueda avanzada */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="col-span-1 md:col-span-2">
                      <Input
                        isClearable
                        className="text-lg"
                        placeholder="Buscar en títulos, mensajes y contenido..."
                        size="lg"
                        startContent={
                          <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                        }
                        value={searchTerm}
                        variant="bordered"
                        onClear={() => setSearchTerm("")}
                        onValueChange={setSearchTerm}
                      />
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          className="justify-between h-14 text-lg font-semibold"
                          endContent={
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                          }
                          size="lg"
                          variant="bordered"
                        >
                          Ordenar:{" "}
                          {sortBy === "date"
                            ? "📅 Fecha"
                            : sortBy === "type"
                              ? "🏷️ Tipo"
                              : "👁️ Estado"}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        onAction={(key) =>
                          setSortBy(key as "date" | "type" | "read")
                        }
                      >
                        <DropdownItem key="date">
                          📅 Más recientes primero
                        </DropdownItem>
                        <DropdownItem key="type">
                          🏷️ Agrupar por tipo
                        </DropdownItem>
                        <DropdownItem key="read">
                          👁️ Sin leer primero
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <Divider className="my-6" />

                  {/* Controles avanzados */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <EyeIcon className="w-5 h-5" />
                        Visualización
                      </h4>
                      <div className="space-y-3">
                        <Switch
                          color="success"
                          isSelected={compactView}
                          size="sm"
                          onValueChange={setCompactView}
                        >
                          <span className="text-sm font-medium">
                            Vista compacta
                          </span>
                        </Switch>
                        <Switch
                          color="primary"
                          isSelected={showStats}
                          size="sm"
                          onValueChange={setShowStats}
                        >
                          <span className="text-sm font-medium">
                            Mostrar estadísticas
                          </span>
                        </Switch>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5" />
                        Filtros rápidos
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className={
                            priorityFilter === "urgent"
                              ? "ring-2 ring-red-400"
                              : ""
                          }
                          color="danger"
                          size="sm"
                          variant={
                            priorityFilter === "urgent" ? "solid" : "flat"
                          }
                          onPress={() =>
                            setPriorityFilter(
                              priorityFilter === "urgent" ? "all" : "urgent"
                            )
                          }
                        >
                          🚨 Urgentes
                        </Button>
                        <Button
                          className={
                            priorityFilter === "community"
                              ? "ring-2 ring-blue-400"
                              : ""
                          }
                          color="primary"
                          size="sm"
                          variant={
                            priorityFilter === "community" ? "solid" : "flat"
                          }
                          onPress={() =>
                            setPriorityFilter(
                              priorityFilter === "community"
                                ? "all"
                                : "community"
                            )
                          }
                        >
                          👥 Comunidad
                        </Button>
                        <Button
                          className={
                            priorityFilter === "exchange"
                              ? "ring-2 ring-green-400"
                              : ""
                          }
                          color="success"
                          size="sm"
                          variant={
                            priorityFilter === "exchange" ? "solid" : "flat"
                          }
                          onPress={() =>
                            setPriorityFilter(
                              priorityFilter === "exchange" ? "all" : "exchange"
                            )
                          }
                        >
                          🔄 Intercambios
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        Acciones rápidas
                      </h4>
                      <div className="space-y-2">
                        <Button
                          className="w-full justify-start"
                          color="success"
                          isDisabled={unreadCount === 0}
                          size="sm"
                          startContent={<CheckCircleIcon className="w-4 h-4" />}
                          variant="flat"
                          onPress={markAllAsRead}
                        >
                          Marcar todas como leídas
                        </Button>
                        <Button
                          className="w-full justify-start"
                          color="default"
                          size="sm"
                          startContent={<ArchiveBoxIcon className="w-4 h-4" />}
                          variant="flat"
                        >
                          Archivar todas leídas
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de filtros aplicados */}
                  {(searchTerm || priorityFilter !== "all") && (
                    <>
                      <Divider className="my-6" />
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Filtros activos:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {searchTerm && (
                            <Chip
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              size="sm"
                              variant="flat"
                              onClose={() => setSearchTerm("")}
                            >
                              🔍 &ldquo;{searchTerm}&rdquo;
                            </Chip>
                          )}
                          {priorityFilter !== "all" && (
                            <Chip
                              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              size="sm"
                              variant="flat"
                              onClose={() => setPriorityFilter("all")}
                            >
                              🏷️{" "}
                              {priorityFilter === "urgent"
                                ? "Urgentes"
                                : priorityFilter === "community"
                                  ? "Comunidad"
                                  : "Intercambios"}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs mejorados */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardBody className="p-4">
              <Tabs
                className="w-full"
                color="success"
                selectedKey={selectedTab}
                size="lg"
                variant="underlined"
                onSelectionChange={(key) => setSelectedTab(key as string)}
              >
                <Tab
                  key="all"
                  title={
                    <div className="flex items-center gap-2">
                      <span>🌍 Todas</span>
                      <Chip color="default" size="sm" variant="flat">
                        {notificationCount.total}
                      </Chip>
                    </div>
                  }
                />
                <Tab
                  key="unread"
                  title={
                    <div className="flex items-center gap-2">
                      <span>🌱 Nuevas</span>
                      {unreadCount > 0 && (
                        <Chip color="warning" size="sm" variant="flat">
                          {unreadCount}
                        </Chip>
                      )}
                    </div>
                  }
                />
                <Tab key="read" title="✅ Vistas" />
                <Tab key="exchange" title="♻️ Intercambios" />
                <Tab key="community" title="👥 Comunidad" />
                <Tab key="products" title="📦 Productos" />
                <Tab key="social" title="👤 Social" />
                <Tab key="achievements" title="🏆 Logros" />
                <Tab key="system" title="⚙️ Sistema" />
                <Tab key="message" title="💬 Mensajes" />
              </Tabs>
            </CardBody>
          </Card>
        </motion.div>

        {/* Lista de Notificaciones mejorada */}
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="space-y-4">
            {sortedNotifications.length === 0 ? (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-800 dark:to-emerald-900 border-dashed border-2 border-green-300 dark:border-green-600">
                  <CardBody className="text-center py-16">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-20 h-20 mx-auto mb-6 text-6xl">🌱</div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-300 mb-3">
                      {searchTerm
                        ? "🔍 No encontramos actividades"
                        : "🌍 Tu comunidad está tranquila"}
                    </h3>
                    <p className="text-green-500 dark:text-green-400 text-lg">
                      {searchTerm
                        ? "Intenta con otros términos o revisa las pestañas"
                        : "¡Perfecto momento para explorar la comunidad y crear nuevas conexiones sostenibles!"}
                    </p>
                    {searchTerm && (
                      <Button
                        className="mt-4"
                        color="success"
                        variant="flat"
                        onPress={() => setSearchTerm("")}
                      >
                        🗑️ Limpiar búsqueda
                      </Button>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            ) : (
              <AnimatePresence>
                {sortedNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    initial={{ opacity: 0, y: 20 }}
                    layout
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {notification.type ===
                    NotificationType.COMMUNITY_REQUEST ? (
                      <MembershipRequestNotification
                        notification={notification}
                        onActionComplete={() =>
                          handleNotificationActionComplete(notification.id)
                        }
                      />
                    ) : (
                      <Card
                        className={`group relative overflow-hidden transition-all duration-500 cursor-pointer ${
                          !notification.isRead
                            ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 ring-2 ring-blue-300/50 dark:ring-blue-700/50 shadow-xl hover:shadow-2xl border-l-4 border-blue-500"
                            : "bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-md shadow-md hover:shadow-lg border border-gray-200/50 dark:border-gray-600/50"
                        } hover:scale-[1.02] transform-gpu`}
                      >
                        {/* Indicador de prioridad visual */}
                        {!notification.isRead && (
                          <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-blue-500 opacity-80" />
                        )}

                        <CardBody className={compactView ? "p-4" : "p-6"}>
                          <div className="flex gap-4">
                            {/* Avatar mejorado con efectos */}
                            <div className="flex-shrink-0 relative">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Avatar
                                  className={`${
                                    compactView ? "w-12 h-12" : "w-16 h-16"
                                  } ${
                                    !notification.isRead
                                      ? "ring-3 ring-blue-400/60 dark:ring-blue-600/60 shadow-lg"
                                      : "ring-2 ring-gray-300/60 dark:ring-gray-600/60"
                                  } transition-all duration-300 backdrop-blur-sm bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800`}
                                  icon={
                                    <span
                                      className={`${compactView ? "text-xl" : "text-3xl"} filter drop-shadow-md`}
                                    >
                                      {getNotificationIcon(notification.type)}
                                    </span>
                                  }
                                />
                              </motion.div>
                              {!notification.isRead && (
                                <motion.div
                                  animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.7, 1, 0.7],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                  className="absolute -top-1 -right-1"
                                >
                                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg border-2 border-white dark:border-gray-800" />
                                </motion.div>
                              )}
                            </div>

                            {/* Contenido mejorado */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <h3
                                    className={`font-bold ${
                                      compactView ? "text-base" : "text-xl"
                                    } ${
                                      !notification.isRead
                                        ? "text-blue-900 dark:text-blue-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                        : "text-gray-700 dark:text-gray-300"
                                    } group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300 truncate`}
                                  >
                                    {notification.title}
                                  </h3>
                                  {!notification.isRead && (
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        boxShadow: [
                                          "0 0 5px rgba(59, 130, 246, 0.5)",
                                          "0 0 20px rgba(59, 130, 246, 0.8)",
                                          "0 0 5px rgba(59, 130, 246, 0.5)",
                                        ],
                                      }}
                                      transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                      }}
                                    >
                                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg" />
                                    </motion.div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <Chip
                                    className={`transition-all duration-300 group-hover:scale-110 font-semibold shadow-md ${
                                      !notification.isRead
                                        ? "ring-1 ring-white/30"
                                        : ""
                                    }`}
                                    color={
                                      getNotificationTypeColor(
                                        notification.type
                                      ) as any
                                    }
                                    size={compactView ? "sm" : "md"}
                                    variant={
                                      !notification.isRead ? "solid" : "flat"
                                    }
                                  >
                                    {getNotificationTypeDisplayName(
                                      notification.type
                                    )}
                                  </Chip>
                                  <div className="text-center">
                                    <span
                                      className={`text-xs font-bold ${
                                        !notification.isRead
                                          ? "text-blue-600 dark:text-blue-400"
                                          : "text-gray-500 dark:text-gray-400"
                                      }`}
                                    >
                                      {formatRelativeTime(
                                        notification.createdAt
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {!compactView && (
                                <motion.div
                                  initial={{ opacity: 0.8 }}
                                  whileHover={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <p
                                    className={`text-sm mb-6 leading-relaxed ${
                                      !notification.isRead
                                        ? "text-gray-800 dark:text-gray-200 font-medium"
                                        : "text-gray-600 dark:text-gray-400"
                                    } line-clamp-3`}
                                  >
                                    {notification.message}
                                  </p>
                                </motion.div>
                              )}

                              {/* Acciones súper mejoradas */}
                              <div className="flex items-center gap-3 flex-wrap">
                                {!notification.isRead && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      className="transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl border-0"
                                      isLoading={actionLoading}
                                      size={compactView ? "sm" : "md"}
                                      startContent={
                                        <CheckIcon className="w-4 h-4" />
                                      }
                                      onPress={() =>
                                        markAsRead(notification.id)
                                      }
                                    >
                                      ✓ Marcar leída
                                    </Button>
                                  </motion.div>
                                )}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    className="transition-all duration-300 hover:bg-red-500 hover:text-white font-semibold"
                                    color="danger"
                                    isLoading={actionLoading}
                                    size={compactView ? "sm" : "md"}
                                    startContent={
                                      <TrashIcon className="w-4 h-4" />
                                    }
                                    variant="flat"
                                    onPress={() =>
                                      deleteNotification(notification.id)
                                    }
                                  >
                                    🗑️ Eliminar
                                  </Button>
                                </motion.div>
                                {!compactView && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      className="transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                      color="default"
                                      size="sm"
                                      startContent={
                                        <ArchiveBoxIcon className="w-4 h-4" />
                                      }
                                      variant="light"
                                    >
                                      📦 Archivar
                                    </Button>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Paginación mejorada */}
        {totalPages > 1 && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="mt-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardBody className="p-4">
                <div className="flex justify-center">
                  <Button
                    className="transition-all duration-300 hover:scale-105"
                    color="primary"
                    isDisabled={currentPage >= totalPages - 1}
                    size="lg"
                    variant="flat"
                    onPress={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Cargar más notificaciones
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificacionesPage;
