import { apiClient } from "../config/apiClient";

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalExchanges: number;
  totalDonations: number;
  totalCommunities: number;
  wasteAvoided: number;
  growthPercentage: number;
  activeUsers: number;
}

export interface MonthlyActivity {
  month: string;
  value: number;
  displayMonth: string;
}

export interface CategoryStats {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  type: string;
  userInitial: string;
  userName: string;
  action: string;
  itemName: string;
  createdAt: string;
  timeAgo: string;
}

export interface WasteImpact {
  wasteAvoided: number;
  itemsCirculated: number;
  co2Saved: number;
  waterSaved: number;
  treesEquivalent: number;
}

export interface GrowthTrends {
  userGrowth: number;
  exchangeGrowth: number;
  donationGrowth: number;
  overallGrowth: number;
}

export const dashboardAPI = {
  async getGlobalStats(): Promise<DashboardStats> {
    const response = await apiClient.get("/api/dashboard/stats");
    return response.data;
  },

  async getMonthlyActivity(months = 7): Promise<MonthlyActivity[]> {
    const response = await apiClient.get("/api/dashboard/activity/monthly", {
      params: { months },
    });
    return response.data;
  },

  async getCategoryStats(): Promise<CategoryStats[]> {
    const response = await apiClient.get("/api/dashboard/categories");
    return response.data;
  },

  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get("/api/dashboard/activity/recent", {
      params: { limit },
    });
    return response.data;
  },

  async getWasteImpact(): Promise<WasteImpact> {
    const response = await apiClient.get("/api/dashboard/waste-impact");
    return response.data;
  },

  async getGrowthTrends(): Promise<GrowthTrends> {
    const response = await apiClient.get("/api/dashboard/trends");
    return response.data;
  },
};
