import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Spinner,
  Textarea,
  Avatar,
  Divider,
  Tooltip,
} from "@nextui-org/react";
import {
  HeartIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

import {
  WishListSummaryDto,
  WishListResponseDto,
  WishListRequestDto,
  ProductSummaryDto,
  Category,
} from "../types/wishlist";
import { wishListService } from "../services/wishListService";
import { useNotifications } from "../hooks/useNotifications";

// Add CSS animations and styles
const animations = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse-scale {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }
  
  .animate-pulse-scale {
    animation: pulse-scale 0.3s ease-in-out;
  }
  
  .custom-select {
    background-image: linear-gradient(45deg, transparent 50%, #6b7280 50%), linear-gradient(135deg, #6b7280 50%, transparent 50%);
    background-position: calc(100% - 15px) calc(1em + 2px), calc(100% - 10px) calc(1em + 2px);
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
  }
  
  .custom-select:focus {
    background-image: linear-gradient(45deg, transparent 50%, #10b981 50%), linear-gradient(135deg, #10b981 50%, transparent 50%);
  }
  
  .category-card:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .selected-category-card {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  }
  
  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = animations;
  document.head.appendChild(style);
}

const CATEGORY_DISPLAY_NAMES: Record<Category, string> = {
  ELECTRONICS: "Electrónicos",
  CLOTHING: "Ropa",
  HOME_GARDEN: "Hogar y Jardín",
  SPORTS_OUTDOOR: "Deportes y Aire Libre",
  BOOKS_MEDIA: "Libros y Medios",
  HEALTH_BEAUTY: "Salud y Belleza",
  TOYS_GAMES: "Juguetes y Juegos",
  AUTOMOTIVE: "Automotriz",
  JEWELRY_ACCESSORIES: "Joyería y Accesorios",
  FOOD_BEVERAGE: "Comida y Bebidas",
  OTHER: "Otros",
};

const CATEGORY_ICONS: Record<Category, string> = {
  ELECTRONICS: "📱",
  CLOTHING: "👕",
  HOME_GARDEN: "🏠",
  SPORTS_OUTDOOR: "⚽",
  BOOKS_MEDIA: "📚",
  HEALTH_BEAUTY: "💄",
  TOYS_GAMES: "🎮",
  AUTOMOTIVE: "🚗",
  JEWELRY_ACCESSORIES: "💎",
  FOOD_BEVERAGE: "🍕",
  OTHER: "📦",
};

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<WishListSummaryDto[]>([]);
  const [selectedWishlist, setSelectedWishlist] =
    useState<WishListResponseDto | null>(null);
  const [matchingProducts, setMatchingProducts] = useState<ProductSummaryDto[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">(
    "ALL"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<WishListRequestDto>({
    name: "",
    description: "",
    desiredCategories: [Category.OTHER],
    isPublic: false,
  });
  const [editingWishlist, setEditingWishlist] =
    useState<WishListResponseDto | null>(null);

  // Modal controls
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();

  const { addNotification } = useNotifications();

  // Load wishlists on component mount
  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      const data = await wishListService.getUserWishLists();
      setWishlists(data);
    } catch (error) {
      console.error("Error loading wishlists:", error);
      addNotification("error", "Error", "Error al cargar las listas de deseos");
    } finally {
      setLoading(false);
    }
  };

  const loadMatchingProducts = async (wishlistId: number) => {
    try {
      const products = await wishListService.getMatchingProducts(wishlistId);
      setMatchingProducts(products);
    } catch (error) {
      console.error("Error loading matching products:", error);
      addNotification("error", "Error", "Error al cargar productos sugeridos");
    }
  };

  const handleCreateWishlist = async () => {
    try {
      setActionLoading(true);
      await wishListService.createWishList(formData);
      addNotification(
        "success",
        "Éxito",
        "Lista de deseos creada exitosamente"
      );
      resetForm();
      onCreateClose();
      loadWishlists();
    } catch (error) {
      console.error("Error creating wishlist:", error);
      addNotification("error", "Error", "Error al crear la lista de deseos");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateWishlist = async () => {
    if (!editingWishlist) return;

    try {
      setActionLoading(true);
      await wishListService.updateWishList(editingWishlist.id, formData);
      addNotification(
        "success",
        "Éxito",
        "Lista de deseos actualizada exitosamente"
      );
      resetForm();
      onEditClose();
      loadWishlists();
    } catch (error) {
      console.error("Error updating wishlist:", error);
      addNotification(
        "error",
        "Error",
        "Error al actualizar la lista de deseos"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWishlist = async (wishlistId: number) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta lista de deseos?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await wishListService.deleteWishList(wishlistId);
      addNotification(
        "success",
        "Éxito",
        "Lista de deseos eliminada exitosamente"
      );
      loadWishlists();
      if (selectedWishlist?.id === wishlistId) {
        onDetailClose();
      }
    } catch (error) {
      console.error("Error deleting wishlist:", error);
      addNotification("error", "Error", "Error al eliminar la lista de deseos");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveProductFromWishlist = async (
    wishlistId: number,
    productId: number
  ) => {
    try {
      setActionLoading(true);
      await wishListService.removeFromWishList(wishlistId, productId);
      addNotification(
        "success",
        "Éxito",
        "Producto eliminado de la lista de deseos"
      );

      // Update the selected wishlist if it's currently being viewed
      if (selectedWishlist?.id === wishlistId) {
        const updatedWishlist = await wishListService.getWishList(wishlistId);
        setSelectedWishlist(updatedWishlist);
      }

      loadWishlists();
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
      addNotification(
        "error",
        "Error",
        "Error al eliminar el producto de la lista"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProductToWishlist = async (
    wishlistId: number,
    productId: number
  ) => {
    try {
      setActionLoading(true);
      await wishListService.addToWishList({
        wishListId: wishlistId,
        productId,
      });
      addNotification(
        "success",
        "Éxito",
        "Producto agregado a la lista de deseos"
      );

      // Update the selected wishlist if it's currently being viewed
      if (selectedWishlist?.id === wishlistId) {
        const updatedWishlist = await wishListService.getWishList(wishlistId);
        setSelectedWishlist(updatedWishlist);
      }

      loadWishlists();
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      addNotification(
        "error",
        "Error",
        "Error al agregar el producto a la lista"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    onCreateOpen();
  };

  const openEditModal = (wishlist: WishListSummaryDto) => {
    setEditingWishlist(wishlist as any); // Store the wishlist being edited
    setFormData({
      name: wishlist.name,
      description: wishlist.description || "",
      desiredCategories: wishlist.desiredCategories,
      isPublic: wishlist.isPublic,
    });
    onEditOpen();
  };

  const openDetailModal = async (wishlist: WishListSummaryDto) => {
    try {
      const fullWishlist = await wishListService.getWishList(wishlist.id);
      setSelectedWishlist(fullWishlist);
      loadMatchingProducts(wishlist.id);
      onDetailOpen();
    } catch (error) {
      console.error("Error loading wishlist details:", error);
      addNotification(
        "error",
        "Error",
        "Error al cargar los detalles de la lista"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      desiredCategories: [Category.OTHER],
      isPublic: false,
    });
    setEditingWishlist(null);
  };

  // Filter wishlists based on search and category
  const filteredWishlists = wishlists.filter((wishlist) => {
    const matchesSearch =
      wishlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wishlist.description &&
        wishlist.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "ALL" ||
      wishlist.desiredCategories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const getPrivacyColor = (isPublic: boolean) => {
    return isPublic ? "success" : "danger";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-full lg:max-w-[95%]">
        {/* Enhanced Header with gradient background */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <HeartSolidIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Mis Listas de Deseos
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {wishlists.length} listas activas
                        </span>
                      </div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-500">
                        {wishlists.reduce((acc, w) => acc + w.productCount, 0)}{" "}
                        productos guardados
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                  Organiza tus productos favoritos en listas personalizadas y
                  descubre nuevas recomendaciones
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  color="success"
                  size="lg"
                  startContent={<PlusIcon className="w-5 h-5" />}
                  onPress={openCreateModal}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Nueva Lista
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar en tus listas de deseos..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                }
                isClearable
                onClear={() => setSearchTerm("")}
                className="w-full"
                classNames={{
                  input: "text-lg",
                  inputWrapper:
                    "h-12 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-200/50 hover:border-green-300 focus-within:border-green-400 transition-colors duration-200",
                }}
              />
            </div>
            <div className="flex gap-3">
              {/* Custom Category Filter Dropdown */}
              <div className="relative w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as Category | "ALL")
                  }
                  className="w-full h-12 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-green-300 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="ALL" className="bg-white dark:bg-gray-800">
                    🔍 Todas las categorías
                  </option>
                  {Object.entries(CATEGORY_DISPLAY_NAMES).map(
                    ([key, value]) => (
                      <option
                        key={key}
                        value={key}
                        className="bg-white dark:bg-gray-800"
                      >
                        {CATEGORY_ICONS[key as Category]} {value}
                      </option>
                    )
                  )}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex gap-2 bg-gray-100/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl p-1">
                <Button
                  isIconOnly
                  variant={viewMode === "grid" ? "solid" : "light"}
                  color={viewMode === "grid" ? "success" : "default"}
                  onPress={() => setViewMode("grid")}
                  className={`w-10 h-10 transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                      : "hover:bg-white/60 dark:hover:bg-gray-600/60"
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </Button>
                <Button
                  isIconOnly
                  variant={viewMode === "list" ? "solid" : "light"}
                  color={viewMode === "list" ? "success" : "default"}
                  onPress={() => setViewMode("list")}
                  className={`w-10 h-10 transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                      : "hover:bg-white/60 dark:hover:bg-gray-600/60"
                  }`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wishlists Grid/List */}
        {filteredWishlists.length === 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl blur-3xl" />
            <Card className="relative py-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 shadow-xl">
              <CardBody className="text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-2xl transform scale-150" />
                  <div className="relative p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl inline-block shadow-2xl">
                    <HeartIcon className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  {wishlists.length === 0
                    ? "¡Comienza tu colección de deseos!"
                    : "No se encontraron listas"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                  {wishlists.length === 0
                    ? "Crea tu primera lista de deseos para organizar todos esos productos que te encantan"
                    : "Prueba ajustando los filtros de búsqueda o crea una nueva lista"}
                </p>
                {wishlists.length === 0 && (
                  <Button
                    color="success"
                    size="lg"
                    onPress={openCreateModal}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Crear Primera Lista
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
            }
          >
            {filteredWishlists.map((wishlist, index) => (
              <div
                key={wishlist.id}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="relative h-full hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 overflow-hidden group-hover:border-green-200/50">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardBody className="relative p-6 h-full flex flex-col">
                    {/* Header with actions */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <HeartSolidIcon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                            {wishlist.name}
                          </h3>
                        </div>
                        {wishlist.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
                            {wishlist.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Tooltip content="Ver detalles" placement="top">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors duration-200"
                            onPress={() => openDetailModal(wishlist)}
                          >
                            <EyeIcon className="w-4 h-4 text-green-600" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Editar" placement="top">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors duration-200"
                            onPress={() => openEditModal(wishlist)}
                          >
                            <PencilIcon className="w-4 h-4 text-green-600" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar" placement="top">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            className="hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-200"
                            onPress={() => handleDeleteWishlist(wishlist.id)}
                            isLoading={actionLoading}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Categories and Privacy */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {wishlist.desiredCategories
                        .slice(0, 3)
                        .map((category) => (
                          <Chip
                            key={category}
                            size="sm"
                            variant="flat"
                            className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50"
                          >
                            {CATEGORY_DISPLAY_NAMES[category]}
                          </Chip>
                        ))}
                      {wishlist.desiredCategories.length > 3 && (
                        <Chip
                          size="sm"
                          variant="flat"
                          className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          +{wishlist.desiredCategories.length - 3} más
                        </Chip>
                      )}
                      <Chip
                        size="sm"
                        variant="flat"
                        className={`${
                          wishlist.isPublic
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200/50"
                            : "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200/50"
                        }`}
                      >
                        {wishlist.isPublic ? "🌍 Público" : "🔒 Privado"}
                      </Chip>
                    </div>

                    {/* Stats and Action */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <HeartSolidIcon className="w-4 h-4 text-red-500" />
                          </div>
                          <span className="font-medium">
                            {wishlist.productCount}
                          </span>
                          <span className="text-xs">productos</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium px-4 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        onPress={() => openDetailModal(wishlist)}
                      >
                        Ver Lista
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Create Wishlist Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          size="2xl"
          backdrop="blur"
        >
          <ModalContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-white/20">
            <ModalHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <PlusIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Crear Nueva Lista de Deseos
                </h2>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                <Input
                  label="Nombre de la lista"
                  placeholder="Ej: Productos para el hogar"
                  value={formData.name}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  classNames={{
                    inputWrapper:
                      "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 hover:border-green-300 focus-within:border-green-400",
                  }}
                />
                <Textarea
                  label="Descripción (opcional)"
                  placeholder="Describe tu lista de deseos..."
                  value={formData.description}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                  maxRows={3}
                  classNames={{
                    inputWrapper:
                      "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 hover:border-green-300 focus-within:border-green-400",
                  }}
                />
                {/* Custom Category Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categorías deseadas <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 transition-colors duration-200 hover:border-green-300 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/20">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.values(Category).map((category) => {
                        const isSelected =
                          formData.desiredCategories.includes(category);
                        return (
                          <label
                            key={category}
                            className={`
                              category-card relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300
                              ${
                                isSelected
                                  ? "selected-category-card text-white shadow-lg scale-105"
                                  : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50"
                              }
                              border ${isSelected ? "border-green-400" : "border-gray-200 dark:border-gray-600"}
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setFormData((prev) => ({
                                  ...prev,
                                  desiredCategories: isChecked
                                    ? [...prev.desiredCategories, category]
                                    : prev.desiredCategories.filter(
                                        (c) => c !== category
                                      ),
                                }));
                              }}
                              className="sr-only"
                            />
                            <div
                              className={`
                              flex-shrink-0 w-4 h-4 mr-2 rounded border-2 transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-white border-white"
                                  : "bg-transparent border-gray-400 dark:border-gray-500"
                              }
                            `}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-green-500 mt-0.5 ml-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span
                              className={`text-xs font-medium ${isSelected ? "text-white" : ""} flex items-center gap-1`}
                            >
                              <span className="text-base">
                                {CATEGORY_ICONS[category]}
                              </span>
                              {CATEGORY_DISPLAY_NAMES[category]}
                            </span>
                            {isSelected && (
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg"></div>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    {formData.desiredCategories.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                        <div className="flex flex-wrap gap-2">
                          {formData.desiredCategories.map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm"
                            >
                              {CATEGORY_DISPLAY_NAMES[category]}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    desiredCategories:
                                      prev.desiredCategories.filter(
                                        (c) => c !== category
                                      ),
                                  }));
                                }}
                                className="ml-2 hover:text-gray-200 transition-colors duration-200"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.desiredCategories.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Selecciona al menos una categoría
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="isPublic"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    🌍 Hacer esta lista pública (otros usuarios podrán verla)
                  </label>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-gray-200/50 dark:border-gray-700/50">
              <Button
                variant="light"
                onPress={onCreateClose}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onPress={handleCreateWishlist}
                isLoading={actionLoading}
                isDisabled={
                  !formData.name.trim() ||
                  formData.desiredCategories.length === 0
                }
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Crear Lista
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Wishlist Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={onEditClose}
          size="2xl"
          backdrop="blur"
        >
          <ModalContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-white/20">
            <ModalHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <PencilIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Editar Lista de Deseos
                </h2>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                <Input
                  label="Nombre de la lista"
                  placeholder="Ej: Productos para el hogar"
                  value={formData.name}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  classNames={{
                    inputWrapper:
                      "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 hover:border-blue-300 focus-within:border-blue-400",
                  }}
                />
                <Textarea
                  label="Descripción (opcional)"
                  placeholder="Describe tu lista de deseos..."
                  value={formData.description}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                  maxRows={3}
                  classNames={{
                    inputWrapper:
                      "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 hover:border-blue-300 focus-within:border-blue-400",
                  }}
                />

                {/* Custom Category Selector for Edit */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categorías deseadas <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 transition-colors duration-200 hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.values(Category).map((category) => {
                        const isSelected =
                          formData.desiredCategories.includes(category);
                        return (
                          <label
                            key={category}
                            className={`
                              category-card relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300
                              ${
                                isSelected
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                                  : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50"
                              }
                              border ${isSelected ? "border-blue-400" : "border-gray-200 dark:border-gray-600"}
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setFormData((prev) => ({
                                  ...prev,
                                  desiredCategories: isChecked
                                    ? [...prev.desiredCategories, category]
                                    : prev.desiredCategories.filter(
                                        (c) => c !== category
                                      ),
                                }));
                              }}
                              className="sr-only"
                            />
                            <div
                              className={`
                              flex-shrink-0 w-4 h-4 mr-2 rounded border-2 transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-white border-white"
                                  : "bg-transparent border-gray-400 dark:border-gray-500"
                              }
                            `}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-blue-500 mt-0.5 ml-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span
                              className={`text-xs font-medium ${isSelected ? "text-white" : ""} flex items-center gap-1`}
                            >
                              <span className="text-base">
                                {CATEGORY_ICONS[category]}
                              </span>
                              {CATEGORY_DISPLAY_NAMES[category]}
                            </span>
                            {isSelected && (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg"></div>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    {formData.desiredCategories.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                        <div className="flex flex-wrap gap-2">
                          {formData.desiredCategories.map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                            >
                              {CATEGORY_DISPLAY_NAMES[category]}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    desiredCategories:
                                      prev.desiredCategories.filter(
                                        (c) => c !== category
                                      ),
                                  }));
                                }}
                                className="ml-2 hover:text-gray-200 transition-colors duration-200"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.desiredCategories.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Selecciona al menos una categoría
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                  <input
                    type="checkbox"
                    id="isPublicEdit"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="isPublicEdit"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    🌍 Hacer esta lista pública (otros usuarios podrán verla)
                  </label>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-gray-200/50 dark:border-gray-700/50">
              <Button
                variant="light"
                onPress={onEditClose}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onPress={handleUpdateWishlist}
                isLoading={actionLoading}
                isDisabled={
                  !formData.name.trim() ||
                  formData.desiredCategories.length === 0
                }
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">
                {selectedWishlist?.name}
              </h2>
              {selectedWishlist?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedWishlist.description}
                </p>
              )}
            </ModalHeader>
            <ModalBody>
              {selectedWishlist && (
                <div className="space-y-6">
                  {/* Wishlist Info */}
                  <div className="flex flex-wrap gap-2">
                    {selectedWishlist.desiredCategories.map((category) => (
                      <Chip key={category} variant="flat" color="primary">
                        {CATEGORY_DISPLAY_NAMES[category]}
                      </Chip>
                    ))}
                    <Chip
                      variant="flat"
                      color={getPrivacyColor(selectedWishlist.isPublic)}
                    >
                      {selectedWishlist.isPublic ? "Público" : "Privado"}
                    </Chip>
                    <Chip variant="flat">
                      {selectedWishlist.products.length} productos
                    </Chip>
                  </div>

                  <Divider />

                  {/* Products in Wishlist */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Productos en tu lista
                    </h3>
                    {selectedWishlist.products.length === 0 ? (
                      <div className="text-center py-8">
                        <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                          No hay productos en esta lista
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedWishlist.products.map((product) => (
                          <Card
                            key={product.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardBody className="p-4">
                              <div className="flex gap-3">
                                <Avatar
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-16 h-16 flex-shrink-0"
                                  fallback={
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">
                                        IMG
                                      </span>
                                    </div>
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {CATEGORY_DISPLAY_NAMES[product.category]}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-green-600">
                                      ${product.price}
                                    </span>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      color="danger"
                                      onPress={() =>
                                        handleRemoveProductFromWishlist(
                                          selectedWishlist.id,
                                          product.id
                                        )
                                      }
                                      isLoading={actionLoading}
                                    >
                                      <XMarkIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Matching Products */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Productos sugeridos
                    </h3>
                    {matchingProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                          No hay productos sugeridos en este momento
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matchingProducts.map((product) => (
                          <Card
                            key={product.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardBody className="p-4">
                              <div className="flex gap-3">
                                <Avatar
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-16 h-16 flex-shrink-0"
                                  fallback={
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">
                                        IMG
                                      </span>
                                    </div>
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {CATEGORY_DISPLAY_NAMES[product.category]}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-green-600">
                                      ${product.price}
                                    </span>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      color="success"
                                      onPress={() =>
                                        handleAddProductToWishlist(
                                          selectedWishlist.id,
                                          product.id
                                        )
                                      }
                                      isLoading={actionLoading}
                                    >
                                      <PlusIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onDetailClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
