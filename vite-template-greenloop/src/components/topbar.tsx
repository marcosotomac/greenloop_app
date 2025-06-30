import React, { useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  Input,
  Button,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Tooltip from "./ui/tooltip";

import { useTheme } from "@/contexts/ThemeContext";

const Topbar: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-[50] w-full bg-background backdrop-blur-md border-b border-default-200 h-[57px] px-4 lg:px-6 hidden lg:flex items-center justify-between gap-4 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1 max-w-md relative">
        <Input
          classNames={{
            base: "max-w-full",
            mainWrapper: "h-9",
            input: "text-small",
            inputWrapper:
              "h-9 bg-default-100/50 border-default-200 hover:bg-default-100/80 focus:bg-default-100",
          }}
          placeholder="Buscar en Greenloop..."
          size="sm"
          startContent={
            <Icon className="text-default-400" icon="lucide:search" />
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              isIconOnly
              aria-label="Crear nuevo"
              className="text-default-700 hover:bg-default-100"
              variant="light"
            >
              <Icon className="text-xl" icon="lucide:plus" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Crear nuevo" className="p-2">
            <DropdownItem
              key="publicacion"
              className="hover:bg-default-100"
              startContent={
                <Icon className="text-primary" icon="lucide:file-plus" />
              }
              onClick={() => navigate("/create-post")}
            >
              Nueva publicación
            </DropdownItem>
            <DropdownItem
              key="producto"
              className="hover:bg-default-100"
              startContent={
                <Icon className="text-primary" icon="lucide:package" />
              }
              onClick={() => navigate("/create-product")}
            >
              Nuevo producto
            </DropdownItem>
            <DropdownItem
              key="grupo"
              className="hover:bg-default-100"
              startContent={
                <Icon className="text-primary" icon="lucide:users-2" />
              }
              onClick={() => navigate("/create-community")}
            >
              Nueva comunidad
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Tooltip content="Notificaciones">
          <Badge color="danger" content={3} size="sm">
            <Button
              isIconOnly
              aria-label="Notificaciones"
              className="text-default-700 hover:bg-default-100"
              variant="light"
              onClick={() => navigate("/notificaciones")}
            >
              <Icon className="text-xl" icon="lucide:bell" />
            </Button>
          </Badge>
        </Tooltip>
      </div>
    </motion.div>
  );
};

export default Topbar;
