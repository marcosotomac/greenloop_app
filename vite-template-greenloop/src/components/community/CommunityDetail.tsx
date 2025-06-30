// Community Detail View Component
import React, { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  Calendar,
  Crown,
  Settings,
  UserPlus,
  UserMinus,
  ArrowLeft,
  MoreVertical,
  Globe,
  Lock,
  Sparkles,
  Heart,
  Star,
  Activity,
  Shield,
  Trash2,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  CommunityResponseDto,
  UserDto,
  MembershipRequestResponseDto,
} from "@/types/interfaces.tsx";
import {
  getCommunityById,
  getCommunityMembers,
  checkMembership,
  joinCommunity,
  leaveCommunity,
  getCommunityMembershipRequests,
  deleteCommunity,
  requestMembership,
  getMyMembershipRequests,
} from "@/api/api.tsx";

interface CommunityDetailProps {
  communityId: number;
  onBack: () => void;
  onJoin?: (communityId: number) => void;
  onLeave?: (communityId: number) => void;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({
  communityId,
  onBack,
  onJoin,
  onLeave,
}) => {
  const [community, setCommunity] = useState<CommunityResponseDto | null>(null);
  const [members, setMembers] = useState<UserDto[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<
    MembershipRequestResponseDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isRequestSending, setIsRequestSending] = useState(false);

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  useEffect(() => {
    loadCommunityData();
  }, [communityId]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [communityData, membersData, membershipStatus] = await Promise.all([
        getCommunityById(communityId),
        getCommunityMembers(communityId),
        checkMembership(communityId),
      ]);

      setCommunity(communityData);
      setMembers(membersData);

      const isCreator = communityData.creator.id === currentUserId;

      setIsCreator(isCreator);

      // Si es creador, automáticamente es miembro
      if (isCreator) {
        setIsMember(true);
      } else {
        setIsMember(membershipStatus);
      }

      // Load membership requests if user is creator
      if (communityData.creator.id === currentUserId) {
        try {
          const requests = await getCommunityMembershipRequests(communityId);

          setMembershipRequests(requests);
        } catch {
          // Requests might not be available for all community types
        }
      }

      // Check if user has pending membership request for this community
      if (!membershipStatus && !isCreator && communityData.type === "PRIVATE") {
        try {
          const myRequests = await getMyMembershipRequests();
          const pendingRequest = myRequests.find(
            (request) =>
              request.communityId === communityId &&
              request.status === "PENDING"
          );

          setHasPendingRequest(!!pendingRequest);
        } catch {
          // User might not have any requests
          setHasPendingRequest(false);
        }
      }
    } catch {
      setError("Error al cargar los datos de la comunidad");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!community) return;

    try {
      if (community.type === "PUBLIC") {
        // For public communities, join directly
        await joinCommunity(communityId);
        setIsMember(true);
        setCommunity((prev) =>
          prev ? { ...prev, memberCount: prev.memberCount + 1 } : null
        );

        // Reload members list
        const updatedMembers = await getCommunityMembers(communityId);

        setMembers(updatedMembers);

        if (onJoin) {
          onJoin(communityId);
        }
      } else {
        // For private communities, send membership request
        setIsRequestSending(true);
        const requestData = {
          communityId: communityId,
          message: "Me gustaría unirme a esta comunidad.",
        };

        await requestMembership(communityId, requestData);
        setHasPendingRequest(true);
      }

      // Limpiar cualquier error previo
      setError(null);
    } catch (error: any) {
      if (community.type === "PUBLIC") {
        if (error.message?.includes("already a member")) {
          setError("Ya eres miembro de esta comunidad");
        } else {
          setError("Error al unirse a la comunidad. Inténtalo de nuevo.");
        }
      } else {
        if (error.message?.includes("already requested")) {
          setError("Ya has enviado una solicitud para esta comunidad");
          setHasPendingRequest(true);
        } else if (error.message?.includes("already a member")) {
          setError("Ya eres miembro de esta comunidad");
          setIsMember(true);
        } else {
          setError(
            "Error al enviar la solicitud de membresía. Inténtalo de nuevo."
          );
        }
      }
    } finally {
      setIsRequestSending(false);
    }
  };

  const handleLeave = async () => {
    if (!community) return;

    // Múltiples verificaciones de protección: el creador no puede abandonar su comunidad
    if (isCreator || community.creator.id === currentUserId) {
      setError(
        "El creador no puede abandonar su propia comunidad. Para eliminar la comunidad, usa las opciones de configuración."
      );

      return;
    }

    // Confirmar la acción antes de proceder
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres abandonar esta comunidad?"
    );

    if (!confirmed) return;

    try {
      await leaveCommunity(communityId);
      setIsMember(false);

      setCommunity((prev) =>
        prev ? { ...prev, memberCount: prev.memberCount - 1 } : null
      );

      // Reload members list
      const updatedMembers = await getCommunityMembers(communityId);

      setMembers(updatedMembers);

      if (onLeave) {
        onLeave(communityId);
      }

      // Limpiar cualquier error previo y mostrar mensaje de éxito
      setError(null);
      // Opcional: Mostrar mensaje de éxito temporalmente
      // setSuccess("Has abandonado la comunidad exitosamente");
    } catch (error: any) {
      if (
        error.message?.includes("El creador no puede abandonar la comunidad")
      ) {
        setError(
          "El creador no puede abandonar su propia comunidad. Para eliminar la comunidad, usa las opciones de configuración."
        );
      } else if (
        error.message?.includes("El usuario no es miembro de esta comunidad")
      ) {
        setError("No eres miembro de esta comunidad");
        setIsMember(false); // Actualizar estado local
      } else if (error.message?.includes("Comunidad no encontrada")) {
        setError("La comunidad no existe o ha sido eliminada");
      } else if (error.message?.includes("401")) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente");
      } else if (error.message?.includes("403")) {
        setError("No tienes autorización para realizar esta acción");
      } else if (error.message?.includes("404")) {
        setError("La comunidad no fue encontrada");
      } else if (error.message?.includes("409")) {
        setError("El creador no puede abandonar su propia comunidad");
      } else {
        setError(
          "Error al abandonar la comunidad. Por favor, verifica tu conexión e inténtalo de nuevo."
        );
      }
    }
  };

  const handleDeleteCommunity = async () => {
    if (!community || !isCreator) return;

    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar esta comunidad? Esta acción no se puede deshacer."
    );

    if (confirmed) {
      try {
        await deleteCommunity(communityId);
        onBack(); // Go back to communities list
      } catch (error: any) {
        if (error.message?.includes("has members")) {
          setError("No se puede eliminar una comunidad que tiene miembros");
        } else if (error.message?.includes("not authorized")) {
          setError("Solo el creador puede eliminar la comunidad");
        } else {
          setError("Error al eliminar la comunidad. Inténtalo de nuevo.");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-emerald-900/10 dark:to-teal-900/10">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            className="relative"
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-600 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "3s" }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-emerald-900/10 dark:to-teal-900/10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.button
            className="flex items-center gap-3 text-gray-600 hover:text-green-600 mb-6 px-4 py-2 rounded-xl hover:bg-white/50 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a Comunidades</span>
          </motion.button>

          <motion.div
            className="bg-white/80 backdrop-blur-lg border border-red-200 rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Oops! Algo salió mal
              </h3>
              <p className="text-red-600 font-medium">
                {error || "Comunidad no encontrada"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-emerald-900/10 dark:to-teal-900/10">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,197,94,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(16,185,129,0.1)_0%,_transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            className="flex items-center gap-3 text-gray-600 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
            whileHover={{ x: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Volver a Comunidades</span>
          </motion.button>

          {/* Settings menu for creators */}
          {isCreator && (
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                className="p-3 text-gray-600 hover:text-green-600 rounded-xl hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(!showSettings)}
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>

              {showSettings && (
                <motion.div
                  className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-green-100 z-20 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                >
                  <button
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 transition-colors duration-200 flex items-center gap-3"
                    onClick={() => {
                      setShowSettings(false);
                      // TODO: Open edit modal
                    }}
                  >
                    <Edit3 className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Editar Comunidad</span>
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3"
                    onClick={() => {
                      setShowSettings(false);
                      handleDeleteCommunity();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">Eliminar Comunidad</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Hero section */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 shadow-2xl border border-green-100/50 backdrop-blur-sm mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
          <div className="absolute top-8 right-8 w-40 h-40 bg-green-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />

          <div className="relative z-10 p-8">
            {/* Community header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div className="flex-1">
                {/* Community icon and type */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg ${
                      community.type === "PRIVATE"
                        ? "bg-gradient-to-br from-purple-500 to-violet-600"
                        : "bg-gradient-to-br from-green-500 to-emerald-600"
                    }`}
                  >
                    {community.type === "PRIVATE" ? (
                      <Lock className="w-8 h-8 text-white" />
                    ) : (
                      <Globe className="w-8 h-8 text-white" />
                    )}
                  </div>

                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      community.type === "PRIVATE"
                        ? "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border border-purple-200"
                        : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                    }`}
                  >
                    {community.type === "PRIVATE"
                      ? "🔒 Comunidad Privada"
                      : "🌍 Comunidad Abierta"}
                  </div>
                </div>

                {/* Community name */}
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                  {community.name}
                </h1>

                {/* Creator badge */}
                {isCreator && (
                  <motion.div
                    className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 rounded-full font-semibold border border-yellow-200 mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <Crown className="w-5 h-5" />
                    <span>Fundador de la Comunidad</span>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                )}

                {/* Description */}
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  {community.description ||
                    "Una comunidad increíble esperando por ti. ¡Únete y descubre todo lo que tenemos para ofrecer!"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 lg:min-w-[200px]">
                {!isMember && !isCreator && (
                  <>
                    {community.type === "PUBLIC" ? (
                      <motion.button
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isRequestSending}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleJoin}
                      >
                        <UserPlus className="w-5 h-5" />
                        {isRequestSending
                          ? "🔄 Uniéndose..."
                          : "🚀 Unirse Ahora"}
                      </motion.button>
                    ) : (
                      <motion.button
                        className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasPendingRequest
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:shadow-xl"
                        }`}
                        disabled={isRequestSending || hasPendingRequest}
                        whileHover={!hasPendingRequest ? { scale: 1.05 } : {}}
                        whileTap={!hasPendingRequest ? { scale: 0.95 } : {}}
                        onClick={handleJoin}
                      >
                        <UserPlus className="w-5 h-5" />
                        {isRequestSending
                          ? "📤 Enviando..."
                          : hasPendingRequest
                            ? "⏳ Solicitud Enviada"
                            : "✉️ Solicitar Acceso"}
                      </motion.button>
                    )}
                  </>
                )}

                {isMember && !isCreator && (
                  <motion.button
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLeave}
                  >
                    <UserMinus className="w-5 h-5" />
                    Abandonar Comunidad
                  </motion.button>
                )}

                {isMember && (
                  <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl font-semibold border border-green-200">
                    <Heart className="w-5 h-5 text-green-600" />
                    <span>{isCreator ? "Tu Comunidad" : "Miembro Activo"}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {/* Community stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Members count */}
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-green-100/50 backdrop-blur-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Miembros</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {community.memberCount}
                  </p>
                </div>
              </div>

              {/* Location */}
              {community.location && (
                <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-green-100/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Ubicación
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {community.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Creation date */}
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-green-100/50 backdrop-blur-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Fundada</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(community.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Members section */}
        <motion.div
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-green-100/50 p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Miembros de la Comunidad ({members.length})
            </h2>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                Aún no hay miembros en esta comunidad
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-2xl border border-gray-100 hover:border-green-200 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {member.firstName?.charAt(0) || "?"}
                      {member.lastName?.charAt(0) || "?"}
                    </div>
                    {member.id === community.creator.id && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-yellow-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {member.email}
                    </p>
                    {member.id === community.creator.id && (
                      <p className="text-xs text-yellow-600 font-medium">
                        Fundador
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Membership requests (only for creators) */}
        {isCreator && membershipRequests.length > 0 && (
          <motion.div
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-purple-100/50 p-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Solicitudes de Membresía ({membershipRequests.length})
              </h2>
            </div>

            <div className="space-y-4">
              {membershipRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-violet-50/30 rounded-2xl border border-purple-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold">
                        #
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Usuario #{request.userId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleDateString(
                                "es-ES"
                              )
                            : "Fecha no disponible"}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 bg-white/50 rounded-lg p-3 border border-purple-100">
                      {request.message || "Sin mensaje personalizado"}
                    </p>
                  </div>

                  <div className="flex gap-3 ml-6">
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Check className="w-4 h-4" />
                      Aprobar
                    </motion.button>
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-4 h-4" />
                      Rechazar
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            className="bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Error</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;
