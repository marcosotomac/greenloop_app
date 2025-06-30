import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
} from "lucide-react";

import { createProduct } from "@/api/api";
import { Product } from "@/types/interfaces.tsx";
import { useTheme } from "@/contexts/ThemeContext";

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_PRODUCT_NAME_LENGTH = 100;
const MAX_EXCHANGE_PREFERENCES_LENGTH = 300;

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<Product>({
    productName: "",
    description: "",
    imageUrl: "",
    category: "CLOTHING",
    condition: "NEW",
    availableForExchange: false,
    exchangePreferences: "",
    estimatedValue: 0,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Validation functions
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.productName.trim()) {
          errors.productName = "Product name is required";
        } else if (formData.productName.length < 3) {
          errors.productName = "Product name must be at least 3 characters";
        }

        if (!formData.description.trim()) {
          errors.description = "Description is required";
        } else if (formData.description.length < 10) {
          errors.description = "Description must be at least 10 characters";
        }
        break;

      case 2:
        if (!formData.imageUrl.trim()) {
          errors.imageUrl = "Image URL is required";
        } else if (imageError) {
          errors.imageUrl = "Please provide a valid image URL";
        }

        if (!formData.category) {
          errors.category = "Category is required";
        }

        if (!formData.condition) {
          errors.condition = "Condition is required";
        }

        if (formData.estimatedValue <= 0) {
          errors.estimatedValue = "Estimated value must be greater than 0";
        }
        break;

      case 3:
        if (
          formData.availableForExchange &&
          !formData.exchangePreferences.trim()
        ) {
          errors.exchangePreferences =
            "Exchange preferences are required when available for exchange";
        }
        break;
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.productName.trim().length >= 3 &&
          formData.description.trim().length >= 10
        );
      case 2:
        return (
          formData.imageUrl.trim() &&
          !imageError &&
          formData.category &&
          formData.condition &&
          formData.estimatedValue > 0
        );
      case 3:
        return (
          !formData.availableForExchange ||
          formData.exchangePreferences.trim().length > 0
        );
      default:
        return false;
    }
  };

  useEffect(() => {
    if (formData.imageUrl) {
      setIsImageLoading(true);
      setImageError(null);

      const img = new Image();

      img.src = formData.imageUrl;

      img.onload = () => {
        setImagePreview(formData.imageUrl);
        setIsImageLoading(false);
      };

      img.onerror = () => {
        setImageError("Invalid image URL");
        setImagePreview(null);
        setIsImageLoading(false);
      };
    } else {
      setImagePreview(null);
      setImageError(null);
    }
  }, [formData.imageUrl]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData({ ...formData, [name]: checked });
    } else if (name === "estimatedValue") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }

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
    const allStepsValid = [1, 2, 3].every((step) => validateStep(step));

    if (!allStepsValid) {
      setError("Please fill in all required fields correctly");

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createProduct(formData);
      navigate("/productos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Details" },
    { number: 3, title: "Exchange Options" },
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Product Name */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Product Name *
              </label>
              <input
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${validationErrors.productName ? "border-red-500" : ""}`}
                maxLength={MAX_PRODUCT_NAME_LENGTH}
                name="productName"
                placeholder="Enter a descriptive product name"
                type="text"
                value={formData.productName}
                onChange={handleChange}
              />
              <div className="flex justify-between mt-1">
                {validationErrors.productName && (
                  <span className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.productName}
                  </span>
                )}
                <span
                  className={`text-sm ml-auto ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {formData.productName.length}/{MAX_PRODUCT_NAME_LENGTH}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Description *
              </label>
              <textarea
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${validationErrors.description ? "border-red-500" : ""}`}
                maxLength={MAX_DESCRIPTION_LENGTH}
                name="description"
                placeholder="Describe your product in detail..."
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
                  {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Image URL *
              </label>
              <div className="relative">
                <ImageIcon
                  className={`absolute left-3 top-3 w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                />
                <input
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${validationErrors.imageUrl ? "border-red-500" : ""}`}
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.imageUrl && (
                <span className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.imageUrl}
                </span>
              )}

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="mt-4">
                  {isImageLoading ? (
                    <div
                      className={`w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                    </div>
                  ) : imagePreview ? (
                    <div className="relative">
                      <img
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                        src={imagePreview}
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Category */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Category *
              </label>
              <div className="relative">
                <Package
                  className={`absolute left-3 top-3 w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                />
                <select
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } ${validationErrors.category ? "border-red-500" : ""}`}
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="CLOTHING">Clothing</option>
                  <option value="ACCESSORIES">Accessories</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="BOOKS">Books</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="TOYS">Toys</option>
                  <option value="HOME">Home</option>
                  <option value="SPORTS">Sports</option>
                  <option value="INSTRUMENTS">Instruments</option>
                </select>
              </div>
              {validationErrors.category && (
                <span className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.category}
                </span>
              )}
            </div>

            {/* Condition */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Condition *
              </label>
              <div className="space-y-3">
                {[
                  {
                    value: "NEW",
                    label: "New",
                    description: "Brand new, never used",
                  },
                  {
                    value: "LIKE_NEW",
                    label: "Like New",
                    description: "Excellent condition, minimal signs of wear",
                  },
                  {
                    value: "USED",
                    label: "Used",
                    description: "Good condition with normal wear",
                  },
                  {
                    value: "REFURBISHED",
                    label: "Refurbished",
                    description: "Restored to working condition",
                  },
                  {
                    value: "OPEN_BOX",
                    label: "Open Box",
                    description: "New but packaging has been opened",
                  },
                ].map((condition) => (
                  <label
                    key={condition.value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.condition === condition.value
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : theme === "dark"
                          ? "border-gray-600 hover:border-gray-500"
                          : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      checked={formData.condition === condition.value}
                      className="text-green-500 focus:ring-green-500"
                      name="condition"
                      type="radio"
                      value={condition.value}
                      onChange={handleChange}
                    />
                    <div className="ml-3">
                      <div
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        {condition.label}
                      </div>
                      <div
                        className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {condition.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {validationErrors.condition && (
                <span className="text-red-500 text-sm flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.condition}
                </span>
              )}
            </div>

            {/* Estimated Value */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Estimated Value *
              </label>
              <div className="relative">
                <DollarSign
                  className={`absolute left-3 top-3 w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                />
                <input
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${validationErrors.estimatedValue ? "border-red-500" : ""}`}
                  min="0"
                  name="estimatedValue"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.estimatedValue && (
                <span className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.estimatedValue}
                </span>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Exchange Options */}
            <div>
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.availableForExchange
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : theme === "dark"
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  checked={formData.availableForExchange}
                  className="text-green-500 focus:ring-green-500"
                  name="availableForExchange"
                  type="checkbox"
                  onChange={handleChange}
                />
                <div className="ml-3">
                  <div
                    className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    Available for Exchange
                  </div>
                  <div
                    className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Allow other users to propose exchanges for this product
                  </div>
                </div>
              </label>
            </div>

            {/* Exchange Preferences */}
            {formData.availableForExchange && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Exchange Preferences *
                </label>
                <textarea
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${validationErrors.exchangePreferences ? "border-red-500" : ""}`}
                  maxLength={MAX_EXCHANGE_PREFERENCES_LENGTH}
                  name="exchangePreferences"
                  placeholder="What would you like to exchange this for? (e.g., similar electronics, books, etc.)"
                  rows={4}
                  value={formData.exchangePreferences}
                  onChange={handleChange}
                />
                <div className="flex justify-between mt-1">
                  {validationErrors.exchangePreferences && (
                    <span className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.exchangePreferences}
                    </span>
                  )}
                  <span
                    className={`text-sm ml-auto ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {formData.exchangePreferences.length}/
                    {MAX_EXCHANGE_PREFERENCES_LENGTH}
                  </span>
                </div>
              </div>
            )}

            {/* Summary */}
            <div
              className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
              <h4
                className={`font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Product Summary
              </h4>
              <div
                className={`text-sm space-y-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                <p>
                  <strong>Name:</strong>{" "}
                  {formData.productName || "Not specified"}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {formData.category || "Not specified"}
                </p>
                <p>
                  <strong>Condition:</strong>{" "}
                  {formData.condition || "Not specified"}
                </p>
                <p>
                  <strong>Value:</strong> ${formData.estimatedValue || "0.00"}
                </p>
                <p>
                  <strong>Available for exchange:</strong>{" "}
                  {formData.availableForExchange ? "Yes" : "No"}
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
                Create New Product
              </h1>
              <p
                className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                Add your product to the marketplace
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
            <form onSubmit={activeStep === 3 ? handleSubmit : handleNext}>
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

                {activeStep < 3 ? (
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
                      "Create Product"
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

export default CreateProductPage;
