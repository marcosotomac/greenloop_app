import axios from "axios";

const API_URL = "http://localhost:8081/api";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const startChat = async (otherUserId: number, productId: number) => {
  try {
    console.log("Sending startChat request:", { otherUserId, productId });

    const response = await axios.post(
      `${API_URL}/chats/start?otherUserId=${otherUserId}&productId=${productId}`,
      {},
      getAuthHeader()
    );

    console.log("startChat response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error starting chat:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);

    if (error.response?.status === 401) {
      throw new Error("No estás autorizado para realizar esta acción");
    } else if (error.response?.status === 404) {
      throw new Error("Usuario o producto no encontrado");
    } else if (error.response?.status === 400) {
      throw new Error("Datos inválidos para crear el chat");
    } else {
      throw new Error("Error al iniciar el chat. Inténtalo de nuevo.");
    }
  }
};

export const getMyChats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/chats/my-chats`,
      getAuthHeader()
    );

    return response.data;
  } catch {
    throw new Error("Error al obtener los chats");
  }
};

export const getChatMessages = async (chatId: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/chats/${chatId}/messages`,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error("Error getting chat messages:", error);
    throw new Error("Error al obtener los mensajes del chat");
  }
};

export const getChatsByProduct = async (productId: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/chats/product/${productId}`,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error("Error getting chats by product:", error);
    throw new Error("Error al obtener los chats del producto");
  }
};

export const sendMessage = async (chatId: number, content: string) => {
  try {
    if (!content.trim()) {
      throw new Error("El mensaje no puede estar vacío");
    }

    const response = await axios.post(
      `${API_URL}/chats/${chatId}/messages`,
      { content: content.trim() },
      getAuthHeader()
    );

    // Validar que la respuesta tenga la estructura esperada
    if (!response.data || !response.data.id) {
      throw new Error("Respuesta inválida del servidor");
    }

    return response.data;
  } catch (error: any) {
    console.error("Error sending message:", error);

    if (error.response?.status === 401) {
      throw new Error(
        "No estás autorizado. Por favor, inicia sesión nuevamente."
      );
    } else if (error.response?.status === 404) {
      throw new Error("Chat no encontrado");
    } else if (error.response?.status === 400) {
      throw new Error("Mensaje inválido");
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Error al enviar el mensaje");
    }
  }
};

export const getChatInfo = async (chatId: number) => {
  try {
    const response = await axios.get(`${API_URL}/chats/debug/info/${chatId}`);

    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener información del chat");
  }
};
