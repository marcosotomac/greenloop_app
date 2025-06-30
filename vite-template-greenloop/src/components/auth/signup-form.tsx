import React from "react";
import {
  Button,
  Input,
  Checkbox,
  Divider,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useToken } from "@/contexts/TokenContext.tsx";

interface SignupFormProps {
  onSwitchView: () => void;
}

export function SignupForm({ onSwitchView }: SignupFormProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = React.useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = React.useState(false);
  const { saveToken } = useToken();
  const navigate = useNavigate();

  // Password strength validation
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "" };

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    const criteria = [
      hasLowercase,
      hasUppercase,
      hasNumber,
      hasSpecial,
      isLongEnough,
    ];
    const metCriteria = criteria.filter(Boolean).length;

    const strengthMap = [
      { strength: 0, label: "" },
      { strength: 1, label: "Weak" },
      { strength: 2, label: "Fair" },
      { strength: 3, label: "Good" },
      { strength: 4, label: "Strong" },
      { strength: 5, label: "Very Strong" },
    ];

    return strengthMap[metCriteria];
  };

  const passwordStrength = getPasswordStrength();

  const getStrengthColor = () => {
    const colors = ["", "danger", "warning", "warning", "success", "success"];

    return colors[passwordStrength.strength];
  };

  async function handleSubmit() {
    const response = await fetch("http://localhost:8081/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    const data = await response.json();
    const tokenObtained = data.token;

    saveToken(tokenObtained);

    if (response.ok) {
      console.log("Registration successful");

      return true;
    } else {
      console.error("Registration failed");

      return false;
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      addToast({
        title: "Terms not accepted",
        description: "Please agree to the Terms of Service and Privacy Policy",
        color: "warning",
      });

      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(async () => {
      setIsLoading(false);

      if (
        firstName &&
        lastName &&
        email &&
        password &&
        passwordStrength.strength >= 3
      ) {
        const success = await handleSubmit();

        if (success) {
          addToast({
            title: "Signup successful",
            description: "Welcome to GreenLoop! Your account has been created.",
            color: "success",
          });
          navigate("/");
        } else {
          addToast({
            title: "Signup failed",
            description: "Please check your information and try again.",
            color: "danger",
          });
        }
      } else {
        addToast({
          title: "Signup failed",
          description: "Please check your information and try again.",
          color: "danger",
        });
      }
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

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

  return (
    <div className="space-y-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Create an account
        </h2>
        <p className="text-foreground-500 mt-2">
          Join our sustainable ecosystem network
        </p>
      </motion.div>

      <form className="space-y-5" onSubmit={handleSignup}>
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
            label="First Name"
            placeholder="Enter your first name"
            radius="sm"
            startContent={
              <Icon className="text-default-400 text-lg" icon="lucide:user" />
            }
            value={firstName}
            variant="bordered"
            onValueChange={setFirstName}
          />
        </motion.div>
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
            label="Last Name"
            placeholder="Enter your last name"
            radius="sm"
            startContent={
              <Icon className="text-default-400 text-lg" icon="lucide:user" />
            }
            value={lastName}
            variant="bordered"
            onValueChange={setLastName}
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
          className="space-y-2"
          custom={2}
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
            placeholder="Create a password"
            radius="sm"
            startContent={
              <Icon className="text-default-400 text-lg" icon="lucide:lock" />
            }
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            variant="bordered"
            onValueChange={setPassword}
          />

          {password && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1"
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-default-200 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    animate={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                    }}
                    className={`h-full bg-${getStrengthColor()}`}
                    initial={{ width: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <span className={`text-xs text-${getStrengthColor()}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <motion.ul
                animate={{ opacity: 1 }}
                className="text-xs text-foreground-500 space-y-1 pl-4 list-disc"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <li className={password.length >= 8 ? "text-success" : ""}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "text-success" : ""}>
                  At least one uppercase letter
                </li>
                <li className={/[0-9]/.test(password) ? "text-success" : ""}>
                  At least one number
                </li>
                <li
                  className={
                    /[^A-Za-z0-9]/.test(password) ? "text-success" : ""
                  }
                >
                  At least one special character
                </li>
              </motion.ul>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          animate="visible"
          className="space-y-2"
          custom={3}
          initial="hidden"
          variants={formControls}
        >
          <div className="flex items-start gap-2">
            <Checkbox
              isSelected={agreeTerms}
              radius="sm"
              onValueChange={setAgreeTerms}
            />
            <div className="text-sm">
              I agree to the{" "}
              <button
                className="text-primary hover:underline font-medium bg-transparent border-none p-0"
                role="link"
                tabIndex={0}
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                className="text-primary hover:underline font-medium bg-transparent border-none p-0"
                role="link"
                tabIndex={0}
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate="visible"
          custom={4}
          initial="hidden"
          variants={formControls}
        >
          <Button
            className="w-full"
            color="primary"
            isLoading={isLoading}
            radius="sm"
            type="submit"
            variant="shadow"
          >
            Create Account
          </Button>
        </motion.div>
      </form>

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

      <motion.p
        animate="visible"
        className="text-center text-sm text-foreground-500 mt-6"
        custom={7}
        initial="hidden"
        variants={formControls}
      >
        Already have an account?{" "}
        <Button
          className="p-0 font-medium"
          color="primary"
          variant="light"
          onPress={onSwitchView}
        >
          Sign in
        </Button>
      </motion.p>

      <Modal
        isOpen={isTermsModalOpen}
        size="lg"
        onClose={() => setIsTermsModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Terms of Service</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-foreground-500">
                Welcome to GreenLoop. By using our service, you agree to these
                terms. Please read them carefully.
              </p>
              <div className="space-y-2">
                <h3 className="font-medium">1. Acceptance of Terms</h3>
                <p className="text-sm text-foreground-500">
                  By accessing and using GreenLoop, you accept and agree to be
                  bound by the terms and provision of this agreement.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">2. Use License</h3>
                <p className="text-sm text-foreground-500">
                  Permission is granted to temporarily use GreenLoop for
                  personal, non-commercial transitory viewing only.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">3. User Responsibilities</h3>
                <p className="text-sm text-foreground-500">
                  You are responsible for maintaining the confidentiality of
                  your account and for all activities that occur under your
                  account.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setIsTermsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isPrivacyModalOpen}
        size="lg"
        onClose={() => setIsPrivacyModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Privacy Policy</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-foreground-500">
                Your privacy is important to us. This Privacy Policy explains
                how we collect, use, and protect your personal information.
              </p>
              <div className="space-y-2">
                <h3 className="font-medium">1. Information We Collect</h3>
                <p className="text-sm text-foreground-500">
                  We collect information that you provide directly to us,
                  including your name, email address, and any other information
                  you choose to provide.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">2. How We Use Your Information</h3>
                <p className="text-sm text-foreground-500">
                  We use the information we collect to provide, maintain, and
                  improve our services, to communicate with you, and to protect
                  our users.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">3. Data Security</h3>
                <p className="text-sm text-foreground-500">
                  We implement appropriate technical and organizational measures
                  to protect your personal information against unauthorized
                  access or disclosure.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => setIsPrivacyModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
