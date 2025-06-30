import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { createPost } from "@/api/api";
import { Post } from "@/types/interfaces.tsx";
import { useTheme } from "@/contexts/ThemeContext";

const MAX_CONTENT_LENGTH = 1000;
const MAX_TITLE_LENGTH = 150;
const MAX_LOCATION_LENGTH = 200;

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<Post>({
    title: "",
    content: "",
    imageUrl: "",
    wanted: "DONATION",
    location: "",
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
        if (!formData.title.trim()) {
          errors.title = "Title is required";
        } else if (formData.title.length < 5) {
          errors.title = "Title must be at least 5 characters";
        }

        if (!formData.content.trim()) {
          errors.content = "Content is required";
        } else if (formData.content.length < 20) {
          errors.content = "Content must be at least 20 characters";
        }
        break;

      case 2:
        if (!formData.imageUrl.trim()) {
          errors.imageUrl = "Image URL is required";
        } else if (imageError) {
          errors.imageUrl = "Please provide a valid image URL";
        }

        if (!formData.location.trim()) {
          errors.location = "Location is required";
        } else if (formData.location.length < 3) {
          errors.location = "Location must be at least 3 characters";
        }
        break;

      case 3:
        if (!formData.wanted) {
          errors.wanted = "Please specify what you're looking for";
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
          formData.title.trim().length >= 5 &&
          formData.content.trim().length >= 20
        );
      case 2:
        return (
          formData.imageUrl.trim() &&
          !imageError &&
          formData.location.trim().length >= 3
        );
      case 3:
        return formData.wanted !== undefined;
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
    >,
  ) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Auto-resize textarea for content field
    if (name === "content" && e.target.tagName === "TEXTAREA") {
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
      await createPost(formData);
      navigate("/publicaciones");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Media & Location" },
    { number: 3, title: "Request Type" },
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Post Title *
              </label>
              <input
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${validationErrors.title ? "border-red-500" : ""}`}
                maxLength={MAX_TITLE_LENGTH}
                name="title"
                placeholder="Enter a descriptive title for your post"
                type="text"
                value={formData.title}
                onChange={handleChange}
              />
              <div className="flex justify-between mt-1">
                {validationErrors.title && (
                  <span className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.title}
                  </span>
                )}
                <span
                  className={`text-sm ml-auto ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {formData.title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Content *
              </label>
              <textarea
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${validationErrors.content ? "border-red-500" : ""}`}
                maxLength={MAX_CONTENT_LENGTH}
                name="content"
                placeholder="Describe what you're looking for in detail..."
                rows={6}
                value={formData.content}
                onChange={handleChange}
              />
              <div className="flex justify-between mt-1">
                {validationErrors.content && (
                  <span className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.content}
                  </span>
                )}
                <span
                  className={`text-sm ml-auto ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {formData.content.length}/{MAX_CONTENT_LENGTH}
                </span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
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

            {/* Location */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Location *
              </label>
              <div className="relative">
                <MapPin
                  className={`absolute left-3 top-3 w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                />
                <input
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${validationErrors.location ? "border-red-500" : ""}`}
                  maxLength={MAX_LOCATION_LENGTH}
                  name="location"
                  placeholder="Enter your location (city, neighborhood, etc.)"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-between mt-1">
                {validationErrors.location && (
                  <span className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.location}
                  </span>
                )}
                <span
                  className={`text-sm ml-auto ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {formData.location.length}/{MAX_LOCATION_LENGTH}
                </span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Request Type */}
            <div>
              <label
                className={`block text-sm font-medium mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                What are you looking for? *
              </label>
              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.wanted === "DONATION"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : theme === "dark"
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    checked={formData.wanted === "DONATION"}
                    className="text-green-500 focus:ring-green-500"
                    name="wanted"
                    type="radio"
                    value="DONATION"
                    onChange={handleChange}
                  />
                  <div className="ml-3">
                    <div
                      className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      Donation
                    </div>
                    <div
                      className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      I'm looking for items that people want to donate
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.wanted === "EXCHANGE"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : theme === "dark"
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    checked={formData.wanted === "EXCHANGE"}
                    className="text-green-500 focus:ring-green-500"
                    name="wanted"
                    type="radio"
                    value="EXCHANGE"
                    onChange={handleChange}
                  />
                  <div className="ml-3">
                    <div
                      className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      Exchange
                    </div>
                    <div
                      className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      I'm looking to exchange items with others
                    </div>
                  </div>
                </label>
              </div>
              {validationErrors.wanted && (
                <span className="text-red-500 text-sm flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.wanted}
                </span>
              )}
            </div>

            {/* Summary */}
            <div
              className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
              <h4
                className={`font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Post Summary
              </h4>
              <div
                className={`text-sm space-y-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                <p>
                  <strong>Title:</strong> {formData.title || "Not specified"}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {formData.location || "Not specified"}
                </p>
                <p>
                  <strong>Looking for:</strong>{" "}
                  {formData.wanted || "Not specified"}
                </p>
                <p>
                  <strong>Content length:</strong> {formData.content.length}{" "}
                  characters
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
                Create New Post
              </h1>
              <p
                className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                Share what you're looking for with the community
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
                      "Create Post"
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

export default CreatePostPage;
