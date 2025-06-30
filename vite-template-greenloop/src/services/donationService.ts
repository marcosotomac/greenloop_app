import {
  DonationResponseDto,
  DonationSummaryDto,
  DonationUpdateDto,
  CreateDonationRequest,
  DonationStatistics,
} from "../types/donation";
import { apiClient } from "../config/apiClient";

class DonationService {
  private readonly baseUrl = "/api/donations";

  /**
   * Crear una nueva donación
   */
  async createDonation(
    request: CreateDonationRequest
  ): Promise<DonationResponseDto> {
    const response = await apiClient.post<DonationResponseDto>(
      this.baseUrl,
      request
    );

    return response.data;
  }

  /**
   * Obtener todas las donaciones disponibles (estado PENDING)
   */
  async getAllAvailableDonations(): Promise<DonationSummaryDto[]> {
    const response = await apiClient.get<DonationSummaryDto[]>(this.baseUrl);

    return response.data;
  }

  /**
   * Obtener las donaciones del usuario actual
   */
  async getUserDonations(): Promise<DonationSummaryDto[]> {
    const response = await apiClient.get<DonationSummaryDto[]>(
      `${this.baseUrl}/user`
    );

    return response.data;
  }

  /**
   * Obtener una donación por ID
   */
  async getDonationById(id: number): Promise<DonationResponseDto> {
    const response = await apiClient.get<DonationResponseDto>(
      `${this.baseUrl}/${id}`
    );

    return response.data;
  }

  /**
   * Solicitar una donación
   */
  async requestDonation(donationId: number): Promise<DonationResponseDto> {
    const response = await apiClient.post<DonationResponseDto>(
      `${this.baseUrl}/${donationId}/request`
    );

    return response.data;
  }

  /**
   * Actualizar el estado de una donación
   */
  async updateDonationStatus(
    donationId: number,
    updateData: DonationUpdateDto
  ): Promise<DonationResponseDto> {
    const response = await apiClient.put<DonationResponseDto>(
      `${this.baseUrl}/${donationId}`,
      updateData
    );

    return response.data;
  }

  /**
   * Obtener estadísticas de donaciones del usuario
   */
  async getDonationStatistics(): Promise<DonationStatistics> {
    const response = await apiClient.get<DonationStatistics>(
      `${this.baseUrl}/statistics`
    );

    return response.data;
  }
}

export const donationService = new DonationService();
