import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import { ProductResponse } from "@/types/interfaces";
import { getProductById } from "@/api/api";
import { useUser } from "@/contexts/UserContext";
import RequestExchangeModal from "@/components/RequestExchangeModal";
import { startChat } from "@/services/chatService";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [shareUrl, setShareUrl] = useState("");
  const [shareText, setShareText] = useState("");
  const [isContactingOwner, setIsContactingOwner] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const productData = await getProductById(Number(productId));
      setProduct(productData);
    } catch (err: any) {
      console.error("Error loading product:", err);
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (product) {
      const url = `${window.location.origin}/product/${product.productId}`;
      const text = `¡Mira este ${product.availableForExchange ? "producto disponible para intercambio" : "producto"}: ${product.productName}!`;

      setShareUrl(url);
      setShareText(text);
      onOpen();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Toast notification could be added here
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch {
        // Error handled silently
      }
      document.body.removeChild(textArea);
    }
  };

  const shareToSocialMedia = (platform: string) => {
    const fullText = `${shareText} ${shareUrl}`;
    const encodedText = encodeURIComponent(fullText);
    const encodedUrl = encodeURIComponent(shareUrl);

    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodedText}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareNative = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.productName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // Error handled silently
        }
      }
    } else {
      // Fallback: copy to clipboard
      await copyToClipboard(`${shareText} ${shareUrl}`);
    }
  };

  const handleContactOwner = async () => {
    if (!product) {
      alert("Error: No se pudo cargar la información del producto");
      return;
    }

    if (product.belongsToCurrentUser) {
      alert("No puedes contactar contigo mismo");
      return;
    }

    if (!user) {
      alert("Debes iniciar sesión para contactar al propietario");
      navigate("/auth/signin");
      return;
    }

    try {
      setIsContactingOwner(true);

      // Iniciar chat con el propietario del producto
      const chat = await startChat(product.userId, product.productId);

      console.log("Chat response:", chat);

      if (!chat || !chat.id) {
        throw new Error(
          "El chat no se creó correctamente. Respuesta inválida del servidor."
        );
      }

      // Mostrar mensaje de éxito
      console.log("Chat iniciado correctamente con ID:", chat.id);

      // Redirigir al chat
      navigate(`/chat/${chat.id}`);
    } catch (error: any) {
      console.error("Error starting chat:", error);
      // Mostrar error específico al usuario
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al iniciar el chat. Inténtalo de nuevo.";
      alert(errorMessage);
    } finally {
      setIsContactingOwner(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha no disponible";

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      CLOTHING: "mdi:tshirt-crew",
      ACCESSORIES: "mdi:sunglasses",
      ELECTRONICS: "mdi:laptop",
      BOOKS: "mdi:book-open-page-variant",
      FURNITURE: "mdi:sofa",
      TOYS: "mdi:toy-brick",
      HOME: "mdi:home",
      SPORTS: "mdi:soccer",
      INSTRUMENTS: "mdi:piano",
    };
    return iconMap[category] || "mdi:package-variant";
  };

  const getConditionColor = (
    condition: string
  ): "success" | "primary" | "warning" | "secondary" | "default" => {
    const colorMap: {
      [key: string]:
        | "success"
        | "primary"
        | "warning"
        | "secondary"
        | "default";
    } = {
      NEW: "success",
      LIKE_NEW: "primary",
      USED: "warning",
      REFURBISHED: "secondary",
      OPEN_BOX: "default",
    };
    return colorMap[condition] || "default";
  };

  const getConditionText = (condition: string) => {
    const textMap: { [key: string]: string } = {
      NEW: "Nuevo",
      LIKE_NEW: "Como Nuevo",
      USED: "Usado",
      REFURBISHED: "Reacondicionado",
      OPEN_BOX: "Caja Abierta",
    };
    return textMap[condition] || condition;
  };

  const getCategoryText = (category: string) => {
    const textMap: { [key: string]: string } = {
      CLOTHING: "Ropa",
      ACCESSORIES: "Accesorios",
      ELECTRONICS: "Electrónicos",
      BOOKS: "Libros",
      FURNITURE: "Muebles",
      TOYS: "Juguetes",
      HOME: "Hogar",
      SPORTS: "Deportes",
      INSTRUMENTS: "Instrumentos",
    };
    return textMap[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex min-h-96 items-center justify-center">
          <Card className="max-w-md">
            <CardBody className="text-center p-8">
              <Icon
                className="mx-auto mb-4 text-6xl text-gray-400"
                icon="mdi:package-off"
              />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Producto no encontrado
              </h3>
              <p className="mb-6 text-gray-600">
                {error ||
                  "El producto que buscas no existe o ha sido eliminado."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => navigate("/productos")}
                >
                  Ver todos los productos
                </Button>
                <Button
                  color="default"
                  variant="light"
                  onPress={() => navigate(-1)}
                >
                  Volver atrás
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-2 text-sm">
            <Button
              variant="light"
              size="sm"
              startContent={<Icon icon="mdi:arrow-left" />}
              onPress={() => navigate(-1)}
            >
              Volver
            </Button>
            <Icon icon="mdi:chevron-right" className="text-gray-400" />
            <span className="text-gray-500">Productos</span>
            <Icon icon="mdi:chevron-right" className="text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {product.productName}
            </span>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl">
              <div className="relative">
                <img
                  alt={product.productName}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-t-2xl"
                  src={product.imageUrl}
                />
                <div className="absolute top-4 left-4">
                  <Chip
                    color={product.status === "ACTIVE" ? "success" : "default"}
                    variant="solid"
                    startContent={
                      <Icon
                        icon={
                          product.status === "ACTIVE"
                            ? "mdi:check-circle"
                            : "mdi:pause-circle"
                        }
                        className="text-sm"
                      />
                    }
                  >
                    {product.status === "ACTIVE" ? "Activo" : product.status}
                  </Chip>
                </div>
                {product.availableForExchange && (
                  <div className="absolute top-4 right-4">
                    <Chip
                      color="success"
                      variant="solid"
                      startContent={
                        <Icon icon="mdi:swap-horizontal" className="text-sm" />
                      }
                    >
                      Disponible para intercambio
                    </Chip>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Main Product Info */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex w-full items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {product.productName}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Chip
                        color={getConditionColor(product.condition)}
                        variant="flat"
                        startContent={
                          <Icon icon="mdi:star" className="text-sm" />
                        }
                      >
                        {getConditionText(product.condition)}
                      </Chip>
                      <Chip
                        color="primary"
                        variant="flat"
                        startContent={
                          <Icon
                            icon={getCategoryIcon(product.category)}
                            className="text-sm"
                          />
                        }
                      >
                        {getCategoryText(product.category)}
                      </Chip>
                    </div>
                  </div>
                  <Button
                    isIconOnly
                    variant="flat"
                    color="primary"
                    onPress={handleShare}
                  >
                    <Icon icon="mdi:share-variant" className="text-xl" />
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  {product.description}
                </p>

                {product.estimatedValue > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl mb-6">
                    <Icon
                      icon="mdi:currency-usd"
                      className="text-green-600 text-2xl"
                    />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        Valor estimado
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ${product.estimatedValue}
                      </p>
                    </div>
                  </div>
                )}

                {product.exchangePreferences && (
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon
                          icon="mdi:swap-horizontal"
                          className="text-blue-600 text-xl mt-1"
                        />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                            Preferencias de intercambio
                          </h4>
                          <p className="text-blue-700 dark:text-blue-200">
                            {product.exchangePreferences}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                <Divider className="my-6" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:calendar" className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Publicado: {formatDate(product.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:eye" className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      ID: #{product.productId}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Owner Information */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Información del propietario
                </h3>
              </CardHeader>
              <CardBody>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar
                    name={product.ownerName?.charAt(0).toUpperCase() || "U"}
                    className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-lg"
                    size="lg"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.ownerName}
                    </h4>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Icon icon="mdi:account-circle" className="text-sm" />
                      <span className="text-sm">
                        {product.belongsToCurrentUser
                          ? "Tú"
                          : "Miembro de GreenLoop"}
                      </span>
                    </div>
                  </div>
                </div>

                {!product.belongsToCurrentUser && (
                  <div className="space-y-3">
                    <Divider />
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Icon
                        icon="mdi:shield-check"
                        className="text-green-500"
                      />
                      <span>Usuario verificado de GreenLoop</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Icon icon="mdi:handshake" className="text-blue-500" />
                      <span>Comprometido con intercambios justos</span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!product.belongsToCurrentUser &&
                product.availableForExchange && (
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full font-semibold"
                    startContent={
                      <Icon icon="mdi:swap-horizontal" className="text-xl" />
                    }
                    onPress={() => setShowExchangeModal(true)}
                  >
                    Solicitar Intercambio
                  </Button>
                )}

              {product.belongsToCurrentUser && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    color="warning"
                    variant="flat"
                    startContent={<Icon icon="mdi:pencil" />}
                    onPress={() =>
                      navigate(`/edit-product/${product.productId}`)
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<Icon icon="mdi:delete" />}
                  >
                    Eliminar
                  </Button>
                </div>
              )}

              <Button
                variant="bordered"
                size="lg"
                className="w-full"
                startContent={<Icon icon="mdi:message-text" />}
                onPress={handleContactOwner}
                isLoading={isContactingOwner}
                isDisabled={product.belongsToCurrentUser || isContactingOwner}
              >
                {product.belongsToCurrentUser
                  ? "Tu producto"
                  : "Contactar propietario"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Compartir producto</h3>
                <p className="text-sm text-gray-500">
                  Comparte este producto con tus amigos
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium mb-1">
                      Enlace del producto:
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 break-all">
                      {shareUrl}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="flat"
                      color="primary"
                      startContent={<Icon icon="mdi:twitter" />}
                      onPress={() => shareToSocialMedia("twitter")}
                    >
                      Twitter
                    </Button>
                    <Button
                      variant="flat"
                      color="primary"
                      startContent={<Icon icon="mdi:facebook" />}
                      onPress={() => shareToSocialMedia("facebook")}
                    >
                      Facebook
                    </Button>
                    <Button
                      variant="flat"
                      color="success"
                      startContent={<Icon icon="mdi:whatsapp" />}
                      onPress={() => shareToSocialMedia("whatsapp")}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="flat"
                      color="primary"
                      startContent={<Icon icon="mdi:telegram" />}
                      onPress={() => shareToSocialMedia("telegram")}
                    >
                      Telegram
                    </Button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => copyToClipboard(`${shareText} ${shareUrl}`)}
                >
                  Copiar enlace
                </Button>
                <Button color="primary" onPress={shareNative}>
                  Compartir
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Exchange Modal */}
      {showExchangeModal && (
        <RequestExchangeModal
          isOpen={showExchangeModal}
          targetProduct={product}
          onClose={() => setShowExchangeModal(false)}
          onSuccess={() => {
            setShowExchangeModal(false);
            // Add success notification here
          }}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
