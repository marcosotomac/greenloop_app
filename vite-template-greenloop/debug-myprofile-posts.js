// Script de depuración para MyProfile - Posts
// Ejecutar en la consola del navegador mientras estás logueado

const debugMyProfilePosts = async () => {
  console.log("🧪 DEBUG: MyProfile Posts");
  console.log("========================");

  // 1. Verificar token
  const token = localStorage.getItem("token");
  console.log("1. Token exists:", !!token);

  if (!token) {
    console.log("❌ No token found - please login first");
    return;
  }

  // 2. Decodificar token para obtener user ID
  let userId = null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    console.log("2. Token payload:", payload);

    userId = payload.userId || payload.sub || payload.id || payload.user_id;
    console.log("3. Extracted user ID:", userId);
  } catch (error) {
    console.error("❌ Error decoding token:", error);
    return;
  }

  if (!userId) {
    console.log("❌ Could not extract user ID from token");
    return;
  }

  // 3. Probar endpoint directo: /api/posts/user/{userId}
  try {
    console.log("4. Testing direct endpoint: /api/posts/user/" + userId);
    const directResponse = await fetch(
      `http://localhost:8080/api/posts/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Direct endpoint status:", directResponse.status);

    if (directResponse.ok) {
      const directPosts = await directResponse.json();
      console.log(
        "✅ Direct endpoint success - Posts found:",
        directPosts.length
      );
      console.log("Direct posts data:", directPosts);
    } else {
      const errorText = await directResponse.text();
      console.log(
        "❌ Direct endpoint failed:",
        directResponse.status,
        errorText
      );
    }
  } catch (error) {
    console.error("❌ Direct endpoint error:", error);
  }

  // 4. Probar endpoint general: /api/posts
  try {
    console.log("5. Testing general endpoint: /api/posts");
    const generalResponse = await fetch("http://localhost:8080/api/posts", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("General endpoint status:", generalResponse.status);

    if (generalResponse.ok) {
      const allPosts = await generalResponse.json();
      console.log(
        "✅ General endpoint success - Total posts:",
        allPosts.length
      );

      // Filtrar posts del usuario actual
      const userPosts = allPosts.filter((post) => {
        const match = post.user && post.user.id === userId;
        if (match) {
          console.log("Found user post:", post.postId, post.title);
        }
        return match;
      });

      console.log("User posts filtered:", userPosts.length);
      console.log("User posts data:", userPosts);
    } else {
      const errorText = await generalResponse.text();
      console.log(
        "❌ General endpoint failed:",
        generalResponse.status,
        errorText
      );
    }
  } catch (error) {
    console.error("❌ General endpoint error:", error);
  }

  console.log("========================");
  console.log("🧪 DEBUG COMPLETE");
};

// Ejecutar automáticamente
debugMyProfilePosts();
