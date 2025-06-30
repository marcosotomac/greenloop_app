//api requests
import { UserProfileResponse, CurrentUserDto } from "@/types/interfaces.tsx";
import { Product } from "@/types/interfaces.tsx";
import { ProductResponse } from "@/types/interfaces.tsx";
import { Post } from "@/types/interfaces.tsx";
import { PostResponse } from "@/types/interfaces.tsx";
import {
  CommunityRequestDto,
  CommunityResponseDto,
  MembershipRequestDto,
  MembershipRequestResponseDto,
  MembershipRequestActionDto,
  NotificationDto,
  UserDto,
} from "@/types/interfaces.tsx";

export const API_URL = "http://localhost:8081";

// GET CURRENT USER
export async function getCurrentUser(): Promise<CurrentUserDto> {
  const response = await fetch(`${API_URL}/user/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el usuario actual");
  }

  return response.json();
}

//CREATE PRODUCT
export async function createProduct(product: Product): Promise<Product> {
  const response = await fetch(`${API_URL}/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error creating product:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      sentData: product,
    });
    throw new Error(
      `Error creating product: ${response.status} - ${errorText}`
    );
  }
  const data: Product = await response.json();

  console.log(data);

  return data;
}

export async function getAllProducts(): Promise<ProductResponse[]> {
  const response = await fetch(`${API_URL}/product`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching products: ${response.status}`);
  }

  const data: ProductResponse[] = await response.json();

  return data;
}

// UPDATE PRODUCT EXCHANGE STATUS
export async function updateProductExchangeStatus(
  productId: number,
  availableForExchange: boolean,
  exchangePreferences?: string,
  estimatedValue?: number
): Promise<ProductResponse> {
  const response = await fetch(
    `${API_URL}/product/${productId}/exchange-status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        availableForExchange,
        exchangePreferences,
        estimatedValue,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error updating product exchange status: ${response.status}`
    );
  }

  const data: ProductResponse = await response.json();
  return data;
}

// ENABLE ALL PRODUCTS FOR EXCHANGE
export async function enableAllProductsForExchange(): Promise<
  ProductResponse[]
> {
  const response = await fetch(`${API_URL}/product/enable-all-exchanges`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error enabling all products for exchange: ${response.status}`
    );
  }

  const data: ProductResponse[] = await response.json();
  return data;
}

//CREATE POST
export async function createPost(post: Post): Promise<Post> {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error(`Error creating post: ${response.status}`);
  }
  const data: Post = await response.json();

  console.log(data);

  return data;
}

export async function getRecentPosts(): Promise<PostResponse[]> {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching recent posts: ${response.status}`);
  }

  const data: PostResponse[] = await response.json();

  return data;
}

// LIKE POST
export async function likePost(postId: number): Promise<PostResponse> {
  const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error liking post: ${response.status}`);
  }

  const data: PostResponse = await response.json();

  return data;
}

// UNLIKE POST
export async function unlikePost(postId: number): Promise<PostResponse> {
  const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error unliking post: ${response.status}`);
  }

  const data: PostResponse = await response.json();

  return data;
}

// TOGGLE LIKE POST
export async function toggleLikePost(postId: number): Promise<PostResponse> {
  const response = await fetch(`${API_URL}/api/posts/${postId}/toggle-like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error toggling like on post: ${response.status}`);
  }

  const data: PostResponse = await response.json();

  return data;
}

//CREATE COMMUNITY
export async function createCommunity(
  community: CommunityRequestDto
): Promise<CommunityResponseDto> {
  const response = await fetch(`${API_URL}/api/communities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(community),
  });

  if (!response.ok) {
    throw new Error(`Error creating community: ${response.status}`);
  }
  const data: CommunityResponseDto = await response.json();

  console.log(data);

  return data;
}

// GET ALL COMMUNITIES
export async function getAllCommunities(): Promise<CommunityResponseDto[]> {
  const response = await fetch(`${API_URL}/api/communities`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching communities: ${response.status}`);
  }
  const data: CommunityResponseDto[] = await response.json();

  return data;
}

// GET COMMUNITIES BY TYPE
export async function getCommunitiesByType(
  type: "PUBLIC" | "PRIVATE"
): Promise<CommunityResponseDto[]> {
  const response = await fetch(
    `${API_URL}/api/communities/${type.toLowerCase()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching ${type} communities: ${response.status}`);
  }

  const data: CommunityResponseDto[] = await response.json();

  return data;
}

// JOIN COMMUNITY (for public communities)
export async function joinCommunity(communityId: number): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/communities/${communityId}/join`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error joining community: ${response.status}`);
  }
}

// LEAVE COMMUNITY
export async function leaveCommunity(communityId: number): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/communities/${communityId}/leave`,
    {
      method: "POST", // Cambiado de DELETE a POST para coincidir con el backend
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Error leaving community: ${response.status} - ${errorText}`
    );
  }
}

// ====== MEMBERSHIP REQUESTS ======

// REQUEST MEMBERSHIP (for private communities)
export async function requestMembership(
  communityId: number,
  requestData: MembershipRequestDto
): Promise<MembershipRequestResponseDto> {
  const response = await fetch(
    `${API_URL}/api/communities/${communityId}/request-membership`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(requestData),
    }
  );

  if (!response.ok) {
    throw new Error(`Error requesting membership: ${response.status}`);
  }

  const data: MembershipRequestResponseDto = await response.json();

  return data;
}

// GET PENDING MEMBERSHIP REQUESTS (for community creators)
export async function getPendingMembershipRequests(): Promise<
  MembershipRequestResponseDto[]
> {
  const response = await fetch(
    `${API_URL}/api/communities/membership-requests/pending`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching pending requests: ${response.status}`);
  }
  const data: MembershipRequestResponseDto[] = await response.json();

  return data;
}

// RESPOND TO MEMBERSHIP REQUEST
export async function respondToMembershipRequest(
  requestId: number,
  actionData: MembershipRequestActionDto
): Promise<MembershipRequestResponseDto> {
  console.log("API: Enviando solicitud de membresía:", {
    requestId,
    actionData,
    url: `${API_URL}/api/communities/membership-requests/${requestId}/respond`,
    token: localStorage.getItem("token") ? "Token presente" : "Sin token",
  });

  const response = await fetch(
    `${API_URL}/api/communities/membership-requests/${requestId}/respond`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(actionData),
    }
  );

  console.log("API: Respuesta del servidor:", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  if (!response.ok) {
    let errorMessage = `Error responding to membership request: ${response.status}`;

    try {
      const errorData = await response.text();
      console.error("API: Error details:", errorData);
      errorMessage += ` - ${errorData}`;
    } catch (e) {
      console.error("API: No se pudo leer la respuesta de error");
    }

    throw new Error(errorMessage);
  }

  const data: MembershipRequestResponseDto = await response.json();
  console.log("API: Datos recibidos:", data);

  return data;
}

// ====== NOTIFICATIONS ======

// GET USER NOTIFICATIONS
export async function getUserNotifications(): Promise<NotificationDto[]> {
  const response = await fetch(`${API_URL}/api/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching notifications: ${response.status}`);
  }
  const data: NotificationDto[] = await response.json();

  return data;
}

// MARK NOTIFICATION AS READ
export async function markNotificationAsRead(
  notificationId: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error marking notification as read: ${response.status}`);
  }
}

// HANDLE MEMBERSHIP REQUEST FROM NOTIFICATION
export async function handleMembershipRequestFromNotification(
  requestId: number,
  action: "approve" | "reject"
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/notifications/membership-request/${requestId}/${action}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error handling membership request: ${response.status}`);
  }
}

//GET USER BY PROFILE ID
export async function getUserProfileById({
  userId,
}: {
  userId: number;
}): Promise<UserProfileResponse> {
  const response = await fetch(`${API_URL}/user/${userId}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching user profile: ${response.status}`);
  }
  const data: UserProfileResponse = await response.json();

  console.log(data);

  return data;
}

// GET COMMUNITY BY ID
export async function getCommunityById(
  communityId: number
): Promise<CommunityResponseDto> {
  const response = await fetch(`${API_URL}/api/communities/${communityId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching community: ${response.status}`);
  }
  const data: CommunityResponseDto = await response.json();

  return data;
}

// GET USER COMMUNITIES
export async function getUserCommunities(): Promise<CommunityResponseDto[]> {
  const response = await fetch(`${API_URL}/api/communities/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching user communities: ${response.status}`);
  }
  const data: CommunityResponseDto[] = await response.json();

  return data;
}

// SEARCH COMMUNITIES
export async function searchCommunities(params: {
  name?: string;
  location?: string;
  minMembers?: number;
  maxMembers?: number;
}): Promise<CommunityResponseDto[]> {
  const searchParams = new URLSearchParams();

  if (params.name) searchParams.append("name", params.name);
  if (params.location) searchParams.append("location", params.location);
  if (params.minMembers !== undefined)
    searchParams.append("minMembers", params.minMembers.toString());
  if (params.maxMembers !== undefined)
    searchParams.append("maxMembers", params.maxMembers.toString());

  const response = await fetch(
    `${API_URL}/api/communities/search?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error searching communities: ${response.status}`);
  }
  const data: CommunityResponseDto[] = await response.json();

  return data;
}

// GET POPULAR COMMUNITIES
export async function getPopularCommunities(
  limit: number = 10
): Promise<CommunityResponseDto[]> {
  const response = await fetch(
    `${API_URL}/api/communities/popular?limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching popular communities: ${response.status}`);
  }
  const data: CommunityResponseDto[] = await response.json();

  return data;
}

// GET RECENT COMMUNITIES
export async function getRecentCommunities(
  limit: number = 10
): Promise<CommunityResponseDto[]> {
  const response = await fetch(
    `${API_URL}/api/communities/recent?limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching recent communities: ${response.status}`);
  }
  const data: CommunityResponseDto[] = await response.json();

  return data;
}

// GET COMMUNITY MEMBERS
export async function getCommunityMembers(
  communityId: number
): Promise<UserDto[]> {
  const response = await fetch(
    `${API_URL}/api/communities/${communityId}/members`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching community members: ${response.status}`);
  }
  const data: UserDto[] = await response.json();

  return data;
}

// CHECK MEMBERSHIP
export async function checkMembership(communityId: number): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/api/communities/${communityId}/membership/check`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error checking membership: ${response.status}`);
  }
  const data: boolean = await response.json();

  return data;
}

// UPDATE COMMUNITY
export async function updateCommunity(
  communityId: number,
  updateData: { description?: string; location?: string }
): Promise<CommunityResponseDto> {
  const response = await fetch(`${API_URL}/api/communities/${communityId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`Error updating community: ${response.status}`);
  }
  const data: CommunityResponseDto = await response.json();

  return data;
}

// DELETE COMMUNITY
export async function deleteCommunity(communityId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/communities/${communityId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error deleting community: ${response.status}`);
  }
}

// GET COMMUNITY STATS
export async function getCommunityStats(communityId: number): Promise<{
  totalMembers: number;
  createdAt: string;
  creatorName: string;
  location: string;
  activeMembers: number;
}> {
  const response = await fetch(
    `${API_URL}/api/communities/${communityId}/stats`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching community stats: ${response.status}`);
  }
  const data = await response.json();

  return data;
}

// GET MY MEMBERSHIP REQUESTS
export async function getMyMembershipRequests(): Promise<
  MembershipRequestResponseDto[]
> {
  const response = await fetch(
    `${API_URL}/api/communities/membership-requests/my-requests`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error fetching my membership requests: ${response.status}`
    );
  }
  const data: MembershipRequestResponseDto[] = await response.json();

  return data;
}

// GET COMMUNITY MEMBERSHIP REQUESTS (for community creators)
export async function getCommunityMembershipRequests(
  communityId: number
): Promise<MembershipRequestResponseDto[]> {
  const response = await fetch(
    `${API_URL}/api/communities/${communityId}/membership-requests`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error fetching community membership requests: ${response.status}`
    );
  }
  const data: MembershipRequestResponseDto[] = await response.json();

  return data;
}

// COUNT PENDING MEMBERSHIP REQUESTS
export async function countPendingMembershipRequests(): Promise<number> {
  const response = await fetch(
    `${API_URL}/api/communities/membership-requests/count`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error counting pending requests: ${response.status}`);
  }
  const data: { pendingRequests: number } = await response.json();

  return data.pendingRequests;
}

// GET PRODUCT BY ID
export async function getProductById(
  productId: number
): Promise<ProductResponse> {
  const response = await fetch(`${API_URL}/product/${productId}/details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el producto");
  }

  return response.json();
}
