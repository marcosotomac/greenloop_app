import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import { useTheme } from "@/contexts/ThemeContext";
import { ProductResponse } from "@/types/interfaces.tsx";
import { updateProductExchangeStatus } from "@/api/api.tsx";
import RequestExchangeModal from "../RequestExchangeModal";

export default function ProductCard({
  product,
  onProductUpdate: _onProductUpdate,
}: {
  product: ProductResponse;
  onProductUpdate?: (updatedProduct: ProductResponse) => void;
}) {
  const [localProduct, setLocalProduct] = useState(product);
  const isLoading = false;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [shareUrl, setShareUrl] = useState("");
  const [shareText, setShareText] = useState("");
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [isUpdatingExchange, setIsUpdatingExchange] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Sincronizar el estado local con el prop cuando cambie
  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  // Debug logs para verificar el estado
  console.log("Product debug:", {
    productId: localProduct.productId,
    productName: localProduct.productName,
    belongsToCurrentUser: localProduct.belongsToCurrentUser,
    availableForExchange: localProduct.availableForExchange,
    ownerName: localProduct.ownerName,
  });

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const handleShare = () => {
    // Crear la URL y texto para compartir
    const url = `${window.location.origin}/product/${localProduct.productId}`;
    const text = `¡Mira este ${localProduct.availableForExchange ? "producto disponible para intercambio" : "producto"}: ${localProduct.productName}!`;

    setShareUrl(url);
    setShareText(text);
    onOpen();
  };

  const handleToggleExchangeStatus = async () => {
    try {
      setIsUpdatingExchange(true);
      const updatedProduct = await updateProductExchangeStatus(
        localProduct.productId,
        !localProduct.availableForExchange,
        localProduct.exchangePreferences,
        localProduct.estimatedValue
      );

      // Actualizar el producto local con la respuesta del servidor
      setLocalProduct(updatedProduct);

      if (_onProductUpdate) {
        _onProductUpdate(updatedProduct);
      }

      // Mostrar mensaje de éxito con el nuevo estado
      console.log("Estado de intercambio actualizado exitosamente:", {
        productId: updatedProduct.productId,
        availableForExchange: updatedProduct.availableForExchange,
        belongsToCurrentUser: updatedProduct.belongsToCurrentUser,
      });
    } catch (error) {
      console.error("Error al actualizar el estado de intercambio:", error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsUpdatingExchange(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías mostrar un toast de éxito
    } catch {
      // Fallback para navegadores que no soportan clipboard API
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: localProduct.productName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // Error handled silently
        }
      }
    } else {
      // Fallback: copiar al portapapeles
      await copyToClipboard(`${shareText} ${shareUrl}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Ahora";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: diffInDays > 365 ? "numeric" : undefined,
      });
    }
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

  const getConditionColor = (condition: string) => {
    const colorMap: { [key: string]: string } = {
      NEW: "bg-gradient-to-r from-green-500 to-emerald-500",
      LIKE_NEW: "bg-gradient-to-r from-blue-500 to-cyan-500",
      USED: "bg-gradient-to-r from-orange-500 to-yellow-500",
      REFURBISHED: "bg-gradient-to-r from-purple-500 to-pink-500",
      OPEN_BOX: "bg-gradient-to-r from-gray-500 to-slate-500",
    };

    return colorMap[condition] || "bg-gradient-to-r from-gray-500 to-slate-500";
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

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      ACTIVE: "bg-gradient-to-r from-green-500 to-emerald-500",
      EXCHANGED: "bg-gradient-to-r from-blue-500 to-cyan-500",
      DONATED: "bg-gradient-to-r from-purple-500 to-pink-500",
      INACTIVE: "bg-gradient-to-r from-gray-500 to-slate-500",
    };

    return colorMap[status] || "bg-gradient-to-r from-gray-500 to-slate-500";
  };

  const getStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      ACTIVE: "🟢 Activo",
      EXCHANGED: "🔄 Intercambiado",
      DONATED: "🎁 Donado",
      INACTIVE: "⚫ Inactivo",
    };

    return textMap[status] || status;
  };

  return (
    <motion.div key={localProduct.productId} variants={itemVariants}>
      <Card
        className={`w-full backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
          theme === "dark"
            ? "bg-gray-800/95 dark:bg-gray-800/95"
            : "bg-white/95"
        }`}
      >
        {/* Product Header */}
        <div
          className={`p-4 border-b ${
            theme === "dark"
              ? "border-gray-700 dark:border-gray-700"
              : "border-gray-100"
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar
                className="bg-gradient-to-br from-green-500 to-blue-500 text-white"
                name={localProduct.ownerName?.charAt(0).toUpperCase() || "U"}
                size="md"
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {localProduct.ownerName}
                </p>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Icon icon={getCategoryIcon(localProduct.category)} />
                  <span className="hidden xs:inline">
                    {localProduct.category}
                  </span>
                  <span className="xs:hidden">
                    {localProduct.category.slice(0, 3)}
                  </span>
                  <span>•</span>
                  <span>{formatDate(localProduct.createdAt)}</span>
                </div>
              </div>
            </div>
            {/* Chips container with improved responsive spacing */}
            <div className="flex flex-wrap gap-2 justify-start">
              <Chip
                className={`${getConditionColor(localProduct.condition)} text-white border-0 font-medium`}
                size="sm"
                variant="solid"
              >
                {getConditionText(localProduct.condition)}
              </Chip>
              {localProduct.availableForExchange && (
                <Chip
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 font-medium"
                  size="sm"
                  variant="solid"
                >
                  <span className="hidden sm:inline">
                    🔄 Disponible para intercambio
                  </span>
                  <span className="sm:hidden">🔄 Intercambio</span>
                </Chip>
              )}
              {/* Status indicator */}
              <Chip
                className={`${getStatusColor(localProduct.status)} text-white border-0 font-medium`}
                size="sm"
                variant="solid"
              >
                {getStatusText(localProduct.status)}
              </Chip>
            </div>
          </div>
        </div>

        {/* Product Content */}
        <CardBody className="p-4 pb-2">
          <h3
            className={`text-lg font-semibold mb-2 leading-tight ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {localProduct.productName}
          </h3>
          <p
            className={`text-sm leading-relaxed mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {localProduct.description}
          </p>
          {localProduct.estimatedValue > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-2">
              <Icon icon="mdi:currency-usd" />
              <span>Valor estimado: ${localProduct.estimatedValue}</span>
            </div>
          )}
          {localProduct.exchangePreferences && (
            <div
              className={`p-2 rounded-lg mb-3 ${
                theme === "dark"
                  ? "bg-blue-900/30 dark:bg-blue-900/30"
                  : "bg-blue-50"
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  theme === "dark" ? "text-blue-300" : "text-blue-700"
                }`}
              >
                Preferencias de intercambio:
              </p>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-blue-200" : "text-blue-600"
                }`}
              >
                {localProduct.exchangePreferences}
              </p>
            </div>
          )}
        </CardBody>

        {/* Product Image */}
        <div className="relative">
          <img
            alt={localProduct.productName}
            className="w-full h-64 object-cover"
            src={localProduct.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          <div className="absolute top-2 left-2">
            <Chip
              className={`${localProduct.status === "ACTIVE" ? "bg-green-500" : "bg-gray-500"} text-white border-0 font-medium`}
              size="sm"
              variant="solid"
            >
              {localProduct.status === "ACTIVE"
                ? "Activo"
                : localProduct.status}
            </Chip>
          </div>
        </div>

        {/* Product Actions */}
        <CardFooter className="p-4 pt-3">
          <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-blue-400"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={handleShare}
              >
                <Icon className="text-lg" icon="lucide:share-2" />
                <span className="text-sm">Compartir</span>
              </button>
              {localProduct.availableForExchange &&
                !localProduct.belongsToCurrentUser && (
                  <button
                    className={`flex items-center gap-2 transition-colors duration-200 ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-green-400"
                        : "text-gray-600 hover:text-green-500"
                    }`}
                    disabled={isLoading}
                    onClick={() => setShowExchangeModal(true)}
                  >
                    <Icon className="text-lg" icon="mdi:swap-horizontal" />
                    <span className="text-sm">Intercambiar</span>
                  </button>
                )}
              {localProduct.belongsToCurrentUser && (
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    localProduct.availableForExchange
                      ? theme === "dark"
                        ? "bg-green-900/20 text-green-400 hover:bg-green-900/30 border border-green-800/50"
                        : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      : theme === "dark"
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  } ${isUpdatingExchange ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={isUpdatingExchange}
                  onClick={handleToggleExchangeStatus}
                >
                  <Icon
                    className={`text-lg ${isUpdatingExchange ? "animate-spin" : ""}`}
                    icon={
                      isUpdatingExchange
                        ? "lucide:loader-2"
                        : localProduct.availableForExchange
                          ? "lucide:toggle-right"
                          : "lucide:toggle-left"
                    }
                  />
                  <span className="text-sm">
                    {localProduct.availableForExchange
                      ? "Desactivar intercambio"
                      : "Activar intercambio"}
                  </span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="w-full sm:w-auto"
                color="primary"
                size="sm"
                variant="flat"
                onPress={() => navigate(`/product/${localProduct.productId}`)}
              >
                Ver detalles
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Modal para compartir */}
      <Modal
        backdrop="blur"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-50",
        }}
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent
          className={
            theme === "dark"
              ? "bg-gray-800 dark:bg-gray-800 text-gray-100"
              : "bg-white text-gray-900"
          }
        >
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Compartir producto
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Comparte este producto con otros usuarios
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div
                    className={`p-3 rounded-lg ${
                      theme === "dark"
                        ? "bg-gray-700 dark:bg-gray-700"
                        : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium mb-1 ${
                        theme === "dark" ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {shareText}
                    </p>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {shareUrl}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="bg-blue-500 text-white"
                      startContent={<Icon icon="mdi:twitter" />}
                      variant="flat"
                      onPress={() => shareToSocialMedia("twitter")}
                    >
                      Twitter
                    </Button>
                    <Button
                      className="bg-blue-600 text-white"
                      startContent={<Icon icon="mdi:facebook" />}
                      variant="flat"
                      onPress={() => shareToSocialMedia("facebook")}
                    >
                      Facebook
                    </Button>
                    <Button
                      className="bg-green-500 text-white"
                      startContent={<Icon icon="mdi:whatsapp" />}
                      variant="flat"
                      onPress={() => shareToSocialMedia("whatsapp")}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      className="bg-blue-400 text-white"
                      startContent={<Icon icon="mdi:telegram" />}
                      variant="flat"
                      onPress={() => shareToSocialMedia("telegram")}
                    >
                      Telegram
                    </Button>
                  </div>

                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <Button
                      className="w-full"
                      color="secondary"
                      startContent={<Icon icon="lucide:share" />}
                      variant="flat"
                      onPress={shareNative}
                    >
                      Compartir nativo
                    </Button>
                  )}

                  <Button
                    className="w-full"
                    color="primary"
                    startContent={<Icon icon="lucide:copy" />}
                    variant="flat"
                    onPress={() => copyToClipboard(`${shareText} ${shareUrl}`)}
                  >
                    Copiar enlace
                  </Button>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de intercambio */}
      <RequestExchangeModal
        isOpen={showExchangeModal}
        targetProduct={localProduct}
        onClose={() => setShowExchangeModal(false)}
        onSuccess={() => {
          setShowExchangeModal(false);
          // Aquí podrías agregar una notificación de éxito
        }}
      />
    </motion.div>
  );
}
