import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Plus,
  Search,
  User,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Eye,
  Check,
  X,
  AlertCircle,
  Activity,
  Gift,
  HandHeart,
  Award,
  AlertTriangle,
} from "lucide-react";

import { donationService } from "../services/donationService";
import {
  DonationSummaryDto,
  DonationResponseDto,
  DonationStatus,
  CreateDonationRequest,
} from "../types/donation";
import NotificationToast from "../components/NotificationToast";
import {
  useNotifications,
  createSuccessNotification,
  createErrorNotification,
  createWarningNotification,
  getErrorMessage,
} from "../hooks/useNotifications";

interface DonationStatistics {
  totalDonationsGiven: number;
  totalDonationsReceived: number;
  totalPointsEarned: number;
  activeDonations: number;
  completedDonations: number;
  pendingRequests: number;
}

const DonacionesPage: React.FC = () => {
  const [availableDonations, setAvailableDonations] = useState<
    DonationSummaryDto[]
  >([]);
  const [userDonations, setUserDonations] = useState<DonationSummaryDto[]>([]);
  const [statistics, setStatistics] = useState<DonationStatistics>({
    totalDonationsGiven: 0,
    totalDonationsReceived: 0,
    totalPointsEarned: 0,
    activeDonations: 0,
    completedDonations: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("disponibles");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] =
    useState<DonationResponseDto | null>(null);
  const [createDonationForm, setCreateDonationForm] =
    useState<CreateDonationRequest>({
      productId: 0,
      description: "",
      donationLocation: "",
      donorNote: "",
    });

  // Use the notifications hook
  const { notifications, addNotification, removeNotification } =
    useNotifications();

  useEffect(() => {
    loadDonations();
    loadStatistics();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const [available, userDonations] = await Promise.all([
        donationService.getAllAvailableDonations(),
        donationService.getUserDonations(),
      ]);

      setAvailableDonations(available);
      setUserDonations(userDonations);
    } catch (error) {
      createErrorNotification(
        addNotification,
        "Error al cargar donaciones",
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await donationService.getDonationStatistics();

      setStatistics(stats);
    } catch (error) {
      createErrorNotification(
        addNotification,
        "Error al cargar estadísticas",
        getErrorMessage(error)
      );
      // Set default values on error
      setStatistics({
        totalDonationsGiven: 0,
        totalDonationsReceived: 0,
        totalPointsEarned: 0,
        activeDonations: 0,
        completedDonations: 0,
        pendingRequests: 0,
      });
    }
  };

  const handleRequestDonation = async (donationId: number) => {
    try {
      await donationService.requestDonation(donationId);
      createSuccessNotification(
        addNotification,
        "Solicitud enviada",
        "Tu solicitud de donación ha sido enviada correctamente"
      );
      await loadDonations();
    } catch (error) {
      createErrorNotification(
        addNotification,
        "Error al solicitar donación",
        getErrorMessage(error)
      );
    }
  };

  const openDonationDetails = async (donationId: number) => {
    try {
      const donation = await donationService.getDonationById(donationId);

      setSelectedDonation(donation);
      setIsDetailsModalOpen(true);
    } catch (error) {
      createErrorNotification(
        addNotification,
        "Error al cargar detalles",
        getErrorMessage(error)
      );
    }
  };

  const handleCreateDonation = async () => {
    try {
      // Validate form
      if (!createDonationForm.productId) {
        createWarningNotification(
          addNotification,
          "Formulario incompleto",
          "Por favor selecciona un producto para donar"
        );
        return;
      }

      if (!createDonationForm.description?.trim()) {
        createWarningNotification(
          addNotification,
          "Formulario incompleto",
          "Por favor agrega una descripción para la donación"
        );

        return;
      }

      if (!createDonationForm.donationLocation?.trim()) {
        createWarningNotification(
          addNotification,
          "Formulario incompleto",
          "Por favor especifica la ubicación de entrega"
        );

        return;
      }

      await donationService.createDonation(createDonationForm);
      createSuccessNotification(
        addNotification,
        "Donación creada",
        "Tu donación ha sido creada exitosamente y está disponible para solicitudes"
      );
      setIsCreateModalOpen(false);
      setCreateDonationForm({
        productId: 0,
        description: "",
        donationLocation: "",
        donorNote: "",
      });
      await loadDonations();
    } catch (error) {
      createErrorNotification(
        addNotification,
        "Error al crear donación",
        getErrorMessage(error)
      );
    }
  };

  const getFilteredDonations = () => {
    let filtered: DonationSummaryDto[] = [];

    switch (selectedTab) {
      case "disponibles":
        filtered = availableDonations;
        break;
      case "mis-donaciones":
        filtered = userDonations;
        break;
      case "todas":
        filtered = [...availableDonations, ...userDonations];
        break;
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((donation) => {
        const searchLower = searchTerm.toLowerCase();

        return (
          (donation.title?.toLowerCase().includes(searchLower) ?? false) ||
          (donation.description?.toLowerCase().includes(searchLower) ??
            false) ||
          (donation.donorName?.toLowerCase().includes(searchLower) ?? false) ||
          (donation.productName?.toLowerCase().includes(searchLower) ??
            false) ||
          (donation.donationLocation?.toLowerCase().includes(searchLower) ??
            false)
        );
      });
    }

    return filtered;
  };

  const filteredDonations = getFilteredDonations();

  const getStatusColor = (status: DonationStatus) => {
    switch (status) {
      case DonationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case DonationStatus.CONFIRMED:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case DonationStatus.IN_PROGRESS:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case DonationStatus.COMPLETED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case DonationStatus.CANCELLED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: DonationStatus) => {
    switch (status) {
      case DonationStatus.PENDING:
        return <Clock className="w-4 h-4" />;
      case DonationStatus.CONFIRMED:
        return <Check className="w-4 h-4" />;
      case DonationStatus.IN_PROGRESS:
        return <Activity className="w-4 h-4" />;
      case DonationStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case DonationStatus.CANCELLED:
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Heart className="w-8 h-8 text-green-500" />
                Donaciones
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Comparte y recibe productos de manera altruista
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Donación
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Donaciones Dadas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalDonationsGiven}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Gift className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Donaciones Recibidas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalDonationsReceived}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <HandHeart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Puntos Ganados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalPointsEarned}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Donaciones Activas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.activeDonations}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "disponibles", label: "Disponibles" },
                { key: "mis-donaciones", label: "Mis Donaciones" },
                { key: "todas", label: "Todas" },
              ].map(({ key, label }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTab(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTab === key
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar donaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Donations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay donaciones disponibles
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedTab === "disponibles"
                  ? "No se encontraron donaciones disponibles en este momento."
                  : "No tienes donaciones registradas."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {donation.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        alt={
                          donation.title ||
                          donation.productName ||
                          "Imagen de donación"
                        }
                        className="w-full h-full object-cover"
                        src={donation.imageUrl}
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {donation.title ||
                          donation.productName ||
                          "Donación sin título"}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                          donation.status
                        )}`}
                      >
                        {getStatusIcon(donation.status)}
                        {donation.status}
                      </span>
                    </div>

                    {donation.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {donation.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{donation.donorName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Package className="w-4 h-4" />
                        <span>{donation.productName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(donation.donationDate).toLocaleDateString()}
                        </span>
                      </div>
                      {donation.donationLocation && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{donation.donationLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDonationDetails(donation.id)}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </motion.button>

                      {selectedTab === "disponibles" &&
                        donation.status === DonationStatus.PENDING && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRequestDonation(donation.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Heart className="w-4 h-4" />
                            Solicitar
                          </motion.button>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Donation Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsDetailsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detalles de la Donación
                  </h2>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {selectedDonation.imageUrl && (
                  <img
                    src={selectedDonation.imageUrl}
                    alt={selectedDonation.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedDonation.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(
                        selectedDonation.status
                      )}`}
                    >
                      {getStatusIcon(selectedDonation.status)}
                      {selectedDonation.status}
                    </span>
                  </div>

                  {selectedDonation.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Descripción
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedDonation.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Donador
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedDonation.donorName}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Producto
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedDonation.productName}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Fecha de Donación
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {new Date(
                          selectedDonation.donationDate
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {selectedDonation.donationLocation && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Ubicación
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedDonation.donationLocation}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedDonation.donorNote && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Nota del Donador
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedDonation.donorNote}
                      </p>
                    </div>
                  )}

                  {selectedDonation.receiverNote && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Nota del Receptor
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedDonation.receiverNote}
                      </p>
                    </div>
                  )}

                  {selectedDonation.pointsAwarded && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Puntos Otorgados
                      </h4>
                      <p className="text-green-600 dark:text-green-400 font-semibold">
                        +{selectedDonation.pointsAwarded} puntos
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Donation Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Nueva Donación
                  </h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID del Producto
                    </label>
                    <input
                      type="number"
                      value={createDonationForm.productId || ""}
                      onChange={(e) =>
                        setCreateDonationForm({
                          ...createDonationForm,
                          productId: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ingresa el ID del producto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={createDonationForm.description}
                      onChange={(e) =>
                        setCreateDonationForm({
                          ...createDonationForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe tu donación..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ubicación de Entrega
                    </label>
                    <input
                      type="text"
                      value={createDonationForm.donationLocation}
                      onChange={(e) =>
                        setCreateDonationForm({
                          ...createDonationForm,
                          donationLocation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="¿Dónde se puede recoger?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nota Personal
                    </label>
                    <textarea
                      value={createDonationForm.donorNote}
                      onChange={(e) =>
                        setCreateDonationForm({
                          ...createDonationForm,
                          donorNote: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={2}
                      placeholder="Mensaje para el receptor..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateDonation}
                    disabled={!createDonationForm.productId}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Crear Donación
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <NotificationToast
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};

export default DonacionesPage;
