import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { AuthLayout } from "../components/auth/auth-layout.tsx";
import { LoginForm } from "../components/auth/login-form.tsx";
import { SignupForm } from "../components/auth/signup-form.tsx";
import { LightThemeProvider } from "../contexts/ThemeContext.tsx";

export default function AuthPage() {
  const [activeView, setActiveView] = React.useState<"login" | "signup">(
    "login"
  );

  return (
    <LightThemeProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <AuthLayout>
          <AnimatePresence mode="wait">
            {activeView === "login" ? (
              <motion.div
                key="login"
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <LoginForm onSwitchView={() => setActiveView("signup")} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <SignupForm onSwitchView={() => setActiveView("login")} />
              </motion.div>
            )}
          </AnimatePresence>
        </AuthLayout>
      </div>
    </LightThemeProvider>
  );
}
