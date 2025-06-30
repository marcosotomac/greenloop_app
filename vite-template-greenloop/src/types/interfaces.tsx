//api entities or dtos

export interface CommunityDto {
  id: number;
  name: string;
  type?: "PUBLIC" | "PRIVATE";
}

export interface WishListSummaryDto {
  name: string;
  productCount: number;
  isPublic: boolean;
}

export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  description?: string;
  joinedAt: string; // ISO date
  points: number;
  level: string;
  itemsDonated: number;
  itemsExchanged: number;
  role: "USER" | "ADMIN";
  communities: CommunityDto[];
  wishLists: WishListSummaryDto[];
  totalProductsCount: number;
  totalPostsCount: number;
}

export interface Product {
  productName: string;
  description: string;
  imageUrl: string;
  category:
    | "CLOTHING"
    | "ACCESSORIES"
    | "ELECTRONICS"
    | "BOOKS"
    | "FURNITURE"
    | "TOYS"
    | "HOME"
    | "SPORTS"
    | "INSTRUMENTS";
  condition: "NEW" | "LIKE_NEW" | "USED" | "REFURBISHED" | "OPEN_BOX";
  availableForExchange: boolean;
  exchangePreferences: string;
  estimatedValue: number;
}

export interface Post {
  title: string;
  content: string;
  imageUrl: string;
  wanted: "DONATION" | "EXCHANGE";
  location: string;
}

export interface PostResponse {
  postId: number;
  username: string;
  title: string;
  content: string;
  imageUrl: string;
  wanted: "DONATION" | "EXCHANGE";
  location: string;
  publishedAt: string; // ISO date
  likesCount: number;
  likedByCurrentUser: boolean;
}

export interface ProductResponse {
  productId: number;
  ownerName: string;
  productName: string;
  description: string;
  imageUrl: string;

  category:
    | "CLOTHING"
    | "ACCESSORIES"
    | "ELECTRONICS"
    | "BOOKS"
    | "FURNITURE"
    | "TOYS"
    | "HOME"
    | "SPORTS"
    | "INSTRUMENTS";
  condition: "NEW" | "LIKE_NEW" | "USED" | "REFURBISHED" | "OPEN_BOX";
  availableForExchange: boolean;
  exchangePreferences: string;
  estimatedValue: number;
  createdAt: string; // ISO date
  status: "ACTIVE" | "EXCHANGED" | "DONATED" | "INACTIVE";
  userId: number;
  belongsToCurrentUser?: boolean;
  inWishList?: boolean;
}

export interface CommunityRequestDto {
  name: string;
  description?: string;
  type?: "PUBLIC" | "PRIVATE";
}

export interface CommunityResponseDto {
  id: number;
  name: string;
  description: string;
  location?: string;
  type: "PUBLIC" | "PRIVATE";
  creator: UserDto;
  members: UserDto[];
  createdAt: string;
  memberCount: number;
}

export interface UserDto {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface MembershipRequestDto {
  communityId: number;
  message?: string;
}

export interface MembershipRequestResponseDto {
  id: number;
  communityId: number;
  communityName: string;
  userId: number;
  username: string;
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  respondedAt?: string;
  responseMessage?: string;
}

export interface MembershipRequestActionDto {
  approved: boolean;
  responseMessage?: string;
}

export interface NotificationDto {
  id: number;
  type: "COMMUNITY_REQUEST" | "SYSTEM" | "OTHER";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  referenceId?: number;
  actionUrl?: string;
}

export interface CurrentUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  level?: string;
  points?: number;
  role?: string;
}
