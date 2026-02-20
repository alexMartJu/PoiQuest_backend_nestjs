import {
  OverviewStats,
  CategoryEventCount,
  MonthlyUserCount,
} from '../../domain/repositories/analytics.repository';
import { OverviewResponse } from '../dto/responses/overview.response.dto';
import {
  EventsByCategoryResponse,
  CategoryEventCountItem,
} from '../dto/responses/events-by-category.response.dto';
import {
  UsersByMonthResponse,
  MonthlyUserCountItem,
} from '../dto/responses/users-by-month.response.dto';

export class AnalyticsMapper {
  static toOverviewResponse(stats: OverviewStats): OverviewResponse {
    return {
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      recentUsers: stats.recentUsers,
      totalEvents: stats.totalEvents,
      activeEvents: stats.activeEvents,
      totalPois: stats.totalPois,
    };
  }

  static toEventsByCategoryResponse(data: CategoryEventCount[]): EventsByCategoryResponse {
    const items: CategoryEventCountItem[] = data.map((item) => ({
      categoryUuid: item.categoryUuid,
      categoryName: item.categoryName,
      eventCount: item.eventCount,
    }));

    return { data: items };
  }

  static toUsersByMonthResponse(data: MonthlyUserCount[]): UsersByMonthResponse {
    const items: MonthlyUserCountItem[] = data.map((item) => ({
      year: item.year,
      month: item.month,
      userCount: item.userCount,
    }));

    return { data: items };
  }
}
