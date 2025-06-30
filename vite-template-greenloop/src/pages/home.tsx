import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CategoryStats,
  dashboardAPI,
  DashboardStats,
  MonthlyActivity,
  RecentActivity,
} from "../api/dashboardAPI";

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData, categoriesData, recentData] =
          await Promise.all([
            dashboardAPI.getGlobalStats(),
            dashboardAPI.getMonthlyActivity(7),
            dashboardAPI.getCategoryStats(),
            dashboardAPI.getRecentActivity(6),
          ]);

        setStats(statsData);
        setMonthlyActivity(activityData);
        setCategoryData(categoriesData);
        setRecentActivity(recentData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching dashboard data:", err);
        setError(
          "Error al cargar los datos del dashboard. Verifica que el backend esté funcionando correctamente."
        );
        // No fallback data - we want to show real data only
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Animation variants for staggered children
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label="Cargando estadísticas..." />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="p-5"
        animate="show"
        initial="hidden"
        variants={containerVariants}
      >
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <Icon
            icon="lucide:alert-circle"
            className="text-6xl text-warning mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">Error al cargar datos</h2>
          <p className="text-default-600 mb-4">{error}</p>
          <Button
            color="primary"
            onPress={() => window.location.reload()}
            startContent={<Icon icon="lucide:refresh-cw" />}
          >
            Recargar página
          </Button>
        </div>
      </motion.div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }

    return num.toString();
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case "donation":
        return "text-primary-500 bg-primary-100";
      case "exchange":
        return "text-secondary-500 bg-secondary-100";
      case "user_joined":
        return "text-success-500 bg-success-100";
      default:
        return "text-default-500 bg-default-100";
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/30 dark:to-primary-950/30"
      animate="show"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Hero section with enhanced gradient background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-success-500/10 blur-3xl dark:from-primary-400/20 dark:via-secondary-400/20 dark:to-success-400/20" />
        <motion.div className="relative p-6 md:p-8" variants={itemVariants}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                  <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-success-500 bg-clip-text text-transparent dark:from-primary-400 dark:via-secondary-400 dark:to-success-400">
                    ¡Bienvenido a
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-success-500 via-primary-500 to-secondary-500 bg-clip-text text-transparent dark:from-success-400 dark:via-primary-400 dark:to-secondary-400">
                    Greenloop!
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-default-600 dark:text-default-400 max-w-2xl leading-relaxed">
                  🌱 Transformamos residuos en oportunidades
                  <br />
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    Juntos construimos una economía circular más sostenible
                  </span>
                </p>
              </motion.div>
            </div>
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onPress={() => navigate("/create-post")}
                startContent={<Icon icon="lucide:plus" className="text-xl" />}
              >
                Nueva Publicación
              </Button>
              <Button
                variant="bordered"
                className="border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-semibold px-8 py-6 text-lg hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-all duration-300"
                onPress={() => navigate("/productos")}
                startContent={<Icon icon="lucide:search" className="text-xl" />}
              >
                Explorar
              </Button>
            </motion.div>
          </div>

          {/* Quick stats banner */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            variants={containerVariants}
          >
            <motion.div
              className="text-center p-4 rounded-2xl bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm"
              variants={itemVariants}
            >
              <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                {formatNumber(stats?.totalUsers || 0)}
              </div>
              <div className="text-sm text-default-600 dark:text-default-400 font-medium">
                Usuarios
              </div>
            </motion.div>
            <motion.div
              className="text-center p-4 rounded-2xl bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm"
              variants={itemVariants}
            >
              <div className="text-2xl md:text-3xl font-bold text-secondary-600 dark:text-secondary-400">
                {formatNumber(stats?.totalProducts || 0)}
              </div>
              <div className="text-sm text-default-600 dark:text-default-400 font-medium">
                Productos
              </div>
            </motion.div>
            <motion.div
              className="text-center p-4 rounded-2xl bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm"
              variants={itemVariants}
            >
              <div className="text-2xl md:text-3xl font-bold text-success-600 dark:text-success-400">
                {formatNumber(stats?.totalExchanges || 0)}
              </div>
              <div className="text-sm text-default-600 dark:text-default-400 font-medium">
                Intercambios
              </div>
            </motion.div>
            <motion.div
              className="text-center p-4 rounded-2xl bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm"
              variants={itemVariants}
            >
              <div className="text-2xl md:text-3xl font-bold text-warning-600 dark:text-warning-400">
                {stats?.wasteAvoided.toFixed(0) || "0"}kg
              </div>
              <div className="text-sm text-default-600 dark:text-default-400 font-medium">
                Residuos Evitados
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div className="px-6 md:px-8 pb-8">
        {/* Enhanced Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div variants={itemVariants}>
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/50 dark:to-primary-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardBody className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-primary-500/10 dark:bg-primary-400/20 group-hover:bg-primary-500/20 dark:group-hover:bg-primary-400/30 transition-colors duration-300">
                    <Icon
                      className="text-primary-500 dark:text-primary-400 text-2xl"
                      icon="lucide:leaf"
                    />
                  </div>
                  <Chip
                    color="success"
                    size="sm"
                    variant="flat"
                    startContent={
                      <Icon icon="lucide:trending-up" className="text-xs" />
                    }
                  >
                    +{stats?.growthPercentage.toFixed(1) || "0"}%
                  </Chip>
                </div>
                <div className="space-y-2">
                  <p className="text-default-500 dark:text-default-400 text-sm font-medium">
                    Residuos Evitados
                  </p>
                  <h3 className="text-3xl font-black text-primary-700 dark:text-primary-300">
                    {stats?.wasteAvoided.toFixed(0) || "0"}
                    <span className="text-lg font-semibold ml-1">kg</span>
                  </h3>
                  <p className="text-success-600 dark:text-success-400 text-xs font-semibold">
                    Impacto este mes
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-secondary-50 to-secondary-100/50 dark:from-secondary-950/50 dark:to-secondary-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardBody className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-secondary-500/10 dark:bg-secondary-400/20 group-hover:bg-secondary-500/20 dark:group-hover:bg-secondary-400/30 transition-colors duration-300">
                    <Icon
                      className="text-secondary-500 dark:text-secondary-400 text-2xl"
                      icon="lucide:users"
                    />
                  </div>
                  <Chip
                    color="primary"
                    size="sm"
                    variant="flat"
                    startContent={
                      <Icon icon="lucide:user-check" className="text-xs" />
                    }
                  >
                    {(
                      ((stats?.activeUsers || 0) / (stats?.totalUsers || 1)) *
                      100
                    ).toFixed(0)}
                    % activos
                  </Chip>
                </div>
                <div className="space-y-2">
                  <p className="text-default-500 dark:text-default-400 text-sm font-medium">
                    Usuarios Activos
                  </p>
                  <h3 className="text-3xl font-black text-secondary-700 dark:text-secondary-300">
                    {formatNumber(stats?.activeUsers || 0)}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 text-xs font-semibold">
                    De {formatNumber(stats?.totalUsers || 0)} usuarios totales
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-success-50 to-success-100/50 dark:from-success-950/50 dark:to-success-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-success-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardBody className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-success-500/10 dark:bg-success-400/20 group-hover:bg-success-500/20 dark:group-hover:bg-success-400/30 transition-colors duration-300">
                    <Icon
                      className="text-success-500 dark:text-success-400 text-2xl"
                      icon="lucide:package"
                    />
                  </div>
                  <Chip
                    color="success"
                    size="sm"
                    variant="flat"
                    startContent={
                      <Icon icon="lucide:trending-up" className="text-xs" />
                    }
                  >
                    Disponibles
                  </Chip>
                </div>
                <div className="space-y-2">
                  <p className="text-default-500 dark:text-default-400 text-sm font-medium">
                    Productos Compartidos
                  </p>
                  <h3 className="text-3xl font-black text-success-700 dark:text-success-300">
                    {formatNumber(stats?.totalProducts || 0)}
                  </h3>
                  <p className="text-success-600 dark:text-success-400 text-xs font-semibold">
                    En toda la plataforma
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-warning-50 to-warning-100/50 dark:from-warning-950/50 dark:to-warning-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-warning-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardBody className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-warning-500/10 dark:bg-warning-400/20 group-hover:bg-warning-500/20 dark:group-hover:bg-warning-400/30 transition-colors duration-300">
                    <Icon
                      className="text-warning-500 dark:text-warning-400 text-2xl"
                      icon="lucide:repeat"
                    />
                  </div>
                  <Chip
                    color="warning"
                    size="sm"
                    variant="flat"
                    startContent={
                      <Icon icon="lucide:heart" className="text-xs" />
                    }
                  >
                    +{formatNumber(stats?.totalDonations || 0)} donaciones
                  </Chip>
                </div>
                <div className="space-y-2">
                  <p className="text-default-500 dark:text-default-400 text-sm font-medium">
                    Intercambios Exitosos
                  </p>
                  <h3 className="text-3xl font-black text-warning-700 dark:text-warning-300">
                    {formatNumber(stats?.totalExchanges || 0)}
                  </h3>
                  <p className="text-warning-600 dark:text-warning-400 text-xs font-semibold">
                    Transacciones completadas
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Charts section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          <motion.div className="xl:col-span-2" variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-primary-50/30 dark:from-gray-900 dark:to-primary-950/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full -mr-16 -mt-16" />
              <CardBody className="relative p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
                      Actividad Mensual
                    </h3>
                    <p className="text-default-600 dark:text-default-400">
                      Tendencia de participación de usuarios
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Chip
                      color="primary"
                      size="lg"
                      variant="flat"
                      startContent={
                        <Icon icon="lucide:calendar" className="text-sm" />
                      }
                    >
                      Últimos 7 meses
                    </Chip>
                    <Chip
                      color="success"
                      size="lg"
                      variant="flat"
                      startContent={
                        <Icon icon="lucide:trending-up" className="text-sm" />
                      }
                    >
                      En crecimiento
                    </Chip>
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-white/10">
                  <ResponsiveContainer height={320} width="100%">
                    <AreaChart
                      data={monthlyActivity}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorGradient"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#22c55e"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="50%"
                            stopColor="#10b981"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="#059669"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <filter id="dropShadow">
                          <feDropShadow
                            dx="0"
                            dy="4"
                            stdDeviation="3"
                            floodOpacity="0.3"
                          />
                        </filter>
                      </defs>
                      <XAxis
                        axisLine={false}
                        dataKey="month"
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <CartesianGrid
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        vertical={false}
                        opacity={0.5}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(10px)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                        }}
                        labelFormatter={(label) => {
                          const item = monthlyActivity.find(
                            (item) => item.month === label
                          );
                          return item?.displayMonth || label;
                        }}
                        formatter={(value: any) => [
                          `${value} actividades`,
                          "Actividad",
                        ]}
                      />
                      <Area
                        dataKey="value"
                        fill="url(#colorGradient)"
                        fillOpacity={1}
                        stroke="#22c55e"
                        strokeWidth={3}
                        type="monotone"
                        filter="url(#dropShadow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-secondary-50/30 dark:from-gray-900 dark:to-secondary-950/30 overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-500/10 to-transparent rounded-full -mr-16 -mt-16" />
              <CardBody className="relative p-8 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-secondary-600 to-warning-600 dark:from-secondary-400 dark:to-warning-400 bg-clip-text text-transparent">
                    Categorías Populares
                  </h3>
                  <p className="text-default-600 dark:text-default-400">
                    Distribución de productos por tipo
                  </p>
                </div>
                <div className="flex-1 bg-white/50 dark:bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-white/10">
                  <ResponsiveContainer height={300} width="100%">
                    <PieChart>
                      <defs>
                        <filter id="pieShadow">
                          <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="4"
                            floodOpacity="0.3"
                          />
                        </filter>
                      </defs>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={categoryData}
                        dataKey="value"
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={30}
                        paddingAngle={2}
                        filter="url(#pieShadow)"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(10px)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: any) => [
                          `${value} productos`,
                          "Cantidad",
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Recent activity */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-success-50/30 dark:from-gray-900 dark:to-success-950/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-success-500/5 to-transparent rounded-full -mr-20 -mt-20" />
            <CardBody className="relative p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-success-600 to-primary-600 dark:from-success-400 dark:to-primary-400 bg-clip-text text-transparent">
                    Actividad Reciente
                  </h3>
                  <p className="text-default-600 dark:text-default-400">
                    Lo último que está pasando en nuestra comunidad
                  </p>
                </div>
                <Button
                  variant="flat"
                  color="success"
                  className="font-semibold"
                  startContent={<Icon icon="lucide:activity" />}
                >
                  Ver todo
                </Button>
              </div>

              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="group relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${getActivityColor(activity.type)} shadow-lg`}
                        >
                          {activity.userInitial}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          {activity.type === "donation" && (
                            <Icon
                              icon="lucide:heart"
                              className="text-primary-500 dark:text-primary-400 text-xs"
                            />
                          )}
                          {activity.type === "exchange" && (
                            <Icon
                              icon="lucide:repeat"
                              className="text-secondary-500 dark:text-secondary-400 text-xs"
                            />
                          )}
                          {activity.type === "user_joined" && (
                            <Icon
                              icon="lucide:user-plus"
                              className="text-success-500 dark:text-success-400 text-xs"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-lg text-default-800 dark:text-default-200">
                              {activity.userName}
                            </span>
                            <span className="text-default-600 dark:text-default-400 font-medium">
                              {activity.action}
                            </span>
                            <span className="font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full text-sm">
                              {activity.itemName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-default-500 dark:text-default-400 text-sm font-medium flex items-center gap-2">
                            <Icon icon="lucide:clock" className="text-xs" />
                            {activity.timeAgo}
                          </p>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              activity.type === "donation"
                                ? "primary"
                                : activity.type === "exchange"
                                  ? "secondary"
                                  : "success"
                            }
                          >
                            {activity.type === "donation"
                              ? "Donación"
                              : activity.type === "exchange"
                                ? "Intercambio"
                                : "Nuevo Usuario"}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {recentActivity.length === 0 && (
                  <motion.div
                    className="text-center py-12 text-default-400"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-default-100 dark:bg-default-800 flex items-center justify-center">
                      <Icon
                        icon="lucide:activity"
                        className="text-4xl text-default-300 dark:text-default-600"
                      />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">
                      No hay actividad reciente
                    </h4>
                    <p className="text-sm">
                      La actividad de la comunidad aparecerá aquí
                    </p>
                  </motion.div>
                )}
              </div>
            </CardBody>
            <CardFooter className="relative bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-950/50 dark:to-primary-950/50 border-t border-white/20 dark:border-white/10">
              <Button
                className="w-full bg-gradient-to-r from-success-500 to-primary-500 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                startContent={<Icon icon="lucide:eye" className="text-lg" />}
              >
                Ver toda la actividad
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
