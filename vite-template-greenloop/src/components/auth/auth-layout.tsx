import React from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side - Brand showcase */}
      <motion.div
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-700 text-white p-8 flex-col justify-between relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Abstract background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.8, 0.6],
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
          />
        </div>

        <div className="relative z-10">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-8"
            initial={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Icon className="text-3xl" icon="lucide:recycle" />
              </motion.div>
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              GreenLoop
            </span>
          </motion.div>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Sustainable future through{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              circular innovation
            </span>
          </motion.h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-lg opacity-80 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Exchange, donate, and give new life to products with our AI-powered
            matching system.
          </motion.p>
        </div>

        <div className="space-y-6 relative z-10">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
            >
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                <Icon
                  className="text-xl"
                  icon={
                    ["lucide:refresh-cw", "lucide:heart", "lucide:leaf"][index]
                  }
                />
              </div>
              <div>
                <h3 className="font-medium">
                  {
                    [
                      "Smart Exchange",
                      "Impact Tracking",
                      "Carbon Footprint Analysis",
                    ][index]
                  }
                </h3>
                <p className="text-sm opacity-80">
                  {
                    [
                      "AI-powered matching for optimal resource circulation",
                      "Visualize your environmental contribution in real-time",
                      "Advanced metrics to quantify your positive impact",
                    ][index]
                  }
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: 1 }}
          className="mt-12 relative z-10"
          initial={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-sm opacity-70">
            © 2025 GreenLoop. Powering the circular economy.
          </p>
        </motion.div>
      </motion.div>

      {/* Right side - Auth forms */}
      <motion.div
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-background to-background/80"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex md:hidden items-center gap-2 mb-8 justify-center"
            initial={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-primary/10 p-2 rounded-lg">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Icon className="text-3xl text-primary" icon="lucide:recycle" />
              </motion.div>
            </div>
            <span className="text-2xl font-semibold text-foreground tracking-tight">
              GreenLoop
            </span>
          </motion.div>

          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="backdrop-blur-sm bg-content1/80 border border-content2 rounded-xl p-6 shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
            }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
