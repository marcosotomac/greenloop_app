import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { motion } from "framer-motion";

import { useTheme } from "@/contexts/ThemeContext";
import { useToken } from "@/contexts/TokenContext.tsx";
import { useUser } from "@/contexts/UserContext";

const GreenloopLogo = () => {
  return (
    <div className="flex items-center gap-3 h-full">
      <motion.div
        className="bg-white rounded-full p-1.5 shadow-md flex items-center justify-center"
        transition={{ type: "spring", stiffness: 300 }}
        whileHover={{ rotate: 15 }}
      >
        <Icon className="text-primary text-2xl" icon="lucide:leaf" />
      </motion.div>
      <div className="flex flex-col justify-center">
        <h1 className="font-bold text-white text-xl tracking-tight leading-none">
          Greenloop
        </h1>
        <p className="text-white/80 text-xs font-medium mt-0.5">
          Economía Circular
        </p>
      </div>
    </div>
  );
};

const SidebarSection = ({ title }: { title: string }) => (
  <div className="px-4 py-2 mt-2 mb-1">
    <h2 className="text-xs font-semibold text-default-400 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useLocation();
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const mainNavItems = [
    { path: "/", label: "Inicio", icon: "lucide:home" },
    {
      path: "/publicaciones",
      label: "Publicaciones",
      icon: "lucide:file-text",
    },
    { path: "/productos", label: "Productos", icon: "lucide:shopping-bag" },
    {
      path: "/greenloop-ai",
      label: "GreenLoop AI",
      icon: "lucide:bar-chart-2",
    },
  ];

  const communityNavItems = [
    { path: "/comunidad", label: "Comunidad", icon: "lucide:users" },
    {
      path: "/chat",
      label: "Chat",
      icon: "lucide:message-circle",
      hasNotification: true,
    },
    { path: "/intercambios", label: "Intercambios", icon: "lucide:repeat" },
  ];

  const personalNavItems = [
    {
      path: "/notificaciones",
      label: "Notificaciones",
      icon: "lucide:bell",
      hasNotification: true,
    },
    { path: "/donaciones", label: "Donaciones", icon: "lucide:heart" },
    { path: "/wishlist", label: "Mi Wishlist", icon: "lucide:bookmark" },
  ];

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" },
  };

  const renderNavItems = (items: any[]) =>
    items.map((item) => (
      <motion.li
        key={item.path}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        whileHover={{ x: 4 }}
      >
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-default-600 hover:bg-default-100"
            }`
          }
          to={item.path}
          onClick={() => {
            if (window.innerWidth < 1024) {
              setIsOpen(false);
            }
          }}
        >
          <div className="relative">
            <Icon className="text-xl" icon={item.icon} />
            {item.hasNotification && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full" />
            )}
          </div>
          <span className="font-medium">{item.label}</span>
        </NavLink>
      </motion.li>
    ));

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 flex justify-between items-center shadow-soft h-[57px]">
        <GreenloopLogo />
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            aria-label="Toggle theme"
            className="text-white hover:bg-white/10"
            variant="light"
            onPress={toggleTheme}
          >
            <Icon
              className="text-xl"
              icon={theme === "dark" ? "lucide:sun" : "lucide:moon"}
            />
          </Button>
          <UserProfileDropdown />
          <Button
            isIconOnly
            aria-label="Toggle menu"
            className="text-white hover:bg-white/10"
            variant="light"
            onPress={toggleSidebar}
          >
            <Icon
              className="text-xl"
              icon={isOpen ? "lucide:x" : "lucide:menu"}
            />
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        animate="expanded"
        className={`
          fixed lg:sticky top-0 z-40 h-screen bg-background/95 backdrop-blur-md border-r border-default-200 
          flex flex-col shadow-soft
          ${isOpen ? "left-0" : "-left-full"}
          lg:left-0
        `}
        initial="expanded"
        variants={sidebarVariants}
      >
        {/* Desktop logo */}
        <div className="hidden lg:block bg-gradient-to-r from-green-500 to-emerald-600 p-4 shadow-soft h-[57px]">
          <div className="flex justify-between items-center h-full">
            <GreenloopLogo />
            <Button
              isIconOnly
              aria-label="Toggle theme"
              className="text-white hover:bg-white/10"
              variant="light"
              onPress={toggleTheme}
            >
              <Icon
                className="text-xl"
                icon={theme === "dark" ? "lucide:sun" : "lucide:moon"}
              />
            </Button>
          </div>
        </div>

        {/* Mobile header */}
        <div className="lg:hidden flex justify-between items-center bg-gradient-to-r from-green-500 to-emerald-600 p-4 h-[57px]">
          <h2 className="text-white font-medium">Menú</h2>
          <Button
            isIconOnly
            aria-label="Close menu"
            className="text-white hover:bg-white/10"
            variant="light"
            onPress={toggleSidebar}
          >
            <Icon className="text-xl" icon="lucide:x" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {/* Main navigation */}
          <SidebarSection title="Principal" />
          <ul className="space-y-1 mb-6">{renderNavItems(mainNavItems)}</ul>

          {/* Community navigation */}
          <SidebarSection title="Comunidad" />
          <ul className="space-y-1 mb-6">
            {renderNavItems(communityNavItems)}
          </ul>

          {/* Personal navigation */}
          <SidebarSection title="Personal" />
          <ul className="space-y-1">{renderNavItems(personalNavItems)}</ul>
        </div>

        {/* Bottom section with user profile */}
        <div className="p-3 border-t border-default-200 bg-background/50 backdrop-blur-sm">
          <UserProfileDropdown />
        </div>
      </motion.aside>

      {/* Spacer for mobile view */}
      <div className="h-14 lg:hidden" />
    </>
  );
};

const UserProfileDropdown = () => {
  const { removeToken } = useToken();
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remover el token - ProtectedRoutes automáticamente redirigirá
    removeToken();
  };

  const handleProfileClick = () => {
    navigate("/my-profile");
  };

  // Mostrar loading state
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-xl">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="hidden lg:block space-y-1">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-2 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Datos por defecto si no hay usuario
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Usuario";
  const displayEmail = user?.email || "usuario@example.com";
  const displayLevel = user?.level || "Miembro";

  // Función para obtener las iniciales del usuario
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  const userInitials = getInitials(displayName);

  return (
    <Dropdown placement="top-end">
      <DropdownTrigger>
        <div className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-xl cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {userInitials}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-default-900 truncate max-w-[120px]">
              {displayName}
            </p>
            <p className="text-xs text-default-500 truncate max-w-[120px]">
              {displayEmail}
            </p>
          </div>
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownItem
          key="profile"
          startContent={<Icon icon="lucide:user" />}
          onPress={handleProfileClick}
        >
          Mi Perfil
        </DropdownItem>
        <DropdownItem
          key="logout"
          className="text-danger"
          color="danger"
          startContent={<Icon icon="lucide:log-out" />}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default Sidebar;
