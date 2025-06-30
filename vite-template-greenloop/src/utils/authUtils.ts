// Función utilitaria para decodificar JWT sin dependencias externas
export const decodeJWT = (token: string) => {
  try {
    // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Función para obtener el ID del usuario actual desde el token
export const getCurrentUserIdFromToken = (): number | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeJWT(token);
  if (!payload) return null;

  // El ID del usuario puede estar en diferentes campos dependiendo de cómo esté configurado el JWT
  // Vamos a intentar varios campos comunes
  return payload.sub || payload.userId || payload.id || null;
};

// Función para obtener todos los datos del usuario desde el token
export const getCurrentUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeJWT(token);
  return payload;
};
