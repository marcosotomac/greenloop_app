import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button, Input, Chip } from "@nextui-org/react";

import {
  CommunityResponseDto,
  CommunityRequestDto,
  MembershipRequestDto,
} from "@/types/interfaces.tsx";
import {
  getAllCommunities,
  getUserCommunities,
  createCommunity,
  joinCommunity,
  checkMembership,
  requestMembership,
  getMyMembershipRequests,
} from "@/api/api.tsx";
import CommunityCard from "@/components/community/CommunityCard.tsx";
import CreateCommunityModal from "@/components/community/CreateCommunityModal.tsx";
import CommunityDetail from "@/components/community/CommunityDetail.tsx";

const ComunidadPage: React.FC = () => {
  const [communities, setCommunities] = useState<CommunityResponseDto[]>([]);
  const [userCommunities, setUserCommunities] = useState<
    CommunityResponseDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "my" | "popular" | "recent"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [membershipMap, setMembershipMap] = useState<Map<number, boolean>>(
    new Map()
  );
  const [creatorMap, setCreatorMap] = useState<Map<number, boolean>>(new Map());
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [pendingRequestsMap, setPendingRequestsMap] = useState<
    Map<number, boolean>
  >(new Map());
  const [requestSendingMap, setRequestSendingMap] = useState<
    Map<number, boolean>
  >(new Map());

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      loadCommunitiesByTab();
    }
  }, [activeTab, searchTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCommunitiesByTab(),
        loadUserCommunities(),
        loadPendingRequests(),
      ]);
    } catch {
      setError("Error al cargar las comunidades");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const myRequests = await getMyMembershipRequests();
      const pendingMap = new Map<number, boolean>();

      myRequests
        .filter((request) => request.status === "PENDING")
        .forEach((request) => {
          pendingMap.set(request.communityId, true);
        });

      setPendingRequestsMap(pendingMap);
    } catch {
      setPendingRequestsMap(new Map());
    }
  };

  const loadCommunitiesByTab = async () => {
    try {
      let communitiesData: CommunityResponseDto[] = [];

      switch (activeTab) {
        case "all":
          communitiesData = await getAllCommunities();
          break;
        case "my":
          communitiesData = await getUserCommunities();
          break;
        case "popular":
          communitiesData = await getAllCommunities();
          break;
        case "recent":
          communitiesData = await getAllCommunities();
          break;
      }

      setCommunities(communitiesData);
      await checkMemberships(communitiesData);
    } catch {
      setError("Error al cargar las comunidades");
    }
  };

  const loadUserCommunities = async () => {
    try {
      const userComms = await getUserCommunities();
      setUserCommunities(userComms);
    } catch {
      setError("Error al cargar las comunidades del usuario");
    }
  };

  const checkMemberships = async (communityList: CommunityResponseDto[]) => {
    const membershipPromises = communityList.map(async (community) => {
      try {
        const isCreator = community.creator.id === currentUserId;
        let isMember = false;

        if (isCreator) {
          isMember = true;
        } else {
          isMember = await checkMembership(community.id);
        }

        return { id: community.id, isMember, isCreator };
      } catch {
        const isCreator = community.creator.id === currentUserId;
        return { id: community.id, isMember: isCreator, isCreator };
      }
    });

    const results = await Promise.all(membershipPromises);
    const newMembershipMap = new Map<number, boolean>();
    const newCreatorMap = new Map<number, boolean>();

    results.forEach(({ id, isMember, isCreator }) => {
      newMembershipMap.set(id, isMember);
      newCreatorMap.set(id, isCreator);
    });

    setMembershipMap(newMembershipMap);
    setCreatorMap(newCreatorMap);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCommunitiesByTab();
      return;
    }

    try {
      const allComms = await getAllCommunities();
      const searchResults = allComms.filter(
        (community) =>
          community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          community.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );

      setCommunities(searchResults);
      await checkMemberships(searchResults);
    } catch {
      setError("Error al buscar comunidades");
    }
  };

  const handleCreateCommunity = async (communityData: CommunityRequestDto) => {
    try {
      const newCommunity = await createCommunity(communityData);
      setCommunities((prev) => [newCommunity, ...prev]);
      setUserCommunities((prev) => [newCommunity, ...prev]);
      setShowCreateModal(false);
      setMembershipMap((prev) => new Map(prev.set(newCommunity.id, true)));
      setCreatorMap((prev) => new Map(prev.set(newCommunity.id, true)));
    } catch {
      throw new Error("Error al crear la comunidad");
    }
  };

  const handleJoinCommunity = async (communityId: number) => {
    const isCreator = creatorMap.get(communityId);

    if (isCreator) {
      setError(
        "El creador ya es miembro de su propia comunidad automáticamente."
      );
      return;
    }

    try {
      await joinCommunity(communityId);
      setMembershipMap((prev) => new Map(prev.set(communityId, true)));
      setCommunities((prev) =>
        prev.map((community) =>
          community.id === communityId
            ? { ...community, memberCount: community.memberCount + 1 }
            : community
        )
      );
      await loadUserCommunities();
      setError(null);
    } catch (error: any) {
      if (error.message?.includes("already a member")) {
        setError("Ya eres miembro de esta comunidad");
        setMembershipMap((prev) => new Map(prev.set(communityId, true)));
      } else {
        setError("Error al unirse a la comunidad");
      }
    }
  };

  const handleRequestMembership = async (communityId: number) => {
    const isCreator = creatorMap.get(communityId);

    if (isCreator) {
      setError("El creador ya es miembro automáticamente de su comunidad.");
      return;
    }

    try {
      setRequestSendingMap((prev) => new Map(prev.set(communityId, true)));

      const requestData: MembershipRequestDto = {
        communityId,
        message: "Me gustaría unirme a esta comunidad.",
      };

      await requestMembership(communityId, requestData);
      setPendingRequestsMap((prev) => new Map(prev.set(communityId, true)));
      setError(null);
    } catch (error: any) {
      if (error.message?.includes("already requested")) {
        setError("Ya has enviado una solicitud para esta comunidad");
        setPendingRequestsMap((prev) => new Map(prev.set(communityId, true)));
      } else {
        setError("Error al enviar la solicitud de membresía");
      }
    } finally {
      setRequestSendingMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(communityId);
        return newMap;
      });
    }
  };

  const handleViewCommunity = (communityId: number) => {
    setSelectedCommunityId(communityId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setSelectedCommunityId(null);
    setViewMode("list");
  };

  const handleLeaveCommunityFromDetail = async (communityId: number) => {
    try {
      setMembershipMap((prev) => new Map(prev.set(communityId, false)));
      setCommunities((prev) =>
        prev.map((community) =>
          community.id === communityId
            ? {
                ...community,
                memberCount: Math.max(0, community.memberCount - 1),
              }
            : community
        )
      );
      await loadUserCommunities();
      setError(null);
    } catch {
      await Promise.all([loadCommunitiesByTab(), loadUserCommunities()]);
    }
  };

  const handleJoinCommunityFromDetail = async (communityId: number) => {
    try {
      setMembershipMap((prev) => new Map(prev.set(communityId, true)));
      setCommunities((prev) =>
        prev.map((community) =>
          community.id === communityId
            ? { ...community, memberCount: community.memberCount + 1 }
            : community
        )
      );
      await loadUserCommunities();
      setError(null);
    } catch {
      await Promise.all([loadCommunitiesByTab(), loadUserCommunities()]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const loadCommunities = async () => {
    await loadCommunitiesByTab();
  };

  const tabs = [
    { id: "all", label: "Todas", icon: "lucide:users" },
    { id: "my", label: "Mis Comunidades", icon: "lucide:heart" },
    { id: "popular", label: "Populares", icon: "lucide:trending-up" },
    { id: "recent", label: "Recientes", icon: "lucide:clock" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (viewMode === "detail" && selectedCommunityId) {
    return (
      <CommunityDetail
        communityId={selectedCommunityId}
        onBack={handleBackToList}
        onJoin={handleJoinCommunityFromDetail}
        onLeave={handleLeaveCommunityFromDetail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Connection Network Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,197,94,0.1)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_20%,_rgba(34,197,94,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(16,185,129,0.1)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_80%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,_rgba(5,150,105,0.08)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_40%_60%,_rgba(5,150,105,0.03)_0%,_transparent_50%)]" />
      </div>

      <motion.div
        animate="show"
        className="relative w-full px-4 py-8 sm:px-6 lg:px-8"
        initial="hidden"
        variants={containerVariants}
      >
        {/* Human Connection Header */}
        <motion.div className="mb-12" variants={itemVariants}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-700 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 dark:from-white/5 dark:via-transparent dark:to-black/20" />

            <div className="relative z-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 animate-pulse rounded-full bg-white/20 dark:bg-white/10" />
                  <div className="relative rounded-full bg-white/20 dark:bg-white/10 p-6 backdrop-blur-sm">
                    <Icon
                      className="text-6xl text-white"
                      icon="lucide:users-round"
                    />
                  </div>
                </div>
              </div>

              <h1 className="mb-4 text-5xl font-black text-white md:text-6xl">
                Conecta y Construye
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90 dark:text-white/80">
                Únete a personas que comparten tu visión de un futuro
                sostenible. Construye comunidades que marquen la diferencia.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-3 rounded-full bg-white/20 dark:bg-white/10 px-6 py-3 backdrop-blur-sm">
                  <Icon className="text-2xl text-white" icon="lucide:users" />
                  <span className="text-lg font-semibold text-white">
                    {communities.reduce((acc, c) => acc + c.memberCount, 0)}{" "}
                    Personas
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-white/20 dark:bg-white/10 px-6 py-3 backdrop-blur-sm">
                  <Icon className="text-2xl text-white" icon="lucide:sprout" />
                  <span className="text-lg font-semibold text-white">
                    {communities.length} Comunidades
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Navigation */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 p-8 shadow-xl backdrop-blur-lg border border-white/20 dark:border-gray-700/50">
            <div className="mb-6">
              <Input
                className="w-full"
                classNames={{
                  inputWrapper:
                    "bg-white/90 dark:bg-gray-700/90 border-2 border-green-200/50 dark:border-green-600/30 shadow-lg hover:shadow-xl transition-all duration-300 group-data-[focus=true]:border-green-500 dark:group-data-[focus=true]:border-green-400",
                }}
                placeholder="🌱 Busca comunidades, temas, intereses sostenibles..."
                radius="full"
                size="lg"
                startContent={
                  <Icon
                    className="text-2xl text-green-500 dark:text-green-400"
                    icon="lucide:search"
                  />
                }
                type="search"
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  className={`transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                      : "bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 border border-green-200/30 dark:border-green-600/20"
                  }`}
                  endContent={
                    tab.id === "my" && userCommunities.length > 0 ? (
                      <Chip
                        className="bg-emerald-400 dark:bg-emerald-500 text-green-900 dark:text-green-100"
                        size="sm"
                      >
                        {userCommunities.length}
                      </Chip>
                    ) : null
                  }
                  size="lg"
                  startContent={<Icon className="text-lg" icon={tab.icon} />}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 p-6">
              <div className="flex items-center gap-4">
                <Icon
                  className="text-3xl text-red-500 dark:text-red-400"
                  icon="lucide:alert-triangle"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-700 dark:text-red-300">
                    ¡Algo salió mal!
                  </h3>
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
                <Button
                  className="bg-red-500/20 hover:bg-red-500/30 dark:bg-red-400/20 dark:hover:bg-red-400/30"
                  color="danger"
                  size="sm"
                  startContent={<Icon icon="lucide:x" />}
                  variant="flat"
                  onClick={() => setError(null)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Communities Network */}
        <motion.div variants={itemVariants}>
          {communities.length > 0 ? (
            <>
              {/* Network Stats */}
              <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-gray-800/80 dark:to-green-900/20 p-6 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-4 animate-pulse rounded-full bg-green-500 dark:bg-green-400" />
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {communities.length} comunidades activas
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <Chip
                      className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-200"
                      size="lg"
                      startContent={
                        <Icon
                          className="animate-bounce text-green-600 dark:text-green-400"
                          icon="lucide:users"
                        />
                      }
                      variant="flat"
                    >
                      {communities.reduce((acc, c) => acc + c.memberCount, 0)}{" "}
                      conexiones
                    </Chip>

                    <Button
                      className="bg-green-500/10 hover:bg-green-500/20 dark:bg-green-400/10 dark:hover:bg-green-400/20 text-green-700 dark:text-green-300"
                      size="sm"
                      startContent={<Icon icon="lucide:refresh-cw" />}
                      variant="flat"
                      onClick={loadCommunities}
                    >
                      Actualizar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Communities Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {communities.map((community, index) => (
                  <motion.div
                    key={community.id}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                    }}
                    whileHover={{
                      y: -4,
                      scale: 1.02,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      },
                    }}
                  >
                    <div className="absolute -inset-2 rounded-2xl bg-green-500/10 dark:bg-green-400/10 opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none" />

                    <CommunityCard
                      community={community}
                      hasPendingRequest={
                        pendingRequestsMap.get(community.id) || false
                      }
                      isCreator={creatorMap.get(community.id) || false}
                      isMember={membershipMap.get(community.id) || false}
                      isRequestSending={
                        requestSendingMap.get(community.id) || false
                      }
                      showActions={true}
                      onJoin={handleJoinCommunity}
                      onRequestMembership={handleRequestMembership}
                      onView={handleViewCommunity}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
            >
              <div className="mx-auto max-w-lg">
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 animate-pulse rounded-full bg-green-100 dark:bg-green-900/30" />
                  </div>
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className="text-8xl text-green-400 dark:text-green-500 animate-bounce"
                      icon={
                        searchTerm.trim()
                          ? "lucide:search-x"
                          : "lucide:users-round"
                      }
                    />
                  </div>
                </div>

                <h3 className="mb-4 text-3xl font-bold text-gray-700 dark:text-gray-300">
                  {searchTerm.trim()
                    ? "🔍 Sin resultados"
                    : "🌱 ¡Construyamos comunidades sostenibles!"}
                </h3>

                <p className="mb-8 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
                  {searchTerm.trim()
                    ? "No encontramos comunidades que coincidan con tu búsqueda. ¡Pero puedes crear la primera comunidad sostenible!"
                    : "Las mejores ideas nacen cuando las personas se conectan por un propósito común. Sé el pionero del cambio sostenible."}
                </p>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  {searchTerm.trim() && (
                    <Button
                      className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300"
                      size="lg"
                      startContent={<Icon icon="lucide:search" />}
                      variant="flat"
                      onPress={() => setSearchTerm("")}
                    >
                      Explorar todas
                    </Button>
                  )}
                  <Button
                    className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white shadow-xl hover:shadow-2xl"
                    size="lg"
                    startContent={<Icon icon="lucide:users-plus" />}
                    onPress={() => setShowCreateModal(true)}
                  >
                    🚀 Crear comunidad sostenible
                  </Button>
                </div>

                <div className="mt-8 rounded-2xl bg-green-50 dark:bg-green-900/20 p-6 border border-green-200/50 dark:border-green-700/30">
                  <p className="text-sm font-medium italic text-green-700 dark:text-green-300">
                    &ldquo;La sostenibilidad se logra mejor cuando las
                    comunidades trabajan juntas hacia un futuro más
                    verde.&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    — Equipo GreenLoop
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div className="fixed bottom-8 right-8" variants={itemVariants}>
          <Button
            isIconOnly
            className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white shadow-2xl hover:shadow-3xl border border-green-400/20 dark:border-green-500/30"
            radius="full"
            size="lg"
            onClick={() => setShowCreateModal(true)}
          >
            <Icon className="text-2xl" icon="lucide:plus" />
          </Button>
        </motion.div>
      </motion.div>

      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCommunity}
      />
    </div>
  );
};

export default ComunidadPage;
