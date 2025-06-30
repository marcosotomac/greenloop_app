import type {
  Exchange,
  ExchangeRequest,
  ExchangeStatistics,
} from "../types/exchange";

import { apiClient } from "../config/apiClient";

import { productService, type ProductResponseDto } from "./productService";

class ExchangeService {
  private readonly baseUrl = "/api/exchanges";

  async requestExchange(exchangeRequest: ExchangeRequest): Promise<Exchange> {
    const response = await apiClient.post<Exchange>(
      this.baseUrl,
      exchangeRequest
    );

    return response.data;
  }

  async acceptExchange(exchangeId: number): Promise<Exchange> {
    const response = await apiClient.put<Exchange>(
      `${this.baseUrl}/${exchangeId}/accept`
    );

    return response.data;
  }

  async rejectExchange(exchangeId: number): Promise<Exchange> {
    const response = await apiClient.put<Exchange>(
      `${this.baseUrl}/${exchangeId}/reject`
    );

    return response.data;
  }

  async completeExchange(exchangeId: number): Promise<Exchange> {
    const response = await apiClient.put<Exchange>(
      `${this.baseUrl}/${exchangeId}/complete`
    );

    return response.data;
  }

  async cancelExchange(exchangeId: number): Promise<Exchange> {
    const response = await apiClient.put<Exchange>(
      `${this.baseUrl}/${exchangeId}/cancel`
    );

    return response.data;
  }

  async getRequestedExchanges(): Promise<Exchange[]> {
    const response = await apiClient.get<Exchange[]>(
      `${this.baseUrl}/requested`
    );

    return response.data;
  }

  async getProvidedExchanges(): Promise<Exchange[]> {
    const response = await apiClient.get<Exchange[]>(
      `${this.baseUrl}/provided`
    );

    return response.data;
  }

  async getAvailableProducts(
    category?: string,
    search?: string
  ): Promise<ProductResponseDto[]> {
    // Usar el productService para obtener solo productos activos disponibles para intercambio
    const products = await productService.getProductsAvailableForExchange();

    let filteredProducts = products;

    // Aplicar filtros si se proporcionan
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();

      filteredProducts = filteredProducts.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.ownerName.toLowerCase().includes(searchLower)
      );
    }

    return filteredProducts;
  }

  async getMyProductsForExchange(): Promise<ProductResponseDto[]> {
    return await productService.getUserProductsAvailableForExchange();
  }

  async getExchangeStatistics(): Promise<ExchangeStatistics> {
    const response = await apiClient.get<ExchangeStatistics>(
      `${this.baseUrl}/statistics`
    );

    return response.data;
  }

  // Método para verificar si un producto puede ser intercambiado
  canProductBeExchanged(product: ProductResponseDto): boolean {
    return productService.canBeExchanged(product);
  }
}

export const exchangeService = new ExchangeService();
