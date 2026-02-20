export interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  recentUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalPois: number;
}

export interface CategoryEventCount {
  categoryUuid: string;
  categoryName: string;
  eventCount: number;
}

export interface MonthlyUserCount {
  year: number;
  month: number;
  userCount: number;
}

export abstract class AnalyticsRepository {
  abstract getOverviewStats(recentDays: number): Promise<OverviewStats>;
  abstract getEventsByCategory(): Promise<CategoryEventCount[]>;
  abstract getUsersByMonth(): Promise<MonthlyUserCount[]>;
}
