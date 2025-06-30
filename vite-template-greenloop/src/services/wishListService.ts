import {
  WishListSummaryDto,
  WishListResponseDto,
  WishListRequestDto,
  AddToWishListRequestDto,
  ProductSummaryDto,
} from "../types/wishlist";
import { apiClient } from "../config/apiClient";

class WishListService {
  private readonly baseUrl = "/api/wishlists";

  /**
   * Crear una nueva lista de deseos
   */
  async createWishList(
    request: WishListRequestDto
  ): Promise<WishListResponseDto> {
    const response = await apiClient.post<WishListResponseDto>(
      this.baseUrl,
      request
    );

    return response.data;
  }

  /**
   * Obtener todas las listas de deseos del usuario
   */
  async getUserWishLists(): Promise<WishListSummaryDto[]> {
    const response = await apiClient.get<WishListSummaryDto[]>(this.baseUrl);

    return response.data;
  }

  /**
   * Obtener una lista de deseos por ID
   */
  async getWishList(id: number): Promise<WishListResponseDto> {
    const response = await apiClient.get<WishListResponseDto>(
      `${this.baseUrl}/${id}`
    );

    return response.data;
  }

  /**
   * Actualizar una lista de deseos
   */
  async updateWishList(
    id: number,
    request: WishListRequestDto
  ): Promise<WishListResponseDto> {
    const response = await apiClient.put<WishListResponseDto>(
      `${this.baseUrl}/${id}`,
      request
    );

    return response.data;
  }

  /**
   * Eliminar una lista de deseos
   */
  async deleteWishList(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Agregar producto a lista de deseos
   */
  async addToWishList(
    request: AddToWishListRequestDto
  ): Promise<WishListResponseDto> {
    const response = await apiClient.post<WishListResponseDto>(
      `${this.baseUrl}/add-product`,
      request
    );

    return response.data;
  }

  /**
   * Remover producto de lista de deseos
   */
  async removeFromWishList(
    wishListId: number,
    productId: number
  ): Promise<WishListResponseDto> {
    const response = await apiClient.delete<WishListResponseDto>(
      `${this.baseUrl}/${wishListId}/products/${productId}`
    );

    return response.data;
  }

  /**
   * Obtener productos que coinciden con las categorías deseadas
   */
  async getMatchingProducts(wishListId: number): Promise<ProductSummaryDto[]> {
    const response = await apiClient.get<ProductSummaryDto[]>(
      `${this.baseUrl}/${wishListId}/matching-products`
    );

    return response.data;
  }
}

export const wishListService = new WishListService();
