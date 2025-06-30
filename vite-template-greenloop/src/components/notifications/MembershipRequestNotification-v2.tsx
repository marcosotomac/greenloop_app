import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@nextui-org/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { NotificationResponseDto } from "../../types/notification";
import { notificationService } from "../../services/notificationService";
import { useNotifications } from "../../hooks/useNotifications";

interface MembershipRequestNotificationProps {
  notification: NotificationResponseDto;
  onActionComplete?: () => void;
}

const MembershipRequestNotification: React.FC<
  MembershipRequestNotificationProps
> = ({ notification, onActionComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { addNotification } = useNotifications();

  const handleAction = async (action: "approve" | "reject") => {
    if (!notification.referenceId) {
      setErrorMessage("No se encontró el ID de la solicitud");

      return;
    }

    setActionType(action);
    setErrorMessage("");
    setResponseMessage(
      action === "approve"
        ? "¡Bienvenido/a a la comunidad! Esperamos que disfrutes participando y contribuyendo a nuestra comunidad."
        : "Gracias por tu interés en nuestra comunidad. En este momento no podemos aprobar tu solicitud, pero te invitamos a intentarlo nuevamente en el futuro."
    );
    onOpen();
  };

  const confirmAction = async () => {
    if (!notification.referenceId || !actionType) return;

    try {
      setIsProcessing(true);
      setErrorMessage("");

      await notificationService.respondToMembershipRequest(
        notification.referenceId,
        actionType === "approve",
        responseMessage
      );

      // Marcar la notificación como leída
      await notificationService.markAsRead(notification.id);

      addNotification(
        "success",
        "¡Acción completada!",
        `Solicitud ${actionType === "approve" ? "aprobada" : "rechazada"} exitosamente`
      );

      onClose();
      setTimeout(() => {
        onActionComplete?.();
      }, 500);
    } catch (error) {
      setErrorMessage(
        `Error al ${actionType === "approve" ? "aprobar" : "rechazar"} la solicitud. Por favor, intenta nuevamente.`
      );
      addNotification(
        "error",
        "Error",
        `Error al ${actionType === "approve" ? "aprobar" : "rechazar"} la solicitud`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAction = async (action: "approve" | "reject") => {
    if (!notification.referenceId) {
      setErrorMessage("No se encontró el ID de la solicitud");

      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage("");

      const defaultMessage =
        action === "approve"
          ? "¡Bienvenido/a a la comunidad!"
          : "Solicitud rechazada";

      await notificationService.respondToMembershipRequest(
        notification.referenceId,
        action === "approve",
        defaultMessage
      );

      // Marcar la notificación como leída
      await notificationService.markAsRead(notification.id);

      addNotification(
        "success",
        "¡Acción completada!",
        `Solicitud ${action === "approve" ? "aprobada" : "rechazada"} exitosamente`
      );

      setTimeout(() => {
        onActionComplete?.();
      }, 500);
    } catch (error) {
      setErrorMessage(
        `Error al ${action === "approve" ? "aprobar" : "rechazar"} la solicitud. Por favor, intenta nuevamente.`
      );
      addNotification(
        "error",
        "Error",
        `Error al ${action === "approve" ? "aprobar" : "rechazar"} la solicitud`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            {/* Icono de solicitud */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                    {notification.title}
                  </h3>
                  <Chip
                    color="primary"
                    size="sm"
                    startContent={<ClockIcon className="w-3 h-3" />}
                    variant="flat"
                  >
                    Pendiente
                  </Chip>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString(
                    "es-ES",
                    {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {notification.message}
                </p>
                {notification.referenceId && (
                  <p className="text-xs text-gray-500 mt-2">
                    ID de solicitud: #{notification.referenceId}
                  </p>
                )}
              </div>

              {/* Mensaje de error */}
              {errorMessage && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <Button
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                  color="success"
                  isLoading={isProcessing}
                  startContent={<CheckCircleIcon className="w-4 h-4" />}
                  variant="solid"
                  onPress={() => quickAction("approve")}
                >
                  Aprobar
                </Button>

                <Button
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                  color="danger"
                  isLoading={isProcessing}
                  startContent={<XCircleIcon className="w-4 h-4" />}
                  variant="solid"
                  onPress={() => quickAction("reject")}
                >
                  Rechazar
                </Button>

                <Button
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                  color="primary"
                  isLoading={isProcessing}
                  variant="flat"
                  onPress={() => handleAction("approve")}
                >
                  Aprobar con Mensaje
                </Button>

                <Button
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                  color="default"
                  isLoading={isProcessing}
                  variant="flat"
                  onPress={() => handleAction("reject")}
                >
                  Rechazar con Mensaje
                </Button>
              </div>

              {/* Indicador de procesamiento */}
              {isProcessing && (
                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    ⏳ Procesando solicitud...
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal para mensaje personalizado */}
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {actionType === "approve" ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-600" />
              )}
              <span>
                {actionType === "approve" ? "Aprobar" : "Rechazar"} Solicitud
              </span>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              Personaliza el mensaje que se enviará al solicitante
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">Detalles de la solicitud:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
              </div>

              <Textarea
                description="Este mensaje será enviado al usuario junto con la respuesta"
                label="Mensaje de respuesta"
                maxRows={6}
                placeholder="Escribe un mensaje personalizado..."
                value={responseMessage}
                onValueChange={setResponseMessage}
              />

              {errorMessage && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              isDisabled={isProcessing}
              variant="light"
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              color={actionType === "approve" ? "success" : "danger"}
              isLoading={isProcessing}
              startContent={
                actionType === "approve" ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <XCircleIcon className="w-4 h-4" />
                )
              }
              onPress={confirmAction}
            >
              {actionType === "approve" ? "Aprobar" : "Rechazar"} Solicitud
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MembershipRequestNotification;
