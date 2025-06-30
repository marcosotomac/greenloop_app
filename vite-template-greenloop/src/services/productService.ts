import type { Product } from "../types/exchange";

import { apiClient } from "../config/apiClient";

export interface ProductResponseDto {
  productId: number;
  ownerName: string;
  productName: string;
  description: string;
  imageUrl: string;
  category: string;
  condition: string;
  availableForExchange: boolean;
  exchangePreferences?: string;
  estimatedValue: number;
  createdAt: string;
  status: ProductStatus;
  userId: number;
  userFirstName?: string;
  userLastName?: string;
  isInUserWishList?: boolean;
}

export type ProductStatus = "ACTIVE" | "EXCHANGED" | "DONATED" | "INACTIVE";

class ProductService {
  private readonly baseUrl = "/product";

  async getAllProducts(): Promise<ProductResponseDto[]> {
    const response = await apiClient.get<ProductResponseDto[]>(this.baseUrl);

    return response.data;
  }

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`${this.baseUrl}/${id}`);

    return response.data;
  }

  async getProductByIdAsDto(id: number): Promise<ProductResponseDto> {
    const response = await apiClient.get<ProductResponseDto>(
      `${this.baseUrl}/${id}/details`
    );

    return response.data;
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    const response = await apiClient.post<Product>(this.baseUrl, product);

    return response.data;
  }

  async updateProduct(product: Product): Promise<Product> {
    const response = await apiClient.put<Product>(this.baseUrl, product);

    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async searchProducts(name: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      `${this.baseUrl}/search?name=${encodeURIComponent(name)}`
    );

    return response.data;
  }

  // Métodos para intercambio
  async getProductsAvailableForExchange(): Promise<ProductResponseDto[]> {
    const response = await apiClient.get<ProductResponseDto[]>(
      `${this.baseUrl}/exchange/available`
    );

    return response.data;
  }

  async getUserProductsAvailableForExchange(): Promise<ProductResponseDto[]> {
    const response = await apiClient.get<ProductResponseDto[]>(
      `${this.baseUrl}/exchange/user`
    );

    return response.data;
  }

  async updateProductExchangeStatus(
    id: number,
    exchangeData: {
      availableForExchange: boolean;
      exchangePreferences?: string;
      estimatedValue?: number;
    }
  ): Promise<Product> {
    const response = await apiClient.put<Product>(
      `${this.baseUrl}/${id}/exchange-status`,
      exchangeData
    );

    return response.data;
  }

  async enableAllExchanges(): Promise<ProductResponseDto[]> {
    const response = await apiClient.put<ProductResponseDto[]>(
      `${this.baseUrl}/enable-all-exchanges`
    );

    return response.data;
  }

  async findExchangeMatches(id: number): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      `${this.baseUrl}/${id}/exchange-matches`
    );

    return response.data;
  }

  // Nuevos métodos para filtrar por estado
  async getProductsByStatus(
    status: ProductStatus
  ): Promise<ProductResponseDto[]> {
    const response = await apiClient.get<ProductResponseDto[]>(
      `${this.baseUrl}/status/${status}`
    );

    return response.data;
  }

  async getUserExchangedProducts(): Promise<ProductResponseDto[]> {
    const response = await apiClient.get<ProductResponseDto[]>(
      `${this.baseUrl}/user/exchanged`
    );

    return response.data;
  }

  async getUserActiveProducts(): Promise<ProductResponseDto[]> {
    const response = await apiClient.get<ProductResponseDto[]>(
      `${this.baseUrl}/user/active`
    );

    return response.data;
  }

  // Método para verificar si un producto puede ser intercambiado
  canBeExchanged(product: ProductResponseDto): boolean {
    return product.availableForExchange && product.status === "ACTIVE";
  }
}

export const productService = new ProductService();
