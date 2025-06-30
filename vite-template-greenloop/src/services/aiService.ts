// AI API service for GreenLoop AI endpoints
const API_URL = "http://localhost:8081/api/ai";

export interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export interface AIResponse {
  response: string;
  status: string;
  model: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
}

export interface ContextualChatRequest {
  message: string;
  context: string;
}

export interface RecommendationsRequest {
  preferences: string;
}

// Basic chat endpoint
export async function sendChatMessage(message: string): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Error sending chat message: ${response.status}`);
  }

  return await response.json();
}

// Contextual chat endpoint
export async function sendContextualMessage(
  message: string,
  context: string,
): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/chat/contextual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    throw new Error(`Error sending contextual message: ${response.status}`);
  }

  return await response.json();
}

// Product recommendations endpoint
export async function getProductRecommendations(
  preferences: string,
): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/recommendations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ preferences }),
  });

  if (!response.ok) {
    throw new Error(`Error getting recommendations: ${response.status}`);
  }

  return await response.json();
}

// General sustainability tips
export async function getSustainabilityTips(): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/sustainability`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error getting sustainability tips: ${response.status}`);
  }

  return await response.json();
}

// Category-specific sustainability tips
export async function getCategorySustainabilityTips(
  category: string,
): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/sustainability/${category}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error getting category tips: ${response.status}`);
  }

  return await response.json();
}

// Health check
export async function checkAIHealth(): Promise<any> {
  const response = await fetch(`${API_URL}/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error checking AI health: ${response.status}`);
  }

  return await response.json();
}
