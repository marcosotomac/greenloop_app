import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@heroui/react";

import PostCard from "@/components/posts/postCard";
import { getRecentPosts } from "@/api/api";
import { PostResponse } from "@/types/interfaces";

const PublicacionesPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DONATION" | "EXCHANGE">(
    "ALL"
  );
  const [sortBy, setSortBy] = useState<"RECENT" | "ALPHABETICAL">("RECENT");
  const navigate = useNavigate();

  // Animation variants
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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRecentPosts();

      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar actualizaciones de posts individuales
  const handlePostUpdate = (updatedPost: PostResponse) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.postId === updatedPost.postId ? updatedPost : post
      )
    );
  };

  // Filter and sort posts based on search, type filter, and sort criteria
  const getFilteredAndSortedPosts = () => {
    let filtered = posts;

    // Filter by search value (title)
    if (searchValue.trim()) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Filter by type (donation/exchange)
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((post) => post.wanted === typeFilter);
    }

    // Sort posts
    if (sortBy === "ALPHABETICAL") {
      filtered = [...filtered].sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );
    } else {
      // Sort by date (most recent first)
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return filtered;
  };

  const filteredAndSortedPosts = getFilteredAndSortedPosts();

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <Button color="primary" onClick={fetchPosts}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        animate="show"
        className="w-full px-4 py-8 sm:px-6 lg:px-8"
        initial="hidden"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="text-white">
                <div className="mb-2 flex items-center gap-3">
                  <Icon className="text-3xl" icon="lucide:megaphone" />
                  <h1 className="text-3xl font-bold md:text-4xl">
                    Publicaciones
                  </h1>
                </div>
                <p className="text-lg text-white/90">
                  Descubre y comparte recursos de manera sostenible
                </p>
                <div className="mt-4 flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Icon className="text-lg" icon="lucide:users" />
                    <span className="text-sm">
                      {posts.length} publicaciones
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className="text-lg" icon="lucide:leaf" />
                    <span className="text-sm">Comunidad eco-friendly</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
                  size="lg"
                  startContent={<Icon className="text-xl" icon="lucide:plus" />}
                  onClick={() => navigate("/create-post")}
                >
                  Nueva Publicación
                </Button>
                <Button
                  className="border-2 border-white/40 bg-transparent text-white transition-all duration-300 hover:bg-white/10"
                  size="lg"
                  startContent={
                    <Icon className="text-xl" icon="lucide:refresh-cw" />
                  }
                  variant="bordered"
                  onClick={fetchPosts}
                >
                  Actualizar
                </Button>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          </div>
        </motion.div>

        <motion.div className="mb-8" variants={itemVariants}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-lg dark:bg-gray-800/80">
            <CardBody className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1">
                  <Input
                    classNames={{
                      base: "w-full",
                      inputWrapper:
                        "bg-gray-100 dark:bg-gray-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-data-[focus=true]:bg-white dark:group-data-[focus=true]:bg-gray-600",
                    }}
                    placeholder="¿Qué estás buscando? Escribe aquí..."
                    radius="lg"
                    size="lg"
                    startContent={
                      <Icon
                        className="text-xl text-gray-400"
                        icon="lucide:search"
                      />
                    }
                    type="search"
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                </div>

                <div className="flex min-w-fit flex-col gap-3 sm:flex-row">
                  <Dropdown backdrop="blur">
                    <DropdownTrigger>
                      <Button
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        endContent={
                          <Icon
                            className="text-sm"
                            icon="lucide:chevron-down"
                          />
                        }
                        size="lg"
                        startContent={
                          <Icon className="text-lg" icon="lucide:filter" />
                        }
                      >
                        {typeFilter === "ALL"
                          ? "Todos"
                          : typeFilter === "DONATION"
                            ? "Donaciones"
                            : "Intercambios"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Filtros por tipo"
                      className="min-w-[200px]"
                      itemClasses={{
                        base: "gap-4",
                      }}
                      onAction={(key) =>
                        setTypeFilter(key as "ALL" | "DONATION" | "EXCHANGE")
                      }
                    >
                      <DropdownItem
                        key="ALL"
                        startContent={
                          <Icon className="text-blue-500" icon="lucide:globe" />
                        }
                      >
                        Todos los tipos
                      </DropdownItem>
                      <DropdownItem
                        key="DONATION"
                        startContent={
                          <Icon className="text-red-500" icon="lucide:heart" />
                        }
                      >
                        Donaciones
                      </DropdownItem>
                      <DropdownItem
                        key="EXCHANGE"
                        startContent={
                          <Icon
                            className="text-green-500"
                            icon="lucide:arrow-right-left"
                          />
                        }
                      >
                        Intercambios
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Dropdown backdrop="blur">
                    <DropdownTrigger>
                      <Button
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        endContent={
                          <Icon
                            className="text-sm"
                            icon="lucide:chevron-down"
                          />
                        }
                        size="lg"
                        startContent={
                          <Icon
                            className="text-lg"
                            icon="lucide:arrow-up-down"
                          />
                        }
                      >
                        {sortBy === "RECENT" ? "Recientes" : "A-Z"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Ordenar por"
                      className="min-w-[200px]"
                      itemClasses={{
                        base: "gap-4",
                      }}
                      onAction={(key) =>
                        setSortBy(key as "RECENT" | "ALPHABETICAL")
                      }
                    >
                      <DropdownItem
                        key="RECENT"
                        startContent={
                          <Icon className="text-blue-500" icon="lucide:clock" />
                        }
                      >
                        Más recientes
                      </DropdownItem>
                      <DropdownItem
                        key="ALPHABETICAL"
                        startContent={
                          <Icon
                            className="text-green-500"
                            icon="lucide:sort-asc"
                          />
                        }
                      >
                        Alfabético (A-Z)
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>

              {/* Filter chips */}
              {(searchValue.trim() || typeFilter !== "ALL") && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-600">
                  {searchValue.trim() && (
                    <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                      <Icon className="text-xs" icon="lucide:search" />
                      <span>&quot;{searchValue}&quot;</span>
                      <button onClick={() => setSearchValue("")}>
                        <Icon
                          className="text-xs hover:text-red-500"
                          icon="lucide:x"
                        />
                      </button>
                    </div>
                  )}
                  {typeFilter !== "ALL" && (
                    <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      <Icon
                        className="text-xs"
                        icon={
                          typeFilter === "DONATION"
                            ? "lucide:heart"
                            : "lucide:arrow-right-left"
                        }
                      />
                      <span>
                        {typeFilter === "DONATION"
                          ? "Donaciones"
                          : "Intercambios"}
                      </span>
                      <button onClick={() => setTypeFilter("ALL")}>
                        <Icon
                          className="text-xs hover:text-red-500"
                          icon="lucide:x"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Posts Grid */}
        <motion.div variants={itemVariants}>
          {filteredAndSortedPosts.length > 0 ? (
            <>
              {/* Stats bar */}
              <div className="mb-6 rounded-2xl border border-gray-200/50 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/60">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {filteredAndSortedPosts.length} publicaciones
                        encontradas
                      </span>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Icon
                        className="text-blue-500"
                        icon="lucide:trending-up"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Ordenado por{" "}
                        {sortBy === "RECENT" ? "fecha" : "alfabético"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      className="bg-gray-100 dark:bg-gray-700"
                      size="sm"
                      startContent={<Icon icon="lucide:grid-3x3" />}
                      variant="flat"
                    >
                      Vista
                    </Button>
                  </div>
                </div>
              </div>

              {/* Masonry Grid */}
              <div className="auto-rows-max grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredAndSortedPosts.map((post, index) => (
                  <motion.div
                    key={post.postId}
                    animate={{ opacity: 1, y: 0 }}
                    className="group h-full transform transition-all duration-300 hover:shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                    }}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <PostCard post={post} onPostUpdate={handlePostUpdate} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              variants={itemVariants}
            >
              <div className="mx-auto max-w-md">
                <div className="mb-6">
                  <Icon
                    className="mx-auto mb-4 text-6xl text-gray-400"
                    icon={
                      searchValue.trim() || typeFilter !== "ALL"
                        ? "lucide:search-x"
                        : "lucide:inbox"
                    }
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
                  {searchValue.trim() || typeFilter !== "ALL"
                    ? "No se encontraron resultados"
                    : "Aún no hay publicaciones"}
                </h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  {searchValue.trim() || typeFilter !== "ALL"
                    ? "Intenta ajustar los filtros o buscar con otros términos"
                    : "Sé el primero en compartir algo con la comunidad"}
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  {(searchValue.trim() || typeFilter !== "ALL") && (
                    <Button
                      color="primary"
                      startContent={<Icon icon="lucide:refresh-cw" />}
                      variant="flat"
                      onPress={() => {
                        setSearchValue("");
                        setTypeFilter("ALL");
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                  <Button
                    color="primary"
                    startContent={<Icon icon="lucide:plus" />}
                    onPress={() => navigate("/create-post")}
                  >
                    Crear publicación
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PublicacionesPage;
