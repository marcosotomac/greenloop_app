import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import { ProductResponse } from "@/types/interfaces.tsx";
import { enableAllProductsForExchange } from "@/api/api.tsx";
import ProductCard from "@/components/product/productCard.tsx";
import ErrorNotification from "@/components/ErrorNotification.tsx";
import { useUser } from "@/contexts/UserContext";
import {
  productService,
  type ProductResponseDto,
  type ProductStatus,
} from "@/services/productService";

const ProductosPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [conditionFilter, setConditionFilter] = useState<string>("ALL");
  const [exchangeFilter, setExchangeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">(
    "ALL"
  );
  const [sortBy, setSortBy] = useState<"RECENT" | "ALPHABETICAL" | "PRICE">(
    "RECENT"
  );
  const [enablingExchange, setEnablingExchange] = useState(false);
  const navigate = useNavigate();
  const { error: userError, clearError } = useUser();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar el nuevo productService que ya filtra productos intercambiados
      const data = await productService.getAllProducts();

      // Los tipos son compatibles, solo necesitamos hacer una conversión simple
      const convertedData: ProductResponse[] = data.map((product) => ({
        productId: product.productId,
        ownerName: product.ownerName,
        productName: product.productName,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category as ProductResponse["category"],
        condition: product.condition as ProductResponse["condition"],
        availableForExchange: product.availableForExchange,
        exchangePreferences: product.exchangePreferences || "",
        estimatedValue: product.estimatedValue,
        createdAt: product.createdAt,
        status: product.status as ProductResponse["status"],
        userId: product.userId,
        belongsToCurrentUser: product.userFirstName !== undefined,
        inWishList: product.isInUserWishList || false,
      }));

      setProducts(convertedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar actualizaciones de productos individuales
  const handleProductUpdate = (updatedProduct: ProductResponse) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productId === updatedProduct.productId
          ? updatedProduct
          : product
      )
    );
  };

  // Función para activar intercambio en todos los productos del usuario
  const handleEnableAllExchanges = async () => {
    try {
      setEnablingExchange(true);
      const updatedProducts = await enableAllProductsForExchange();

      // Actualizar los productos en el estado
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          const updatedProduct = updatedProducts.find(
            (updated) => updated.productId === product.productId
          );
          return updatedProduct || product;
        })
      );

      // Mostrar mensaje de éxito
      alert(
        `✅ Se activó el intercambio en ${updatedProducts.length} productos!`
      );
    } catch {
      // console.error("Error activando intercambio:", _err);
      alert("❌ Error al activar intercambio en los productos");
    } finally {
      setEnablingExchange(false);
    }
  };

  // Filter and sort products based on search, filters, and sort criteria
  const getFilteredAndSortedProducts = () => {
    let filtered = products;

    // Filter by search value (product name)
    if (searchValue.trim()) {
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Filter by condition
    if (conditionFilter !== "ALL") {
      filtered = filtered.filter(
        (product) => product.condition === conditionFilter
      );
    }

    // Filter by exchange availability
    if (exchangeFilter === "EXCHANGE") {
      filtered = filtered.filter((product) => product.availableForExchange);
    } else if (exchangeFilter === "NO_EXCHANGE") {
      filtered = filtered.filter((product) => !product.availableForExchange);
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    // Sort products
    if (sortBy === "ALPHABETICAL") {
      filtered = [...filtered].sort((a, b) =>
        a.productName.toLowerCase().localeCompare(b.productName.toLowerCase())
      );
    } else if (sortBy === "PRICE") {
      filtered = [...filtered].sort(
        (a, b) => b.estimatedValue - a.estimatedValue
      );
    } else {
      // Sort by date (most recent first)
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  };

  const filteredAndSortedProducts = getFilteredAndSortedProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = [
    { key: "CLOTHING", label: "Ropa" },
    { key: "ACCESSORIES", label: "Accesorios" },
    { key: "ELECTRONICS", label: "Electrónicos" },
    { key: "BOOKS", label: "Libros" },
    { key: "FURNITURE", label: "Muebles" },
    { key: "TOYS", label: "Juguetes" },
    { key: "HOME", label: "Hogar" },
    { key: "SPORTS", label: "Deportes" },
    { key: "INSTRUMENTS", label: "Instrumentos" },
  ];

  const conditions = [
    { key: "NEW", label: "Nuevo" },
    { key: "LIKE_NEW", label: "Como Nuevo" },
    { key: "USED", label: "Usado" },
    { key: "REFURBISHED", label: "Reacondicionado" },
    { key: "OPEN_BOX", label: "Caja Abierta" },
  ];

  const exchangeOptions = [
    { key: "ALL", label: "Todos" },
    { key: "EXCHANGE", label: "Solo intercambio" },
    { key: "NO_EXCHANGE", label: "Sin intercambio" },
  ];

  const sortOptions = [
    { key: "RECENT", label: "Más recientes" },
    { key: "ALPHABETICAL", label: "Alfabético" },
    { key: "PRICE", label: "Mayor precio" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <Button color="primary" onPress={fetchProducts}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        animate="show"
        className="w-full px-4 py-8 sm:px-6 lg:px-8"
        initial="hidden"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="text-white">
                <div className="mb-2 flex items-center gap-3">
                  <Icon className="text-3xl" icon="mdi:package-variant" />
                  <h1 className="text-3xl font-bold">Productos</h1>
                </div>
                <p className="text-lg text-white/90">
                  Explora y encuentra productos únicos para intercambiar o
                  regalar
                </p>
                <div className="mt-4 flex items-center gap-4 text-white/80">
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:package" />
                    {products.length} productos
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:swap-horizontal" />
                    {products.filter((p) => p.availableForExchange).length}{" "}
                    disponibles para intercambio
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
                  size="lg"
                  startContent={<Icon className="text-xl" icon="lucide:plus" />}
                  onPress={() => navigate("/create-product")}
                >
                  Nuevo Producto
                </Button>
                <Button
                  className="border border-green-400/40 bg-green-500/20 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-green-500/30"
                  size="lg"
                  isLoading={enablingExchange}
                  startContent={
                    <Icon className="text-xl" icon="mdi:swap-horizontal" />
                  }
                  onPress={handleEnableAllExchanges}
                >
                  {enablingExchange
                    ? "Activando..."
                    : "Activar Todos los Intercambios"}
                </Button>
                <Button
                  className="border-2 border-white/40 bg-transparent text-white transition-all duration-300 hover:bg-white/10"
                  size="lg"
                  startContent={
                    <Icon className="text-xl" icon="lucide:refresh-cw" />
                  }
                  onPress={fetchProducts}
                >
                  Actualizar
                </Button>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          </div>
        </motion.div>

        {/* User Error Notification */}
        {userError && (
          <motion.div className="mb-6" variants={itemVariants}>
            <ErrorNotification
              error={userError}
              type={userError.includes("Sesión expirada") ? "warning" : "error"}
              onClear={clearError}
              onRetry={() => (window.location.href = "/login")}
            />
          </motion.div>
        )}

        <motion.div className="mb-8" variants={itemVariants}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-lg dark:bg-gray-800/80">
            <CardBody className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1">
                  <Input
                    classNames={{
                      base: "w-full",
                      inputWrapper:
                        "bg-gray-100 dark:bg-gray-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-data-[focus=true]:bg-white dark:group-data-[focus=true]:bg-gray-600",
                    }}
                    placeholder="¿Qué producto estás buscando? Escribe aquí..."
                    radius="lg"
                    size="lg"
                    startContent={
                      <Icon
                        className="text-xl text-gray-400"
                        icon="lucide:search"
                      />
                    }
                    type="search"
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                </div>

                <div className="flex min-w-fit flex-col gap-3 sm:flex-row">
                  <Select
                    aria-label="Filtrar productos por categoría"
                    className="min-w-[180px]"
                    label="Categoría"
                    placeholder="Todas"
                    selectedKeys={
                      categoryFilter !== "ALL" ? [categoryFilter] : []
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setCategoryFilter(selected || "ALL");
                    }}
                  >
                    <SelectItem key="ALL" value="ALL">
                      Todas las categorías
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.key} value={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    aria-label="Filtrar productos por condición"
                    className="min-w-[160px]"
                    label="Condición"
                    placeholder="Todas"
                    selectedKeys={
                      conditionFilter !== "ALL" ? [conditionFilter] : []
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setConditionFilter(selected || "ALL");
                    }}
                  >
                    <SelectItem key="ALL" value="ALL">
                      Todas las condiciones
                    </SelectItem>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.key} value={condition.key}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    aria-label="Filtrar productos por disponibilidad de intercambio"
                    className="min-w-[160px]"
                    label="Intercambio"
                    selectedKeys={[exchangeFilter]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setExchangeFilter(selected);
                    }}
                  >
                    {exchangeOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    aria-label="Filtrar productos por estado"
                    className="min-w-[160px]"
                    label="Estado"
                    selectedKeys={[statusFilter]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as
                        | ProductStatus
                        | "ALL";

                      setStatusFilter(selected);
                    }}
                  >
                    <SelectItem key="ALL" value="ALL">
                      Todos los estados
                    </SelectItem>
                    <SelectItem key="ACTIVE" value="ACTIVE">
                      🟢 Activos
                    </SelectItem>
                    <SelectItem key="EXCHANGED" value="EXCHANGED">
                      🔄 Intercambiados
                    </SelectItem>
                    <SelectItem key="DONATED" value="DONATED">
                      🎁 Donados
                    </SelectItem>
                    <SelectItem key="INACTIVE" value="INACTIVE">
                      ⚫ Inactivos
                    </SelectItem>
                  </Select>

                  <Select
                    aria-label="Ordenar productos por criterio seleccionado"
                    className="min-w-[160px]"
                    label="Ordenar por"
                    selectedKeys={[sortBy]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setSortBy(
                        selected as "RECENT" | "ALPHABETICAL" | "PRICE"
                      );
                    }}
                  >
                    {sortOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Filter chips */}
              {(searchValue.trim() ||
                categoryFilter !== "ALL" ||
                conditionFilter !== "ALL" ||
                exchangeFilter !== "ALL") && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-600">
                  {searchValue.trim() && (
                    <Chip
                      color="primary"
                      variant="flat"
                      onClose={() => setSearchValue("")}
                    >
                      Búsqueda: "{searchValue}"
                    </Chip>
                  )}
                  {categoryFilter !== "ALL" && (
                    <Chip
                      color="secondary"
                      variant="flat"
                      onClose={() => setCategoryFilter("ALL")}
                    >
                      Categoría:{" "}
                      {categories.find((c) => c.key === categoryFilter)?.label}
                    </Chip>
                  )}
                  {conditionFilter !== "ALL" && (
                    <Chip
                      color="warning"
                      variant="flat"
                      onClose={() => setConditionFilter("ALL")}
                    >
                      Condición:{" "}
                      {conditions.find((c) => c.key === conditionFilter)?.label}
                    </Chip>
                  )}
                  {exchangeFilter !== "ALL" && (
                    <Chip
                      color="success"
                      variant="flat"
                      onClose={() => setExchangeFilter("ALL")}
                    >
                      {
                        exchangeOptions.find((e) => e.key === exchangeFilter)
                          ?.label
                      }
                    </Chip>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Products Grid */}
        <motion.div variants={itemVariants}>
          {filteredAndSortedProducts.length > 0 ? (
            <>
              {/* Stats bar */}
              <div className="mb-6 rounded-2xl border border-gray-200/50 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/60">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-2">
                      <Icon icon="mdi:package-variant" />
                      <strong>{filteredAndSortedProducts.length}</strong>{" "}
                      productos encontrados
                    </span>
                    <span className="flex items-center gap-2">
                      <Icon icon="mdi:swap-horizontal" />
                      <strong>
                        {
                          filteredAndSortedProducts.filter(
                            (p) => p.availableForExchange
                          ).length
                        }
                      </strong>{" "}
                      disponibles para intercambio
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Ordenado por:{" "}
                    {sortOptions.find((s) => s.key === sortBy)?.label}
                  </div>
                </div>
              </div>

              {/* Masonry Grid */}
              <div className="auto-rows-max grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={`${product.productId}-${index}`}
                    variants={itemVariants}
                  >
                    <ProductCard
                      product={product}
                      onProductUpdate={handleProductUpdate}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              variants={itemVariants}
            >
              <div className="mx-auto max-w-md">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                    <Icon
                      className="text-4xl text-gray-400"
                      icon="mdi:package-variant-remove"
                    />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  No se encontraron productos
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  No hay productos que coincidan con tus criterios de búsqueda.
                  Intenta ajustar los filtros o crear un nuevo producto.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    color="primary"
                    startContent={<Icon icon="lucide:plus" />}
                    onPress={() => navigate("/create-product")}
                  >
                    Crear Producto
                  </Button>
                  <Button
                    variant="flat"
                    onPress={() => {
                      setSearchValue("");
                      setCategoryFilter("ALL");
                      setConditionFilter("ALL");
                      setExchangeFilter("ALL");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProductosPage;
