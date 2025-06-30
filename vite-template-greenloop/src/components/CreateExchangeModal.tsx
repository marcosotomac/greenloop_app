import React, { useState, useEffect } from "react";
import { exchangeService } from "../services/exchangeService";
import type { Product } from "../types/exchange";

interface CreateExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateExchangeModal: React.FC<CreateExchangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1); // 1: Select product to request, 2: Select product to offer
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [selectedRequestedProduct, setSelectedRequestedProduct] =
    useState<Product | null>(null);
  const [selectedOfferedProduct, setSelectedOfferedProduct] =
    useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [available, mine] = await Promise.all([
        exchangeService.getAvailableProducts(),
        exchangeService.getMyProductsForExchange(),
      ]);
      setAvailableProducts(available);
      setMyProducts(mine);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const products = await exchangeService.getAvailableProducts(
        categoryFilter || undefined,
        searchTerm || undefined
      );
      setAvailableProducts(products);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRequestedProduct || !selectedOfferedProduct) return;

    try {
      setLoading(true);
      await exchangeService.requestExchange({
        requestedProductId: selectedRequestedProduct.productId,
        offeredProductId: selectedOfferedProduct.productId,
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating exchange:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedRequestedProduct(null);
    setSelectedOfferedProduct(null);
    setSearchTerm("");
    setCategoryFilter("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1
              ? "Selecciona el producto que quieres"
              : "Selecciona tu producto para ofrecer"}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-6">
          <div
            className={`flex items-center ${step >= 1 ? "text-green-600" : "text-gray-400"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-green-600 text-white" : "bg-gray-200"}`}
            >
              1
            </div>
            <span className="ml-2">Producto deseado</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-4"></div>
          <div
            className={`flex items-center ${step >= 2 ? "text-green-600" : "text-gray-400"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-green-600 text-white" : "bg-gray-200"}`}
            >
              2
            </div>
            <span className="ml-2">Tu producto</span>
          </div>
        </div>

        {step === 1 && (
          <div>
            {/* Search and Filter */}
            <div className="flex space-x-4 mb-6">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todas las categorías</option>
                <option value="ELECTRONICS">Electrónicos</option>
                <option value="CLOTHING">Ropa</option>
                <option value="BOOKS">Libros</option>
                <option value="SPORTS">Deportes</option>
                <option value="HOME">Hogar</option>
                <option value="OTHER">Otros</option>
              </select>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>

            {/* Available Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {availableProducts.map((product) => (
                <div
                  key={product.productId}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRequestedProduct?.productId === product.productId
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedRequestedProduct(product)}
                >
                  <img
                    alt={product.productName}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                    src={product.imageUrl}
                  />
                  <h3 className="font-medium text-gray-900 mb-1">
                    {product.productName}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.ownerName}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                disabled={!selectedRequestedProduct}
                onClick={() => setStep(2)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            {/* Selected Requested Product */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Producto seleccionado:
              </h3>
              {selectedRequestedProduct && (
                <div className="flex items-center space-x-3">
                  <img
                    alt={selectedRequestedProduct.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                    src={selectedRequestedProduct.imageUrl}
                  />
                  <div>
                    <p className="font-medium">
                      {selectedRequestedProduct.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedRequestedProduct.ownerName}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* My Products */}
            <h3 className="text-lg font-medium mb-4">
              Selecciona tu producto para ofrecer:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {myProducts.map((product) => (
                <div
                  key={product.productId}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedOfferedProduct?.productId === product.productId
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedOfferedProduct(product)}
                >
                  <img
                    alt={product.productName}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                    src={product.imageUrl}
                  />
                  <h3 className="font-medium text-gray-900 mb-1">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                onClick={() => setStep(1)}
              >
                Atrás
              </button>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                disabled={!selectedOfferedProduct || loading}
                onClick={handleSubmit}
              >
                {loading ? "Enviando..." : "Crear Intercambio"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExchangeModal;
