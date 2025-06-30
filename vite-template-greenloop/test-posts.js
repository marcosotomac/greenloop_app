// Quick test to verify post fetching functionality
// Run this in browser console while logged in

const testPostService = async () => {
  console.log("🧪 Testing Post Service...");

  // Test 1: Check if token exists
  const token = localStorage.getItem("token");
  console.log("Token exists:", !!token);

  if (!token) {
    console.log("❌ No token found - please log in first");
    return;
  }

  // Test 2: Try to decode token
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
    console.log("Token payload:", payload);

    const userId =
      payload.userId || payload.sub || payload.id || payload.user_id;
    console.log("Extracted user ID:", userId);
  } catch (error) {
    console.error("Error decoding token:", error);
  }

  // Test 3: Fetch all posts
  try {
    const response = await fetch("http://localhost:8080/api/posts", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const posts = await response.json();
      console.log("✅ All posts fetched:", posts.length, "posts");
      console.log("Sample post structure:", posts[0]);
    } else {
      console.log("❌ Failed to fetch posts:", response.status);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Auto-run the test
testPostService();
