import React from "react";
import {
  Button,
  Input,
  Checkbox,
  Link,
  addToast,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import { useToken } from "@/contexts/TokenContext";

interface LoginFormProps {
  onSwitchView: () => void;
}

export function LoginForm({ onSwitchView }: LoginFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const { saveToken } = useToken();

  const formControls = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      setIsLoading(false);

      if (email && password) {
        const success = await handleSubmit();

        if (success) {
          addToast({
            title: "Login successful",
            description: "Welcome back to GreenLoop!",
            color: "success",
          });
          // La navegación se manejará automáticamente por App.tsx cuando detecte el token
        } else {
          addToast({
            title: "Login failed",
            description: "Please check your credentials and try again.",
            color: "danger",
          });
        }
      } else {
        addToast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          color: "danger",
        });
      }
    }, 1500);
  };

  async function handleSubmit() {
    const response = await fetch("http://localhost:8081/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();

      saveToken(data.token); // Usar el contexto en lugar de localStorage directamente

      return true;
    } else {
      return false;
    }
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="space-y-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Welcome back
        </h2>
        <p className="text-foreground-500 mt-2">
          Access your sustainable ecosystem
        </p>
      </motion.div>

      <form className="space-y-5" onSubmit={handleLogin}>
        <motion.div
          animate="visible"
          custom={0}
          initial="hidden"
          variants={formControls}
        >
          <Input
            isRequired
            classNames={{
              inputWrapper: "bg-content1/50 backdrop-blur-sm border-content3",
            }}
            label="Email"
            placeholder="Enter your email"
            radius="sm"
            startContent={
              <Icon className="text-default-400 text-lg" icon="lucide:mail" />
            }
            type="email"
            value={email}
            variant="bordered"
            onValueChange={setEmail}
          />
        </motion.div>

        <motion.div
          animate="visible"
          custom={1}
          initial="hidden"
          variants={formControls}
        >
          <Input
            isRequired
            classNames={{
              inputWrapper: "bg-content1/50 backdrop-blur-sm border-content3",
            }}
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={togglePasswordVisibility}
              >
                <Icon
                  className="text-default-400 text-lg cursor-pointer"
                  icon={isPasswordVisible ? "lucide:eye-off" : "lucide:eye"}
                />
              </button>
            }
            label="Password"
            placeholder="Enter your password"
            radius="sm"
            startContent={
              <Icon className="text-default-400 text-lg" icon="lucide:lock" />
            }
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            variant="bordered"
            onValueChange={setPassword}
          />
        </motion.div>

        <motion.div
          animate="visible"
          className="flex justify-between items-center"
          custom={2}
          initial="hidden"
          variants={formControls}
        >
          <Checkbox
            isSelected={rememberMe}
            radius="sm"
            onValueChange={setRememberMe}
          >
            <span className="text-sm">Remember me</span>
          </Checkbox>
          <Link className="text-primary" href="#" size="sm">
            Forgot password?
          </Link>
        </motion.div>

        <motion.div
          animate="visible"
          custom={3}
          initial="hidden"
          variants={formControls}
        >
          <Button
            className="w-full"
            color="primary"
            isLoading={isLoading}
            type="submit"
          >
            Sign in
          </Button>
        </motion.div>

        <motion.div
          animate="visible"
          className="relative my-6"
          custom={5}
          initial="hidden"
          variants={formControls}
        >
          <Divider className="my-4" />
          <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-content1 px-2 text-xs text-foreground-500" />
        </motion.div>

        <motion.div
          animate="visible"
          className="text-center"
          custom={4}
          initial="hidden"
          variants={formControls}
        >
          <p className="text-sm text-foreground-500">
            Don't have an account?{" "}
            <Button
              className="p-0 font-medium"
              color="primary"
              variant="light"
              onPress={onSwitchView}
            >
              Sign up
            </Button>
          </p>
        </motion.div>
      </form>
    </div>
  );
}
