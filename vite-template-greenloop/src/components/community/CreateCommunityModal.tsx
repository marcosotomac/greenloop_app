// Create Community Form Component
import React, { useState } from "react";
import { X, Users, Lock, Globe } from "lucide-react";

import { CommunityRequestDto } from "@/types/interfaces.tsx";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (communityData: CommunityRequestDto) => Promise<void>;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CommunityRequestDto>({
    name: "",
    description: "",
    type: "PUBLIC",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: "",
        description: "",
        type: "PUBLIC",
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la comunidad"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        description: "",
        type: "PUBLIC",
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Crear Nueva Comunidad
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={loading}
            onClick={handleClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Community Name */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="name"
            >
              Nombre de la Comunidad *
            </label>
            <input
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
              id="name"
              maxLength={100}
              name="name"
              placeholder="Ej: Comunidad Verde Madrid"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          {/* Community Type */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="type"
            >
              Tipo de Comunidad *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="PUBLIC">Pública</option>
              <option value="PRIVATE">Privada</option>
            </select>

            {/* Type explanation */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Globe size={12} />
                <span>Pública: Cualquiera puede unirse directamente</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Lock size={12} />
                <span>Privada: Requiere aprobación para unirse</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="description"
            >
              Descripción
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              disabled={loading}
              id="description"
              maxLength={500}
              name="description"
              placeholder="Describe el propósito y objetivos de tu comunidad..."
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description?.length || 0}/500 caracteres
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              type="button"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              className="flex-1 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || !formData.name.trim()}
              type="submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Users size={16} />
                  Crear Comunidad
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
