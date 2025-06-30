import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";

import { Edit2, AlertCircle, X } from "lucide-react";

import { UpdateProfileRequest, UserProfile } from "../services/userService";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: UpdateProfileRequest) => Promise<void>;
  currentProfile: UserProfile | null;
  isLoading: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: "",
    lastName: "",
    address: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentProfile && isOpen) {
      setFormData({
        firstName: currentProfile.firstName || "",
        lastName: currentProfile.lastName || "",
        address: currentProfile.address || "",
        description: currentProfile.description || "",
      });
      setErrors({});
    }
  }, [currentProfile, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres";
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "El nombre no puede exceder 50 caracteres";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Los apellidos son requeridos";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Los apellidos deben tener al menos 2 caracteres";
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = "Los apellidos no pueden exceder 50 caracteres";
    }

    if (formData.address && formData.address.length > 200) {
      newErrors.address = "La dirección no puede exceder 200 caracteres";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "La descripción no puede exceder 500 caracteres";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al actualizar perfil:", error);
    }
  };

  const handleInputChange = (
    field: keyof UpdateProfileRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-white",
        header: "border-b-[1px] border-[#292f46]",
        footer: "border-t-[1px] border-[#292f46]",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-green-500" />
            <span>Editar Perfil</span>
          </div>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* Advertencia sobre email */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Información importante
              </span>
            </div>
            <p className="text-sm text-amber-300 mt-1">
              Por seguridad, no puedes cambiar tu dirección de email. Si
              necesitas cambiarla, contacta al soporte técnico.
            </p>
          </div>

          {/* Email (solo lectura) */}
          <Input
            isReadOnly
            label="Email"
            placeholder="Tu email"
            value={currentProfile?.email || ""}
            variant="bordered"
            classNames={{
              input: "bg-default-100/50 text-default-500",
              inputWrapper: "border-default-200/50",
              label: "text-default-500",
            }}
            endContent={
              <div className="flex items-center gap-1 text-xs text-default-400">
                <X className="h-3 w-3" />
                <span>No editable</span>
              </div>
            }
          />

          {/* Nombre */}
          <Input
            isRequired
            label="Nombre"
            placeholder="Ingresa tu nombre"
            value={formData.firstName}
            variant="bordered"
            classNames={{
              input: "bg-default-50/50",
              inputWrapper:
                "border-default-200 hover:border-green-500 focus-within:border-green-500",
            }}
            errorMessage={errors.firstName}
            isInvalid={!!errors.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
          />

          {/* Apellidos */}
          <Input
            isRequired
            label="Apellidos"
            placeholder="Ingresa tus apellidos"
            value={formData.lastName}
            variant="bordered"
            classNames={{
              input: "bg-default-50/50",
              inputWrapper:
                "border-default-200 hover:border-green-500 focus-within:border-green-500",
            }}
            errorMessage={errors.lastName}
            isInvalid={!!errors.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
          />

          {/* Dirección */}
          <Input
            label="Dirección"
            placeholder="Ingresa tu dirección (opcional)"
            value={formData.address}
            variant="bordered"
            classNames={{
              input: "bg-default-50/50",
              inputWrapper:
                "border-default-200 hover:border-green-500 focus-within:border-green-500",
            }}
            errorMessage={errors.address}
            isInvalid={!!errors.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />

          {/* Descripción */}
          <Textarea
            label="Descripción"
            placeholder="Cuéntanos algo sobre ti (opcional)"
            value={formData.description}
            variant="bordered"
            maxRows={6}
            minRows={3}
            classNames={{
              input: "bg-default-50/50",
              inputWrapper:
                "border-default-200 hover:border-green-500 focus-within:border-green-500",
            }}
            errorMessage={errors.description}
            isInvalid={!!errors.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            disabled={isLoading}
            onPress={onClose}
          >
            Cancelar
          </Button>
          <Button
            color="success"
            disabled={isLoading}
            isLoading={isLoading}
            className="bg-green-600 hover:bg-green-700"
            onPress={handleSubmit}
          >
            {isLoading ? "Actualizando..." : "Guardar Cambios"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;
