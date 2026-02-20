import { Injectable } from '@nestjs/common';
import {
  AnalyticsRepository,
  OverviewStats,
  CategoryEventCount,
  MonthlyUserCount,
} from '../../domain/repositories/analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

  async getOverviewStats(recentDays: number = 7): Promise<OverviewStats> {
    return this.analyticsRepo.getOverviewStats(recentDays);
  }

  async getEventsByCategory(): Promise<CategoryEventCount[]> {
    return this.analyticsRepo.getEventsByCategory();
  }

  async getUsersByMonth(): Promise<MonthlyUserCount[]> {
    return this.analyticsRepo.getUsersByMonth();
  }
}
