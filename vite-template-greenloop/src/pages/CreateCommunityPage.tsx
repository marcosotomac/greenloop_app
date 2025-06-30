import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { createCommunity } from "@/api/api";
import { CommunityRequestDto } from "@/types/interfaces.tsx";
import { useTheme } from "@/contexts/ThemeContext";
import Toast from "@/components/Toast";

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const CreateCommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<CommunityRequestDto>({
    name: "",
    description: "",
    type: "PUBLIC",
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Validation functions
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          errors.name = "Community name is required";
        } else if (formData.name.length < 3) {
          errors.name = "Community name must be at least 3 characters";
        }
        break;

      case 2:
        if (!formData.description?.trim()) {
          errors.description = "Description is required";
        } else if (formData.description.length < 20) {
          errors.description = "Description must be at least 20 characters";
        }
        break;
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 3;
      case 2:
        return (formData.description || "").trim().length >= 20;
      default:
        return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Auto-resize textarea for description field
    if (name === "description" && e.target.tagName === "TEXTAREA") {
      const target = e.target as HTMLTextAreaElement;

      setTimeout(() => {
        target.style.height = "auto";
        target.style.height = `${Math.max(120, target.scrollHeight)}px`;
      }, 0);
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const handleNext = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all steps before submitting
    const allStepsValid = [1, 2].every((step) => validateStep(step));

    if (!allStepsValid) {
      setError("Please fill in all required fields correctly");

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createCommunity(formData);
      setShowToast(true);
      setTimeout(() => {
        navigate("/grupos");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create community",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Community Details" },
    { number: 2, title: "Description" },
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Community Name */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                htmlFor="community-name"
              >
                Community Name *
              </label>
              <input
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${validationErrors.name ? "border-red-500" : ""}`}
                id="community-name"
                maxLength={MAX_NAME_LENGTH}
                name="name"
                placeholder="Enter a name for your community"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
              <div className="flex justify-between mt-1">
                {validationErrors.name && (
                  <span className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.name}
                  </span>
                )}
                <span
                  className={`text-sm ml-auto ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {formData.name.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
            </div>

            {/* Community Type */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                htmlFor="community-type"
              >
                Community Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.type === "PUBLIC"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : theme === "dark"
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setFormData({ ...formData, type: "PUBLIC" })}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        formData.type === "PUBLIC"
                          ? "border-green-500 bg-green-500"
                          : theme === "dark"
                            ? "border-gray-500"
                            : "border-gray-300"
                      }`}
                    >
                      {formData.type === "PUBLIC" && (
                        <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5" />
                      )}
                    </div>
                    <div>
                      <h4
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        Public Community
                      </h4>
                      <p
                        className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        Anyone can join immediately
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.type === "PRIVATE"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : theme === "dark"
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setFormData({ ...formData, type: "PRIVATE" })}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        formData.type === "PRIVATE"
                          ? "border-green-500 bg-green-500"
                          : theme === "dark"
                            ? "border-gray-500"
                            : "border-gray-300"
                      }`}
                    >
                      {formData.type === "PRIVATE" && (
                        <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5" />
                      )}
                    </div>
                    <div>
                      <h4
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        Private Community
                      </h4>
                      <p
                        className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        Requires approval to join
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Description */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                htmlFor="community-description"
              >
                Description *
              </label>
              <textarea
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${validationErrors.description ? "border-red-500" : ""}`}
                id="community-description"
                maxLength={MAX_DESCRIPTION_LENGTH}
                name="description"
                placeholder="Describe your community's purpose and goals..."
                rows={6}
                value={formData.description}
                onChange={handleChange}
              />
              <div className="flex justify-between mt-1">
                {validationErrors.description && (
                  <span className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.description}
                  </span>
                )}
                <span
                  className={`text-sm ml-auto ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {formData.description?.length || 0}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div
              className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
              <h4
                className={`font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Community Summary
              </h4>
              <div
                className={`text-sm space-y-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                <p>
                  <strong>Name:</strong> {formData.name || "Not specified"}
                </p>
                <p>
                  <strong>Description length:</strong>{" "}
                  {formData.description?.length || 0} characters
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`flex-1 w-full min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <Toast
        isVisible={showToast}
        message="¡Comunidad creada exitosamente!"
        onClose={() => setShowToast(false)}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg sm:rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4">
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    theme === "dark"
                      ? "text-gray-300 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
                <div
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  Step {activeStep} of {steps.length}
                </div>
              </div>

              <h1
                className={`text-2xl sm:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Create New Community
              </h1>
              <p
                className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                Start a new community and bring people together
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step.number <= activeStep
                          ? "bg-green-500 text-white"
                          : theme === "dark"
                            ? "bg-gray-700 text-gray-400 border border-gray-600"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.number < activeStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        step.number <= activeStep
                          ? theme === "dark"
                            ? "text-white"
                            : "text-gray-900"
                          : theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`ml-4 w-16 h-0.5 ${
                          step.number < activeStep
                            ? "bg-green-500"
                            : theme === "dark"
                              ? "bg-gray-700"
                              : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400 text-sm font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={activeStep === 2 ? handleSubmit : handleNext}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 sm:pt-8 border-t mt-6 sm:mt-8">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeStep === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : theme === "dark"
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  disabled={activeStep === 1}
                  type="button"
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1 inline" />
                  Previous
                </button>

                {activeStep < 2 ? (
                  <button
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                      isStepValid(activeStep)
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isStepValid(activeStep)}
                    type="submit"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </button>
                ) : (
                  <button
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                      isSubmitting || !isStepValid(activeStep)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                    disabled={isSubmitting || !isStepValid(activeStep)}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                        Creating...
                      </>
                    ) : (
                      "Create Community"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityPage;
