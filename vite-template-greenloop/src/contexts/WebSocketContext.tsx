import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { connectWebSocket, disconnectWebSocket } from "@/utils/websocket";
import { useToken } from "./TokenContext";

interface WebSocketContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useToken();

  const connect = () => {
    if (token && !isConnected) {
      connectWebSocket(token, () => {
        setIsConnected(true);
        console.log("WebSocket connected successfully");
      });
    }
  };

  const disconnect = () => {
    disconnectWebSocket();
    setIsConnected(false);
    console.log("WebSocket disconnected");
  };

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token]);

  const value: WebSocketContextType = {
    isConnected,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
