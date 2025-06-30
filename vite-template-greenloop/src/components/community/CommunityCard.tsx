// Community Card Component
import React from "react";
import {
  Users,
  MapPin,
  Calendar,
  Crown,
  Lock,
  Globe,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

import { CommunityResponseDto } from "@/types/interfaces.tsx";

interface CommunityCardProps {
  community: CommunityResponseDto;
  onJoin?: (communityId: number) => void;
  onView?: (communityId: number) => void;
  onRequestMembership?: (communityId: number) => void;
  isMember?: boolean;
  isCreator?: boolean;
  showActions?: boolean;
  hasPendingRequest?: boolean;
  isRequestSending?: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onJoin,
  onView,
  onRequestMembership,
  isMember = false,
  isCreator = false,
  showActions = true,
  hasPendingRequest = false,
  isRequestSending = false,
}) => {
  const handleJoinClick = () => {
    if (community.type === "PUBLIC" && onJoin) {
      onJoin(community.id);
    } else if (community.type === "PRIVATE" && onRequestMembership) {
      onRequestMembership(community.id);
    }
  };

  const handleViewClick = () => {
    if (onView) {
      onView(community.id);
    }
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-700/90 shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 transition-all duration-500 border border-green-100/50 dark:border-gray-600/50 backdrop-blur-sm"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 dark:from-green-400/3 dark:via-transparent dark:to-emerald-400/3" />
      <div className="absolute top-4 right-4 w-32 h-32 bg-green-400/10 dark:bg-green-400/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -top-6 -left-6 w-20 h-20 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header with community type indicator */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {/* Community icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                  community.type === "PRIVATE"
                    ? "bg-gradient-to-br from-purple-500 to-violet-600"
                    : "bg-gradient-to-br from-green-500 to-emerald-600"
                } shadow-lg`}
              >
                {community.type === "PRIVATE" ? (
                  <Lock className="w-6 h-6 text-white" />
                ) : (
                  <Globe className="w-6 h-6 text-white" />
                )}
              </div>

              {/* Community type badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  community.type === "PRIVATE"
                    ? "bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-600/30"
                    : "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-600/30"
                }`}
              >
                {community.type === "PRIVATE"
                  ? "🔒 Comunidad Privada"
                  : "🌍 Comunidad Abierta"}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors duration-300">
              {community.name}
            </h3>

            {/* Creator badge */}
            {isCreator && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium border border-yellow-200 dark:border-yellow-600/30 mb-3">
                <Crown className="w-4 h-4" />
                <span>Fundador</span>
                <Sparkles className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 leading-relaxed line-clamp-2">
          {community.description ||
            "Una comunidad increíble esperando por ti. ¡Únete y descubre todo lo que tenemos para ofrecer!"}
        </p>

        {/* Community Stats */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Members count */}
          <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-700/70 rounded-xl border border-green-100/50 dark:border-gray-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Miembros
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {community.memberCount}
              </p>
            </div>
          </div>

          {/* Activity indicator */}
          <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-700/70 rounded-xl border border-green-100/50 dark:border-gray-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Estado
              </p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Activa
              </p>
            </div>
          </div>
        </div>

        {/* Community Details */}
        <div className="space-y-2 mb-5">
          {/* Location */}
          {community.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span>{community.location}</span>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-green-500 dark:text-green-400" />
            <span>
              Fundada el{" "}
              {new Date(community.createdAt).toLocaleDateString("es-ES")}
            </span>
          </div>

          {/* Creator info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span>
              Fundada por {community.creator.firstName}{" "}
              {community.creator.lastName}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-3 pt-4 border-t border-green-100/50 dark:border-gray-600/50">
            {/* View Details Button */}
            <button
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600/80 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 rounded-xl transition-all duration-300 hover:shadow-md backdrop-blur-sm"
              onClick={handleViewClick}
            >
              👁️ Ver Detalles
            </button>

            {/* Membership Actions */}
            {!isMember && !isCreator && (
              <>
                {community.type === "PUBLIC" ? (
                  <button
                    className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    disabled={isRequestSending}
                    onClick={handleJoinClick}
                  >
                    {isRequestSending ? "🔄 Uniéndose..." : "🚀 Unirse Ahora"}
                  </button>
                ) : (
                  <button
                    className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasPendingRequest
                        ? "text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                        : "text-white bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 dark:from-purple-600 dark:to-violet-700 dark:hover:from-purple-700 dark:hover:to-violet-800 hover:shadow-lg transform hover:scale-105"
                    }`}
                    disabled={isRequestSending || hasPendingRequest}
                    onClick={handleJoinClick}
                  >
                    {isRequestSending
                      ? "📤 Enviando..."
                      : hasPendingRequest
                        ? "⏳ Solicitud Enviada"
                        : "✉️ Solicitar Acceso"}
                  </button>
                )}
              </>
            )}

            {/* Member Status */}
            {isMember && !isCreator && (
              <div className="flex-1 px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-300 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl text-center border border-green-200 dark:border-green-600/30 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                ✅ Miembro Activo
              </div>
            )}

            {/* Creator Status */}
            {isCreator && (
              <div className="flex-1 px-4 py-3 text-sm font-semibold text-yellow-700 dark:text-yellow-300 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-xl text-center border border-yellow-200 dark:border-yellow-600/30 flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                👑 Fundador
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-emerald-500/0 dark:from-green-400/0 dark:via-green-400/3 dark:to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};

export default CommunityCard;
