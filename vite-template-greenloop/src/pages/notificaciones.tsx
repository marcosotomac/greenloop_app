import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  Trash2,
  RefreshCw,
  CheckCheck,
  AlertTriangle,
  MessageCircle,
  Sparkles,
  Filter,
  Eye,
  X,
} from "lucide-react";

import { NotificationItem } from "@/components/NotificationItem";
import { NotificationFiltersComponent } from "@/components/NotificationFilters";
import { MembershipRequestModal } from "@/components/MembershipRequestModal";
import { useNotifications } from "@/hooks/useNotifications";
import {
  NotificationResponseDto,
  NotificationType,
  NotificationFilters,
} from "@/services/notificationService";

const NotificacionesPage: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    count,
    hasMore,
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    handleMembershipRequest,
    refresh,
    setError,
  } = useNotifications();

  const [filters, setFilters] = useState<NotificationFilters>({});
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponseDto | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    loadNotifications(0, 20, filters);
  }, [filters, loadNotifications]);

  const handleFiltersChange = (newFilters: NotificationFilters) => {
    setFilters(newFilters);
  };

  const handleNotificationAction = (notification: NotificationResponseDto) => {
    if (
      notification.type === NotificationType.COMMUNITY_REQUEST &&
      notification.referenceId
    ) {
      setSelectedNotification(notification);
      setShowMembershipModal(true);
    } else if (notification.actionUrl) {
      // Navegar a la URL de acción
      window.open(notification.actionUrl, "_blank");
      // Marcar como leída
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    }
  };

  const handleMembershipResponse = async (
    requestId: number,
    approved: boolean,
    responseMessage?: string
  ) => {
    const result = await handleMembershipRequest(
      requestId,
      approved,
      responseMessage
    );

    if (result.success) {
      setShowMembershipModal(false);
      setSelectedNotification(null);
      // Refresh notifications to reflect changes
      refresh(filters);
    }

    return result;
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refresh(filters);
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
    setShowDeleteConfirm(false);
    refresh(filters);
  };

  const handleLoadMore = () => {
    loadMore(filters);
  };

  const handleRefresh = () => {
    refresh(filters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-emerald-900/10 dark:to-teal-900/10">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,197,94,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(16,185,129,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,_rgba(5,150,105,0.08)_0%,_transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 shadow-2xl border border-green-100/50 backdrop-blur-sm mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
          <div className="absolute top-8 right-8 w-40 h-40 bg-green-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />

          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Header info */}
              <div className="flex items-center gap-6">
                {/* Notification icon */}
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  {count.unread > 0 && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {count.unread > 99 ? "99+" : count.unread}
                    </motion.div>
                  )}
                </div>

                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2 leading-tight">
                    Notificaciones
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Mantente al día con las últimas actualizaciones de tu
                    comunidad sostenible
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="flex gap-4">
                <motion.div
                  className="text-center p-4 bg-white/70 rounded-2xl border border-green-100/50 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-2 mx-auto">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {count.total}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Total</div>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-white/70 rounded-2xl border border-orange-100/50 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-2 mx-auto">
                    <BellRing className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {count.unread}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    No leídas
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-wrap items-center gap-3 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Actualizar
              </motion.button>

              {count.unread > 0 && (
                <motion.button
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-white hover:border-green-300 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="w-4 h-4 text-green-600" />
                  Marcar todas como leídas
                </motion.button>
              )}

              {count.total > 0 && (
                <motion.button
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 text-red-700 rounded-xl font-semibold border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar todas
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100/50 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
              <Filter className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          <NotificationFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">
                    Error de notificaciones
                  </h4>
                  <span className="text-red-700">{error}</span>
                </div>
                <motion.button
                  className="ml-4 p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setError(null)}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {loading && notifications.length === 0 && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/60 p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse backdrop-blur-sm"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-lg w-full" />
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                  </div>
                  <div className="w-6 h-6 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Notifications list */}
        {notifications.length > 0 ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <NotificationItem
                    notification={notification}
                    onAction={handleNotificationAction}
                    onDelete={deleteNotification}
                    onMarkAsRead={markAsRead}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load more button */}
            {hasMore && (
              <motion.div
                className="flex justify-center pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 text-gray-700 rounded-2xl font-semibold border border-gray-200 hover:bg-white hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Cargando más...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 text-green-600" />
                      Cargar más notificaciones
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 animate-pulse rounded-full bg-green-100/50" />
                </div>
                <div className="relative flex items-center justify-center">
                  <Bell className="w-20 h-20 text-green-400" />
                  {Object.keys(filters).some(
                    (key) => filters[key as keyof NotificationFilters]
                  ) && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.5,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <Filter className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>

              <h3 className="text-3xl font-bold text-gray-700 mb-4">
                {Object.keys(filters).some(
                  (key) => filters[key as keyof NotificationFilters]
                )
                  ? "🔍 Sin resultados"
                  : "🌟 ¡Todo al día!"}
              </h3>

              <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
                {Object.keys(filters).some(
                  (key) => filters[key as keyof NotificationFilters]
                )
                  ? "No se encontraron notificaciones con los filtros aplicados. Prueba ajustando los criterios de búsqueda."
                  : "¡Perfecto! No tienes notificaciones pendientes. Tu buzón está limpio y organizado."}
              </p>

              <motion.div
                className="mt-8 p-6 bg-green-50/80 rounded-2xl border border-green-100 backdrop-blur-sm inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Todo está bajo control</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </motion.div>
            </motion.div>
          )
        )}

        {/* Membership Request Modal */}
        <AnimatePresence>
          {showMembershipModal && selectedNotification && (
            <MembershipRequestModal
              isOpen={showMembershipModal}
              notification={selectedNotification}
              onClose={() => {
                setShowMembershipModal(false);
                setSelectedNotification(null);
              }}
              onResponse={handleMembershipResponse}
            />
          )}
        </AnimatePresence>

        {/* Delete All Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Confirmar eliminación
                  </h3>

                  <p className="text-gray-600 mb-8 leading-relaxed">
                    ¿Estás seguro de que quieres eliminar todas las
                    notificaciones? Esta acción no se puede deshacer y perderás
                    todo el historial.
                  </p>

                  <div className="flex gap-4">
                    <motion.button
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteAll}
                    >
                      Eliminar todas
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificacionesPage;
