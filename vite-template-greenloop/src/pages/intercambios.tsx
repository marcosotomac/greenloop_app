import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Euro,
  Eye,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Activity,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Target,
} from "lucide-react";

import { exchangeService } from "../services/exchangeService";
import type { Exchange, ExchangeStatistics } from "../types/exchange";

const IntercambiosPage: React.FC = () => {
  const [requestedExchanges, setRequestedExchanges] = useState<Exchange[]>([]);
  const [providedExchanges, setProvidedExchanges] = useState<Exchange[]>([]);
  const [statistics, setStatistics] = useState<ExchangeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pendientes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(
    null
  );

  useEffect(() => {
    loadExchanges();
    loadStatistics();
  }, []);

  const loadExchanges = async () => {
    try {
      setLoading(true);
      const [requested, provided] = await Promise.all([
        exchangeService.getRequestedExchanges(),
        exchangeService.getProvidedExchanges(),
      ]);

      setRequestedExchanges(requested);
      setProvidedExchanges(provided);
    } catch (error) {
      console.error("Error loading exchanges:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await exchangeService.getExchangeStatistics();

      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const handleExchangeAction = async (
    exchangeId: number,
    action: "accept" | "reject" | "complete" | "cancel"
  ) => {
    try {
      switch (action) {
        case "accept":
          await exchangeService.acceptExchange(exchangeId);
          break;
        case "reject":
          await exchangeService.rejectExchange(exchangeId);
          break;
        case "complete":
          await exchangeService.completeExchange(exchangeId);
          break;
        case "cancel":
          await exchangeService.cancelExchange(exchangeId);
          break;
      }

      await loadExchanges();
      await loadStatistics();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const openExchangeDetails = (exchange: Exchange) => {
    setSelectedExchange(exchange);
    setIsModalOpen(true);
  };

  const allExchanges = [...requestedExchanges, ...providedExchanges];

  const getFilteredExchanges = () => {
    let filtered = allExchanges;

    // Filter by tab
    switch (selectedTab) {
      case "pendientes":
        filtered = filtered.filter((e) => e.status === "PENDING");
        break;
      case "aceptados":
        filtered = filtered.filter((e) => e.status === "ACCEPTED");
        break;
      case "completados":
        filtered = filtered.filter((e) => e.status === "COMPLETED");
        break;
      case "todos":
        // No filter needed
        break;
    }

    // Filter by search
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (exchange) =>
          exchange.requestedProductName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          exchange.offeredProductName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          exchange.requesterName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          exchange.providerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredExchanges = getFilteredExchanges();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "ACCEPTED":
        return "primary";
      case "COMPLETED":
        return "success";
      case "REJECTED":
        return "danger";
      case "CANCELLED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "ACCEPTED":
        return "Aceptado";
      case "COMPLETED":
        return "Completado";
      case "REJECTED":
        return "Rechazado";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  const isMyRequest = (exchange: Exchange) => {
    // This would need to be determined based on current user
    // For now, assuming we're checking if it's in requestedExchanges
    return requestedExchanges.some(
      (req) => req.exchangeId === exchange.exchangeId
    );
  };

  const canAccept = (exchange: Exchange) => {
    return !isMyRequest(exchange) && exchange.status === "PENDING";
  };

  const canReject = (exchange: Exchange) => {
    return !isMyRequest(exchange) && exchange.status === "PENDING";
  };

  const canComplete = (exchange: Exchange) => {
    return exchange.status === "ACCEPTED";
  };

  const canCancel = (exchange: Exchange) => {
    return (
      isMyRequest(exchange) &&
      (exchange.status === "PENDING" || exchange.status === "ACCEPTED")
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-green-900/10 dark:to-emerald-900/10">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,197,94,0.1)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_20%,_rgba(34,197,94,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(16,185,129,0.1)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_80%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,_rgba(5,150,105,0.08)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_40%_60%,_rgba(5,150,105,0.03)_0%,_transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-slate-800 dark:via-green-900/20 dark:to-emerald-900/20 shadow-2xl border border-green-100/50 dark:border-slate-700/50 backdrop-blur-sm mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 dark:from-green-500/3 dark:to-emerald-500/3" />
          <div className="absolute top-8 right-8 w-40 h-40 bg-green-400/10 dark:bg-green-400/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-2xl" />

          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Header info */}
              <div className="flex items-center gap-6">
                {/* Exchange icon */}
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <ArrowLeftRight className="w-8 h-8 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </div>

                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    Gestión de Intercambios
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Administra todas las propuestas de intercambio sostenible de
                    tu comunidad
                  </p>
                </div>
              </div>

              {/* New Exchange Button */}
              <motion.button
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = "/productos")}
              >
                <Plus className="w-5 h-5" />
                Nuevo Intercambio
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {statistics && (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border border-yellow-100/50 dark:border-slate-700/50 p-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 dark:from-yellow-500/3 dark:to-orange-500/3" />
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl mb-3 mx-auto">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {statistics.pendingExchanges}
                </div>
                <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Pendientes
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border border-blue-100/50 dark:border-slate-700/50 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/3 dark:to-indigo-500/3" />
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-3 mx-auto">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {statistics.acceptedExchanges}
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Aceptados
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border border-green-100/50 dark:border-slate-700/50 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/3 dark:to-emerald-500/3" />
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl mb-3 mx-auto">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {statistics.completedExchanges}
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  Completados
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border border-teal-100/50 dark:border-slate-700/50 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 dark:from-teal-500/3 dark:to-cyan-500/3" />
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl mb-3 mx-auto">
                  <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                  €
                  {(
                    ((statistics.averageProductValue || 0) *
                      (statistics.completedExchanges || 0)) /
                    1000
                  ).toFixed(1)}
                  K
                </div>
                <div className="text-sm font-medium text-teal-700 dark:text-teal-300">
                  Valor Total
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100/50 dark:border-slate-700/50 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar intercambios por título, productos o usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90 dark:bg-slate-900/90 text-gray-900 dark:text-gray-100 font-medium transition-all duration-300 hover:border-green-300 dark:hover:border-green-600 backdrop-blur-sm"
              />
            </div>
            <motion.button
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-700/80 text-green-700 dark:text-green-300 rounded-xl font-semibold border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-5 h-5" />
              Filtros Avanzados
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100/50 dark:border-slate-700/50 p-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-wrap gap-2">
            {/* Tab Pendientes */}
            <motion.button
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === "pendientes"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab("pendientes")}
            >
              <span>Pendientes</span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  selectedTab === "pendientes"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                }`}
              >
                {allExchanges.filter((e) => e.status === "PENDING").length}
              </span>
            </motion.button>

            {/* Tab Aceptados */}
            <motion.button
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === "aceptados"
                  ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab("aceptados")}
            >
              <span>Aceptados</span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  selectedTab === "aceptados"
                    ? "bg-white/20 text-white"
                    : "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                }`}
              >
                {allExchanges.filter((e) => e.status === "ACCEPTED").length}
              </span>
            </motion.button>

            {/* Tab Completados */}
            <motion.button
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === "completados"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab("completados")}
            >
              <span>Completados</span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  selectedTab === "completados"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {allExchanges.filter((e) => e.status === "COMPLETED").length}
              </span>
            </motion.button>

            {/* Tab Todos */}
            <motion.button
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === "todos"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab("todos")}
            >
              <span>Todos</span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  selectedTab === "todos"
                    ? "bg-white/20 text-white"
                    : "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                }`}
              >
                {allExchanges.length}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Exchange List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div
                className="w-16 h-16 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : filteredExchanges.length === 0 ? (
            <motion.div
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100/50 dark:border-slate-700/50 p-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="relative inline-block mb-6">
                <div className="flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                  <Package className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <AlertCircle className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No hay intercambios
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {selectedTab === "pendientes"
                  ? "No tienes intercambios pendientes en este momento"
                  : `No hay intercambios ${selectedTab} para mostrar`}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredExchanges.map((exchange, index) => (
                  <motion.div
                    key={exchange.exchangeId}
                    className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border border-green-100/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    {/* Decorative element */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-transparent to-emerald-500/3 dark:from-green-500/1 dark:to-emerald-500/1" />

                    <div className="relative z-10 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Exchange Icon */}
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                            <ArrowLeftRight className="w-6 h-6 text-white" />
                          </div>

                          {/* Exchange Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                                {exchange.requestedProductName} ↔{" "}
                                {exchange.offeredProductName}
                              </h3>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold shadow-sm ${
                                  exchange.status === "PENDING"
                                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50"
                                    : exchange.status === "ACCEPTED"
                                      ? "bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800/50"
                                      : exchange.status === "COMPLETED"
                                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50"
                                        : exchange.status === "REJECTED"
                                          ? "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {getStatusText(exchange.status)}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>
                                  {isMyRequest(exchange)
                                    ? `Solicitas a ${exchange.providerName}`
                                    : `Solicita ${exchange.requesterName}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    exchange.requestedAt
                                  ).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>Madrid</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-200 rounded-lg font-medium border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openExchangeDetails(exchange)}
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalles
                          </motion.button>

                          {canAccept(exchange) && (
                            <motion.button
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleExchangeAction(
                                  exchange.exchangeId,
                                  "accept"
                                )
                              }
                            >
                              <Check className="w-4 h-4" />
                              Aprobar
                            </motion.button>
                          )}

                          {canReject(exchange) && (
                            <motion.button
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-700/80 text-red-700 dark:text-red-400 rounded-lg font-medium border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleExchangeAction(
                                  exchange.exchangeId,
                                  "reject"
                                )
                              }
                            >
                              <X className="w-4 h-4" />
                              Rechazar
                            </motion.button>
                          )}

                          {canComplete(exchange) && (
                            <motion.button
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleExchangeAction(
                                  exchange.exchangeId,
                                  "complete"
                                )
                              }
                            >
                              <Activity className="w-4 h-4" />
                              Gestionar
                            </motion.button>
                          )}

                          {canCancel(exchange) && (
                            <motion.button
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-700/80 text-yellow-700 dark:text-yellow-400 rounded-lg font-medium border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleExchangeAction(
                                  exchange.exchangeId,
                                  "cancel"
                                )
                              }
                            >
                              <X className="w-4 h-4" />
                              Cancelar
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Exchange Details Modal */}
        <AnimatePresence>
          {isModalOpen && selectedExchange && (
            <motion.div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-8 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Detalles del Intercambio
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold shadow-sm ${
                          selectedExchange.status === "PENDING"
                            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50"
                            : selectedExchange.status === "ACCEPTED"
                              ? "bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800/50"
                              : selectedExchange.status === "COMPLETED"
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50"
                                : selectedExchange.status === "REJECTED"
                                  ? "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {getStatusText(selectedExchange.status)}
                      </span>
                    </div>
                    <motion.button
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsModalOpen(false)}
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-8">
                  {/* Products */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/70 dark:bg-slate-900/70 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                          OFRECE
                        </div>
                        <img
                          alt={selectedExchange.offeredProductName}
                          className="w-24 h-24 object-cover rounded-xl mx-auto mb-4 shadow-lg"
                          src={selectedExchange.offeredProductImage}
                        />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {selectedExchange.offeredProductName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedExchange.requesterName}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-900/70 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                          SOLICITA
                        </div>
                        <img
                          alt={selectedExchange.requestedProductName}
                          className="w-24 h-24 object-cover rounded-xl mx-auto mb-4 shadow-lg"
                          src={selectedExchange.requestedProductImage}
                        />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {selectedExchange.requestedProductName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedExchange.providerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Estado del Intercambio
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Solicitud enviada
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(
                              selectedExchange.requestedAt
                            ).toLocaleString("es-ES")}
                          </p>
                        </div>
                      </div>

                      {selectedExchange.status !== "PENDING" && (
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-4 h-4 rounded-full shadow-lg ${
                              selectedExchange.status === "ACCEPTED" ||
                              selectedExchange.status === "COMPLETED"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {selectedExchange.status === "ACCEPTED" ||
                              selectedExchange.status === "COMPLETED"
                                ? "Solicitud aceptada"
                                : selectedExchange.status === "REJECTED"
                                  ? "Solicitud rechazada"
                                  : "Intercambio cancelado"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Hace unos momentos
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedExchange.status === "COMPLETED" &&
                        selectedExchange.completedAt && (
                          <div className="flex items-center gap-4">
                            <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                Intercambio completado
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(
                                  selectedExchange.completedAt
                                ).toLocaleString("es-ES")}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex justify-end">
                    <motion.button
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cerrar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntercambiosPage;
