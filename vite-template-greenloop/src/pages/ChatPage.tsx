import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import ChatErrorBoundary from "../components/chat/ChatErrorBoundary";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/chat.css";

const ChatPage: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChatSelect = (chatId: number) => {
    if (isMobileView) {
      // Hide chat list on mobile when a chat is selected
      setIsMobileView(false);
    }
    navigate(`/chat/${chatId}`);
  };

  return (
    <div
      className={`chat-page ${theme === "dark" ? "dark" : ""}`}
      data-theme={theme}
    >
      <div className={`chat-sidebar ${isMobileView ? "mobile" : ""}`}>
        {(!isMobileView || window.location.pathname === "/chat") && (
          <ChatList onChatSelect={handleChatSelect} />
        )}
      </div>

      <div className="chat-content">
        <ChatErrorBoundary>
          <Routes>
            <Route
              element={
                <div className="select-chat-prompt">
                  Select a chat to start messaging
                </div>
              }
              path="/"
            />
            <Route element={<ChatWindow />} path="/:chatId" />
          </Routes>
        </ChatErrorBoundary>
      </div>
    </div>
  );
};

export default ChatPage;
