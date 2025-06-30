// Search Types
export interface SearchResult {
  id: number;
  title: string;
  description?: string;
  type: "product" | "post" | "community" | "user";
  imageUrl?: string;
  category?: string;
  createdAt?: string;
  ownerName?: string;
  url: string;
}

export interface SearchResponse {
  products: SearchResult[];
  posts: SearchResult[];
  communities: SearchResult[];
  users: SearchResult[];
  total: number;
}

export interface SearchFilters {
  type?: "all" | "product" | "post" | "community" | "user";
  category?: string;
  sortBy?: "relevance" | "recent" | "alphabetical";
}
