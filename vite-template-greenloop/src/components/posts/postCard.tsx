import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";

import { toggleLikePost } from "@/api/api";
import { useTheme } from "@/contexts/ThemeContext";
import { PostResponse } from "@/types/interfaces";

export default function PostCard({
  post,
  onPostUpdate,
}: {
  post: PostResponse;
  onPostUpdate?: (updatedPost: PostResponse) => void;
}) {
  const [localPost, setLocalPost] = useState<PostResponse>(post);
  const [isLiking, setIsLiking] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [shareUrl, setShareUrl] = useState("");
  const [shareText, setShareText] = useState("");
  const { theme } = useTheme();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const handleLikeToggle = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const updatedPost = await toggleLikePost(localPost.postId);

      setLocalPost(updatedPost);
      // Notificar al componente padre si existe el callback
      if (onPostUpdate) {
        onPostUpdate(updatedPost);
      }
    } catch {
      // Error handled silently - could show toast notification here
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    // Crear la URL y texto para compartir
    const url = `${window.location.origin}/post/${localPost.postId}`;
    const text = `¡Mira este ${localPost.wanted === "DONATION" ? "donación" : "intercambio"}: ${localPost.title}!`;

    setShareUrl(url);
    setShareText(text);
    onOpen();
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
          title: localPost.title,
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

  return (
    <motion.div key={localPost.postId} variants={itemVariants}>
      <Card
        className={`w-full backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
          theme === "dark"
            ? "bg-gray-800/95 dark:bg-gray-800/95"
            : "bg-white/95"
        }`}
      >
        {/* Post Header */}
        <div
          className={`p-4 border-b ${
            theme === "dark"
              ? "border-gray-700 dark:border-gray-700"
              : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                className="bg-gradient-to-br from-green-500 to-blue-500 text-white"
                name={localPost.username?.charAt(0).toUpperCase() || "U"}
                size="md"
              />
              <div>
                <p
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {localPost.username}
                </p>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <span>{formatDate(localPost.publishedAt)}</span>
                  {localPost.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Icon className="text-xs" icon="lucide:map-pin" />
                        <span>{localPost.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Chip
              className={`${
                localPost.wanted === "DONATION"
                  ? "bg-gradient-to-r from-red-500 to-pink-500"
                  : "bg-gradient-to-r from-green-500 to-emerald-500"
              } text-white border-0 font-medium`}
              size="sm"
              variant="solid"
            >
              {localPost.wanted === "DONATION"
                ? "🎁 Donación"
                : "🔄 Intercambio"}
            </Chip>
          </div>
        </div>

        {/* Post Content */}
        <CardBody className="p-4 pb-2">
          <h3
            className={`text-lg font-semibold mb-2 leading-tight ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {localPost.title}
          </h3>
          <p
            className={`text-sm leading-relaxed mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {localPost.content}
          </p>
        </CardBody>

        {/* Post Image */}
        <div className="relative">
          <img
            alt={localPost.title}
            className="w-full h-64 object-cover"
            src={localPost.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>

        {/* Post Actions */}
        <CardFooter className="p-4 pt-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  localPost.likedByCurrentUser
                    ? "text-red-500"
                    : theme === "dark"
                      ? "text-gray-300 hover:text-red-500"
                      : "text-gray-600 hover:text-red-500"
                } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLiking}
                onClick={handleLikeToggle}
              >
                <Icon
                  className={`text-lg ${
                    localPost.likedByCurrentUser ? "text-red-500" : ""
                  }`}
                  icon={
                    localPost.likedByCurrentUser
                      ? "mdi:heart"
                      : "mdi:heart-outline"
                  }
                />
                <span className="text-sm font-medium">
                  {localPost.likesCount > 0 ? localPost.likesCount : ""}
                  {localPost.likesCount === 1
                    ? " Me gusta"
                    : localPost.likesCount > 1
                      ? " Me gusta"
                      : "Me gusta"}
                </span>
              </button>
              <button
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-green-500"
                    : "text-gray-600 hover:text-green-500"
                }`}
                onClick={handleShare}
              >
                <Icon className="text-lg" icon="lucide:share-2" />
                <span className="text-sm font-medium">Compartir</span>
              </button>
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
        <ModalContent className={theme === "dark" ? "dark" : ""}>
          {(onClose) => (
            <>
              <ModalHeader
                className={`flex flex-col gap-1 ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="text-green-500 text-xl"
                    icon="lucide:share-2"
                  />
                  <span>Compartir publicación</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {/* Vista previa del post */}
                  <div
                    className={`rounded-lg p-4 border ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar
                        className="bg-gradient-to-br from-green-500 to-blue-500 text-white"
                        name={
                          localPost.username?.charAt(0).toUpperCase() || "U"
                        }
                        size="sm"
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            theme === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}
                        >
                          {localPost.username}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {localPost.wanted === "DONATION"
                            ? "🎁 Donación"
                            : "🔄 Intercambio"}
                        </p>
                      </div>
                    </div>
                    <h4
                      className={`font-medium text-sm mb-1 ${
                        theme === "dark" ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {localPost.title}
                    </h4>
                    <p
                      className={`text-xs line-clamp-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {localPost.content}
                    </p>
                  </div>

                  <Divider />

                  {/* Opciones de compartir */}
                  <div className="space-y-3">
                    <h5
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Compartir en:
                    </h5>

                    {/* Botones de redes sociales */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className="justify-start"
                        startContent={
                          <Icon className="text-blue-500" icon="mdi:twitter" />
                        }
                        variant="flat"
                        onClick={() => shareToSocialMedia("twitter")}
                      >
                        Twitter
                      </Button>
                      <Button
                        className="justify-start"
                        startContent={
                          <Icon className="text-blue-600" icon="mdi:facebook" />
                        }
                        variant="flat"
                        onClick={() => shareToSocialMedia("facebook")}
                      >
                        Facebook
                      </Button>
                      <Button
                        className="justify-start"
                        startContent={
                          <Icon
                            className="text-green-600"
                            icon="mdi:whatsapp"
                          />
                        }
                        variant="flat"
                        onClick={() => shareToSocialMedia("whatsapp")}
                      >
                        WhatsApp
                      </Button>
                      <Button
                        className="justify-start"
                        startContent={
                          <Icon className="text-blue-400" icon="mdi:telegram" />
                        }
                        variant="flat"
                        onClick={() => shareToSocialMedia("telegram")}
                      >
                        Telegram
                      </Button>
                    </div>

                    <Divider />

                    {/* Compartir nativo o copiar enlace */}
                    <div className="space-y-2">
                      {typeof navigator !== "undefined" &&
                        "share" in navigator && (
                          <Button
                            className="w-full justify-start"
                            startContent={<Icon icon="lucide:share" />}
                            variant="flat"
                            onClick={shareNative}
                          >
                            Usar compartir del sistema
                          </Button>
                        )}
                      <Button
                        className="w-full justify-start"
                        startContent={<Icon icon="lucide:copy" />}
                        variant="flat"
                        onClick={() =>
                          copyToClipboard(`${shareText} ${shareUrl}`)
                        }
                      >
                        Copiar enlace
                      </Button>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
