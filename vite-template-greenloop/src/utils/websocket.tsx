import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;
const BASE_URL = "http://localhost:8081";

export const connectWebSocket = (token: string, onConnect: () => void) => {
  if (stompClient) return;

  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${BASE_URL}/ws`, null, {
        transports: ["websocket", "xhr-streaming", "xhr-polling"],
        timeout: 5000,
      }),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = () => {
    console.log("Connected to WebSocket");
    stompClient = client;
    onConnect();
  };

  client.onStompError = (frame) => {
    console.error("STOMP error", frame);
  };

  client.onWebSocketError = (event) => {
    console.error("WebSocket error", event);
  };

  client.activate();

  return client;
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

export const subscribeToChat = (
  chatId: number,
  callback: (message: any) => void,
) => {
  if (!stompClient) return null;

  return stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
    callback(JSON.parse(message.body));
  });
};

export const subscribeToNotifications = (
  userId: number,
  callback: (notification: any) => void,
) => {
  if (!stompClient) return null;

  return stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
    callback(JSON.parse(message.body));
  });
};

export const sendChatMessage = (chatId: number, message: any) => {
  if (!stompClient) return;

  stompClient.publish({
    destination: `/app/chat.sendMessage/${chatId}`,
    body: JSON.stringify(message),
  });
};

export const sendTypingStatus = (
  chatId: number,
  status: { userId: number; typing: boolean },
) => {
  if (!stompClient) return;

  stompClient.publish({
    destination: `/app/chat.typing/${chatId}`,
    body: JSON.stringify(status),
  });
};
