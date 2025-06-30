export interface Exchange {
  exchangeId: number;
  requesterId: number;
  requesterName: string;
  providerId: number;
  providerName: string;
  requestedProductId: number;
  requestedProductName: string;
  requestedProductImage: string;
  offeredProductId: number;
  offeredProductName: string;
  offeredProductImage: string;
  requestedAt: string;
  completedAt?: string;
  status: ExchangeStatus;
}

export type ExchangeStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface ExchangeRequest {
  requestedProductId: number;
  offeredProductId: number;
}

export interface ExchangeStatistics {
  totalExchanges: number;
  pendingExchanges: number;
  acceptedExchanges: number;
  completedExchanges: number;
  rejectedExchanges: number;
  cancelledExchanges: number;
  totalRequestedExchanges: number;
  totalProvidedExchanges: number;
  pointsEarnedFromExchanges: number;
  averageProductValue: number;
}

export interface Product {
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
  status: string;
  userId: number;
}
