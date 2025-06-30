import type { Product } from "../types/exchange";
import type { ProductResponse } from "../types/interfaces";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { exchangeService } from "../services/exchangeService";
import { enableAllProductsForExchange } from "../api/api";

interface RequestExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetProduct: ProductResponse;
}

const RequestExchangeModal: React.FC<RequestExchangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetProduct,
}) => {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activatingProducts, setActivatingProducts] = useState(false);
  const [error, setError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  const [existingExchanges, setExistingExchanges] = useState<any[]>([]);
  const [loadingExchanges, setLoadingExchanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Limpiar errores al abrir el modal
      setError("");
      setSubmitError("");
      setSelectedProductId("");

      loadMyProducts();
      loadExistingExchanges();
    }
  }, [isOpen]);

  const loadMyProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(""); // Limpiar errores previos

      const products = await exchangeService.getMyProductsForExchange();
      setMyProducts(products);
    } catch (error: any) {
      // Manejo específico de errores
      let errorMessage = "Error al cargar tus productos para intercambio";

      if (error?.response?.status === 401) {
        errorMessage =
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      } else if (error?.response?.status === 403) {
        errorMessage = "No tienes permisos para acceder a esta función.";
      } else if (error?.response?.status === 404) {
        errorMessage =
          "No se encontraron productos disponibles para intercambio.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Error del servidor. Por favor, intenta más tarde.";
      } else if (error?.code === "ERR_NETWORK") {
        errorMessage = "Error de conexión. Verifica tu conexión a internet.";
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadExistingExchanges = async () => {
    try {
      setLoadingExchanges(true);

      // Cargar intercambios pendientes y aceptados para verificar duplicados
      const [requestedExchanges, providedExchanges] = await Promise.all([
        exchangeService.getRequestedExchanges(),
        exchangeService.getProvidedExchanges(),
      ]);

      // Combinar todos los intercambios
      const allExchanges = [...requestedExchanges, ...providedExchanges];

      // Filtrar solo intercambios activos (pendientes, aceptados)
      const activeExchanges = allExchanges.filter(
        (exchange) =>
          exchange.status === "PENDING" ||
          exchange.status === "ACCEPTED" ||
          exchange.status === "IN_PROGRESS"
      );

      setExistingExchanges(activeExchanges);
    } catch (error: any) {
      console.error("Error loading existing exchanges:", error);
      // No mostramos error al usuario porque esto es una verificación secundaria
    } finally {
      setLoadingExchanges(false);
    }
  };

  const handleActivateAllProducts = async () => {
    try {
      setActivatingProducts(true);
      await enableAllProductsForExchange();

      // Recargar productos después de activarlos
      await loadMyProducts();

      // Mostrar mensaje de éxito
      alert("✅ ¡Productos activados para intercambio!");
    } catch (error) {
      console.error("Error activating products:", error);
      alert("❌ Error al activar productos");
    } finally {
      setActivatingProducts(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProductId) {
      setSubmitError("Por favor, selecciona un producto para ofrecer");
      return;
    }

    // Validar restricciones de intercambio
    const restrictionError = checkExchangeRestrictions(selectedProductId);
    if (restrictionError) {
      setSubmitError(restrictionError);
      return;
    }

    try {
      setLoading(true);
      setSubmitError(""); // Limpiar errores previos

      await exchangeService.requestExchange({
        requestedProductId: targetProduct.productId,
        offeredProductId: Number(selectedProductId),
      });

      // Éxito - cerrar modal y notificar
      onSuccess();
      onClose();

      // Mostrar mensaje de éxito
      if (typeof window !== "undefined") {
        setTimeout(() => {
          alert("🎉 ¡Solicitud de intercambio enviada exitosamente!");
        }, 500);
      }
    } catch (error: any) {
      console.error("Error requesting exchange:", error);

      // Manejo específico de errores para solicitud de intercambio
      let errorMessage = "Error al enviar la solicitud de intercambio";

      if (error?.response?.status === 400) {
        if (error?.response?.data?.message?.includes("same user")) {
          errorMessage = "No puedes intercambiar con tus propios productos.";
        } else if (error?.response?.data?.message?.includes("not available")) {
          errorMessage =
            "El producto solicitado ya no está disponible para intercambio.";
        } else if (error?.response?.data?.message?.includes("already exists")) {
          errorMessage =
            "Ya tienes una solicitud de intercambio pendiente para este producto.";
        } else {
          errorMessage =
            error?.response?.data?.message ||
            "Los datos de la solicitud no son válidos.";
        }
      } else if (error?.response?.status === 401) {
        errorMessage =
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      } else if (error?.response?.status === 403) {
        errorMessage = "No tienes permisos para realizar este intercambio.";
      } else if (error?.response?.status === 404) {
        errorMessage = "El producto seleccionado no fue encontrado.";
      } else if (error?.response?.status === 409) {
        errorMessage =
          "Ya existe una solicitud de intercambio para estos productos.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Error del servidor. Por favor, intenta más tarde.";
      } else if (error?.code === "ERR_NETWORK") {
        errorMessage = "Error de conexión. Verifica tu conexión a internet.";
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkExchangeRestrictions = (productId: string): string | null => {
    const selectedProdId = Number(productId);
    const targetProdId = targetProduct.productId;

    // 1. Verificar que no es el mismo usuario
    if (targetProduct.belongsToCurrentUser) {
      return "No puedes solicitar intercambio de tus propios productos.";
    }

    // 2. Verificar que el producto seleccionado es diferente al objetivo
    if (selectedProdId === targetProdId) {
      return "No puedes intercambiar un producto por sí mismo.";
    }

    // 3. Verificar intercambios duplicados pendientes
    const duplicateExchange = existingExchanges.find(
      (exchange) =>
        exchange.requestedProductId === targetProdId &&
        exchange.offeredProductId === selectedProdId &&
        (exchange.status === "PENDING" || exchange.status === "ACCEPTED")
    );

    if (duplicateExchange) {
      return `Ya tienes una solicitud ${duplicateExchange.status === "PENDING" ? "pendiente" : "aceptada"} para este intercambio.`;
    }

    // 4. Verificar intercambio inverso (el otro usuario ya pidió tu producto)
    const inverseExchange = existingExchanges.find(
      (exchange) =>
        exchange.requestedProductId === selectedProdId &&
        exchange.offeredProductId === targetProdId &&
        (exchange.status === "PENDING" || exchange.status === "ACCEPTED")
    );

    if (inverseExchange) {
      return "El propietario de este producto ya te ha solicitado un intercambio con tu producto.";
    }

    // 5. Verificar que el producto seleccionado está disponible para intercambio
    const selectedProduct = myProducts.find(
      (p) => p.productId === selectedProdId
    );
    if (selectedProduct && !selectedProduct.availableForExchange) {
      return "El producto seleccionado ya no está disponible para intercambio.";
    }

    return null; // No hay restricciones
  };

  const selectedProduct = myProducts.find(
    (p) => p.productId === Number(selectedProductId)
  );

  return (
    <Modal backdrop="blur" isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center">
              <Icon className="text-white text-xl" icon="mdi:swap-horizontal" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Solicitar Intercambio
              </h3>
              <p className="text-sm text-gray-500">
                Intercambia productos de forma segura
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Target Product */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="text-primary text-lg" icon="mdi:target" />
              <h4 className="text-base font-semibold text-gray-900">
                Producto que deseas
              </h4>
            </div>
            <Card className="border-0 shadow-md bg-gradient-to-r from-primary-50 to-secondary-50">
              <CardBody className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      alt={targetProduct.productName}
                      className="w-20 h-20 object-cover rounded-xl shadow-sm"
                      src={targetProduct.imageUrl}
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Icon className="text-white text-sm" icon="mdi:heart" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-lg text-gray-900 mb-1">
                      {targetProduct.productName}
                    </h5>
                    <p className="text-primary font-medium text-sm mb-3">
                      📍 Por: {targetProduct.ownerName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Chip
                        color="primary"
                        size="sm"
                        variant="solid"
                        startContent={
                          <Icon icon="mdi:tag" className="text-xs" />
                        }
                      >
                        {targetProduct.category}
                      </Chip>
                      <Chip
                        color="success"
                        size="sm"
                        variant="flat"
                        startContent={
                          <Icon icon="mdi:star" className="text-xs" />
                        }
                      >
                        {targetProduct.condition}
                      </Chip>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* My Products Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon
                  className="text-secondary text-lg"
                  icon="mdi:package-variant"
                />
                <h4 className="text-base font-semibold text-gray-900">
                  Tus productos disponibles
                </h4>
                <Chip size="sm" variant="flat" color="secondary">
                  {myProducts.length}
                </Chip>
              </div>
              {myProducts.length > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  startContent={<Icon icon="mdi:information-outline" />}
                  onPress={() => {
                    alert(
                      "ℹ️ Restricciones:\n• No intercambios contigo mismo\n• No solicitudes duplicadas\n• Solo productos disponibles para intercambio"
                    );
                  }}
                >
                  Ver reglas
                </Button>
              )}
            </div>

            {/* Error de carga de productos */}
            {error && (
              <Card className="border-danger-200 bg-danger-50">
                <CardBody className="p-4">
                  <div className="flex items-start space-x-3">
                    <Icon
                      className="text-danger text-xl mt-0.5"
                      icon="mdi:alert-circle"
                    />
                    <div className="flex-1">
                      <h5 className="text-danger-800 font-medium text-sm mb-1">
                        Error al cargar productos
                      </h5>
                      <p className="text-danger-700 text-sm mb-3">{error}</p>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<Icon icon="mdi:refresh" />}
                        onPress={() => {
                          setError("");
                          loadMyProducts();
                        }}
                      >
                        Reintentar
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {loadingProducts ? (
              <Card className="border-dashed border-2 border-default-300">
                <CardBody className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary-300 border-t-primary rounded-full animate-spin"></div>
                      <Icon
                        className="absolute inset-0 m-auto text-primary text-2xl"
                        icon="mdi:package-variant"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">
                        Cargando productos
                      </h3>
                      <p className="text-sm text-gray-500">
                        Obteniendo tus productos disponibles...
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : myProducts.length === 0 ? (
              <Card className="border-dashed border-2 border-default-300 bg-gradient-to-br from-default-50 to-default-100">
                <CardBody className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-warning-200 to-warning-300 rounded-full flex items-center justify-center mx-auto">
                      <Icon
                        className="text-warning-700 text-4xl"
                        icon="mdi:package-variant-closed"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        No hay productos disponibles
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Para proponer intercambios, marca al menos uno de tus
                        productos como disponible para intercambio.
                      </p>
                    </div>

                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <Icon
                            className="text-blue-500 text-xl mt-0.5"
                            icon="mdi:lightbulb-on"
                          />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              💡 ¿Cómo activar intercambios?
                            </p>
                            <p className="text-sm text-blue-700">
                              Ve a tus productos y activa la opción de
                              intercambio en los productos que quieras
                              compartir.
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        color="primary"
                        variant="solid"
                        startContent={<Icon icon="mdi:view-dashboard" />}
                        onPress={() => {
                          window.location.href = "/productos";
                        }}
                      >
                        Ver mis productos
                      </Button>
                      <Button
                        color="success"
                        variant="flat"
                        startContent={<Icon icon="mdi:swap-horizontal" />}
                        isLoading={activatingProducts}
                        onPress={handleActivateAllProducts}
                      >
                        {activatingProducts ? "Activando..." : "Activar todos"}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Select HTML nativo que funciona de manera confiable */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Selecciona tu producto para intercambiar
                  </label>
                  <div className="relative">
                    <select
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white"
                      value={selectedProductId}
                      onChange={(e) => {
                        const selected = e.target.value;

                        // Validar restricciones antes de seleccionar
                        if (selected) {
                          const restrictionError =
                            checkExchangeRestrictions(selected);
                          if (restrictionError) {
                            setSubmitError(restrictionError);
                            return; // No permitir la selección
                          } else {
                            setSubmitError(""); // Limpiar errores si la selección es válida
                          }
                        }

                        setSelectedProductId(selected);
                      }}
                    >
                      <option value="">
                        Elige un producto de tu colección...
                      </option>
                      {myProducts.map((product) => {
                        const restrictionError = checkExchangeRestrictions(
                          product.productId.toString()
                        );
                        const isRestricted = restrictionError !== null;

                        return (
                          <option
                            key={product.productId.toString()}
                            value={product.productId.toString()}
                            disabled={isRestricted}
                            className={
                              isRestricted ? "text-gray-400" : "text-gray-900"
                            }
                          >
                            {product.productName} - {product.category} (
                            {product.condition})
                            {isRestricted ? " (No disponible)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    {/* Icono personalizado */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Icon
                        icon="mdi:package-variant"
                        className="text-gray-400 text-lg"
                      />
                    </div>
                    {/* Flecha personalizada */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Icon
                        icon="mdi:chevron-down"
                        className="text-gray-400 text-lg"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Solo productos marcados como disponibles para intercambio
                  </p>
                </div>

                {/* Lista visual de productos para mejor UX */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">
                    Tus productos disponibles ({myProducts.length}):
                  </h5>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {myProducts.map((product) => {
                      const restrictionError = checkExchangeRestrictions(
                        product.productId.toString()
                      );
                      const isRestricted = restrictionError !== null;
                      const isSelected =
                        selectedProductId === product.productId.toString();

                      return (
                        <div
                          key={`visual-${product.productId}`}
                          className={`
                            flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all
                            ${
                              isSelected
                                ? "border-primary bg-primary-50 shadow-sm"
                                : isRestricted
                                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }
                          `}
                          onClick={() => {
                            if (!isRestricted) {
                              const productIdStr = product.productId.toString();
                              const restrictionError =
                                checkExchangeRestrictions(productIdStr);
                              if (!restrictionError) {
                                setSelectedProductId(productIdStr);
                                setSubmitError("");
                              }
                            }
                          }}
                        >
                          <img
                            alt={product.productName}
                            className="w-12 h-12 object-cover rounded-lg"
                            src={product.imageUrl}
                          />
                          <div className="flex-1">
                            <h6
                              className={`font-medium ${isRestricted ? "text-gray-400" : "text-gray-900"}`}
                            >
                              {product.productName}
                            </h6>
                            <p className="text-sm text-gray-500">
                              {product.category} • {product.condition}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSelected && (
                              <Icon
                                className="text-primary text-lg"
                                icon="mdi:check-circle"
                              />
                            )}
                            {isRestricted && (
                              <Icon
                                className="text-danger text-lg"
                                icon="mdi:alert-circle"
                                title={restrictionError}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Product Preview */}
                {selectedProduct && (
                  <Card className="border-0 shadow-md bg-gradient-to-r from-success-50 to-primary-50">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-success-800">
                          ✅ Producto seleccionado
                        </h5>
                        <Icon
                          className="text-success-600"
                          icon="mdi:check-circle"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <img
                          alt={selectedProduct.productName}
                          className="w-16 h-16 object-cover rounded-xl shadow-sm"
                          src={selectedProduct.imageUrl}
                        />
                        <div className="flex-1">
                          <h6 className="font-bold text-gray-900 mb-1">
                            {selectedProduct.productName}
                          </h6>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {selectedProduct.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Chip color="secondary" size="sm" variant="flat">
                              {selectedProduct.category}
                            </Chip>
                            <Chip color="warning" size="sm" variant="flat">
                              {selectedProduct.condition}
                            </Chip>
                            {selectedProduct.estimatedValue > 0 && (
                              <Chip color="success" size="sm" variant="solid">
                                ${selectedProduct.estimatedValue}
                              </Chip>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}
          </div>
        </ModalBody>

        {/* Error de envío de solicitud */}
        {submitError && (
          <div className="px-6 pb-4">
            <Card className="border-danger-200 bg-danger-50">
              <CardBody className="p-4">
                <div className="flex items-start space-x-3">
                  <Icon
                    className="text-danger text-xl mt-0.5"
                    icon="mdi:alert-circle-outline"
                  />
                  <div className="flex-1">
                    <h5 className="text-danger-800 font-semibold text-sm mb-1">
                      ⚠️ Error en la solicitud
                    </h5>
                    <p className="text-danger-700 text-sm mb-3">
                      {submitError}
                    </p>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<Icon icon="mdi:close" />}
                      onPress={() => setSubmitError("")}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        <ModalFooter className="bg-default-50 border-t border-default-200">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-default-500">
              <Icon icon="mdi:shield-check" />
              <span>Intercambio seguro</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="light"
                onPress={onClose}
                startContent={<Icon icon="mdi:close" />}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                variant="solid"
                size="lg"
                isDisabled={
                  !selectedProductId || loading || myProducts.length === 0
                }
                isLoading={loading}
                startContent={
                  loading ? undefined : <Icon icon="mdi:swap-horizontal" />
                }
                onPress={handleSubmit}
                className="font-semibold"
              >
                {loading ? "Enviando solicitud..." : "Solicitar Intercambio"}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RequestExchangeModal;
