// API functions for Community features
import {
  CommunityResponseDto,
  MembershipRequestResponseDto,
  UserDto,
} from "@/types/interfaces.tsx";

const API_URL = "http://localhost:8081";

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

// GET PAGINATED COMMUNITIES
export async function getPaginatedCommunities(
  page: number = 0,
  size: number = 10,
  sortBy: string = "createdAt"
): Promise<{
  content: CommunityResponseDto[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}> {
  const response = await fetch(
    `${API_URL}/api/communities/paginated?page=${page}&size=${size}&sortBy=${sortBy}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching paginated communities: ${response.status}`);
  }
  const data = await response.json();

  return data;
}
