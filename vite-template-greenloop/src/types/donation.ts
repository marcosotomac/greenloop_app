export interface DonationRequestDto {
  productId: number;
  description?: string;
  donationLocation?: string;
  donorNote?: string;
}

export interface DonationUpdateDto {
  status?: DonationStatus;
  receiverNote?: string;
  donationLocation?: string;
}

export interface DonationResponseDto {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  donorId: number;
  donorName: string;
  receiverId?: number;
  receiverName?: string;
  productId: number;
  productName: string;
  donationDate: string;
  receivedDate?: string;
  status: DonationStatus;
  donationLocation?: string;
  receiverNote?: string;
  donorNote?: string;
  pointsAwarded?: number;
}

export interface DonationSummaryDto {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  donorName: string;
  productName: string;
  donationDate: string;
  status: DonationStatus;
  donationLocation?: string;
  pointsAwarded?: number;
}

export enum DonationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface CreateDonationRequest {
  productId: number;
  description?: string;
  donationLocation?: string;
  donorNote?: string;
}

export interface DonationStatistics {
  totalDonationsGiven: number;
  totalDonationsReceived: number;
  totalPointsEarned: number;
  activeDonations: number;
  completedDonations: number;
  pendingRequests: number;
}
