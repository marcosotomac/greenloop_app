import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyChats } from "../../services/chatService";
import {
  getCurrentUserIdFromToken,
  getCurrentUserFromToken,
} from "../../utils/authUtils";
import { useTheme } from "../../contexts/ThemeContext";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Product {
  productId: number;
  productName: string;
}

interface Chat {
  id: number;
  user1: User;
  user2: User;
  product: Product;
  createdAt: string;
}

interface ChatListProps {
  onChatSelect: (chatId: number) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const fetchedChats = await getMyChats();

        setChats(fetchedChats);
        setError(null);
      } catch {
        setError("Failed to load chats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Intentar obtener el ID del usuario de diferentes fuentes
  let currentUserId: string | number | null = null;

  // 1. Primero intentar desde localStorage (método anterior)
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");

  if (userFromStorage.id) {
    currentUserId = userFromStorage.id;
  }

  // 2. Si no hay usuario en localStorage, intentar desde el token JWT
  if (!currentUserId) {
    currentUserId = getCurrentUserIdFromToken();
  }

  // 3. Si aún no tenemos el ID, intentar obtener toda la información del token
  if (!currentUserId) {
    const userFromToken = getCurrentUserFromToken();

    currentUserId =
      userFromToken?.sub || userFromToken?.userId || userFromToken?.id;
  }

  if (loading) {
    return (
      <div className={`chat-list ${theme === "dark" ? "dark" : ""}`}>
        <h2>Mis chats</h2>
        <div className="loading-chats">Cargando chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`chat-list ${theme === "dark" ? "dark" : ""}`}>
        <h2>Mis chats</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className={`chat-list ${theme === "dark" ? "dark" : ""}`}>
        <h2>Mis chats</h2>
        <div className="no-chats">
          No tienes chats aún. ¡Empieza a chatear con otros usuarios!
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-list ${theme === "dark" ? "dark" : ""}`}>
      <h2>Mis chats</h2>
      <div className="chat-items">
        {chats.map((chat) => {
          // El currentUserId del token es el email, así que comparamos por email
          const currentUserEmail = currentUserId; // Es el email del token JWT

          // Determinar cuál es el "otro usuario" basado en el email
          let otherUser: User;

          if (chat.user1.email === currentUserEmail) {
            otherUser = chat.user2;
          } else if (chat.user2.email === currentUserEmail) {
            otherUser = chat.user1;
          } else {
            // Fallback: si no coincide ningún email, usar el primer usuario
            otherUser = chat.user1;
          }

          const lastMessageDate = new Date(chat.createdAt);
          const isToday =
            lastMessageDate.toDateString() === new Date().toDateString();

          return (
            <Link
              key={chat.id}
              className="chat-item"
              to={`/chat/${chat.id}`}
              onClick={() => onChatSelect(chat.id)}
            >
              <div className="chat-item-info">
                <h3>
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                <p>Producto: {chat.product.productName}</p>
                <p className="chat-date">
                  {isToday
                    ? lastMessageDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : lastMessageDate.toLocaleDateString()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
