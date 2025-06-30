import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  useDisclosure,
  Progress,
} from "@heroui/react";
import {
  MapPin,
  Calendar,
  Edit3,
  Plus,
  Trophy,
  Star,
  Gift,
  RefreshCw,
  MessageSquare,
  Package,
  Heart,
  Users,
  Settings,
  Share2,
  Trash2,
  Eye,
  Edit,
  ChevronRight,
  Award,
  TrendingUp,
  Zap,
  FileText,
  Home,
  Clock,
  ExternalLink,
  Activity,
  Target,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  Repeat,
  Tag,
  DollarSign,
  Calendar as CalendarIcon,
} from "lucide-react";

import { useUser } from "@/contexts/UserContext";
import { getUserProfileById } from "@/api/api";
import { productService } from "@/services/productService";
import { wishListService } from "@/services/wishListService";
import { donationService } from "@/services/donationService";
import { postService } from "@/services/postService";
import userService, { UpdateProfileRequest } from "@/services/userService";

import EditProfileModal from "@/components/EditProfileModal";

import type { UserProfileResponse } from "@/types/interfaces";
import type { ProductResponseDto } from "@/services/productService";
import type { WishListSummaryDto, Category } from "@/types/wishlist";
import type { DonationSummaryDto } from "@/types/donation";
import type { PostResponseDto, PostRequestDto } from "@/services/postService";

const MyProfile: React.FC = () => {
  const { user: currentUser, loading: userLoading } = useUser();
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(
    null
  );
  const [userProducts, setUserProducts] = useState<ProductResponseDto[]>([]);
  const [userWishLists, setUserWishLists] = useState<WishListSummaryDto[]>([]);
  const [userDonations, setUserDonations] = useState<DonationSummaryDto[]>([]);
  const [userPosts, setUserPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Loading states for better UX
  const [operationLoading, setOperationLoading] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    type: string;
    id: number;
  } | null>(null);

  // Estados para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmAction: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmAction: () => {},
  });

  // Estados para modales
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isProductOpen,
    onOpen: onProductOpen,
    onClose: onProductClose,
  } = useDisclosure();
  const {
    isOpen: isPostOpen,
    onOpen: onPostOpen,
    onClose: onPostClose,
  } = useDisclosure();
  const {
    isOpen: isWishListOpen,
    onOpen: onWishListOpen,
    onClose: onWishListClose,
  } = useDisclosure();

  // Estados para edición
  const [editingProduct, setEditingProduct] =
    useState<ProductResponseDto | null>(null);
  const [editingPost, setEditingPost] = useState<PostResponseDto | null>(null);
  const [editingWishList, setEditingWishList] =
    useState<WishListSummaryDto | null>(null);

  // Estados para formularios
  const [productForm, setProductForm] = useState({
    productName: "",
    description: "",
    category: "",
    condition: "",
    estimatedValue: "",
    imageUrl: "",
    availableForExchange: true,
  });

  const [postForm, setPostForm] = useState<PostRequestDto>({
    title: "",
    content: "",
    imageUrl: "",
    wanted: "DONATION" as "DONATION" | "EXCHANGE",
    location: "",
  });

  const [wishListForm, setWishListForm] = useState({
    name: "",
    description: "",
    isPublic: false,
    desiredCategories: [] as Category[],
  });

  // Función para obtener las iniciales del usuario
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  // Reset forms
  const resetPostForm = () => {
    setPostForm({
      title: "",
      content: "",
      imageUrl: "",
      wanted: "DONATION",
      location: "",
    });
    setEditingPost(null);
  };

  const resetProductForm = () => {
    setProductForm({
      productName: "",
      description: "",
      category: "",
      condition: "",
      estimatedValue: "",
      imageUrl: "",
      availableForExchange: true,
    });
    setEditingProduct(null);
  };

  // Confirmation dialog utility
  const showConfirmDialog = (
    title: string,
    message: string,
    confirmAction: () => void
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmAction,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      confirmAction: () => {},
    });
  };

  // Handler para actualizar perfil
  const handleUpdateProfile = async (profileData: UpdateProfileRequest) => {
    setIsEditingProfile(true);

    try {
      const updatedProfile = await userService.updateProfile(profileData);

      setProfileData(updatedProfile);

      // Mostrar mensaje de éxito (opcional)
      // toast.success("Perfil actualizado exitosamente");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al actualizar perfil:", error);
      // toast.error("Error al actualizar el perfil");
      throw error;
    } finally {
      setIsEditingProfile(false);
    }
  };

  // CRUD handlers for posts with enhanced UX
  const handleCreatePost = async () => {
    setOperationLoading(true);
    try {
      const newPost = await postService.createPost(postForm);
      setUserPosts((prev) => [newPost, ...prev]);
      resetPostForm();
      onPostClose();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    setOperationLoading(true);
    try {
      const updatedPost = await postService.updatePost(
        editingPost.postId,
        postForm
      );
      setUserPosts((prev) =>
        prev.map((post) =>
          post.postId === editingPost.postId ? updatedPost : post
        )
      );
      resetPostForm();
      onPostClose();
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    const confirmDelete = () => {
      setDeletingItem({ type: "post", id: postId });
      postService
        .deletePost(postId)
        .then(() => {
          setUserPosts((prev) => prev.filter((post) => post.postId !== postId));
        })
        .catch((error) => {
          console.error("Error deleting post:", error);
        })
        .finally(() => {
          setDeletingItem(null);
          closeConfirmDialog();
        });
    };

    showConfirmDialog(
      "Eliminar Post",
      "¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.",
      confirmDelete
    );
  };

  const handleEditPost = (post: PostResponseDto) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || "",
      wanted: post.wanted,
      location: post.location,
    });
    onPostOpen();
  };

  // CRUD handlers for wishlists with enhanced UX
  const handleCreateWishList = async () => {
    setOperationLoading(true);
    try {
      const newWishList = await wishListService.createWishList({
        name: wishListForm.name,
        description: wishListForm.description,
        isPublic: wishListForm.isPublic,
        desiredCategories: wishListForm.desiredCategories,
      });

      setUserWishLists((prev) => [newWishList, ...prev]);
      setEditingWishList(null);
      setWishListForm({
        name: "",
        description: "",
        isPublic: false,
        desiredCategories: [],
      });
      onWishListClose();
    } catch (error) {
      console.error("Error creating wishlist:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateWishList = async () => {
    if (!editingWishList) return;
    setOperationLoading(true);
    try {
      const updatedWishList = await wishListService.updateWishList(
        editingWishList.id,
        {
          name: wishListForm.name,
          description: wishListForm.description,
          isPublic: wishListForm.isPublic,
          desiredCategories: wishListForm.desiredCategories,
        }
      );

      setUserWishLists((prev) =>
        prev.map((wishList) =>
          wishList.id === editingWishList.id ? updatedWishList : wishList
        )
      );
      setEditingWishList(null);
      setWishListForm({
        name: "",
        description: "",
        isPublic: false,
        desiredCategories: [],
      });
      onWishListClose();
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditWishList = (wishList: WishListSummaryDto) => {
    setEditingWishList(wishList);
    setWishListForm({
      name: wishList.name,
      description: wishList.description || "",
      isPublic: wishList.isPublic,
      desiredCategories: wishList.desiredCategories || [],
    });
    onWishListOpen();
  };

  const handleDeleteWishList = async (wishListId: number) => {
    try {
      await wishListService.deleteWishList(wishListId);
      setUserWishLists((prev) => prev.filter((wl) => wl.id !== wishListId));
    } catch (error) {
      console.error("Error deleting wishlist:", error);
    }
  };

  // CRUD handlers for products with enhanced UX
  const handleCreateProduct = async () => {
    setOperationLoading(true);
    try {
      const newProduct = await productService.createProduct({
        productName: productForm.productName,
        description: productForm.description,
        category: productForm.category,
        condition: productForm.condition,
        estimatedValue: parseFloat(productForm.estimatedValue) || 0,
        imageUrl: productForm.imageUrl,
        availableForExchange: productForm.availableForExchange,
      });

      setUserProducts((prev) => [newProduct, ...prev]);
      resetProductForm();
      onProductClose();
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setOperationLoading(true);
    try {
      const updatedProduct = await productService.updateProduct(
        editingProduct.productId,
        {
          productName: productForm.productName,
          description: productForm.description,
          category: productForm.category,
          condition: productForm.condition,
          estimatedValue: parseFloat(productForm.estimatedValue) || 0,
          imageUrl: productForm.imageUrl,
          availableForExchange: productForm.availableForExchange,
        }
      );

      setUserProducts((prev) =>
        prev.map((product) =>
          product.productId === editingProduct.productId
            ? updatedProduct
            : product
        )
      );
      resetProductForm();
      onProductClose();
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const confirmDelete = () => {
      setDeletingItem({ type: "product", id: productId });
      productService
        .deleteProduct(productId)
        .then(() => {
          setUserProducts((prev) =>
            prev.filter((product) => product.productId !== productId)
          );
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
        })
        .finally(() => {
          setDeletingItem(null);
          closeConfirmDialog();
        });
    };

    showConfirmDialog(
      "Eliminar Producto",
      "¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.",
      confirmDelete
    );
  };

  const handleEditProduct = (product: ProductResponseDto) => {
    setEditingProduct(product);
    setProductForm({
      productName: product.productName,
      description: product.description,
      category: product.category || "",
      condition: product.condition || "",
      estimatedValue: product.estimatedValue?.toString() || "",
      imageUrl: product.imageUrl || "",
      availableForExchange: product.availableForExchange,
    });
    onProductOpen();
  };

  const fetchProfileData = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);

      // Obtener datos del perfil
      const profile = await getUserProfileById({ userId: currentUser.id });

      setProfileData(profile);

      // Obtener productos del usuario
      try {
        const products = await productService.getUserActiveProducts();

        setUserProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        setUserProducts([]);
      }

      // Obtener listas de deseos
      try {
        const wishLists = await wishListService.getUserWishLists();

        setUserWishLists(wishLists);
      } catch (error) {
        console.error("Error fetching wishlists:", error);
        setUserWishLists([]);
      }

      // Obtener donaciones
      try {
        const donations = await donationService.getUserDonations();

        setUserDonations(donations);
      } catch (error) {
        console.error("Error fetching donations:", error);
        setUserDonations([]);
      }

      // Obtener posts del usuario
      try {
        // Intentar primero con getUserPosts (filtrado en el frontend)
        let posts = await postService.getUserPosts();

        // Si no hay posts, intentar con el endpoint específico por userId
        if (posts.length === 0) {
          posts = await postService.getPostsByUserId(currentUser.id);
        }

        setUserPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setUserPosts([]);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [currentUser]);

  // Función para refrescar posts (útil si se crea un post desde otra página)
  const refreshPosts = async () => {
    if (!currentUser?.id) return;

    try {
      // Intentar primero con getUserPosts (filtrado en el frontend)
      let posts = await postService.getUserPosts();

      // Si no hay posts, intentar con el endpoint específico por userId
      if (posts.length === 0) {
        posts = await postService.getPostsByUserId(currentUser.id);
      }

      setUserPosts(posts);
    } catch (error) {
      console.error("Error refreshing posts:", error);
    }
  };

  // Listener para refrescar posts cuando se navega de vuelta a la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshPosts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser]);

  // Refrescar posts cuando se cambia a la tab de posts
  useEffect(() => {
    if (activeTab === "posts") {
      refreshPosts();
    }
  }, [activeTab]);

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentUser || !profileData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card>
          <CardBody>
            <p>Error al cargar el perfil del usuario</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const userInitials = getInitials(
    `${profileData.firstName} ${profileData.lastName}`
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-7xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header del Perfil Mejorado */}
      <motion.div variants={itemVariants}>
        <Card className="mb-8 overflow-hidden">
          {/* Banner de fondo con gradiente */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-success/20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <CardBody className="relative -mt-16 pb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Avatar y datos básicos */}
              <div className="flex flex-col items-center text-center lg:text-left relative z-10">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-primary to-secondary shadow-xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-3xl">
                    {userInitials}
                  </span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="text-default-600 font-medium">
                    {profileData.email}
                  </p>

                  {/* Dirección */}
                  <div className="flex items-center gap-2">
                    {profileData.address ? (
                      <div className="flex items-center gap-2 text-default-500">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{profileData.address}</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="light"
                        color="default"
                        className="h-6 px-2 py-0 text-xs opacity-60 hover:opacity-100 transition-opacity"
                        startContent={<MapPin className="h-3 w-3" />}
                        onPress={onEditOpen}
                      >
                        Añadir dirección
                      </Button>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="flex items-start gap-2">
                    {profileData.description ? (
                      <div className="flex items-start gap-2 text-default-500">
                        <Edit3 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-5">
                          {profileData.description}
                        </span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="light"
                        color="default"
                        className="h-6 px-2 py-0 text-xs opacity-60 hover:opacity-100 transition-opacity"
                        startContent={<Edit3 className="h-3 w-3" />}
                        onPress={onEditOpen}
                      >
                        Añadir descripción
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2 justify-center lg:justify-start mt-3">
                    <Chip
                      color="primary"
                      variant="flat"
                      size="lg"
                      className="font-semibold"
                    >
                      {profileData.level}
                    </Chip>
                    <Chip
                      color="success"
                      variant="flat"
                      size="lg"
                      className="font-semibold"
                    >
                      {profileData.points} pts
                    </Chip>
                  </div>
                </div>
              </div>

              {/* Estadísticas mejoradas */}
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardBody className="text-center p-4">
                    <Icon
                      icon="lucide:trophy"
                      className="text-4xl text-primary mx-auto mb-2"
                    />
                    <div className="text-2xl font-bold text-primary">
                      {profileData.points}
                    </div>
                    <div className="text-sm text-primary/70 font-medium">
                      Puntos
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                  <CardBody className="text-center p-4">
                    <Icon
                      icon="lucide:heart"
                      className="text-4xl text-success mx-auto mb-2"
                    />
                    <div className="text-2xl font-bold text-success">
                      {profileData.itemsDonated}
                    </div>
                    <div className="text-sm text-success/70 font-medium">
                      Donaciones
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                  <CardBody className="text-center p-4">
                    <Icon
                      icon="lucide:repeat"
                      className="text-4xl text-warning mx-auto mb-2"
                    />
                    <div className="text-2xl font-bold text-warning">
                      {profileData.itemsExchanged}
                    </div>
                    <div className="text-sm text-warning/70 font-medium">
                      Intercambios
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                  <CardBody className="text-center p-4">
                    <Icon
                      icon="lucide:package"
                      className="text-4xl text-secondary mx-auto mb-2"
                    />
                    <div className="text-2xl font-bold text-secondary">
                      {profileData.totalProductsCount}
                    </div>
                    <div className="text-sm text-secondary/70 font-medium">
                      Productos
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Botón de editar mejorado */}
              <div className="flex flex-col gap-3 lg:mt-8">
                <Button
                  color="primary"
                  variant="shadow"
                  size="lg"
                  startContent={<Icon icon="lucide:edit" />}
                  onPress={onEditOpen}
                  className="font-semibold"
                >
                  Editar Perfil
                </Button>
                <Button
                  color="default"
                  variant="bordered"
                  size="lg"
                  startContent={<Icon icon="lucide:share" />}
                  className="font-medium"
                >
                  Compartir
                </Button>
              </div>
            </div>

            {/* Progreso de nivel */}
            <div className="mt-8 px-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-default-600">
                  Progreso hacia{" "}
                  {profileData.level === "BRONZE"
                    ? "SILVER"
                    : profileData.level === "SILVER"
                      ? "GOLD"
                      : "PLATINUM"}
                </span>
                <span className="text-sm font-bold text-primary">
                  {profileData.points % 1000} / 1000 pts
                </span>
              </div>
              <Progress
                value={(profileData.points % 1000) / 10}
                color="primary"
                className="w-full"
                size="md"
              />
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Tabs de contenido con diseño mejorado */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-default-50">
          <CardBody className="p-8">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              className="w-full"
              size="lg"
              variant="underlined"
              classNames={{
                tabList:
                  "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-gradient-to-r from-primary to-secondary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary",
              }}
            >
              {/* Overview */}
              <Tab
                key="overview"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:home" />
                    <span>Resumen</span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Productos Recientes */}
                  <Card>
                    <CardHeader className="flex gap-3">
                      <Icon
                        icon="lucide:package"
                        className="text-2xl text-primary"
                      />
                      <div className="flex flex-col">
                        <p className="text-md font-semibold">Mis Productos</p>
                        <p className="text-small text-default-500">
                          {userProducts.length} productos activos
                        </p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {userProducts.slice(0, 3).map((product) => (
                          <div
                            key={product.productId}
                            className="flex gap-3 items-center"
                          >
                            <img
                              src={
                                product.imageUrl || "/placeholder-product.jpg"
                              }
                              alt={product.productName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium truncate">
                                {product.productName}
                              </p>
                              <p className="text-sm text-default-500">
                                ${product.estimatedValue}
                              </p>
                            </div>
                            <Chip
                              size="sm"
                              color={
                                product.availableForExchange
                                  ? "success"
                                  : "default"
                              }
                              variant="flat"
                            >
                              {product.availableForExchange
                                ? "Intercambiable"
                                : "No disponible"}
                            </Chip>
                          </div>
                        ))}
                        <Button
                          fullWidth
                          variant="light"
                          color="primary"
                          onPress={() => setActiveTab("products")}
                        >
                          Ver todos los productos
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Listas de Deseos */}
                  <Card>
                    <CardHeader className="flex gap-3">
                      <Icon
                        icon="lucide:heart"
                        className="text-2xl text-danger"
                      />
                      <div className="flex flex-col">
                        <p className="text-md font-semibold">
                          Mis Listas de Deseos
                        </p>
                        <p className="text-small text-default-500">
                          {userWishLists.length} listas creadas
                        </p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {userWishLists.slice(0, 3).map((wishList, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">{wishList.name}</p>
                              <p className="text-sm text-default-500">
                                {wishList.productCount} productos
                              </p>
                            </div>
                            <Chip
                              size="sm"
                              color={wishList.isPublic ? "success" : "default"}
                              variant="flat"
                            >
                              {wishList.isPublic ? "Pública" : "Privada"}
                            </Chip>
                          </div>
                        ))}
                        <Button
                          fullWidth
                          variant="light"
                          color="primary"
                          onPress={() => setActiveTab("wishlist")}
                        >
                          Ver todas las listas
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Actividad Reciente */}
                  <Card>
                    <CardHeader className="flex gap-3">
                      <Icon
                        icon="lucide:activity"
                        className="text-2xl text-warning"
                      />
                      <div className="flex flex-col">
                        <p className="text-md font-semibold">
                          Actividad Reciente
                        </p>
                        <p className="text-small text-default-500">
                          Últimas acciones
                        </p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Icon icon="lucide:plus" className="text-success" />
                          <div>
                            <p className="text-sm">Producto agregado</p>
                            <p className="text-xs text-default-500">
                              Hace 2 días
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Icon icon="lucide:repeat" className="text-primary" />
                          <div>
                            <p className="text-sm">Intercambio realizado</p>
                            <p className="text-xs text-default-500">
                              Hace 1 semana
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Icon icon="lucide:heart" className="text-danger" />
                          <div>
                            <p className="text-sm">Donación realizada</p>
                            <p className="text-xs text-default-500">
                              Hace 2 semanas
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Tab>

              {/* Productos Mejorados */}
              <Tab
                key="products"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:package" />
                    <span>Productos</span>
                    <Chip size="sm" color="primary" variant="flat">
                      {userProducts.length}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-8">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-success/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                          Mis Productos
                        </h2>
                        <p className="text-default-600">
                          Gestiona tu inventario y haz intercambios increíbles
                        </p>
                      </div>
                      <Button
                        color="primary"
                        variant="shadow"
                        size="lg"
                        startContent={<Icon icon="lucide:plus" />}
                        onPress={onProductOpen}
                        className="font-semibold"
                      >
                        Agregar Producto
                      </Button>
                    </div>
                  </div>

                  {userProducts.length === 0 ? (
                    <Card className="border-dashed border-2 border-default-200">
                      <CardBody className="text-center py-16">
                        <div className="bg-gradient-to-br from-secondary/10 to-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Icon
                            icon="lucide:package"
                            className="text-4xl text-secondary"
                          />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                          No tienes productos
                        </h3>
                        <p className="text-default-500 mb-6 max-w-md mx-auto">
                          Agrega tu primer producto para comenzar a intercambiar
                          con otros usuarios
                        </p>
                        <Button
                          color="primary"
                          variant="shadow"
                          size="lg"
                          startContent={<Icon icon="lucide:plus" />}
                          onPress={onProductOpen}
                          className="font-semibold"
                        >
                          Agregar mi primer producto
                        </Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {userProducts.map((product) => (
                        <motion.div
                          key={product.productId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -8 }}
                        >
                          <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-default-50">
                            <CardBody className="p-0">
                              {/* Imagen del producto */}
                              <div className="relative overflow-hidden">
                                <img
                                  src={
                                    product.imageUrl ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={product.productName}
                                  className="w-full h-52 object-cover transition-transform duration-300 hover:scale-110"
                                />
                                <div className="absolute top-3 left-3">
                                  <Chip
                                    size="sm"
                                    color={
                                      product.availableForExchange
                                        ? "success"
                                        : "default"
                                    }
                                    variant="shadow"
                                    className="font-semibold"
                                  >
                                    {product.availableForExchange
                                      ? "Disponible"
                                      : "No disponible"}
                                  </Chip>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <Chip
                                    size="sm"
                                    color="primary"
                                    variant="shadow"
                                    className="font-bold"
                                  >
                                    ${product.estimatedValue}
                                  </Chip>
                                </div>
                              </div>

                              {/* Contenido del producto */}
                              <div className="p-5 space-y-4">
                                <div>
                                  <h3 className="font-bold text-xl line-clamp-1 text-foreground mb-2">
                                    {product.productName}
                                  </h3>
                                  <p className="text-default-600 text-sm line-clamp-2 leading-relaxed">
                                    {product.description}
                                  </p>
                                </div>

                                {/* Metadata */}
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon="lucide:tag"
                                      className="text-sm text-default-400"
                                    />
                                    <span className="text-xs text-default-500 capitalize">
                                      {product.category || "Sin categoría"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon="lucide:star"
                                      className="text-sm text-warning"
                                    />
                                    <span className="text-xs text-default-500 capitalize">
                                      {product.condition || "N/A"}
                                    </span>
                                  </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    fullWidth
                                    startContent={
                                      <Icon
                                        icon="lucide:edit"
                                        className="text-sm"
                                      />
                                    }
                                    onPress={() => handleEditProduct(product)}
                                    className="font-medium"
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    fullWidth
                                    startContent={
                                      <Icon
                                        icon="lucide:trash"
                                        className="text-sm"
                                      />
                                    }
                                    onPress={() =>
                                      handleDeleteProduct(product.productId)
                                    }
                                    className="font-medium"
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Tab>

              {/* Posts Mejorados */}
              <Tab
                key="posts"
                title={
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Posts</span>
                    <Chip size="sm" color="secondary" variant="flat">
                      {userPosts.length}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-8">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-r from-secondary/10 via-primary/10 to-purple-500/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
                          Mis Posts
                        </h2>
                        <p className="text-default-600">
                          Comparte tus ideas y conecta con la comunidad
                        </p>
                      </div>
                      <Button
                        color="secondary"
                        variant="shadow"
                        size="lg"
                        startContent={<Plus className="h-4 w-4" />}
                        onPress={() => {
                          resetPostForm();
                          onPostOpen();
                        }}
                        className="font-semibold"
                      >
                        Nuevo Post
                      </Button>
                    </div>
                  </div>

                  {userPosts.length === 0 ? (
                    <Card className="border-dashed border-2 border-default-200">
                      <CardBody className="text-center py-16">
                        <div className="bg-gradient-to-br from-purple-500/10 to-secondary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                          <FileText className="h-12 w-12 text-secondary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent">
                          No tienes posts
                        </h3>
                        <p className="text-default-500 mb-6 max-w-md mx-auto">
                          Crea tu primer post para compartir con la comunidad
                        </p>
                        <Button
                          color="secondary"
                          variant="shadow"
                          size="lg"
                          startContent={<Plus className="h-4 w-4" />}
                          onPress={() => {
                            resetPostForm();
                            onPostOpen();
                          }}
                          className="font-semibold"
                        >
                          Crear mi primer post
                        </Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {userPosts.map((post) => (
                        <motion.div
                          key={post.postId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -8 }}
                        >
                          <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-default-50">
                            <CardBody className="p-0">
                              {/* Imagen del post */}
                              {post.imageUrl && (
                                <div className="relative overflow-hidden">
                                  <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                                  />
                                  <div className="absolute top-3 left-3">
                                    <Chip
                                      size="sm"
                                      color={
                                        post.wanted === "DONATION"
                                          ? "success"
                                          : "warning"
                                      }
                                      variant="shadow"
                                      className="font-semibold"
                                    >
                                      {post.wanted === "DONATION"
                                        ? "Donación"
                                        : "Intercambio"}
                                    </Chip>
                                  </div>
                                </div>
                              )}

                              {/* Contenido del post */}
                              <div className="p-5 space-y-4">
                                <div>
                                  <h3 className="font-bold text-xl line-clamp-2 text-foreground mb-2">
                                    {post.title}
                                  </h3>
                                  <p className="text-default-600 text-sm line-clamp-3 leading-relaxed">
                                    {post.content}
                                  </p>
                                </div>

                                {/* Metadata */}
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-default-400" />
                                    <span className="text-xs text-default-500">
                                      {post.location || "Sin ubicación"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-default-400" />
                                    <span className="text-xs text-default-500">
                                      {new Date(
                                        post.publishedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    fullWidth
                                    startContent={<Edit className="h-3 w-3" />}
                                    onPress={() => handleEditPost(post)}
                                    className="font-medium"
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    fullWidth
                                    startContent={
                                      <Trash2 className="h-3 w-3" />
                                    }
                                    onPress={() =>
                                      handleDeletePost(post.postId)
                                    }
                                    className="font-medium"
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Tab>

              {/* Listas de Deseos Mejoradas */}
              <Tab
                key="wishlist"
                title={
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>Listas de Deseos</span>
                    <Chip size="sm" color="danger" variant="flat">
                      {userWishLists.length}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-8">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-r from-danger/10 via-pink-500/10 to-rose-500/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-danger to-pink-600 bg-clip-text text-transparent mb-2">
                          Mis Listas de Deseos
                        </h2>
                        <p className="text-default-600">
                          Organiza y guarda los productos que más te interesan
                        </p>
                      </div>
                      <Button
                        color="danger"
                        variant="shadow"
                        size="lg"
                        startContent={<Plus className="h-4 w-4" />}
                        onPress={() => {
                          setEditingWishList(null);
                          setWishListForm({
                            name: "",
                            description: "",
                            isPublic: false,
                            desiredCategories: [],
                          });
                          onWishListOpen();
                        }}
                        className="font-semibold"
                      >
                        Nueva Lista
                      </Button>
                    </div>
                  </div>

                  {userWishLists.length === 0 ? (
                    <Card className="border-dashed border-2 border-default-200">
                      <CardBody className="text-center py-16">
                        <div className="bg-gradient-to-br from-pink-500/10 to-danger/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Heart className="h-12 w-12 text-danger" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-danger to-pink-600 bg-clip-text text-transparent">
                          No tienes listas de deseos
                        </h3>
                        <p className="text-default-500 mb-6 max-w-md mx-auto">
                          Crea tu primera lista para organizar los productos que
                          más te interesan
                        </p>
                        <Button
                          color="danger"
                          variant="shadow"
                          size="lg"
                          startContent={<Plus className="h-4 w-4" />}
                          onPress={() => {
                            setEditingWishList(null);
                            setWishListForm({
                              name: "",
                              description: "",
                              isPublic: false,
                              desiredCategories: [],
                            });
                            onWishListOpen();
                          }}
                          className="font-semibold"
                        >
                          Crear mi primera lista
                        </Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userWishLists.map((wishList, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-default-50">
                            <CardBody className="p-6">
                              <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-danger/20 to-pink-500/20 flex items-center justify-center">
                                      <Heart className="h-6 w-6 text-danger" />
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-lg line-clamp-1">
                                        {wishList.name}
                                      </h3>
                                      <p className="text-sm text-default-500">
                                        {wishList.productCount} productos
                                        deseados
                                      </p>
                                    </div>
                                  </div>
                                  <Chip
                                    size="sm"
                                    color={
                                      wishList.isPublic ? "success" : "default"
                                    }
                                    variant="shadow"
                                    className="font-semibold"
                                  >
                                    {wishList.isPublic ? "Pública" : "Privada"}
                                  </Chip>
                                </div>

                                {wishList.description && (
                                  <p className="text-default-600 text-sm line-clamp-2 leading-relaxed">
                                    {wishList.description}
                                  </p>
                                )}

                                {/* Categorías deseadas */}
                                {wishList.desiredCategories &&
                                  wishList.desiredCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {wishList.desiredCategories
                                        .slice(0, 3)
                                        .map((category, catIndex) => (
                                          <Chip
                                            key={catIndex}
                                            size="sm"
                                            variant="flat"
                                            color="primary"
                                            className="text-xs"
                                          >
                                            {category}
                                          </Chip>
                                        ))}
                                      {wishList.desiredCategories.length >
                                        3 && (
                                        <Chip
                                          size="sm"
                                          variant="flat"
                                          color="default"
                                          className="text-xs"
                                        >
                                          +
                                          {wishList.desiredCategories.length -
                                            3}
                                        </Chip>
                                      )}
                                    </div>
                                  )}

                                <div className="flex justify-between items-center pt-2 border-t border-default-100">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-primary font-medium">
                                      {wishList.productCount} items
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {wishList.isPublic ? (
                                      <Globe className="h-4 w-4 text-success" />
                                    ) : (
                                      <Lock className="h-4 w-4 text-default-400" />
                                    )}
                                    <span className="text-sm text-default-500">
                                      {wishList.isPublic
                                        ? "Visible"
                                        : "Privada"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    fullWidth
                                    startContent={<Eye className="h-3 w-3" />}
                                    className="font-medium"
                                  >
                                    Ver Lista
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="secondary"
                                    fullWidth
                                    startContent={<Edit className="h-3 w-3" />}
                                    onPress={() => handleEditWishList(wishList)}
                                    className="font-medium"
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    isIconOnly
                                    startContent={
                                      <Trash2 className="h-3 w-3" />
                                    }
                                    onPress={() =>
                                      handleDeleteWishList(wishList.id)
                                    }
                                  />
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Tab>

              {/* Donaciones Mejoradas */}
              <Tab
                key="donations"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:gift" />
                    <span>Donaciones</span>
                    <Chip size="sm" color="success" variant="flat">
                      {profileData.itemsDonated}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-8">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-r from-success/10 via-emerald-500/10 to-green-500/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-success to-emerald-600 bg-clip-text text-transparent mb-2">
                          Mis Donaciones
                        </h2>
                        <p className="text-default-600">
                          Ayuda a tu comunidad y gana puntos por tus donaciones
                        </p>
                      </div>
                      <Button
                        color="success"
                        variant="shadow"
                        size="lg"
                        startContent={<Icon icon="lucide:heart" />}
                        className="font-semibold"
                      >
                        Explorar Donaciones
                      </Button>
                    </div>
                  </div>

                  {userDonations.length === 0 ? (
                    <Card className="border-dashed border-2 border-default-200">
                      <CardBody className="text-center py-16">
                        <div className="bg-gradient-to-br from-emerald-500/10 to-success/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Icon
                            icon="lucide:gift"
                            className="text-4xl text-success"
                          />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-success to-emerald-600 bg-clip-text text-transparent">
                          No has realizado donaciones
                        </h3>
                        <p className="text-default-500 mb-6 max-w-md mx-auto">
                          Ayuda a tu comunidad donando productos que ya no uses
                          y gana puntos por tu generosidad
                        </p>
                        <Button
                          color="success"
                          variant="shadow"
                          size="lg"
                          startContent={<Icon icon="lucide:heart" />}
                          className="font-semibold"
                        >
                          Explorar donaciones disponibles
                        </Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {userDonations.map((donation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-default-50">
                            <CardBody className="p-6">
                              <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center">
                                      <Icon
                                        icon="lucide:gift"
                                        className="text-success text-xl"
                                      />
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-lg line-clamp-1">
                                        {donation.title || "Donación realizada"}
                                      </h3>
                                      <p className="text-sm text-default-500">
                                        {new Date(
                                          donation.donationDate || Date.now()
                                        ).toLocaleDateString("es-ES", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <Chip
                                    size="sm"
                                    color="success"
                                    variant="shadow"
                                    className="font-semibold"
                                  >
                                    Completada
                                  </Chip>
                                </div>

                                <p className="text-default-600 text-sm line-clamp-3 leading-relaxed">
                                  {donation.description ||
                                    "Donación realizada exitosamente"}
                                </p>

                                <div className="flex justify-between items-center pt-2 border-t border-default-100">
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon="lucide:star"
                                      className="text-warning text-sm"
                                    />
                                    <span className="text-sm font-medium text-warning">
                                      +{donation.pointsAwarded || 10} puntos
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon="lucide:heart"
                                      className="text-success text-sm"
                                    />
                                    <span className="text-sm text-success">
                                      Impacto positivo
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Tab>

              {/* Intercambios Mejorados */}
              <Tab
                key="exchanges"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:repeat" />
                    <span>Intercambios</span>
                    <Chip size="sm" color="warning" variant="flat">
                      {profileData.itemsExchanged}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-8">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-r from-warning/10 via-orange-500/10 to-amber-500/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
                          Mis Intercambios
                        </h2>
                        <p className="text-default-600">
                          Intercambia productos con otros usuarios de la
                          comunidad
                        </p>
                      </div>
                      <Button
                        color="warning"
                        variant="shadow"
                        size="lg"
                        startContent={<Icon icon="lucide:search" />}
                        className="font-semibold"
                      >
                        Buscar Intercambios
                      </Button>
                    </div>
                  </div>

                  <Card className="border-dashed border-2 border-default-200">
                    <CardBody className="text-center py-16">
                      <div className="bg-gradient-to-br from-orange-500/10 to-warning/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon
                          icon="lucide:repeat"
                          className="text-4xl text-warning"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent">
                        {profileData.itemsExchanged === 0
                          ? "No has realizado intercambios"
                          : "Historial de Intercambios"}
                      </h3>
                      <p className="text-default-500 mb-6 max-w-md mx-auto">
                        {profileData.itemsExchanged === 0
                          ? "Encuentra productos que te interesen e intercambia con otros usuarios"
                          : `Has completado ${profileData.itemsExchanged} intercambios exitosos`}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          color="warning"
                          variant="shadow"
                          size="lg"
                          startContent={<Icon icon="lucide:search" />}
                          className="font-semibold"
                        >
                          Buscar intercambios
                        </Button>
                        <Button
                          color="default"
                          variant="bordered"
                          size="lg"
                          startContent={<Icon icon="lucide:package" />}
                          className="font-semibold"
                          onPress={() => setActiveTab("products")}
                        >
                          Mis productos
                        </Button>
                      </div>

                      {/* Stats de intercambios */}
                      <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-warning">
                            {profileData.itemsExchanged}
                          </div>
                          <div className="text-xs text-default-500">
                            Completados
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {
                              userProducts.filter((p) => p.availableForExchange)
                                .length
                            }
                          </div>
                          <div className="text-xs text-default-500">
                            Disponibles
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">
                            {Math.floor(profileData.itemsExchanged * 15)}
                          </div>
                          <div className="text-xs text-default-500">
                            Puntos ganados
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Tab>

              {/* Configuración */}
              <Tab
                key="settings"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:settings" />
                    <span>Configuración</span>
                  </div>
                }
              >
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">
                    Configuración de Perfil
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <h3 className="font-semibold">Información Personal</h3>
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nombre</label>
                          <p className="text-default-500">
                            {profileData.firstName} {profileData.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-default-500">
                            {profileData.email}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Dirección
                          </label>
                          <p className="text-default-500">
                            {profileData.address}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Miembro desde
                          </label>
                          <p className="text-default-500">
                            {new Date(
                              profileData.joinedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <h3 className="font-semibold">Estadísticas</h3>
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <div className="flex justify-between">
                          <span>Nivel actual</span>
                          <Chip color="primary" variant="flat">
                            {profileData.level}
                          </Chip>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Puntos</span>
                            <span className="font-semibold">
                              {profileData.points}
                            </span>
                          </div>
                          <Progress
                            value={(profileData.points % 1000) / 10}
                            color="primary"
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>Comunidades</span>
                          <span className="font-semibold">
                            {profileData.communities.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Posts publicados</span>
                          <span className="font-semibold">
                            {profileData.totalPostsCount}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </motion.div>

      {/* Modal de Editar Perfil */}
      <EditProfileModal
        isOpen={isEditOpen}
        currentProfile={profileData as any}
        isLoading={isEditingProfile}
        onClose={onEditClose}
        onSave={handleUpdateProfile}
      />

      {/* Modal de Crear/Editar Producto */}
      <Modal isOpen={isProductOpen} onClose={onProductClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nombre del Producto"
                placeholder="Ingresa el nombre del producto"
                value={productForm.productName}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    productName: e.target.value,
                  })
                }
              />
              <Textarea
                label="Descripción"
                placeholder="Describe tu producto"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
              />
              <Input
                label="URL de imagen (opcional)"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={productForm.imageUrl}
                onChange={(e) =>
                  setProductForm({ ...productForm, imageUrl: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Categoría"
                  selectedKeys={
                    productForm.category ? [productForm.category] : []
                  }
                  onSelectionChange={(selection) => {
                    const selectedValue = Array.from(selection)[0] as string;
                    setProductForm({ ...productForm, category: selectedValue });
                  }}
                >
                  <SelectItem key="electronics">Electrónicos</SelectItem>
                  <SelectItem key="clothing">Ropa</SelectItem>
                  <SelectItem key="books">Libros</SelectItem>
                  <SelectItem key="furniture">Muebles</SelectItem>
                  <SelectItem key="toys">Juguetes</SelectItem>
                  <SelectItem key="sports">Deportes</SelectItem>
                  <SelectItem key="other">Otros</SelectItem>
                </Select>
                <Select
                  label="Condición"
                  selectedKeys={
                    productForm.condition ? [productForm.condition] : []
                  }
                  onSelectionChange={(selection) => {
                    const selectedValue = Array.from(selection)[0] as string;
                    setProductForm({
                      ...productForm,
                      condition: selectedValue,
                    });
                  }}
                >
                  <SelectItem key="new">Nuevo</SelectItem>
                  <SelectItem key="like_new">Como Nuevo</SelectItem>
                  <SelectItem key="good">Bueno</SelectItem>
                  <SelectItem key="fair">Regular</SelectItem>
                  <SelectItem key="poor">Malo</SelectItem>
                </Select>
              </div>
              <Input
                label="Valor Estimado"
                type="number"
                startContent="$"
                placeholder="0.00"
                value={productForm.estimatedValue}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    estimatedValue: e.target.value,
                  })
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="availableForExchange"
                  checked={productForm.availableForExchange}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      availableForExchange: e.target.checked,
                    })
                  }
                />
                <label htmlFor="availableForExchange" className="text-sm">
                  Disponible para intercambio
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                resetProductForm();
                onProductClose();
              }}
              disabled={operationLoading}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={
                editingProduct ? handleUpdateProduct : handleCreateProduct
              }
              isLoading={operationLoading}
            >
              {editingProduct ? "Actualizar" : "Crear"} Producto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Crear/Editar Post Mejorado */}
      <Modal isOpen={isPostOpen} onClose={onPostClose} size="3xl">
        <ModalContent>
          <ModalHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-secondary w-10 h-10 rounded-full flex items-center justify-center">
                <Icon
                  icon={editingPost ? "lucide:edit" : "lucide:plus"}
                  className="text-white text-lg"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {editingPost ? "Editar Post" : "Crear Nuevo Post"}
                </h3>
                <p className="text-sm text-default-500">
                  {editingPost
                    ? "Actualiza tu contenido"
                    : "Comparte algo increíble con tu comunidad"}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Título"
                  placeholder="¿Qué quieres compartir?"
                  value={postForm.title}
                  onChange={(e) =>
                    setPostForm({ ...postForm, title: e.target.value })
                  }
                  variant="bordered"
                  labelPlacement="outside"
                />
                <Select
                  label="Tipo de post"
                  placeholder="Selecciona el tipo"
                  selectedKeys={postForm.wanted ? [postForm.wanted] : []}
                  onSelectionChange={(selection) => {
                    const selectedValue = Array.from(selection)[0] as
                      | "DONATION"
                      | "EXCHANGE";
                    setPostForm({ ...postForm, wanted: selectedValue });
                  }}
                  variant="bordered"
                  labelPlacement="outside"
                >
                  <SelectItem key="DONATION">Donación</SelectItem>
                  <SelectItem key="EXCHANGE">Intercambio</SelectItem>
                </Select>
              </div>

              <Textarea
                label="Contenido"
                placeholder="Describe tu post de manera detallada..."
                value={postForm.content}
                onChange={(e) =>
                  setPostForm({ ...postForm, content: e.target.value })
                }
                variant="bordered"
                labelPlacement="outside"
                minRows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="URL de imagen"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={postForm.imageUrl}
                  onChange={(e) =>
                    setPostForm({ ...postForm, imageUrl: e.target.value })
                  }
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={
                    <Icon icon="lucide:image" className="text-default-400" />
                  }
                />
                <Input
                  label="Ubicación"
                  placeholder="Tu ciudad o ubicación"
                  value={postForm.location}
                  onChange={(e) =>
                    setPostForm({ ...postForm, location: e.target.value })
                  }
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={
                    <Icon icon="lucide:map-pin" className="text-default-400" />
                  }
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="bg-default-50 border-t gap-3">
            <Button
              variant="flat"
              onPress={() => {
                resetPostForm();
                onPostClose();
              }}
              disabled={operationLoading}
              size="lg"
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              variant="shadow"
              onPress={editingPost ? handleUpdatePost : handleCreatePost}
              isLoading={operationLoading}
              size="lg"
              className="font-semibold"
            >
              {editingPost ? "Actualizar Post" : "Publicar Post"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Crear/Editar Wishlist */}
      <Modal isOpen={isWishListOpen} onClose={onWishListClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingWishList ? "Editar Lista de Deseos" : "Crear Nueva Lista"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nombre"
                placeholder="Ingresa el nombre de la lista"
                value={wishListForm.name}
                onChange={(e) =>
                  setWishListForm({ ...wishListForm, name: e.target.value })
                }
              />
              <Textarea
                label="Descripción"
                placeholder="Describe el propósito de la lista"
                value={wishListForm.description}
                onChange={(e) =>
                  setWishListForm({
                    ...wishListForm,
                    description: e.target.value,
                  })
                }
              />
              <Select
                label="Privacidad"
                selectedKeys={[wishListForm.isPublic ? "public" : "private"]}
                onSelectionChange={(selection) => {
                  const selectedValue = Array.from(selection)[0] as string;
                  setWishListForm({
                    ...wishListForm,
                    isPublic: selectedValue === "public",
                  });
                }}
              >
                <SelectItem key="public">Pública</SelectItem>
                <SelectItem key="private">Privada</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onWishListClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={
                editingWishList ? handleUpdateWishList : handleCreateWishList
              }
            >
              {editingWishList ? "Actualizar Lista" : "Crear Lista"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Confirmación */}
      <Modal isOpen={confirmDialog.isOpen} onClose={closeConfirmDialog}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h4 className="text-lg font-semibold">{confirmDialog.title}</h4>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-500">{confirmDialog.message}</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeConfirmDialog}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={() => {
                confirmDialog.confirmAction();
                closeConfirmDialog();
              }}
              isLoading={!!deletingItem}
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default MyProfile;
