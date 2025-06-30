import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useParams } from "react-router-dom";

import {
  getChatMessages,
  sendMessage,
  getChatInfo,
} from "../../services/chatService";
import { useTheme } from "../../contexts/ThemeContext";
import "./ChatWindow.css";

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
  };
  sentAt: string;
  status: "SENT" | "DELIVERED" | "READ";
}

interface Chat {
  id: number;
  user1: {
    id: number;
    firstName: string;
    lastName: string;
  };
  user2: {
    id: number;
    firstName: string;
    lastName: string;
  };
  product: {
    productId: number;
    productName: string;
  };
}

// Componente memoizado para mensajes individuales
const MessageItem = memo(
  ({
    message,
    isCurrentUser,
    isTemporary = false,
  }: {
    message: Message;
    isCurrentUser: boolean;
    isTemporary?: boolean;
  }) => {
    const avatarInitials = useMemo(
      () =>
        message.sender.firstName.charAt(0) + message.sender.lastName.charAt(0),
      [message.sender.firstName, message.sender.lastName]
    );

    const formattedTime = useMemo(
      () =>
        new Date(message.sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      [message.sentAt]
    );

    return (
      <div
        className={`message ${isCurrentUser ? "own" : ""}`}
        data-temp={isTemporary}
      >
        <div className="message-avatar">{avatarInitials.toUpperCase()}</div>
        <div className={`message-bubble ${isCurrentUser ? "own" : "other"}`}>
          <div className="message-content">{message.content}</div>
          <div className="message-time">
            {formattedTime}
            {isTemporary && <span className="sending-status"> • Enviando</span>}
          </div>
        </div>
      </div>
    );
  }
);

MessageItem.displayName = "MessageItem";

const ChatWindow = memo(() => {
  const { chatId } = useParams<{ chatId: string }>();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserTyping] = useState(false);
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [tempMessages, setTempMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const lastPollTimeRef = useRef<number>(0);
  const isPollingRef = useRef(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);

  // Evitar re-renders por eventos de mouse - OPTIMIZACIÓN EXTREMA
  useEffect(() => {
    const chatWindow = chatWindowRef.current;

    if (!chatWindow) return;

    // Desactivar completamente los event listeners que causan lag
    const disableInteraction = () => {
      chatWindow.style.pointerEvents = "auto";
      chatWindow.style.willChange = "auto";
    };

    // Solo escuchar eventos esenciales
    chatWindow.addEventListener("click", disableInteraction, {
      passive: true,
      once: true,
    });

    return () => {
      chatWindow.removeEventListener("click", disableInteraction);
    };
  }, []);

  // Memoizar currentUserId para evitar accesos repetidos al localStorage
  const currentUserId = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      return user.id || 0;
    } catch {
      return 0;
    }
  }, []);

  // Combinar mensajes reales y temporales para el scroll - MOVER ANTES DE SU USO
  const totalMessages = useMemo(() => {
    return messages.length + tempMessages.length;
  }, [messages.length, tempMessages.length]);

  // Desactivar intersection observer que puede causar lag
  useEffect(() => {
    // Solo hacer scroll cuando realmente hay nuevos mensajes
    if (totalMessages > 0) {
      const shouldScroll = totalMessages > (prevMessagesLengthRef.current || 0);

      if (shouldScroll) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); // Cambiar a "auto" para mejor performance
        }, 50);
        prevMessagesLengthRef.current = totalMessages;
      }
    }
  }, [totalMessages]);

  // Polling optimizado para tiempo real
  const performPolling = useCallback(async () => {
    if (!chatId || isPollingRef.current || isSendingMessage) return;

    isPollingRef.current = true;

    try {
      const chatMessages = await getChatMessages(parseInt(chatId));

      // Si hay mensajes nuevos, actualizar y hacer scroll automático
      if (chatMessages.length !== messages.length) {
        setMessages(chatMessages);

        // Scroll automático a nuevos mensajes recibidos
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "auto", // Scroll instantáneo para fluidez
            block: "end",
          });
        }, 50);
      }
    } catch {
      // Error silencioso para no interrumpir UX
    } finally {
      isPollingRef.current = false;
    }
  }, [chatId, messages.length, isSendingMessage]);

  // Manejo de visibilidad simplificado - mantener polling siempre activo para tiempo real
  const handleVisibilityChange = useCallback(() => {
    // Para mensajes en tiempo real, mantener el polling activo incluso cuando la pestaña no esté visible
    // Solo ajustar la frecuencia si es necesario para performance
    if (document.hidden) {
      // Mantener polling pero tal vez reducir la frecuencia cuando no está visible
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(performPolling, 2000); // 2 segundos cuando no está visible
      }
    } else {
      // Cuando la pestaña está visible, polling cada segundo
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      pollIntervalRef.current = setInterval(performPolling, 1000); // 1 segundo cuando está visible
    }
  }, [performPolling]);

  useEffect(() => {
    const loadChatData = async () => {
      if (chatId) {
        try {
          setLoading(true);
          setError(null);

          // Cargar datos en paralelo para mejor performance
          const [chatMessages, info] = await Promise.all([
            getChatMessages(parseInt(chatId)),
            getChatInfo(parseInt(chatId)),
          ]);

          setMessages(chatMessages);
          setChatInfo(info);
          lastPollTimeRef.current = Date.now();

          // SIEMPRE hacer scroll al último mensaje al entrar al chat
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
              behavior: "auto", // Sin animación para que sea instantáneo
              block: "end",
            });
          }, 50);
        } catch {
          setError("Error al cargar el chat. Inténtalo de nuevo.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadChatData();

    // Iniciar polling optimizado
    pollIntervalRef.current = setInterval(performPolling, 1000); // 1 segundo para mensajes en tiempo real
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, performPolling, handleVisibilityChange]);

  // Scroll optimizado - solo cuando es necesario
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      // Usar requestAnimationFrame para mejor performance del scroll
      requestAnimationFrame(() => {
        scrollToBottom();
      });
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length, scrollToBottom]);

  // Envío de mensajes ultra-optimizado - sin sensación de recarga
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !chatId || isSendingMessage) return;

      const messageContent = newMessage.trim();

      setIsSendingMessage(true);
      setNewMessage(""); // Limpiar input inmediatamente para fluidez

      // Crear mensaje temporal para mostrar instantáneamente (SIN RECARGA)
      const tempMessage: Message = {
        id: Date.now(),
        content: messageContent,
        sender: {
          id: currentUserId,
          firstName: "Tú",
          lastName: "",
        },
        sentAt: new Date().toISOString(),
        status: "SENT",
      };

      // Agregar mensaje temporal INMEDIATAMENTE - sin esperas
      setTempMessages((prev) => [...prev, tempMessage]);

      // Scroll instantáneo al nuevo mensaje (mantener fluidez visual)
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "auto", // Sin animación para máxima fluidez
          block: "end",
        });
      });

      try {
        // Enviar al servidor SIN delays - máxima velocidad
        const savedMessage = await sendMessage(
          parseInt(chatId),
          messageContent
        );

        if (savedMessage && savedMessage.id) {
          // Reemplazo INSTANTÁNEO del mensaje temporal por el real
          setTempMessages((prev) =>
            prev.filter((msg) => msg.id !== tempMessage.id)
          );

          // Agregar mensaje real inmediatamente
          setMessages((prevMessages) => [...prevMessages, savedMessage]);

          // Mantener scroll en el último mensaje automáticamente
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({
              behavior: "auto",
              block: "end",
            });
          });
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (error) {
        // Manejo de errores rápido sin interrumpir UX
        setTempMessages((prev) =>
          prev.filter((msg) => msg.id !== tempMessage.id)
        );
        setNewMessage(messageContent);

        const errorMessage =
          error instanceof Error ? error.message : "Error al enviar mensaje";

        setError(`Error: ${errorMessage}`);
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsSendingMessage(false);
      }
    },
    [newMessage, chatId, currentUserId, isSendingMessage]
  );

  // Renderizado de la lista de mensajes memoizado con animación
  const messagesList = useMemo(
    () => [
      // Mensajes reales
      ...messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isCurrentUser={Number(message.sender.id) === Number(currentUserId)}
          isTemporary={false}
        />
      )),
      // Mensajes temporales
      ...tempMessages.map((message) => (
        <MessageItem
          key={`temp-${message.id}`}
          message={message}
          isCurrentUser={Number(message.sender.id) === Number(currentUserId)}
          isTemporary={true}
        />
      )),
    ],
    [messages, tempMessages, currentUserId]
  );

  // Información del usuario remoto memoizada
  const otherUserInfo = useMemo(() => {
    if (!chatInfo) return null;

    return chatInfo.user1.id === currentUserId
      ? chatInfo.user2
      : chatInfo.user1;
  }, [chatInfo, currentUserId]);

  return (
    <div
      className={`chat-window ${theme === "dark" ? "dark" : ""}`}
      ref={chatWindowRef}
      style={{
        transform: "translateZ(0)", // Forzar aceleración por hardware
        backfaceVisibility: "hidden", // Evitar parpadeos
        perspective: 1000, // Optimizar 3D rendering
      }}
    >
      {loading && (
        <div className="chat-loading">
          <div className="spinner" />
          <p>Cargando chat...</p>
        </div>
      )}

      {error && (
        <div className="chat-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      )}

      {!loading && !error && chatInfo && otherUserInfo && (
        <>
          {/* Header del chat */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                {otherUserInfo.firstName.charAt(0) +
                  otherUserInfo.lastName.charAt(0)}
              </div>
              <div>
                <div className="chat-user-name">
                  {`${otherUserInfo.firstName} ${otherUserInfo.lastName}`}
                </div>
                <div className="chat-product-name">
                  {chatInfo.product?.productName || "Producto"}
                </div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="chat-header-btn" type="button">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="chat-messages">
            {messages.length === 0 && tempMessages.length === 0 ? (
              <div className="chat-empty">
                <svg
                  className="chat-empty-icon"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>No hay mensajes aún</p>
                <p>Escribe el primer mensaje para comenzar la conversación</p>
              </div>
            ) : (
              <>
                {messagesList}
                {isSendingMessage && (
                  <div className="message-sending-indicator">
                    <div className="sending-animation">Enviando...</div>
                  </div>
                )}
                {otherUserTyping && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input del chat */}
          <div className="chat-input-container">
            <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
              <textarea
                className="chat-input"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={1}
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                disabled={isSendingMessage}
              />
              <button
                className="chat-send-btn"
                type="submit"
                disabled={!newMessage.trim() || isSendingMessage}
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
});

ChatWindow.displayName = "ChatWindow";

export default ChatWindow;
