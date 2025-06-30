import { API_URL } from "../api/api";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  level?: string;
  points?: number;
  role: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  description?: string;
  joinedAt: string;
  points: number;
  level: string;
  itemsDonated: number;
  itemsExchanged: number;
  role: string;
  communities: Array<{
    id: number;
    name: string;
  }>;
  wishLists: Array<{
    id: number;
    name: string;
    productCount: number;
    isPublic: boolean;
  }>;
  totalProductsCount: number;
  totalPostsCount: number;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  address?: string;
  description?: string;
}

class UserService {
  private getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/user/me`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener el usuario actual");
    }

    return response.json();
  }

  async getUserProfile(userId: number): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/user/${userId}/profile`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener el perfil del usuario");
    }

    return response.json();
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/user/me/profile`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.text();

      throw new Error(errorData || "Error al actualizar el perfil");
    }

    return response.json();
  }

  async getUserCommunities(userId: number) {
    const response = await fetch(`${API_URL}/user/${userId}/communities`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener las comunidades del usuario");
    }

    return response.json();
  }
}

export default new UserService();
