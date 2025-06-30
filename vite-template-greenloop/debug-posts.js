// Script temporal para depurar el problema de posts en MyProfile
console.log("🚀 Iniciando debug de posts...");

// Función para hacer una petición a la API
async function debugPosts() {
  const API_BASE_URL = "http://localhost:8080";

  // Obtener el token del localStorage
  const token = localStorage.getItem("token");
  console.log("🔑 Token encontrado:", token ? "Sí" : "No");

  if (!token) {
    console.error("❌ No hay token de autenticación");
    return;
  }

  try {
    // Probar endpoint de posts del usuario
    console.log("📡 Probando /api/posts/user...");
    const response = await fetch(`${API_BASE_URL}/api/posts/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Status:", response.status);

    if (response.ok) {
      const posts = await response.json();
      console.log("✅ Posts obtenidos:", posts.length);
      console.log("📝 Posts:", posts);
    } else {
      console.error(
        "❌ Error en la respuesta:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.error("❌ Error details:", errorText);
    }

    // También probar el endpoint de todos los posts
    console.log("📡 Probando /api/posts...");
    const allPostsResponse = await fetch(`${API_BASE_URL}/api/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (allPostsResponse.ok) {
      const allPosts = await allPostsResponse.json();
      console.log("✅ Todos los posts:", allPosts.length);
      console.log("📝 Todos los posts:", allPosts);
    }
  } catch (error) {
    console.error("❌ Error en la petición:", error);
  }
}

// Ejecutar el debug cuando se cargue la página
if (typeof window !== "undefined") {
  // Agregar al objeto global para poder ejecutarlo desde la consola
  window.debugPosts = debugPosts;
  console.log("💡 Ejecuta window.debugPosts() en la consola para depurar");
}
