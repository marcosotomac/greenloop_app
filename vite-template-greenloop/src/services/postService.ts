import axios from "axios";
import { tokenUtils } from "@/utils/tokenUtils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PostRequestDto {
  title: string;
  content: string;
  imageUrl?: string;
  wanted: "DONATION" | "EXCHANGE";
  location: string;
}

export interface PostResponseDto {
  postId: number;
  username: string;
  title: string;
  content: string;
  imageUrl?: string;
  wanted: "DONATION" | "EXCHANGE";
  location: string;
  publishedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  likesCount: number;
  hasLiked: boolean;
}

export const postService = {
  // Obtener posts del usuario autenticado
  getUserPosts: async (): Promise<PostResponseDto[]> => {
    // Como no hay endpoint /api/posts/user, necesitamos obtener el userId del contexto
    // y filtrar desde todos los posts
    const response = await api.get("/api/posts");
    const allPosts = response.data;

    // Obtener user ID del token
    const currentUserId = tokenUtils.getCurrentUserId();

    if (!currentUserId) {
      throw new Error("No se pudo obtener el ID del usuario del token");
    }

    // Filtrar posts del usuario actual
    return allPosts.filter(
      (post: PostResponseDto) => post.user.id === currentUserId
    );
  },

  // Obtener posts por ID de usuario
  getPostsByUserId: async (userId: number): Promise<PostResponseDto[]> => {
    const response = await api.get(`/api/posts/user/${userId}`);

    return response.data;
  },

  // Crear post
  createPost: async (postData: PostRequestDto): Promise<PostResponseDto> => {
    const response = await api.post("/api/posts", postData);

    return response.data;
  },

  // Actualizar post
  updatePost: async (
    postId: number,
    postData: PostRequestDto
  ): Promise<PostResponseDto> => {
    const response = await api.put(`/api/posts/${postId}`, postData);

    return response.data;
  },

  // Eliminar post
  deletePost: async (postId: number): Promise<void> => {
    await api.delete(`/api/posts/${postId}`);
  },

  // Obtener todos los posts recientes
  getAllPosts: async (): Promise<PostResponseDto[]> => {
    const response = await api.get("/api/posts");

    return response.data;
  },

  // Obtener post por ID
  getPostById: async (postId: number): Promise<PostResponseDto> => {
    const response = await api.get(`/api/posts/${postId}`);

    return response.data;
  },

  // Buscar posts por palabra clave
  searchPosts: async (keyword: string): Promise<PostResponseDto[]> => {
    const response = await api.get(`/api/posts/search?keyword=${keyword}`);

    return response.data;
  },

  // Filtrar posts por tipo
  getPostsByType: async (
    type: "DONATION" | "EXCHANGE"
  ): Promise<PostResponseDto[]> => {
    const response = await api.get(`/api/posts/wanted/${type}`);

    return response.data;
  },

  // Dar like a un post
  likePost: async (postId: number): Promise<PostResponseDto> => {
    const response = await api.post(`/api/posts/${postId}/like`);

    return response.data;
  },

  // Quitar like de un post
  unlikePost: async (postId: number): Promise<PostResponseDto> => {
    const response = await api.delete(`/api/posts/${postId}/like`);

    return response.data;
  },

  // Alternar like
  toggleLike: async (postId: number): Promise<PostResponseDto> => {
    const response = await api.post(`/api/posts/${postId}/toggle-like`);

    return response.data;
  },

  // Obtener número de likes
  getLikesCount: async (postId: number): Promise<number> => {
    const response = await api.get(`/api/posts/${postId}/likes/count`);

    return response.data;
  },

  // Verificar si el usuario dio like
  hasUserLiked: async (postId: number): Promise<boolean> => {
    const response = await api.get(`/api/posts/${postId}/likes/status`);

    return response.data;
  },
};
