// Utilidad para extraer información del token JWT
export const tokenUtils = {
  // Obtener el user ID del token actual
  getCurrentUserId: (): number | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    try {
      // Decodificar el payload del JWT
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      // Diferentes formas en que puede estar el user ID en el token
      return (
        payload.userId || payload.sub || payload.id || payload.user_id || null
      );
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  // Verificar si el token es válido (no expirado)
  isTokenValid: (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Obtener toda la información del token
  getTokenPayload: (): any | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return null;
    }
  },
};
