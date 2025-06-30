import axios from "axios";

// Create an axios instance
export const apiClient = axios.create({
  baseURL: "http://localhost:8081",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = "Error de conexión. Verifica tu conexión a internet.";
      return Promise.reject(error);
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      error.message =
        "La solicitud tardó demasiado tiempo. Inténtalo de nuevo.";
      return Promise.reject(error);
    }

    // Handle HTTP status codes
    const { status, data } = error.response;
    switch (status) {
      case 401:
        localStorage.removeItem("token");
        window.location.href = "/auth";
        error.message = "Sesión expirada. Por favor inicia sesión nuevamente.";
        break;
      case 403:
        error.message =
          data?.message || "No tienes permisos para realizar esta acción.";
        break;
      case 404:
        error.message =
          data?.message || "El recurso solicitado no fue encontrado.";
        break;
      case 422:
        error.message = data?.message || "Los datos enviados no son válidos.";
        break;
      case 500:
        error.message =
          data?.message || "Error interno del servidor. Inténtalo más tarde.";
        break;
      default:
        error.message = data?.message || `Error ${status}: ${error.message}`;
    }

    return Promise.reject(error);
  }
);
