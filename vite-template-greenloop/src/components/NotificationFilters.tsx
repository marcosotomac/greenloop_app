import React from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Calendar,
  Bell,
  Eye,
  ChevronDown,
  Settings,
  Clock,
  Tag,
} from "lucide-react";
import {
  NotificationType,
  NotificationFilters,
} from "@/services/notificationService";

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
}

export const NotificationFiltersComponent: React.FC<
  NotificationFiltersProps
> = ({ filters, onFiltersChange }) => {
  const handleTypeChange = (type: NotificationType | undefined) => {
    onFiltersChange({ ...filters, type });
  };

  const handleDaysChange = (days: number | undefined) => {
    onFiltersChange({ ...filters, days });
  };

  const handleOnlyUnreadChange = (onlyUnread: boolean) => {
    onFiltersChange({ ...filters, onlyUnread });
  };

  const notificationTypes = [
    {
      value: undefined,
      label: "Todos los tipos",
      icon: Settings,
      color: "text-gray-500",
    },
    {
      value: NotificationType.SYSTEM,
      label: "Sistema",
      icon: Settings,
      color: "text-blue-500",
    },
    {
      value: NotificationType.DONATION,
      label: "Donaciones",
      icon: Bell,
      color: "text-green-500",
    },
    {
      value: NotificationType.EXCHANGE,
      label: "Intercambios",
      icon: Tag,
      color: "text-purple-500",
    },
    {
      value: NotificationType.PRODUCT,
      label: "Productos",
      icon: Tag,
      color: "text-orange-500",
    },
    {
      value: NotificationType.COMMUNITY,
      label: "Comunidades",
      icon: Bell,
      color: "text-emerald-500",
    },
    {
      value: NotificationType.COMMUNITY_REQUEST,
      label: "Solicitudes de membresía",
      icon: Bell,
      color: "text-yellow-500",
    },
    {
      value: NotificationType.MESSAGE,
      label: "Mensajes",
      icon: Bell,
      color: "text-indigo-500",
    },
    {
      value: NotificationType.WISHLIST,
      label: "Lista de deseos",
      icon: Bell,
      color: "text-pink-500",
    },
    {
      value: NotificationType.ACHIEVEMENT,
      label: "Logros",
      icon: Bell,
      color: "text-amber-500",
    },
    {
      value: NotificationType.GENERAL,
      label: "General",
      icon: Bell,
      color: "text-gray-500",
    },
  ];

  const dayOptions = [
    {
      value: undefined,
      label: "Todos los días",
      icon: Calendar,
      color: "text-gray-500",
    },
    { value: 1, label: "Último día", icon: Clock, color: "text-red-500" },
    { value: 7, label: "Última semana", icon: Clock, color: "text-orange-500" },
    { value: 30, label: "Último mes", icon: Clock, color: "text-blue-500" },
    {
      value: 90,
      label: "Últimos 3 meses",
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border border-green-100/50 dark:border-slate-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-transparent to-emerald-500/3 dark:from-green-500/1 dark:to-emerald-500/1" />
      <div className="absolute top-4 right-4 w-20 h-20 bg-green-400/5 dark:bg-green-400/2 rounded-full blur-2xl" />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Filter className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros Avanzados
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personaliza tu experiencia de notificaciones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filtro por tipo */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Tipo de Notificación
              </label>
            </div>

            <div className="relative">
              <select
                value={filters.type || ""}
                onChange={(e) =>
                  handleTypeChange(
                    (e.target.value as NotificationType) || undefined
                  )
                }
                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-200 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90 dark:bg-slate-900/90 text-gray-900 dark:text-gray-100 font-medium transition-all duration-300 hover:border-green-300 dark:hover:border-green-600 backdrop-blur-sm"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value || "all"} value={type.value || ""}>
                    {type.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            {/* Selected type indicator */}
            {filters.type && (
              <motion.div
                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {(() => {
                  const selectedType = notificationTypes.find(
                    (t) => t.value === filters.type
                  );
                  const IconComponent = selectedType?.icon || Bell;
                  return (
                    <>
                      <IconComponent
                        className={`w-4 h-4 ${selectedType?.color || "text-gray-500"} dark:opacity-80`}
                      />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {selectedType?.label || "Tipo seleccionado"}
                      </span>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </motion.div>

          {/* Filtro por período */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Período de Tiempo
              </label>
            </div>

            <div className="relative">
              <select
                value={filters.days || ""}
                onChange={(e) =>
                  handleDaysChange(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-200 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 dark:bg-slate-900/90 text-gray-900 dark:text-gray-100 font-medium transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 backdrop-blur-sm"
              >
                {dayOptions.map((option) => (
                  <option
                    key={option.value || "all"}
                    value={option.value || ""}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            {/* Selected period indicator */}
            {filters.days && (
              <motion.div
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {(() => {
                  const selectedPeriod = dayOptions.find(
                    (d) => d.value === filters.days
                  );
                  const IconComponent = selectedPeriod?.icon || Clock;
                  return (
                    <>
                      <IconComponent
                        className={`w-4 h-4 ${selectedPeriod?.color || "text-gray-500"} dark:opacity-80`}
                      />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {selectedPeriod?.label || "Período seleccionado"}
                      </span>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </motion.div>

          {/* Filtro por estado de lectura */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Estado de Lectura
              </label>
            </div>

            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <label className="flex items-center gap-4 p-4 bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 backdrop-blur-sm group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.onlyUnread || false}
                    onChange={(e) => handleOnlyUnreadChange(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                      filters.onlyUnread
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500"
                        : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {filters.onlyUnread && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Solo mostrar no leídas
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Oculta las notificaciones ya revisadas
                  </p>
                </div>

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    filters.onlyUnread
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : "bg-gray-100 dark:bg-slate-700"
                  }`}
                >
                  <Bell
                    className={`w-4 h-4 ${
                      filters.onlyUnread
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                </div>
              </label>
            </motion.div>

            {/* Only unread indicator */}
            {filters.onlyUnread && (
              <motion.div
                className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Mostrando solo no leídas
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Active filters summary */}
        {(filters.type || filters.days || filters.onlyUnread) && (
          <motion.div
            className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Filtros Activos
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.type && (
                <motion.span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Tag className="w-3 h-3" />
                  {
                    notificationTypes.find((t) => t.value === filters.type)
                      ?.label
                  }
                </motion.span>
              )}

              {filters.days && (
                <motion.span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                >
                  <Calendar className="w-3 h-3" />
                  {dayOptions.find((d) => d.value === filters.days)?.label}
                </motion.span>
              )}

              {filters.onlyUnread && (
                <motion.span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <Eye className="w-3 h-3" />
                  Solo no leídas
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
