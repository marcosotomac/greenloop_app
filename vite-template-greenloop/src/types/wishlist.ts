// Wishlist types for frontend

export enum Category {
  ELECTRONICS = "ELECTRONICS",
  CLOTHING = "CLOTHING",
  HOME_GARDEN = "HOME_GARDEN",
  SPORTS_OUTDOOR = "SPORTS_OUTDOOR",
  BOOKS_MEDIA = "BOOKS_MEDIA",
  HEALTH_BEAUTY = "HEALTH_BEAUTY",
  TOYS_GAMES = "TOYS_GAMES",
  AUTOMOTIVE = "AUTOMOTIVE",
  JEWELRY_ACCESSORIES = "JEWELRY_ACCESSORIES",
  FOOD_BEVERAGE = "FOOD_BEVERAGE",
  OTHER = "OTHER",
}

export interface ProductSummaryDto {
  id: number;
  name: string;
  imageUrl?: string;
  category: Category;
  estimatedValue?: number;
  price?: number;
}

export interface WishListSummaryDto {
  id: number;
  name: string;
  description?: string;
  productCount: number;
  isPublic: boolean;
  desiredCategories: Category[];
  createdAt: string;
}

export interface WishListResponseDto {
  id: number;
  name: string;
  description?: string;
  desiredCategories: Category[];
  products: ProductSummaryDto[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  productCount: number;
}

export interface WishListRequestDto {
  name: string;
  description?: string;
  desiredCategories: Category[];
  isPublic: boolean;
}

export interface AddToWishListRequestDto {
  productId: number;
  wishListId: number;
}

// Helper functions
export const getCategoryDisplayName = (category: Category): string => {
  const categoryNames: Record<Category, string> = {
    [Category.ELECTRONICS]: "Electrónicos",
    [Category.CLOTHING]: "Ropa y Accesorios",
    [Category.HOME_GARDEN]: "Hogar y Jardín",
    [Category.SPORTS_OUTDOOR]: "Deportes y Aire Libre",
    [Category.BOOKS_MEDIA]: "Libros y Medios",
    [Category.HEALTH_BEAUTY]: "Salud y Belleza",
    [Category.TOYS_GAMES]: "Juguetes y Juegos",
    [Category.AUTOMOTIVE]: "Automotriz",
    [Category.JEWELRY_ACCESSORIES]: "Joyería y Accesorios",
    [Category.FOOD_BEVERAGE]: "Comida y Bebidas",
    [Category.OTHER]: "Otros",
  };

  return categoryNames[category] || category;
};

export const getAllCategories = (): Category[] => {
  return Object.values(Category);
};
