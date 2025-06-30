import React from "react";
import { motion } from "framer-motion";

import Sidebar from "./sidebar";
import Topbar from "./topbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background animated-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <motion.main
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 w-full"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
