import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Card,
  Textarea,
  Chip,
  Spinner,
  Badge,
  Avatar,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { useTheme } from "../contexts/ThemeContext";
import {
  sendChatMessage,
  sendContextualMessage,
  getProductRecommendations,
  getSustainabilityTips,
  getCategorySustainabilityTips,
  checkAIHealth,
  AIMessage,
} from "../services/aiService";

const GreenLoopAIPage: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<
    "basic" | "contextual" | "recommendations" | "tips"
  >("basic");
  const [aiHealthy, setAiHealthy] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check AI health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await checkAIHealth();
        setAiHealthy(true);
      } catch (error) {
        setAiHealthy(false);
        console.error("AI service health check failed:", error);
      }
    };

    checkHealth();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: "welcome",
        content:
          "¡Hola! 👋 Soy tu asistente inteligente de GreenLoop 🌱\n\n🎯 Estoy aquí para ayudarte con:\n\n💬 Consejos personalizados de intercambio sostenible\n🔄 Recomendaciones de productos eco-friendly\n🌍 Tips prácticos para un estilo de vida sostenible\n🤝 Estrategias para construir comunidades ecológicas\n♻️ Ideas creativas para reutilizar y reciclar\n\n✨ ¿En qué te gustaría que te ayude hoy?\n\n💡 Puedes preguntarme sobre productos específicos, pedir consejos de sostenibilidad, o simplemente chatear sobre cómo hacer tu vida más verde.",
        isUser: false,
        timestamp: new Date(),
        status: "sent",
      };

      setMessages([welcomeMessage]);
    }
  }, []);

  const generateMessageId = () => Math.random().toString(36).substr(2, 9);

  const addUserMessage = (content: string) => {
    const userMessage: AIMessage = {
      id: generateMessageId(),
      content,
      isUser: true,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMessage]);

    return userMessage;
  };

  const addAIMessage = (content: string, status: "sent" | "error" = "sent") => {
    const aiMessage: AIMessage = {
      id: generateMessageId(),
      content,
      isUser: false,
      timestamp: new Date(),
      status,
    };

    setMessages((prev) => [...prev, aiMessage]);

    return aiMessage;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();

    setInputMessage("");
    setIsLoading(true);

    // Add user message
    addUserMessage(message);

    try {
      let response;

      switch (chatMode) {
        case "basic":
          response = await sendChatMessage(message);
          break;
        case "contextual":
          response = await sendContextualMessage(
            message,
            "Usuario interesado en intercambio sostenible en GreenLoop"
          );
          break;
        case "recommendations":
          response = await getProductRecommendations(message);
          break;
        case "tips":
          response = await getSustainabilityTips();
          break;
        default:
          response = await sendChatMessage(message);
      }

      addAIMessage(response.response);
    } catch (error) {
      console.error("Error sending message:", error);
      addAIMessage(
        "Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);

    try {
      let response;
      let userMessage = "";

      switch (action) {
        case "general-tips":
          userMessage = "Dame consejos generales de sostenibilidad";
          addUserMessage(userMessage);
          response = await getSustainabilityTips();
          break;
        case "electronics-tips":
          userMessage = "Consejos de sostenibilidad para electrónicos";
          addUserMessage(userMessage);
          response = await getCategorySustainabilityTips("electronics");
          break;
        case "clothing-tips":
          userMessage = "Tips de sostenibilidad para ropa";
          addUserMessage(userMessage);
          response = await getCategorySustainabilityTips("clothing");
          break;
        case "exchange-help":
          userMessage = "¿Cómo funciona el intercambio en GreenLoop?";
          addUserMessage(userMessage);
          response = await sendContextualMessage(
            userMessage,
            "Usuario nuevo en la plataforma GreenLoop"
          );
          break;
        default:
          return;
      }

      addAIMessage(response.response);
    } catch (error) {
      console.error("Error with quick action:", error);
      addAIMessage(
        "Lo siento, hubo un error al procesar tu solicitud.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
      }`}
    >
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
        {/* Ultra Compact Header - Maximum Chat Space */}
        <Card
          className={`mb-2 p-3 shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white"
              : "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Badge
                  className="border-1 border-white"
                  color={aiHealthy ? "success" : "danger"}
                  content=""
                  placement="bottom-right"
                  shape="circle"
                  size="sm"
                >
                  <Avatar
                    className="bg-white/20 text-white"
                    fallback={
                      <Icon className="text-base" icon="mdi:robot-happy" />
                    }
                    size="sm"
                  />
                </Badge>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  GreenLoop AI
                </h1>
                <p className="text-green-100 text-xs">
                  Asistente sostenible 🌱
                </p>
              </div>
            </div>

            {/* Ultra Compact Health Status */}
            <div className="text-right">
              {aiHealthy === null ? (
                <div className="flex items-center space-x-1">
                  <Spinner color="white" size="sm" />
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-300" : "text-white/80"
                    }`}
                  >
                    Verificando...
                  </span>
                </div>
              ) : (
                <Chip
                  className={`text-xs ${
                    theme === "dark"
                      ? "bg-gray-600/60 backdrop-blur-sm"
                      : "bg-white/20 backdrop-blur-sm"
                  }`}
                  color={aiHealthy ? "success" : "danger"}
                  size="sm"
                  startContent={
                    <Icon
                      className="text-xs"
                      icon={aiHealthy ? "mdi:check-circle" : "mdi:alert-circle"}
                    />
                  }
                  variant="shadow"
                >
                  {aiHealthy ? "OK" : "OFF"}
                </Chip>
              )}
            </div>
          </div>

          {/* Ultra Compact Single Row: Chat Mode + Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-1">
            {/* Ultra Compact Chat Mode Selector */}
            <div className="flex gap-1">
              <Button
                className={`transition-all duration-300 text-xs px-2 ${
                  chatMode === "basic"
                    ? theme === "dark"
                      ? "bg-gray-200 text-gray-800 border-gray-200 scale-105"
                      : "bg-white text-green-600 border-white scale-105"
                    : theme === "dark"
                      ? "bg-gray-600/20 text-gray-200 border-gray-500/50 hover:bg-gray-600/40"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                }`}
                color={chatMode === "basic" ? "secondary" : "default"}
                radius="full"
                size="sm"
                startContent={<Icon className="text-xs" icon="mdi:chat" />}
                variant={chatMode === "basic" ? "shadow" : "bordered"}
                onClick={() => setChatMode("basic")}
              >
                Básico
              </Button>
              <Button
                className={`transition-all duration-300 text-xs px-2 ${
                  chatMode === "contextual"
                    ? theme === "dark"
                      ? "bg-gray-200 text-gray-800 border-gray-200 scale-105"
                      : "bg-white text-green-600 border-white scale-105"
                    : theme === "dark"
                      ? "bg-gray-600/20 text-gray-200 border-gray-500/50 hover:bg-gray-600/40"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                }`}
                color={chatMode === "contextual" ? "secondary" : "default"}
                radius="full"
                size="sm"
                startContent={
                  <Icon className="text-xs" icon="mdi:chat-processing" />
                }
                variant={chatMode === "contextual" ? "shadow" : "bordered"}
                onClick={() => setChatMode("contextual")}
              >
                Contextual
              </Button>
              <Button
                className={`transition-all duration-300 text-xs px-2 ${
                  chatMode === "recommendations"
                    ? theme === "dark"
                      ? "bg-gray-200 text-gray-800 border-gray-200 scale-105"
                      : "bg-white text-green-600 border-white scale-105"
                    : theme === "dark"
                      ? "bg-gray-600/20 text-gray-200 border-gray-500/50 hover:bg-gray-600/40"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                }`}
                color={chatMode === "recommendations" ? "secondary" : "default"}
                radius="full"
                size="sm"
                startContent={<Icon className="text-xs" icon="mdi:lightbulb" />}
                variant={chatMode === "recommendations" ? "shadow" : "bordered"}
                onClick={() => setChatMode("recommendations")}
              >
                Recomendaciones
              </Button>
            </div>

            {/* Ultra Compact Quick Actions */}
            <div className="flex gap-1">
              <Button
                className={`transition-all duration-300 hover:scale-105 text-xs px-2 ${
                  theme === "dark"
                    ? "bg-emerald-600/30 text-gray-200 border border-emerald-500/40 hover:bg-emerald-600/50"
                    : "bg-emerald-500/20 text-white border border-emerald-400/30 hover:bg-emerald-500/30"
                }`}
                radius="lg"
                size="sm"
                startContent={
                  <Icon
                    className={`text-xs ${
                      theme === "dark" ? "text-emerald-400" : "text-emerald-300"
                    }`}
                    icon="mdi:leaf"
                  />
                }
                variant="flat"
                onClick={() => handleQuickAction("general-tips")}
              >
                Tips
              </Button>
              <Button
                className={`transition-all duration-300 hover:scale-105 text-xs px-2 ${
                  theme === "dark"
                    ? "bg-orange-600/30 text-gray-200 border border-orange-500/40 hover:bg-orange-600/50"
                    : "bg-orange-500/20 text-white border border-orange-400/30 hover:bg-orange-500/30"
                }`}
                radius="lg"
                size="sm"
                startContent={
                  <Icon
                    className={`text-xs ${
                      theme === "dark" ? "text-orange-400" : "text-orange-300"
                    }`}
                    icon="mdi:cellphone"
                  />
                }
                variant="flat"
                onClick={() => handleQuickAction("electronics-tips")}
              >
                Tech
              </Button>
              <Button
                className={`transition-all duration-300 hover:scale-105 text-xs px-2 ${
                  theme === "dark"
                    ? "bg-blue-600/30 text-gray-200 border border-blue-500/40 hover:bg-blue-600/50"
                    : "bg-blue-500/20 text-white border border-blue-400/30 hover:bg-blue-500/30"
                }`}
                radius="lg"
                size="sm"
                startContent={
                  <Icon
                    className={`text-xs ${
                      theme === "dark" ? "text-blue-400" : "text-blue-300"
                    }`}
                    icon="mdi:swap-horizontal"
                  />
                }
                variant="flat"
                onClick={() => handleQuickAction("exchange-help")}
              >
                Ayuda
              </Button>
            </div>
          </div>
        </Card>

        {/* Maximized Chat Messages Area */}
        <Card
          className={`flex-1 shadow-xl border-0 ${
            theme === "dark"
              ? "bg-gray-800/70 backdrop-blur-sm"
              : "bg-white/70 backdrop-blur-sm"
          }`}
        >
          <div
            className="h-full p-4 overflow-y-auto space-y-4 scroll-smooth chat-scroll"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-500`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {!message.isUser && (
                  <Avatar
                    className="bg-gradient-to-br from-green-500 to-emerald-600 text-white mr-3 mt-1 shadow-lg"
                    fallback={<Icon className="text-sm" icon="mdi:robot" />}
                    size="sm"
                  />
                )}
                <div
                  className={`max-w-[85%] group ${
                    message.isUser ? "order-1" : "order-2"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                      message.isUser
                        ? theme === "dark"
                          ? "bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-br-md"
                          : "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md"
                        : message.status === "error"
                          ? theme === "dark"
                            ? "bg-gradient-to-br from-red-900/50 to-red-800/50 text-red-200 border border-red-700/50 rounded-bl-md"
                            : "bg-gradient-to-br from-red-50 to-red-100 text-red-800 border border-red-200 rounded-bl-md"
                          : theme === "dark"
                            ? "bg-gradient-to-br from-gray-700/80 to-gray-600/80 text-gray-100 border border-gray-600/50 rounded-bl-md"
                            : "bg-gradient-to-br from-gray-50 to-white text-gray-800 border border-gray-200 rounded-bl-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {formatMessageContent(message.content)}
                    </div>
                    <div
                      className={`flex items-center justify-between text-xs mt-3 pt-2 border-t ${
                        message.isUser
                          ? theme === "dark"
                            ? "text-blue-200 border-blue-400/30"
                            : "text-blue-100 border-blue-400/30"
                          : theme === "dark"
                            ? "text-gray-400 border-gray-600/50"
                            : "text-gray-500 border-gray-200"
                      }`}
                    >
                      <span className="flex items-center">
                        <Icon
                          className={`mr-1 ${
                            message.isUser
                              ? theme === "dark"
                                ? "text-blue-300"
                                : "text-blue-200"
                              : theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                          }`}
                          icon="mdi:clock-outline"
                        />
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.status === "sending" && (
                        <div className="flex items-center ml-2">
                          <Spinner size="sm" />
                          <span className="ml-1">Enviando...</span>
                        </div>
                      )}
                      {!message.isUser && message.status === "sent" && (
                        <Chip
                          className="ml-2"
                          color="success"
                          size="sm"
                          variant="flat"
                        >
                          <Icon className="text-xs" icon="mdi:check" />
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
                {message.isUser && (
                  <Avatar
                    className="bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-3 mt-1 shadow-lg"
                    fallback={<Icon className="text-sm" icon="mdi:account" />}
                    size="sm"
                  />
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-500">
                <Avatar
                  className="bg-gradient-to-br from-green-500 to-emerald-600 text-white mr-3 mt-1 shadow-lg"
                  fallback={<Icon className="text-sm" icon="mdi:robot" />}
                  size="sm"
                />
                <div
                  className={`p-4 rounded-2xl rounded-bl-md shadow-lg border backdrop-blur-sm ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-gray-700/80 to-gray-600/80 text-gray-100 border-gray-600/50"
                      : "bg-gradient-to-br from-gray-50 to-white text-gray-800 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          theme === "dark" ? "bg-emerald-400" : "bg-green-500"
                        }`}
                      />
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          theme === "dark" ? "bg-emerald-400" : "bg-green-500"
                        }`}
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          theme === "dark" ? "bg-emerald-400" : "bg-green-500"
                        }`}
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span
                      className={`font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      El asistente está pensando...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Ultra Compact Message Input */}
        <Card
          className={`mt-2 p-3 shadow-xl border-0 ${
            theme === "dark"
              ? "bg-gray-800/80 backdrop-blur-sm"
              : "bg-white/80 backdrop-blur-sm"
          }`}
        >
          <div className="flex space-x-3 items-end">
            <div className="flex-1 space-y-1">
              <div
                className={`flex items-center space-x-2 text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <Icon
                  className={
                    theme === "dark" ? "text-emerald-400" : "text-green-600"
                  }
                  icon="mdi:message-outline"
                />
                <span>
                  {chatMode === "recommendations"
                    ? "Describe tus preferencias..."
                    : "Escribe tu mensaje..."}
                </span>
                <Chip
                  className="ml-auto text-xs"
                  color="primary"
                  size="sm"
                  variant="flat"
                >
                  {chatMode === "basic" && "Básico"}
                  {chatMode === "contextual" && "Contextual"}
                  {chatMode === "recommendations" && "Recomendaciones"}
                  {chatMode === "tips" && "Tips"}
                </Chip>
              </div>
              <Textarea
                className="transition-all duration-300"
                classNames={{
                  input: "text-sm",
                  inputWrapper: `border-2 backdrop-blur-sm ${
                    theme === "dark"
                      ? "border-gray-600 hover:border-emerald-500 focus-within:border-emerald-400 bg-gray-700/70"
                      : "border-green-200 hover:border-green-400 focus-within:border-green-500 bg-white/70"
                  }`,
                }}
                disabled={!aiHealthy || isLoading}
                maxRows={3}
                minRows={1}
                placeholder={
                  chatMode === "recommendations"
                    ? "Ej: Me gusta la ropa vintage, libros de ciencia ficción..."
                    : "¿Cómo puedo hacer mi vida más sostenible?"
                }
                radius="lg"
                value={inputMessage}
                variant="bordered"
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              className={`shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] ${
                theme === "dark"
                  ? "bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              }`}
              color="primary"
              disabled={!inputMessage.trim() || !aiHealthy || isLoading}
              endContent={
                isLoading ? (
                  <Spinner color="white" size="sm" />
                ) : (
                  <Icon className="text-base" icon="mdi:send" />
                )
              }
              radius="lg"
              size="md"
              onClick={handleSendMessage}
            >
              {isLoading ? "..." : "Enviar"}
            </Button>
          </div>

          {/* Compact Quick suggestions */}
          {!isLoading && inputMessage.length === 0 && (
            <div
              className={`mt-2 pt-2 border-t ${
                theme === "dark" ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <div className="flex items-center mb-1">
                <Icon
                  className={`mr-1 text-sm ${
                    theme === "dark" ? "text-yellow-400" : "text-yellow-500"
                  }`}
                  icon="mdi:lightbulb-outline"
                />
                <span
                  className={`text-xs font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Sugerencias:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  "¿Cómo reducir huella de carbono?",
                  "Ideas para reciclar ropa",
                  "Productos sostenibles",
                  "Consejos de intercambio",
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    className={`text-xs transition-colors duration-200 px-2 py-1 ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    radius="full"
                    size="sm"
                    variant="flat"
                    onClick={() => setInputMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Ultra Compact Footer */}
        <div className="mt-2 text-center">
          <div
            className={`flex items-center justify-center space-x-2 text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            <div className="flex items-center space-x-1">
              <Icon
                className={`text-xs ${
                  theme === "dark" ? "text-emerald-400" : "text-green-500"
                }`}
                icon="mdi:shield-check"
              />
              <span>Seguro</span>
            </div>
            <div
              className={`w-px h-3 ${
                theme === "dark" ? "bg-gray-600" : "bg-gray-300"
              }`}
            />
            <div className="flex items-center space-x-1">
              <Icon
                className={`text-xs ${
                  theme === "dark" ? "text-yellow-400" : "text-yellow-500"
                }`}
                icon="mdi:lightning-bolt"
              />
              <span>GPT-4o</span>
            </div>
            <div
              className={`w-px h-3 ${
                theme === "dark" ? "bg-gray-600" : "bg-gray-300"
              }`}
            />
            <div className="flex items-center space-x-1">
              <Icon
                className={`text-xs ${
                  theme === "dark" ? "text-emerald-400" : "text-green-500"
                }`}
                icon="mdi:leaf"
              />
              <span>GreenLoop AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenLoopAIPage;
